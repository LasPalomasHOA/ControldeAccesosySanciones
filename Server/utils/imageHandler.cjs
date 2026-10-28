const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://iocpmwzyvkangytybcwh.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvY3Btd3p5dmthbmd5dHliY3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzE1NzIsImV4cCI6MjEwMzk0NzU3Mn0.uT4roJ_izoNZmwGqEg6HrlZqEtB5hZ0Drd3qVwC3xXA';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn('[imageHandler] Advertencia al inicializar cliente Supabase:', err.message);
  }
}

const LOCAL_UPLOADS = path.join(__dirname, '../uploads');
const PUBLIC_UPLOADS = path.join(process.cwd(), 'public/uploads');
const TMP_UPLOADS = path.join('/tmp', 'uploads');

const UPLOADS_DIR = fs.existsSync(LOCAL_UPLOADS)
  ? LOCAL_UPLOADS
  : (fs.existsSync(PUBLIC_UPLOADS) ? PUBLIC_UPLOADS : TMP_UPLOADS);

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Aviso: no se pudo crear el directorio de uploads:', e.message);
}

/**
 * Determina el bucket adecuado de Supabase Storage en función del prefijo de entidad
 */
function getBucketForPrefix(prefix) {
  const p = String(prefix || '').toLowerCase();
  if (
    p.includes('seguro') ||
    p.includes('dc3') ||
    p.includes('doc') ||
    p.includes('documento') ||
    p.includes('comprobante') ||
    p.includes('pdf') ||
    p.includes('contrato')
  ) {
    return 'documentos';
  }
  if (p.includes('vehiculo') || p.includes('auto') || p.includes('car')) return 'vehiculos';
  if (
    p.includes('trabajador') ||
    p.includes('usuario') ||
    p.includes('guardia') ||
    p.includes('perfil') ||
    p.includes('user') ||
    p.includes('avatar')
  ) {
    return 'usuarios';
  }
  return 'evidencias';
}

/**
 * Normaliza la referencia de imagen o documento a una URL ligera (remota o ruta estática /uploads/...).
 * NUNCA convierte archivos en disco a Base64 para evitar inflar los payloads JSON.
 */
function resolveFotoToDataUrl(fotoUrl) {
  if (!fotoUrl) return null;
  const str = String(fotoUrl).trim();

  // Si ya es URL remota http/https o Data URL existente, devolver tal cual
  if (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('data:image') ||
    str.startsWith('data:application/pdf')
  ) {
    return str;
  }

  if (str.startsWith('/uploads/')) return str;
  if (str.startsWith('uploads/')) return '/' + str;
  if (!str.startsWith('/')) return '/uploads/' + path.basename(str);
  return str;
}

/**
 * Comprime un Buffer de imagen a WebP optimizado (800px max, calidad 65%)
 */
async function comprimirBuffer(buffer, maxWidth = 800, quality = 65) {
  try {
    return await /** @type {any} */ (sharp)(buffer)
      .resize({
        width: maxWidth,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();
  } catch (err) {
    console.warn('[imageHandler] Error en compresión sharp, usando buffer original:', err.message);
    return buffer;
  }
}

/**
 * Optimiza y comprime una imagen en Base64 a WebP (<40 KB)
 */
async function optimizeBase64Image(base64Str, maxWidth = 800, quality = 65) {
  if (!base64Str || typeof base64Str !== 'string') return base64Str;
  
  // Si ya es URL remota http/https o PDF, no tocar
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://') || base64Str.startsWith('data:application/pdf')) {
    return base64Str;
  }

  let buffer;
  const match = base64Str.match(/^data:([A-Za-z0-9\-+/.]+);base64,(.+)$/);
  if (match) {
    buffer = Buffer.from(match[2], 'base64');
  } else if (base64Str.length > 500 && !base64Str.startsWith('/')) {
    try {
      buffer = Buffer.from(base64Str, 'base64');
    } catch {
      return base64Str;
    }
  } else {
    return base64Str;
  }

  try {
    const compressedBuffer = await comprimirBuffer(buffer, maxWidth, quality);
    return 'data:image/webp;base64,' + compressedBuffer.toString('base64');
  } catch {
    return base64Str;
  }
}

/**
 * Helper unificado para subir cualquier archivo (PDF, WebP, PNG, etc.) a Supabase Storage.
 * Si el bucket solicitado tiene restricciones RLS o error, intenta automáticamente en los buckets de respaldo disponibles (ej. 'usuarios' o 'evidencias').
 */
async function uploadBufferToSupabase(buffer, targetBucket, filePath, contentType) {
  if (!supabase || !buffer) return null;

  // 1. Intentar en el bucket destino primario
  try {
    const { error: primaryErr } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: true,
      });

    if (!primaryErr) {
      const { data } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
      if (data && data.publicUrl) return data.publicUrl;
    } else {
      console.warn(`[imageHandler] Bucket primario '${targetBucket}' no disponible (${primaryErr.message}). Usando almacenamiento en bucket de respaldo...`);
    }
  } catch (err) {
    console.warn(`[imageHandler] Excepción en bucket '${targetBucket}':`, err.message);
  }

  // 2. Fallbacks a buckets disponibles ('usuarios' o 'evidencias')
  const fallbackBuckets = ['usuarios', 'evidencias', 'vehiculos'].filter(b => b !== targetBucket);
  for (const fb of fallbackBuckets) {
    try {
      const fallbackPath = `${targetBucket}/${filePath}`;
      const { error: fbErr } = await supabase.storage
        .from(fb)
        .upload(fallbackPath, buffer, {
          contentType,
          cacheControl: '31536000',
          upsert: true,
        });

      if (!fbErr) {
        const { data } = supabase.storage.from(fb).getPublicUrl(fallbackPath);
        if (data && data.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch (fbException) {
      // Intentar con siguiente bucket
    }
  }

  return null;
}

/**
 * Procesa y sube archivos (Imágenes o Documentos PDF) directamente a Supabase Storage.
 * Si Supabase falla, guarda el binario en el disco local (/uploads/...) y retorna la URL relativa,
 * evitando por completo guardar cadenas Base64 en la base de datos.
 */
async function saveBase64Image(dataString, prefix = 'img', options = {}) {
  if (!dataString) return null;
  const str = String(dataString).trim();

  // 1. Si ya es una URL remota o ruta estática local, devolver tal cual
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/uploads/')) {
    return str;
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const isPdf = str.startsWith('data:application/pdf') || str.includes('application/pdf') || options.isPdf;

  // 2. Manejo de Documentos PDF
  if (isPdf) {
    const b64 = str.replace(/^data:[^;]+;base64,/, '');
    let buffer = null;
    try {
      buffer = Buffer.from(b64, 'base64');
    } catch (e) {
      console.warn('[imageHandler] Error decodificando PDF Base64:', e.message);
      return null;
    }

    const fileName = `${prefix}_${timestamp}_${randomSuffix}.pdf`;

    if (supabase && buffer) {
      const bucket = options.bucket || getBucketForPrefix(prefix);
      const publicUrl = await uploadBufferToSupabase(buffer, bucket, fileName, 'application/pdf');
      if (publicUrl) return publicUrl;
    }

    // Fallback en disco local (nunca Base64 en BD)
    try {
      const localPath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(localPath, buffer);
      return `/uploads/${fileName}`;
    } catch (err) {
      console.error('[imageHandler] Error guardando PDF en disco local:', err.message);
      return null;
    }
  }

  // 3. Manejo de Imágenes (JPG, PNG, WebP)
  let buffer = null;
  const match = str.match(/^data:([A-Za-z0-9\-+/.]+);base64,(.+)$/);
  if (match) {
    buffer = Buffer.from(match[2], 'base64');
  } else if (str.length > 500 && !str.startsWith('/')) {
    try {
      buffer = Buffer.from(str, 'base64');
    } catch {}
  }

  if (!buffer) {
    return resolveFotoToDataUrl(str);
  }

  // 4. Comprimir a WebP (máx 800px, calidad 65%)
  const maxWidth = options.maxWidth || 800;
  const quality = options.quality || 65;
  const compressedBuffer = await comprimirBuffer(buffer, maxWidth, quality);
  const fileName = `${prefix}_${timestamp}_${randomSuffix}.webp`;

  // 5. Subir a Supabase Storage
  if (supabase) {
    const bucket = options.bucket || getBucketForPrefix(prefix);
    const publicUrl = await uploadBufferToSupabase(compressedBuffer, bucket, fileName, 'image/webp');
    if (publicUrl) return publicUrl;
  }

  // 6. Fallback en disco local (evita guardar Base64 en PostgreSQL)
  try {
    const localPath = path.join(UPLOADS_DIR, fileName);
    fs.writeFileSync(localPath, compressedBuffer);
    return `/uploads/${fileName}`;
  } catch (err) {
    console.error('[imageHandler] Error guardando WebP en disco local:', err.message);
    return null;
  }
}

module.exports = {
  saveBase64Image,
  optimizeBase64Image,
  resolveFotoToDataUrl,
  comprimirBuffer,
  getBucketForPrefix,
  UPLOADS_DIR,
};

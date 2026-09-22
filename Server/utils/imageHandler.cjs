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
  if (p.includes('vehiculo') || p.includes('auto') || p.includes('car')) return 'vehiculos';
  if (p.includes('trabajador') || p.includes('usuario') || p.includes('guardia') || p.includes('perfil') || p.includes('user') || p.includes('avatar')) return 'usuarios';
  return 'evidencias';
}

/**
 * Convierte cualquier referencia a archivo local (/uploads/...) a Data URL (base64)
 * o preserva URLs remotas http/https directamente sin conversiones pesadas.
 */
function resolveFotoToDataUrl(fotoUrl) {
  if (!fotoUrl) return null;
  const str = String(fotoUrl).trim();
  
  // Si ya es URL remota http/https o Data URL Base64, devolver directamente
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image')) {
    return str;
  }

  const filename = path.basename(str);
  const possiblePaths = [
    path.join(__dirname, '../uploads', filename),
    path.join(process.cwd(), 'Server', 'uploads', filename),
    path.join(process.cwd(), 'public', 'uploads', filename),
    path.join('/tmp', 'uploads', filename)
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const ext = path.extname(p).toLowerCase().replace('.', '') || 'jpeg';
        const mime = ext === 'jpg' ? 'image/jpeg' : 'image/' + ext;
        const base64Data = fs.readFileSync(p).toString('base64');
        return 'data:' + mime + ';base64,' + base64Data;
      } catch (e) {
        console.warn('Error leyendo imagen local para Base64:', e.message);
      }
    }
  }

  if (str.startsWith('uploads/')) return '/' + str;
  if (!str.startsWith('/') && !str.startsWith('http')) return '/uploads/' + str;
  return str;
}

/**
 * Comprime un Buffer de imagen a WebP optimizado (800px max, calidad 65%)
 */
async function comprimirBuffer(buffer, maxWidth = 800, quality = 65) {
  try {
    return await sharp(buffer)
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
  
  // Si ya es URL remota http/https, no tocar
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
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
 * Comprime la imagen a WebP y la sube directamente a Supabase Storage.
 * Retorna la URL pública permanente (ej. https://.../vehiculos/vehiculo_123.webp)
 * para almacenar en la base de datos con consumo mínimo de almacenamiento y 0 Egress repetido.
 */
async function saveBase64Image(dataString, prefix = 'img', options = {}) {
  if (!dataString) return null;
  const str = String(dataString).trim();

  // 1. Si ya es una URL remota de Supabase o CDN, devolver tal cual
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }

  // 2. Extraer el Buffer de la imagen
  let buffer = null;
  const match = str.match(/^data:([A-Za-z0-9\-+/.]+);base64,(.+)$/);
  if (match) {
    buffer = Buffer.from(match[2], 'base64');
  } else if (str.length > 500 && !str.startsWith('/')) {
    try {
      buffer = Buffer.from(str, 'base64');
    } catch { }
  } else if (str.startsWith('/') || str.startsWith('uploads/')) {
    // Es ruta local a archivo
    const resolved = resolveFotoToDataUrl(str);
    if (resolved && resolved.startsWith('data:image')) {
      const b64 = resolved.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(b64, 'base64');
    }
  }

  if (!buffer) {
    return str;
  }

  // 3. Comprimir a WebP a máximo 800px de ancho y calidad 65%
  const maxWidth = options.maxWidth || 800;
  const quality = options.quality || 65;
  const compressedBuffer = await comprimirBuffer(buffer, maxWidth, quality);

  // 4. Subir a Supabase Storage si el cliente está disponible
  if (supabase) {
    const bucket = options.bucket || getBucketForPrefix(prefix);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const fileName = prefix + '_' + timestamp + '_' + randomSuffix + '.webp';
    const storagePath = fileName;

    try {
      let { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, compressedBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });

      // Si el bucket primario no existe, intentar con bucket fallback 'evidencias'
      if (uploadError && bucket !== 'evidencias') {
        const fallbackRes = await supabase.storage
          .from('evidencias')
          .upload(bucket + '/' + storagePath, compressedBuffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: true,
          });
        if (!fallbackRes.error) {
          const { data: fbUrl } = supabase.storage
            .from('evidencias')
            .getPublicUrl(bucket + '/' + storagePath);
          if (fbUrl && fbUrl.publicUrl) return fbUrl.publicUrl;
        }
      }

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
        if (urlData && urlData.publicUrl) {
          return urlData.publicUrl;
        }
      } else {
        console.warn('[imageHandler] Error subiendo imagen a bucket ' + bucket + ':', uploadError.message);
      }
    } catch (storageErr) {
      console.warn('[imageHandler] Excepción al interactuar con Supabase Storage:', storageErr.message);
    }
  }

  // 5. Fallback seguro: Retornar string Base64 WebP optimizado
  return 'data:image/webp;base64,' + compressedBuffer.toString('base64');
}

module.exports = {
  saveBase64Image,
  optimizeBase64Image,
  resolveFotoToDataUrl,
  comprimirBuffer,
  getBucketForPrefix,
  UPLOADS_DIR,
};

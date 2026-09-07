const fs = require('fs');
const path = require('path');

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
 * Convierte cualquier referencia a archivo local (/uploads/...) a Data URL (base64)
 * para que viaje directamente dentro del JSON y la base de datos sin depender de archivos físicos en el servidor.
 */
function resolveFotoToDataUrl(fotoUrl) {
  if (!fotoUrl) return null;
  const str = String(fotoUrl).trim();
  
  // Si ya es Base64 o URL remota http/https, devolver directamente
  if (str.startsWith('data:image') || str.startsWith('http://') || str.startsWith('https://')) {
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
        const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        const base64Data = fs.readFileSync(p).toString('base64');
        return `data:${mime};base64,${base64Data}`;
      } catch (e) {
        console.warn('Error leyendo imagen local para Base64:', e.message);
      }
    }
  }

  // Si no se encontró el archivo físico en el servidor pero tiene prefijo, devolver como ruta absoluta
  if (str.startsWith('uploads/')) return `/${str}`;
  if (!str.startsWith('/') && !str.startsWith('http')) return `/uploads/${str}`;
  return str;
}

/**
 * Optimiza y comprime una imagen en Base64 a WebP (<40 KB) para que la base de datos
 * no se infle ni consuma Egress desmedido.
 */
async function optimizeBase64Image(base64Str, maxWidth = 600, quality = 70) {
  if (!base64Str || typeof base64Str !== 'string') return base64Str;
  const match = base64Str.match(/^data:([A-Za-z0-9\-+/]+);base64,(.+)$/);
  let buffer;
  if (match) {
    buffer = Buffer.from(match[2], 'base64');
  } else if (base64Str.length > 500 && !base64Str.startsWith('http') && !base64Str.startsWith('/')) {
    try {
      buffer = Buffer.from(base64Str, 'base64');
    } catch {
      return base64Str;
    }
  } else {
    return base64Str; // Es URL remota http/https o ruta relativa
  }

  // Si ya es muy ligera (<= 40 KB), no es necesario recompilar
  if (buffer.length <= 40 * 1024) {
    return base64Str;
  }

  try {
    const sharp = require('sharp');
    const compressedBuffer = await sharp(buffer)
      .resize({ width: maxWidth, height: maxWidth, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    return `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
  } catch (err) {
    // Si sharp no está disponible o falla, retornar original sin romper la petición
    return base64Str;
  }
}

/**
 * Guarda o preserva la imagen en Base64 para almacenarla directamente en la BD (PostgreSQL / Supabase).
 */
async function saveBase64Image(dataString, prefix = 'img') {
  if (!dataString) return null;
  return await optimizeBase64Image(dataString);
}

module.exports = { saveBase64Image, optimizeBase64Image, resolveFotoToDataUrl, UPLOADS_DIR };


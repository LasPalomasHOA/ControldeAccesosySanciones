const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../uploads');

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Aviso: no se pudo crear el directorio de uploads local:', e.message);
}

/**
 * Guarda una cadena base64 como archivo en disco y retorna la URL relativa.
 * Si ya es una URL normal, la deja intacta.
 * En entornos serverless si falla la escritura, preserva la data base64.
 */
function saveBase64Image(dataString, prefix = 'img') {
  if (!dataString) return null;
  if (!dataString.startsWith('data:image')) {
    return dataString.length > 500 ? dataString.substring(0, 500) : dataString;
  }

  try {
    const matches = dataString.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataString;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return `/uploads/${filename}`;
  } catch (error) {
    console.warn('Aviso al guardar imagen en disco (usando fallback base64):', error.message);
    return dataString;
  }
}

module.exports = { saveBase64Image, UPLOADS_DIR };

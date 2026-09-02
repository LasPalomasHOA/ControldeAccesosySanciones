const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Guarda una cadena base64 como archivo en disco y retorna la URL relativa.
 * Si ya es una URL normal, la deja intacta.
 */
function saveBase64Image(dataString, prefix = 'img') {
  if (!dataString) return null;
  if (!dataString.startsWith('data:image')) {
    return dataString.length > 500 ? dataString.substring(0, 500) : dataString;
  }

  try {
    const matches = dataString.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error guardando imagen base64:', error);
    return null;
  }
}

module.exports = { saveBase64Image, UPLOADS_DIR };

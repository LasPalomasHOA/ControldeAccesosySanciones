const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'hoa_las_palomas_secure_key_2026_x89a';

/**
 * Codifica una cadena o buffer a Base64URL
 */
function base64UrlEncode(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(typeof data === 'string' ? data : JSON.stringify(data));
  return buf.toString('base64url');
}

/**
 * Decodifica una cadena Base64URL a texto UTF-8
 */
function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

/**
 * Genera un JSON Web Token (HS256) firmado criptográficamente
 * @param {object} payload - Información de usuario y rol a incluir
 * @param {number} expiresInSeconds - Tiempo de expiración (por defecto 7 días)
 */
function signToken(payload, expiresInSeconds = 86400 * 7) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(fullPayload);
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

/**
 * Verifica la firma y expiración de un token JWT
 * @param {string} token - Token en formato Header.Payload.Signature
 * @returns {object|null} - Payload decodificado si es válido, null si no
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');

  // Comparación en tiempo constante para mitigar timing attacks
  try {
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expirado
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  signToken,
  verifyToken
};

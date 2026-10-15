/**
 * Middleware de Rate Limiting y Protección contra Fuerza Bruta (en memoria)
 * Diseñado para proteger endpoints de login y la API general de Las Palomas HOA.
 */

const failedLoginAttempts = new Map(); // ip -> { count: number, resetAt: number }
const ipRequestCounts = new Map();     // ip -> { count: number, resetAt: number }

// Limpiar memoria cada 60 segundos para evitar fugas
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of failedLoginAttempts.entries()) {
    if (now > data.resetAt) failedLoginAttempts.delete(key);
  }
  for (const [key, data] of ipRequestCounts.entries()) {
    if (now > data.resetAt) ipRequestCounts.delete(key);
  }
}, 60000);

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

/**
 * 1. Limitador global de peticiones (300 req/min por IP)
 */
function apiRateLimiter(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 300;

  const current = ipRequestCounts.get(ip);
  if (!current || now > current.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  current.count++;
  if (current.count > maxRequests) {
    const retrySecs = Math.ceil((current.resetAt - now) / 1000);
    res.setHeader('Retry-After', retrySecs);
    return res.status(429).json({
      error: 'Límite de solicitudes excedido',
      message: `Demasiadas peticiones desde tu dirección IP. Por favor espera ${retrySecs} segundos antes de continuar.`
    });
  }

  next();
}

/**
 * 2. Limitador contra ataques de fuerza bruta en inicio de sesión (5 intentos fallidos en 15 min)
 */
function checkLoginRateLimit(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const lockoutMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  const current = failedLoginAttempts.get(ip);
  if (current && now < current.resetAt && current.count >= maxAttempts) {
    const remainingMins = Math.ceil((current.resetAt - now) / 60000);
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({
      error: 'Acceso temporalmente bloqueado por seguridad',
      message: `Has superado el límite de 5 intentos fallidos de inicio de sesión. Por motivos de seguridad tu IP está bloqueada por ${remainingMins} minuto(s).`
    });
  }

  next();
}

function recordFailedLogin(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const lockoutMs = 15 * 60 * 1000;

  const current = failedLoginAttempts.get(ip);
  if (!current || now > current.resetAt) {
    failedLoginAttempts.set(ip, { count: 1, resetAt: now + lockoutMs });
  } else {
    current.count++;
  }
}

function clearFailedLogins(req) {
  const ip = getClientIp(req);
  failedLoginAttempts.delete(ip);
}

module.exports = {
  apiRateLimiter,
  checkLoginRateLimit,
  recordFailedLogin,
  clearFailedLogins
};

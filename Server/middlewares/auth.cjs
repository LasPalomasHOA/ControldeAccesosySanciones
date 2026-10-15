const { verifyToken } = require('../utils/jwt.cjs');

/**
 * Middleware para validar el JWT de sesión en las rutas protegidas de la API
 */
function requireAuth(req, res, next) {
  // Peticiones OPTIONS (pre-flight de CORS) pasan directo
  if (req.method === 'OPTIONS') {
    return next();
  }

  // 1. Extraer token de cabecera Authorization o parámetro query
  let rawToken = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      rawToken = parts[1];
    }
  } else if (req.query?.token) {
    rawToken = req.query.token;
  }

  // 2. Si se proporcionó token, validarlo
  if (rawToken) {
    const decoded = verifyToken(rawToken);
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  // 3. Si no hay token o es inválido:
  // En entorno local para peticiones de solo lectura (GET) durante hidratación de sesión de la app Vite,
  // permitir para evitar parpadeos o bloqueos de renderizado inicial.
  const isLocalDev = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  if (req.method === 'GET' && isLocalDev) {
    return next();
  }

  // En cualquier otro caso (peticiones externas, llamadas de alteración de datos POST/PUT/DELETE):
  if (!rawToken) {
    return res.status(401).json({
      error: 'Acceso no autorizado: Se requiere token de sesión Bearer',
      code: 'AUTH_TOKEN_MISSING'
    });
  }

  return res.status(401).json({
    error: 'Token de sesión inválido o expirado. Por favor inicia sesión nuevamente.',
    code: 'AUTH_TOKEN_INVALID'
  });
}

/**
 * Middleware opcional para rutas que pueden beneficiarse de conocer al usuario si está autenticado
 */
function optionalAuth(req, res, next) {
  let rawToken = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      rawToken = parts[1];
    }
  } else if (req.query?.token) {
    rawToken = req.query.token;
  }

  if (rawToken) {
    const decoded = verifyToken(rawToken);
    if (decoded) req.user = decoded;
  }
  next();
}

/**
 * Middleware para restringir por roles permitidos (RBAC)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const userRole = (req.user.rol || '').toLowerCase();
    const hasRole = allowedRoles.some(r => {
      const target = r.toLowerCase();
      return target === userRole ||
        (target === 'guardia' && userRole === 'caseta') ||
        (target === 'caseta' && userRole === 'guardia') ||
        (target === 'proveedor' && userRole === 'contratista') ||
        (target === 'contratista' && userRole === 'proveedor');
    });

    if (!hasRole) {
      return res.status(403).json({
        error: `Acceso denegado: El rol "${req.user.rol}" no tiene permisos para esta acción.`
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole
};

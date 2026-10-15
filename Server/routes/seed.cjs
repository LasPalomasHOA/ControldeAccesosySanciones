const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../seedData.cjs');

/**
 * POST /api/seed - Sembrar datos base iniciales protegido
 * Seguridad:
 * 1. Deshabilitado por defecto en producción a menos que se configure explícitamente ALLOW_SEED=true
 * 2. Requiere cabecera 'X-Seed-Secret' coincidente con variable de entorno o clave maestra
 * 3. Si se solicita 'force: true', requiere obligatoriamente 'X-Confirm-Force-Wipe: CONFIRMAR_REINICIO_TOTAL'
 */
router.post('/', async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const allowSeed = process.env.ALLOW_SEED === 'true';
  const adminSecret = process.env.ADMIN_SEED_SECRET || 'las_palomas_admin_seed_2026';
  const providedKey = req.headers['x-seed-secret'] || req.query.secret;

  // 1. Bloqueo en producción
  if (isProduction && !allowSeed) {
    return res.status(403).json({
      error: 'Acceso denegado: El endpoint /api/seed está deshabilitado permanentemente en entornos de producción.',
      code: 'SEED_DISABLED_IN_PROD'
    });
  }

  // 2. Validación de clave secreta administrativa
  if (!providedKey || providedKey !== adminSecret) {
    return res.status(403).json({
      error: 'Acceso no autorizado: Se requiere la cabecera X-Seed-Secret válida para sembrar datos.',
      code: 'INVALID_SEED_KEY'
    });
  }

  // 3. Protección contra reinicio destructivo { force: true }
  const isForce = req.body?.force === true;
  if (isForce && req.headers['x-confirm-force-wipe'] !== 'CONFIRMAR_REINICIO_TOTAL') {
    return res.status(400).json({
      error: 'Reinicio destructivo denegado. Para ejecutar { force: true } se requiere la cabecera X-Confirm-Force-Wipe: CONFIRMAR_REINICIO_TOTAL.',
      code: 'FORCE_CONFIRMATION_REQUIRED'
    });
  }

  try {
    const result = await seedDatabase(isForce);
    res.json({
      ...result,
      timestamp: new Date().toISOString(),
      authorized: true
    });
  } catch (error) {
    console.error('Error al inicializar seed:', error);
    res.status(500).json({ error: 'Error al inicializar datos base en PostgreSQL', details: error.message });
  }
});

// Bloquear cualquier método GET/PUT/DELETE
router.all('/', (req, res) => {
  res.status(405).json({ error: 'Método no permitido. Solo se acepta POST autenticado.' });
});

module.exports = router;

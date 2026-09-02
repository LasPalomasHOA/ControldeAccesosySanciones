const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models/index.cjs');
const { seedDatabase } = require('./seedData.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares (límite de 50mb para subida de fotos base64 de credenciales y vehículos)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const { UPLOADS_DIR } = require('./utils/imageHandler.cjs');

// Servir archivos subidos e imágenes (local o /tmp en serverless)
app.use('/uploads', express.static(UPLOADS_DIR));

// Gestión de conexión e inicialización de BD (memoizada para Serverless y Standalone)
let dbInitPromise = null;
async function ensureDbInit() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        await db.sequelize.authenticate();
        console.log('✅ Conexión a la base de datos PostgreSQL/Supabase establecida.');
      } catch (error) {
        dbInitPromise = null; // Permitir reintento si fue un fallo transitorio
        throw error;
      }
    })();
  }
  return dbInitPromise;
}

// Middleware para asegurar conexión a BD antes de atender peticiones a la API
app.use(async (req, res, next) => {
  if (req.path === '/api/status' || req.path === '/api') {
    return next();
  }
  try {
    await ensureDbInit();
    next();
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL/Supabase:', err);
    res.status(500).json({
      error: 'Error conectando con la base de datos PostgreSQL / Supabase',
      details: err.message
    });
  }
});

// Ruta de estado base de la API
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API Las Palomas HOA operativa en Vercel Serverless / Express',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'standalone',
    timestamp: new Date().toISOString()
  });
});

// Ruta de diagnóstico detallada
app.get('/api/status', async (req, res) => {
  let dbStatus = 'desconectada';
  try {
    await ensureDbInit();
    dbStatus = 'conectada';
  } catch (e) {
    dbStatus = 'error: ' + e.message;
  }

  res.json({
    status: 'ok',
    message: 'Servidor Express de Las Palomas HOA funcionando con PostgreSQL',
    database: dbStatus,
    environment: process.env.VERCEL ? 'vercel-serverless' : 'standalone',
    timestamp: new Date().toISOString()
  });
});

// Rutas API
app.use('/api/roles', require('./routes/roles.cjs'));
app.use('/api/empresas', require('./routes/empresas.cjs'));
app.use('/api/usuarios', require('./routes/usuarios.cjs'));
app.use('/api/trabajadores', require('./routes/trabajadores.cjs'));
app.use('/api/vehiculos', require('./routes/vehiculos.cjs'));
app.use('/api/reglamentos', require('./routes/reglamentos.cjs'));
app.use('/api/corbatines', require('./routes/corbatines.cjs'));
app.use('/api/casetas', require('./routes/casetas.cjs'));
app.use('/api/reglas', require('./routes/reglas.cjs'));
app.use('/api/infracciones', require('./routes/infracciones.cjs'));
app.use('/api/reportes', require('./routes/reportes.cjs'));
app.use('/api/sanciones', require('./routes/sanciones.cjs'));
app.use('/api/bitacora', require('./routes/bitacora.cjs'));
app.use('/api/seed', require('./routes/seed.cjs'));

// Si se ejecuta directamente (localmente), iniciar servidor HTTP
if (require.main === module) {
  ensureDbInit()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor Express conectado a PostgreSQL en http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('❌ No se pudo conectar a la base de datos PostgreSQL:', error);
      app.listen(PORT, () => {
        console.log(`⚠️ Servidor Express iniciado (con error de BD) en http://localhost:${PORT}`);
      });
    });
}

// Exportar app para entorno serverless de Vercel
module.exports = app;

const path = require('path');
const fs = require('fs');

// Cargar .env en modo silencioso sin banners de consola
const envPathRoot = path.resolve(__dirname, '../.env');
const envPathServer = path.resolve(__dirname, '.env');

if (fs.existsSync(envPathRoot)) {
  require('dotenv').config({ path: envPathRoot, quiet: true });
} else if (fs.existsSync(envPathServer)) {
  require('dotenv').config({ path: envPathServer, quiet: true });
} else {
  require('dotenv').config({ quiet: true });
}

const express = require('express');
const cors = require('cors');
const db = require('./models/index.cjs');
const { seedDatabase } = require('./seedData.cjs');
const { UPLOADS_DIR } = require('./utils/imageHandler.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos subidos e imágenes (local o /tmp en serverless)
app.use('/uploads', express.static(UPLOADS_DIR));

// Gestión de conexión e inicialización de BD (memoizada para Serverless y Standalone)
let dbInitPromise = null;
let isDbReady = false;
let dbError = null;

async function ensureDbInit() {
  if (isDbReady) return;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      await db.sequelize.authenticate();
      console.log('✅ Conexión a base de datos Supabase / PostgreSQL verificada.');

      // Asegurar columna foto_url en usuarios
      try {
        const schemaName = process.env.DB_SCHEMA || 'control_acceso';
        await db.sequelize.query(`
          ALTER TABLE IF EXISTS "${schemaName}"."usuarios" 
          ADD COLUMN IF NOT EXISTS "foto_url" TEXT;
        `);
      } catch (colErr) {
        // Ignorar si ya existe o no aplica
      }

      // En entornos Serverless de Vercel NO se ejecuta sync() ni seedDatabase()
      // porque las tablas ya existen y ejecutar DDL en cada invocación provoca timeouts de 15s y error 500.
      if (!process.env.VERCEL && process.env.AUTO_SYNC === 'true') {
        try {
          const schemaName = process.env.DB_SCHEMA || 'control_acceso';
          if (schemaName && schemaName !== 'public') {
            await db.sequelize.createSchema(schemaName).catch(() => {});
          }
          await db.sequelize.sync({ alter: false });
          await seedDatabase(false);
          console.log(`✅ Tablas y catálogos verificados en el esquema "${schemaName}".`);
        } catch (syncErr) {
          console.warn('Nota sobre inicialización local:', syncErr.message);
        }
      }

      isDbReady = true;
      dbError = null;
    } catch (error) {
      dbError = error.message;
      dbInitPromise = null; // Permitir reintento si fue transitorio
      console.error('⚠️ Conexión a Supabase / PostgreSQL no disponible:', error.message);
      throw error;
    }
  })();

  return dbInitPromise;
}

// Iniciar conexión asíncrona inmediata únicamente en modo standalone
if (require.main === module) {
  ensureDbInit().catch(() => {});
}

// Middleware para asegurar conexión a BD antes de atender peticiones a la API
app.use(async (req, res, next) => {
  if (req.path === '/api/status' || req.path === '/api') {
    return next();
  }
  if (!isDbReady) {
    try {
      await ensureDbInit();
    } catch (err) {
      console.error(`⚠️ Petición a ${req.path} no procesada: BD no disponible (${err.message})`);
      return res.status(503).json({
        error: 'Error de conexión con la base de datos PostgreSQL / Supabase',
        details: err.message,
        path: req.path,
        hint: 'Verifica la variable POSTGRES_URL en el panel de Vercel (Project Settings -> Environment Variables)'
      });
    }
  }
  next();
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
    dbStatus = 'error: ' + (e.message || dbError);
  }

  res.json({
    status: isDbReady ? 'ok' : 'initializing',
    database: dbStatus,
    environment: process.env.VERCEL ? 'vercel-serverless' : 'standalone',
    message: 'Servidor Express de Las Palomas HOA funcionando con PostgreSQL / Supabase',
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

// Manejador para rutas no encontradas dentro de /api
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Ruta de API no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejador global de errores para Express
app.use((err, req, res, next) => {
  console.error('Unhandled Express Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: 'Error interno en el servidor',
    message: err.message || 'Error no especificado',
    path: req.originalUrl
  });
});

// Iniciar listener HTTP únicamente cuando se ejecuta directamente con `node Server/index.cjs`
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Express listo en http://localhost:${PORT}`);
  });
}

// Exportar app para entorno serverless de Vercel
module.exports = app;

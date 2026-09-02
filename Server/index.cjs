const path = require('path');
const fs = require('fs');

// Cargar .env en modo silencioso sin banners de consola
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath, quiet: true });
} else {
  require('dotenv').config({ quiet: true });
}

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

// Servir archivos subidos e imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Variable y promesa de estado de la base de datos
let isDbReady = false;
let dbError = null;

async function initDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexión a base de datos Supabase / PostgreSQL establecida con éxito.');

    // Sincronizar modelos para crear automáticamente las tablas en Supabase si no existen
    try {
      const schemaName = process.env.DB_SCHEMA || 'control_acceso';
      if (schemaName && schemaName !== 'public') {
        await db.sequelize.createSchema(schemaName).catch(() => {});
      }
      await db.sequelize.sync({ alter: false });
      console.log(`✅ Tablas y relaciones verificadas en el esquema "${schemaName}".`);
    } catch (syncErr) {
      console.warn('Nota sobre sincronización de tablas:', syncErr.message);
    }

    // Sembrar datos base iniciales (roles, casetas, admin, reglas) si están vacías
    try {
      await seedDatabase(false);
      console.log('✅ Catálogos esenciales verificados.');
    } catch (seedErr) {
      console.warn('Nota sobre inicialización de catálogos base:', seedErr.message);
    }

    isDbReady = true;
  } catch (error) {
    dbError = error.message;
    console.warn('⚠️ Conexión a Supabase / PostgreSQL no disponible:', error.message);
    console.info('💡 Revisa tus credenciales en el archivo .env.');
  }
}

// Iniciar conexión asíncrona a Supabase
const dbInitPromise = initDatabase();

// Middleware: si el frontend hace peticiones antes de que la conexión remota a Supabase termine,
// espera a que la inicialización finalice para evitar errores 502/ECONNREFUSED
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/status' && !isDbReady) {
    try {
      await dbInitPromise;
    } catch (_) {}
  }
  next();
});

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({
    status: isDbReady ? 'ok' : 'initializing',
    database: isDbReady ? 'connected' : (dbError ? `error: ${dbError}` : 'connecting'),
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

// Iniciar listener HTTP inmediatamente para responder al proxy de Vite al instante
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Express listo en http://localhost:${PORT}`);
});

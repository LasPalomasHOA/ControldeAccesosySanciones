const express = require('express');
const cors = require('cors');
const db = require('./models/index.cjs');
const { seedDatabase } = require('./seedData.cjs');
require('dotenv').config();

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares (límite de 50mb para subida de fotos base64 de credenciales y vehículos)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos subidos e imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor Express de Las Palomas HOA funcionando con PostgreSQL',
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

// Autenticar e inicializar conexión a base de datos PostgreSQL
async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos PostgreSQL establecida con éxito.');

    // Sembrar datos base iniciales (roles, casetas, admin, reglas) si están vacías
    try {
      await seedDatabase(false);
    } catch (seedErr) {
      console.warn('Nota sobre inicialización de datos base:', seedErr.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor Express conectado a PostgreSQL en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos PostgreSQL:', error);
  }
}

startServer();

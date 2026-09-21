const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Cargar .env local si existe
const envPathRoot = path.resolve(__dirname, '../../.env');
const envPathServer = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPathRoot)) {
  require('dotenv').config({ path: envPathRoot, quiet: true });
} else if (fs.existsSync(envPathServer)) {
  require('dotenv').config({ path: envPathServer, quiet: true });
} else {
  require('dotenv').config({ quiet: true });
}

let sequelize;

// Usar única y exclusivamente CUSTOM_DB_URL
const postgresUrl = process.env.CUSTOM_DB_URL;
const schema = process.env.DB_SCHEMA || 'control_acceso';

if (!postgresUrl) {
  throw new Error('Configuración incompleta: Debe definirse la variable de entorno CUSTOM_DB_URL con el usuario admin_acceso.');
}

function resolveServerlessDbUrl(rawUrl) {
  let cleanUrl = rawUrl.replace(/^["']|["']$/g, '').split('?')[0].trim();
  try {
    const parsed = new URL(cleanUrl);
    const directMatch = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    if (directMatch) {
      const projectRef = directMatch[1];
      parsed.hostname = 'aws-0-us-east-1.pooler.supabase.com';
      parsed.port = '6543';
      if (!parsed.username.includes('.')) {
        parsed.username = `${parsed.username}.${projectRef}`;
      }
      return parsed.toString();
    }
  } catch (err) {}
  return cleanUrl;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);
const connectionUri = resolveServerlessDbUrl(postgresUrl);

sequelize = new Sequelize(connectionUri, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 15000,
    keepAlive: true
  },
  pool: {
    max: isServerless ? 2 : (process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 5),
    min: 0,
    acquire: 15000,
    idle: 2000,
    evict: 1000
  },
  define: {
    schema,
    freezeTableName: true,
    timestamps: true
  },
  logging: false
});

module.exports = sequelize;

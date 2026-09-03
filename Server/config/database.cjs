const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Cargar .env silenciosamente
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

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL || process.env.DB_URL;
const schema = process.env.DB_SCHEMA || 'control_acceso';

function resolveServerlessDbUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  let cleanUrl = rawUrl.split('?')[0].trim();
  try {
    const parsed = new URL(cleanUrl);
    // Detectar si es una conexión directa db.<project-ref>.supabase.co
    const directMatch = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    if (directMatch) {
      const projectRef = directMatch[1];
      // En entornos Serverless como Vercel (IPv4), se debe usar el Pooler oficial de Supabase
      parsed.hostname = 'aws-0-us-east-1.pooler.supabase.com';
      parsed.port = '6543';
      if (!parsed.username.includes('.')) {
        parsed.username = `${parsed.username}.${projectRef}`;
      }
      return parsed.toString();
    }
  } catch (err) {
    // Si no es un URL estándar, retornar como está
  }
  return cleanUrl;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION);

if (postgresUrl) {
  const connectionUri = resolveServerlessDbUrl(postgresUrl);

  // Conexión por URL completa (Supabase / Neon / Render / Heroku / Vercel Postgres)
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
} else {
  const dbHost = process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com';
  const isRemoteOrSsl = Boolean(
    dbHost.includes('supabase.com') ||
    dbHost.includes('neon.tech') ||
    process.env.DB_SSL === 'true' ||
    process.env.VERCEL
  );

  const dialectOptions = isRemoteOrSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        connectTimeout: 15000,
        keepAlive: true
      }
    : {};

  // Conexión por variables individuales (fallback con credenciales operativas de Supabase Pooler 6543)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'postgres.iocpmwzyvkangytybcwh',
    process.env.DB_PASSWORD || 'Laspalomas26',
    {
      host: dbHost,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 6543,
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions,
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
    }
  );
}

module.exports = sequelize;

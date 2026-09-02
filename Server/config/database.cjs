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

if (postgresUrl) {
  // Limpiar posibles query parameters que causan conflicto con SSL en pg (como sslmode=require)
  const connectionUri = postgresUrl.split('?')[0];

  // Conexión por URL completa (Supabase / Neon / Render / Heroku / Vercel Postgres)
  sequelize = new Sequelize(connectionUri, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
      min: 0,
      acquire: 30000,
      idle: 10000
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
    process.env.DB_SSL === 'true'
  );

  const dialectOptions = isRemoteOrSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {};

  // Conexión por variables individuales
  sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'admin_acceso.iocpmwzyvkangytybcwh',
    process.env.DB_PASSWORD || 'ControlAcceso2026!',
    {
      host: dbHost,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      dialect: process.env.DB_DIALECT || 'postgres',
      dialectOptions,
      pool: {
        max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
        min: 0,
        acquire: 30000,
        idle: 10000
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

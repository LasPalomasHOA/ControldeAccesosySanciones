const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Cargar .env silenciosamente solo si existe
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath, quiet: true });
} else {
  require('dotenv').config({ quiet: true });
}

const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
const dbName = process.env.DB_NAME || 'postgres';
const dbUser = process.env.DB_USER || 'postgres.iocpmwzyvkangytybcwh';
const dbPass = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com';
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
const dbDialect = process.env.DB_DIALECT || 'postgres';
const dbSchema = process.env.DB_SCHEMA || 'public';

const isSupabase = Boolean(
  (dbHost && dbHost.includes('supabase.com')) ||
  (dbUrl && dbUrl.includes('supabase.com')) ||
  process.env.DB_SSL === 'true'
);

const dialectOptions = isSupabase
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  : {};

let sequelize;

if (dbUrl) {
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions,
    define: {
      schema: dbSchema,
      freezeTableName: true,
      timestamps: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPass,
    {
      host: dbHost,
      port: dbPort,
      dialect: dbDialect,
      logging: false,
      dialectOptions,
      define: {
        schema: dbSchema,
        freezeTableName: true,
        timestamps: true
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;

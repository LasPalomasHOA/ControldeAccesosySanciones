const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let sequelize;

const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_POSTGRES_URL;

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
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      schema: process.env.DB_SCHEMA || 'control_acceso',
      freezeTableName: true,
      timestamps: true
    },
    logging: false
  });
} else {
  // Conexión por variables individuales
  sequelize = new Sequelize(
    process.env.DB_NAME || 'laspalomas',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: process.env.DB_DIALECT || 'postgres',
      define: {
        schema: process.env.DB_SCHEMA || 'control_acceso',
        freezeTableName: true,
        timestamps: true
      },
      logging: false
    }
  );
}

module.exports = sequelize;

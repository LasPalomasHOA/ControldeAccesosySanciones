const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Reglamento = sequelize.define(
  'reglamento',
  {
    id_reglamento: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del reglamento'
    },
    version: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: 'Código de versión (ej. V2026-1)'
    },
    titulo: {
      type: DataTypes.STRING(180),
      allowNull: false,
      comment: 'Nombre formal del documento'
    },
    archivo_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Ruta o enlace al PDF oficial'
    },
    fecha_publicacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha de entrada en vigor'
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Marca si es la versión activa actual'
    }
  },
  {
    tableName: 'reglamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = Reglamento;

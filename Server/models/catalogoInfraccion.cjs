const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const CatalogoInfraccion = sequelize.define(
  'catalogo_infraccion',
  {
    id_infraccion: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador de la falta tipificada'
    },
    id_reglamento: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Reglamento que la respalda'
    },
    codigo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: 'Código único de la infracción (ej. INF-01)'
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nombre formal de la infracción'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descripción detallada de la prohibición'
    },
    categoria: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'INGRESO, ÁREA DE TRABAJO, VEHÍCULOS, etc.'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Estado en catálogo (DEFAULT TRUE)'
    }
  },
  {
    tableName: 'catalogo_infracciones',
    timestamps: false
  }
);

module.exports = CatalogoInfraccion;

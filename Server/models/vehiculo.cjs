const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Vehiculo = sequelize.define(
  'vehiculo',
  {
    id_vehiculo: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del vehículo'
    },
    id_empresa: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Empresa propietaria o responsable'
    },
    marca: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'Marca del vehículo'
    },
    modelo: {
      type: DataTypes.STRING(80),
      allowNull: false,
      comment: 'Modelo o línea de la unidad'
    },
    año: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'año',
      comment: 'Año de fabricación'
    },
    placas: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Placas normalizadas en mayúsculas'
    },
    color: {
      type: DataTypes.STRING(40),
      allowNull: false,
      comment: 'Color exterior predominante'
    },
    foto_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Fotografía en Base64 o URL directa de la unidad'
    },
    estatus_acceso: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'HABILITADO',
      comment: 'HABILITADO, SUSPENDIDO o RESTRINGIDO'
    }
  },
  {
    tableName: 'vehiculos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Vehiculo;

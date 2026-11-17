const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Visitante = sequelize.define(
  'visitante',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_conductor: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    marca: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    modelo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    año: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: ''
    },
    placas: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: ''
    },
    corbatin_num: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    destino: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pasajeros: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_bitacora: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    hora_entrada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hora_salida: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'visitantes',
    schema: process.env.DB_SCHEMA || 'control_acceso',
    timestamps: false
  }
);

module.exports = Visitante;


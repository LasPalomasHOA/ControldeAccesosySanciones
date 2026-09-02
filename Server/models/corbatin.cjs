const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Corbatin = sequelize.define(
  'corbatin',
  {
    id_corbatin: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del corbatín'
    },
    id_vehiculo: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Vehículo asociado'
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: 'Número visible del corbatín'
    },
    qr_token: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      comment: 'Token criptográfico embebido en QR'
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha de generación'
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de vencimiento'
    },
    estatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'ACTIVO',
      comment: 'ACTIVO, VENCIDO, CANCELADO o REEMPLAZADO'
    },
    fecha_impresion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última impresión registrada'
    },
    motivo_cancelacion: {
      type: DataTypes.STRING(250),
      allowNull: true,
      comment: 'Razón de anulación o sustitución'
    }
  },
  {
    tableName: 'corbatines',
    timestamps: false
  }
);

module.exports = Corbatin;

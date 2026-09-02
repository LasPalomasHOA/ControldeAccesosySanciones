const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const BitacoraAcceso = sequelize.define(
  'bitacora_acceso',
  {
    id_acceso: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del movimiento'
    },
    id_caseta: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Caseta donde se realiza el movimiento'
    },
    id_vehiculo: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Vehículo involucrado (opcional en acceso peatonal)'
    },
    id_corbatin: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Corbatín físico o QR presentado (opcional)'
    },
    id_conductor: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Trabajador que conduce la unidad'
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Usuario de caseta en turno que registra'
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha operativa (DEFAULT CURRENT_DATE)'
    },
    hora_entrada: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Momento exacto del ingreso'
    },
    hora_salida: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Momento exacto de la salida'
    },
    ubicacion_trabajo: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: 'Ubicación física declarada donde laborará la unidad'
    },
    estatus_acceso: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'AUTORIZADO',
      comment: 'AUTORIZADO, RECHAZADO, PENDIENTE o SALIDA'
    },
    motivo_rechazo: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: 'Causa por la que se impidió el acceso'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales del guardia'
    }
  },
  {
    tableName: 'bitacora_accesos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = BitacoraAcceso;

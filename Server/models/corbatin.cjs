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
      allowNull: true,
      comment: 'Vehículo asociado (opcional para corbatines verdes de empresas)'
    },
    tipos: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'NORMAL',
      comment: 'Tipo de corbatín: NORMAL o VERDE'
    },
    tipo: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('tipos');
      },
      set(val) {
        this.setDataValue('tipos', val);
      }
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número visible del corbatín'
    },
    qr_token: {
      type: DataTypes.STRING(120),
      allowNull: true,
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
      comment: 'ACTIVO, VENCIDO, CANCELADO, DESHABILITADO o REEMPLAZADO'
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
    },
    empresa_nombre: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Nombre de la empresa para corbatines verdes'
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    vigencia_texto: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    creado_por: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'corbatines',
    timestamps: false
  }
);

module.exports = Corbatin;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Empresa = sequelize.define(
  'empresa',
  {
    id_empresa: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único de la empresa'
    },
    razon_social: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Razón social o nombre legal'
    },
    responsable_nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
      comment: 'Nombre del representante legal o contacto'
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Teléfono de contacto'
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      comment: 'Correo institucional'
    },
    estatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'ACTIVA',
      comment: 'ACTIVA, SUSPENDIDA o RESTRINGIDA'
    },
    corbatin_rango_inicio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Número de corbatín inicial asignado a la empresa (ej. 1)'
    },
    corbatin_rango_fin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Número de corbatín final asignado a la empresa (ej. 5)'
    },
    seguro_vigencia_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL o Base64 Data URL del comprobante de seguro'
    },
    seguro_subido_por: {
      type: DataTypes.STRING(120),
      allowNull: true,
      comment: 'Usuario o supervisor que adjuntó el comprobante'
    },
    seguro_subido_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha y hora en que se adjuntó el comprobante'
    }
  },
  {
    tableName: 'empresas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Empresa;

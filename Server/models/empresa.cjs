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

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Trabajador = sequelize.define(
  'trabajador',
  {
    id_trabajador: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del trabajador'
    },
    id_empresa: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Empresa empleadora'
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      comment: 'Nombre(s) del colaborador'
    },
    apellidos: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Apellidos completos unificados'
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Teléfono celular'
    },
    foto_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Fotografía en Base64 o URL directa'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Estatus de autorización (DEFAULT TRUE)'
    }
  },
  {
    tableName: 'trabajadores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Trabajador;

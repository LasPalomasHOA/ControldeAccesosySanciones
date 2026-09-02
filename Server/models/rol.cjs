const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Rol = sequelize.define(
  'rol',
  {
    id_rol: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del rol'
    },
    nombre: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
      comment: 'Nombre único del perfil'
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Funciones y alcance del rol'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Habilitación del rol (DEFAULT TRUE)'
    }
  },
  {
    tableName: 'roles',
    timestamps: false
  }
);

module.exports = Rol;

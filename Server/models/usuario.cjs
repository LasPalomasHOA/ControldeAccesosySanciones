const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Usuario = sequelize.define(
  'usuario',
  {
    id_usuario: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del usuario'
    },
    id_empresa: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Empresa vinculada (NULL si es personal interno HOA)'
    },
    id_rol: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Rol asignado (define permisos)'
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
      comment: 'Nombre completo del usuario'
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      comment: 'Correo electrónico único para inicio de sesión'
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Hash cifrado de la contraseña'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Habilitación de acceso (DEFAULT TRUE)'
    }
  },
  {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Usuario;

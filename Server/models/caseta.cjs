const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Caseta = sequelize.define(
  'caseta',
  {
    id_caseta: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador de la caseta'
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
      comment: 'Nombre o ubicación física (ej. Caseta Principal)'
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Referencia física o de turno'
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Estatus operativo (DEFAULT TRUE)'
    }
  },
  {
    tableName: 'casetas',
    timestamps: false
  }
);

module.exports = Caseta;

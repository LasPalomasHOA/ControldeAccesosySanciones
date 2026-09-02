const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const ReglaReincidencia = sequelize.define(
  'regla_reincidencia',
  {
    id_regla: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador de la regla'
    },
    numero_falta: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      unique: true,
      comment: 'Nivel de falta (1, 2, 3 o 4)'
    },
    permite_acceso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: 'TRUE si permite ingreso con advertencia (1ª falta)'
    },
    requiere_administrador: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: 'TRUE si requiere mediación de Dirección'
    },
    mensaje_alerta: {
      type: DataTypes.STRING(250),
      allowNull: false,
      comment: 'Mensaje mostrado en caseta al escanear QR'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Regla vigente (DEFAULT TRUE)'
    }
  },
  {
    tableName: 'reglas_reincidencia',
    timestamps: false
  }
);

module.exports = ReglaReincidencia;

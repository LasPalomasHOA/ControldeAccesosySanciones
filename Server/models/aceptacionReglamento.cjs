const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const AceptacionReglamento = sequelize.define(
  'aceptacion_reglamento',
  {
    id_aceptacion: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único de la aceptación'
    },
    id_reglamento: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Reglamento aceptado'
    },
    id_empresa: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Empresa que suscribe'
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Usuario que realizó la aceptación'
    },
    aceptado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Confirmación expresa (DEFAULT TRUE)'
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Momento exacto de aceptación'
    },
    firma_nombre: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Nombre digitalizado como firma simple'
    }
  },
  {
    tableName: 'aceptaciones_reglamento',
    timestamps: false
  }
);

module.exports = AceptacionReglamento;

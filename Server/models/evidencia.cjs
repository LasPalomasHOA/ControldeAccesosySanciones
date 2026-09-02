const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Evidencia = sequelize.define(
  'evidencia',
  {
    id_evidencia: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador de la prueba'
    },
    id_reporte: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Reporte asociado'
    },
    archivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Ruta o almacenamiento privado del archivo'
    },
    descripcion: {
      type: DataTypes.STRING(250),
      allowNull: true,
      comment: 'Detalle o descripción de la imagen'
    },
    fecha_captura: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Momento de la captura fotográfica'
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Usuario que capturó y subió el archivo'
    },
    hash_archivo: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: 'Huella SHA-256 para integridad probatoria'
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica validez de la evidencia (DEFAULT TRUE)'
    }
  },
  {
    tableName: 'evidencias',
    timestamps: false
  }
);

module.exports = Evidencia;

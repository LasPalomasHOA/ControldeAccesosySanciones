const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const ReporteInfraccion = sequelize.define(
  'reporte_infraccion',
  {
    id_reporte: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del reporte'
    },
    id_vehiculo: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Vehículo infractor'
    },
    id_corbatin: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Corbatín detectado/escaneado'
    },
    id_infraccion: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Infracción del catálogo imputada'
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Usuario (Agente) que levantó el reporte'
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Momento del suceso'
    },
    ubicacion_texto: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Ubicación física dentro del complejo'
    },
    descripcion_hechos: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Narrativa de los hechos presenciados'
    },
    estatus_revision: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'PENDIENTE',
      comment: 'PENDIENTE, APROBADO o RECHAZADO'
    }
  },
  {
    tableName: 'reportes_infracciones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = ReporteInfraccion;

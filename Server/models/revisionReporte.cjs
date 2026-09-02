const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const RevisionReporte = sequelize.define(
  'revision_reporte',
  {
    id_revision: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador del dictamen'
    },
    id_reporte: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Reporte evaluado'
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Usuario (Supervisor) que dictamina'
    },
    decision: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'APROBADO o RECHAZADO'
    },
    comentarios: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justificación del dictamen'
    },
    fecha_revision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Momento exacto de revisión'
    },
    nivel_reincidencia_aplicado: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      comment: 'Nivel de sanción resultante aplicado'
    }
  },
  {
    tableName: 'revisiones_reportes',
    timestamps: false
  }
);

module.exports = RevisionReporte;

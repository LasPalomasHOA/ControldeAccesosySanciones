const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const Sancion = sequelize.define(
  'sancion',
  {
    id_sancion: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único de la sanción'
    },
    id_reporte: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Reporte aprobado que origina la sanción'
    },
    id_vehiculo: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Vehículo sancionado'
    },
    id_empresa: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Empresa responsable'
    },
    id_regla: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Regla aplicada de la matriz'
    },
    numero_reincidencia: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Contador acumulado de faltas'
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Inicio de la sanción'
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fin de la sanción (NULL = permanente)'
    },
    estatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'ACTIVA',
      comment: 'PROGRAMADA, ACTIVA, VENCIDA, CANCELADA o PERMANENTE'
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Texto visible en caseta y portal de proveedores'
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Usuario que aprobó la sanción'
    }
  },
  {
    tableName: 'sanciones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Sancion;

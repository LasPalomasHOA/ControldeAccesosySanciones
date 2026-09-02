const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.cjs');

const ConductorVehiculo = sequelize.define(
  'conductor_vehiculo',
  {
    id_relacion: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador de la asignación'
    },
    id_vehiculo: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Vehículo asignado'
    },
    id_trabajador: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Trabajador asignado como conductor'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Vigencia de la relación (DEFAULT TRUE)'
    }
  },
  {
    tableName: 'conductores_vehiculos',
    timestamps: false
  }
);

module.exports = ConductorVehiculo;

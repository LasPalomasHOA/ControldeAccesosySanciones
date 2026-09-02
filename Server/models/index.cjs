const sequelize = require('../config/database.cjs');

// 1. roles
const Rol = require('./rol.cjs');
// 2. empresas
const Empresa = require('./empresa.cjs');
// 3. usuarios
const Usuario = require('./usuario.cjs');
// 4. trabajadores
const Trabajador = require('./trabajador.cjs');
// 5. vehiculos
const Vehiculo = require('./vehiculo.cjs');
// 6. conductores_vehiculos
const ConductorVehiculo = require('./conductorVehiculo.cjs');
// 7. reglamentos
const Reglamento = require('./reglamento.cjs');
// 8. aceptaciones_reglamento
const AceptacionReglamento = require('./aceptacionReglamento.cjs');
// 9. corbatines
const Corbatin = require('./corbatin.cjs');
// 10. casetas
const Caseta = require('./caseta.cjs');
// 11. reglas_reincidencia
const ReglaReincidencia = require('./reglaReincidencia.cjs');
// 12. catalogo_infracciones
const CatalogoInfraccion = require('./catalogoInfraccion.cjs');
// 13. reportes_infracciones
const ReporteInfraccion = require('./reporteInfraccion.cjs');
// 14. evidencias
const Evidencia = require('./evidencia.cjs');
// 15. revisiones_reportes
const RevisionReporte = require('./revisionReporte.cjs');
// 16. sanciones
const Sancion = require('./sancion.cjs');
// 17. bitacora_accesos
const BitacoraAcceso = require('./bitacoraAcceso.cjs');

// ─── RELACIONES (ASOCIACIONES) ───────────────────────────────────────────────

// 1. Roles y Usuarios
Rol.hasMany(Usuario, { foreignKey: 'id_rol', as: 'usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });

// 2. Empresas y Usuarios
Empresa.hasMany(Usuario, { foreignKey: 'id_empresa', as: 'usuarios' });
Usuario.belongsTo(Empresa, { foreignKey: 'id_empresa', as: 'empresa' });

// 3. Empresas y Trabajadores
Empresa.hasMany(Trabajador, { foreignKey: 'id_empresa', as: 'trabajadores' });
Trabajador.belongsTo(Empresa, { foreignKey: 'id_empresa', as: 'empresa' });

// 4. Empresas y Vehículos
Empresa.hasMany(Vehiculo, { foreignKey: 'id_empresa', as: 'vehiculos' });
Vehiculo.belongsTo(Empresa, { foreignKey: 'id_empresa', as: 'empresa' });

// 5. Conductores y Vehículos (Relación Muchos a Muchos)
Vehiculo.hasMany(ConductorVehiculo, { foreignKey: 'id_vehiculo', as: 'asignaciones_conductores' });
ConductorVehiculo.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' });
Trabajador.hasMany(ConductorVehiculo, { foreignKey: 'id_trabajador', as: 'asignaciones_vehiculos' });
ConductorVehiculo.belongsTo(Trabajador, { foreignKey: 'id_trabajador', as: 'trabajador' });

// 6. Reglamentos y Aceptaciones
Reglamento.hasMany(AceptacionReglamento, { foreignKey: 'id_reglamento', as: 'aceptaciones' });
AceptacionReglamento.belongsTo(Reglamento, { foreignKey: 'id_reglamento', as: 'reglamento' });
Empresa.hasMany(AceptacionReglamento, { foreignKey: 'id_empresa', as: 'aceptaciones_reglamento' });
AceptacionReglamento.belongsTo(Empresa, { foreignKey: 'id_empresa', as: 'empresa' });
Usuario.hasMany(AceptacionReglamento, { foreignKey: 'id_usuario', as: 'firmas_reglamento' });
AceptacionReglamento.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// 7. Vehículos y Corbatines
Vehiculo.hasMany(Corbatin, { foreignKey: 'id_vehiculo', as: 'corbatines' });
Corbatin.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' });

// 8. Reglamentos y Catálogo de Infracciones
Reglamento.hasMany(CatalogoInfraccion, { foreignKey: 'id_reglamento', as: 'infracciones' });
CatalogoInfraccion.belongsTo(Reglamento, { foreignKey: 'id_reglamento', as: 'reglamento' });

// 9. Reportes de Infracciones
Vehiculo.hasMany(ReporteInfraccion, { foreignKey: 'id_vehiculo', as: 'reportes' });
ReporteInfraccion.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' });

Corbatin.hasMany(ReporteInfraccion, { foreignKey: 'id_corbatin', as: 'reportes' });
ReporteInfraccion.belongsTo(Corbatin, { foreignKey: 'id_corbatin', as: 'corbatin' });

CatalogoInfraccion.hasMany(ReporteInfraccion, { foreignKey: 'id_infraccion', as: 'reportes' });
ReporteInfraccion.belongsTo(CatalogoInfraccion, { foreignKey: 'id_infraccion', as: 'infraccion' });

Usuario.hasMany(ReporteInfraccion, { foreignKey: 'id_usuario', as: 'reportes_creados' });
ReporteInfraccion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'agente' });

// 10. Evidencias
ReporteInfraccion.hasMany(Evidencia, { foreignKey: 'id_reporte', as: 'evidencias' });
Evidencia.belongsTo(ReporteInfraccion, { foreignKey: 'id_reporte', as: 'reporte' });
Usuario.hasMany(Evidencia, { foreignKey: 'id_usuario', as: 'evidencias_subidas' });
Evidencia.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// 11. Revisiones de Reportes
ReporteInfraccion.hasMany(RevisionReporte, { foreignKey: 'id_reporte', as: 'revisiones' });
RevisionReporte.belongsTo(ReporteInfraccion, { foreignKey: 'id_reporte', as: 'reporte' });
Usuario.hasMany(RevisionReporte, { foreignKey: 'id_usuario', as: 'revisiones_dictaminadas' });
RevisionReporte.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'supervisor' });

// 12. Sanciones
ReporteInfraccion.hasOne(Sancion, { foreignKey: 'id_reporte', as: 'sancion' });
Sancion.belongsTo(ReporteInfraccion, { foreignKey: 'id_reporte', as: 'reporte' });

Vehiculo.hasMany(Sancion, { foreignKey: 'id_vehiculo', as: 'sanciones' });
Sancion.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' });

Empresa.hasMany(Sancion, { foreignKey: 'id_empresa', as: 'sanciones' });
Sancion.belongsTo(Empresa, { foreignKey: 'id_empresa', as: 'empresa' });

ReglaReincidencia.hasMany(Sancion, { foreignKey: 'id_regla', as: 'sanciones' });
Sancion.belongsTo(ReglaReincidencia, { foreignKey: 'id_regla', as: 'regla' });

Usuario.hasMany(Sancion, { foreignKey: 'id_usuario', as: 'sanciones_autorizadas' });
Sancion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario_aprobador' });

// 13. Bitácora de Accesos
Caseta.hasMany(BitacoraAcceso, { foreignKey: 'id_caseta', as: 'accesos' });
BitacoraAcceso.belongsTo(Caseta, { foreignKey: 'id_caseta', as: 'caseta' });

Vehiculo.hasMany(BitacoraAcceso, { foreignKey: 'id_vehiculo', as: 'accesos' });
BitacoraAcceso.belongsTo(Vehiculo, { foreignKey: 'id_vehiculo', as: 'vehiculo' });

Corbatin.hasMany(BitacoraAcceso, { foreignKey: 'id_corbatin', as: 'accesos' });
BitacoraAcceso.belongsTo(Corbatin, { foreignKey: 'id_corbatin', as: 'corbatin' });

Trabajador.hasMany(BitacoraAcceso, { foreignKey: 'id_conductor', as: 'accesos' });
BitacoraAcceso.belongsTo(Trabajador, { foreignKey: 'id_conductor', as: 'conductor' });

Usuario.hasMany(BitacoraAcceso, { foreignKey: 'id_usuario', as: 'accesos_registrados' });
BitacoraAcceso.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'guardia' });

const db = {
  sequelize,
  Rol,
  Empresa,
  Usuario,
  Trabajador,
  Vehiculo,
  ConductorVehiculo,
  Reglamento,
  AceptacionReglamento,
  Corbatin,
  Caseta,
  ReglaReincidencia,
  CatalogoInfraccion,
  ReporteInfraccion,
  Evidencia,
  RevisionReporte,
  Sancion,
  BitacoraAcceso
};

module.exports = db;

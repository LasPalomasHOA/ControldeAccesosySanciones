// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE BASE DE DATOS - LAS PALOMAS HOA (17 TABLAS POSTGRESQL)
// ═══════════════════════════════════════════════════════════════════════════════

// 1. roles
export interface RolDB {
  id_rol: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

// 2. empresas
export interface EmpresaDB {
  id_empresa: number;
  razon_social: string;
  responsable_nombre: string;
  telefono: string;
  correo?: string | null;
  estatus: 'ACTIVA' | 'SUSPENDIDA' | 'RESTRINGIDA' | string;
  created_at: string;
  updated_at: string;
}

// 3. usuarios
export interface UsuarioDB {
  id_usuario: number;
  id_empresa?: number | null;
  id_rol: number;
  nombre: string;
  correo: string;
  password_hash?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Asociaciones opcionales
  rol?: RolDB;
  empresa?: EmpresaDB;
}

// 4. trabajadores
export interface TrabajadorDB {
  id_trabajador: number;
  id_empresa: number;
  nombre: string;
  apellidos: string;
  telefono?: string | null;
  foto_url?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Asociaciones opcionales
  empresa?: EmpresaDB;
}

// 5. vehiculos
export interface VehiculoDB {
  id_vehiculo: number;
  id_empresa: number;
  marca: string;
  modelo: string;
  año?: number | null; // Corregido de anio a año
  anio?: number | null; // Alias de retrocompatibilidad
  placas: string;
  color: string;
  foto_url?: string | null;
  estatus_acceso: 'HABILITADO' | 'SUSPENDIDO' | 'RESTRINGIDO' | string;
  created_at: string;
  updated_at: string;
  // Asociaciones opcionales
  empresa?: EmpresaDB;
  corbatines?: CorbatinDB[];
}

// 6. conductores_vehiculos
export interface ConductorVehiculoDB {
  id_relacion: number;
  id_vehiculo: number;
  id_trabajador: number;
  activo: boolean;
  // Asociaciones opcionales
  vehiculo?: VehiculoDB;
  trabajador?: TrabajadorDB;
}

// 7. reglamentos
export interface ReglamentoDB {
  id_reglamento: number;
  version: string;
  titulo: string;
  archivo_url: string;
  fecha_publicacion: string;
  vigente: boolean;
  created_at: string;
}

// 8. aceptaciones_reglamento
export interface AceptacionReglamentoDB {
  id_aceptacion: number;
  id_reglamento: number;
  id_empresa: number;
  id_usuario: number;
  aceptado: boolean;
  fecha_hora: string;
  firma_nombre?: string | null;
  // Asociaciones opcionales
  reglamento?: ReglamentoDB;
  empresa?: EmpresaDB;
  usuario?: UsuarioDB;
}

// 9. corbatines
export interface CorbatinDB {
  id_corbatin: number;
  id_vehiculo: number;
  numero: number;
  qr_token: string;
  fecha_emision: string;
  fecha_vencimiento?: string | null;
  estatus: 'ACTIVO' | 'VENCIDO' | 'CANCELADO' | 'REEMPLAZADO' | string;
  fecha_impresion?: string | null;
  motivo_cancelacion?: string | null;
  // Asociaciones opcionales
  vehiculo?: VehiculoDB;
}

// 10. casetas
export interface CasetaDB {
  id_caseta: number;
  nombre: string;
  descripcion?: string | null;
  activa: boolean;
}

// 11. reglas_reincidencia
export interface ReglaReincidenciaDB {
  id_regla: number;
  numero_falta: number;
  permite_acceso: boolean;
  requiere_administrador: boolean;
  mensaje_alerta: string;
  activo: boolean;
}

// 12. catalogo_infracciones
export interface CatalogoInfraccionDB {
  id_infraccion: number;
  id_reglamento: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  activo: boolean;
  // Asociaciones opcionales
  reglamento?: ReglamentoDB;
}

// 13. reportes_infracciones
export interface ReporteInfraccionDB {
  id_reporte: number;
  id_vehiculo: number;
  id_corbatin?: number | null;
  id_infraccion: number;
  id_usuario: number;
  fecha_hora: string;
  ubicacion_texto?: string | null;
  descripcion_hechos: string;
  estatus_revision: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | string;
  created_at: string;
  updated_at: string;
  // Asociaciones opcionales
  vehiculo?: VehiculoDB;
  corbatin?: CorbatinDB;
  infraccion?: CatalogoInfraccionDB;
  agente?: UsuarioDB;
  evidencias?: EvidenciaDB[];
  revisiones?: RevisionReporteDB[];
}

// 14. evidencias
export interface EvidenciaDB {
  id_evidencia: number;
  id_reporte: number;
  archivo: string;
  descripcion?: string | null;
  fecha_captura: string;
  id_usuario: number;
  hash_archivo?: string | null;
  activa: boolean;
  // Asociaciones opcionales
  reporte?: ReporteInfraccionDB;
  usuario?: UsuarioDB;
}

// 15. revisiones_reportes
export interface RevisionReporteDB {
  id_revision: number;
  id_reporte: number;
  id_usuario: number;
  decision: 'APROBADO' | 'RECHAZADO' | string;
  comentarios?: string | null;
  fecha_revision: string;
  nivel_reincidencia_aplicado?: number | null;
  // Asociaciones opcionales
  reporte?: ReporteInfraccionDB;
  supervisor?: UsuarioDB;
}

// 16. sanciones
export interface SancionDB {
  id_sancion: number;
  id_reporte: number;
  id_vehiculo: number;
  id_empresa: number;
  id_regla: number;
  numero_reincidencia: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  estatus: 'PROGRAMADA' | 'ACTIVA' | 'VENCIDA' | 'CANCELADA' | 'PERMANENTE' | string;
  motivo: string;
  id_usuario: number;
  created_at: string;
  updated_at: string;
  // Asociaciones opcionales
  reporte?: ReporteInfraccionDB;
  vehiculo?: VehiculoDB;
  empresa?: EmpresaDB;
  regla?: ReglaReincidenciaDB;
  usuario_aprobador?: UsuarioDB;
}

// 17. bitacora_accesos
export interface BitacoraAccesoDB {
  id_acceso: number;
  id_caseta: number;
  id_vehiculo: number;
  id_corbatin?: number | null;
  id_conductor?: number | null;
  id_usuario: number;
  fecha: string;
  hora_entrada?: string | null;
  hora_salida?: string | null;
  ubicacion_trabajo?: string | null;
  estatus_acceso: 'AUTORIZADO' | 'RECHAZADO' | 'PENDIENTE' | 'SALIDA' | string;
  motivo_rechazo?: string | null;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
  // Asociaciones opcionales
  caseta?: CasetaDB;
  vehiculo?: VehiculoDB;
  corbatin?: CorbatinDB;
  conductor?: TrabajadorDB;
  guardia?: UsuarioDB;
}


// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES FRONTEND (Compatibilidad con vistas existentes)
// ═══════════════════════════════════════════════════════════════════════════════

export interface Empresa {
  id: string;
  nombre: string;
  rfc: string;
  responsable: string;
  telefono: string;
  correo: string;
  estado: 'activo' | 'suspendido';
  totalTrabajadores: number;
  totalVehiculos: number;
  // Campos del schema de BD
  id_empresa?: number | string;
  razon_social?: string;
  responsable_nombre?: string;
  estatus?: string;
}

export interface Trabajador {
  id_trabajador: string | number;
  id_empresa: string | number;
  empresaNombre?: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  foto_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Campos auxiliares para compatibilidad
  id?: string;
  empresaId?: string | number;
  foto?: string;
  rol?: string;
  nss?: string;
  estado?: 'activo' | 'bloqueado' | 'pendiente';
  observaciones?: string;
}

export interface Vehiculo {
  id: string;
  id_vehiculo?: number | string;
  placa?: string;
  placas?: string;
  marca: string;
  modelo: string;
  año?: number | string; // Corregido de anio a año
  anio?: number | string; // Alias
  color: string;
  foto_url?: string;
  empresaId: string;
  empresaNombre: string;
  estadoAcceso?: 'permitido' | 'alerta_sancion' | 'bloqueado';
  estatus_acceso?: string;
  corbatinNumero?: string;
  corbatinVencimiento?: string;
  reincidencias?: number;
}

export interface Acceso {
  id: string;
  vehiculoId?: string;
  trabajadorId?: string;
  placa?: string;
  trabajadorNombre?: string;
  empresaNombre: string;
  tipo: 'entrada' | 'salida';
  fechaHora: string;
  agenteNombre: string;
  observaciones?: string;
  cabina: string;
}

export interface ReglamentoArticulo {
  id: string;
  seccion: string;
  titulo: string;
  descripcion: string;
  multaUSD: number;
}

export interface InfraccionCat {
  id: string;
  codigo: string;
  descripcion: string;
  categoria: 'seguridad' | 'velocidad' | 'ruido' | 'basura' | 'estacionamiento' | 'otro';
  multaBase: number;
}

export interface Sancion {
  id: string;
  id_sancion?: number | string;
  vehiculoId?: string;
  placa?: string;
  trabajadorId?: string;
  trabajadorNombre?: string;
  infraccionCodigo: string;
  infraccionDescripcion: string;
  gravedad?: 'leve' | 'moderada' | 'grave' | 'critica';
  estado?: 'pendiente_aprobacion' | 'activa' | 'resuelta' | 'rechazada';
  estatus?: string;
  fechaSancion?: string;
  fechaResolucion?: string;
  montoMulta?: number;
  evidenciaUrl?: string;
  comentarios?: string;
  agenteNombre?: string;
}

export interface Usuario {
  id: string;
  id_usuario?: number | string;
  nombre: string;
  correo: string;
  rol: 'admin' | 'supervisor' | 'guardia' | 'proveedor' | string;
  empresaId?: string;
  avatar?: string;
}

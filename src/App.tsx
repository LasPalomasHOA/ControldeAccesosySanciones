import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { api } from "./services/api";

// ─── SVG Icons (Clean, Modern, Vector) ────────────────────────────────────────
function IconSpinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function IconBuilding({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" /><path d="M16 6h.01" />
      <path d="M8 10h.01" /><path d="M16 10h.01" />
      <path d="M8 14h.01" /><path d="M16 14h.01" />
    </svg>
  );
}

function IconShield({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconScale({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

function IconServer({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </svg>
  );
}

function IconCar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function IconBadge({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconFileText({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function IconCheckCircle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function IconAlertTriangle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconUserPlus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

function IconLogOut({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function IconMessageSquare({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconKey({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

function IconCamera({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function IconUsers({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconEdit({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconPhone({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconUserCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

function IconUserX({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="22" y2="13" />
      <line x1="22" y1="8" x2="17" y2="13" />
    </svg>
  );
}

function IconEye({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconWalk({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="m9 20 3-6 3 6" />
      <path d="m6 8 6 2 6-2" />
      <path d="M12 10v4" />
    </svg>
  );
}

function IconFileSpreadsheet({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M8 13h2v2H8z" />
      <path d="M14 13h2v2h-2z" />
      <path d="M8 17h2v2H8z" />
      <path d="M14 17h2v2h-2z" />
    </svg>
  );
}

function IconDownload({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─── Types & Roles ────────────────────────────────────────────────────────────

type UserRole = "admin" | "supervisor" | "contratista" | "caseta";
type PortalScreen = "reglamento" | "dashboard" | "alta" | "trabajadores" | "corbatin" | "sanciones";
type SupervisorTab = "bandeja" | "apelaciones" | "proveedores" | "guardias" | "historial";
type AdminTab = "supervisores" | "auditoria";
type CasetaTab = "registro" | "bitacora";

interface Trabajador {
  id_trabajador: number | string;
  id_empresa: string;
  empresaNombre: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  foto_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}


interface UserAccount {
  id: string;
  username: string;
  password?: string;
  nombre: string;
  email: string;
  role: UserRole;
  empresaNombre?: string;
  turno?: string;
  fechaCreacion: string;
  creadoPor: string;
  hasAcceptedReglamento?: boolean;
  activo?: boolean;
  foto_url?: string;
}

interface Empresa {
  id: string;
  nombre: string;
  rfc: string;
  contacto: string;
  telefono: string;
  email: string;
  fechaRegistro: string;
  creadoPor: string;
}

interface Vehicle {
  id: string;
  empresaId: string;
  empresaNombre: string;
  marca: string;
  modelo: string;
  placas: string;
  color: string;
  conductor: string;
  telefono: string;
  año?: string;
  anio?: string;
  foto?: string;
  status: "Habilitado" | "Deshabilitado" | "Suspendido" | "Restringido";
  corbatinNum: string;
  sancionActiva?: {
    motivo: string;
    expiracion: string;
    medidaDisciplinaria: string;
  };
}

interface Sancion {
  id: string;
  vehicleId: string;
  empresaNombre: string;
  placas: string;
  tipo: string;
  fecha: string;
  medidaDisciplinaria: string;
  status: "Activa" | "En Apelación" | "Aclarada" | "Ratificada" | "Cumplida";
  descripcion: string;
  apelacion?: {
    fecha: string;
    argumentos: string;
    representante: string;
    estado: "Pendiente" | "Aprobada" | "Rechazada";
    dictamenSupervisor?: string;
    fechaDictamen?: string;
  };
}

interface RegistroCaseta {
  id: string;
  empresaNombre: string;
  vehicleId: string;
  placas: string;
  color: string;
  conductor: string;
  telefono: string;
  corbatinNum: string;
  horaEntrada: string;
  horaSalida?: string;
  trabajos: string;
  guardiaNombre: string;
  estado: "Dentro" | "Salida Registrada";
  tipoAcceso?: "Vehicular" | "Peatonal";
  observaciones?: string;
}

interface InfraccionReporte {
  id: string;
  folio: string;
  fecha: string;
  hora: string;
  agenteNombre: string;
  empresaNombre: string;
  placas: string;
  corbatinNum: string;
  infraccionCodigo: string;
  infraccionNombre: string;
  lugar: string;
  descripcion: string;
  evidencias: string[];
  gravedad: "leve" | "moderada" | "grave";
  medidaSugerida: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada" | "Desestimada";
  resolucionSupervisor?: string;
}

// ─── Initial Database ─────────────────────────────────────────────────────────

const INITIAL_USERS: UserAccount[] = [
  { id: "1", username: "admin@laspalomashoa.com", password: "123456", nombre: "Administrador de Seguridad HOA", email: "admin@laspalomashoa.com", role: "admin", fechaCreacion: "2026-01-01", creadoPor: "Sistema Raíz", activo: true },
  { id: "2", username: "supervisor@laspalomashoa.com", password: "123456", nombre: "Supervisor Operativo", email: "supervisor@laspalomashoa.com", role: "supervisor", turno: "Turno General 24/7", fechaCreacion: "2026-01-10", creadoPor: "Admin TI", activo: true },
  { id: "5", username: "proveedor@constructoraintegral.com", password: "123456", nombre: "Roberto Silva Morales", email: "proveedor@constructoraintegral.com", role: "contratista", empresaNombre: "Constructora Integral del Noroeste S.A. de C.V.", fechaCreacion: "2026-02-01", creadoPor: "Supervisor HOA", hasAcceptedReglamento: true, activo: true },
  { id: "4", username: "caseta@laspalomashoa.com", password: "123456", nombre: "Guardia Caseta Principal", email: "caseta@laspalomashoa.com", role: "caseta", turno: "Vespertino (14:00 - 22:00)", fechaCreacion: "2026-02-05", creadoPor: "Supervisor HOA", activo: true },
];

const INITIAL_EMPRESAS: Empresa[] = [];

const INITIAL_TRABAJADORES: Trabajador[] = [];
const INITIAL_VEHICLES: Vehicle[] = [];
const INITIAL_SANCIONES: Sancion[] = [];
const INITIAL_BITACORA: RegistroCaseta[] = [];
const INITIAL_INFRACCIONES_PENDIENTES: InfraccionReporte[] = [];

const REGLAMENTO_TEXT = `REGLAMENTO DE COLABORADORES EXTERNOS — LAS PALOMAS ROCKY POINT HOA

1. DISPOSICIONES GENERALES
Todo contratista, proveedor o empresa externa que opere dentro de las instalaciones de Las Palomas debe registrar sus vehículos en este portal antes de su primer acceso. El incumplimiento faculta a la administración a denegar el ingreso inmediato.

2. REGISTRO E IDENTIFICACIÓN
2.1 Cada vehículo debe portar el corbatín vigente emitido por este sistema, colocado en el espejo retrovisor interno de forma visible en todo momento.
2.2 La información registrada debe ser verídica y mantenerse actualizada. Cualquier cambio de conductor habitual debe notificarse dentro de las 48 horas siguientes.
2.3 Los vehículos sin corbatín válido o con sanciones/suspensiones activas serán detenidos en caseta y no se permitirá su ingreso hasta solventar la aclaración.

3. NORMAS DE CIRCULACIÓN Y SEGURIDAD
3.1 Límite de velocidad interior: 10 km/h en andadores y 20 km/h en vialidad perimetral.
3.2 Se prohíbe terminantemente el uso de teléfono celular al conducir dentro del predio.
3.3 Los vehículos de carga deben permanecer en las zonas de maniobra asignadas (Sótano 2).
3.4 El personal debe portar uniforme, gafete visible y Equipo de Protección Personal (EPP) obligatorio.

4. ZONAS Y HORARIOS DE TRABAJO
4.1 El acceso para labores está permitido de Lunes a Viernes de 08:00 a 18:00 hrs y Sábados de 09:00 a 14:00 hrs.
4.2 Queda estrictamente prohibido generar ruidos de impacto antes de las 09:00 hrs.
4.3 Trabajos en domingos o días inhábiles requieren autorización especial previa por escrito del comité de HOA.

5. SISTEMA DE SANCIONES DISCIPLINARIAS Y SUSPENSIONES
5.1 Las infracciones capturadas en campo por los agentes de seguridad serán validadas y dictaminadas por supervisión HOA.
5.2 1ª Infracción: Amonestación formal escrita registrada en expediente.
5.3 2ª Infracción: Suspensión de acceso vehicular al predio por 24 a 48 horas.
5.4 3ª Infracción: Suspensión de acceso vehicular por 1 semana.
5.5 Falta Grave o Reincidencia: Suspensión por 1 mes o restricción definitiva del colaborador/unidad.
5.6 Las sanciones activas bloquean de forma automática e inmediata la pluma de acceso en el sistema de casetas. No existen multas económicas, únicamente medidas disciplinarias y de suspensión.

6. DERECHO DE APELACIÓN Y ACLARACIÓN
El representante acreditado de la empresa contratista cuenta con el derecho reglamentario de interponer recurso de apelación y aclaración formal ante la Supervisión HOA para su resolución en un plazo no mayor a 24 horas.

7. RESPONSABILIDADES CIVILES
La empresa contratista asume plena responsabilidad civil y solidaria por los daños o percances que sus colaboradores o unidades vehiculares ocasionen a la infraestructura o áreas comunes de Las Palomas.`;

const IMG_AERIAL = "https://images.unsplash.com/photo-1785300674532-87efce12b5ee?w=1600&h=600&fit=crop&auto=format";
const IMG_GATE = "https://images.unsplash.com/photo-1775112077888-8fa36e9bbc51?w=1600&h=600&fit=crop&auto=format";
const IMG_PARK = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1600&h=600&fit=crop&auto=format";
const IMG_COAST = "https://images.unsplash.com/photo-1785300550144-6fc8db9cbb95?w=1600&h=600&fit=crop&auto=format";

// ─── Repaired & Uncropped Logo SVG ───────────────────────────────────────────

function LPLogo({ size = 160, light = false }: { size?: number; light?: boolean }) {
  const textColor = light ? "#ffffff" : "#0D6E5F";
  const subColor = light ? "rgba(255,255,255,0.85)" : "#64748B";
  const scale = size / 160;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: `${10 * scale}px` }}>
      <svg
        width={46 * scale}
        height={38 * scale}
        viewBox="0 0 85 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <path d="M6 24 Q18 6 30 20 Q42 34 54 18 Q66 2 78 16" stroke="#DC2626" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        <path d="M6 38 Q18 20 30 34 Q42 48 54 32 Q66 16 78 30" stroke="#D97706" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        <path d="M6 52 Q18 34 30 48 Q42 62 54 46 Q66 30 78 44" stroke="#059669" strokeWidth="6.5" strokeLinecap="round" fill="none" />
      </svg>
      <div style={{ textAlign: "left", lineHeight: "1.15" }}>
        <div style={{ fontFamily: "Georgia, serif", fontWeight: "bold", fontSize: `${18 * scale}px`, color: textColor, letterSpacing: "0.2px" }}>
          Las Palomas
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: `${10.5 * scale}px`, color: subColor, marginTop: `${2 * scale}px`, letterSpacing: "0.2px" }}>
          Rocky Point HOA, A.C.
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Habilitado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Deshabilitado: "bg-slate-100 text-slate-600 border-slate-300",
    Suspendido: "bg-red-50 text-red-700 border-red-200",
    Restringido: "bg-amber-50 text-amber-700 border-amber-200",
    Activa: "bg-red-50 text-red-700 border-red-200",
    "En Apelación": "bg-sky-50 text-sky-700 border-sky-200",
    Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
    Cumplida: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Aclarada: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Ratificada: "bg-red-50 text-red-800 border-red-200",
    Aprobada: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rechazada: "bg-slate-100 text-slate-600 border-slate-200",
    Dentro: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Salida Registrada": "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
      style={{ fontFamily: "var(--font-mono)" }}>
      {status}
    </span>
  );
}

function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.28);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Silencioso si el navegador restringe el audio antes de interacción
  }
}

function normalizeFotoUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/uploads/")) {
    return trimmed;
  }
  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }
  return `/uploads/${trimmed}`;
}

// ─── Page Hero Banner ─────────────────────────────────────────────────────────

function PageHero({ img, title, subtitle, children }: { img: string; title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden no-print" style={{ minHeight: "150px" }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${img})`, filter: "blur(2px) brightness(0.55)", transform: "scale(1.06)" }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,110,95,0.90) 0%, rgba(13,110,95,0.65) 60%, rgba(0,0,0,0.50) 100%)" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
          {title}
        </h1>
        <p className="mt-1.5 text-sm sm:text-base text-white/90">{subtitle}</p>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

// ─── Real, Valid, Camera-Scannable QR Code ────────────────────────────────────

function RealQRCode({ value, size = 135 }: { value: string; size?: number }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(
      value,
      {
        width: size * 3,
        margin: 1,
        errorCorrectionLevel: "M",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [value, size]);

  if (!qrDataUrl) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: "#f1f5f9",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          color: "#94a3b8",
        }}
      >
        Cargando QR...
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="Código QR Oficial"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "block",
        imageRendering: "pixelated",
      }}
    />
  );
}

// ─── Printable Corbatin Document (50% / 50% Symmetry) ─────────────────────────

function CorbatinDocument({ vehicle }: { vehicle: Vehicle }) {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  // Optimized compact payload for clean, large, high-contrast QR dots
  const qrPayload = `LP-HOA|CORB:${vehicle.corbatinNum}|PLACAS:${vehicle.placas}|VIG:${currentYear}-${nextYear}`;

  const sections = [
    { title: "1. INGRESO", items: ["Registrar: corbatín, compañía, vehículo, placas, nombre y celular.", "Indicar área de trabajo y horario.", "Portar uniforme, gafete visible y EPP obligatorio."] },
    { title: "2. ÁREA DE TRABAJO", items: ["Permanecer solo en el área asignada.", "Usar señalización de seguridad (conos, cintas).", "Uso obligatorio de EPP (incluye arnés en altura).", "Consumir alimentos solo en áreas designadas.", "No usar elevadores de huéspedes."] },
    { title: "3. VEHÍCULOS", items: ["Altura máxima: 2.40 m.", "Estacionarse solo en áreas autorizadas (Sótano 2).", "Colocar corbatín visible en el retrovisor o tablero."] },
    { title: "4. PROHIBICIONES", items: ['No tirar escombro en "Trash Chute".', "No dejar materiales en áreas comunes.", "No usar bocinas ni generar ruido excesivo.", "No dormir en áreas comunes."] },
    { title: "5. SANCIONES DISCIPLINARIAS", items: ["1ª: Amonestación escrita", "2ª: Suspensión de 24 a 48 hrs", "3ª: Suspensión de 1 semana", "Reincidencia: Restricción definitiva"] },
    { title: "6. HORARIOS", items: ["Lunes a viernes: 08:00 a 18:00 hrs", "Sábado: 09:00 a 14:00 hrs", "No generar ruido antes de 09:00 hrs", "Horarios especiales requieren autorización HOA."] },
  ];

  return (
    <div
      id="corbatin-printable"
      style={{
        width: "760px",
        background: "#ffffff",
        border: "2.5px solid #000000",
        fontFamily: "Arial, Helvetica, sans-serif",
        boxShadow: "0 8px 36px rgba(0,0,0,0.14)",
        borderRadius: "4px",
        overflow: "hidden",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", margin: 0, padding: 0 }}>
        <tbody>
          <tr>
            {/* LEFT FRONT — EXACT 380px (50% WIDTH) */}
            <td
              style={{
                width: "380px",
                verticalAlign: "top",
                borderRight: "2px dashed #444444",
                padding: "16px 14px",
                textAlign: "center",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            >
              <div style={{ textAlign: "center", width: "100%" }}>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#000000", textAlign: "center", letterSpacing: "0.5px" }}>
                  CONTRATISTA
                </div>
                <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", height: "4px", margin: "5px auto", width: "100%" }} />
                <div style={{ padding: "4px 0", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <LPLogo size={150} />
                </div>
                <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", height: "4px", margin: "5px auto", width: "100%" }} />
                <div style={{ fontSize: "64px", fontWeight: "bold", color: "#000000", lineHeight: "1", textAlign: "center", width: "100%", padding: "2px 0" }}>
                  {vehicle.corbatinNum}
                </div>
                <div style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000", height: "4px", margin: "5px auto", width: "100%" }} />
              </div>

              <div style={{ textAlign: "center", fontSize: "11px", color: "#222222", lineHeight: "1.35", padding: "4px 0" }}>
                <div style={{ fontWeight: "bold", fontSize: "12px", color: "#000" }}>{vehicle.marca} {vehicle.modelo} ({vehicle.anio})</div>
                <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "bold", color: "#000", letterSpacing: "1px", margin: "1px 0" }}>{vehicle.placas}</div>
                <div style={{ color: "#444444" }}>{vehicle.conductor}</div>
                <div style={{ color: "#0D6E5F", fontWeight: "bold", fontSize: "12px" }}>{vehicle.empresaNombre}</div>
              </div>

              {/* PROMINENT, LARGE, SCANNABLE QR CODE */}
              <div style={{ borderTop: "1px dashed #aaaaaa", paddingTop: "6px", marginTop: "4px", textAlign: "center" }}>
                <div style={{ display: "inline-block", background: "#ffffff", padding: "5px", border: "2px solid #000000", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                  <RealQRCode value={qrPayload} size={125} />
                </div>
                <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#0D6E5F", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  VIGENCIA: 1 AÑO ({currentYear} – {nextYear})
                </div>
                <div style={{ fontSize: "9px", fontWeight: "bold", color: "#000000", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.25" }}>
                  POR FAVOR DE COLOCAR<br />EN EL RETROVISOR
                </div>
              </div>
            </td>

            {/* RIGHT REVERSE — EXACT 380px (50% WIDTH) */}
            <td
              style={{
                width: "380px",
                verticalAlign: "top",
                padding: "16px 16px 12px",
                textAlign: "left",
                background: "#ffffff",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: "900", textAlign: "center", marginBottom: "10px", color: "#000000", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Reglamento para externos en áreas comunes:
                </div>
                {sections.map((sec) => (
                  <div key={sec.title} style={{ marginBottom: "7px" }}>
                    <div style={{ fontSize: "10.5px", fontWeight: "bold", color: "#000000", marginBottom: "1.5px" }}>{sec.title}</div>
                    <ul style={{ margin: 0, paddingLeft: "15px", listStyleType: "disc" }}>
                      {sec.items.map((item, i) => (
                        <li key={i} style={{ fontSize: "9.5px", color: "#222222", lineHeight: "1.4", marginBottom: "1.5px" }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #cccccc", paddingTop: "8px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8.5px", color: "#555555" }}>
                <span>Las Palomas Rocky Point HOA, A.C.</span>
                <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>Corbatín #{vehicle.corbatinNum} · {vehicle.placas} · Vigencia 1 Año ({currentYear}–{nextYear})</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function IconX({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconInfo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// ─── Toast Notifications System ───────────────────────────────────────────────

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: number;
}

function ToastContainer({ toasts, onClose }: { toasts: ToastNotification[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isWarning = toast.type === "warning";
        const isInfo = toast.type === "info";

        return (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md border p-4 shadow-2xl transition-all ${
              isSuccess
                ? "border-emerald-200 shadow-emerald-950/15"
                : isError
                ? "border-red-200 shadow-red-950/15"
                : isWarning
                ? "border-amber-200 shadow-amber-950/15"
                : "border-sky-200 shadow-sky-950/15"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isSuccess
                    ? "bg-emerald-100 text-emerald-700"
                    : isError
                    ? "bg-red-100 text-red-700"
                    : isWarning
                    ? "bg-amber-100 text-amber-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {isSuccess && <IconCheckCircle className="w-5 h-5" />}
                {isError && <IconAlertTriangle className="w-5 h-5" />}
                {isWarning && <IconAlertTriangle className="w-5 h-5" />}
                {isInfo && <IconInfo className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isSuccess
                      ? "text-emerald-800"
                      : isError
                      ? "text-red-800"
                      : isWarning
                      ? "text-amber-800"
                      : "text-sky-800"
                  }`}
                >
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed break-words font-medium">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onClose(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Cerrar notificación"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
              <div
                className={`toast-progress-bar h-full ${
                  isSuccess
                    ? "bg-emerald-500"
                    : isError
                    ? "bg-red-500"
                    : isWarning
                    ? "bg-amber-500"
                    : "bg-sky-500"
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Application Component ───────────────────────────────────────────────

export default function App() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success", title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const defaultTitle =
      type === "success"
        ? "Operación Exitosa"
        : type === "error"
        ? "Error del Sistema"
        : type === "warning"
        ? "Atención Requerida"
        : "Notificación";
    const newToast: ToastNotification = {
      id,
      title: title || defaultTitle,
      message,
      type,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [adminTab, setAdminTab] = useState<AdminTab>("supervisores");
  const [supervisorTab, setSupervisorTab] = useState<SupervisorTab>("bandeja");
  const [portalScreen, setPortalScreen] = useState<PortalScreen>("dashboard");
  const [casetaTab, setCasetaTab] = useState<CasetaTab>("registro");



  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [empresas, setEmpresas] = useState<Empresa[]>(INITIAL_EMPRESAS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [sanciones, setSanciones] = useState<Sancion[]>(INITIAL_SANCIONES);
  const [bitacora, setBitacora] = useState<RegistroCaseta[]>(INITIAL_BITACORA);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>(INITIAL_TRABAJADORES);

  // Modals & Form State para Trabajadores
  const [showCreateTrabajadorModal, setShowCreateTrabajadorModal] = useState(false);
  const [selectedTrabajadorParaEditar, setSelectedTrabajadorParaEditar] = useState<Trabajador | null>(null);
  const [selectedTrabajadorParaEliminar, setSelectedTrabajadorParaEliminar] = useState<Trabajador | null>(null);
  const [selectedSupervisorParaEliminar, setSelectedSupervisorParaEliminar] = useState<UserAccount | null>(null);
  const [selectedFotoTrabajadorPreview, setSelectedFotoTrabajadorPreview] = useState<Trabajador | null>(null);

  const [infraccionesPendientes, setInfraccionesPendientes] = useState<InfraccionReporte[]>(INITIAL_INFRACCIONES_PENDIENTES);

  const [trabajadorNombre, setTrabajadorNombre] = useState("");
  const [trabajadorApellidos, setTrabajadorApellidos] = useState("");
  const [trabajadorTelefono, setTrabajadorTelefono] = useState("");
  const [trabajadorFotoUrl, setTrabajadorFotoUrl] = useState("");
  const [trabajadorActivo, setTrabajadorActivo] = useState(true);
  const [trabajadorFormError, setTrabajadorFormError] = useState("");

  const [trabajadorSearchTerm, setTrabajadorSearchTerm] = useState("");
  const [trabajadorStatusFilter, setTrabajadorStatusFilter] = useState<"todos" | "activos" | "inactivos">("todos");

  // PDF Generation State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Modals
  const [showCreateSupervisorModal, setShowCreateSupervisorModal] = useState(false);
  const [showCreateEmpresaModal, setShowCreateEmpresaModal] = useState(false);
  const [showCreateGuardiaModal, setShowCreateGuardiaModal] = useState(false);
  const [selectedSancionParaApelar, setSelectedSancionParaApelar] = useState<Sancion | null>(null);
  const [apelacionArgumentos, setApelacionArgumentos] = useState("");

  // Password Modification Modal for Admin TI
  const [selectedUserParaPassword, setSelectedUserParaPassword] = useState<UserAccount | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [passwordModalError, setPasswordModalError] = useState("");

  // New Vehicle Photo State
  const [nuevoVehiculoFoto, setNuevoVehiculoFoto] = useState<string>("");
  const [nuevoVehiculoFotoError, setNuevoVehiculoFotoError] = useState<string>("");

  // New Guardia Photo State
  const [nuevoGuardiaFoto, setNuevoGuardiaFoto] = useState<string>("");
  const [nuevoGuardiaFotoError, setNuevoGuardiaFotoError] = useState<string>("");
  const [selectedFotoGuardiaPreview, setSelectedFotoGuardiaPreview] = useState<UserAccount | null>(null);

  // ─── Estados y Refs de Bloqueo para Prevención de Doble Clic y Envíos Duplicados ───
  const [isSubmittingTrabajador, setIsSubmittingTrabajador] = useState(false);
  const isSubmittingTrabajadorRef = useRef(false);

  const [isSubmittingTrabajadorEdit, setIsSubmittingTrabajadorEdit] = useState(false);
  const isSubmittingTrabajadorEditRef = useRef(false);

  const [isDeletingTrabajador, setIsDeletingTrabajador] = useState(false);
  const isDeletingTrabajadorRef = useRef(false);

  const [isDeletingSupervisor, setIsDeletingSupervisor] = useState(false);
  const isDeletingSupervisorRef = useRef(false);

  const [isSubmittingVehiculo, setIsSubmittingVehiculo] = useState(false);
  const isSubmittingVehiculoRef = useRef(false);

  const [isSubmittingEntrada, setIsSubmittingEntrada] = useState(false);
  const isSubmittingEntradaRef = useRef(false);

  const [isSubmittingEmpresa, setIsSubmittingEmpresa] = useState(false);
  const isSubmittingEmpresaRef = useRef(false);

  const [isSubmittingSupervisor, setIsSubmittingSupervisor] = useState(false);
  const isSubmittingSupervisorRef = useRef(false);

  const [isSubmittingGuardia, setIsSubmittingGuardia] = useState(false);
  const isSubmittingGuardiaRef = useRef(false);

  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const isSubmittingPasswordRef = useRef(false);

  const [isSubmittingApelacion, setIsSubmittingApelacion] = useState(false);
  const isSubmittingApelacionRef = useRef(false);

  const [isSubmittingReglamento, setIsSubmittingReglamento] = useState(false);
  const isSubmittingReglamentoRef = useRef(false);

  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const isSubmittingLoginRef = useRef(false);

  const [togglingTrabajadorIds, setTogglingTrabajadorIds] = useState<Record<string | number, boolean>>({});
  const [togglingVehiculoIds, setTogglingVehiculoIds] = useState<Record<string | number, boolean>>({});
  const [togglingUserIds, setTogglingUserIds] = useState<Record<string | number, boolean>>({});
  const togglingUserIdsRef = useRef<Record<string | number, boolean>>({});
  const [marcandoSalidaIds, setMarcandoSalidaIds] = useState<Record<string | number, boolean>>({});
  const [resolvingInfraccionIds, setResolvingInfraccionIds] = useState<Record<string | number, boolean>>({});
  const [resolvingSancionIds, setResolvingSancionIds] = useState<Record<string | number, boolean>>({});

  // Caseta Registration Form States
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("EMP-01");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedCorbatinVehicleId, setSelectedCorbatinVehicleId] = useState<string>("");
  const [casetaModoAcceso, setCasetaModoAcceso] = useState<"vehicular" | "peatonal">("vehicular");
  const [casetaPeatonalTrabajadorId, setCasetaPeatonalTrabajadorId] = useState<string>("");
  const [casetaPeatonalNombre, setCasetaPeatonalNombre] = useState("");
  const [casetaPeatonalTelefono, setCasetaPeatonalTelefono] = useState("");
  const [casetaPeatonalObservaciones, setCasetaPeatonalObservaciones] = useState("");
  const [casetaCorbatin, setCasetaCorbatin] = useState("");
  const [casetaHoraEntrada, setCasetaHoraEntrada] = useState("");
  const [casetaHoraSalida, setCasetaHoraSalida] = useState("");
  const [casetaTrabajos, setCasetaTrabajos] = useState("");
  const [casetaOverrideActive, setCasetaOverrideActive] = useState(false);
  const [casetaSuccessMsg, setCasetaSuccessMsg] = useState(false);

  const currentEmpresa = empresas.find((e) => e.id === selectedEmpresaId) || empresas[0];
  const empresaVehicles = vehicles.filter((v) => v.empresaId === selectedEmpresaId && v.status === "Habilitado");
  const currentCasetaVehicle = empresaVehicles.find((v) => v.id === selectedVehicleId) || (empresaVehicles.length > 0 ? empresaVehicles[0] : undefined);
  const empresaTrabajadores = trabajadores.filter((t) => t.id_empresa === selectedEmpresaId || t.empresaNombre === currentEmpresa?.nombre);
  const currentTrabajadorPeatonal = empresaTrabajadores.find((t) => String(t.id_trabajador) === String(casetaPeatonalTrabajadorId));

  useEffect(() => {
    if (empresaVehicles.length > 0 && (!selectedVehicleId || !empresaVehicles.some((v) => v.id === selectedVehicleId))) {
      const first = empresaVehicles[0];
      setSelectedVehicleId(first.id);
      setCasetaCorbatin(first.corbatinNum);
    } else if (empresaVehicles.length === 0) {
      setSelectedVehicleId("");
      setCasetaCorbatin("");
    }
  }, [selectedEmpresaId, vehicles]);

  useEffect(() => {
    if (currentCasetaVehicle) {
      setCasetaCorbatin(currentCasetaVehicle.corbatinNum);
    }
  }, [selectedVehicleId, currentCasetaVehicle]);

  useEffect(() => {
    if (currentTrabajadorPeatonal) {
      setCasetaPeatonalNombre(`${currentTrabajadorPeatonal.nombre} ${currentTrabajadorPeatonal.apellidos}`);
      setCasetaPeatonalTelefono(currentTrabajadorPeatonal.telefono || "");
    }
  }, [casetaPeatonalTrabajadorId]);

  // Cargar datos en vivo desde PostgreSQL
  const loadDatabaseData = async () => {
    try {
      const [resUsers, resEmpresas, resVehicles, resTrabajadores, resSanciones, resBitacora, resReportes] = await Promise.allSettled([
        api.getUsuarios(),
        api.getEmpresas(),
        api.getVehiculos(),
        api.getTrabajadores(),
        api.getSanciones(),
        api.getBitacora(),
        api.getReportes(),
      ]);

      if (resUsers.status === "fulfilled" && Array.isArray(resUsers.value)) {
        const mappedUsers: UserAccount[] = resUsers.value.map((u: any) => ({
          id: String(u.id_usuario || u.id),
          username: u.correo,
          nombre: u.nombre,
          email: u.correo,
          role: (u.rol === "admin" ? "admin" : (u.rol === "supervisor" ? "supervisor" : (u.rol === "proveedor" ? "contratista" : "caseta"))) as UserRole,
          empresaNombre: u.empresaNombre || "",
          fechaCreacion: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : "2026-01-01",
          creadoPor: "Administrador de Seguridad HOA",
          hasAcceptedReglamento: true,
          activo: u.activo !== false,
          foto_url: u.foto_url || u.avatar || "",
        }));
        setUsers(mappedUsers);
      }

      if (resEmpresas.status === "fulfilled" && Array.isArray(resEmpresas.value)) {
        const mappedEmp: Empresa[] = resEmpresas.value.map((e: any) => ({
          id: String(e.id_empresa || e.id),
          nombre: e.razon_social || e.nombre,
          rfc: e.rfc || "XAXX010101000",
          contacto: e.responsable_nombre || e.responsable || "Contacto Principal",
          telefono: e.telefono || "",
          email: e.correo || "",
          fechaRegistro: e.created_at ? new Date(e.created_at).toISOString().split("T")[0] : "2026-02-01",
          creadoPor: "Supervisor HOA",
        }));
        setEmpresas(mappedEmp);
      }

      if (resVehicles.status === "fulfilled" && Array.isArray(resVehicles.value)) {
        const empList = resEmpresas.status === "fulfilled" && Array.isArray(resEmpresas.value) ? resEmpresas.value : [];
        const mappedVeh: Vehicle[] = resVehicles.value.map((v: any) => {
          const empMatch = empList.find((e: any) => String(e.id_empresa || e.id) === String(v.id_empresa || v.empresaId));
          return {
            id: String(v.id_vehiculo || v.id),
            empresaId: String(v.id_empresa || v.empresaId),
            empresaNombre: v.empresaNombre || v.empresa?.razon_social || empMatch?.razon_social || empMatch?.nombre || "",
            marca: v.marca,
            modelo: v.modelo,
            año: String(v.año || v.anio || ""),
            anio: String(v.año || v.anio || ""),
            placas: v.placas || v.placa,
            color: v.color,
            conductor: v.conductor || "",
            telefono: v.empresa?.telefono || empMatch?.telefono || v.telefono || "",
            foto: normalizeFotoUrl(v.foto_url || v.foto),
            status: (v.estatus_acceso === "HABILITADO" ? "Habilitado" : (v.estatus_acceso === "DESHABILITADO" ? "Deshabilitado" : (v.estatus_acceso === "SUSPENDIDO" ? "Suspendido" : "Restringido"))) as "Habilitado" | "Deshabilitado" | "Suspendido" | "Restringido",
            corbatinNum: v.corbatinNumero || "101",
          };
        });
        setVehicles(mappedVeh);
      }

      if (resTrabajadores.status === "fulfilled" && Array.isArray(resTrabajadores.value)) {
        const empList = resEmpresas.status === "fulfilled" && Array.isArray(resEmpresas.value) ? resEmpresas.value : [];
        const mappedTrab: Trabajador[] = resTrabajadores.value.map((t: any) => {
          const empMatch = empList.find((e: any) => String(e.id_empresa || e.id) === String(t.id_empresa));
          return {
            id_trabajador: t.id_trabajador || t.id,
            id_empresa: String(t.id_empresa),
            empresaNombre: t.empresaNombre || t.empresa?.razon_social || empMatch?.razon_social || empMatch?.nombre || "",
            nombre: t.nombre,
            apellidos: t.apellidos,
            telefono: t.telefono,
            foto_url: t.foto_url,
            activo: t.activo !== false,
            created_at: t.created_at || new Date().toISOString(),
            updated_at: t.updated_at || new Date().toISOString(),
          };
        });
        setTrabajadores(mappedTrab);
      }

      if (resSanciones.status === "fulfilled" && Array.isArray(resSanciones.value)) {
        const cleanRawText = (text: string) => {
          if (!text) return "";
          return text
            .replace(/\[APELACION_DATA\].*?\[\/APELACION_DATA\]/gs, "")
            .replace(/\[DICTAMEN_DATA\].*?\[\/DICTAMEN_DATA\]/gs, "")
            .trim();
        };

        const mappedSanciones: Sancion[] = resSanciones.value.map((s: any) => {
          const descClean = cleanRawText(s.descripcion || s.motivo || "");
          const tipoInf = s.tipo || s.infraccionDescripcion || s.reporte?.infraccion?.nombre || "Infracción al Reglamento";
          const medidaLimpia = cleanRawText(s.medidaDisciplinaria || s.regla?.mensaje_alerta || `Sanción Nivel ${s.numero_reincidencia || 1}`);

          return {
            id: String(s.id_sancion || s.id),
            vehicleId: String(s.id_vehiculo || s.vehicleId || ""),
            empresaNombre: s.empresaNombre || s.empresa?.razon_social || "",
            placas: s.placas || s.placa || s.vehiculo?.placas || "",
            tipo: tipoInf,
            fecha: s.fecha_inicio ? s.fecha_inicio.split("T")[0] : (s.fecha || new Date().toISOString().split("T")[0]),
            medidaDisciplinaria: medidaLimpia,
            status: (s.status as any) || (s.estatus === "EN_APELACION" ? "En Apelación" : (s.estatus === "CANCELADA" || s.estatus === "ACLARADA" ? "Aclarada" : (s.estatus === "RATIFICADA" ? "Ratificada" : (s.estatus === "VENCIDA" ? "Cumplida" : "Activa")))),
            descripcion: descClean || "Infracción detectada en campo y documentada por seguridad",
            apelacion: s.apelacion || undefined,
          };
        });
        setSanciones(mappedSanciones);
      }

      if (resBitacora.status === "fulfilled" && Array.isArray(resBitacora.value)) {
        const mappedBit: RegistroCaseta[] = resBitacora.value.map((b: any) => ({
          id: String(b.id_acceso || b.id),
          empresaNombre: b.empresaNombre || b.vehiculo?.empresa?.razon_social || "",
          vehicleId: String(b.id_vehiculo || ""),
          placas: b.placas || b.vehiculo?.placas || "PEATONAL",
          color: b.vehiculo?.color || "N/A",
          conductor: b.conductor || "",
          telefono: b.vehiculo?.empresa?.telefono || "",
          corbatinNum: b.corbatinNumero || "—",
          horaEntrada: b.hora_entrada || "00:00 hrs",
          horaSalida: b.hora_salida || undefined,
          trabajos: b.ubicacion_trabajo || b.observaciones || "Acceso regular",
          guardiaNombre: b.guardiaNombre || "Oficial de Turno",
          estado: b.hora_salida ? "Salida Registrada" : "Dentro",
          tipoAcceso: (b.tipo || (b.id_vehiculo ? "Vehicular" : "Peatonal")) as "Vehicular" | "Peatonal",
          observaciones: b.observaciones || undefined
        }));
        setBitacora(mappedBit);
      }

      if (resReportes.status === "fulfilled" && Array.isArray(resReportes.value)) {
        const mappedInf: InfraccionReporte[] = resReportes.value.map((r: any) => ({
          id: String(r.id_reporte || r.id),
          folio: `FOL-${r.id_reporte}`,
          fecha: r.fecha_hora ? r.fecha_hora.split("T")[0] : new Date().toISOString().split("T")[0],
          hora: r.fecha_hora ? r.fecha_hora.split("T")[1]?.substring(0, 5) : "12:00",
          agenteNombre: r.guardia_reporta?.nombre || "Guardia en Caseta",
          empresaNombre: r.vehiculo?.empresa?.razon_social || "",
          placas: r.vehiculo?.placas || "",
          corbatinNum: "101",
          infraccionCodigo: r.infraccion?.codigo || "INF-01",
          infraccionNombre: r.infraccion?.nombre || "Falta al reglamento",
          lugar: r.ubicacion_texto || "Vialidad interna",
          descripcion: r.descripcion_hechos || "",
          evidencias: r.evidencias?.map((e: any) => e.archivo) || [],
          gravedad: (r.infraccion?.gravedad?.toLowerCase() === "grave" ? "grave" : (r.infraccion?.gravedad?.toLowerCase() === "leve" ? "leve" : "moderada")) as "leve" | "moderada" | "grave",
          medidaSugerida: "Revisión por comité de supervisión",
          estado: (r.estatus_revision === "PENDIENTE" ? "Pendiente" : (r.estatus_revision === "APROBADO" ? "Aprobada" : (r.estatus_revision === "RECHAZADO" ? "Rechazada" : "Desestimada"))) as "Pendiente" | "Aprobada" | "Rechazada" | "Desestimada"
        }));
        setInfraccionesPendientes(mappedInf);
      }
    } catch (err) {
      console.warn("Error cargando base de datos:", err);
    }
  };

  useEffect(() => {
    // 1. Carga inicial de base de datos
    loadDatabaseData();

    // 2. Conexión a canal Server-Sent Events (SSE) para sincronización en tiempo real
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/reportes/stream");
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "NUEVO_REPORTE") {
            loadDatabaseData();
            playNotificationChime();
            showToast(
              `🚨 Nueva infracción registrada en campo — Folio: FOL-${payload.data?.id_reporte || ""}`,
              "warning",
              "Infracción Detectada en Tiempo Real"
            );
          } else if (payload.type === "REPORTE_DICTAMINADO" || payload.type === "NUEVA_APELACION" || payload.type === "SANCION_DICTAMINADA") {
            loadDatabaseData();
          }
        } catch (e) {
          // Ignorar pings de keepalive
        }
      };
    } catch (sseErr) {
      console.warn("Aviso: SSE no activo, utilizando sondeo continuo:", sseErr);
    }

    // 3. Sondeo continuo en segundo plano (cada 3.5s) para reflejar cambios de inmediato
    const livePollingInterval = setInterval(() => {
      loadDatabaseData();
    }, 3500);

    // 4. Sincronización inmediata cuando el supervisor cambia o regresa a la pestaña
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === "visible") {
        loadDatabaseData();
      }
    };

    window.addEventListener("focus", handleFocusOrVisibility);
    document.addEventListener("visibilitychange", handleFocusOrVisibility);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(livePollingInterval);
      window.removeEventListener("focus", handleFocusOrVisibility);
      document.removeEventListener("visibilitychange", handleFocusOrVisibility);
    };
  }, []);

  const setHoraActual = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} hrs`;
    setCasetaHoraEntrada(timeStr);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError("");

    const inputEmail = loginUsername.trim().toLowerCase();
    const inputPass = loginPassword.trim();

    if (!inputEmail) {
      setLoginError("Por favor ingresa tu correo electrónico institucional.");
      return;
    }
    if (!inputPass) {
      setLoginError("Por favor ingresa tu contraseña.");
      return;
    }

    try {
      // 1. Autenticación directa contra la base de datos PostgreSQL
      const response = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: inputEmail, password: inputPass }),
      });

      if (response.ok) {
        const data = await response.json();
        const roleMapped: UserRole = 
          data.rol === "admin" ? "admin" :
          data.rol === "supervisor" ? "supervisor" :
          data.rol === "proveedor" ? "contratista" : "caseta";

        const loggedUser: UserAccount = {
          id: String(data.id || data.id_usuario),
          username: data.correo,
          nombre: data.nombre,
          email: data.correo,
          role: roleMapped,
          empresaNombre: data.empresaNombre || "",
          fechaCreacion: data.created_at || "2026-01-01",
          creadoPor: "PostgreSQL Database",
          hasAcceptedReglamento: true,
        };

        setCurrentUser(loggedUser);
        if (roleMapped === "contratista" && !loggedUser.hasAcceptedReglamento) {
          setPortalScreen("reglamento");
        } else {
          setPortalScreen("dashboard");
        }
        return;
      }
    } catch (apiErr) {
      console.warn("API de login no disponible, usando validación local:", apiErr);
    }

    // 2. Fallback de usuarios locales por correo electrónico
    const found = users.find(
      (u) => u.email?.toLowerCase() === inputEmail || u.username?.toLowerCase() === inputEmail
    );

    if (found) {
      if (found.password && inputPass && found.password !== inputPass && inputPass !== "123456") {
        setLoginError("Contraseña incorrecta. Por favor verifica tu clave (123456).");
        return;
      }
      setCurrentUser(found);
      if (found.role === "contratista" && !found.hasAcceptedReglamento) {
        setPortalScreen("reglamento");
      } else {
        setPortalScreen("dashboard");
      }
    } else {
      setLoginError("Correo electrónico no registrado en el sistema. Verifica tus credenciales.");
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const roleEmailMap: Record<UserRole, string> = {
      admin: "admin@laspalomashoa.com",
      supervisor: "supervisor@laspalomashoa.com",
      contratista: "proveedor@constructoraintegral.com",
      caseta: "caseta@laspalomashoa.com",
    };

    const targetEmail = roleEmailMap[role];
    const found = users.find((u) => u.email?.toLowerCase() === targetEmail || u.role === role);
    if (found) {
      setCurrentUser(found);
      setLoginError("");
      if (found.role === "contratista" && !found.hasAcceptedReglamento) {
        setPortalScreen("reglamento");
      } else {
        setPortalScreen("dashboard");
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
  };

  // Helper function to render authentic colorful logo to PNG for PDF embedding
  const getLogoImageForPDF = (): Promise<string> => {
    return new Promise((resolve) => {
      const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="96" viewBox="0 0 300 96">
        <path d="M6 36 Q18 16 30 32 Q42 48 54 30 Q66 12 78 28" stroke="#DC2626" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M6 52 Q18 32 30 48 Q42 64 54 46 Q66 28 78 44" stroke="#D97706" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M6 68 Q18 48 30 64 Q42 80 54 62 Q66 44 78 60" stroke="#059669" stroke-width="7" stroke-linecap="round" fill="none"/>
        <text x="96" y="46" font-family="Georgia, serif" font-weight="bold" font-size="24" fill="#0D6E5F">Las Palomas</text>
        <text x="96" y="68" font-family="Georgia, serif" font-size="12" fill="#64748B">Rocky Point HOA, A.C.</text>
      </svg>`;

      const img = new Image();
      const svgBlob = new Blob([logoSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 192;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 600, 192);
          resolve(canvas.toDataURL("image/png"));
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve("");
      };
      img.src = url;
    });
  };

  // Native Vector High-Resolution PDF Generator (Mathematically Centered, Exact Branding)
  const handleDescargarPDFDirecto = async (veh: Vehicle) => {
    try {
      setIsGeneratingPDF(true);

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const qrPayload = `LP-HOA|CORB:${veh.corbatinNum}|PLACAS:${veh.placas}|VIG:${currentYear}-${nextYear}`;

      // Generate high-resolution scannable QR Code and authentic logo
      const [qrDataUrl, logoDataUrl] = await Promise.all([
        QRCode.toDataURL(qrPayload, {
          width: 500,
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#000000", light: "#ffffff" },
        }),
        getLogoImageForPDF(),
      ]);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4", // 297 x 210 mm
      });

      const cardW = 260; // 26.0 cm total width
      const cardH = 175; // 17.5 cm total height
      const startX = (297 - cardW) / 2; // 18.5 mm
      const startY = (210 - cardH) / 2; // 17.5 mm
      const colW = cardW / 2; // 130 mm (exact 50% width)
      const midX = startX + colW; // center fold line (148.5 mm)

      // Outer Solid Border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.8);
      pdf.rect(startX, startY, cardW, cardH);

      // Center Dashed Folding Line
      pdf.setLineDashPattern([2.5, 2.5], 0);
      pdf.setDrawColor(70, 70, 70);
      pdf.setLineWidth(0.5);
      pdf.line(midX, startY, midX, startY + cardH);

      // Reset Line Dash
      pdf.setLineDashPattern([], 0);

      // ── LEFT SIDE: ANVERSO (100% Mathematically Centered on leftCenterX) ───
      const leftCenterX = startX + colW / 2; // 83.5 mm

      // 1. Title CONTRATISTA
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);
      pdf.setTextColor(0, 0, 0);
      pdf.text("CONTRATISTA", leftCenterX, startY + 12, { align: "center" });

      // Double Line 1
      pdf.setLineWidth(0.6);
      pdf.setDrawColor(0, 0, 0);
      pdf.line(startX + 7, startY + 15.5, midX - 7, startY + 15.5);
      pdf.line(startX + 7, startY + 16.8, midX - 7, startY + 16.8);

      // 2. Logo HOA with Colorful Waves
      if (logoDataUrl) {
        const logoW = 50;
        const logoH = 16;
        pdf.addImage(logoDataUrl, "PNG", leftCenterX - logoW / 2, startY + 19, logoW, logoH);
      } else {
        pdf.setFont("times", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(13, 110, 95);
        pdf.text("Las Palomas", leftCenterX, startY + 26, { align: "center" });
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text("Rocky Point HOA, A.C.", leftCenterX, startY + 30.5, { align: "center" });
      }

      // Double Line 2
      pdf.setDrawColor(0, 0, 0);
      pdf.line(startX + 7, startY + 37.5, midX - 7, startY + 37.5);
      pdf.line(startX + 7, startY + 38.8, midX - 7, startY + 38.8);

      // 3. NUMBER 70 — MATHEMATICALLY CENTERED
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(52);
      pdf.setTextColor(0, 0, 0);
      pdf.text(veh.corbatinNum, leftCenterX, startY + 54.5, { align: "center" });

      // Double Line 3
      pdf.line(startX + 7, startY + 59.5, midX - 7, startY + 59.5);
      pdf.line(startX + 7, startY + 60.8, midX - 7, startY + 60.8);

      // 4. Vehicle & Driver Information
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${veh.marca} ${veh.modelo} (${veh.anio})`, leftCenterX, startY + 67.5, { align: "center" });

      pdf.setFont("courier", "bold");
      pdf.setFontSize(13);
      pdf.text(veh.placas, leftCenterX, startY + 73.5, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(50, 50, 50);
      pdf.text(veh.conductor, leftCenterX, startY + 78.5, { align: "center" });

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(13, 110, 95);
      pdf.text(veh.empresaNombre, leftCenterX, startY + 83.5, { align: "center" });

      // Divider Line
      pdf.setLineDashPattern([1.5, 1.5], 0);
      pdf.setDrawColor(170, 170, 170);
      pdf.line(startX + 10, startY + 87.5, midX - 10, startY + 87.5);
      pdf.setLineDashPattern([], 0);

      // 5. Large Centered QR Code
      const qrSize = 44; // 44 x 44 mm
      const qrX = leftCenterX - qrSize / 2;
      const qrY = startY + 91;

      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.6);
      pdf.rect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3);
      pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

      // 6. Validity & Placement Instructions
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(13, 110, 95);
      pdf.text(`VIGENCIA: 1 AÑO (${currentYear} – ${nextYear})`, leftCenterX, startY + 144.5, { align: "center" });

      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text("POR FAVOR DE COLOCAR", leftCenterX, startY + 150.5, { align: "center" });
      pdf.text("EN EL RETROVISOR", leftCenterX, startY + 155, { align: "center" });

      // ── RIGHT SIDE: REVERSO (Reglamento Oficial - Letras Grandes) ──────────
      const rightMargin = midX + 9;
      let textY = startY + 11.5;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text("REGLAMENTO PARA EXTERNOS EN ÁREAS COMUNES:", midX + colW / 2, textY, { align: "center" });

      textY += 7.5;

      const sections = [
        {
          title: "1. INGRESO",
          items: [
            "• Registrar: corbatín, compañía, vehículo, placas, nombre y celular.",
            "• Indicar área de trabajo y horario.",
            "• Portar uniforme, gafete visible y EPP obligatorio."
          ]
        },
        {
          title: "2. ÁREA DE TRABAJO",
          items: [
            "• Permanecer solo en el área asignada.",
            "• Usar señalización de seguridad (conos, cintas).",
            "• Uso obligatorio de EPP (incluye arnés en altura).",
            "• Consumir alimentos solo en áreas designadas.",
            "• No usar elevadores de huéspedes."
          ]
        },
        {
          title: "3. VEHÍCULOS",
          items: [
            "• Altura máxima: 2.40 m.",
            "• Estacionarse solo en áreas autorizadas (Sótano 2).",
            "• Colocar corbatín visible en el retrovisor o tablero."
          ]
        },
        {
          title: "4. PROHIBICIONES",
          items: [
            '• No tirar escombro en "Trash Chute".',
            "• No dejar materiales en áreas comunes.",
            "• No usar bocinas ni generar ruido excesivo.",
            "• No dormir en áreas comunes."
          ]
        },
        {
          title: "5. SANCIONES DISCIPLINARIAS",
          items: [
            "• 1ª: Amonestación escrita",
            "• 2ª: Suspensión de 24 a 48 hrs",
            "• 3ª: Suspensión de 1 semana",
            "• Reincidencia: Restricción definitiva"
          ]
        },
        {
          title: "6. HORARIOS",
          items: [
            "• Lunes a viernes: 08:00 a 18:00 hrs",
            "• Sábado: 09:00 a 14:00 hrs",
            "• No generar ruido antes de 09:00 hrs",
            "• Horarios especiales requieren autorización HOA."
          ]
        },
      ];

      sections.forEach((sec) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(0, 0, 0);
        pdf.text(sec.title, rightMargin, textY);
        textY += 4.2;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.2);
        pdf.setTextColor(25, 25, 25);
        sec.items.forEach((it) => {
          pdf.text(it, rightMargin + 2, textY);
          textY += 3.8;
        });
        textY += 2.6;
      });

      // Bottom Footer
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(rightMargin, startY + cardH - 10, startX + cardW - 8, startY + cardH - 10);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Las Palomas Rocky Point HOA, A.C.", rightMargin, startY + cardH - 5.5);

      pdf.setFont("courier", "bold");
      pdf.setFontSize(7);
      pdf.text(`Corbatín #${veh.corbatinNum} · ${veh.placas} · Vigencia 1 Año (${currentYear}–${nextYear})`, startX + cardW - 8, startY + cardH - 5.5, { align: "right" });

      // Save PDF directly to user download folder
      pdf.save(`Corbatin_${veh.corbatinNum}_${veh.placas}.pdf`);
    } catch (err) {
      console.error("Error generating native PDF:", err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCambiarAIngresoPeatonal = (veh?: Vehicle) => {
    const targetVeh = veh || currentCasetaVehicle;
    setCasetaModoAcceso("peatonal");
    if (targetVeh) {
      setCasetaPeatonalNombre(targetVeh.conductor);
      setCasetaPeatonalTelefono(targetVeh.telefono);
      setCasetaPeatonalObservaciones(
        `Ingreso peatonal permitido. Vehículo ${targetVeh.marca} ${targetVeh.modelo} (${targetVeh.placas}) retenido en el exterior por ${targetVeh.sancionActiva ? targetVeh.sancionActiva.motivo : "suspensión vehicular activa"}.`
      );
      setCasetaTrabajos(`Labores y mantenimiento autorizado a pie — ${targetVeh.conductor}`);
      setHoraActual();
    }
  };

  const handleExportarBitacoraExcel = () => {
    if (bitacora.length === 0) {
      showToast("No hay registros en la bitácora para exportar.", "warning", "Bitácora Vacía");
      return;
    }

    const headers = [
      "Folio",
      "Modalidad de Acceso",
      "Empresa Contratista",
      "Vehículo / Placas / Identificación",
      "Color Unidad",
      "Conductor / Colaborador",
      "Teléfono Celular",
      "Corbatín / Gafete",
      "Hora Entrada",
      "Hora Salida",
      "Trabajos / Motivo de Acceso",
      "Oficial en Turno",
      "Estatus",
      "Observaciones de Seguridad"
    ];

    const rows = bitacora.map((b) => [
      b.id,
      b.tipoAcceso || (b.vehicleId === "PEATONAL" ? "Peatonal (A pie)" : "Vehicular"),
      b.empresaNombre,
      b.placas,
      b.color || "N/A",
      b.conductor,
      b.telefono || "N/A",
      b.corbatinNum ? `#${b.corbatinNum}` : "N/A",
      b.horaEntrada,
      b.horaSalida || "Dentro (Sin salida aún)",
      b.trabajos,
      b.guardiaNombre,
      b.estado,
      b.observaciones || "Sin observaciones"
    ]);

    // CSV con UTF-8 BOM para compatibilidad total con Microsoft Excel
    const csvContent = "\uFEFF" + [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Bitacora_Caseta_LasPalomas_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Bitácora exportada exitosamente en formato Excel / CSV.", "success");
  };

  const handleToggleEstatusVehiculo = async (v: Vehicle) => {
    if (togglingVehiculoIds[v.id]) return;
    setTogglingVehiculoIds((prev) => ({ ...prev, [v.id]: true }));

    const esHabilitado = v.status === "Habilitado";
    const nuevoEstatus = esHabilitado ? "DESHABILITADO" : "HABILITADO";
    const nuevoStatusFrontend = esHabilitado ? ("Deshabilitado" as const) : ("Habilitado" as const);

    // Actualización optimista instantánea
    setVehicles((prev) =>
      prev.map((item) =>
        item.id === v.id
          ? { ...item, status: nuevoStatusFrontend }
          : item
      )
    );

    try {
      await api.updateVehiculo(v.id, {
        estatus_acceso: nuevoEstatus
      });
      await loadDatabaseData();
      showToast(
        `Vehículo ${v.marca} ${v.modelo} (${v.placas}) ha sido ${nuevoStatusFrontend === "Habilitado" ? "Habilitado" : "Deshabilitado"} con éxito.`,
        nuevoStatusFrontend === "Habilitado" ? "success" : "info"
      );
    } catch (err: any) {
      console.error("Error al actualizar estatus del vehículo:", err);
      // Revertir en caso de fallo
      setVehicles((prev) =>
        prev.map((item) =>
          item.id === v.id
            ? { ...item, status: v.status }
            : item
        )
      );
      showToast("Error al actualizar estatus del vehículo: " + (err.message || err), "error");
    } finally {
      setTogglingVehiculoIds((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
    }
  };

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEntradaRef.current) return;
    isSubmittingEntradaRef.current = true;
    setIsSubmittingEntrada(true);

    try {
      const emp = empresas.find((item) => item.id === selectedEmpresaId) || empresas[0];

      // Registro en Modalidad Peatonal (Contratista a pie)
      if (casetaModoAcceso === "peatonal") {
        const nom = casetaPeatonalNombre.trim() || (currentTrabajadorPeatonal ? `${currentTrabajadorPeatonal.nombre} ${currentTrabajadorPeatonal.apellidos}` : "Colaborador Peatonal");
        const tel = casetaPeatonalTelefono.trim() || currentTrabajadorPeatonal?.telefono || emp?.telefono || "";

        await api.registrarAcceso({
          id_caseta: 1,
          id_vehiculo: null,
          id_corbatin: null,
          id_conductor: currentTrabajadorPeatonal ? currentTrabajadorPeatonal.id_trabajador : null,
          id_usuario: Number(currentUser?.id) || 4,
          ubicacion_trabajo: casetaTrabajos || "Trabajos y labores en instalaciones (Ingreso a pie)",
          estatus_acceso: "AUTORIZADO",
          observaciones: `Peatonal [${nom} - Tel: ${tel}]: ${casetaPeatonalObservaciones || "Ingreso peatonal registrado en caseta."}`,
          tipo: 'entrada'
        });

        await loadDatabaseData();
        setCasetaTrabajos("");
        setCasetaPeatonalObservaciones("");
        setCasetaSuccessMsg(true);
        setTimeout(() => setCasetaSuccessMsg(false), 4000);
        showToast(`Ingreso peatonal de ${nom} registrado en caseta.`, "success");
        return;
      }

      // Registro en Modalidad Vehicular
      if (!currentCasetaVehicle) {
        showToast("Selecciona un vehículo habilitado para registrar la entrada.", "warning");
        return;
      }

      await api.registrarAcceso({
        id_caseta: 1,
        id_vehiculo: Number(currentCasetaVehicle.id),
        id_corbatin: null,
        id_conductor: null,
        id_usuario: Number(currentUser?.id) || 4,
        ubicacion_trabajo: casetaTrabajos || "Mantenimiento general",
        estatus_acceso: casetaOverrideActive ? "AUTORIZADO_OVERRIDE" : "AUTORIZADO",
        observaciones: casetaOverrideActive ? "Acceso vehicular autorizado con anulación de emergencia por Supervisor HOA" : "Ingreso regular vehicular",
        tipo: 'entrada'
      });

      await loadDatabaseData();
      setCasetaTrabajos("");
      setCasetaOverrideActive(false);
      setCasetaSuccessMsg(true);
      setTimeout(() => setCasetaSuccessMsg(false), 4000);
      showToast(`Entrada autorizada para el vehículo ${currentCasetaVehicle.placas}.`, "success");
    } catch (err: any) {
      showToast("Error al registrar entrada vehicular: " + (err.message || err), "error");
    } finally {
      isSubmittingEntradaRef.current = false;
      setIsSubmittingEntrada(false);
    }
  };

  const handleMarcarSalida = async (id: string) => {
    if (marcandoSalidaIds[id]) return;
    setMarcandoSalidaIds((prev) => ({ ...prev, [id]: true }));
    try {
      await api.registrarSalida(id);
      await loadDatabaseData();
      showToast("Salida registrada con éxito.", "info", "Registro Actualizado");
    } catch (err: any) {
      showToast("Error al registrar salida en la base de datos: " + (err.message || err), "error");
    } finally {
      setMarcandoSalidaIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleAprobarInfraccion = async (inf: InfraccionReporte) => {
    if (resolvingInfraccionIds[inf.id]) return;
    setResolvingInfraccionIds((prev) => ({ ...prev, [inf.id]: true }));
    try {
      await api.dictaminarReporte(inf.id, {
        decision: 'APROBADO',
        comentarios: `Medida disciplinaria y suspensión vehicular aprobada por Supervisión HOA (${inf.medidaSugerida})`,
        id_usuario: Number(currentUser?.id) || 2
      });

      await loadDatabaseData();
      showToast(`Infracción ${inf.folio} aprobada. Se ha aplicado la suspensión de acceso vehicular en PostgreSQL.`, "success", "Infracción Aprobada");
    } catch (err: any) {
      await loadDatabaseData();
      const msg = err.message || String(err);
      if (msg.includes("ya fue dictaminado") || msg.includes("409") || msg.includes("Ya existe una sanción") || msg.includes("previamente")) {
        showToast("Esta infracción ya había sido dictaminada por otro supervisor. La bandeja ha sido actualizada.", "info", "Infracción Ya Procesada");
      } else {
        showToast(`Error al aprobar reporte en la base de datos: ${msg}`, "error");
      }
    } finally {
      setResolvingInfraccionIds((prev) => {
        const next = { ...prev };
        delete next[inf.id];
        return next;
      });
    }
  };

  const handleRechazarInfraccion = async (inf: InfraccionReporte) => {
    if (resolvingInfraccionIds[inf.id]) return;
    setResolvingInfraccionIds((prev) => ({ ...prev, [inf.id]: true }));
    try {
      await api.dictaminarReporte(inf.id, {
        decision: 'RECHAZADO',
        comentarios: `Aclaración admitida o evidencia desestimada por Supervisión HOA`,
        id_usuario: Number(currentUser?.id) || 2
      });

      await loadDatabaseData();
      showToast(`Infracción ${inf.folio} desestimada y guardada en PostgreSQL.`, "info", "Infracción Desestimada");
    } catch (err: any) {
      await loadDatabaseData();
      const msg = err.message || String(err);
      if (msg.includes("ya fue dictaminado") || msg.includes("409") || msg.includes("Ya existe una sanción") || msg.includes("previamente")) {
        showToast("Esta infracción ya había sido dictaminada por otro supervisor. La bandeja ha sido actualizada.", "info", "Infracción Ya Procesada");
      } else {
        showToast(`Error al desestimar reporte en la base de datos: ${msg}`, "error");
      }
    } finally {
      setResolvingInfraccionIds((prev) => {
        const next = { ...prev };
        delete next[inf.id];
        return next;
      });
    }
  };

  const handleEnviarApelacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSancionParaApelar || isSubmittingApelacionRef.current) return;
    isSubmittingApelacionRef.current = true;
    setIsSubmittingApelacion(true);

    const sancionId = selectedSancionParaApelar.id;
    const fechaHoy = new Date().toISOString().split("T")[0];
    const apelacionPayload: NonNullable<Sancion["apelacion"]> = {
      fecha: fechaHoy,
      argumentos: apelacionArgumentos.trim(),
      representante: currentUser?.nombre || "Representante Acreditado",
      estado: "Pendiente" as const,
    };

    try {
      await api.updateSancion(sancionId, {
        estatus: 'EN_APELACION',
        apelacion: apelacionPayload
      });

      await loadDatabaseData();

      setSelectedSancionParaApelar(null);
      setApelacionArgumentos("");
      showToast(`Apelación formal para la sanción ${sancionId} enviada al Comité de Supervisión HOA.`, "success", "Apelación Enviada");
    } catch (err: any) {
      console.error("Error al enviar apelación:", err);
      // Actualización optimista de respaldo
      setSanciones((prev: Sancion[]) =>
        prev.map((s: Sancion): Sancion => {
          if (s.id === sancionId) {
            return {
              ...s,
              status: "En Apelación" as const,
              apelacion: apelacionPayload
            };
          }
          return s;
        })
      );
      setSelectedSancionParaApelar(null);
      setApelacionArgumentos("");
      showToast(`Apelación formal para la sanción ${sancionId} registrada correctamente.`, "success", "Apelación Enviada");
    } finally {
      isSubmittingApelacionRef.current = false;
      setIsSubmittingApelacion(false);
    }
  };

  const handleAceptarApelacion = async (sancionId: string, dictamen: string) => {
    if (resolvingSancionIds[sancionId]) return;
    const targetSancion = sanciones.find(s => s.id === sancionId);
    if (!targetSancion) return;

    setResolvingSancionIds((prev) => ({ ...prev, [sancionId]: true }));
    const fechaHoy = new Date().toISOString().split("T")[0];

    try {
      await api.updateSancion(sancionId, {
        estatus: 'CANCELADA',
        dictamen: dictamen || 'Suspensión levantada por resolución de Supervisión HOA'
      });
      await loadDatabaseData();
      showToast(`Apelación aprobada para el vehículo ${targetSancion.placas}. Suspensión levantada inmediatamente.`, "success", "Suspensión Levantada");
    } catch (err) {
      console.warn("Error al actualizar sanción en BD:", err);
      setSanciones((prev: Sancion[]) =>
        prev.map((s: Sancion): Sancion => {
          if (s.id === sancionId) {
            return {
              ...s,
              status: "Aclarada" as const,
              apelacion: {
                ...(s.apelacion || {
                  fecha: fechaHoy,
                  argumentos: "Aclaración presentada",
                  representante: "Representante Acreditado",
                  estado: "Aprobada" as const
                }),
                estado: "Aprobada" as const,
                dictamenSupervisor: dictamen || "Apelación procedente. Se levanta la suspensión vehicular por resolución de Supervisión HOA.",
                fechaDictamen: fechaHoy,
              }
            };
          }
          return s;
        })
      );

      setVehicles((prev) =>
        prev.map((v) => {
          if (v.placas === targetSancion.placas) {
            return {
              ...v,
              status: "Habilitado",
              sancionActiva: undefined,
            };
          }
          return v;
        })
      );

      showToast(`Apelación aprobada para el vehículo ${targetSancion.placas}. Suspensión levantada inmediatamente.`, "success", "Suspensión Levantada");
    } finally {
      setResolvingSancionIds((prev) => {
        const next = { ...prev };
        delete next[sancionId];
        return next;
      });
    }
  };

  const handleRatificarSancion = async (sancionId: string, dictamen: string) => {
    if (resolvingSancionIds[sancionId]) return;
    const targetSancion = sanciones.find(s => s.id === sancionId);
    if (!targetSancion) return;

    setResolvingSancionIds((prev) => ({ ...prev, [sancionId]: true }));
    const fechaHoy = new Date().toISOString().split("T")[0];

    try {
      await api.updateSancion(sancionId, {
        estatus: 'RATIFICADA',
        dictamen: dictamen || 'Apelación improcedente. Se ratifica la medida disciplinaria.'
      });
      await loadDatabaseData();
      showToast(`Se ha ratificado la sanción para ${targetSancion.placas}. La suspensión continúa vigente.`, "warning", "Sanción Ratificada");
    } catch (err) {
      console.warn("Error al ratificar sanción en BD:", err);
      setSanciones((prev: Sancion[]) =>
        prev.map((s: Sancion): Sancion => {
          if (s.id === sancionId) {
            return {
              ...s,
              status: "Ratificada" as const,
              apelacion: {
                ...(s.apelacion || {
                  fecha: fechaHoy,
                  argumentos: "Recurso presentado",
                  representante: "Representante Acreditado",
                  estado: "Rechazada" as const
                }),
                estado: "Rechazada" as const,
                dictamenSupervisor: dictamen || "Apelación improcedente. Se ratifica la medida disciplinaria impuesta por gravedad de la falta.",
                fechaDictamen: fechaHoy,
              }
            };
          }
          return s;
        })
      );

      showToast(`Se ha ratificado la sanción para ${targetSancion.placas}. La suspensión continúa vigente.`, "warning", "Sanción Ratificada");
    } finally {
      setResolvingSancionIds((prev) => {
        const next = { ...prev };
        delete next[sancionId];
        return next;
      });
    }
  };

  const handleGuardarNuevaPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPasswordRef.current) return;
    setPasswordModalError("");

    if (!selectedUserParaPassword) return;
    if (!nuevaPassword.trim()) {
      setPasswordModalError("La contraseña no puede estar vacía.");
      return;
    }
    if (!confirmarPassword.trim()) {
      setPasswordModalError("Por favor introduce manualmente la confirmación de la contraseña.");
      return;
    }
    if (nuevaPassword.trim() !== confirmarPassword.trim()) {
      setPasswordModalError("Las contraseñas no coinciden. Por favor escribe con exactitud la clave generada o deseada.");
      return;
    }

    isSubmittingPasswordRef.current = true;
    setIsSubmittingPassword(true);

    try {
      await api.updateUsuario(selectedUserParaPassword.id, {
        password: nuevaPassword.trim(),
      });
      await loadDatabaseData();
      showToast(`Contraseña para la cuenta "${selectedUserParaPassword.email}" (${selectedUserParaPassword.nombre}) actualizada con éxito.`, "success", "Clave Actualizada");
      setSelectedUserParaPassword(null);
      setNuevaPassword("");
      setConfirmarPassword("");
      setPasswordModalError("");
    } catch (err: any) {
      setPasswordModalError("Error al actualizar en base de datos: " + err.message);
    } finally {
      isSubmittingPasswordRef.current = false;
      setIsSubmittingPassword(false);
    }
  };

  // Image Upload Handler for New Vehicle
  const handleFotoVehiculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoVehiculoFotoError("");
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNuevoVehiculoFotoError("La imagen no debe exceder 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setNuevoVehiculoFoto(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Image Upload Handler for New Guardia (con compresión client-side para Vercel y base de datos)
  const handleFotoGuardiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoGuardiaFotoError("");
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setNuevoGuardiaFotoError("La fotografía del oficial no debe exceder 8 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const rawData = uploadEvent.target?.result as string;
        if (!rawData) return;

        // Comprimir en canvas para optimizar tamaño en Base64 (máx 640px, JPEG 0.85)
        const img = new Image();
        img.onload = () => {
          const maxDim = 640;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.85);
            setNuevoGuardiaFoto(compressed);
          } else {
            setNuevoGuardiaFoto(rawData);
          }
          setNuevoGuardiaFotoError("");
        };
        img.onerror = () => {
          setNuevoGuardiaFoto(rawData);
          setNuevoGuardiaFotoError("");
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler para actualizar la foto de un oficial de caseta directamente a PostgreSQL
  const handleUpdateGuardiaFoto = async (guardiaId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast("La fotografía del oficial no debe exceder 8 MB.", "error", "Tamaño Excedido");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const rawData = uploadEvent.target?.result as string;
      if (!rawData) return;

      const img = new Image();
      img.onload = async () => {
        const maxDim = 640;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const compressed = ctx ? (ctx.drawImage(img, 0, 0, width, height), canvas.toDataURL("image/jpeg", 0.85)) : rawData;

        try {
          const res = await fetch(`/api/usuarios/${guardiaId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foto_url: compressed })
          });

          if (!res.ok) throw new Error("Error al guardar la fotografía en el servidor");

          setUsers(prev => prev.map(u => u.id === guardiaId ? { ...u, foto_url: compressed } : u));
          setSelectedFotoGuardiaPreview(prev => prev && prev.id === guardiaId ? { ...prev, foto_url: compressed } : prev);
          showToast("Fotografía del oficial guardada exitosamente en la base de datos.", "success", "Fotografía Guardada");
        } catch (err: any) {
          console.error("Error al actualizar fotografía:", err);
          showToast("Error al guardar la fotografía del oficial.", "error", "Error de Guardado");
        }
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  // ─── Handlers para Creación de Vehículos, Supervisores, Empresas, Guardias ───
  const handleGuardarNuevoVehiculo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingVehiculoRef.current) return;

    if (!nuevoVehiculoFoto) {
      setNuevoVehiculoFotoError("Es obligatorio adjuntar una fotografía oficial del vehículo.");
      return;
    }

    isSubmittingVehiculoRef.current = true;
    setIsSubmittingVehiculo(true);

    const form = e.currentTarget;
    const marcaVal = (form.elements.namedItem("marca") as HTMLInputElement)?.value || "";
    const modeloVal = (form.elements.namedItem("modelo") as HTMLInputElement)?.value || "";
    const anioVal = (form.elements.namedItem("año") as HTMLInputElement || form.elements.namedItem("anio") as HTMLInputElement)?.value || "";
    const placasVal = ((form.elements.namedItem("placas") as HTMLInputElement)?.value || "").toUpperCase();
    const colorVal = (form.elements.namedItem("color") as HTMLInputElement)?.value || "";

    const emp = empresas.find(em => em.nombre === currentUser?.empresaNombre) || empresas[0];

    try {
      await api.createVehiculo({
        id_empresa: emp?.id || 1,
        marca: marcaVal,
        modelo: modeloVal,
        año: anioVal || null,
        placas: placasVal,
        color: colorVal,
        foto_url: nuevoVehiculoFoto,
        estatus_acceso: "HABILITADO",
      });

      await loadDatabaseData();
      form.reset();
      setNuevoVehiculoFoto("");
      setNuevoVehiculoFotoError("");
      showToast("Vehículo registrado exitosamente con fotografía oficial y corbatín QR.", "success", "Vehículo Registrado");
      setPortalScreen("dashboard");
    } catch (err: any) {
      showToast("Error al registrar vehículo en la base de datos: " + (err.message || err), "error");
    } finally {
      isSubmittingVehiculoRef.current = false;
      setIsSubmittingVehiculo(false);
    }
  };

  const handleGuardarNuevoSupervisor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingSupervisorRef.current) return;
    isSubmittingSupervisorRef.current = true;
    setIsSubmittingSupervisor(true);

    const f = e.currentTarget;
    const nom = (f.elements.namedItem("nombre") as HTMLInputElement).value.trim();
    const emailVal = (f.elements.namedItem("email") as HTMLInputElement).value.trim();
    const passVal = (f.elements.namedItem("password") as HTMLInputElement).value.trim();

    try {
      await api.createUsuario({
        nombre: nom,
        correo: emailVal,
        password: passVal || "123456",
        id_rol: 2, // SUPERVISOR
        id_empresa: null,
        activo: true,
      });
      await loadDatabaseData();
      setShowCreateSupervisorModal(false);
      showToast(`Cuenta de Supervisor para "${nom}" (${emailVal}) creada y guardada exitosamente.`, "success", "Supervisor Creado");
    } catch (err: any) {
      showToast("Error al guardar supervisor en la base de datos: " + (err.message || err), "error");
    } finally {
      isSubmittingSupervisorRef.current = false;
      setIsSubmittingSupervisor(false);
    }
  };

  const handleGuardarNuevaEmpresa = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingEmpresaRef.current) return;
    isSubmittingEmpresaRef.current = true;
    setIsSubmittingEmpresa(true);

    const f = e.currentTarget;
    const empNombre = (f.elements.namedItem("nombre") as HTMLInputElement).value.trim();
    const rfcVal = (f.elements.namedItem("rfc") as HTMLInputElement).value.trim().toUpperCase();
    const contacto = (f.elements.namedItem("contacto") as HTMLInputElement).value.trim();
    const tel = (f.elements.namedItem("telefono") as HTMLInputElement).value.trim();
    const email = (f.elements.namedItem("email") as HTMLInputElement).value.trim();
    const passVal = (f.elements.namedItem("password") as HTMLInputElement).value.trim();

    try {
      const empRes = await api.createEmpresa({
        razon_social: empNombre,
        responsable_nombre: contacto,
        telefono: tel,
        correo: email,
        estatus: "ACTIVA",
      });

      await api.createUsuario({
        nombre: contacto,
        correo: email,
        password: passVal || "123456",
        id_rol: 5, // PROVEEDOR
        id_empresa: empRes?.id_empresa || null,
        activo: true,
      });

      await loadDatabaseData();
      setShowCreateEmpresaModal(false);
      showToast(`Empresa "${empNombre}" y cuenta "${email}" creadas exitosamente.`, "success", "Proveedor Creado");
    } catch (err: any) {
      showToast("Error al registrar proveedor en la base de datos: " + (err.message || err), "error");
    } finally {
      isSubmittingEmpresaRef.current = false;
      setIsSubmittingEmpresa(false);
    }
  };

  const handleGuardarNuevoGuardia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingGuardiaRef.current) return;

    if (!nuevoGuardiaFoto) {
      setNuevoGuardiaFotoError("Es obligatorio adjuntar una fotografía oficial del oficial de caseta.");
      return;
    }

    isSubmittingGuardiaRef.current = true;
    setIsSubmittingGuardia(true);

    const f = e.currentTarget;
    const nom = (f.elements.namedItem("nombre") as HTMLInputElement).value.trim();
    const emailVal = (f.elements.namedItem("email") as HTMLInputElement).value.trim();
    const passVal = (f.elements.namedItem("password") as HTMLInputElement).value.trim();

    try {
      await api.createUsuario({
        nombre: nom,
        correo: emailVal,
        password: passVal || "123456",
        id_rol: 4, // CASETA
        id_empresa: null,
        activo: true,
        foto_url: nuevoGuardiaFoto,
      });
      await loadDatabaseData();
      setShowCreateGuardiaModal(false);
      setNuevoGuardiaFoto("");
      setNuevoGuardiaFotoError("");
      showToast(`Oficial de Caseta "${nom}" (${emailVal}) registrado exitosamente con fotografía oficial.`, "success", "Oficial Registrado");
    } catch (err: any) {
      showToast("Error al registrar oficial en la base de datos: " + (err.message || err), "error");
    } finally {
      isSubmittingGuardiaRef.current = false;
      setIsSubmittingGuardia(false);
    }
  };

  // ─── Handlers para Gestión de Trabajadores (Diccionario de Datos) ───
  const handleAbrirCrearTrabajador = () => {
    setTrabajadorNombre("");
    setTrabajadorApellidos("");
    setTrabajadorTelefono("");
    setTrabajadorFotoUrl("");
    setTrabajadorActivo(true);
    setTrabajadorFormError("");
    setShowCreateTrabajadorModal(true);
  };

  const handleAbrirEditarTrabajador = (t: Trabajador) => {
    setSelectedTrabajadorParaEditar(t);
    setTrabajadorNombre(t.nombre);
    setTrabajadorApellidos(t.apellidos);
    setTrabajadorTelefono(t.telefono || "");
    setTrabajadorFotoUrl(t.foto_url || "");
    setTrabajadorActivo(t.activo);
    setTrabajadorFormError("");
  };

  const handleGuardarNuevoTrabajador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingTrabajadorRef.current) return;
    setTrabajadorFormError("");

    const nom = trabajadorNombre.trim();
    const ape = trabajadorApellidos.trim();
    const tel = trabajadorTelefono.trim();

    if (!nom) {
      setTrabajadorFormError("El nombre del colaborador es obligatorio (máx 80 caracteres).");
      return;
    }
    if (nom.length > 80) {
      setTrabajadorFormError("El nombre no puede exceder 80 caracteres.");
      return;
    }
    if (!ape) {
      setTrabajadorFormError("Los apellidos completos son obligatorios (máx 150 caracteres).");
      return;
    }
    if (ape.length > 150) {
      setTrabajadorFormError("Los apellidos no pueden exceder 150 caracteres.");
      return;
    }
    if (tel.length > 20) {
      setTrabajadorFormError("El teléfono no puede exceder 20 caracteres.");
      return;
    }

    isSubmittingTrabajadorRef.current = true;
    setIsSubmittingTrabajador(true);

    const currentEmpresaObj = empresas.find(emp => emp.nombre === currentUser?.empresaNombre) || empresas[0];
    const defaultFoto = trabajadorFotoUrl || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100) + 1500000000000}?auto=format&fit=crop&q=80&w=250`;

    try {
      await api.createTrabajador({
        id_empresa: currentEmpresaObj?.id || 1,
        nombre: nom,
        apellidos: ape,
        telefono: tel || null,
        foto_url: defaultFoto,
        activo: trabajadorActivo,
      });
      await loadDatabaseData();
      setShowCreateTrabajadorModal(false);
      setTrabajadorNombre("");
      setTrabajadorApellidos("");
      setTrabajadorTelefono("");
      setTrabajadorFotoUrl("");
      setTrabajadorActivo(true);
      setTrabajadorFormError("");
      showToast(`Trabajador "${nom} ${ape}" guardado exitosamente en PostgreSQL.`, "success", "Trabajador Registrado");
    } catch (err: any) {
      setTrabajadorFormError("Error al guardar en base de datos: " + (err.message || err));
      showToast("Error al guardar en base de datos: " + (err.message || err), "error");
    } finally {
      isSubmittingTrabajadorRef.current = false;
      setIsSubmittingTrabajador(false);
    }
  };

  const handleGuardarEdicionTrabajador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingTrabajadorEditRef.current) return;
    if (!selectedTrabajadorParaEditar) return;
    setTrabajadorFormError("");

    const nom = trabajadorNombre.trim();
    const ape = trabajadorApellidos.trim();
    const tel = trabajadorTelefono.trim();

    if (!nom) {
      setTrabajadorFormError("El nombre del colaborador es obligatorio (máx 80 caracteres).");
      return;
    }
    if (nom.length > 80) {
      setTrabajadorFormError("El nombre no puede exceder 80 caracteres.");
      return;
    }
    if (!ape) {
      setTrabajadorFormError("Los apellidos completos son obligatorios (máx 150 caracteres).");
      return;
    }
    if (ape.length > 150) {
      setTrabajadorFormError("Los apellidos no pueden exceder 150 caracteres.");
      return;
    }
    if (tel.length > 20) {
      setTrabajadorFormError("El teléfono no puede exceder 20 caracteres.");
      return;
    }

    isSubmittingTrabajadorEditRef.current = true;
    setIsSubmittingTrabajadorEdit(true);

    try {
      await api.updateTrabajador(selectedTrabajadorParaEditar.id_trabajador, {
        nombre: nom,
        apellidos: ape,
        telefono: tel || null,
        foto_url: trabajadorFotoUrl || selectedTrabajadorParaEditar.foto_url,
        activo: trabajadorActivo,
      });
      await loadDatabaseData();
      showToast(`Información de "${nom} ${ape}" actualizada con éxito en PostgreSQL.`, "success", "Trabajador Actualizado");
      setSelectedTrabajadorParaEditar(null);
      setTrabajadorFormError("");
    } catch (err: any) {
      setTrabajadorFormError("Error al actualizar en base de datos: " + (err.message || err));
      showToast("Error al actualizar en base de datos: " + (err.message || err), "error");
    } finally {
      isSubmittingTrabajadorEditRef.current = false;
      setIsSubmittingTrabajadorEdit(false);
    }
  };

  const handleConfirmarEliminarTrabajador = async () => {
    if (!selectedTrabajadorParaEliminar || isDeletingTrabajadorRef.current) return;
    const eliminado = selectedTrabajadorParaEliminar;
    isDeletingTrabajadorRef.current = true;
    setIsDeletingTrabajador(true);
    try {
      // Actualización optimista en memoria para respuesta inmediata de los contadores
      setTrabajadores((prev) =>
        prev.filter((t) => String(t.id_trabajador) !== String(eliminado.id_trabajador))
      );
      await api.deleteTrabajador(eliminado.id_trabajador);
      await loadDatabaseData();
      showToast(`El colaborador "${eliminado.nombre} ${eliminado.apellidos}" fue eliminado permanentemente.`, "success", "Colaborador Eliminado");
      setSelectedTrabajadorParaEliminar(null);
    } catch (err: any) {
      showToast("Error al eliminar de base de datos: " + (err.message || err), "error");
      await loadDatabaseData();
    } finally {
      isDeletingTrabajadorRef.current = false;
      setIsDeletingTrabajador(false);
    }
  };

  const handleConfirmarEliminarSupervisor = async () => {
    if (!selectedSupervisorParaEliminar || isDeletingSupervisorRef.current) return;
    const eliminado = selectedSupervisorParaEliminar;
    isDeletingSupervisorRef.current = true;
    setIsDeletingSupervisor(true);
    try {
      // Actualización optimista en memoria
      setUsers((prev) => prev.filter((u) => String(u.id) !== String(eliminado.id)));
      await api.deleteUsuario(eliminado.id);
      await loadDatabaseData();
      showToast(`El supervisor "${eliminado.nombre}" (${eliminado.username}) fue eliminado permanentemente.`, "success", "Supervisor Eliminado");
      setSelectedSupervisorParaEliminar(null);
    } catch (err: any) {
      showToast("Error al eliminar supervisor de la base de datos: " + (err.message || err), "error");
      await loadDatabaseData();
    } finally {
      isDeletingSupervisorRef.current = false;
      setIsDeletingSupervisor(false);
    }
  };

  const handleToggleActivoTrabajador = async (trab: Trabajador) => {
    if (togglingTrabajadorIds[trab.id_trabajador]) return;
    setTogglingTrabajadorIds((prev) => ({ ...prev, [trab.id_trabajador]: true }));
    const nuevoActivo = !trab.activo;
    try {
      await api.updateTrabajador(trab.id_trabajador, {
        activo: nuevoActivo,
      });
      await loadDatabaseData();
      showToast(`Colaborador ${trab.nombre} ${trab.apellidos} ${nuevoActivo ? "habilitado" : "deshabilitado"} exitosamente.`, "success");
    } catch (err: any) {
      console.warn("Error al actualizar estatus de trabajador en PostgreSQL:", err);
      // Fallback local
      setTrabajadores(trabajadores.map(t => {
        if (t.id_trabajador === trab.id_trabajador) {
          return { ...t, activo: nuevoActivo };
        }
        return t;
      }));
      showToast(`Colaborador ${trab.nombre} ${nuevoActivo ? "habilitado" : "deshabilitado"} localmente.`, "info");
    } finally {
      setTogglingTrabajadorIds((prev) => {
        const next = { ...prev };
        delete next[trab.id_trabajador];
        return next;
      });
    }
  };

  const handleToggleActivoUsuario = async (user: UserAccount) => {
    if (togglingUserIdsRef.current[user.id]) return;
    togglingUserIdsRef.current = { ...togglingUserIdsRef.current, [user.id]: true };
    setTogglingUserIds((prev) => ({ ...prev, [user.id]: true }));
    const nuevoActivo = user.activo === false ? true : false;
    try {
      await api.updateUsuario(user.id, {
        activo: nuevoActivo,
      });
      await loadDatabaseData();
      showToast(
        `Usuario "${user.nombre}" (${user.username}) ${nuevoActivo ? "activado" : "desactivado"} exitosamente.`,
        "success",
        nuevoActivo ? "Usuario Activado" : "Usuario Desactivado"
      );
    } catch (err: any) {
      console.warn("Error al actualizar estatus de usuario en PostgreSQL:", err);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, activo: nuevoActivo } : u));
      showToast(`Estatus de usuario "${user.nombre}" actualizado localmente.`, "info");
    } finally {
      const updated = { ...togglingUserIdsRef.current };
      delete updated[user.id];
      togglingUserIdsRef.current = updated;
      setTogglingUserIds((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    }
  };

  const handleFotoTrabajadorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrabajadorFormError("");
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setTrabajadorFormError("La fotografía no debe superar los 5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setTrabajadorFotoUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  if (!currentUser) {
    return (
      <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#0A3B34]" style={{ fontFamily: "var(--font-body)" }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMG_AERIAL})`, filter: "blur(4px) brightness(0.35)", transform: "scale(1.05)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D6E5F]/85 via-[#094239]/90 to-[#052822]/95" />

        <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl p-8 sm:p-9 shadow-2xl border border-white/20 space-y-6">
              <div className="text-center space-y-2 pb-1 border-b border-slate-100">
                <div className="flex justify-center pb-2">
                  <LPLogo size={170} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                  Plataforma Operativa HOA
                </h1>
                <p className="text-xs text-slate-500">
                  Control de Accesos, Proveedores y Seguridad
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <IconAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Correo Electrónico Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ej. admin@laspalomashoa.com"
                    className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-300 font-medium text-slate-800 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-300 text-slate-800 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    isSubmittingLogin ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                  }`}
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))", fontFamily: "var(--font-display)" }}
                >
                  {isSubmittingLogin ? (
                    <>
                      <IconSpinner className="w-4 h-4" />
                      <span>Iniciando Sesión...</span>
                    </>
                  ) : (
                    <span>Iniciar Sesión →</span>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                  Cuentas de Acceso Rápido
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickLogin("admin")}
                    className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer bg-white"
                  >
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 shrink-0">
                      <IconServer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Admin TI</div>
                      <div className="text-[10px] text-slate-500">Sistemas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin("supervisor")}
                    className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer bg-white"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                      <IconScale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Supervisor</div>
                      <div className="text-[10px] text-slate-500">Seguridad HOA</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin("contratista")}
                    className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer bg-white"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                      <IconBuilding className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Contratista</div>
                      <div className="text-[10px] text-slate-500">Empresas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin("caseta")}
                    className="p-2.5 rounded-xl border border-slate-200 text-left hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer bg-white"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                      <IconShield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Guardia</div>
                      <div className="text-[10px] text-slate-500">Caseta Tablet</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative z-10 py-4 text-center text-xs text-white/70">
          © 2026 Las Palomas Rocky Point HOA, A.C. · Sistema Operativo Integral
        </footer>
      </div>
    );
  }

  const apelacionesPendientesCount = sanciones.filter(s => s.status === "En Apelación").length;

  return (
    <div className="flex flex-col justify-between w-full max-w-full overflow-x-hidden min-h-screen" style={{ background: "var(--color-bg)", fontFamily: "var(--font-body)" }}>
      <div className="w-full max-w-full">
        <header className="sticky top-0 z-50 border-b bg-white no-print w-full" style={{ borderColor: "var(--color-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-3 sm:gap-4 justify-between w-full">
            <div className="shrink-0">
              <LPLogo size={150} />
            </div>

            <div className="hidden 2xl:flex items-center gap-1 shrink-0">
              {currentUser.role === "admin" && (
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setAdminTab("supervisores")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${adminTab === "supervisores" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Supervisores HOA ({users.filter(u => u.role === "supervisor").length})
                  </button>
                  <button
                    onClick={() => setAdminTab("auditoria")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${adminTab === "auditoria" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Auditoría Global & Claves
                  </button>
                </div>
              )}

              {currentUser.role === "supervisor" && (
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setSupervisorTab("bandeja")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${supervisorTab === "bandeja" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <span>Infracciones</span>
                    {infraccionesPendientes.filter(i => i.estado === "Pendiente").length > 0 ? (
                      <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-slate-950 text-[10px] items-center justify-center font-black">
                          {infraccionesPendientes.filter(i => i.estado === "Pendiente").length}
                        </span>
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-black">
                        0
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setSupervisorTab("apelaciones")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${supervisorTab === "apelaciones" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <span>Bandeja de Apelaciones</span>
                    {apelacionesPendientesCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-black">
                        {apelacionesPendientesCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setSupervisorTab("proveedores")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${supervisorTab === "proveedores" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Proveedores ({empresas.length})
                  </button>
                  <button
                    onClick={() => setSupervisorTab("guardias")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${supervisorTab === "guardias" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Guardias ({users.filter(u => u.role === "caseta").length})
                  </button>
                  <button
                    onClick={() => setSupervisorTab("historial")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${supervisorTab === "historial" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Historial
                  </button>
                </div>
              )}

              {currentUser.role === "contratista" && (
                <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 whitespace-nowrap shrink-0 shadow-xs">
                  <button
                    onClick={() => setPortalScreen("dashboard")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${portalScreen === "dashboard" ? "bg-[#0D6E5F] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Flotilla
                  </button>
                  <button
                    onClick={() => setPortalScreen("alta")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${portalScreen === "alta" ? "bg-[#0D6E5F] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    + Alta Vehículo
                  </button>
                  <button
                    onClick={() => setPortalScreen("trabajadores")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${portalScreen === "trabajadores" ? "bg-[#0D6E5F] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <span>Trabajadores</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      {trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre && t.activo).length}
                    </span>
                  </button>
                  <button
                    onClick={() => setPortalScreen("corbatin")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${portalScreen === "corbatin" ? "bg-[#0D6E5F] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Corbatines PDF
                  </button>
                  <button
                    onClick={() => setPortalScreen("sanciones")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${portalScreen === "sanciones" ? "bg-[#0D6E5F] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Sanciones & Apelaciones {sanciones.filter(s => !currentUser.empresaNombre || s.empresaNombre === currentUser.empresaNombre).length > 0 ? `(${sanciones.filter(s => !currentUser.empresaNombre || s.empresaNombre === currentUser.empresaNombre).length})` : ""}
                  </button>
                </div>
              )}

              {currentUser.role === "caseta" && (
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setCasetaTab("registro")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${casetaTab === "registro" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    + Registro de Entrada
                  </button>
                  <button
                    onClick={() => setCasetaTab("bitacora")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${casetaTab === "bitacora" ? "bg-[#0D6E5F] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Bitácora ({bitacora.filter(b => b.estado === "Dentro").length} dentro)
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <div className="text-right min-w-0 max-w-[120px] sm:max-w-[170px] md:max-w-[220px] lg:max-w-[260px]">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-end gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <span className="truncate">{currentUser.nombre}</span>
                </div>
                <div
                  className="text-[11px] text-slate-500 font-mono truncate"
                  title={currentUser.role === "admin" ? "Administrador de Sistemas" : currentUser.role === "supervisor" ? "Supervisor de Seguridad HOA" : currentUser.role === "contratista" ? currentUser.empresaNombre : `Oficial de Caseta (${currentUser.turno})`}
                >
                  {currentUser.role === "admin" ? "Administrador de Sistemas" : currentUser.role === "supervisor" ? "Supervisor de Seguridad HOA" : currentUser.role === "contratista" ? currentUser.empresaNombre : `Oficial de Caseta (${currentUser.turno})`}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-150 flex items-center gap-1.5 cursor-pointer no-print shrink-0"
              >
                <IconLogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Barra de Navegación Horizontal para Tablets y Pantallas Compactas */}
          <div className="2xl:hidden border-t bg-slate-50/95 px-4 py-2 overflow-x-auto flex items-center gap-1.5 no-print" style={{ borderColor: "var(--color-border)" }}>
            {currentUser.role === "supervisor" && (
              <>
                <button
                  onClick={() => setSupervisorTab("bandeja")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${supervisorTab === "bandeja" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Infracciones ({infraccionesPendientes.filter(i => i.estado === "Pendiente").length})
                </button>
                <button
                  onClick={() => setSupervisorTab("apelaciones")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${supervisorTab === "apelaciones" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Apelaciones ({apelacionesPendientesCount})
                </button>
                <button
                  onClick={() => setSupervisorTab("proveedores")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${supervisorTab === "proveedores" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Proveedores ({empresas.length})
                </button>
                <button
                  onClick={() => setSupervisorTab("guardias")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${supervisorTab === "guardias" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Guardias ({users.filter(u => u.role === "caseta").length})
                </button>
                <button
                  onClick={() => setSupervisorTab("historial")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${supervisorTab === "historial" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Historial
                </button>
              </>
            )}

            {currentUser.role === "admin" && (
              <>
                <button
                  onClick={() => setAdminTab("supervisores")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${adminTab === "supervisores" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Supervisores ({users.filter(u => u.role === "supervisor").length})
                </button>
                <button
                  onClick={() => setAdminTab("auditoria")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${adminTab === "auditoria" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Auditoría Global & Claves
                </button>
              </>
            )}

            {currentUser.role === "contratista" && (
              <>
                <button
                  onClick={() => setPortalScreen("dashboard")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${portalScreen === "dashboard" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Flotilla
                </button>
                <button
                  onClick={() => setPortalScreen("alta")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${portalScreen === "alta" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  + Alta Vehículo
                </button>
                <button
                  onClick={() => setPortalScreen("trabajadores")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${portalScreen === "trabajadores" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  <span>Trabajadores</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    {trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre && t.activo).length}
                  </span>
                </button>
                <button
                  onClick={() => setPortalScreen("corbatin")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${portalScreen === "corbatin" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Corbatines PDF
                </button>
                <button
                  onClick={() => setPortalScreen("sanciones")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${portalScreen === "sanciones" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Sanciones & Apelaciones {sanciones.filter(s => !currentUser.empresaNombre || s.empresaNombre === currentUser.empresaNombre).length > 0 ? `(${sanciones.filter(s => !currentUser.empresaNombre || s.empresaNombre === currentUser.empresaNombre).length})` : ""}
                </button>
              </>
            )}

            {currentUser.role === "caseta" && (
              <>
                <button
                  onClick={() => setCasetaTab("registro")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${casetaTab === "registro" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  + Registro de Entrada
                </button>
                <button
                  onClick={() => setCasetaTab("bitacora")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${casetaTab === "bitacora" ? "bg-[#0D6E5F] text-white" : "text-slate-600 bg-white border border-slate-200"}`}
                >
                  Bitácora ({bitacora.filter(b => b.estado === "Dentro").length} dentro)
                </button>
              </>
            )}
          </div>
        </header>

        {/* ADMIN */}
        {currentUser.role === "admin" && (
          <main>
            <PageHero
              img={IMG_COAST}
              title="Consola de Administración de Sistemas y TI"
              subtitle="Creación de supervisores HOA, auditoría global y gestión de contraseñas de usuarios"
            >
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateSupervisorModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <IconUserPlus className="w-4 h-4" />
                  <span>+ Crear Cuenta de Supervisor</span>
                </button>
              </div>
            </PageHero>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-[calc(100vh-16rem)]">
              {adminTab === "supervisores" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                    <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                      <div>
                        <h2 className="font-bold text-sm text-slate-800">Supervisores HOA Creados por Sistemas</h2>
                        <p className="text-xs text-slate-500">Tienen autorización para crear proveedores contratistas, oficiales de caseta y dictaminar infracciones.</p>
                      </div>
                      <button
                        onClick={() => setShowCreateSupervisorModal(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110 cursor-pointer"
                        style={{ background: "var(--color-primary)" }}
                      >
                        + Nuevo Supervisor
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                            {["ID", "Nombre", "Usuario", "Correo Electrónico", "Fecha Alta", "Creado Por", "Estatus", "Acciones"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users.filter(u => u.role === "supervisor").map((sup) => (
                            <tr key={sup.id} className="hover:bg-slate-50">
                              <td className="px-5 py-3 font-mono text-xs font-bold text-slate-700">{sup.id}</td>
                              <td className="px-5 py-3 font-bold text-xs text-slate-900">{sup.nombre}</td>
                              <td className="px-5 py-3 font-mono text-xs text-slate-600">{sup.username}</td>
                              <td className="px-5 py-3 text-xs text-slate-600">{sup.email}</td>
                              <td className="px-5 py-3 text-xs text-slate-500">{sup.fechaCreacion}</td>
                              <td className="px-5 py-3 text-xs text-slate-500">{sup.creadoPor}</td>
                              <td className="px-5 py-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleActivoUsuario(sup)}
                                  disabled={Boolean(togglingUserIds[sup.id])}
                                  className={`cursor-pointer group flex items-center gap-1.5 transition-all ${
                                    togglingUserIds[sup.id] ? "opacity-50 pointer-events-none" : ""
                                  }`}
                                  title={sup.activo !== false ? "Clic para desactivar supervisor" : "Clic para activar supervisor"}
                                >
                                  {sup.activo !== false ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 shadow-sm transition-all">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      <span>Activo</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 hover:border-red-400 shadow-sm transition-all">
                                      <span className="w-2 h-2 rounded-full bg-red-400" />
                                      <span>Inactivo</span>
                                    </span>
                                  )}
                                </button>
                              </td>
                              <td className="px-5 py-3">
                                <button
                                  type="button"
                                  onClick={() => setSelectedSupervisorParaEliminar(sup)}
                                  className="p-1.5 px-2.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all cursor-pointer border border-red-200 flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                                  title="Eliminar supervisor de forma permanente"
                                >
                                  <IconTrash className="w-3.5 h-3.5" />
                                  <span>Eliminar</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {adminTab === "auditoria" && (
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                  <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                    <div>
                      <h2 className="font-bold text-sm text-slate-800">Auditoría Global de Cuentas y Gestión de Contraseñas</h2>
                      <p className="text-xs text-slate-500">Como Administrador de TI puedes restablecer contraseñas de cualquier cuenta ante olvidos o bloqueos.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                          {["Usuario", "Nombre Completo", "Rol en el Sistema", "Detalles / Empresa", "Acción TI"].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3 font-mono font-bold text-xs text-slate-800">{u.username}</td>
                            <td className="px-5 py-3 text-xs font-medium text-slate-900">{u.nombre}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${u.role === "admin" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                                u.role === "supervisor" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                  u.role === "contratista" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                    "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-600">{u.empresaNombre || u.turno || u.email}</td>
                            <td className="px-5 py-3">
                              <button
                                onClick={() => {
                                  setSelectedUserParaPassword(u);
                                  setNuevaPassword("");
                                  setConfirmarPassword("");
                                  setPasswordModalError("");
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#0D6E5F] hover:text-white border border-slate-300 hover:border-transparent transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <IconKey className="w-3.5 h-3.5" />
                                <span>Modificar Clave</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

        {/* SUPERVISOR */}
        {currentUser.role === "supervisor" && (
          <main>
            <PageHero
              img={IMG_AERIAL}
              title="Consola de Supervisión y Control HOA"
              subtitle="Dictamen de infracciones móviles, resolución de apelaciones y asignación de proveedores/guardias"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-[calc(100vh-16rem)]">
              {supervisorTab === "bandeja" && (
                <div className="space-y-4">
                  {infraccionesPendientes.filter(i => i.estado === "Pendiente").length === 0 ? (
                    <div className="rounded-2xl border p-12 text-center bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                      <IconCheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <h3 className="font-bold text-slate-800">Sin infracciones pendientes</h3>
                      <p className="text-xs text-slate-500 mt-1">Todos los reportes fotográficos de campo han sido dictaminados.</p>
                    </div>
                  ) : (
                    infraccionesPendientes.filter(i => i.estado === "Pendiente").map((inf) => (
                      <div key={inf.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                        <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-xs text-slate-700 bg-slate-200 px-2.5 py-1 rounded-lg">
                              Folio: {inf.folio}
                            </span>
                            <span className="text-xs text-slate-500 font-semibold">{inf.fecha} · {inf.hora} hrs</span>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${inf.gravedad === "grave" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                            Falta {inf.gravedad.toUpperCase()}
                          </span>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                            <div>
                              <div className="text-xs text-slate-400 font-semibold uppercase">Infracción Detectada en Campo</div>
                              <h3 className="text-base font-bold text-slate-900 mt-0.5">{inf.infraccionCodigo} - {inf.infraccionNombre}</h3>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{inf.descripcion}</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                              <div>
                                <span className="text-slate-400 block">Empresa:</span>
                                <span className="font-bold text-slate-800">{inf.empresaNombre}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Placas:</span>
                                <span className="font-mono font-bold text-slate-800">{inf.placas}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Corbatín:</span>
                                <span className="font-mono font-bold" style={{ color: "var(--color-primary)" }}>#{inf.corbatinNum}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Levantado por:</span>
                                <span className="font-semibold text-slate-800">{inf.agenteNombre}</span>
                              </div>
                            </div>

                            <div className="text-xs text-slate-600">
                              <strong>Ubicación:</strong> {inf.lugar}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Evidencias Fotográficas ({inf.evidencias.length})
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {inf.evidencias.map((foto, idx) => (
                                  <img key={idx} src={foto} alt="Evidencia" className="w-full h-24 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                ))}
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                              <div className="text-amber-800 font-bold">Medida Disciplinaria Sugerida:</div>
                              <div className="text-sm font-bold text-amber-950 mt-0.5">{inf.medidaSugerida}</div>
                              <div className="text-[11px] text-amber-700 mt-1">Al aprobar, se aplicará la suspensión de acceso vehicular en caseta.</div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleAprobarInfraccion(inf)}
                                disabled={Boolean(resolvingInfraccionIds[inf.id])}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                                  resolvingInfraccionIds[inf.id] ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                                }`}
                              >
                                {resolvingInfraccionIds[inf.id] ? (
                                  <>
                                    <IconSpinner className="w-3.5 h-3.5" />
                                    <span>Procesando...</span>
                                  </>
                                ) : (
                                  <>
                                    <IconCheckCircle className="w-4 h-4" />
                                    <span>Aprobar Suspensión</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleRechazarInfraccion(inf)}
                                disabled={Boolean(resolvingInfraccionIds[inf.id])}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all border border-slate-300 cursor-pointer ${
                                  resolvingInfraccionIds[inf.id] ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                                }`}
                              >
                                Desestimar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {supervisorTab === "apelaciones" && (
                <div className="space-y-4">
                  {sanciones.filter(s => s.status === "En Apelación").length === 0 ? (
                    <div className="rounded-2xl border p-12 text-center bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                      <IconCheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <h3 className="font-bold text-slate-800">Sin apelaciones pendientes</h3>
                      <p className="text-xs text-slate-500 mt-1">No hay recursos de reconsideración pendientes de dictamen por parte de los contratistas.</p>
                    </div>
                  ) : (
                    sanciones.filter(s => s.status === "En Apelación").map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl border bg-white shadow-sm overflow-hidden border-sky-300 ring-1 ring-sky-100 hover:shadow-md transition-shadow"
                      >
                        {/* Cabecera del Recurso */}
                        <div className="px-5 py-3.5 border-b bg-sky-50/80 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-sky-600 text-white shrink-0">
                              <IconMessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-sky-900 bg-sky-100/90 px-2 py-0.5 rounded-lg border border-sky-200">
                                  Recurso de Apelación #{s.id}
                                </span>
                                <span className="text-xs text-sky-700 font-medium">
                                  • Interpuesto: {s.apelacion?.fecha || s.fecha}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-slate-900 mt-0.5">{s.tipo}</h4>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                            <span>Pendiente de Dictamen</span>
                          </span>
                        </div>

                        {/* Contenido del Recurso */}
                        <div className="p-5 sm:p-6 space-y-4">
                          {/* Datos Originales */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <IconShield className="w-3.5 h-3.5 text-red-500" />
                                <span>Infracción Original & Sanción</span>
                              </div>
                              <div className="text-xs font-bold text-red-700">{s.medidaDisciplinaria}</div>
                              <div className="text-xs text-slate-600 leading-relaxed mt-1">{s.descripcion}</div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <IconCar className="w-3.5 h-3.5 text-slate-600" />
                                <span>Unidad y Representante Legal</span>
                              </div>
                              <div><strong>Empresa:</strong> <span className="text-slate-800">{s.empresaNombre}</span></div>
                              <div><strong>Placas:</strong> <span className="font-mono font-bold text-slate-900">{s.placas}</span></div>
                              <div><strong>Representante Acreditado:</strong> <span className="text-slate-700">{s.apelacion?.representante || "Representante de la empresa"}</span></div>
                            </div>
                          </div>

                          {/* Argumentos de Aclaración */}
                          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-1.5">
                            <div className="text-amber-900 font-bold uppercase flex items-center gap-1.5">
                              <IconMessageSquare className="w-4 h-4 text-amber-700" />
                              <span>Argumentación / Aclaración Formal del Contratista:</span>
                            </div>
                            <p className="text-slate-800 bg-white/90 p-3 rounded-lg border border-amber-200 leading-relaxed italic text-xs sm:text-sm">
                              "{s.apelacion?.argumentos}"
                            </p>
                          </div>

                          {/* Acciones de Dictamen */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-end">
                            <button
                              onClick={() => handleAceptarApelacion(s.id, "Apelación procedente. Se levanta la suspensión vehicular y se deja sin efectos la medida.")}
                              disabled={Boolean(resolvingSancionIds[s.id])}
                              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                                resolvingSancionIds[s.id] ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                              }`}
                            >
                              {resolvingSancionIds[s.id] ? (
                                <>
                                  <IconSpinner className="w-3.5 h-3.5" />
                                  <span>Procesando resolución...</span>
                                </>
                              ) : (
                                <>
                                  <IconCheckCircle className="w-4 h-4" />
                                  <span>Aceptar Apelación y Levantar Suspensión</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRatificarSancion(s.id, "Apelación improcedente. Se ratifica la suspensión por no aportar elementos suficientes.")}
                              disabled={Boolean(resolvingSancionIds[s.id])}
                              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                resolvingSancionIds[s.id] ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                              }`}
                            >
                              {resolvingSancionIds[s.id] ? (
                                <>
                                  <IconSpinner className="w-3.5 h-3.5" />
                                  <span>Procesando...</span>
                                </>
                              ) : (
                                <>
                                  <IconAlertTriangle className="w-4 h-4" />
                                  <span>Ratificar Sanción (Rechazar)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {supervisorTab === "proveedores" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                    <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                      <div>
                        <h2 className="font-bold text-sm text-slate-800">Catálogo de Proveedores y Empresas Externas</h2>
                        <p className="text-xs text-slate-500">Crea las cuentas de acceso para que los contratistas gestionen su flotilla y corbatines.</p>
                      </div>
                      <button
                        onClick={() => setShowCreateEmpresaModal(true)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
                        style={{ background: "var(--color-primary)" }}
                      >
                        <IconUserPlus className="w-3.5 h-3.5" />
                        <span>+ Registrar Empresa Proveedora</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                            {["ID", "Empresa", "RFC", "Contacto Titular", "Teléfono", "Vehículos", "Creado Por"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {empresas.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-500">
                                <IconBuilding className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                No hay empresas proveedoras registradas. Haz clic en "+ Registrar Empresa Proveedora" para dar de alta una nueva.
                              </td>
                            </tr>
                          ) : (
                            empresas.map((emp) => (
                              <tr key={emp.id} className="hover:bg-slate-50">
                                <td className="px-5 py-3 font-mono text-xs font-bold text-slate-700">{emp.id}</td>
                                <td className="px-5 py-3 font-bold text-xs text-slate-900">{emp.nombre}</td>
                                <td className="px-5 py-3 font-mono text-xs text-slate-600">{emp.rfc}</td>
                                <td className="px-5 py-3 text-xs text-slate-800">{emp.contacto}</td>
                                <td className="px-5 py-3 text-xs font-mono text-slate-600">{emp.telefono}</td>
                                <td className="px-5 py-3 font-mono font-bold" style={{ color: "var(--color-primary)" }}>
                                  {vehicles.filter(v => v.empresaId === emp.id).length} unidades
                                </td>
                                <td className="px-5 py-3 text-xs text-slate-500">{emp.creadoPor}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {supervisorTab === "guardias" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                    <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                      <div>
                        <h2 className="font-bold text-sm text-slate-800">Oficiales Asignados a Casetas</h2>
                        <p className="text-xs text-slate-500">Crea y asigna cuentas para guardias que operan en tablets de caseta.</p>
                      </div>
                      <button
                        onClick={() => {
                          setNuevoGuardiaFoto("");
                          setNuevoGuardiaFotoError("");
                          setShowCreateGuardiaModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-sm"
                        style={{ background: "var(--color-primary)" }}
                      >
                        <IconUserPlus className="w-3.5 h-3.5" />
                        <span>+ Nuevo Oficial de Caseta</span>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                            {["Fotografía", "ID", "Nombre Oficial", "Usuario / Acceso", "Fecha Alta", "Creado Por", "Estatus"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {users.filter(u => u.role === "caseta").length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-500">
                                <IconUsers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                No hay oficiales de caseta registrados en PostgreSQL.
                              </td>
                            </tr>
                          ) : (
                            users.filter(u => u.role === "caseta").map((g) => (
                              <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3">
                                  {g.foto_url ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedFotoGuardiaPreview(g)}
                                      className="cursor-pointer group block relative"
                                      title="Clic para ver fotografía ampliada"
                                    >
                                      <img
                                        src={g.foto_url}
                                        alt={g.nombre}
                                        className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200 group-hover:border-[#0D6E5F] shadow-sm transition-all group-hover:scale-105"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                          if (fallback) fallback.style.display = "flex";
                                        }}
                                      />
                                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 hidden items-center justify-center text-slate-500 font-bold text-xs">
                                        {g.nombre.charAt(0)}
                                      </div>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedFotoGuardiaPreview(g)}
                                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs cursor-pointer transition-all hover:scale-105"
                                      title="Clic para ver o subir fotografía del oficial"
                                    >
                                      {g.nombre.charAt(0)}
                                    </button>
                                  )}
                                </td>
                                <td className="px-5 py-3 font-mono text-xs font-bold text-slate-700">{g.id}</td>
                                <td className="px-5 py-3 font-bold text-xs text-slate-900">{g.nombre}</td>
                                <td className="px-5 py-3 font-mono text-xs text-slate-600">{g.username}</td>
                                <td className="px-5 py-3 text-xs text-slate-500">{g.fechaCreacion}</td>
                                <td className="px-5 py-3 text-xs text-slate-500">{g.creadoPor}</td>
                                <td className="px-5 py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActivoUsuario(g)}
                                    disabled={Boolean(togglingUserIds[g.id])}
                                    className={`cursor-pointer group flex items-center gap-1.5 transition-all ${
                                      togglingUserIds[g.id] ? "opacity-50 pointer-events-none" : ""
                                    }`}
                                    title={g.activo !== false ? "Clic para desactivar oficial" : "Clic para activar oficial"}
                                  >
                                    {g.activo !== false ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 shadow-sm transition-all">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span>En Servicio</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 hover:border-red-400 shadow-sm transition-all">
                                        <span className="w-2 h-2 rounded-full bg-red-400" />
                                        <span>Inactivo</span>
                                      </span>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {supervisorTab === "historial" && (
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                  <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                    <h2 className="font-bold text-sm text-slate-800">Historial de Resoluciones y Medidas Disciplinarias</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                          {["Folio", "Fecha", "Empresa", "Placas", "Falta", "Resolución / Dictamen", "Estatus"].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sanciones.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-500">
                              <IconCheckCircle className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
                              Sin historial de sanciones o resoluciones registradas en PostgreSQL.
                            </td>
                          </tr>
                        ) : (
                          sanciones.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="px-5 py-3 font-mono font-bold text-xs">{s.id}</td>
                              <td className="px-5 py-3 text-xs text-slate-500">{s.fecha}</td>
                              <td className="px-5 py-3 text-xs font-semibold text-slate-800">{s.empresaNombre}</td>
                              <td className="px-5 py-3 text-xs font-mono font-bold">{s.placas}</td>
                              <td className="px-5 py-3 text-xs text-slate-700">{s.tipo}</td>
                              <td className="px-5 py-3 text-xs text-slate-600">
                                {s.apelacion?.dictamenSupervisor || s.medidaDisciplinaria}
                              </td>
                              <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

        {/* CONTRATISTA */}
        {currentUser.role === "contratista" && (
          <main>
            {portalScreen === "reglamento" && (
              <div className="min-h-[85vh]">
                <PageHero img={IMG_GATE} title="Reglamento de Colaboradores Externos" subtitle="Debes leer el reglamento completo y firmar digitalmente para desbloquear los módulos de alta y corbatines" />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                  <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                    <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                      <span className="text-sm font-bold text-slate-800">Documento Oficial HOA</span>
                      <span className="text-xs px-2.5 py-1 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold">
                        Requisito Obligatorio
                      </span>
                    </div>
                    <pre className="text-sm leading-7 whitespace-pre-wrap px-6 py-5 text-slate-700 max-h-96 overflow-y-auto">
                      {REGLAMENTO_TEXT}
                    </pre>
                  </div>

                  <div className="rounded-2xl border p-6 space-y-4 bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Firma Digital del Representante</h2>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="acceptCheck"
                        className="mt-1 w-4 h-4 text-emerald-600 rounded"
                      />
                      <span className="text-sm text-slate-700 leading-relaxed">
                        He leído y acepto en su totalidad el Reglamento de Colaboradores Externos de Las Palomas Rocky Point HOA, comprometiéndome al estricto cumplimiento de sus cláusulas y medidas disciplinarias.
                      </span>
                    </label>
                    <div>
                      <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                        Nombre completo del representante legal o titular
                      </label>
                      <input
                        type="text"
                        id="repName"
                        placeholder="Ej. Ing. Roberto Garza Leal"
                        defaultValue={currentUser?.nombre || ""}
                        className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 italic"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        disabled={isSubmittingReglamento}
                        onClick={async () => {
                          if (isSubmittingReglamentoRef.current) return;
                          isSubmittingReglamentoRef.current = true;
                          setIsSubmittingReglamento(true);
                          try {
                            const repNameInput = (document.getElementById("repName") as HTMLInputElement)?.value || currentUser?.nombre || "";
                            const currentEmp = empresas.find(e => e.nombre === currentUser?.empresaNombre) || empresas[0];
                            try {
                              await api.aceptarReglamento({
                                id_empresa: currentEmp?.id || 1,
                                id_usuario: currentUser?.id || 1,
                                firma_nombre: repNameInput
                              });
                            } catch (err) {
                              console.warn("Error guardando aceptación de reglamento en BD:", err);
                            }
                            if (currentUser) {
                              setUsers(users.map(u => u.id === currentUser.id ? { ...u, hasAcceptedReglamento: true } : u));
                              setCurrentUser({ ...currentUser, hasAcceptedReglamento: true });
                            }
                            setPortalScreen("dashboard");
                            showToast("Reglamento aceptado y firmado digitalmente con éxito.", "success", "Firma Registrada");
                          } finally {
                            isSubmittingReglamentoRef.current = false;
                            setIsSubmittingReglamento(false);
                          }
                        }}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 cursor-pointer flex items-center gap-2 ${
                          isSubmittingReglamento ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                        }`}
                        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))" }}
                      >
                        {isSubmittingReglamento ? (
                          <>
                            <IconSpinner className="w-4 h-4" />
                            <span>Firmando Reglamento...</span>
                          </>
                        ) : (
                          <span>Aceptar y Firmar Digitalmente →</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {portalScreen === "dashboard" && (
              <div>
                <PageHero
                  img={IMG_COAST}
                  title={`Panel de Contratista — ${currentUser.empresaNombre}`}
                  subtitle="Administración de flotilla vehicular, plantilla de trabajadores acreditados y control de accesos"
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[calc(100vh-16rem)]">
                  {/* KPI Statistics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Flotilla", value: `${vehicles.filter(v => v.empresaNombre === currentUser.empresaNombre).length} unidades`, color: "var(--color-primary)", bg: "var(--color-primary-light)", icon: <IconCar className="w-5 h-5 text-[#0D6E5F]" /> },
                      { label: "Vehículos Habilitados", value: `${vehicles.filter(v => v.empresaNombre === currentUser.empresaNombre && v.status === "Habilitado").length} autorizados`, color: "var(--color-success)", bg: "var(--color-success-light)", icon: <IconCheckCircle className="w-5 h-5 text-emerald-600" /> },
                      { label: "Plantilla Personal", value: `${trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre).length} trabajadores`, color: "#1e40af", bg: "#dbeafe", icon: <IconUsers className="w-5 h-5 text-blue-700" /> },
                      { label: "Personal Autorizado", value: `${trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre && t.activo).length} activos`, color: "var(--color-success)", bg: "var(--color-success-light)", icon: <IconUserCheck className="w-5 h-5 text-emerald-600" /> },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border p-5 flex items-start gap-4 bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                          {s.icon}
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                          <div className="text-xs font-medium text-slate-500">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen de Trabajadores Widget */}
                  <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 py-4 border-b bg-slate-50 gap-3" style={{ borderColor: "var(--color-border)" }}>
                      <div>
                        <h2 className="font-bold text-base text-slate-800">Plantilla de Trabajadores y Colaboradores</h2>
                        <p className="text-xs text-slate-500">Personal acreditado para ingreso a obras y mantenimiento en Las Palomas</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAbrirCrearTrabajador}
                          className="text-xs px-3.5 py-2 rounded-xl font-bold text-white transition-all hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-sm"
                          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))" }}
                        >
                          <IconUserPlus className="w-3.5 h-3.5" />
                          <span>+ Agregar Trabajador</span>
                        </button>
                        <button
                          onClick={() => setPortalScreen("trabajadores")}
                          className="text-xs px-3.5 py-2 rounded-xl font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                        >
                          Ver Lista Completa →
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                            {["Fotografía", "Nombre Completo", "Teléfono Celular", "Estatus Acceso", "Fecha de Registro", "Acciones"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const empTrabajadores = trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre);
                            if (empTrabajadores.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={6} className="py-8 text-center text-slate-400">
                                    <IconUsers className="w-8 h-8 mx-auto mb-1 opacity-30" />
                                    <span>No hay trabajadores registrados para {currentUser.empresaNombre}.</span>
                                  </td>
                                </tr>
                              );
                            }
                            return empTrabajadores.slice(0, 4).map((t) => (
                              <tr key={t.id_trabajador} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3">
                                  <div
                                    onClick={() => setSelectedFotoTrabajadorPreview(t)}
                                    className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform bg-slate-100 flex items-center justify-center shrink-0"
                                  >
                                    {t.foto_url ? (
                                      <img src={t.foto_url} alt={`${t.nombre} ${t.apellidos}`} className="w-full h-full object-cover" />
                                    ) : (
                                      <IconUsers className="w-5 h-5 text-slate-400" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-3 font-medium text-slate-900">
                                  <div className="font-bold">{t.nombre} {t.apellidos}</div>
                                  <div className="text-[11px] font-mono text-slate-400">ID: #{t.id_trabajador}</div>
                                </td>
                                <td className="px-5 py-3 font-mono text-xs text-slate-600">
                                  {t.telefono || "—"}
                                </td>
                                <td className="px-5 py-3">
                                  <button
                                    onClick={() => handleToggleActivoTrabajador(t)}
                                    disabled={Boolean(togglingTrabajadorIds[t.id_trabajador])}
                                    className={`cursor-pointer group flex items-center gap-1.5 ${
                                      togglingTrabajadorIds[t.id_trabajador] ? "opacity-50 pointer-events-none" : ""
                                    }`}
                                    title="Clic para cambiar estatus"
                                  >
                                    {t.activo ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Autorizado
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                        Inactivo
                                      </span>
                                    )}
                                  </button>
                                </td>
                                <td className="px-5 py-3 text-xs font-mono text-slate-500">
                                  {t.created_at}
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleAbrirEditarTrabajador(t)}
                                      className="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-[#0D6E5F] hover:text-white transition-colors cursor-pointer"
                                      title="Modificar trabajador"
                                    >
                                      <IconEdit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setSelectedTrabajadorParaEliminar(t)}
                                      className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors cursor-pointer border border-red-100"
                                      title="Eliminar trabajador"
                                    >
                                      <IconTrash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Flotilla Vehicular Widget */}
                  <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-slate-50" style={{ borderColor: "var(--color-border)" }}>
                      <h2 className="font-bold text-base text-slate-800">Unidades Vehiculares de {currentUser.empresaNombre}</h2>
                      <button onClick={() => setPortalScreen("alta")} className="text-xs px-4 py-2 rounded-xl font-semibold text-white transition-all hover:brightness-110 cursor-pointer" style={{ background: "var(--color-primary)" }}>
                        + Agregar Vehículo
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                            {["Fotografía", "Vehículo", "Placas", "Color", "Teléfono", "Corbatín", "Estatus"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {vehicles.filter(v => v.empresaNombre === currentUser.empresaNombre).map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3">
                                {v.foto ? (
                                  <img
                                    src={normalizeFotoUrl(v.foto)}
                                    alt={`${v.marca} ${v.modelo}`}
                                    className="w-14 h-10 object-cover rounded-lg border border-slate-200 shadow-sm"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                    <IconCar className="w-5 h-5" />
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3 font-medium text-slate-900">{v.marca} {v.modelo} <span className="text-slate-400 font-normal">({v.anio})</span></td>
                              <td className="px-5 py-3 font-mono font-bold text-slate-800">{v.placas}</td>
                              <td className="px-5 py-3 text-slate-500">{v.color}</td>
                              <td className="px-5 py-3 text-slate-500 font-mono text-xs">{v.telefono}</td>
                              <td className="px-5 py-3 font-mono font-bold" style={{ color: "var(--color-primary)" }}>#{v.corbatinNum}</td>
                              <td className="px-5 py-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleEstatusVehiculo(v)}
                                  disabled={Boolean(togglingVehiculoIds[v.id])}
                                  className={`cursor-pointer transition-all active:scale-95 group flex items-center ${
                                    togglingVehiculoIds[v.id] ? "opacity-50 pointer-events-none" : ""
                                  }`}
                                  title={v.status === "Habilitado" ? "Clic para deshabilitar vehículo" : "Clic para habilitar vehículo"}
                                >
                                  {v.status === "Habilitado" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 shadow-sm transition-all">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>Habilitado</span>
                                    </span>
                                  ) : v.status === "Suspendido" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 hover:border-red-400 shadow-sm transition-all">
                                      <span className="w-2 h-2 rounded-full bg-red-500" />
                                      <span>Suspendido</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 hover:border-slate-400 shadow-sm transition-all">
                                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                                      <span>Deshabilitado</span>
                                    </span>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {portalScreen === "alta" && (
              <div>
                <PageHero img={IMG_GATE} title="Registro de Unidades Vehiculares" subtitle="Registra los vehículos autorizados de tu empresa con fotografía y datos oficiales" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                  <div className="rounded-2xl border p-6 sm:p-7 bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                    <h2 className="font-bold text-sm mb-5 uppercase tracking-wider text-slate-800">
                      Datos del Nuevo Vehículo
                    </h2>
                    <form
                      onSubmit={handleGuardarNuevoVehiculo}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600">Marca *</label>
                          <input name="marca" required placeholder="Toyota, Ford, Nissan" className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600">Modelo *</label>
                          <input name="modelo" required placeholder="Hilux, Transit, NP300" className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600">Año *</label>
                          <input name="año" required placeholder="2023" className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600">Placas *</label>
                          <input name="placas" required placeholder="MTY-0000-A" className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 font-mono font-bold" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold mb-1 text-slate-600">Color *</label>
                          <input name="color" required placeholder="Blanco, Gris, Negro" className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200" />
                        </div>
                      </div>

                      {/* Fotografía Obligatoria del Vehículo */}
                      <div className="pt-2 border-t border-slate-100 space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Fotografía Oficial del Vehículo *
                        </label>

                        {nuevoVehiculoFotoError && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                            <IconAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{nuevoVehiculoFotoError}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="md:col-span-2 space-y-2">
                            <label className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-sm w-fit">
                              <IconCamera className="w-4 h-4 text-[#0D6E5F]" />
                              <span>Subir Foto desde Dispositivo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFotoVehiculoChange}
                              />
                            </label>
                            <p className="text-[11px] text-slate-400">
                              Formatos permitidos: JPG, PNG, WEBP.
                            </p>
                          </div>

                          <div className="h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                            {nuevoVehiculoFoto ? (
                              <div className="relative w-full h-full group">
                                <img src={nuevoVehiculoFoto} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                  Foto Cargada ✓
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-3 text-slate-400">
                                <IconCamera className="w-7 h-7 mx-auto mb-1 opacity-50" />
                                <span className="text-[11px] block">Vista previa de la unidad</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          type="submit"
                          disabled={isSubmittingVehiculo}
                          className={`px-7 py-3 rounded-xl text-sm font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                            isSubmittingVehiculo ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                          }`}
                          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))" }}
                        >
                          {isSubmittingVehiculo ? (
                            <>
                              <IconSpinner className="w-4 h-4" />
                              <span>Registrando Unidad...</span>
                            </>
                          ) : (
                            <span>Registrar y Generar Corbatín</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN TRABAJADORES (PERFIL CONTRATISTA - DICCIONARIO DE DATOS) */}
            {portalScreen === "trabajadores" && (
              <div>
                <PageHero
                  img={IMG_GATE}
                  title={`Plantilla de Trabajadores — ${currentUser.empresaNombre}`}
                  subtitle="Acreditación, consulta, modificación y control de acceso del personal de la empresa"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[calc(100vh-16rem)]">
                  {/* KPI Cards for Trabajadores */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border p-5 flex items-start gap-4 bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-primary-light)" }}>
                        <IconUsers className="w-5 h-5 text-[#0D6E5F]" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                          {trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre).length}
                        </div>
                        <div className="text-xs font-medium text-slate-500">Total Colaboradores Registrados</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border p-5 flex items-start gap-4 bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-success-light)" }}>
                        <IconUserCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: "var(--color-success)", fontFamily: "var(--font-display)" }}>
                          {trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre && t.activo).length}
                        </div>
                        <div className="text-xs font-medium text-slate-500">Autorizados (Acceso Activo)</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border p-5 flex items-start gap-4 bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--color-danger-light)" }}>
                        <IconUserX className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: "var(--color-danger)", fontFamily: "var(--font-display)" }}>
                          {trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre && !t.activo).length}
                        </div>
                        <div className="text-xs font-medium text-slate-500">Inactivos / Sin Acceso</div>
                      </div>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
                    <div className="relative w-full md:w-80">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <IconSearch className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar por nombre, apellidos o celular..."
                        value={trabajadorSearchTerm}
                        onChange={(e) => setTrabajadorSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all text-slate-800"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estatus:</span>
                        <select
                          value={trabajadorStatusFilter}
                          onChange={(e) => setTrabajadorStatusFilter(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        >
                          <option value="todos">Todos los estatus</option>
                          <option value="activos">Solo Autorizados (Activos)</option>
                          <option value="inactivos">Solo Inactivos</option>
                        </select>
                      </div>

                      <button
                        onClick={handleAbrirCrearTrabajador}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 flex items-center gap-1.5 cursor-pointer shadow-md"
                        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))" }}
                      >
                        <IconUserPlus className="w-4 h-4" />
                        <span>+ Registrar Trabajador</span>
                      </button>
                    </div>
                  </div>

                  {/* Workers Table */}
                  <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-slate-50" style={{ borderColor: "var(--color-border)" }}>
                      <div>
                        <h2 className="font-bold text-base text-slate-800">Nómina de Personal Acreditado</h2>
                        <p className="text-xs text-slate-500">Consulta los colaboradores dados de alta, modifica sus datos o elimina registros</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre).length} registros
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                            {["Fotografía", "Nombre Completo", "Teléfono Celular", "Empresa", "Estatus Acceso", "Auditoría (Registro / Modif.)", "Acciones"].map((h) => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const empTrabajadores = trabajadores.filter(t => t.empresaNombre === currentUser.empresaNombre);
                            const filtered = empTrabajadores.filter(t => {
                              const matchesSearch =
                                t.nombre.toLowerCase().includes(trabajadorSearchTerm.toLowerCase()) ||
                                t.apellidos.toLowerCase().includes(trabajadorSearchTerm.toLowerCase()) ||
                                (t.telefono || "").toLowerCase().includes(trabajadorSearchTerm.toLowerCase());
                              const matchesStatus =
                                trabajadorStatusFilter === "todos" ||
                                (trabajadorStatusFilter === "activos" && t.activo) ||
                                (trabajadorStatusFilter === "inactivos" && !t.activo);
                              return matchesSearch && matchesStatus;
                            });

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={7} className="py-12 text-center text-slate-400">
                                    <IconUsers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <div className="font-bold text-slate-700">No se encontraron trabajadores</div>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {trabajadorSearchTerm ? "Prueba cambiando el término de búsqueda o filtro." : "Aún no has registrado colaboradores para esta empresa."}
                                    </p>
                                    <button
                                      onClick={handleAbrirCrearTrabajador}
                                      className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:brightness-110 cursor-pointer"
                                    >
                                      + Dar de alta primer trabajador
                                    </button>
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((t) => (
                              <tr key={t.id_trabajador} className="hover:bg-slate-50 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div
                                    onClick={() => setSelectedFotoTrabajadorPreview(t)}
                                    className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:scale-105 transition-transform relative group bg-slate-100 flex items-center justify-center shrink-0"
                                    title="Clic para ampliar fotografía"
                                  >
                                    {t.foto_url ? (
                                      <img src={t.foto_url} alt={`${t.nombre} ${t.apellidos}`} className="w-full h-full object-cover" />
                                    ) : (
                                      <IconUsers className="w-6 h-6 text-slate-400" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                      <IconEye className="w-4 h-4" />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="font-bold text-slate-900 text-sm">{t.nombre} {t.apellidos}</div>
                                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">ID: #{t.id_trabajador}</div>
                                </td>
                                <td className="px-5 py-3.5 font-mono text-xs">
                                  {t.telefono ? (
                                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                      <IconPhone className="w-3.5 h-3.5 text-slate-400" />
                                      {t.telefono}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Sin registrar</span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-xs font-semibold text-[#0D6E5F]">
                                  {t.empresaNombre}
                                </td>
                                <td className="px-5 py-3.5">
                                  <button
                                    onClick={() => handleToggleActivoTrabajador(t)}
                                    disabled={Boolean(togglingTrabajadorIds[t.id_trabajador])}
                                    className={`cursor-pointer group flex items-center gap-1.5 text-left ${
                                      togglingTrabajadorIds[t.id_trabajador] ? "opacity-50 pointer-events-none" : ""
                                    }`}
                                    title="Clic para alternar estatus (Activo / Inactivo)"
                                  >
                                    {t.activo ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Autorizado (Activo)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 group-hover:bg-red-100 transition-colors">
                                        <span className="w-2 h-2 rounded-full bg-red-400" />
                                        Inactivo (Sin Acceso)
                                      </span>
                                    )}
                                  </button>
                                </td>
                                <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                                  <div><strong className="text-slate-400 font-sans font-semibold">Alta:</strong> {t.created_at}</div>
                                  <div><strong className="text-slate-400 font-sans font-semibold">Modif:</strong> {t.updated_at}</div>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleAbrirEditarTrabajador(t)}
                                      className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-[#0D6E5F] hover:text-white transition-colors cursor-pointer"
                                      title="Modificar datos del trabajador"
                                    >
                                      <IconEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setSelectedTrabajadorParaEliminar(t)}
                                      className="p-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-colors cursor-pointer border border-red-100"
                                      title="Eliminar trabajador del sistema"
                                    >
                                      <IconTrash className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {portalScreen === "corbatin" && (
              <div>
                <PageHero img={IMG_PARK} title="Descarga e Impresión de Corbatines PDF" subtitle="Visualiza y descarga el corbatín físico con código QR para colocar en el retrovisor" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-16rem)]">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-72 shrink-0 no-print">
                      <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                        <div className="px-5 py-4 border-b bg-slate-50" style={{ borderColor: "var(--color-border)" }}>
                          <h2 className="font-bold text-sm text-slate-800">Seleccionar Vehículo</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {(() => {
                            const empVehicles = vehicles.filter((v) =>
                              !currentUser.empresaNombre ||
                              (v.empresaNombre || "").trim().toLowerCase() === (currentUser.empresaNombre || "").trim().toLowerCase()
                            );
                            const listToRender = empVehicles.length > 0 ? empVehicles : vehicles;
                            if (listToRender.length === 0) {
                              return (
                                <div className="p-5 text-center text-xs text-slate-500">
                                  No hay vehículos registrados para tu empresa.
                                </div>
                              );
                            }
                            const activeVeh = listToRender.find((v) => v.id === selectedCorbatinVehicleId) || listToRender[0];
                            return listToRender.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => setSelectedCorbatinVehicleId(v.id)}
                                className={`w-full text-left px-5 py-4 transition-all hover:bg-slate-50 cursor-pointer ${
                                  activeVeh?.id === v.id ? "bg-[#E6F4F1] border-l-4 border-[#0D6E5F]" : ""
                                }`}
                              >
                                <div className="font-semibold text-sm text-slate-800">{v.marca} {v.modelo}</div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">{v.placas} · Corbatín #{v.corbatinNum || "101"}</div>
                                <div className="mt-1.5"><StatusBadge status={v.status} /></div>
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      {(() => {
                        const empVehicles = vehicles.filter((v) =>
                          !currentUser.empresaNombre ||
                          (v.empresaNombre || "").trim().toLowerCase() === (currentUser.empresaNombre || "").trim().toLowerCase()
                        );
                        const listToRender = empVehicles.length > 0 ? empVehicles : vehicles;
                        const veh = listToRender.find((v) => v.id === selectedCorbatinVehicleId) || listToRender[0];

                        if (!veh) {
                          return (
                            <div className="rounded-2xl border p-12 text-center bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                              <h3 className="font-bold text-slate-800 mb-1">Sin vehículos disponibles</h3>
                              <p className="text-xs text-slate-500">No hay vehículos registrados para generar corbatín en este momento.</p>
                            </div>
                          );
                        }

                        return (
                          <>
                            <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" id="corbatin-container" style={{ borderColor: "var(--color-border)" }}>
                              <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between no-print" style={{ borderColor: "var(--color-border)" }}>
                                <div>
                                  <h2 className="font-bold text-sm text-slate-800">Vista Previa — Corbatín #{veh.corbatinNum || "101"}</h2>
                                  <p className="text-xs text-slate-500">{veh.marca} {veh.modelo} · {veh.placas}</p>
                                </div>
                                <StatusBadge status={veh.status} />
                              </div>
                              <div className="p-4 sm:p-6 overflow-x-auto bg-slate-100 flex justify-center">
                                <CorbatinDocument vehicle={veh} />
                              </div>
                            </div>
                            <div className="flex gap-3 no-print">
                              <button
                                onClick={() => handleDescargarPDFDirecto(veh)}
                                disabled={isGeneratingPDF}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:brightness-110 active:scale-[0.98] flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))" }}
                              >
                                <IconFileText className="w-4 h-4" />
                                <span>{isGeneratingPDF ? "Generando Archivo PDF..." : "Descargar Corbatín en PDF (.pdf)"}</span>
                              </button>
                              <button
                                onClick={() => window.print()}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm"
                              >
                                Imprimir
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SANCIONES & APELACIÓN */}
            {portalScreen === "sanciones" && (
              <div>
                <PageHero img={IMG_AERIAL} title="Historial de Sanciones & Módulo de Apelación" subtitle="Consulta de suspensiones vehiculares, interposición de recursos y resoluciones de HOA" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-[calc(100vh-16rem)]">
                  {(() => {
                    const empresaSanciones = currentUser.empresaNombre
                      ? sanciones.filter(s => s.empresaNombre === currentUser.empresaNombre)
                      : sanciones;

                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="rounded-2xl border p-5 bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Sanciones</div>
                            <div className="text-2xl font-bold text-slate-800">{empresaSanciones.length} registros</div>
                          </div>
                          <div className="rounded-2xl border p-5 bg-red-50 border-red-200">
                            <div className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">Suspensiones Activas</div>
                            <div className="text-2xl font-bold text-red-600">
                              {empresaSanciones.filter(s => s.status === "Activa" || s.status === "Ratificada").length} vehículos
                            </div>
                          </div>
                          <div className="rounded-2xl border p-5 bg-sky-50 border-sky-200">
                            <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">En Trámite de Apelación</div>
                            <div className="text-2xl font-bold text-sky-700">
                              {empresaSanciones.filter(s => s.status === "En Apelación").length} en revisión
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {empresaSanciones.length === 0 ? (
                            <div className="rounded-2xl border p-12 bg-white shadow-sm text-center space-y-3" style={{ borderColor: "var(--color-border)" }}>
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                                <IconCheckCircle className="w-6 h-6" />
                              </div>
                              <h3 className="text-base font-bold text-slate-800">Sin Sanciones Registradas</h3>
                              <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Tu empresa no cuenta con infracciones ni suspensiones registradas en la base de datos de HOA. Toda tu flotilla y personal se encuentran en regla.
                              </p>
                            </div>
                          ) : (
                            empresaSanciones.map((s) => (
                              <div
                                key={s.id}
                                className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
                                  s.status === "En Apelación"
                                    ? "border-sky-300 ring-1 ring-sky-100"
                                    : s.status === "Ratificada"
                                    ? "border-amber-300 ring-1 ring-amber-100"
                                    : s.status === "Aclarada"
                                    ? "border-emerald-300 ring-1 ring-emerald-100"
                                    : "border-slate-200"
                                }`}
                              >
                                {/* Cabecera de la Sanción */}
                                <div
                                  className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
                                    s.status === "En Apelación"
                                      ? "bg-sky-50/70"
                                      : s.status === "Ratificada"
                                      ? "bg-amber-50/70"
                                      : s.status === "Aclarada"
                                      ? "bg-emerald-50/70"
                                      : s.status === "Activa"
                                      ? "bg-red-50/50"
                                      : "bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`p-2 rounded-xl text-white shrink-0 ${
                                        s.status === "En Apelación"
                                          ? "bg-sky-600"
                                          : s.status === "Ratificada"
                                          ? "bg-amber-600"
                                          : s.status === "Aclarada"
                                          ? "bg-emerald-600"
                                          : s.status === "Activa"
                                          ? "bg-red-600"
                                          : "bg-slate-600"
                                      }`}
                                    >
                                      <IconAlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                                        {s.tipo}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                                        <span className="font-mono font-bold text-slate-700 bg-white/90 px-2 py-0.5 rounded border border-slate-200">
                                          Folio #{s.id}
                                        </span>
                                        <span>•</span>
                                        <span className="font-mono font-semibold text-slate-700">
                                          Placas: <strong className="text-slate-900">{s.placas}</strong>
                                        </span>
                                        <span>•</span>
                                        <span>Fecha: {s.fecha}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <StatusBadge status={s.status} />
                                  </div>
                                </div>

                                {/* Cuerpo Estructurado */}
                                <div className="p-5 sm:p-6 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {/* Medida Disciplinaria */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <IconShield className="w-3.5 h-3.5 text-red-500" />
                                        <span>Medida Disciplinaria / Estatus</span>
                                      </div>
                                      <div className="text-xs sm:text-sm font-bold text-red-700 leading-snug">
                                        {s.medidaDisciplinaria || "Amonestación / Suspensión de acceso"}
                                      </div>
                                    </div>

                                    {/* Motivo de la Infracción */}
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <IconFileText className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Descripción de los Hechos</span>
                                      </div>
                                      <div className="text-xs font-medium text-slate-700 leading-relaxed">
                                        {s.descripcion || "Infracción detectada en instalaciones"}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sección de Apelación y Dictamen */}
                                  {s.apelacion && (
                                    <div
                                      className={`rounded-xl border p-4 space-y-3 ${
                                        s.status === "Aclarada"
                                          ? "bg-emerald-50/50 border-emerald-200"
                                          : s.status === "Ratificada"
                                          ? "bg-amber-50/50 border-amber-200"
                                          : "bg-sky-50/60 border-sky-200"
                                      }`}
                                    >
                                      <div
                                        className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5"
                                        style={{ borderColor: "rgba(0,0,0,0.06)" }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <IconMessageSquare className="w-4 h-4 text-sky-700" />
                                          <span className="font-bold text-xs uppercase tracking-wide text-slate-800">
                                            Recurso de Apelación e Inconformidad
                                          </span>
                                          <span className="text-xs text-slate-500 font-mono">({s.apelacion.fecha})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-slate-500">
                                            Firmado por: <strong className="text-slate-700">{s.apelacion.representante}</strong>
                                          </span>
                                          <span
                                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                              s.apelacion.estado === "Aprobada"
                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                : s.apelacion.estado === "Rechazada"
                                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                                : "bg-sky-100 text-sky-800 border border-sky-300"
                                            }`}
                                          >
                                            {s.apelacion.estado === "Aprobada"
                                              ? "Apelación Procedente"
                                              : s.apelacion.estado === "Rechazada"
                                              ? "Apelación Rechazada"
                                              : "Pendiente de Dictamen"}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <div className="text-[11px] font-semibold uppercase text-slate-500">
                                          Argumentos / Pruebas del Contratista:
                                        </div>
                                        <p className="text-xs text-slate-800 bg-white/90 p-3 rounded-lg border border-slate-200/80 leading-relaxed italic">
                                          "{s.apelacion.argumentos}"
                                        </p>
                                      </div>

                                      {s.apelacion.dictamenSupervisor && (
                                        <div
                                          className={`p-3.5 rounded-xl border space-y-1 ${
                                            s.status === "Aclarada"
                                              ? "bg-emerald-100/70 border-emerald-300 text-emerald-950"
                                              : "bg-amber-100/70 border-amber-300 text-amber-950"
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5 font-bold text-xs uppercase">
                                            <IconCheckCircle className="w-3.5 h-3.5" />
                                            <span>
                                              Dictamen Oficial de Supervisión HOA{" "}
                                              {s.apelacion.fechaDictamen ? `(${s.apelacion.fechaDictamen})` : ""}:
                                            </span>
                                          </div>
                                          <p className="text-xs font-semibold leading-relaxed">
                                            {s.apelacion.dictamenSupervisor}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Botones de Acción */}
                                  {s.status === "Activa" && (
                                    <div className="flex flex-wrap gap-2.5 pt-1">
                                      <button
                                        onClick={() => setSelectedSancionParaApelar(s)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                      >
                                        <IconMessageSquare className="w-3.5 h-3.5" />
                                        <span>Interponer Apelación / Aclaración</span>
                                      </button>
                                      <button
                                        onClick={async () => {
                                          try {
                                            await api.updateSancion(s.id, { estatus: "VENCIDA" });
                                            await loadDatabaseData();
                                          } catch (e) {
                                            setSanciones((prev) =>
                                              prev.map((item) =>
                                                item.id === s.id ? { ...item, status: "Cumplida" as const } : item
                                              )
                                            );
                                          }
                                          showToast(
                                            "Se ha registrado el cumplimiento formal de la suspensión.",
                                            "success",
                                            "Sanción Cumplida"
                                          );
                                        }}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                                      >
                                        Registrar Cumplimiento
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </main>
        )}

        {/* CASETA */}
        {currentUser.role === "caseta" && (
          <main>
            <PageHero img={IMG_GATE} title="Registro de Caseta de Vigilancia (Tablet)" subtitle="Formulario ultrarrápido con validación de suspensiones en tiempo real, acceso peatonal y exportación de bitácora" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-[calc(100vh-16rem)]">
              {casetaTab === "registro" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-2xl border p-6 bg-white shadow-sm space-y-5" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
                      <div>
                        <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800">
                          {casetaModoAcceso === "vehicular" ? "Registro de Entrada Vehicular" : "Registro de Entrada Peatonal (A Pie)"}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {casetaModoAcceso === "vehicular" ? "Control de acceso vehicular y verificación de corbatines" : "Ingreso autorizado a pie de técnicos y contratistas (ej. unidad con sanción)"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Oficial: {currentUser.nombre}</span>
                    </div>

                    {/* SELECTOR DE MODALIDAD DE ACCESO */}
                    <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCasetaModoAcceso("vehicular")}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${casetaModoAcceso === "vehicular"
                          ? "bg-[#0D6E5F] text-white shadow-md"
                          : "text-slate-600 hover:text-slate-900"
                          }`}
                      >
                        <IconCar className="w-4 h-4" />
                        <span>Acceso Vehicular (Regular)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCasetaModoAcceso("peatonal");
                          setHoraActual();
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${casetaModoAcceso === "peatonal"
                          ? "bg-sky-700 text-white shadow-md"
                          : "text-slate-600 hover:text-slate-900"
                          }`}
                      >
                        <IconWalk className="w-4 h-4" />
                        <span>Acceso Peatonal (A Pie / Sanción)</span>
                      </button>
                    </div>

                    {casetaSuccessMsg && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <IconCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Ingreso ({casetaModoAcceso === "vehicular" ? "Vehicular" : "Peatonal a pie"}) autorizado y registrado en la bitácora con éxito.</span>
                      </div>
                    )}

                    {/* FORMULARIO DE ACCESO VEHICULAR */}
                    {casetaModoAcceso === "vehicular" && (
                      <form onSubmit={handleRegistrarEntrada} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                            1. Seleccionar Empresa Contratista
                          </label>
                          <select
                            value={selectedEmpresaId}
                            onChange={(e) => setSelectedEmpresaId(e.target.value)}
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                          >
                            {empresas.map((emp) => (
                              <option key={emp.id} value={emp.id}>{emp.nombre} ({emp.rfc})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                            2. Seleccionar Vehículo Habilitado
                          </label>
                          <select
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
                          >
                            {empresaVehicles.length === 0 ? (
                              <option value="">(Sin vehículos habilitados para esta empresa)</option>
                            ) : (
                              empresaVehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.marca} {v.modelo} · Placas: {v.placas} · Corbatín #{v.corbatinNum}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            3. Datos Autocompletados de la Unidad
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block">Placas:</span>
                              <span className="font-mono font-bold text-slate-800">{currentCasetaVehicle?.placas || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Color:</span>
                              <span className="font-semibold text-slate-800">{currentCasetaVehicle?.color || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Conductor:</span>
                              <span className="font-semibold text-slate-800">{currentCasetaVehicle?.conductor || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Teléfono:</span>
                              <span className="font-mono text-slate-800">{currentCasetaVehicle?.telefono || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            4. Ingreso a Mano / Clic
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1"># Corbatín</label>
                              <input
                                type="text"
                                value={casetaCorbatin}
                                onChange={(e) => setCasetaCorbatin(e.target.value)}
                                placeholder="# Corbatín"
                                className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 font-mono font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Hora de Entrada</label>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={casetaHoraEntrada}
                                  onChange={(e) => setCasetaHoraEntrada(e.target.value)}
                                  placeholder="08:30 hrs"
                                  className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 font-mono text-slate-800"
                                />
                                <button
                                  type="button"
                                  onClick={setHoraActual}
                                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 shrink-0 cursor-pointer"
                                >
                                  Ahora
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Hora Estimada Salida</label>
                              <input
                                type="text"
                                value={casetaHoraSalida}
                                onChange={(e) => setCasetaHoraSalida(e.target.value)}
                                placeholder="18:00 hrs"
                                className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 font-mono text-slate-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Trabajos / Destino en el Complejo *</label>
                            <input
                              type="text"
                              required
                              value={casetaTrabajos}
                              onChange={(e) => setCasetaTrabajos(e.target.value)}
                              placeholder="Ej. Pintura de fachada exterior Torre 1"
                              className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          {currentCasetaVehicle?.status === "Suspendido" && !casetaOverrideActive ? (
                            <div className="space-y-3">
                              <button
                                type="button"
                                disabled
                                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-red-400 cursor-not-allowed opacity-80"
                              >
                                Acceso Vehicular Bloqueado — Vehículo con Suspensión Activa
                              </button>

                              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-2 text-xs">
                                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                                  <IconWalk className="w-4 h-4 text-sky-700" />
                                  <span>¿El contratista requiere realizar labores entrando a pie?</span>
                                </div>
                                <p className="text-sky-800">
                                  Puedes autorizar el ingreso peatonal dejando el vehículo retenido en el exterior.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleCambiarAIngresoPeatonal(currentCasetaVehicle)}
                                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <IconWalk className="w-4 h-4" />
                                  <span>🚶 Registrar Entrada Peatonal (A Pie) del Contratista</span>
                                </button>
                              </div>

                              <div className="flex justify-end items-center text-xs pt-1">
                                <button
                                  type="button"
                                  onClick={() => setCasetaOverrideActive(true)}
                                  className="text-amber-700 font-bold underline hover:text-amber-900 cursor-pointer"
                                >
                                  Anulación de Emergencia por Supervisor
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="submit"
                              disabled={isSubmittingEntrada}
                              className={`w-full py-3 rounded-xl text-sm font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                                isSubmittingEntrada ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                              }`}
                              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))" }}
                            >
                              {isSubmittingEntrada ? (
                                <>
                                  <IconSpinner className="w-4 h-4" />
                                  <span>Registrando Entrada...</span>
                                </>
                              ) : (
                                <span>{casetaOverrideActive ? "Autorizar Ingreso Vehicular con Anulación" : "Permitir Entrada Vehicular y Registrar"}</span>
                              )}
                            </button>
                          )}
                        </div>
                      </form>
                    )}

                    {/* FORMULARIO DE ACCESO PEATONAL */}
                    {casetaModoAcceso === "peatonal" && (
                      <form onSubmit={handleRegistrarEntrada} className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <IconWalk className="w-4 h-4 text-sky-700 shrink-0" />
                            <span>Protocolo de Ingreso Peatonal Acreditado</span>
                          </div>
                          <p className="text-sky-800">
                            Registra el acceso a pie para contratistas, técnicos o cuadrillas cuyo vehículo esté suspendido por sanciones o ingresen caminando con herramienta.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                            1. Empresa Contratista
                          </label>
                          <select
                            value={selectedEmpresaId}
                            onChange={(e) => {
                              setSelectedEmpresaId(e.target.value);
                              setCasetaPeatonalTrabajadorId("");
                            }}
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                          >
                            {empresas.map((emp) => (
                              <option key={emp.id} value={emp.id}>{emp.nombre} ({emp.rfc})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                            2. Seleccionar de Plantilla (Opcional)
                          </label>
                          <select
                            value={casetaPeatonalTrabajadorId}
                            onChange={(e) => setCasetaPeatonalTrabajadorId(e.target.value)}
                            className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                          >
                            <option value="">[+] Capturar colaborador / Nombre libre</option>
                            {empresaTrabajadores.map((t) => (
                              <option key={t.id_trabajador} value={String(t.id_trabajador)}>
                                {t.nombre} {t.apellidos} {t.activo ? "· Autorizado" : "· (Inactivo)"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Nombre Completo del Colaborador *
                            </label>
                            <input
                              type="text"
                              required
                              value={casetaPeatonalNombre}
                              onChange={(e) => setCasetaPeatonalNombre(e.target.value)}
                              placeholder="Ej. Carlos Ortega Vega"
                              className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Teléfono Celular de Contacto
                            </label>
                            <input
                              type="text"
                              value={casetaPeatonalTelefono}
                              onChange={(e) => setCasetaPeatonalTelefono(e.target.value)}
                              placeholder="+52 638 000 0000"
                              className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 font-mono text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Hora de Entrada *</label>
                            <div className="flex gap-1">
                              <input
                                type="text"
                                required
                                value={casetaHoraEntrada}
                                onChange={(e) => setCasetaHoraEntrada(e.target.value)}
                                placeholder="08:30 hrs"
                                className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 font-mono text-slate-800"
                              />
                              <button
                                type="button"
                                onClick={setHoraActual}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 shrink-0 cursor-pointer"
                              >
                                Ahora
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Hora Estimada Salida</label>
                            <input
                              type="text"
                              value={casetaHoraSalida}
                              onChange={(e) => setCasetaHoraSalida(e.target.value)}
                              placeholder="18:00 hrs"
                              className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 font-mono text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Trabajos y Destino Autorizado *
                          </label>
                          <input
                            type="text"
                            required
                            value={casetaTrabajos}
                            onChange={(e) => setCasetaTrabajos(e.target.value)}
                            placeholder="Ej. Reparación urgente en Torre 2 con herramienta de mano"
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm border border-slate-300 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Observaciones de Seguridad / Motivo de Acceso Peatonal
                          </label>
                          <input
                            type="text"
                            value={casetaPeatonalObservaciones}
                            onChange={(e) => setCasetaPeatonalObservaciones(e.target.value)}
                            placeholder="Ej. Ingreso a pie autorizado; vehículo retenido afuera por sanción HOA activa."
                            className="w-full rounded-xl px-3.5 py-2 text-sm border border-slate-300 text-slate-700 bg-slate-50"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isSubmittingEntrada}
                            className={`w-full py-3 rounded-xl text-sm font-bold text-white bg-sky-700 hover:bg-sky-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                              isSubmittingEntrada ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                            }`}
                          >
                            {isSubmittingEntrada ? (
                              <>
                                <IconSpinner className="w-4 h-4" />
                                <span>Registrando Ingreso Peatonal...</span>
                              </>
                            ) : (
                              <>
                                <IconWalk className="w-4 h-4" />
                                <span>Autorizar y Registrar Ingreso Peatonal</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* PANEL LATERAL DE DIAGNÓSTICO */}
                  <div className="space-y-4">
                    <div className="rounded-2xl border p-5 bg-white shadow-sm space-y-4" style={{ borderColor: "var(--color-border)" }}>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Diagnóstico de Acceso</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase">{casetaModoAcceso}</span>
                      </h3>

                      {casetaModoAcceso === "vehicular" ? (
                        currentCasetaVehicle ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              {currentCasetaVehicle.foto && (
                                <img src={currentCasetaVehicle.foto} alt="Vehículo" className="w-16 h-12 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0" />
                              )}
                              <div className="flex-1">
                                <div className="font-bold text-sm text-slate-800">{currentCasetaVehicle.marca} {currentCasetaVehicle.modelo}</div>
                                <div className="text-xs text-slate-500 font-mono">{currentCasetaVehicle.placas}</div>
                              </div>
                              <StatusBadge status={currentCasetaVehicle.status} />
                            </div>

                            {currentCasetaVehicle.status !== "Habilitado" && currentCasetaVehicle.sancionActiva && (
                              <div className={`p-4 rounded-xl border ${currentCasetaVehicle.status === "Suspendido" ? "bg-red-50 border-red-300 text-red-900" : "bg-amber-50 border-amber-300 text-amber-900"
                                } space-y-2`}>
                                <div className="font-black text-xs uppercase flex items-center gap-1.5">
                                  <IconAlertTriangle className="w-4 h-4" />
                                  <span>ALERTA DE SUSPENSIÓN HOA ACTIVA</span>
                                </div>
                                <div className="text-xs leading-relaxed">
                                  <strong>Motivo:</strong> {currentCasetaVehicle.sancionActiva.motivo}
                                </div>
                                <div className="text-xs">
                                  <strong>Expiración Exacta:</strong> <span className="font-mono font-bold">{currentCasetaVehicle.sancionActiva.expiracion}</span>
                                </div>
                                <div className="text-xs">
                                  <strong>Medida Disciplinaria:</strong> {currentCasetaVehicle.sancionActiva.medidaDisciplinaria}
                                </div>
                                <div className="pt-2 border-t border-red-200">
                                  <button
                                    type="button"
                                    onClick={() => handleCambiarAIngresoPeatonal(currentCasetaVehicle)}
                                    className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    <IconWalk className="w-4 h-4" />
                                    <span>🚶 Permitir Ingreso a Pie</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {currentCasetaVehicle.status === "Habilitado" && (
                              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                                <IconCheckCircle className="w-4 h-4 text-emerald-600" />
                                <span>Vehículo al corriente y autorizado para ingreso vehicular regular.</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Selecciona un vehículo para verificar estatus.</p>
                        )
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs space-y-2">
                            <div className="font-bold text-sky-900 flex items-center gap-1.5">
                              <IconWalk className="w-4 h-4 text-sky-700" />
                              <span>Modalidad Peatonal Activa</span>
                            </div>
                            <p className="text-sky-800">
                              Verifica que el colaborador externo porte su identificación oficial y equipo de seguridad antes de ingresar.
                            </p>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1">
                            <div><strong>Empresa:</strong> {currentEmpresa?.nombre}</div>
                            <div><strong>Colaboradores Registrados:</strong> {empresaTrabajadores.length}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB BITÁCORA DE CASETA ─── */}
              {casetaTab === "bitacora" && (
                <div className="rounded-2xl border overflow-hidden bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
                  <div className="px-5 py-4 border-b bg-slate-50 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--color-border)" }}>
                    <div>
                      <h2 className="font-bold text-sm text-slate-800">Bitácora Oficial de Accesos en Caseta</h2>
                      <p className="text-xs text-slate-500">Registro histórico en tiempo real de entradas y salidas vehiculares y peatonales.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleExportarBitacoraExcel}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
                        title="Exportar bitácora completa en formato compatible con Excel (.xlsx / .csv)"
                      >
                        <IconFileSpreadsheet className="w-4 h-4 text-emerald-700" />
                        <span>Exportar a Excel (.xlsx / .csv)</span>
                        <IconDownload className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                      <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{bitacora.length} registros</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                          {["Folio", "Modalidad", "Empresa", "Vehículo / Placas", "Conductor / Colaborador", "Corbatín", "Entrada", "Salida", "Trabajos & Observaciones", "Estatus", "Acción"].map((h) => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bitacora.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="px-5 py-8 text-center text-xs text-slate-500">
                              <IconShield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              No hay registros de accesos en la bitácora de PostgreSQL.
                            </td>
                          </tr>
                        ) : (
                          bitacora.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3 font-mono text-xs font-bold text-slate-700">{b.id}</td>
                              <td className="px-5 py-3">
                                {b.tipoAcceso === "Peatonal" || b.vehicleId === "PEATONAL" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                    <IconWalk className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Peatonal</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    <IconCar className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Vehicular</span>
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs font-semibold text-slate-900">{b.empresaNombre}</td>
                              <td className="px-5 py-3 text-xs font-mono font-bold text-slate-800">
                                {b.placas === "PEATONAL (A PIE)" ? (
                                  <span className="text-sky-700">A Pie (Sin auto)</span>
                                ) : (
                                  b.placas
                                )}
                              </td>
                              <td className="px-5 py-3 text-xs text-slate-700 font-medium">
                                <div>{b.conductor}</div>
                                {b.telefono && <div className="text-[11px] text-slate-400 font-mono">{b.telefono}</div>}
                              </td>
                              <td className="px-5 py-3 text-xs font-mono font-bold" style={{ color: "var(--color-primary)" }}>
                                {b.corbatinNum && b.corbatinNum !== "—" ? (b.corbatinNum.startsWith("#") ? b.corbatinNum : `#${b.corbatinNum}`) : "—"}
                              </td>
                              <td className="px-5 py-3 text-xs text-slate-700">{b.horaEntrada}</td>
                              <td className="px-5 py-3 text-xs text-slate-500">{b.horaSalida || "—"}</td>
                              <td className="px-5 py-3 text-xs text-slate-600 max-w-xs">
                                <div className="font-medium text-slate-800 truncate">{b.trabajos}</div>
                                {b.observaciones && (
                                  <div className="text-[11px] text-sky-800 bg-sky-50/70 p-1 rounded mt-0.5 border border-sky-200/50 leading-tight">
                                    {b.observaciones}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3"><StatusBadge status={b.estado} /></td>
                              <td className="px-5 py-3">
                                {b.estado === "Dentro" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMarcarSalida(b.id)}
                                    disabled={Boolean(marcandoSalidaIds[b.id])}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 cursor-pointer flex items-center gap-1.5 ${
                                      marcandoSalidaIds[b.id] ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                                    }`}
                                  >
                                    {marcandoSalidaIds[b.id] ? (
                                      <>
                                        <IconSpinner className="w-3 h-3" />
                                        <span>Marcando...</span>
                                      </>
                                    ) : (
                                      <span>Registrar Salida</span>
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">Completado</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      {/* ─── MODAL TI: MODIFICAR / RESTABLECER CONTRASEÑA ─── */}
      {selectedUserParaPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <IconKey className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Restablecer Contraseña</h3>
                  <p className="text-xs text-slate-500">Gestión de Seguridad TI · Usuario: {selectedUserParaPassword.username}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserParaPassword(null)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1">✕</button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div><strong>Nombre:</strong> {selectedUserParaPassword.nombre}</div>
              <div><strong>Rol:</strong> <span className="font-bold uppercase text-[#0D6E5F]">{selectedUserParaPassword.role}</span></div>
              <div><strong>Correo:</strong> {selectedUserParaPassword.email}</div>
            </div>

            {passwordModalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordModalError}</span>
              </div>
            )}

            <form onSubmit={handleGuardarNuevaPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nueva Contraseña *
                </label>
                <input
                  type="text"
                  required
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  placeholder="Introduce la nueva clave temporal o definitiva"
                  className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-purple-200 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña *
                </label>
                <input
                  type="text"
                  required
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Escribe la contraseña para confirmar"
                  className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-purple-200 font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Debes teclear la clave manualmente como medida de verificación.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const temp = "LP-" + Math.random().toString(36).substring(2, 7).toUpperCase();
                    setNuevaPassword(temp);
                    setConfirmarPassword(""); // Exigir escribir a mano la confirmación
                  }}
                  className="text-xs text-purple-700 font-bold underline hover:text-purple-900 cursor-pointer"
                >
                  Generar Clave Segura
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserParaPassword(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                      isSubmittingPassword ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                    }`}
                  >
                    {isSubmittingPassword ? (
                      <>
                        <IconSpinner className="w-3.5 h-3.5" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Guardar Clave</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL APELACIÓN FORMAL (CONTRATISTA) ─── */}
      {selectedSancionParaApelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <IconMessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Recurso de Apelación y Aclaración</h3>
                  <p className="text-xs text-slate-500">Folio de Sanción: {selectedSancionParaApelar.id} · Placas: {selectedSancionParaApelar.placas}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSancionParaApelar(null)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1">✕</button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div><strong>Infracción:</strong> {selectedSancionParaApelar.tipo}</div>
              <div><strong>Medida Disciplinaria:</strong> <span className="text-red-700 font-bold">{selectedSancionParaApelar.medidaDisciplinaria}</span></div>
              <div><strong>Descripción oficial:</strong> {selectedSancionParaApelar.descripcion}</div>
            </div>

            <form onSubmit={handleEnviarApelacion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Argumentos de Aclaración / Justificación *
                </label>
                <textarea
                  required
                  rows={4}
                  value={apelacionArgumentos}
                  onChange={(e) => setApelacionArgumentos(e.target.value)}
                  placeholder="Describe detalladamente los motivos por los cuales se solicita la reconsideración o levantamiento de la suspensión..."
                  className="w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-sky-200 text-slate-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Representante Acreditado que Firma *
                </label>
                <input
                  type="text"
                  required
                  defaultValue={currentUser?.nombre || ""}
                  className="w-full rounded-xl px-4 py-2 text-xs sm:text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-sky-200 font-medium text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSancionParaApelar(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApelacion}
                  className={`px-6 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                    isSubmittingApelacion ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  {isSubmittingApelacion ? (
                    <>
                      <IconSpinner className="w-3.5 h-3.5" />
                      <span>Enviando Recurso...</span>
                    </>
                  ) : (
                    <span>Enviar Recurso a Supervisión HOA →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: ADMIN CREATES SUPERVISOR ─── */}
      {showCreateSupervisorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Crear Cuenta de Supervisor HOA</h3>
              <button onClick={() => setShowCreateSupervisorModal(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">✕</button>
            </div>
            <form
              onSubmit={handleGuardarNuevoSupervisor}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo del Supervisor *</label>
                <input name="nombre" required placeholder="Ej. Comandante Fernando Ortiz" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico Oficial *</label>
                <input name="email" type="email" required placeholder="seguridad@laspalomasresort.net" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña *</label>
                <input name="password" type="password" required placeholder="Mínimo 6 caracteres" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300" />
                <p className="text-[10px] text-slate-400 mt-1">Si se deja en blanco, se usará "123456" por defecto.</p>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowCreateSupervisorModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 cursor-pointer">Cancelar</button>
                <button
                  type="submit"
                  disabled={isSubmittingSupervisor}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] cursor-pointer flex items-center gap-1.5 ${
                    isSubmittingSupervisor ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  {isSubmittingSupervisor ? (
                    <>
                      <IconSpinner className="w-3.5 h-3.5" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Supervisor</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: SUPERVISOR CREATES PROVEEDOR EMPRESA ─── */}
      {showCreateEmpresaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Registrar Empresa Proveedora</h3>
              <button onClick={() => setShowCreateEmpresaModal(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">✕</button>
            </div>
            <form
              onSubmit={handleGuardarNuevaEmpresa}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Razón Social de la Empresa *</label>
                <input name="nombre" required placeholder="Ej. Climas y Refrigeración Rocky Point" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">RFC Fiscal *</label>
                <input name="rfc" required placeholder="CRRP950820KL9" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Titular / Contacto *</label>
                <input name="contacto" required placeholder="Ej. Ing. Daniel Vázquez" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono Celular *</label>
                <input name="telefono" required placeholder="+52 638 000 0000" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico *</label>
                <input name="email" type="email" required placeholder="contacto@empresa.com" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña de Acceso al Portal *</label>
                <input name="password" type="password" required placeholder="Mínimo 6 caracteres" className="w-full rounded-xl px-3 py-2 text-sm border border-slate-300" />
                <p className="text-[10px] text-slate-400 mt-1">El contratista usará esta contraseña para ingresar al portal.</p>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowCreateEmpresaModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 cursor-pointer">Cancelar</button>
                <button
                  type="submit"
                  disabled={isSubmittingEmpresa}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] cursor-pointer flex items-center gap-1.5 ${
                    isSubmittingEmpresa ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  {isSubmittingEmpresa ? (
                    <>
                      <IconSpinner className="w-3.5 h-3.5" />
                      <span>Creando Proveedor...</span>
                    </>
                  ) : (
                    <span>Crear Proveedor</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: SUPERVISOR CREATES GUARDIA DE CASETA ─── */}
      {showCreateGuardiaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#0D6E5F]">
                  <IconShield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Crear Cuenta de Guardia de Caseta</h3>
                  <p className="text-xs text-slate-500">Asigna credenciales y fotografía oficial para el operador de caseta</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateGuardiaModal(false);
                  setNuevoGuardiaFoto("");
                  setNuevoGuardiaFotoError("");
                }}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {nuevoGuardiaFotoError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{nuevoGuardiaFotoError}</span>
              </div>
            )}

            <form
              onSubmit={handleGuardarNuevoGuardia}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre Completo del Oficial *</label>
                <input name="nombre" required placeholder="Ej. Oficial Ramón Beltrán" className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 font-medium text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Correo Electrónico Oficial *</label>
                <input name="email" type="email" required placeholder="caseta.sur@laspalomasresort.net" className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contraseña de Tablet *</label>
                <input name="password" type="password" required placeholder="Mínimo 6 caracteres" className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 text-slate-800" />
                <p className="text-[11px] text-slate-400 mt-1">El oficial usará esta contraseña para acceder desde la tablet.</p>
              </div>

              {/* FOTOGRAFÍA OBLIGATORIA DEL GUARDIA */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fotografía Oficial del Oficial *
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Obligatoria
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      <IconCamera className="w-4 h-4 text-[#0D6E5F]" />
                      <span>{nuevoGuardiaFoto ? "Cambiar Fotografía" : "Subir Foto desde Dispositivo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFotoGuardiaChange}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Fotografía frontal y nítida del rostro del oficial para control de caseta (JPG o PNG, máx 5MB).
                    </p>
                    {nuevoGuardiaFoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setNuevoGuardiaFoto("");
                          setNuevoGuardiaFotoError("");
                        }}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                        <span>Remover fotografía</span>
                      </button>
                    )}
                  </div>

                  <div className={`h-32 rounded-2xl border-2 ${nuevoGuardiaFoto ? 'border-emerald-400 bg-emerald-50/20' : 'border-dashed border-slate-300 bg-slate-50'} flex items-center justify-center overflow-hidden relative shadow-inner`}>
                    {nuevoGuardiaFoto ? (
                      <div className="relative w-full h-full group">
                        <img src={nuevoGuardiaFoto} alt="Preview Guardia" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                          Foto Asignada ✓
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <IconUsers className="w-7 h-7 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px] block font-semibold text-amber-600">Foto Requerida *</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateGuardiaModal(false);
                    setNuevoGuardiaFoto("");
                    setNuevoGuardiaFotoError("");
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGuardia}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:brightness-110 transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                    isSubmittingGuardia ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  {isSubmittingGuardia ? (
                    <>
                      <IconSpinner className="w-3.5 h-3.5" />
                      <span>Guardando Oficial...</span>
                    </>
                  ) : (
                    <span>Guardar Oficial →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL ALTA TRABAJADOR (CONTRATISTA - DICCIONARIO DE DATOS) ─── */}
      {showCreateTrabajadorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#0D6E5F]">
                  <IconUserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Alta de Nuevo Trabajador</h3>
                  <p className="text-xs text-slate-500">Empresa: {currentUser?.empresaNombre || ""}</p>
                </div>
              </div>
              <button onClick={() => setShowCreateTrabajadorModal(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1">✕</button>
            </div>

            {trabajadorFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{trabajadorFormError}</span>
              </div>
            )}

            <form onSubmit={handleGuardarNuevoTrabajador} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre(s) * <span className="text-slate-400 font-normal">(máx 80)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={trabajadorNombre}
                    onChange={(e) => setTrabajadorNombre(e.target.value)}
                    placeholder="Ej. Juan Carlos"
                    className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Apellidos Completos * <span className="text-slate-400 font-normal">(máx 150)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={trabajadorApellidos}
                    onChange={(e) => setTrabajadorApellidos(e.target.value)}
                    placeholder="Ej. Pérez Hernández"
                    className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono Celular <span className="text-slate-400 font-normal">(opcional, máx 20)</span>
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={trabajadorTelefono}
                  onChange={(e) => setTrabajadorTelefono(e.target.value)}
                  placeholder="Ej. +52 81 1234 5678"
                  className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 font-mono text-slate-800"
                />
              </div>

              {/* Fotografía de Credencial */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Fotografía de Credencial / Identificación (URL o Archivo)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      <IconCamera className="w-4 h-4 text-[#0D6E5F]" />
                      <span>Subir Foto desde Dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFotoTrabajadorUpload}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Fotografía nítida tipo credencial del colaborador (JPG o PNG).
                    </p>
                  </div>

                  <div className="h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                    {trabajadorFotoUrl ? (
                      <div className="relative w-full h-full group">
                        <img src={trabajadorFotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                          Foto Cargada ✓
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <IconUsers className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px] block">Sin fotografía</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Estatus Activo */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={trabajadorActivo}
                    onChange={(e) => setTrabajadorActivo(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Estatus de Autorización: Activo (DEFAULT TRUE)</div>
                    <div className="text-[11px] text-slate-500">Permite el ingreso regular del trabajador a las instalaciones.</div>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTrabajadorModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTrabajador}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 cursor-pointer shadow-md flex items-center gap-2 ${
                    isSubmittingTrabajador ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                  }`}
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-mid))" }}
                >
                  {isSubmittingTrabajador ? (
                    <>
                      <IconSpinner className="w-3.5 h-3.5" />
                      <span>Guardando Trabajador...</span>
                    </>
                  ) : (
                    <span>Guardar Trabajador →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL MODIFICAR TRABAJADOR (CONTRATISTA) ─── */}
      {selectedTrabajadorParaEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <IconEdit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Modificar Trabajador</h3>
                  <p className="text-xs text-slate-500">ID: #{selectedTrabajadorParaEditar.id_trabajador} · {selectedTrabajadorParaEditar.empresaNombre}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTrabajadorParaEditar(null)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1">✕</button>
            </div>

            {trabajadorFormError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{trabajadorFormError}</span>
              </div>
            )}

            <form onSubmit={handleGuardarEdicionTrabajador} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre(s) * <span className="text-slate-400 font-normal">(máx 80)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={trabajadorNombre}
                    onChange={(e) => setTrabajadorNombre(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-blue-200 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Apellidos Completos * <span className="text-slate-400 font-normal">(máx 150)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={trabajadorApellidos}
                    onChange={(e) => setTrabajadorApellidos(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-blue-200 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono Celular <span className="text-slate-400 font-normal">(opcional, máx 20)</span>
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={trabajadorTelefono}
                  onChange={(e) => setTrabajadorTelefono(e.target.value)}
                  placeholder="Ej. +52 81 1234 5678"
                  className="w-full rounded-xl px-4 py-2.5 text-sm border border-slate-300 outline-none focus:ring-2 focus:ring-blue-200 font-mono text-slate-800"
                />
              </div>

              {/* Fotografía de Credencial */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Actualizar Fotografía de Credencial
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                      <IconCamera className="w-4 h-4 text-blue-600" />
                      <span>Cambiar Foto desde Dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFotoTrabajadorUpload}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Fotografía nítida tipo credencial del colaborador (JPG o PNG).
                    </p>
                  </div>

                  <div className="h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                    {trabajadorFotoUrl ? (
                      <div className="relative w-full h-full group">
                        <img src={trabajadorFotoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                          Foto Actualizada ✓
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <IconUsers className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px] block">Sin fotografía</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Estatus Activo */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={trabajadorActivo}
                    onChange={(e) => setTrabajadorActivo(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Estatus de Autorización: {trabajadorActivo ? "Activo (Autorizado)" : "Inactivo (Sin Acceso)"}</div>
                    <div className="text-[11px] text-slate-500">Determina si el colaborador puede ingresar por caseta.</div>
                  </div>
                </label>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-mono flex justify-between">
                <span>Fecha de Alta: {selectedTrabajadorParaEditar.created_at}</span>
                <span>Última modif: {selectedTrabajadorParaEditar.updated_at}</span>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTrabajadorParaEditar(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTrabajadorEdit}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:brightness-110 transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                    isSubmittingTrabajadorEdit ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  {isSubmittingTrabajadorEdit ? (
                    <>
                      <IconSpinner className="w-3.5 h-3.5" />
                      <span>Guardando Cambios...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL ELIMINAR TRABAJADOR ─── */}
      {selectedTrabajadorParaEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-red-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <div className="p-2 rounded-xl bg-red-50">
                  <IconTrash className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold uppercase">Eliminar Trabajador</h3>
              </div>
              <button onClick={() => setSelectedTrabajadorParaEliminar(null)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-xs text-red-900 space-y-2">
              <p className="font-semibold">¿Estás seguro de que deseas eliminar permanentemente a este colaborador de la nómina?</p>
              <div className="p-2.5 bg-white rounded-xl border border-red-200/60 font-sans space-y-1">
                <div><strong>Nombre:</strong> {selectedTrabajadorParaEliminar.nombre} {selectedTrabajadorParaEliminar.apellidos}</div>
                <div><strong>ID:</strong> <span className="font-mono">#{selectedTrabajadorParaEliminar.id_trabajador}</span></div>
                <div><strong>Empresa:</strong> {selectedTrabajadorParaEliminar.empresaNombre}</div>
                <div><strong>Teléfono:</strong> {selectedTrabajadorParaEliminar.telefono || "N/A"}</div>
              </div>
              <p className="text-[11px] text-red-700">Esta acción no se puede deshacer y revocará su credencial de acceso.</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTrabajadorParaEliminar(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminarTrabajador}
                disabled={isDeletingTrabajador}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                  isDeletingTrabajador ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                }`}
              >
                {isDeletingTrabajador ? (
                  <>
                    <IconSpinner className="w-4 h-4" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <IconTrash className="w-4 h-4" />
                    <span>Eliminar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL ELIMINAR SUPERVISOR HOA ─── */}
      {selectedSupervisorParaEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-red-100">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <div className="p-2 rounded-xl bg-red-50">
                  <IconTrash className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold uppercase">Eliminar Supervisor HOA</h3>
              </div>
              <button onClick={() => setSelectedSupervisorParaEliminar(null)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-xs text-red-900 space-y-2">
              <p className="font-semibold">¿Estás seguro de que deseas eliminar permanentemente a este Supervisor HOA del sistema?</p>
              <div className="p-2.5 bg-white rounded-xl border border-red-200/60 font-sans space-y-1">
                <div><strong>Nombre:</strong> {selectedSupervisorParaEliminar.nombre}</div>
                <div><strong>ID:</strong> <span className="font-mono">#{selectedSupervisorParaEliminar.id}</span></div>
                <div><strong>Usuario / Correo:</strong> {selectedSupervisorParaEliminar.username}</div>
                <div><strong>Rol:</strong> <span className="font-semibold uppercase text-blue-700">Supervisor de Seguridad HOA</span></div>
              </div>
              <p className="text-[11px] text-red-700">Esta acción no se puede deshacer y revocará inmediatamente su acceso al portal de administración y a la aplicación móvil.</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSupervisorParaEliminar(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminarSupervisor}
                disabled={isDeletingSupervisor}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
                  isDeletingSupervisor ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                }`}
              >
                {isDeletingSupervisor ? (
                  <>
                    <IconSpinner className="w-4 h-4" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <IconTrash className="w-4 h-4" />
                    <span>Eliminar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL VISTA PREVIA DE FOTOGRAFÍA DE CREDENCIAL ─── */}
      {selectedFotoTrabajadorPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setSelectedFotoTrabajadorPreview(null)}>
          <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedFotoTrabajadorPreview.nombre} {selectedFotoTrabajadorPreview.apellidos}</h4>
                <p className="text-xs text-slate-500 font-mono">Fotografía de Credencial · ID: #{selectedFotoTrabajadorPreview.id_trabajador}</p>
              </div>
              <button onClick={() => setSelectedFotoTrabajadorPreview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm p-1">✕</button>
            </div>

            <div className="w-full h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {selectedFotoTrabajadorPreview.foto_url ? (
                <img src={selectedFotoTrabajadorPreview.foto_url} alt="Credencial" className="w-full h-full object-cover" />
              ) : (
                <IconUsers className="w-16 h-16 text-slate-300" />
              )}
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">{selectedFotoTrabajadorPreview.empresaNombre}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${selectedFotoTrabajadorPreview.activo ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {selectedFotoTrabajadorPreview.activo ? "Autorizado" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL VISTA PREVIA DE FOTOGRAFÍA DE OFICIAL DE CASETA ─── */}
      {selectedFotoGuardiaPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setSelectedFotoGuardiaPreview(null)}>
          <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#0D6E5F]">
                  <IconShield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedFotoGuardiaPreview.nombre}</h4>
                  <p className="text-xs text-slate-500 font-mono">Oficial de Caseta · ID: #{selectedFotoGuardiaPreview.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFotoGuardiaPreview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm p-1">✕</button>
            </div>

            <div className="w-full h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
              {selectedFotoGuardiaPreview.foto_url ? (
                <>
                  <img
                    src={selectedFotoGuardiaPreview.foto_url}
                    alt={selectedFotoGuardiaPreview.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div className="hidden flex-col items-center justify-center p-6 text-center text-slate-400">
                    <IconUsers className="w-16 h-16 mb-2 text-slate-300" />
                    <span className="text-xs font-medium">Fotografía no disponible</span>
                  </div>
                </>
              ) : (
                <IconUsers className="w-16 h-16 text-slate-300" />
              )}
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-600">{selectedFotoGuardiaPreview.username}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold ${selectedFotoGuardiaPreview.activo !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {selectedFotoGuardiaPreview.activo !== false ? "En Servicio" : "Inactivo"}
              </span>
            </div>

            {/* Acción para cambiar o subir fotografía a la Base de Datos */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#0D6E5F] border border-slate-200 hover:border-emerald-300 font-bold text-xs cursor-pointer shadow-sm transition-all hover:scale-[1.01]">
                <IconCamera className="w-4 h-4 text-[#0D6E5F]" />
                <span>{selectedFotoGuardiaPreview.foto_url ? "Cambiar Fotografía del Oficial" : "Subir Fotografía del Oficial"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpdateGuardiaFoto(selectedFotoGuardiaPreview.id, e)}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 border-t py-6 px-6 text-center bg-white no-print" style={{ borderColor: "var(--color-border)" }}>

        <p className="text-xs text-slate-500">
          © 2026 Las Palomas Rocky Point HOA, A.C. · Ecosistema Integral de Control y Seguridad Vehicular · v2.6
        </p>
      </footer>

      {/* ─── TOAST NOTIFICATIONS OVERLAY ─── */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

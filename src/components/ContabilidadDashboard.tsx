import React, { useState, useMemo } from 'react';
import { DocumentoFiscalProveedor } from '../types';
import { mockDocumentosEmpresas } from '../data/mockData';

// ─── SVG Icons ─────────────────────────────────────────────────────────────
function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
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

function IconShieldCheck({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconEye({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconDownload({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function IconX({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function IconUsers({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function IconLock({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export interface ContabilidadEmpresa {
  id: string | number;
  nombre?: string;
  razon_social?: string;
  rfc?: string;
  contacto?: string;
  responsable?: string;
  responsable_nombre?: string;
  telefono?: string;
  email?: string;
  correo?: string;
  fechaRegistro?: string;
  created_at?: string;
  estatus?: string;
  estado?: string;
  corbatin_rango_inicio?: number | null;
  corbatin_rango_fin?: number | null;
}

export interface ContabilidadTrabajador {
  id_trabajador?: string | number;
  id?: string | number;
  id_empresa?: string | number;
  empresaNombre?: string;
  nombre: string;
  apellidos?: string;
  telefono?: string;
  foto_url?: string;
  foto?: string;
  activo?: boolean;
}

export interface ContabilidadVehiculo {
  id: string | number;
  empresaId?: string;
  empresaNombre?: string;
  marca: string;
  modelo: string;
  año?: string | number;
  anio?: string | number;
  placas?: string;
  placa?: string;
  color?: string;
  conductor?: string;
  telefono?: string;
  foto?: string;
  foto_url?: string;
  status?: string;
  estatus_acceso?: string;
  corbatinNum?: string;
}

interface ContabilidadDashboardProps {
  empresas: ContabilidadEmpresa[] | any[];
  trabajadores: ContabilidadTrabajador[] | any[];
  vehicles: ContabilidadVehiculo[] | any[];
}

export const ContabilidadDashboard: React.FC<ContabilidadDashboardProps> = ({
  empresas,
  trabajadores,
  vehicles,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstatus, setFilterEstatus] = useState<'todos' | 'con_documento' | 'pendientes' | 'suspendido'>('todos');
  const [selectedEmpresaExpediente, setSelectedEmpresaExpediente] = useState<ContabilidadEmpresa | null>(null);
  const [selectedDocumentoPreview, setSelectedDocumentoPreview] = useState<DocumentoFiscalProveedor | null>(null);
  const [modalTab, setModalTab] = useState<'documento' | 'flotilla' | 'personal'>('documento');

  // Documentos mockeados por empresa (1 por empresa)
  const documentos = mockDocumentosEmpresas;

  // Helpers para normalizar campos
  const getEmpName = (emp: ContabilidadEmpresa) => emp.nombre || emp.razon_social || `Empresa #${emp.id}`;
  const getEmpContact = (emp: ContabilidadEmpresa) => emp.contacto || emp.responsable || emp.responsable_nombre || 'Sin contacto';
  const getEmpEmail = (emp: ContabilidadEmpresa) => emp.email || emp.correo || 'Sin correo registrado';

  // Obtener el único documento de la empresa
  const getDocumentoDeEmpresa = (empId: string | number, empRfc?: string): DocumentoFiscalProveedor | undefined => {
    return documentos.find(d => d.empresaId === String(empId) || (empRfc && d.descripcion?.includes(empRfc)));
  };

  // Cálculo de estadísticas generales
  const stats = useMemo(() => {
    const totalEmpresas = empresas.length;
    let conDocVigente = 0;
    let conDocPendienteOVencido = 0;

    empresas.forEach(emp => {
      const doc = getDocumentoDeEmpresa(emp.id, emp.rfc);
      if (doc && doc.estatus === 'vigente') {
        conDocVigente++;
      } else {
        conDocPendienteOVencido++;
      }
    });

    const totalFlotilla = vehicles.length;
    const totalPersonal = trabajadores.filter(t => t.activo !== false).length;

    return {
      totalEmpresas,
      conDocVigente,
      conDocPendienteOVencido,
      totalFlotilla,
      totalPersonal,
    };
  }, [empresas, documentos, vehicles, trabajadores]);

  // Filtrado de empresas
  const empresasFiltradas = useMemo(() => {
    return empresas.filter(emp => {
      const term = searchTerm.toLowerCase();
      const empName = getEmpName(emp).toLowerCase();
      const empContact = getEmpContact(emp).toLowerCase();
      const empMail = getEmpEmail(emp).toLowerCase();
      const empRfc = (emp.rfc || '').toLowerCase();

      const matchSearch =
        empName.includes(term) ||
        empContact.includes(term) ||
        empMail.includes(term) ||
        empRfc.includes(term);

      if (!matchSearch) return false;

      const doc = getDocumentoDeEmpresa(emp.id, emp.rfc);
      const isVigente = doc && doc.estatus === 'vigente';
      const isSuspendido = emp.estatus === 'SUSPENDIDA' || emp.estado === 'suspendido';

      if (filterEstatus === 'con_documento') return isVigente && !isSuspendido;
      if (filterEstatus === 'pendientes') return !isVigente && !isSuspendido;
      if (filterEstatus === 'suspendido') return isSuspendido;

      return true;
    });
  }, [empresas, searchTerm, filterEstatus, documentos]);

  return (
    <div className="space-y-6 pb-12">
      {/* ─── BANNER SUPERIOR INFORMATIVO ─── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0D6E5F] via-[#094E43] to-[#063830] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 translate-x-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Información de Empresas y Documento de Proveedor
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-right">
              <div className="text-[11px] text-teal-200 font-semibold uppercase tracking-wider">Fecha de Consulta</div>
              <div className="text-sm font-black font-mono">
                {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TARJETAS DE MÉTRICAS CONTABLES ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white border shadow-xs flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Empresas en Padrón</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalEmpresas}</div>
            <span className="text-[11px] text-slate-400 font-medium">Proveedores registrados</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D6E5F] flex items-center justify-center border border-teal-100">
            <IconBuilding className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white border shadow-xs flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Documento Vigente</span>
            <div className="text-2xl font-black text-emerald-700">{stats.conDocVigente}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Documento en regla</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <IconShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white border shadow-xs flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pendiente / Vencido</span>
            <div className="text-2xl font-black text-amber-700">{stats.conDocPendienteOVencido}</div>
            <span className="text-[11px] text-amber-600 font-medium">Sin subir o por renovar</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <IconAlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white border shadow-xs flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flotilla y Personal</span>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalFlotilla} <span className="text-xs font-semibold text-slate-400">veh. / {stats.totalPersonal} colab.</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Total amparado en el predio</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <IconUsers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── FILTROS Y BÚSQUEDA ─── */}
      <div className="p-4 rounded-2xl bg-white border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
        {/* Input de Búsqueda */}
        <div className="relative w-full md:w-96">
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Empresa, RFC o Contacto..."
            className="w-full rounded-xl pl-10 pr-4 py-2 text-xs border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200 font-medium text-slate-800"
          />
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-stretch md:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterEstatus('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterEstatus === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Todos ({empresas.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterEstatus('con_documento')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterEstatus === 'con_documento' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Documento Vigente
          </button>
          <button
            type="button"
            onClick={() => setFilterEstatus('pendientes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterEstatus === 'pendientes' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Sin Documento / Por Actualizar
          </button>
        </div>
      </div>

      {/* ─── TABLA DE EMPRESAS Y DOCUMENTO ─── */}
      <div className="rounded-2xl border bg-white shadow-xs overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <div className="px-5 py-4 border-b bg-slate-50/80 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-slate-800">Directorio de Empresas y Documentación</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {empresasFiltradas.length} resultados
            </span>
          </div>
        </div>

        {empresasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <IconBuilding className="w-10 h-10 mx-auto text-slate-300" />
            <div className="text-xs font-bold text-slate-600">No se encontraron empresas con los filtros aplicados</div>
            <p className="text-[11px] text-slate-400">Prueba con otro término de búsqueda o cambia la categoría de filtro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500" style={{ borderColor: "var(--color-border)" }}>
                  {["Empresa / Razón Social", "RFC & Fiscal", "Contacto & Teléfono", "Flotilla / Personal", "Documento del Proveedor", "Acción"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empresasFiltradas.map((emp) => {
                  const empName = getEmpName(emp);
                  const doc = getDocumentoDeEmpresa(emp.id, emp.rfc);
                  const empVehicles = vehicles.filter(v => v.empresaNombre === empName || String(v.empresaId) === String(emp.id));
                  const empTrabajadores = trabajadores.filter(t => t.empresaNombre === empName || String(t.id_empresa) === String(emp.id));
                  const isSuspendida = emp.estatus === 'SUSPENDIDA' || emp.estado === 'suspendido';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Empresa */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{empName}</span>
                          {isSuspendida ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              Suspendida
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Activa
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: #{emp.id} · Alta: {emp.fechaRegistro || emp.created_at ? (emp.fechaRegistro || String(emp.created_at).split('T')[0]) : '2026-01-15'}
                        </div>
                      </td>

                      {/* RFC */}
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">
                          {emp.rfc || 'RFC NO REGISTRADO'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 truncate max-w-[200px]" title={getEmpEmail(emp)}>
                          {getEmpEmail(emp)}
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-slate-800">{getEmpContact(emp)}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{emp.telefono || 'Sin teléfono'}</div>
                      </td>

                      {/* Flotilla / Personal */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-700" title="Vehículos registrados">
                            <IconCar className="w-3.5 h-3.5 text-blue-600" />
                            <span>{empVehicles.length}</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-700" title="Colaboradores activos">
                            <IconUsers className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{empTrabajadores.filter(t => t.activo !== false).length}</span>
                          </span>
                        </div>
                      </td>

                      {/* Estatus del Documento Único */}
                      <td className="px-5 py-4">
                        {doc ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {doc.estatus === 'vigente' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
                                  <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Documento Vigente</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-300 shadow-2xs">
                                  <IconAlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                  <span>Documento Vencido</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Vigencia: {doc.fechaVigencia || 'Indefinida'}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <span>Pendiente de Carga</span>
                          </span>
                        )}
                      </td>

                      {/* Botón Acción */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmpresaExpediente(emp);
                            setModalTab('documento');
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:bg-[#0a5a4e] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          <IconEye className="w-3.5 h-3.5" />
                          <span>Ver Información</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL DE VISUALIZACIÓN DE EMPRESA Y DOCUMENTO (SOLO LECTURA) ─── */}
      {selectedEmpresaExpediente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b bg-slate-50 flex items-start justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 text-[#0D6E5F]">
                    <IconBuilding className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {getEmpName(selectedEmpresaExpediente)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                      <span>RFC: <strong>{selectedEmpresaExpediente.rfc || 'No registrado'}</strong></span>
                      <span>·</span>
                      <span>Contacto: {getEmpContact(selectedEmpresaExpediente)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmpresaExpediente(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Header Tabs */}
            <div className="px-6 border-b bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalTab('documento')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${modalTab === 'documento'
                  ? 'border-[#0D6E5F] text-[#0D6E5F]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <IconFileText className="w-4 h-4" />
                <span>Documento del Proveedor</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('flotilla')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${modalTab === 'flotilla'
                  ? 'border-[#0D6E5F] text-[#0D6E5F]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <IconCar className="w-4 h-4" />
                <span>Flotilla ({vehicles.filter(v => v.empresaNombre === getEmpName(selectedEmpresaExpediente) || String(v.empresaId) === String(selectedEmpresaExpediente.id)).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('personal')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${modalTab === 'personal'
                  ? 'border-[#0D6E5F] text-[#0D6E5F]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <IconUsers className="w-4 h-4" />
                <span>Personal ({trabajadores.filter(t => t.empresaNombre === getEmpName(selectedEmpresaExpediente) || String(t.id_empresa) === String(selectedEmpresaExpediente.id)).length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: DOCUMENTO ÚNICO */}
              {modalTab === 'documento' && (() => {
                const doc = getDocumentoDeEmpresa(selectedEmpresaExpediente.id, selectedEmpresaExpediente.rfc);

                return (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-[#094E43] text-xs flex items-center gap-2.5">
                      <IconShieldCheck className="w-4 h-4 shrink-0 text-[#0D6E5F]" />
                      <span>
                        <strong>Consulta Contable:</strong> Visualiza el documento oficial que el proveedor sube a la plataforma. No se requieren modificaciones.
                      </span>
                    </div>

                    {doc ? (
                      <div className="p-5 rounded-2xl border bg-slate-50/60 space-y-4" style={{ borderColor: "var(--color-border)" }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-teal-100/90 text-[#0D6E5F] flex items-center justify-center font-bold shadow-xs">
                              <IconFileText className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{doc.nombreDocumento}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{doc.descripcion}</p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${doc.estatus === 'vigente'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                            }`}>
                            {doc.estatus}
                          </span>
                        </div>

                        {/* Metadatos */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Fecha de Carga:</span>
                            <span className="font-mono font-semibold text-slate-700">{doc.fechaSubida}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Vigencia Oficial:</span>
                            <span className="font-mono font-semibold text-teal-800">{doc.fechaVigencia || 'No especificada'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Subido Por:</span>
                            <span className="font-semibold text-slate-700 truncate block">{doc.subidoPor}</span>
                          </div>
                        </div>

                        {doc.notasAuditoria && (
                          <div className="p-3 rounded-xl bg-slate-100/80 text-xs text-slate-600">
                            <strong>Notas de Auditoría:</strong> {doc.notasAuditoria}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDocumentoPreview(doc)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:bg-[#0a5a4e] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <IconEye className="w-3.5 h-3.5" />
                            <span>Visualizar Documento</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <IconFileText className="w-10 h-10 mx-auto text-slate-300" />
                        <div className="text-xs font-bold text-slate-700">Documento no subido aún por el proveedor</div>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Una vez que el proveedor cargue su documento desde su interfaz, se mostrará aquí para su visualización contable.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 2: FLOTILLA */}
              {modalTab === 'flotilla' && (
                <div className="space-y-3">
                  {vehicles.filter(v => v.empresaNombre === getEmpName(selectedEmpresaExpediente) || String(v.empresaId) === String(selectedEmpresaExpediente.id)).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      No hay vehículos registrados para esta empresa.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 rounded-2xl border bg-white" style={{ borderColor: "var(--color-border)" }}>
                      {vehicles
                        .filter(v => v.empresaNombre === getEmpName(selectedEmpresaExpediente) || String(v.empresaId) === String(selectedEmpresaExpediente.id))
                        .map(v => (
                          <div key={v.id} className="p-3.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                                <IconCar className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{v.marca} {v.modelo} ({v.año || v.anio || '2024'})</div>
                                <div className="text-slate-500 font-mono text-[11px]">Placas: {v.placas || v.placa} · Color: {v.color || 'Blanco'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {v.status || v.estatus_acceso || 'Habilitado'}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Corbatín #{v.corbatinNum || '001'}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PERSONAL */}
              {modalTab === 'personal' && (
                <div className="space-y-3">
                  {trabajadores.filter(t => t.empresaNombre === getEmpName(selectedEmpresaExpediente) || String(t.id_empresa) === String(selectedEmpresaExpediente.id)).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      No hay colaboradores registrados para esta empresa.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 rounded-2xl border bg-white" style={{ borderColor: "var(--color-border)" }}>
                      {trabajadores
                        .filter(t => t.empresaNombre === getEmpName(selectedEmpresaExpediente) || String(t.id_empresa) === String(selectedEmpresaExpediente.id))
                        .map(t => (
                          <div key={t.id_trabajador || t.id} className="p-3.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              {(t.foto_url || t.foto) ? (
                                <img src={t.foto_url || t.foto} alt={t.nombre} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                                  {t.nombre.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900">{t.nombre} {t.apellidos || ''}</div>
                                <div className="text-slate-500 text-[11px]">Tel: {t.telefono || 'Sin teléfono'}</div>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${t.activo !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              {t.activo !== false ? 'Autorizado' : 'Inactivo'}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <span className="text-xs text-slate-400 font-medium">
                Las Palomas HOA · Control de Acceso y Cumplimiento
              </span>
              <button
                type="button"
                onClick={() => setSelectedEmpresaExpediente(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 bg-slate-100 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DE PREVISUALIZACIÓN DE DOCUMENTO ─── */}
      {selectedDocumentoPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <IconFileText className="w-5 h-5 text-[#0D6E5F]" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedDocumentoPreview.nombreDocumento}</h4>
                  <div className="text-[11px] text-slate-400 font-mono">Archivo: {selectedDocumentoPreview.formato.toUpperCase()} · {selectedDocumentoPreview.tamañoKb} KB</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocumentoPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Document Mock Viewer Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-inner text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-teal-100/80 text-[#0D6E5F] flex items-center justify-center mx-auto shadow-xs">
                  <IconFileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-800">{selectedDocumentoPreview.nombreDocumento}</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">{selectedDocumentoPreview.descripcion}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
                  <div className="flex justify-between text-slate-600">
                    <span>Estatus:</span>
                    <strong className="uppercase text-emerald-700">{selectedDocumentoPreview.estatus}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Fecha de Emisión / Carga:</span>
                    <span className="font-mono font-semibold">{selectedDocumentoPreview.fechaSubida}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Vigencia:</span>
                    <span className="font-mono font-semibold text-teal-800">{selectedDocumentoPreview.fechaVigencia || 'No aplica'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Suministrado por:</span>
                    <span>{selectedDocumentoPreview.subidoPor}</span>
                  </div>
                  {selectedDocumentoPreview.notasAuditoria && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <strong>Dictamen de Auditoría:</strong> {selectedDocumentoPreview.notasAuditoria}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  Documento de Proveedor · HOA Las Palomas
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <button
                type="button"
                onClick={() => setSelectedDocumentoPreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Regresar
              </button>

              <a
                href={selectedDocumentoPreview.archivoUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:bg-[#0a5a4e] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <IconDownload className="w-3.5 h-3.5" />
                <span>Descargar Copia de Respaldo</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContabilidadDashboard;

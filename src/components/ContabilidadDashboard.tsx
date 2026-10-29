import React, { useState, useMemo } from 'react';

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

function IconReceipt({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-8" />
      <path d="M16 12h-8" />
      <path d="M11 16H8" />
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

function IconChevronLeft({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// ─── Interfaces ────────────────────────────────────────────────────────────
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

/**
 * Factura recurrente de proveedor
 * Diseñada para soportar múltiples facturas por empresa conforme realizan trabajos periódicos.
 */
export interface FacturaProveedor {
  id: string;
  empresaId: string | number;
  empresaNombre?: string;
  folio: string;               // Ej: "FAC-1042"
  uuidSat?: string;            // UUID fiscal del SAT
  fechaEmision: string;        // YYYY-MM-DD
  fechaRecepcion: string;      // YYYY-MM-DD
  monto: number;               // Importe numérico
  moneda: 'MXN' | 'USD';
  concepto: string;            // Concepto del trabajo realizado
  archivoUrl: string;          // Enlace directo al PDF
  archivoXmlUrl?: string;      // Enlace al XML
  nombreArchivo: string;       // Nombre de archivo
  rutaStorage?: string;
  estatus: 'pagada' | 'pendiente_pago' | 'en_revision' | 'rechazada';
  metodoPago?: 'PPD' | 'PUE' | string;
  subidoPor: string;
  observaciones?: string;
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
  const [filterEstatus, setFilterEstatus] = useState<'todos' | 'con_facturas' | 'sin_facturas'>('todos');
  const [selectedEmpresaExpediente, setSelectedEmpresaExpediente] = useState<ContabilidadEmpresa | null>(null);
  const [selectedFacturaPreview, setSelectedFacturaPreview] = useState<FacturaProveedor | null>(null);
  const [modalTab, setModalTab] = useState<'facturas' | 'flotilla' | 'personal'>('facturas');

  // Estados de búsqueda y paginación interna para cuando la empresa tiene muchas facturas recurrentes
  const [facturasModalSearch, setFacturasModalSearch] = useState('');
  const [facturasModalFilterStatus, setFacturasModalFilterStatus] = useState<'todas' | 'pendientes' | 'pagadas'>('todas');
  const [facturasModalPage, setFacturasModalPage] = useState(1);
  const facturasModalPageSize = 5;

  // Facturas de proveedores (inicia vacío hasta que se carguen facturas reales)
  const [facturasList] = useState<FacturaProveedor[]>(() => {
    try {
      const saved = localStorage.getItem('las_palomas_facturas_proveedores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Helpers para normalizar campos de Empresa
  const getEmpName = (emp: ContabilidadEmpresa) => emp.nombre || emp.razon_social || `Empresa #${emp.id}`;
  const getEmpContact = (emp: ContabilidadEmpresa) => emp.contacto || emp.responsable || emp.responsable_nombre || 'Sin contacto';
  const getEmpEmail = (emp: ContabilidadEmpresa) => emp.email || emp.correo || 'Sin correo registrado';

  // Obtener todas las facturas históricas de una empresa específica
  const getFacturasDeEmpresa = (empId: string | number): FacturaProveedor[] => {
    return facturasList
      .filter(f => String(f.empresaId) === String(empId))
      .sort((a, b) => new Date(b.fechaEmision || b.fechaRecepcion).getTime() - new Date(a.fechaEmision || a.fechaRecepcion).getTime());
  };

  // Formateador de moneda
  const formatMonto = (monto: number, moneda: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda || 'MXN',
      minimumFractionDigits: 2,
    }).format(monto);
  };

  // Cálculo de estadísticas generales
  const stats = useMemo(() => {
    const totalEmpresas = empresas.length;
    const empresasConFacturas = empresas.filter(emp => getFacturasDeEmpresa(emp.id).length > 0).length;
    const totalFacturas = facturasList.length;
    const facturasPendientes = facturasList.filter(f => f.estatus === 'pendiente_pago' || f.estatus === 'en_revision');
    const montoTotalPendiente = facturasPendientes.reduce((acc, f) => acc + (Number(f.monto) || 0), 0);
    const totalFlotilla = vehicles.length;
    const totalPersonal = trabajadores.filter(t => t.activo !== false).length;

    return {
      totalEmpresas,
      empresasConFacturas,
      totalFacturas,
      totalPendientesCount: facturasPendientes.length,
      montoTotalPendiente,
      totalFlotilla,
      totalPersonal,
    };
  }, [empresas, vehicles, trabajadores, facturasList]);

  // Filtrado de empresas en la tabla principal
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

      const facturasCount = getFacturasDeEmpresa(emp.id).length;

      if (filterEstatus === 'con_facturas') return facturasCount > 0;
      if (filterEstatus === 'sin_facturas') return facturasCount === 0;

      return true;
    });
  }, [empresas, searchTerm, filterEstatus, facturasList]);

  // Facturas de la empresa activa filtradas y paginadas (para historial recurrente)
  const facturasEmpresaActiva = useMemo(() => {
    if (!selectedEmpresaExpediente) return [];
    return getFacturasDeEmpresa(selectedEmpresaExpediente.id);
  }, [selectedEmpresaExpediente, facturasList]);

  const facturasEmpresaFiltradas = useMemo(() => {
    return facturasEmpresaActiva.filter(fac => {
      const q = facturasModalSearch.toLowerCase().trim();
      const matchQ =
        !q ||
        fac.folio.toLowerCase().includes(q) ||
        fac.concepto.toLowerCase().includes(q) ||
        (fac.uuidSat && fac.uuidSat.toLowerCase().includes(q));

      if (!matchQ) return false;

      if (facturasModalFilterStatus === 'pendientes') {
        return fac.estatus === 'pendiente_pago' || fac.estatus === 'en_revision';
      }
      if (facturasModalFilterStatus === 'pagadas') {
        return fac.estatus === 'pagada';
      }

      return true;
    });
  }, [facturasEmpresaActiva, facturasModalSearch, facturasModalFilterStatus]);

  const facturasPaginadas = useMemo(() => {
    const start = (facturasModalPage - 1) * facturasModalPageSize;
    return facturasEmpresaFiltradas.slice(start, start + facturasModalPageSize);
  }, [facturasEmpresaFiltradas, facturasModalPage]);

  const totalPagesModal = Math.max(1, Math.ceil(facturasEmpresaFiltradas.length / facturasModalPageSize));

  return (
    <div className="space-y-6 pb-12">
      {/* ─── TARJETAS DE MÉTRICAS CONTABLES ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Empresas */}
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

        {/* Card 2: Total Facturas */}
        <div className="p-5 rounded-2xl bg-white border shadow-xs flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Facturas Totales</span>
            <div className="text-2xl font-black text-emerald-700">{stats.totalFacturas}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Historial acumulado</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <IconReceipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Empresas con Facturas */}
        <div className="p-5 rounded-2xl bg-white border shadow-xs flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Empresas con Trabajos</span>
            <div className="text-2xl font-black text-teal-800">
              {stats.empresasConFacturas} <span className="text-xs font-semibold text-slate-400">/ {stats.totalEmpresas}</span>
            </div>
            <span className="text-[11px] text-teal-600 font-medium">Con facturas registradas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <IconReceipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Flotilla y Personal */}
        <div className="p-5 rounded-2xl bg-white border shadow-xs flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flotilla y Personal</span>
            <div className="text-2xl font-black text-slate-900">
              {stats.totalFlotilla} <span className="text-xs font-semibold text-slate-400">veh. / {stats.totalPersonal} colab.</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Amparados en el predio</span>
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
            onClick={() => setFilterEstatus('con_facturas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${filterEstatus === 'con_facturas' ? 'bg-white text-[#0D6E5F] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <IconReceipt className="w-3.5 h-3.5" />
            <span>Con Facturas ({stats.empresasConFacturas})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterEstatus('sin_facturas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterEstatus === 'sin_facturas' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Sin Facturas ({stats.totalEmpresas - stats.empresasConFacturas})
          </button>
        </div>
      </div>

      {/* ─── TABLA DE EMPRESAS Y FACTURACIÓN ─── */}
      <div className="rounded-2xl border bg-white shadow-xs overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <div className="px-5 py-4 border-b bg-slate-50/80 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-slate-800">Directorio de Empresas y Facturas</h2>
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
                  {["Empresa / Razón Social", "RFC & Fiscal", "Contacto & Teléfono", "Flotilla / Personal", "Historial de Facturas", "Acción"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empresasFiltradas.map((emp) => {
                  const empName = getEmpName(emp);
                  const empFacturas = getFacturasDeEmpresa(emp.id);
                  const empVehicles = vehicles.filter(v => v.empresaNombre === empName || String(v.empresaId) === String(emp.id));
                  const empTrabajadores = trabajadores.filter(t => t.empresaNombre === empName || String(t.id_empresa) === String(emp.id));
                  const isSuspendida = emp.estatus === 'SUSPENDIDA' || emp.estado === 'suspendido';

                  const pendientes = empFacturas.filter(f => f.estatus === 'pendiente_pago' || f.estatus === 'en_revision');

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

                      {/* Historial de Facturas */}
                      <td className="px-5 py-4">
                        {empFacturas.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#0D6E5F] border border-teal-200">
                                <IconReceipt className="w-3 h-3 text-[#0D6E5F]" />
                                <span>{empFacturas.length} {empFacturas.length === 1 ? 'factura' : 'facturas'}</span>
                              </span>
                              {pendientes.length > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  {pendientes.length} pendiente(s)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Última: {empFacturas[0].folio}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                            <span>Sin facturas</span>
                          </span>
                        )}
                      </td>

                      {/* Botón Acción */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmpresaExpediente(emp);
                            setModalTab('facturas');
                            setFacturasModalSearch('');
                            setFacturasModalFilterStatus('todas');
                            setFacturasModalPage(1);
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:bg-[#0a5a4e] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap ml-auto"
                        >
                          <IconEye className="w-3.5 h-3.5" />
                          <span>Ver Facturas</span>
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

      {/* ─── MODAL DE VISUALIZACIÓN DE FACTURAS (HISTORIAL RECURRENTE) ─── */}
      {selectedEmpresaExpediente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
            <div className="px-6 border-b bg-white flex items-center gap-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setModalTab('facturas')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${modalTab === 'facturas'
                  ? 'border-[#0D6E5F] text-[#0D6E5F]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <IconReceipt className="w-4 h-4" />
                <span>Historial de Facturas ({facturasEmpresaActiva.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('flotilla')}
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${modalTab === 'flotilla'
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
                className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${modalTab === 'personal'
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
              {/* ─── TAB: HISTORIAL DE FACTURAS (RECURRENTE) ─── */}
              {modalTab === 'facturas' && (() => {
                const totalEmpresaMonto = facturasEmpresaActiva.reduce((acc, f) => acc + (Number(f.monto) || 0), 0);
                const totalEmpresaPagado = facturasEmpresaActiva
                  .filter(f => f.estatus === 'pagada')
                  .reduce((acc, f) => acc + (Number(f.monto) || 0), 0);
                const totalEmpresaPendiente = facturasEmpresaActiva
                  .filter(f => f.estatus === 'pendiente_pago' || f.estatus === 'en_revision')
                  .reduce((acc, f) => acc + (Number(f.monto) || 0), 0);

                return (
                  <div className="space-y-4">
                    {/* Resumen Acumulado de Trabajos de la Empresa */}
                    {facturasEmpresaActiva.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Facturado Histórico:</span>
                          <span className="text-sm font-black text-slate-900">{formatMonto(totalEmpresaMonto)}</span>
                          <span className="text-[10px] text-slate-500 block">{facturasEmpresaActiva.length} facturas acumuladas</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-emerald-600 block">Total Liquidado:</span>
                          <span className="text-sm font-black text-emerald-700">{formatMonto(totalEmpresaPagado)}</span>
                          <span className="text-[10px] text-emerald-600 block">{facturasEmpresaActiva.filter(f => f.estatus === 'pagada').length} facturas pagadas</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-amber-600 block">Por Pagar / Revisión:</span>
                          <span className="text-sm font-black text-amber-700">{formatMonto(totalEmpresaPendiente)}</span>
                          <span className="text-[10px] text-amber-600 block">{facturasEmpresaActiva.filter(f => f.estatus === 'pendiente_pago' || f.estatus === 'en_revision').length} facturas pendientes</span>
                        </div>
                      </div>
                    )}

                    {/* Barra de Filtros y Búsqueda interna para empresas con muchas facturas */}
                    {facturasEmpresaActiva.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="relative w-full sm:w-72">
                          <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={facturasModalSearch}
                            onChange={(e) => {
                              setFacturasModalSearch(e.target.value);
                              setFacturasModalPage(1);
                            }}
                            placeholder="Buscar por folio o trabajo..."
                            className="w-full rounded-xl pl-9 pr-3 py-1.5 text-xs border border-slate-200 outline-none focus:ring-2 focus:ring-teal-200 font-medium text-slate-800"
                          />
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setFacturasModalFilterStatus('todas');
                              setFacturasModalPage(1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${facturasModalFilterStatus === 'todas' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                              }`}
                          >
                            Todas ({facturasEmpresaActiva.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFacturasModalFilterStatus('pendientes');
                              setFacturasModalPage(1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${facturasModalFilterStatus === 'pendientes' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
                              }`}
                          >
                            Pendientes ({facturasEmpresaActiva.filter(f => f.estatus === 'pendiente_pago' || f.estatus === 'en_revision').length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFacturasModalFilterStatus('pagadas');
                              setFacturasModalPage(1);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${facturasModalFilterStatus === 'pagadas' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                              }`}
                          >
                            Pagadas ({facturasEmpresaActiva.filter(f => f.estatus === 'pagada').length})
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Listado de Facturas */}
                    {facturasPaginadas.length > 0 ? (
                      <div className="space-y-3">
                        {facturasPaginadas.map((fac) => (
                          <div
                            key={fac.id}
                            className="p-4 rounded-2xl border bg-slate-50/70 hover:bg-white transition-all space-y-3"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0D6E5F] flex items-center justify-center shrink-0 shadow-xs">
                                  <IconReceipt className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-black text-slate-900">{fac.folio}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${fac.estatus === 'pagada'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : fac.estatus === 'pendiente_pago'
                                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                                        : 'bg-blue-50 text-blue-700 border-blue-300'
                                      }`}>
                                      {fac.estatus.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 font-medium mt-0.5">{fac.concepto}</p>
                                  {fac.uuidSat && (
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      UUID SAT: {fac.uuidSat}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="text-right sm:self-start">
                                <div className="text-base font-black text-slate-900">
                                  {formatMonto(fac.monto, fac.moneda)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Emisión: {fac.fechaEmision}
                                </div>
                              </div>
                            </div>

                            {/* Metadatos y Botón */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                              <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                                <span>Recibida: <strong className="font-mono text-slate-700">{fac.fechaRecepcion}</strong></span>
                                <span>Por: <strong className="text-slate-700">{fac.subidoPor}</strong></span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedFacturaPreview(fac)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:bg-[#0a5a4e] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-end sm:self-auto"
                              >
                                <IconEye className="w-3.5 h-3.5" />
                                <span>Visualizar Factura</span>
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Controles de Paginación para cuando la empresa tiene muchas facturas */}
                        {totalPagesModal > 1 && (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-500">
                            <span>
                              Mostrando {((facturasModalPage - 1) * facturasModalPageSize) + 1} - {Math.min(facturasModalPage * facturasModalPageSize, facturasEmpresaFiltradas.length)} de {facturasEmpresaFiltradas.length} facturas
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={facturasModalPage <= 1}
                                onClick={() => setFacturasModalPage(p => Math.max(1, p - 1))}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <IconChevronLeft className="w-4 h-4" />
                              </button>
                              <span className="px-2 font-bold text-slate-700">
                                {facturasModalPage} / {totalPagesModal}
                              </span>
                              <button
                                type="button"
                                disabled={facturasModalPage >= totalPagesModal}
                                onClick={() => setFacturasModalPage(p => Math.min(totalPagesModal, p + 1))}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <IconChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D6E5F] flex items-center justify-center mx-auto border border-teal-100">
                          <IconReceipt className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          {facturasEmpresaActiva.length === 0 ? "No hay facturas registradas" : "No hay facturas con el filtro aplicado"}
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                          {facturasEmpresaActiva.length === 0
                            ? "A medida que el proveedor realice trabajos y suba sus comprobantes a la plataforma, se irán acumulando en este historial."
                            : "Prueba modificando el término de búsqueda o cambiando el filtro de estado."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ─── TAB: FLOTILLA ─── */}
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

              {/* ─── TAB: PERSONAL ─── */}
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
                Las Palomas HOA · Módulo Contable
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

      {/* ─── MODAL DE PREVISUALIZACIÓN DE FACTURA ─── */}
      {selectedFacturaPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <IconReceipt className="w-5 h-5 text-[#0D6E5F]" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedFacturaPreview.folio}</h4>
                  <div className="text-[11px] text-slate-500">
                    Comprobante fiscal de proveedor
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacturaPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Factura Preview Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-inner space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-teal-100 text-[#0D6E5F] flex items-center justify-center mx-auto shadow-xs">
                  <IconReceipt className="w-8 h-8" />
                </div>
                <div className="space-y-1 text-center">
                  <div className="font-black text-lg text-slate-900">{formatMonto(selectedFacturaPreview.monto, selectedFacturaPreview.moneda)}</div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">{selectedFacturaPreview.concepto}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between text-slate-600">
                    <span>Estatus:</span>
                    <strong className="uppercase text-[#0D6E5F]">{selectedFacturaPreview.estatus.replace('_', ' ')}</strong>
                  </div>
                  {selectedFacturaPreview.uuidSat && (
                    <div className="flex justify-between text-slate-600">
                      <span>UUID SAT:</span>
                      <span className="font-mono text-[11px] font-semibold truncate max-w-[200px]" title={selectedFacturaPreview.uuidSat}>
                        {selectedFacturaPreview.uuidSat}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Fecha Emisión:</span>
                    <span className="font-mono font-semibold">{selectedFacturaPreview.fechaEmision}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Fecha Recepción:</span>
                    <span className="font-mono font-semibold">{selectedFacturaPreview.fechaRecepcion}</span>
                  </div>
                  {selectedFacturaPreview.metodoPago && (
                    <div className="flex justify-between text-slate-600">
                      <span>Método de Pago:</span>
                      <span>{selectedFacturaPreview.metodoPago}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Subido Por:</span>
                    <span>{selectedFacturaPreview.subidoPor}</span>
                  </div>
                  {selectedFacturaPreview.observaciones && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <strong>Observaciones:</strong> {selectedFacturaPreview.observaciones}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <button
                type="button"
                onClick={() => setSelectedFacturaPreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Regresar
              </button>

              <a
                href={selectedFacturaPreview.archivoUrl}
                target="_blank"
                rel="noreferrer"
                download={selectedFacturaPreview.nombreArchivo}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:bg-[#0a5a4e] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <IconDownload className="w-3.5 h-3.5" />
                <span>Descargar Factura</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContabilidadDashboard;

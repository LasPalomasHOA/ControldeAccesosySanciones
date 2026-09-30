import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Building2,
  Car,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Filter,
  Layers,
  FileCode2,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { downloadBitacoraPDF, printBitacoraPDF, BitacoraReportRecord } from '../utils/pdfBitacoraExporter';
import { exportBitacoraCasetaToExcel, exportBitacoraCSV, SimpleBitacoraExportRecord } from '../utils/excelReportExporter';

export interface ReporteBitacoraModalProps {
  isOpen: boolean;
  onClose: () => void;
  bitacora: any[];
  empresas?: Array<{ id: string | number; nombre: string }>;
  currentUserRole?: string;
  currentUserName?: string;
  onNotify?: (msg: string, type: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
}

type PeriodType = 'hoy' | '7dias' | 'mes' | 'anio' | 'rango';

export const ReporteBitacoraModal: React.FC<ReporteBitacoraModalProps> = ({
  isOpen,
  onClose,
  bitacora = [],
  empresas = [],
  currentUserRole = 'caseta',
  currentUserName = 'Oficial de Seguridad',
  onNotify
}) => {
  const [periodo, setPeriodo] = useState<PeriodType>('hoy');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('todas');
  const [selectedModalidad, setSelectedModalidad] = useState<string>('todas');
  const [selectedEstatus, setSelectedEstatus] = useState<string>('todos');

  // Rango personalizado
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [fechaInicio, setFechaInicio] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState<string>(todayStr);

  // Estados de generación
  const [isGenerating, setIsGenerating] = useState<'pdf' | 'print' | 'excel' | 'csv' | null>(null);

  // Helper para obtener la fecha YYYY-MM-DD de un registro
  const getRecordDate = (rec: any): string => {
    if (rec.fecha) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rec.fecha)) return rec.fecha;
      const d = new Date(rec.fecha);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    if (rec.horaEntrada) {
      const d = new Date(rec.horaEntrada);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    if (rec.created_at) {
      const d = new Date(rec.created_at);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return todayStr;
  };

  // Filtrado reactivo en tiempo real
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const curMonthPrefix = `${curYear}-${curMonth}`;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    return bitacora.filter((item) => {
      const itemDate = getRecordDate(item);

      // Filtro de Periodo
      if (periodo === 'hoy') {
        if (itemDate !== todayStr) return false;
      } else if (periodo === '7dias') {
        if (itemDate < sevenDaysAgoStr || itemDate > todayStr) return false;
      } else if (periodo === 'mes') {
        if (!itemDate.startsWith(curMonthPrefix)) return false;
      } else if (periodo === 'anio') {
        if (!itemDate.startsWith(String(curYear))) return false;
      } else if (periodo === 'rango') {
        if (fechaInicio && itemDate < fechaInicio) return false;
        if (fechaFin && itemDate > fechaFin) return false;
      }

      // Filtro de Empresa
      if (selectedEmpresa !== 'todas' && item.empresaNombre !== selectedEmpresa) {
        return false;
      }

      // Filtro de Modalidad
      const esPeatonal = item.tipoAcceso === 'Peatonal' || item.vehicleId === 'PEATONAL';
      const esCorbatinVerde = item.tipoAcceso === 'Corbatín Verde' || item.corbatinNum?.startsWith('V-');
      if (selectedModalidad === 'vehicular' && (esPeatonal || esCorbatinVerde)) return false;
      if (selectedModalidad === 'peatonal' && !esPeatonal) return false;
      if (selectedModalidad === 'corbatin_verde' && !esCorbatinVerde) return false;

      // Filtro de Estatus
      const esDentro = !item.horaSalida || item.horaSalida === 'Dentro' || item.estado === 'Dentro';
      if (selectedEstatus === 'dentro' && !esDentro) return false;
      if (selectedEstatus === 'salida' && esDentro) return false;

      return true;
    });
  }, [bitacora, periodo, selectedEmpresa, selectedModalidad, selectedEstatus, fechaInicio, fechaFin, todayStr]);

  // KPIs del conjunto filtrado
  const kpis = useMemo(() => {
    const total = filteredRecords.length;
    const entradas = filteredRecords.filter((r) => r.horaEntrada && r.horaEntrada !== '—').length;
    const salidas = filteredRecords.filter((r) => r.horaSalida && r.horaSalida !== 'Dentro' && r.horaSalida !== '—').length;
    const dentro = filteredRecords.filter((r) => !r.horaSalida || r.horaSalida === 'Dentro' || r.estado === 'Dentro').length;
    const vehiculares = filteredRecords.filter((r) => r.tipoAcceso !== 'Peatonal' && r.vehicleId !== 'PEATONAL').length;
    const peatonales = filteredRecords.filter((r) => r.tipoAcceso === 'Peatonal' || r.vehicleId === 'PEATONAL').length;

    return { total, entradas, salidas, dentro, vehiculares, peatonales };
  }, [filteredRecords]);

  // Nombre legible del periodo seleccionado
  const periodoLabel = useMemo(() => {
    if (periodo === 'hoy') {
      const parts = todayStr.split('-');
      return `Hoy (${parts[2]}/${parts[1]}/${parts[0]})`;
    }
    if (periodo === '7dias') return 'Últimos 7 Días';
    if (periodo === 'mes') {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mIdx = new Date().getMonth();
      return `Mes de ${meses[mIdx]} ${new Date().getFullYear()}`;
    }
    if (periodo === 'anio') return `Año Fiscal ${new Date().getFullYear()}`;
    return `Rango (${fechaInicio} al ${fechaFin})`;
  }, [periodo, todayStr, fechaInicio, fechaFin]);

  // Mapeador común de registros para los exportadores
  const preparedRecords: BitacoraReportRecord[] = useMemo(() => {
    return filteredRecords.map((b) => ({
      id: b.id,
      fecha: b.fecha || getRecordDate(b),
      tipoAcceso: b.tipoAcceso || (b.vehicleId === 'PEATONAL' ? 'Peatonal' : 'Vehicular'),
      empresaNombre: b.empresaNombre || '—',
      placas: b.placas || (b.vehicleId === 'PEATONAL' ? 'PEATONAL' : '—'),
      color: b.color || 'N/A',
      conductor: b.conductor || 'Personal Acreditado',
      telefono: b.telefono || 'N/A',
      corbatinNum: b.corbatinNum || '—',
      num_pasajeros: Number(b.num_pasajeros) || 0,
      horaEntrada: b.horaEntrada || '00:00',
      horaSalida: b.horaSalida || (b.estado === 'Dentro' ? 'Dentro' : ''),
      trabajos: b.trabajos || b.observaciones || 'Mantenimiento / Acceso regular',
      guardiaNombre: b.guardiaNombre || currentUserName,
      estado: b.estado || (b.horaSalida ? 'Salida Registrada' : 'Dentro'),
      observaciones: b.observaciones || 'Sin observaciones',
      vehicleId: b.vehicleId
    }));
  }, [filteredRecords, currentUserName]);

  // ─────────────────────────────────────────────────────────────────────────
  // MANEJADORES DE EXPORTACIÓN
  // ─────────────────────────────────────────────────────────────────────────

  const handleDownloadPDF = async () => {
    if (preparedRecords.length === 0) {
      onNotify?.('No hay registros disponibles para los filtros seleccionados.', 'warning', 'Sin Registros');
      return;
    }
    setIsGenerating('pdf');
    try {
      await downloadBitacoraPDF({
        periodoNombre: periodoLabel,
        supervisorNombre: currentUserRole === 'supervisor' ? currentUserName : 'Supervisor de Seguridad HOA',
        guardiaNombre: currentUserName,
        empresaFiltro: selectedEmpresa === 'todas' ? 'Todas las Empresas' : selectedEmpresa,
        modalidadFiltro: selectedModalidad === 'todas' ? 'Todas las Modalidades' : selectedModalidad.toUpperCase(),
        records: preparedRecords,
        kpis: {
          totalMovimientos: kpis.total,
          totalEntradas: kpis.entradas,
          totalSalidas: kpis.salidas,
          balanceDentro: kpis.dentro,
          vehiculares: kpis.vehiculares,
          peatonales: kpis.peatonales
        }
      });
      onNotify?.(`Reporte PDF vectorial generado con éxito (${preparedRecords.length} registros).`, 'success', 'PDF Descargado');
    } catch (err: any) {
      console.error('Error generando PDF:', err);
      onNotify?.('Error al generar el PDF: ' + (err.message || err), 'error', 'Fallo al Exportar');
    } finally {
      setIsGenerating(null);
    }
  };

  const handlePrintPDF = async () => {
    if (preparedRecords.length === 0) {
      onNotify?.('No hay registros disponibles para imprimir.', 'warning', 'Sin Registros');
      return;
    }
    setIsGenerating('print');
    try {
      await printBitacoraPDF({
        periodoNombre: periodoLabel,
        supervisorNombre: currentUserRole === 'supervisor' ? currentUserName : 'Supervisor de Seguridad HOA',
        guardiaNombre: currentUserName,
        empresaFiltro: selectedEmpresa === 'todas' ? 'Todas las Empresas' : selectedEmpresa,
        modalidadFiltro: selectedModalidad === 'todas' ? 'Todas las Modalidades' : selectedModalidad.toUpperCase(),
        records: preparedRecords,
        kpis: {
          totalMovimientos: kpis.total,
          totalEntradas: kpis.entradas,
          totalSalidas: kpis.salidas,
          balanceDentro: kpis.dentro,
          vehiculares: kpis.vehiculares,
          peatonales: kpis.peatonales
        }
      });
      onNotify?.('Diálogo de impresión preparado correctamente.', 'info', 'Impresión Lista');
    } catch (err: any) {
      console.error('Error imprimiendo PDF:', err);
      onNotify?.('Error al preparar impresión: ' + (err.message || err), 'error');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadExcel = async () => {
    if (preparedRecords.length === 0) {
      onNotify?.('No hay registros disponibles para exportar a Excel.', 'warning', 'Sin Registros');
      return;
    }
    setIsGenerating('excel');
    try {
      await exportBitacoraCasetaToExcel({
        periodoNombre: periodoLabel,
        empresaFiltro: selectedEmpresa === 'todas' ? 'Todas las Empresas' : selectedEmpresa,
        guardiaNombre: currentUserName,
        records: preparedRecords as SimpleBitacoraExportRecord[]
      });
      onNotify?.(`Libro Excel (.xlsx) generado con estilos institucionales (${preparedRecords.length} registros).`, 'success', 'Excel Generado');
    } catch (err: any) {
      console.error('Error exportando Excel:', err);
      onNotify?.('Error al generar archivo Excel: ' + (err.message || err), 'error');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadCSV = () => {
    if (preparedRecords.length === 0) {
      onNotify?.('No hay registros para exportar en CSV.', 'warning', 'Sin Registros');
      return;
    }
    setIsGenerating('csv');
    try {
      exportBitacoraCSV({
        periodoNombre: periodoLabel,
        empresaFiltro: selectedEmpresa === 'todas' ? 'Todas las Empresas' : selectedEmpresa,
        guardiaNombre: currentUserName,
        records: preparedRecords as SimpleBitacoraExportRecord[]
      });
      onNotify?.('Archivo CSV estructurado descargado con éxito.', 'success', 'CSV Generado');
    } catch (err: any) {
      console.error('Error exportando CSV:', err);
      onNotify?.('Error al generar CSV: ' + (err.message || err), 'error');
    } finally {
      setIsGenerating(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* ── HEADER DEL MODAL ── */}
        <div className="relative bg-gradient-to-r from-[#0D6E5F] via-[#0A5448] to-[#0D6E5F] p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Reportes Oficiales Las Palomas HOA</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white">
                  Generador de Reportes de Bitácora
                </h3>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Exporta reportes de entradas, salidas y permanencia en PDF vectorial de alta resolución y hojas de cálculo Excel.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isGenerating !== null}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── CUERPO PRINCIPAL DEL MODAL (SCROLLABLE) ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">

          {/* ── SECCIÓN 1: FILTROS Y PARÁMETROS ── */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#0D6E5F]" />
                <span>1. Parámetros y Filtros del Reporte</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Periodo activo: <strong className="text-[#0D6E5F] font-bold">{periodoLabel}</strong>
              </span>
            </div>

            {/* Pills de Periodo Rápido */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'hoy', label: 'Hoy', desc: 'Jornada Actual' },
                { id: '7dias', label: 'Últimos 7 Días', desc: 'Semana Corrida' },
                { id: 'mes', label: 'Este Mes', desc: 'Mes en Curso' },
                { id: 'anio', label: 'Año 2026', desc: 'Anualidad' },
                { id: 'rango', label: 'Personalizado', desc: 'Desde / Hasta' },
              ].map((p) => {
                const isSelected = periodo === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodo(p.id as PeriodType)}
                    className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D6E5F] text-white border-[#0D6E5F] shadow-sm ring-2 ring-[#0D6E5F]/20'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Rango de Fechas Personalizado (si está activo) */}
            {periodo === 'rango' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in duration-150">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha Inicial (Desde):</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    max={todayStr}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/20 focus:border-[#0D6E5F]"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Fecha Final (Hasta):</label>
                  <input
                    type="date"
                    value={fechaFin}
                    max={todayStr}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/20 focus:border-[#0D6E5F]"
                  />
                </div>
              </div>
            )}

            {/* Filtros Secundarios: Empresa, Modalidad, Estatus */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Filtro Empresa */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>Filtrar por Empresa:</span>
                </label>
                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/20 focus:border-[#0D6E5F]"
                >
                  <option value="todas">🏢 Todas las Empresas ({bitacora.length} registros)</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.nombre}>
                      {emp.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Modalidad */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Car className="w-3 h-3 text-slate-400" />
                  <span>Modalidad de Acceso:</span>
                </label>
                <select
                  value={selectedModalidad}
                  onChange={(e) => setSelectedModalidad(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/20 focus:border-[#0D6E5F]"
                >
                  <option value="todas">Todas las Modalidades</option>
                  <option value="vehicular">🚗 Solo Vehiculares</option>
                  <option value="peatonal">🚶 Solo Peatonales</option>
                  <option value="corbatin_verde">🟢 Solo Corbatines Verdes</option>
                </select>
              </div>

              {/* Filtro Estatus */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Estatus de Permanencia:</span>
                </label>
                <select
                  value={selectedEstatus}
                  onChange={(e) => setSelectedEstatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/20 focus:border-[#0D6E5F]"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="dentro">📍 Solo los que están Dentro</option>
                  <option value="salida">🚪 Solo con Salida Registrada</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 2: KPI METRICS PREVIEW ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registros</div>
                <div className="text-xl font-black text-slate-900 leading-tight">{kpis.total}</div>
                <div className="text-[10px] text-slate-500 font-medium">Movimientos listados</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#0D6E5F]" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Entradas</div>
                <div className="text-xl font-black text-[#0D6E5F] leading-tight">{kpis.entradas}</div>
                <div className="text-[10px] text-emerald-600 font-medium">Ingresos verificados</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salidas</div>
                <div className="text-xl font-black text-slate-700 leading-tight">{kpis.salidas}</div>
                <div className="text-[10px] text-slate-500 font-medium">Egresos registrados</div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3 ${
              kpis.dentro > 0 ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-slate-200'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                kpis.dentro > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                  kpis.dentro > 0 ? 'text-emerald-800' : 'text-slate-400'
                }`}>En Sitio</div>
                <div className={`text-xl font-black leading-tight ${
                  kpis.dentro > 0 ? 'text-emerald-900' : 'text-slate-700'
                }`}>{kpis.dentro}</div>
                <div className={`text-[10px] font-medium ${
                  kpis.dentro > 0 ? 'text-emerald-700' : 'text-slate-500'
                }`}>Dentro actualmente</div>
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 3: OPCIONES DE FORMATO Y DESCARGA ── */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0D6E5F]" />
              <span>2. Selecciona el Formato de Salida</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* TARJETA 1: PDF EJECUTIVO OFICIAL */}
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/30 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">PDF Ejecutivo Oficial</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Recomendado para Auditoría
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Formato vectorial apaisado (Landscape A4) con diseño institucional, membrete Las Palomas HOA, tarjetas KPI, insignias de placas/modalidad, desglose cebra y sellos oficiales de caseta y supervisión.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isGenerating !== null || preparedRecords.length === 0}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0D6E5F] hover:bg-[#0A5448] shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating === 'pdf' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                        <span>Generando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-emerald-200" />
                        <span>Descargar PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintPDF}
                    disabled={isGenerating !== null || preparedRecords.length === 0}
                    className="py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Imprimir directamente este reporte"
                  >
                    {isGenerating === 'print' ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                      <>
                        <Printer className="w-4 h-4 text-slate-600" />
                        <span>Imprimir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* TARJETA 2: EXCEL (.XLSX) PROFESIONAL */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Excel (.xlsx) Corporativo</h4>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Microsoft Excel 2016-365
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Libro de cálculo formal con tipografías calibradas, cabecera esmeralda institucional, bloques de métricas, auto-filtros, columnas auto-ajustadas y colores de estado (verde para unidades en sitio).
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleDownloadExcel}
                    disabled={isGenerating !== null || preparedRecords.length === 0}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating === 'excel' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                        <span>Generando Excel...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                        <span>Descargar Excel (.xlsx)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCSV}
                    disabled={isGenerating !== null || preparedRecords.length === 0}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Descargar archivo delimitado CSV con UTF-8 BOM"
                  >
                    {isGenerating === 'csv' ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                      <>
                        <FileCode2 className="w-4 h-4 text-slate-500" />
                        <span>CSV</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* ── SECCIÓN 4: MINI PREVIEW DE LA TABLA ── */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D6E5F]" />
                <span>Vista Previa de Datos a Exportar ({preparedRecords.length} registros)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {preparedRecords.length > 5 ? `Mostrando los primeros 5 de ${preparedRecords.length}` : `Mostrando todos (${preparedRecords.length})`}
              </span>
            </div>

            <div className="overflow-x-auto max-h-48 overflow-y-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase">
                    <th className="py-2 px-3 text-center">Folio</th>
                    <th className="py-2 px-3">Fecha / Hora</th>
                    <th className="py-2 px-3">Modalidad</th>
                    <th className="py-2 px-3">Empresa</th>
                    <th className="py-2 px-3">Placas</th>
                    <th className="py-2 px-3">Conductor</th>
                    <th className="py-2 px-3 text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {preparedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                        No hay registros para los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    preparedRecords.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-mono font-bold text-[11px] text-slate-800">{r.id}</td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-500">
                          {r.fecha} · <span className="text-slate-800 font-bold">{r.horaEntrada}</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.tipoAcceso === 'Peatonal' ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {r.tipoAcceso}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 truncate max-w-[140px]">{r.empresaNombre}</td>
                        <td className="py-2 px-3 font-mono text-[11px] font-bold text-[#0D6E5F]">{r.placas}</td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[130px]">{r.conductor}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            r.estado === 'Dentro' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {r.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── FOOTER DEL MODAL ── */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento protegido y respaldado con sello de auditoría HOA.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating !== null}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReporteBitacoraModal;

import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import {
  Search,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  UserCheck,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { ReporteBitacoraModal } from '../components/ReporteBitacoraModal';
import { downloadBitacoraPDF } from '../utils/pdfBitacoraExporter';
import { exportBitacoraCasetaToExcel } from '../utils/excelReportExporter';

export const Bitacora: React.FC = () => {
  const { accesos, empresas } = useHOA();
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'salida'>('all');
  const [showReporteModal, setShowReporteModal] = useState(false);
  const [isExportingDirect, setIsExportingDirect] = useState<'pdf' | 'excel' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredAccesos = accesos.filter(acc => {
    const matchesSearch =
      (acc.placa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.trabajadorNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.empresaNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.agenteNombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = companyFilter === 'all' || acc.empresaNombre === companyFilter;
    const matchesType = typeFilter === 'all' || acc.tipo === typeFilter;

    return matchesSearch && matchesCompany && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAccesos.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedAccesos = filteredAccesos.slice(startIndex, startIndex + pageSize);

  // Mapear accesos al formato estándar de reporte
  const mappedBitacora = filteredAccesos.map((acc) => ({
    id: acc.id,
    fecha: new Date(acc.fechaHora).toISOString().split('T')[0],
    tipoAcceso: acc.tipo === 'entrada' ? 'Entrada' : 'Salida',
    empresaNombre: acc.empresaNombre || '—',
    placas: acc.placa || 'PEATONAL',
    color: 'N/A',
    conductor: acc.trabajadorNombre || 'Personal Acreditado',
    telefono: 'N/A',
    corbatinNum: '—',
    num_pasajeros: acc.num_pasajeros || 0,
    horaEntrada: acc.tipo === 'entrada' ? new Date(acc.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
    horaSalida: acc.tipo === 'salida' ? new Date(acc.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Dentro',
    trabajos: acc.observaciones || 'Acceso regular / Visita autorizada',
    guardiaNombre: acc.agenteNombre || 'Oficial en Caseta',
    estado: acc.tipo === 'salida' ? 'Salida Registrada' : 'Dentro',
    observaciones: acc.observaciones || 'Sin incidencias',
    vehicleId: acc.vehiculoId
  }));

  const handleQuickPDF = async () => {
    if (mappedBitacora.length === 0) return;
    setIsExportingDirect('pdf');
    try {
      await downloadBitacoraPDF({
        periodoNombre: 'Historial General Filtrado',
        supervisorNombre: 'Supervisor de Seguridad HOA',
        guardiaNombre: 'Oficial de Caseta',
        empresaFiltro: companyFilter === 'all' ? 'Todas las Empresas' : companyFilter,
        records: mappedBitacora
      });
    } catch (err) {
      console.error('Error al generar PDF rápido:', err);
    } finally {
      setIsExportingDirect(null);
    }
  };

  const handleQuickExcel = async () => {
    if (mappedBitacora.length === 0) return;
    setIsExportingDirect('excel');
    try {
      await exportBitacoraCasetaToExcel({
        periodoNombre: 'Historial General Filtrado',
        empresaFiltro: companyFilter === 'all' ? 'Todas las Empresas' : companyFilter,
        guardiaNombre: 'Oficial de Caseta',
        records: mappedBitacora
      });
    } catch (err) {
      console.error('Error al generar Excel rápido:', err);
    } finally {
      setIsExportingDirect(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Bitácora General de Accesos</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {accesos.length} Registros
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Historial exhaustivo y auditoría de entradas y salidas de contratistas al desarrollo Las Palomas.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickExcel}
            disabled={isExportingDirect !== null || filteredAccesos.length === 0}
            className="bg-[#0D6E5F] hover:bg-[#0A5448] text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            title="Exportar bitácora formateada en Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={16} className="text-emerald-200" />
            <span>{isExportingDirect === 'excel' ? 'Generando Excel...' : 'Exportar a Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por placa, conductor o agente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/20 focus:border-[#0D6E5F] transition-all text-slate-700"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Company Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empresa:</span>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/20 focus:border-[#0D6E5F]"
            >
              <option value="all">Todas</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.nombre}>{emp.nombre}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/20 focus:border-[#0D6E5F]"
            >
              <option value="all">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="salida">Salidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bitacora Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[620px]">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50 text-xs">
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Vehículo (Placa)</th>
                <th className="py-3 px-4">Conductor Autorizado</th>
                <th className="py-3 px-4 text-center">Pasajeros</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Agente Responsable</th>
                <th className="py-3 px-4 text-center">Filtro / Cabina</th>
                <th className="py-3 px-4 text-center">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedAccesos.length > 0 ? (
                paginatedAccesos.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                      {new Date(acc.fechaHora).toLocaleDateString()}{' '}
                      <span className="text-slate-800 font-semibold ml-2">
                        {new Date(acc.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-900 text-cyan-400 font-mono font-bold text-xs px-2 py-0.5 rounded shadow-sm border border-slate-800">
                        {acc.placa || 'PE-0000'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 truncate max-w-[140px]">
                      {acc.trabajadorNombre || 'Sin registro'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold ${
                        (acc.num_pasajeros || 0) > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-400'
                      }`}>
                        {(acc.num_pasajeros || 0) > 0 ? `+${acc.num_pasajeros}` : '0'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold truncate max-w-[160px]">
                      {acc.empresaNombre}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold text-xs">
                      {acc.agenteNombre}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500">
                      {acc.cabina}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.tipo === 'entrada'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {acc.tipo === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                      </span>
                      {acc.observaciones && (
                        <div className="text-[9px] text-rose-500 font-bold block mt-1 hover:underline cursor-help" title={acc.observaciones}>
                          Ver notas
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron registros de accesos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Paginación */}
        {filteredAccesos.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Mostrando <strong className="text-slate-800">{startIndex + 1}</strong> – <strong className="text-slate-800">{Math.min(startIndex + pageSize, filteredAccesos.length)}</strong> de <strong className="text-slate-800">{filteredAccesos.length}</strong> registros
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage <= 1}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors cursor-pointer shadow-2xs"
                  title="Primera página"
                >
                  <ChevronsLeft size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Página anterior"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      totalPages > 7 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      Math.abs(pageNum - safePage) > 1
                    ) {
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                      }
                      return null;
                    }

                    const isActive = pageNum === safePage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#0D6E5F] text-white shadow-xs"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Página siguiente"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors cursor-pointer shadow-2xs"
                  title="Última página"
                >
                  <ChevronsRight size={14} />
                </button>

                <span className="text-[11px] text-slate-400 font-mono pl-1 hidden lg:inline">
                  Pág. {safePage}/{totalPages}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Reporte Ejecutivo */}
      <ReporteBitacoraModal
        isOpen={showReporteModal}
        onClose={() => setShowReporteModal(false)}
        bitacora={mappedBitacora}
        empresas={empresas}
        currentUserRole="caseta"
        currentUserName="Oficial de Caseta"
      />
    </div>
  );
};

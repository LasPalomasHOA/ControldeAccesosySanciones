import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Search, Calendar, Filter, FileSpreadsheet, Sparkles, CheckCircle } from 'lucide-react';

export const Bitacora: React.FC = () => {
  const { accesos, empresas } = useHOA();
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'salida'>('all');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

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

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Bitácora General de Accesos</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Historial exhaustivo de entradas y salidas de contratistas al desarrollo.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting || filteredAccesos.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md transition-all duration-200"
        >
          {exportSuccess ? (
            <>
              <CheckCircle size={16} className="text-emerald-250 animate-bounce" />
              <span>CSV Exportado</span>
            </>
          ) : (
            <>
              <FileSpreadsheet size={16} />
              <span>{exporting ? 'Exportando...' : 'Exportar Bitácora'}</span>
            </>
          )}
        </button>
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
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
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
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 py-1.5 px-2.5 focus:outline-none"
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
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 py-1.5 px-2.5 focus:outline-none"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Vehículo (Placa)</th>
                <th className="py-3 px-4">Conductor Autorizado</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Agente Responsable</th>
                <th className="py-3 px-4 text-center">Filtro / Cabina</th>
                <th className="py-3 px-4 text-center">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAccesos.length > 0 ? (
                filteredAccesos.map((acc) => (
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
                    <td className="py-3.5 px-4 text-slate-500 font-semibold truncate max-w-[160px]">
                      {acc.empresaNombre}
                    </td>
                    <td className="py-3.5 px-4 text-slate-450 font-semibold text-xs">
                      {acc.agenteNombre}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500">
                      {acc.cabina}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.tipo === 'entrada'
                            ? 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                            : 'bg-slate-150 text-slate-600 border border-slate-200'
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
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron registros de accesos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

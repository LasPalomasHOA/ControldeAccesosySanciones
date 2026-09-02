import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Search, AlertTriangle, CheckCircle, CreditCard, Filter, Eye, X } from 'lucide-react';
import { Sancion } from '../types';

export const Sanciones: React.FC = () => {
  const { sanciones, resolverSancion } = useHOA();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activa' | 'resuelta' | 'rechazada'>('all');
  
  // Modal detail State
  const [selectedSancion, setSelectedSancion] = useState<Sancion | null>(null);

  const filteredSanciones = sanciones.filter(s => {
    const matchesSearch =
      (s.placa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.trabajadorNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.infraccionCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.infraccionDescripcion.toLowerCase().includes(searchTerm.toLowerCase());

    // Exclude pending from standard sanciones page view (as it goes to bandeja de aprobaciones)
    const isNotPending = s.estado !== 'pendiente_aprobacion';
    const matchesStatus = statusFilter === 'all' || s.estado === statusFilter;

    return matchesSearch && isNotPending && matchesStatus;
  });

  const getGravedadBadge = (gravedad?: string) => {
    switch (gravedad) {
      case 'leve': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'moderada': return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'grave': return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'critica': return 'bg-rose-50 text-rose-600 border border-rose-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case 'activa': return <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full text-xs font-semibold">Activa</span>;
      case 'resuelta': return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full text-xs font-semibold">Resuelta / Pagada</span>;
      case 'rechazada': return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full text-xs font-semibold">Rechazada</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Catálogo de Sanciones y Multas</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Registro de infracciones aplicadas a vehículos comerciales y estado de liquidación financiera.
        </p>
      </div>

      {/* Filter and Search Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por placa, conductor o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">Estado:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              statusFilter === 'all'
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('activa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              statusFilter === 'activa'
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setStatusFilter('resuelta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              statusFilter === 'resuelta'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Resueltas
          </button>
        </div>
      </div>

      {/* Sanciones Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Fecha Aplicación</th>
                <th className="py-3 px-4">Vehículo (Placa)</th>
                <th className="py-3 px-4">Infracción / Concepto</th>
                <th className="py-3 px-4 text-center">Gravedad</th>
                <th className="py-3 px-4 text-center">Monto</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSanciones.length > 0 ? (
                filteredSanciones.map((san) => (
                  <tr
                    key={san.id}
                    onClick={() => setSelectedSancion(san)}
                    className="hover:bg-slate-50/50 transition-colors font-medium cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-400">
                      {san.fechaSancion ? new Date(san.fechaSancion).toLocaleDateString() : 'N/A'}{' '}
                      <span className="text-[10px] block mt-0.5">
                        {san.fechaSancion ? new Date(san.fechaSancion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-900 text-cyan-400 font-mono font-bold text-xs px-2 py-0.5 rounded shadow-sm border border-slate-800">
                        {san.placa || 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-450 block mt-1 font-semibold truncate max-w-[120px]">
                        Cond: {san.trabajadorNombre || 'No identificado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 truncate max-w-[200px]">
                      <div className="font-bold text-slate-800 text-xs">{san.infraccionCodigo}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">{san.infraccionDescripcion}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getGravedadBadge(san.gravedad)}`}>
                        {san.gravedad}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-slate-800">
                      ${san.montoMulta} USD
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getEstadoBadge(san.estado)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedSancion(san); }}
                        className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron sanciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sancion Detail Modal & Resolution Action */}
      {selectedSancion && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col gap-4 relative">
            <button
              onClick={() => setSelectedSancion(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="border-b border-slate-100 pb-3">
              <span className="bg-slate-900 text-cyan-400 font-mono font-bold text-xs px-2 py-0.5 rounded border border-slate-800">
                {selectedSancion.placa || 'N/A'}
              </span>
              <h3 className="font-extrabold text-base text-slate-800 mt-2">
                Infracción: {selectedSancion.infraccionCodigo}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedSancion.infraccionDescripcion}</p>
            </div>

            {/* Details */}
            <div className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Conductor</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{selectedSancion.trabajadorNombre || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Aplicado por</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{selectedSancion.agenteNombre}</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Importe Multa</span>
                  <span className="text-indigo-600 font-black block mt-0.5 text-sm">${selectedSancion.montoMulta} USD</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Fecha Sanción</span>
                  <span className="text-slate-700 font-bold block mt-0.5">{selectedSancion.fechaSancion ? new Date(selectedSancion.fechaSancion).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              {selectedSancion.comentarios && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Observaciones</span>
                  <p className="text-slate-650 font-medium leading-relaxed mt-1 italic">"{selectedSancion.comentarios}"</p>
                </div>
              )}

              {/* Resolved Date */}
              {selectedSancion.estado === 'resuelta' && selectedSancion.fechaResolucion && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-3.5 rounded-xl flex items-center gap-2">
                  <CheckCircle size={16} />
                  <div>
                    Multa liquidada exitosamente el: <strong>{new Date(selectedSancion.fechaResolucion).toLocaleDateString()}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Thumbnail */}
            {selectedSancion.evidenciaUrl && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Foto Evidencia</span>
                <div className="h-32 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                  <img src={selectedSancion.evidenciaUrl} alt="Evidencia" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Action buttons (paying / resolving) */}
            {selectedSancion.estado === 'activa' && (
              <div className="border-t border-slate-100 pt-4 mt-2">
                <button
                  onClick={() => { resolverSancion(selectedSancion.id); setSelectedSancion(null); }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-colors"
                >
                  <CreditCard size={15} />
                  <span>Procesar Pago de Multa ($ {selectedSancion.montoMulta} USD)</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

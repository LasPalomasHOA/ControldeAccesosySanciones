import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Check, X, ShieldAlert, AlertCircle, Eye, CornerDownRight } from 'lucide-react';
import { Sancion } from '../types';

export const Aprobaciones: React.FC = () => {
  const { sanciones, aprobarSancion, rechazarSancion } = useHOA();
  const [selectedEvidencia, setSelectedEvidencia] = useState<string | null>(null);

  const pendientes = sanciones.filter(s => s.estado === 'pendiente_aprobacion');

  const getGravedadColor = (gravedad?: string) => {
    switch (gravedad) {
      case 'leve': return 'bg-slate-100 text-slate-700';
      case 'moderada': return 'bg-amber-100 text-amber-700';
      case 'grave': return 'bg-rose-100 text-rose-700';
      case 'critica': return 'bg-red-200 text-red-900 border border-red-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <ShieldAlert className="text-rose-500" size={24} />
          Bandeja de Aprobación de Infracciones
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Audita y aprueba o rechaza reportes de incidentes generados por guardias desde la app móvil.
        </p>
      </div>

      {/* Main Inbox */}
      {pendientes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendientes.map((san) => (
            <div key={san.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              
              {/* Card Top */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Infracción Detectada</span>
                    <h3 className="font-extrabold text-slate-800 text-sm">{san.infraccionCodigo} &bull; {san.infraccionDescripcion}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getGravedadColor(san.gravedad)}`}>
                    {san.gravedad}
                  </span>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[9px] tracking-wider">Matrícula</span>
                    <span className="font-mono font-bold text-slate-855 text-xs">{san.placa || 'Sin placa'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[9px] tracking-wider">Conductor</span>
                    <span className="font-bold text-slate-800 text-xs truncate block">{san.trabajadorNombre || 'No identificado'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 font-bold uppercase block text-[9px] tracking-wider">Multa Sugerida</span>
                    <span className="font-extrabold text-indigo-600 text-xs">${san.montoMulta} USD</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 font-bold uppercase block text-[9px] tracking-wider">Agente Oficial</span>
                    <span className="text-slate-500 font-bold text-xs">{san.agenteNombre}</span>
                  </div>
                </div>

                {/* Comments block */}
                {san.comentarios && (
                  <div className="text-xs text-slate-600 leading-relaxed bg-amber-50/30 border-l-2 border-amber-400 p-2.5 rounded-r-lg">
                    <span className="font-bold text-slate-700 block mb-0.5">Notas del Guardia:</span>
                    "{san.comentarios}"
                  </div>
                )}

                {/* Evidence Image */}
                {san.evidenciaUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Evidencia Fotográfica</span>
                    <div className="relative h-32 rounded-lg overflow-hidden group border border-slate-200 shadow-inner bg-slate-100">
                      <img src={san.evidenciaUrl} alt="Evidencia" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSelectedEvidencia(san.evidenciaUrl || null)}
                        className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 text-xs font-bold gap-1.5"
                      >
                        <Eye size={16} />
                        <span>Ver Foto Completa</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-150 p-4 bg-slate-50 flex items-center gap-3">
                <button
                  onClick={() => rechazarSancion(san.id)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <X size={15} />
                  <span>Rechazar Reporte</span>
                </button>
                <button
                  onClick={() => aprobarSancion(san.id)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Aprobar e Infraccionar</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-250 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Check size={24} />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Bandeja Vacía</h3>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            No tienes reportes pendientes de revisión. Los incidentes registrados en caseta o por la app móvil se procesan aquí automáticamente.
          </p>
        </div>
      )}

      {/* Photo lightbox zoom modal */}
      {selectedEvidencia && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedEvidencia(null)}
        >
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 p-2 rounded-xl shadow-2xl">
            <img src={selectedEvidencia} alt="Lightbox Evidencia" className="w-full h-auto rounded-lg object-contain" />
            <button
              onClick={() => setSelectedEvidencia(null)}
              className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-950 text-white rounded-full p-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

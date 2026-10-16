import React from "react";
import { ContratistaExcedido } from "../utils/scheduleParser";

interface AlertaHorarioVencidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contratista: ContratistaExcedido | null;
  onRegistrarSalida: (registroId: string) => Promise<void>;
  onLevantarInfraccion: (contratista: ContratistaExcedido) => Promise<void>;
  isProcessing: boolean;
}

export const AlertaHorarioVencidoModal: React.FC<AlertaHorarioVencidoModalProps> = ({
  isOpen,
  onClose,
  contratista,
  onRegistrarSalida,
  onLevantarInfraccion,
  isProcessing
}) => {
  if (!isOpen || !contratista) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden flex flex-col max-h-[92vh]">
        {/* ENCABEZADO DE ALERTA */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-100 truncate">
                Incidencia en Caseta de Seguridad
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight truncate">
                {contratista.esPernocta
                  ? "⚠️ Pernocta / Ingreso Anterior"
                  : "⏰ Contratista Fuera de Horario"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-all text-xs sm:text-sm font-bold shrink-0"
            title="Cerrar ventana"
          >
            ✕
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL DE LA ALERTA */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {/* BANNER DE TIEMPO EXCEDIDO (TOTALMENTE RESPONSIVE) */}
          <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
            contratista.esPernocta
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}>
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider block opacity-75">
                {contratista.esPernocta ? "Alerta de Pernocta No Autorizada" : "Tiempo de Exceso Registrado"}
              </span>
              <span className="text-lg sm:text-2xl font-black">
                {contratista.esPernocta
                  ? `Fecha Entrada: ${contratista.fechaIngreso}`
                  : `+${contratista.minutosExcedidos} minutos de retraso`}
              </span>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end pt-1 sm:pt-0 border-t sm:border-t-0 border-amber-200/60">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-75">Hora Límite Hoy</span>
              <span className="text-xs sm:text-base font-extrabold font-mono bg-white/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-2xs border border-amber-300">
                {contratista.horaLimite} hrs
              </span>
            </div>
          </div>

          {/* FICHA DEL CONTRATISTA */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
            <div className="flex items-start justify-between border-b border-slate-200 pb-2">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empresa / Contratista</span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 break-words">{contratista.empresaNombre}</h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corbatín</span>
                <div className="font-mono font-black text-xs text-[#0D6E5F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  {contratista.corbatinNum}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conductor / Responsable</span>
                <span className="font-semibold text-slate-700 break-words">{contratista.conductor}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placas Vehículo</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {contratista.placas}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hora de Entrada</span>
                <span className="font-mono font-bold text-slate-700">{contratista.horaEntrada}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono de Contacto</span>
                {contratista.telefono ? (
                  <a
                    href={`tel:${contratista.telefono}`}
                    className="font-mono font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    📞 {contratista.telefono}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">No registrado</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed italic text-center">
            El reglamento prohíbe labores fuera del horario autorizado para resguardar la tranquilidad del complejo.
          </p>
        </div>

        {/* ACCIONES INMEDIATAS (DISEÑO OPTIMIZADO PARA MÓVIL Y TABLET) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto order-3 sm:order-1 px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Enterado (Cerrar)
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onLevantarInfraccion(contratista)}
              className="w-full sm:w-auto px-3.5 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Levantar Infracción</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onRegistrarSalida(contratista.registroId)}
              className="w-full sm:w-auto px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#0D6E5F] hover:bg-[#095247] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Registrar Salida Inmediata</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertaHorarioVencidoModal;

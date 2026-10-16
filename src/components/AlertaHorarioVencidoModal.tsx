import React from "react";
import { ContratistaExcedido } from "../utils/scheduleParser";

interface AlertaHorarioVencidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contratista: ContratistaExcedido | null;
  onRegistrarSalida: (registroId: string) => Promise<void>;
  isProcessing: boolean;
}

export const AlertaHorarioVencidoModal: React.FC<AlertaHorarioVencidoModalProps> = ({
  isOpen,
  onClose,
  contratista,
  onRegistrarSalida,
  isProcessing
}) => {
  if (!isOpen || !contratista) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* ENCABEZADO CON IDENTIDAD VERDE HOA */}
        <div className="bg-gradient-to-r from-[#0D6E5F] via-[#0A5448] to-[#0D6E5F] px-5 sm:px-6 py-4 text-white flex items-center justify-between gap-3 border-b border-[#084239]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner text-white">
              <svg className="w-5 h-5 animate-pulse text-emerald-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                Aviso de Seguridad en Caseta
              </div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight truncate">
                {contratista.esPernocta
                  ? "Vehículo sin salida desde ayer (Se quedó dentro)"
                  : "Contratista fuera del horario establecido"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center cursor-pointer transition-all text-sm font-bold shrink-0"
            title="Cerrar ventana"
          >
            ✕
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL DE LA ALERTA */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-slate-50/50">
          {/* BANNER DE DETALLE DE TIEMPO (COLORES ARMONIOSOS CON LA PLATAFORMA) */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs ${
            contratista.esPernocta
              ? "bg-rose-50/80 border-rose-200 text-rose-950"
              : "bg-amber-50/80 border-amber-200 text-amber-950"
          }`}>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                {contratista.esPernocta
                  ? "Situación: Ingreso de fecha anterior"
                  : "Tiempo de exceso acumulado"}
              </span>
              <span className="text-lg sm:text-2xl font-black">
                {contratista.esPernocta
                  ? `Ingresó el día: ${contratista.fechaIngreso}`
                  : `+${contratista.minutosExcedidos} minutos de retraso`}
              </span>
              {contratista.esPernocta && (
                <p className="text-[11px] text-rose-800 font-medium mt-0.5">
                  Esta unidad no registró salida el día de ayer y sigue registrada adentro.
                </p>
              )}
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-75">Hora Límite Hoy</span>
              <span className="text-xs sm:text-sm font-extrabold font-mono bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-slate-200 text-slate-800">
                {contratista.horaLimite} hrs
              </span>
            </div>
          </div>

          {/* FICHA TÉCNICA DEL CONTRATISTA */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empresa / Contratista</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 break-words">{contratista.empresaNombre}</h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corbatín</span>
                <div className="font-mono font-black text-xs text-[#0D6E5F] bg-[#0D6E5F]/10 border border-[#0D6E5F]/20 px-2.5 py-0.5 rounded-lg">
                  {contratista.corbatinNum}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 text-xs pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conductor / Responsable</span>
                <span className="font-semibold text-slate-800 break-words">{contratista.conductor}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placas de la Unidad</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {contratista.placas}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hora de Entrada Registrada</span>
                <span className="font-mono font-bold text-slate-700">{contratista.horaEntrada}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono de Contacto</span>
                {contratista.telefono ? (
                  <a
                    href={`tel:${contratista.telefono}`}
                    className="font-mono font-bold text-[#0D6E5F] hover:underline inline-flex items-center gap-1"
                  >
                    📞 {contratista.telefono}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">No registrado</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed italic text-center">
            Verifica si la unidad se encuentra por desalojar o regístrale la salida si ya cruzó la pluma.
          </p>
        </div>

        {/* PIE DE ACCIONES: TOTALMENTE ARMONIZADO CON LA IDENTIDAD DE LA PLATAFORMA */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Enterado (Cerrar)
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onRegistrarSalida(contratista.registroId)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0D6E5F] hover:bg-[#095247] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Registrar Salida Inmediata</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertaHorarioVencidoModal;

import React from "react";
import { ContratistaExcedido } from "../utils/scheduleParser";

interface AlertaHorarioVencidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contratista: ContratistaExcedido | null;
  onRegistrarSalida: (registroId: string) => Promise<void>;
  isProcessing: boolean;
  initialExpanded?: boolean;
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
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9990] w-[calc(100vw-2rem)] sm:w-[415px] bg-white/95 text-slate-800 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all font-sans flex flex-col"
      style={{
        boxShadow: "0 20px 40px -10px rgba(13, 110, 95, 0.22), 0 10px 20px -5px rgba(0, 0, 0, 0.10)"
      }}
    >
      {/* ENCABEZADO CON IDENTIDAD VERDE HOA (PUNTO MEDIO: ELEGANTE Y COMPACTO) */}
      <div className="bg-gradient-to-r from-[#0D6E5F] via-[#0A5448] to-[#0D6E5F] px-4 py-2.5 text-white flex items-center justify-between gap-2.5 border-b border-[#084239] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-inner text-white">
            <svg className="w-3.5 h-3.5 animate-pulse text-emerald-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-wider text-emerald-200">
              Aviso de Seguridad en Caseta
            </div>
            <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-white leading-tight truncate">
              {contratista.esPernocta
                ? "Vehículo sin salida desde ayer"
                : "Contratista fuera de horario"}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center cursor-pointer transition-all text-xs font-bold shrink-0"
          title="Cerrar aviso"
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>

      {/* CUERPO BALANCEADO (PUNTO MEDIO: INFORMATIVO SIN SATURAR) */}
      <div className="p-3.5 space-y-2.5 bg-slate-50/60">
        {/* BANNER DE SITUACIÓN Y TIEMPO */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-2xs ${
          contratista.esPernocta
            ? "bg-rose-50/90 border-rose-200 text-rose-950"
            : "bg-amber-50/90 border-amber-200 text-amber-950"
        }`}>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">
              {contratista.esPernocta ? "Situación: Sin Salida Previa" : "Tiempo de Exceso"}
            </span>
            <div className="text-sm font-black leading-tight flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                contratista.esPernocta ? "bg-rose-600 animate-pulse" : "bg-amber-600 animate-pulse"
              }`}></span>
              <span className="truncate">
                {contratista.esPernocta
                  ? `Ingresó: ${contratista.fechaIngreso}`
                  : `+${contratista.minutosExcedidos} min de retraso`}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-75 block">Límite Hoy</span>
            <span className="text-xs font-extrabold font-mono bg-white px-2 py-0.5 rounded-md shadow-2xs border border-slate-200 text-slate-800 inline-block mt-0.5">
              {contratista.horaLimite}h
            </span>
          </div>
        </div>

        {/* FICHA TÉCNICA CLAVE (COMPACTA Y COMPLETA) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
          {/* Fila 1: Empresa y Corbatín */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Empresa / Contratista
              </span>
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {contratista.empresaNombre}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Corbatín
              </span>
              <span className="font-mono font-black text-[11px] text-[#0D6E5F] bg-[#0D6E5F]/10 border border-[#0D6E5F]/20 px-2 py-0.5 rounded-md inline-block">
                #{contratista.corbatinNum?.replace(/^#/, "")}
              </span>
            </div>
          </div>

          {/* Fila 2: Grid de 4 datos esenciales */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Conductor</span>
              <span className="font-semibold text-slate-800 text-[11px] truncate block">
                {contratista.conductor || "Conductor acreditado"}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Placas</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 inline-block text-[11px]">
                {contratista.placas}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hora Entrada</span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">
                {contratista.horaEntrada}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Contacto</span>
              {contratista.telefono ? (
                <a
                  href={`tel:${contratista.telefono}`}
                  className="font-mono font-bold text-[#0D6E5F] hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  📞 {contratista.telefono}
                </a>
              ) : (
                <span className="text-slate-400 italic text-[11px]">No registrado</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PIE DE ACCIONES: CLARO, EQUILIBRADO Y ACCESIBLE */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer text-center bg-white"
        >
          Enterado
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onRegistrarSalida(contratista.registroId)}
          className="flex-1 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{isProcessing ? "Registrando..." : "Registrar Salida Inmediata"}</span>
        </button>
      </div>
    </div>
  );
};

export default AlertaHorarioVencidoModal;

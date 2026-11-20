import React, { useState } from "react";
import logoPng from "../assets/logo.png";
import { copyTextToClipboard } from "../utils/formatters";
import {
  IconCheckSimple,
  IconCopy,
  IconCheckCircle,
  IconAlertTriangle,
  IconInfo,
  IconX,
  IconTrash,
  IconSpinner,
  BlurredBackdropImageFrame,
} from "./Icons";

export const IMG_AERIAL = "https://images.unsplash.com/photo-1785300674532-87efce12b5ee?w=1600&h=600&fit=crop&auto=format";
export const IMG_GATE = "https://images.unsplash.com/photo-1775112077888-8fa36e9bbc51?w=1600&h=600&fit=crop&auto=format";
export const IMG_COAST = "https://images.unsplash.com/photo-1785300550144-6fc8db9cbb95?w=1600&h=600&fit=crop&auto=format";

export function LPLogo({ size = 180, className = "" }: { size?: number; light?: boolean; className?: string }) {
  return (
    <img
      src={logoPng}
      alt="Las Palomas Rocky Point HOA"
      className={`object-contain inline-block ${className}`}
      style={{ width: `${size}px`, maxWidth: "100%", height: "auto" }}
    />
  );
}

const STATUS_BADGE_MAP: Record<string, string> = {
  Habilitado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Deshabilitado: "bg-slate-100 text-slate-600 border-slate-300",
  Suspendido: "bg-red-50 text-red-700 border-red-200",
  Restringido: "bg-amber-50 text-amber-700 border-amber-200",
  Activa: "bg-red-50 text-red-700 border-red-200",
  "En Apelación": "bg-sky-50 text-sky-700 border-sky-200",
  Pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  Cumplida: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Aclarada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Ratificada: "bg-red-50 text-red-800 border-red-200",
  Aprobada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rechazada: "bg-slate-100 text-slate-600 border-slate-200",
  Dentro: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Salida Registrada": "bg-slate-100 text-slate-600 border-slate-200",
  Salida: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status === "Salida Registrada" ? "Salida" : status;
  return (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border whitespace-nowrap ${STATUS_BADGE_MAP[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {label}
    </span>
  );
}

export function PageHero({
  img = IMG_COAST,
  title,
  subtitle,
  children,
}: {
  img?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden no-print shadow-xs border-b border-[#0a5247]">
      {img && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${img})`,
            filter: "blur(2px) brightness(0.45)",
            transform: "scale(1.05)",
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(13,110,95,0.92) 0%, rgba(13,110,95,0.72) 60%, rgba(6,46,40,0.90) 100%)",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1
            className="text-base sm:text-lg font-bold text-white tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 1px 4px rgba(0,0,0,0.35)",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-white/85 mt-0.5 sm:truncate">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-2 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

type ToastCallback = (msg: string, type?: "success" | "error" | "warning" | "info", title?: string) => void;

export function CopyableContactCardField({
  icon,
  label,
  value,
  fallback = "No especificado",
  colorTheme = "slate",
  onCopyToast,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  fallback?: string;
  colorTheme?: "teal" | "blue" | "slate";
  onCopyToast?: ToastCallback;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!value) return;

    const ok = await copyTextToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyToast?.(`${label} copiado al portapapeles: "${value}"`, "success", "¡Copiado!");
    } else {
      onCopyToast?.(`No se pudo copiar al portapapeles`, "error", "Error al copiar");
    }
  };

  const bgIconClasses = {
    teal: "bg-teal-50 text-teal-700 group-hover:bg-teal-100 group-hover:scale-105",
    blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-100 group-hover:scale-105",
    slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:scale-105",
  }[colorTheme];

  const textClasses = {
    teal: "text-teal-700 group-hover:text-teal-800 font-mono",
    blue: "text-blue-700 group-hover:text-blue-800",
    slate: "text-slate-800 group-hover:text-slate-900",
  }[colorTheme];

  if (!value) {
    return (
      <div className="flex items-center gap-2.5 opacity-60 select-none">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bgIconClasses}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{label}</span>
          <span className="text-slate-400 italic text-xs">{fallback}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCopy(e as any);
        }
      }}
      title={`Clic para copiar ${label.toLowerCase()} al portapapeles`}
      className="group flex items-center gap-2.5 text-left p-1.5 -m-1.5 rounded-xl transition-all hover:bg-slate-100/80 active:scale-[0.98] cursor-pointer relative"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${copied ? "bg-emerald-100 text-emerald-700 scale-105 shadow-xs" : bgIconClasses}`}>
        {copied ? <IconCheckSimple className="w-4 h-4 text-emerald-700" /> : icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{label}</span>
          {copied ? (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.2 rounded-md flex items-center gap-1 animate-pulse">
              <IconCheckSimple className="w-2.5 h-2.5" /> Copiado
            </span>
          ) : (
            <span className="text-[9px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-slate-200/70 px-1.5 py-0.2 rounded-md">
              <IconCopy className="w-2.5 h-2.5" /> Copiar
            </span>
          )}
        </div>
        <span className={`font-semibold truncate block text-xs transition-colors ${copied ? "text-emerald-700 font-bold" : textClasses}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function CopyableInlineText({
  text,
  label = "Dato",
  icon,
  className = "",
  onCopyToast,
}: {
  text?: string | null;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  onCopyToast?: ToastCallback;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!text || text === "—" || text === "N/A" || text === "Sin registrar" || text === "S/N") return;

    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyToast?.(`${label} copiado al portapapeles: "${text}"`, "success", "¡Copiado!");
    } else {
      onCopyToast?.(`No se pudo copiar al portapapeles`, "error", "Error al copiar");
    }
  };

  if (!text || text === "—" || text === "N/A" || text === "Sin registrar" || text === "S/N") {
    return <span className="text-slate-400 italic">{text || "—"}</span>;
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Clic para copiar ${label.toLowerCase()} al portapapeles`}
      className={`group inline-flex items-center gap-1.5 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md hover:bg-slate-100 active:scale-95 transition-all cursor-pointer text-left ${className}`}
    >
      {icon && (
        <span className="shrink-0 transition-transform group-hover:scale-110">
          {copied ? <IconCheckSimple className="w-3.5 h-3.5 text-emerald-600" /> : icon}
        </span>
      )}
      <span className={copied ? "text-emerald-700 font-bold" : ""}>{text}</span>
      {copied ? (
        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded flex items-center gap-0.5">
          <IconCheckSimple className="w-2.5 h-2.5" /> Copiado
        </span>
      ) : (
        <IconCopy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-0.5" />
      )}
    </button>
  );
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  timestamp: number;
}

const TOAST_STYLES = {
  success: {
    card: "border-emerald-200 shadow-emerald-950/15",
    iconBox: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-800",
    bar: "bg-emerald-500",
    Icon: IconCheckCircle,
  },
  error: {
    card: "border-red-200 shadow-red-950/15",
    iconBox: "bg-red-100 text-red-700",
    title: "text-red-800",
    bar: "bg-red-500",
    Icon: IconAlertTriangle,
  },
  warning: {
    card: "border-amber-200 shadow-amber-950/15",
    iconBox: "bg-amber-100 text-amber-700",
    title: "text-amber-800",
    bar: "bg-amber-500",
    Icon: IconAlertTriangle,
  },
  info: {
    card: "border-sky-200 shadow-sky-950/15",
    iconBox: "bg-sky-100 text-sky-700",
    title: "text-sky-800",
    bar: "bg-sky-500",
    Icon: IconInfo,
  },
} as const;

export function ToastContainer({ toasts, onClose }: { toasts: ToastNotification[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const IconComp = style.Icon;
        return (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md border p-4 shadow-2xl transition-all ${style.card}`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBox}`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${style.title}`}>
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed break-words font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onClose(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Cerrar notificación"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
              <div className={`toast-progress-bar h-full ${style.bar}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ConfirmDeleteModal({
  title,
  question,
  details,
  warning,
  confirmLabel = "Eliminar Definitivamente",
  isDeleting,
  onClose,
  onConfirm,
}: {
  title: string;
  question: string;
  details: React.ReactNode;
  warning: string;
  confirmLabel?: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl border border-red-100">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-red-600">
            <div className="p-2 rounded-xl bg-red-50">
              <IconTrash className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold uppercase">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1">✕</button>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-xs text-red-900 space-y-2">
          <p className="font-semibold">{question}</p>
          <div className="p-2.5 bg-white rounded-xl border border-red-200/60 font-sans space-y-1">
            {details}
          </div>
          <p className="text-[11px] text-red-700">{warning}</p>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-md flex items-center gap-1.5 ${
              isDeleting ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
            }`}
          >
            {isDeleting ? (
              <>
                <IconSpinner className="w-4 h-4" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <IconTrash className="w-4 h-4" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImagePreviewModal({
  title,
  subtitle,
  icon,
  src,
  alt,
  maxWidthClass = "max-w-2xl",
  heightClass,
  fallbackIcon,
  fallbackText,
  footerLeft,
  footerRight,
  extraContent,
  onClose,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  src?: string;
  alt: string;
  maxWidthClass?: string;
  heightClass?: string;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  extraContent?: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`${maxWidthClass} w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-5 sm:p-6 space-y-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="p-2 rounded-xl bg-emerald-50 text-[#0D6E5F] shrink-0">{icon}</div>}
            <div className="min-w-0">
              <h4 className="font-bold text-base text-slate-900 truncate">{title}</h4>
              {subtitle && <p className="text-xs text-slate-500 font-mono truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-sm font-bold transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <BlurredBackdropImageFrame
          src={src}
          alt={alt}
          heightClass={heightClass}
          fallbackIcon={fallbackIcon}
          fallbackText={fallbackText}
        />

        {(footerLeft || footerRight) && (
          <div className="flex justify-between items-center text-xs pt-1">
            <div>{footerLeft}</div>
            <div>{footerRight}</div>
          </div>
        )}

        {extraContent}
      </div>
    </div>
  );
}

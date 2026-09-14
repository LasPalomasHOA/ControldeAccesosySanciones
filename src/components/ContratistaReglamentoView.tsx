import React, { useState, useMemo } from "react";
import { ReglamentoSection } from "./SupervisorReglamentoEditor";

interface ContratistaReglamentoViewProps {
  reglamentoTexto: string;
  reglamentoSecciones: ReglamentoSection[];
}

export const ContratistaReglamentoView: React.FC<ContratistaReglamentoViewProps> = ({
  reglamentoTexto,
  reglamentoSecciones,
}) => {
  const [activeTab, setActiveTab] = useState<"banderin" | "general">("banderin");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  // Filtrado de secciones para normas operativas
  const filteredSecciones = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return reglamentoSecciones;
    return reglamentoSecciones
      .map((sec) => {
        const titleMatch = sec.title.toLowerCase().includes(q);
        const matchingItems = sec.items.filter((item) =>
          item.toLowerCase().includes(q)
        );
        if (titleMatch || matchingItems.length > 0) {
          return {
            ...sec,
            items: titleMatch ? sec.items : matchingItems,
          };
        }
        return null;
      })
      .filter((sec): sec is ReglamentoSection => sec !== null);
  }, [reglamentoSecciones, searchTerm]);

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(reglamentoTexto);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = reglamentoTexto;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Error copiando texto", e);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* ─── Encabezado Institucional y Oficial ─── */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 font-mono">
                Las Palomas Rocky Point HOA, A.C.
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                DOC-REF-HOA-2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Reglamento Oficial y Normativa de Operación para Contratistas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Disposiciones generales, protocolos de seguridad en frentes de trabajo y marco disciplinario de aplicación estricta y obligatoria para todo personal externo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Imprimir Documento</span>
            </button>
          </div>
        </div>

        {/* Ficha Técnica / Metadatos Institucionales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs text-slate-600">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Órgano Emisor</span>
            <span className="font-bold text-slate-800">Comité de Seguridad HOA</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ámbito de Validez</span>
            <span className="font-bold text-slate-800">Complejo Las Palomas</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Carácter Jurídico</span>
            <span className="font-bold text-slate-800">Vinculante y Obligatorio</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Estatus</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Vigente y Aceptado
            </span>
          </div>
        </div>
      </div>

      {/* ─── Pestañas y Filtro de Búsqueda ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("banderin")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "banderin"
                ? "border-[#0D6E5F] text-[#0D6E5F]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="7" y1="8" x2="17" y2="8" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="13" y2="16" />
            </svg>
            <span>Normas Operativas de Campo</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono font-bold">
              {reglamentoSecciones.length} Capítulos
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "general"
                ? "border-[#0D6E5F] text-[#0D6E5F]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Términos y Condiciones Generales</span>
          </button>
        </div>

        {/* Buscador sobrio */}
        <div className="relative min-w-[240px] sm:min-w-[300px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cláusula o norma (ej. velocidad, horario)..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D6E5F] shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ─── PESTAÑA 1: NORMAS OPERATIVAS (FORMATO FORMAL INSTITUCIONAL) ─── */}
      {activeTab === "banderin" && (
        <div className="space-y-4">
          {filteredSecciones.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
              <p className="font-semibold text-sm text-slate-700">
                No se encontraron cláusulas o normas que coincidan con "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs font-bold text-[#0D6E5F] underline cursor-pointer"
              >
                Restablecer vista completa
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSecciones.map((sec, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-shadow hover:shadow-xs"
                >
                  {/* Encabezado de Capítulo Formal */}
                  <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {sec.items.length} {sec.items.length === 1 ? "disposición" : "disposiciones"}
                    </span>
                  </div>

                  {/* Lista de Disposiciones Numeradas */}
                  <div className="p-5 divide-y divide-slate-100">
                    {sec.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className={`flex items-start gap-3 text-xs leading-relaxed text-slate-700 ${
                          itemIdx === 0 ? "pb-3" : itemIdx === sec.items.length - 1 ? "pt-3" : "py-3"
                        }`}
                      >
                        <span className="font-mono font-bold text-slate-400 shrink-0 text-[11px] mt-0.5">
                          {idx + 1}.{itemIdx + 1}
                        </span>
                        <p className="flex-1 text-slate-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── PESTAÑA 2: TÉRMINOS Y CONDICIONES (FORMATO DOCUMENTO LEGAL) ─── */}
      {activeTab === "general" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Documento Legal de Términos y Condiciones
              </h2>
              <p className="text-xs text-slate-500">
                Texto oficial suscrito digitalmente al registrar la cuenta de contratista en el sistema HOA.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>Copiado al Portapapeles</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copiar Texto Completo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="p-6 sm:p-8 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap max-h-[650px] overflow-y-auto">
              {reglamentoTexto}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratistaReglamentoView;

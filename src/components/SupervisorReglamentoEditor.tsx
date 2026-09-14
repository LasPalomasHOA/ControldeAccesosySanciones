import React, { useState } from "react";

export interface ReglamentoSection {
  title: string;
  items: string[];
}

interface SupervisorReglamentoEditorProps {
  reglamentoTexto: string;
  onUpdateReglamentoTexto: (newText: string) => void;
  reglamentoSecciones: ReglamentoSection[];
  onUpdateReglamentoSecciones: (newSections: ReglamentoSection[]) => void;
  onSave: () => Promise<void>;
  onResetDefaults: () => void;
  isSaving: boolean;
}

export const SupervisorReglamentoEditor: React.FC<SupervisorReglamentoEditorProps> = ({
  reglamentoTexto,
  onUpdateReglamentoTexto,
  reglamentoSecciones,
  onUpdateReglamentoSecciones,
  onSave,
  onResetDefaults,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<"banderin" | "general">("banderin");
  const [hasChanges, setHasChanges] = useState(false);

  // Manipulación de Secciones del Banderín
  const handleTitleChange = (index: number, newTitle: string) => {
    const updated = [...reglamentoSecciones];
    updated[index] = { ...updated[index], title: newTitle };
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleItemChange = (secIndex: number, itemIndex: number, newValue: string) => {
    const updated = [...reglamentoSecciones];
    const newItems = [...updated[secIndex].items];
    newItems[itemIndex] = newValue;
    updated[secIndex] = { ...updated[secIndex], items: newItems };
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleAddItem = (secIndex: number) => {
    const updated = [...reglamentoSecciones];
    updated[secIndex] = {
      ...updated[secIndex],
      items: [...updated[secIndex].items, "Nueva norma reglamentaria"],
    };
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleRemoveItem = (secIndex: number, itemIndex: number) => {
    const updated = [...reglamentoSecciones];
    const newItems = updated[secIndex].items.filter((_, i) => i !== itemIndex);
    updated[secIndex] = { ...updated[secIndex], items: newItems };
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleAddSection = () => {
    const nextNumber = reglamentoSecciones.length + 1;
    const newSection: ReglamentoSection = {
      title: `${nextNumber}. NUEVA SECCIÓN`,
      items: ["Especificación o regla de operación"],
    };
    onUpdateReglamentoSecciones([...reglamentoSecciones, newSection]);
    setHasChanges(true);
  };

  const handleRemoveSection = (secIndex: number) => {
    if (reglamentoSecciones.length <= 1) {
      alert("Debe existir al menos una sección en el banderín.");
      return;
    }
    const updated = reglamentoSecciones.filter((_, i) => i !== secIndex);
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleTextoGeneralChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateReglamentoTexto(e.target.value);
    setHasChanges(true);
  };

  const handleSaveClick = async () => {
    await onSave();
    setHasChanges(false);
  };

  const handleResetClick = () => {
    if (window.confirm("¿Seguro que deseas restablecer tanto el banderín como el reglamento a sus valores de fábrica? Los cambios no guardados se perderán.")) {
      onResetDefaults();
      setHasChanges(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header y Barra de Estado */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0D6E5F]/10 text-[#0D6E5F]">
              Control de Supervisión HOA
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              PostgreSQL + Supabase
            </span>
            {hasChanges && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Cambios pendientes por guardar
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Gestión y Modificación de Reglamentos Oficiales
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza las normas impresas en el reverso de los corbatines (banderines físicos) y el texto legal que firman digitalmente los contratistas.
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetClick}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            title="Restablecer contenido a los textos oficiales originales"
          >
            Restablecer Valores Oficiales
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:brightness-110 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0D6E5F, #108e7a)" }}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>Guardando en BD...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Guardar Cambios Oficiales</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex gap-2 border-b border-slate-200">
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
          <span>Normas de Banderín Físico (Reverso del Corbatín)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
            {reglamentoSecciones.length} secciones
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
          <span>Términos y Condiciones Generales (Firma Digital Contratistas)</span>
        </button>
      </div>

      {/* PESTAÑA 1: SECCIONES DEL BANDERÍN */}
      {activeTab === "banderin" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Editor de Secciones (Izquierda - 7 columnas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Estructura de Secciones y Normas Impresas
                </h3>
                <p className="text-xs text-slate-500">
                  Edita los títulos y añade o remueve puntos para que se organicen en el banderín impreso.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0D6E5F]/10 text-[#0D6E5F] hover:bg-[#0D6E5F]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Nueva Sección</span>
              </button>
            </div>

            <div className="space-y-4">
              {reglamentoSecciones.map((sec, secIdx) => (
                <div
                  key={secIdx}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs transition-shadow hover:shadow-sm"
                >
                  {/* Encabezado de la Sección */}
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-400 font-mono w-5">
                      #{secIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleTitleChange(secIdx, e.target.value)}
                      placeholder="Título de la Sección (ej. 1. INGRESO)"
                      className="flex-1 font-bold text-xs text-slate-800 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0D6E5F]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(secIdx)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar esta sección completa"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  {/* Lista de Normas / Puntos */}
                  <div className="mt-3 space-y-2 pl-3">
                    {sec.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs select-none">•</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(secIdx, itemIdx, e.target.value)}
                          placeholder="Descripción de la norma u obligación"
                          className="flex-1 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0D6E5F]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(secIdx, itemIdx)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Quitar este punto"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddItem(secIdx)}
                        className="text-[11px] font-bold text-[#0D6E5F] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>+ Agregar norma a esta sección</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Previsualización en Vivo del Reverso del Banderín (Derecha - 5 columnas) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800">
                    Previsualización en Vivo del Banderín Físico
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Reverso · 380px
                </span>
              </div>

              {/* Contenedor del Banderín Simulado con estilo exacto de impresión */}
              <div
                className="bg-white border-2 border-black rounded p-3 font-sans overflow-hidden text-black shadow-inner"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                <div className="text-center font-bold text-[11px] uppercase tracking-wide border-b border-black pb-1 mb-2">
                  Reglamento para Externos en Áreas Comunes
                </div>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {reglamentoSecciones.map((sec, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-[10px] font-bold text-black uppercase">
                        {sec.title || "SECCIÓN SIN TÍTULO"}
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 m-0">
                        {sec.items.map((item, j) => (
                          <li key={j} className="text-[9px] text-slate-800 leading-tight">
                            {item || "Norma pendiente de redacción"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-300 pt-2 mt-3 flex justify-between items-center text-[8px] text-slate-500">
                  <span>Las Palomas Rocky Point HOA, A.C.</span>
                  <span className="font-mono font-bold">Vigencia 1 Año</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-[#0D6E5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Nota de sincronización:
                </p>
                <p>
                  Al hacer clic en <strong>Guardar Cambios Oficiales</strong>, los cambios se actualizan de inmediato en la base de datos de Supabase/PostgreSQL y se reflejan en la descarga de PDFs de todos los contratistas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: TÉRMINOS Y CONDICIONES GENERALES */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Editor de Texto (Izquierda - 7 columnas) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Texto Completo de Términos y Condiciones
                </h3>
                <p className="text-xs text-slate-500">
                  Este es el documento íntegro que los contratistas deben leer y firmar digitalmente al iniciar sesión por primera vez.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {reglamentoTexto.length} caracteres
              </span>
            </div>

            <div className="relative">
              <textarea
                value={reglamentoTexto}
                onChange={handleTextoGeneralChange}
                rows={18}
                className="w-full font-mono text-xs leading-relaxed p-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D6E5F]/30 focus:border-[#0D6E5F] transition-all resize-y text-slate-800"
                placeholder="Escribe el texto legal completo aquí..."
              />
            </div>
          </div>

          {/* Vista previa de cómo lo ve el contratista (Derecha - 5 columnas) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  Vista Previa del Contratista al Firmar
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Requisito Obligatorio
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 max-h-[360px] overflow-y-auto">
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans text-slate-700">
                  {reglamentoTexto}
                </pre>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1.5 text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>Firma Digital con Bloqueo de Acceso</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  El contratista tendrá la navegación deshabilitada hasta que marque la casilla de aceptación y registre su firma digital. La firma se guarda con timestamp en la base de datos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorReglamentoEditor;

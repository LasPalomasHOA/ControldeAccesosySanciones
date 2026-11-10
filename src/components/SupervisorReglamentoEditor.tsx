import React, { useState, useMemo } from "react";
import { ReglaReincidenciaUI } from "../types";

export interface ReglamentoSection {
  title: string;
  items: string[];
}

interface SupervisorReglamentoEditorProps {
  reglamentoTexto: string;
  onUpdateReglamentoTexto: (newText: string) => void;
  reglamentoSecciones: ReglamentoSection[];
  onUpdateReglamentoSecciones: (newSections: ReglamentoSection[]) => void;
  reglasReincidencia?: ReglaReincidenciaUI[];
  onUpdateReglasReincidencia?: (newReglas: ReglaReincidenciaUI[]) => void;
  onSave: () => Promise<void>;
  onResetDefaults: () => void;
  isSaving: boolean;
}

interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: "reset" | "warning" | "info";
  onConfirm: () => void;
}

export const SupervisorReglamentoEditor: React.FC<SupervisorReglamentoEditorProps> = ({
  reglamentoTexto,
  onUpdateReglamentoTexto,
  reglamentoSecciones,
  onUpdateReglamentoSecciones,
  reglasReincidencia,
  onUpdateReglasReincidencia,
  onSave,
  onResetDefaults,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<"banderin" | "general" | "reincidencias">("banderin");
  const [hasChanges, setHasChanges] = useState(false);
  const [editingHoras, setEditingHoras] = useState<Record<number, string>>({});

  // Estado del Modal de Confirmación Moderno
  const [modalConfig, setModalConfig] = useState<ConfirmModalConfig>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    isDestructive: false,
    icon: "info",
    onConfirm: () => { },
  });

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Cálculo de Capacidad Física Real de la Tarjeta Ampliada en Hoja Carta (13.0 × 19.5 cm = 165 mm útiles de reverso)
  const { totalSections, totalItems, totalChars, estimatedLines, capacityPercent, isFull, canAddSection, canAddItem } = useMemo(() => {
    const sectionsCount = (reglamentoSecciones || []).length;
    const itemsCount = (reglamentoSecciones || []).reduce((acc, s) => acc + (s.items ? s.items.length : 0), 0);
    const titleCharsCount = (reglamentoSecciones || []).reduce((acc, s) => acc + (s.title || "").length, 0);
    const itemCharsCount = (reglamentoSecciones || []).reduce(
      (acc, s) => acc + (s.items || []).reduce((a, it) => a + (it || "").length, 0),
      0
    );
    const charsCount = titleCharsCount + itemCharsCount;

    // Estimación de líneas reales de impresión (títulos + viñetas + wrapping de textos largos)
    let estLines = sectionsCount * 1.5;
    (reglamentoSecciones || []).forEach((sec) => {
      (sec.items || []).forEach((it) => {
        const len = (it || "").length;
        estLines += Math.max(1, Math.ceil(len / 58)); // ~58 caracteres por línea en reverso de 13.0 cm
      });
    });

    const maxLines = 54; // Capacidad física real adaptativa de la tarjeta de 13.0 × 19.5 cm en Hoja Carta (21.5 × 28 cm)
    const percent = Math.min(100, Math.round((estLines / maxLines) * 100));

    // Espacio para agregar una norma: disponible mientras las líneas estimadas no superen el límite físico
    const canAddItem = estLines < maxLines;
    // Espacio para agregar una sección: disponible si hay menos de 12 secciones y cabe el bloque inicial (~2.5 líneas)
    const canAddSection = sectionsCount < 12 && (estLines + 2.5) <= maxLines;
    const full = percent >= 100 || !canAddItem;

    return {
      totalSections: sectionsCount,
      totalItems: itemsCount,
      totalChars: charsCount,
      estimatedLines: estLines,
      capacityPercent: percent,
      isFull: full,
      canAddSection,
      canAddItem,
    };
  }, [reglamentoSecciones]);

  // Manipulación de Secciones del Banderín
  const handleTitleChange = (index: number, newTitle: string) => {
    const updated = [...reglamentoSecciones];
    updated[index] = { ...updated[index], title: newTitle };
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleItemChange = (secIndex: number, itemIndex: number, newValue: string) => {
    const updated = [...reglamentoSecciones];
    const currentItems = updated[secIndex]?.items ? [...updated[secIndex].items] : [];
    currentItems[itemIndex] = newValue;
    updated[secIndex] = { ...updated[secIndex], items: currentItems };
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleAddItem = (secIndex: number) => {
    if (!canAddItem) {
      setModalConfig({
        isOpen: true,
        title: "Límite de Capacidad Física (100%)",
        description: "La tarjeta de 13.0 × 19.5 cm (en Hoja Carta 21.5 × 28 cm) ha alcanzado el 100% de su capacidad física permitida para garantizar que todas las reglas aparezcan impresas respetando los márgenes. Te sugerimos compactar textos existentes o redactar cláusulas extensas en la pestaña de 'Términos y Condiciones Generales'.",
        confirmText: "Entendido",
        icon: "warning",
        isDestructive: false,
        onConfirm: closeModal,
      });
      return;
    }
    const updated = [...reglamentoSecciones];
    const currentItems = updated[secIndex]?.items || [];
    updated[secIndex] = {
      ...updated[secIndex],
      items: [...currentItems, "Nueva norma reglamentaria"],
    };
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleRemoveItem = (secIndex: number, itemIndex: number) => {
    const updated = [...reglamentoSecciones];
    const currentItems = updated[secIndex]?.items || [];
    const newItems = currentItems.filter((_, i) => i !== itemIndex);
    updated[secIndex] = { ...updated[secIndex], items: newItems };
    onUpdateReglamentoSecciones(updated);
    setHasChanges(true);
  };

  const handleAddSection = () => {
    if (!canAddSection) {
      setModalConfig({
        isOpen: true,
        title: "Capacidad Máxima de Secciones (100%)",
        description: (reglamentoSecciones || []).length >= 12
          ? "Se ha alcanzado el límite máximo de 12 secciones para el corbatín físico. Puedes organizar tus normas dentro de las secciones existentes."
          : "La tarjeta física (13.0 × 19.5 cm) ha llegado al límite de espacio vertical para agregar una nueva sección completa sin rebasar los márgenes de impresión. Puedes compactar textos o agregar normas dentro de las secciones existentes.",
        confirmText: "Entendido",
        icon: "warning",
        isDestructive: false,
        onConfirm: closeModal,
      });
      return;
    }
    const nextNumber = reglamentoSecciones.length + 1;
    const newSection: ReglamentoSection = {
      title: `${nextNumber}. NUEVA SECCIÓN`,
      items: ["Norma u obligación operativa"],
    };
    onUpdateReglamentoSecciones([...reglamentoSecciones, newSection]);
    setHasChanges(true);
  };

  const handleRemoveSection = (secIndex: number) => {
    if (reglamentoSecciones.length <= 1) {
      setModalConfig({
        isOpen: true,
        title: "Sección Obligatoria",
        description: "Debe existir al menos una sección de normas activa en el banderín impreso.",
        confirmText: "Aceptar",
        icon: "info",
        isDestructive: false,
        onConfirm: closeModal,
      });
      return;
    }

    setModalConfig({
      isOpen: true,
      title: "¿Eliminar Sección Completa?",
      description: `Se eliminará la sección "${reglamentoSecciones[secIndex]?.title || 'Sección'}" y todas sus normas contenidas.`,
      confirmText: "Eliminar Sección",
      cancelText: "Conservar",
      isDestructive: true,
      icon: "warning",
      onConfirm: () => {
        const updated = reglamentoSecciones.filter((_, i) => i !== secIndex);
        onUpdateReglamentoSecciones(updated);
        setHasChanges(true);
        closeModal();
      },
    });
  };

  const handleTextoGeneralChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateReglamentoTexto(e.target.value);
    setHasChanges(true);
  };

  const handleUpdateRegla = (numeroFalta: number, changes: Partial<ReglaReincidenciaUI>) => {
    if (!reglasReincidencia || !onUpdateReglasReincidencia) return;
    const updated = reglasReincidencia.map((r) => {
      if (r.numero_falta === numeroFalta) {
        return { ...r, ...changes };
      }
      return r;
    });
    onUpdateReglasReincidencia(updated);
    setHasChanges(true);
  };

  const handleReglaChange = (numeroFalta: number, field: keyof ReglaReincidenciaUI, value: any) => {
    handleUpdateRegla(numeroFalta, { [field]: value });
  };

  const handleSaveClick = async () => {
    await onSave();
    setHasChanges(false);
  };

  const handleResetClick = () => {
    setModalConfig({
      isOpen: true,
      title: "¿Restablecer Valores de Fábrica?",
      description: "¿Seguro que deseas restablecer tanto el banderín físico como el reglamento digital a sus valores de fábrica? Los cambios que no hayas guardado se perderán definitivamente.",
      confirmText: "Sí, Restablecer Todo",
      cancelText: "Cancelar",
      isDestructive: true,
      icon: "reset",
      onConfirm: () => {
        onResetDefaults();
        setHasChanges(true);
        closeModal();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header y Barra de Estado */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {hasChanges && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Cambios pendientes por guardar
              </span>
            </div>
          )}
          <h2 className="text-xl font-black text-slate-900">
            Gestión y Modificación de Reglamentos Oficiales
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza las normas impresas en el reverso de los corbatines vehiculares y los términos que firman digitalmente los contratistas.
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
            Restablecer Valores
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("banderin")}
          className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${activeTab === "banderin"
              ? "border-[#0D6E5F] bg-[#0D6E5F]/5 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${activeTab === "banderin" ? "text-[#0D6E5F]" : "text-slate-700"}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="8" x2="17" y2="8" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="7" y1="16" x2="13" y2="16" />
              </svg>
              1. Normas de Corbatín Físico
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              capacityPercent >= 100
                ? "bg-rose-50 text-rose-700 border-rose-300"
                : capacityPercent >= 88
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              {capacityPercent}% Capacidad
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Secciones y normas impresas directamente en el reverso de la tarjeta vehicular de 13.0 × 19.5 cm (Hoja Carta 21.5 × 28 cm).
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${activeTab === "general"
              ? "border-[#0D6E5F] bg-[#0D6E5F]/5 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${activeTab === "general" ? "text-[#0D6E5F]" : "text-slate-700"}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              2. Términos y Condiciones
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Firma Digital
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Texto legal íntegro para firma digital obligatoria de contratistas al ingresar al portal.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reincidencias")}
          className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${activeTab === "reincidencias"
              ? "border-[#0D6E5F] bg-[#0D6E5F]/5 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${activeTab === "reincidencias" ? "text-[#0D6E5F]" : "text-slate-700"}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              3. Matriz de Reincidencias
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Penalizaciones
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Configura los mensajes oficiales y las horas de suspensión aplicadas a los vehículos por cada falta.
          </p>
        </button>
      </div>

      {/* PESTAÑA 1: SECCIONES DEL BANDERÍN FÍSICO */}
      {activeTab === "banderin" && (
        <div className="space-y-4">
          {/* Barra elegante de capacidad física */}
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <svg className="w-4 h-4 text-[#0D6E5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <span>Ocupación de la tarjeta física (13.0 × 19.5 cm):</span>
              <strong className={
                capacityPercent >= 100
                  ? "text-rose-600 font-bold"
                  : capacityPercent >= 88
                    ? "text-amber-700 font-bold"
                    : "text-[#0D6E5F] font-bold"
              }>
                {capacityPercent}% {capacityPercent >= 100 ? "(Capacidad Máxima)" : capacityPercent >= 88 ? "(Capacidad Alta)" : "(Espacio Disponible)"}
              </strong>
            </div>

            <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
              <span>{totalSections} / 12 secciones máx.</span>
              <span>{totalItems} normas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Editor de Secciones (Izquierda - 7 columnas) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Estructura de Secciones y Normas Impresas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Edita los títulos y agrega o elimina puntos para organizar el banderín impreso.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSection}
                  disabled={!canAddSection}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    !canAddSection
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-[#0D6E5F]/10 text-[#0D6E5F] hover:bg-[#0D6E5F]/20 cursor-pointer"
                  }`}
                  title={!canAddSection ? "Has alcanzado la capacidad física para nuevas secciones" : "Agregar nueva sección"}
                >
                  <span>{!canAddSection ? "Límite de Secciones" : "+ Nueva Sección"}</span>
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
                            placeholder="Descripción de la norma"
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
                          disabled={!canAddItem}
                          className={`text-[11px] font-bold flex items-center gap-1 ${
                            !canAddItem ? "text-slate-400 cursor-not-allowed" : "text-[#0D6E5F] hover:underline cursor-pointer"
                          }`}
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
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-800">
                      Previsualización en Escala Real
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Reverso · 13.0 × 19.5 cm (Hoja Carta)
                  </span>
                </div>

                {/* Contenedor del Banderín Simulado con proporción exacta de tarjeta física (13.0 x 19.5 cm) */}
                <div
                  className="bg-white border-2 border-black rounded p-3.5 font-sans text-black shadow-inner flex flex-col justify-between overflow-hidden"
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    height: "620px",
                    boxSizing: "border-box",
                  }}
                >
                  {(() => {
                    const unitPx = Math.min(15.5, Math.max(8.6, 530 / Math.max(1, estimatedLines + totalSections * 0.25)));
                    const itemFontPx = Math.min(10.0, Math.max(7.2, unitPx * 0.72));
                    const titleFontPx = Math.min(10.5, Math.max(7.8, itemFontPx * 1.06));
                    const secGapPx = Math.min(6, Math.max(2, unitPx * 0.35));
                    const lineHeightVal = estimatedLines > 44 ? "1.16" : estimatedLines > 36 ? "1.22" : "1.28";

                    return (
                      <div className="overflow-hidden">
                        <div className="text-center font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 text-[11px]">
                          Reglamento para Externos en Áreas Comunes
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: `${secGapPx}px` }} className="pr-0.5">
                          {reglamentoSecciones.map((sec, i) => (
                            <div key={i}>
                              <div
                                className="font-bold text-black uppercase"
                                style={{ fontSize: `${titleFontPx}px`, lineHeight: "1.2", marginBottom: "1px" }}
                              >
                                {sec.title || "SECCIÓN SIN TÍTULO"}
                              </div>
                              <ul className="list-disc pl-3.5 m-0" style={{ display: "flex", flexDirection: "column", gap: "0.5px" }}>
                                {sec.items.map((item, j) => (
                                  <li
                                    key={j}
                                    className="text-slate-900"
                                    style={{ fontSize: `${itemFontPx}px`, lineHeight: lineHeightVal }}
                                  >
                                    {item || "Norma pendiente de redacción"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between items-center text-[7.5px] text-slate-500 shrink-0">
                    <span>Las Palomas Rocky Point HOA</span>
                    <span className="font-mono">Vigencia 1 Año</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                    </svg>
                    Cara Posterior Física
                  </span>
                  <span className="font-medium text-slate-500">
                    {totalSections} secciones · {totalItems} normas · {totalChars} caracteres
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: TÉRMINOS Y CONDICIONES GENERALES (DIGITAL) */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Editor de Texto (Izquierda - 7 columnas) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Texto Completo de Términos y Condiciones Legales
                </h3>
                <p className="text-xs text-slate-500">
                  Documento íntegro que los contratistas leen y firman digitalmente al registrarse por primera vez.
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
                  Vista Previa de la Firma Digital
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

      {/* PESTAÑA 3: MATRIZ DE REINCIDENCIAS & PENALIZACIONES */}
      {activeTab === "reincidencias" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0D6E5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Matriz Disciplinaria de Reincidencias y Horas de Penalización</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                  Las suspensiones vehiculares inician automáticamente al día siguiente a las 12:00 AM tras la aprobación del supervisor y permanecen activas durante el número exacto de horas configuradas. Al vencer este plazo, el vehículo es liberado automáticamente a estatus <strong>Habilitado</strong> en caseta.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:brightness-110 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #0D6E5F, #108e7a)" }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  </svg>
                  <span>Guardar Matriz de Reincidencias</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(reglasReincidencia || []).map((regla) => {
              const numFalta = regla.numero_falta;
              const badgeColors: Record<number, string> = {
                1: "bg-teal-50 text-teal-800 border-teal-200",
                2: "bg-amber-50 text-amber-800 border-amber-200",
                3: "bg-orange-50 text-orange-800 border-orange-200",
                4: "bg-rose-50 text-rose-800 border-rose-200",
              };

              const formatDuracionCompact = (val: any) => {
                const h = Number(val ?? 0);
                if (h === 0) return "Sin suspensión";
                if (h === -1 || h >= 9999) return "Permanente";
                if (h < 24) return `${h} ${h === 1 ? "hr" : "hrs"}`;
                const dias = Math.floor(h / 24);
                const resto = h % 24;
                if (resto === 0) return `${h} hrs (${dias} ${dias === 1 ? "día" : "días"})`;
                return `${h} hrs (${dias}d ${resto}h)`;
              };

              return (
                <div
                  key={numFalta}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-[#0D6E5F]/50 transition-colors space-y-4"
                >
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 min-h-[42px]">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border whitespace-nowrap shrink-0 ${badgeColors[numFalta] || "bg-slate-50 text-slate-800 border-slate-200"}`}>
                        {numFalta}ª Falta Reincidente
                      </span>
                      <span className={`text-xs font-bold whitespace-nowrap shrink-0 ${regla.permite_acceso ? "text-emerald-700" : "text-red-700"}`}>
                        {regla.permite_acceso ? "• Acceso Permitido" : "• Acceso Denegado"}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap shrink-0">
                      {formatDuracionCompact(regla.horas_suspension)}
                    </span>
                  </div>

                  {/* Mensaje oficial */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Mensaje Oficial y Medida Disciplinaria *
                    </label>
                    <textarea
                      rows={2}
                      value={regla.mensaje_alerta}
                      onChange={(e) => handleReglaChange(numFalta, "mensaje_alerta", e.target.value)}
                      placeholder="Ej. Segunda Falta: Suspensión temporal de 24 horas. Acceso denegado."
                      className="w-full rounded-xl p-3 text-xs border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-200 text-slate-800 leading-relaxed font-medium bg-slate-50/50 focus:bg-white"
                    />
                  </div>

                  {/* Selector y configuración de horas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between min-h-[20px]">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap">
                        Horas de Penalización en Caseta
                      </label>
                      <span className="text-[11px] font-bold text-[#0D6E5F] whitespace-nowrap">
                        {formatDuracionCompact(regla.horas_suspension)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "0 hrs (Sin suspensión)", val: 0 },
                        { label: "24 hrs (1 día)", val: 24 },
                        { label: "48 hrs (2 días)", val: 48 },
                        { label: "72 hrs (3 días)", val: 72 },
                        { label: "168 hrs (1 semana)", val: 168 },
                        { label: "336 hrs (2 semanas)", val: 336 },
                        { label: "Permanente (-1)", val: -1 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() => {
                            const isNoSuspension = preset.val === 0;
                            const isPermanent = preset.val === -1;
                            handleUpdateRegla(numFalta, {
                              horas_suspension: preset.val,
                              permite_acceso: isNoSuspension,
                              ...(isPermanent ? { requiere_administrador: true } : {}),
                            });
                            setEditingHoras((prev) => ({ ...prev, [numFalta]: String(preset.val) }));
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            Number(regla.horas_suspension) === preset.val
                              ? "bg-[#0D6E5F] text-white border-[#0D6E5F] shadow-xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs text-slate-500 font-medium">O ingresa horas exactas:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={-1}
                          max={8760}
                          value={
                            editingHoras[numFalta] !== undefined
                              ? editingHoras[numFalta]
                              : (regla.horas_suspension ?? 0)
                          }
                          onFocus={() => {
                            if (editingHoras[numFalta] === undefined) {
                              setEditingHoras((prev) => ({
                                ...prev,
                                [numFalta]: String(regla.horas_suspension ?? 0),
                              }));
                            }
                          }}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setEditingHoras((prev) => ({ ...prev, [numFalta]: raw }));
                            if (raw === "" || raw === "-") return;
                            const parsed = parseInt(raw, 10);
                            if (!isNaN(parsed)) {
                              handleUpdateRegla(numFalta, {
                                horas_suspension: parsed,
                                permite_acceso: parsed === 0,
                                ...(parsed === -1 ? { requiere_administrador: true } : {}),
                              });
                            }
                          }}
                          onBlur={() => {
                            const currentRaw = editingHoras[numFalta];
                            if (currentRaw === "" || currentRaw === undefined || isNaN(parseInt(currentRaw, 10))) {
                              handleUpdateRegla(numFalta, {
                                horas_suspension: 0,
                                permite_acceso: true,
                              });
                              setEditingHoras((prev) => ({ ...prev, [numFalta]: "0" }));
                            } else {
                              const parsed = parseInt(currentRaw, 10);
                              setEditingHoras((prev) => ({ ...prev, [numFalta]: String(parsed) }));
                            }
                          }}
                          className="w-24 rounded-lg px-2.5 py-1 text-xs border border-slate-300 font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
                        />
                        <span className="text-xs text-slate-600 font-semibold">horas</span>
                      </div>
                    </div>
                  </div>

                  {/* Parámetros booleanos */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={regla.permite_acceso}
                        onChange={(e) => handleReglaChange(numFalta, "permite_acceso", e.target.checked)}
                        className="rounded text-[#0D6E5F] focus:ring-[#0D6E5F] w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-slate-700">Permitir acceso vehicular en caseta</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={regla.requiere_administrador}
                        onChange={(e) => handleReglaChange(numFalta, "requiere_administrador", e.target.checked)}
                        className="rounded text-[#0D6E5F] focus:ring-[#0D6E5F] w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-slate-700">Requiere mediación de Dirección HOA</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL MODERNO DE CONFIRMACIÓN / ALERTAS */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 transform transition-all animate-in zoom-in-95 duration-150 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${modalConfig.icon === "reset" || modalConfig.isDestructive
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : modalConfig.icon === "warning"
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : "bg-teal-50 text-[#0D6E5F] border border-teal-100"
                  }`}
              >
                {modalConfig.icon === "reset" ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                ) : modalConfig.icon === "warning" ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {modalConfig.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {modalConfig.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              {modalConfig.cancelText && (
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={modalConfig.onConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:brightness-110 cursor-pointer ${modalConfig.isDestructive
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-[#0D6E5F] hover:bg-[#0b5d50] shadow-[#0D6E5F]/20"
                  }`}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorReglamentoEditor;

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { ReglamentoSection } from "./SupervisorReglamentoEditor";
import { LPLogo } from "./AppPrimitives";
import { formatCorbatinVerdeNum } from "../utils/formatters";

export const DEFAULT_REGLAMENTO_SECTIONS: ReglamentoSection[] = [
  { title: "1. INGRESO", items: ["Registrar: corbatín, compañía, vehículo, placas, nombre y celular.", "Indicar área de trabajo y horario.", "Portar uniforme, gafete visible y EPP obligatorio."] },
  { title: "2. ÁREA DE TRABAJO", items: ["Permanecer solo en el área asignada.", "Usar señalización de seguridad (conos, cintas).", "Uso obligatorio de EPP (incluye arnés en altura).", "Consumir alimentos solo en áreas designadas.", "No usar elevadores de huéspedes."] },
  { title: "3. VEHÍCULOS", items: ["Altura máxima: 2.40 m.", "Estacionarse solo en áreas autorizadas (Sótano 2).", "Colocar corbatín visible en el retrovisor o tablero."] },
  { title: "4. PROHIBICIONES", items: ['No tirar escombro en "Trash Chute".', "No dejar materiales en áreas comunes.", "No usar bocinas ni generar ruido excesivo.", "No dormir en áreas comunes."] },
  { title: "5. SANCIONES DISCIPLINARIAS", items: ["1ª: Amonestación escrita", "2ª: Suspensión de 24 a 48 hrs", "3ª: Suspensión de 1 semana", "Reincidencia: Restricción definitiva"] },
  { title: "6. HORARIOS", items: ["Lunes a viernes: 08:00 a 18:00 hrs", "Sábado: 09:00 a 14:00 hrs", "No generar ruido antes de 09:00 hrs", "Horarios especiales requieren autorización HOA."] },
];

export function RealQRCode({ value, size = 135 }: { value: string; size?: number }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(
      value,
      {
        width: size * 3,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#ffffff" },
      },
      (err, url) => {
        if (!err && url) setQrDataUrl(url);
      }
    );
  }, [value, size]);

  if (!qrDataUrl) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: "#f1f5f9",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          color: "#94a3b8",
        }}
      >
        Cargando QR...
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="Código QR Oficial"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "block",
        imageRendering: "pixelated",
      }}
    />
  );
}

function ReglamentoReverso({ sections }: { sections?: ReglamentoSection[] }) {
  const docSections = sections && sections.length > 0 ? sections : DEFAULT_REGLAMENTO_SECTIONS;
  let estLines = docSections.length * 1.5;
  docSections.forEach((sec) => {
    (sec.items || []).forEach((it) => {
      estLines += Math.max(1, Math.ceil((it || "").length / 58));
    });
  });

  const itemFontPx = estLines > 46 ? 7.6 : estLines > 36 ? 8.3 : 9.1;
  const titleFontPx = estLines > 46 ? 8.4 : estLines > 36 ? 9.1 : 9.8;
  const itemLineHeight = estLines > 42 ? "1.14" : "1.22";
  const secMarginPx = estLines > 42 ? 3 : 6;

  return (
    <div style={{ flex: 1, overflow: "hidden" }}>
      <div
        style={{
          fontSize: "11.5px",
          fontWeight: "900",
          textAlign: "center",
          marginBottom: estLines > 36 ? "4px" : "7px",
          color: "#000000",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Reglamento para externos en áreas comunes:
      </div>
      {docSections.map((sec, idx) => (
        <div key={sec.title || idx} style={{ marginBottom: `${secMarginPx}px` }}>
          <div style={{ fontSize: `${titleFontPx}px`, fontWeight: "bold", color: "#000000", marginBottom: "1px", lineHeight: "1.2" }}>
            {sec.title}
          </div>
          <ul style={{ margin: 0, paddingLeft: "14px", listStyleType: "disc" }}>
            {sec.items.map((item, i) => (
              <li key={i} style={{ fontSize: `${itemFontPx}px`, color: "#222222", lineHeight: itemLineHeight, marginBottom: "0.5px" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const CARD_SHELL_STYLE: React.CSSProperties = {
  width: "760px",
  background: "#ffffff",
  border: "2.5px solid #000000",
  fontFamily: "Arial, Helvetica, sans-serif",
  boxShadow: "0 8px 36px rgba(0,0,0,0.14)",
  borderRadius: "4px",
  overflow: "hidden",
  boxSizing: "border-box",
  margin: "0 auto",
};

const LEFT_CELL_STYLE: React.CSSProperties = {
  width: "380px",
  verticalAlign: "top",
  borderRight: "2px dashed #444444",
  padding: "16px 14px",
  textAlign: "center",
  background: "#ffffff",
  boxSizing: "border-box",
};

const RIGHT_CELL_STYLE: React.CSSProperties = {
  width: "380px",
  verticalAlign: "top",
  padding: "16px 16px 12px",
  textAlign: "left",
  background: "#ffffff",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
  overflow: "hidden",
};

const DOUBLE_RULE_STYLE: React.CSSProperties = {
  borderTop: "2px solid #000",
  borderBottom: "2px solid #000",
  height: "4px",
  margin: "5px auto",
  width: "100%",
};

export function CorbatinDocument({
  vehicle,
  sections,
}: {
  vehicle: { corbatinNum: string; placas: string; marca: string; modelo: string; anio?: string; conductor: string; empresaNombre: string };
  sections?: ReglamentoSection[];
}) {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const qrPayload = `LP-HOA|CORB:${vehicle.corbatinNum}|PLACAS:${vehicle.placas}|VIG:${currentYear}-${nextYear}`;

  return (
    <div id="corbatin-printable" style={CARD_SHELL_STYLE}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", margin: 0, padding: 0 }}>
        <tbody>
          <tr>
            <td style={LEFT_CELL_STYLE}>
              <div style={{ textAlign: "center", width: "100%" }}>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#000000", textAlign: "center", letterSpacing: "0.5px" }}>
                  CONTRATISTA
                </div>
                <div style={DOUBLE_RULE_STYLE} />
                <div style={{ padding: "4px 0", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <LPLogo size={150} />
                </div>
                <div style={DOUBLE_RULE_STYLE} />
                <div style={{ fontSize: "64px", fontWeight: "bold", color: "#000000", lineHeight: "1", textAlign: "center", width: "100%", padding: "2px 0" }}>
                  {vehicle.corbatinNum}
                </div>
                <div style={DOUBLE_RULE_STYLE} />
              </div>

              <div style={{ textAlign: "center", fontSize: "11px", color: "#222222", lineHeight: "1.35", padding: "4px 0" }}>
                <div style={{ fontWeight: "bold", fontSize: "12px", color: "#000" }}>{vehicle.marca} {vehicle.modelo} ({vehicle.anio})</div>
                <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "bold", color: "#000", letterSpacing: "1px", margin: "1px 0" }}>{vehicle.placas}</div>
                <div style={{ color: "#444444" }}>{vehicle.conductor}</div>
                <div style={{ color: "#0D6E5F", fontWeight: "bold", fontSize: "12px" }}>{vehicle.empresaNombre}</div>
              </div>

              <div style={{ borderTop: "1px dashed #aaaaaa", paddingTop: "6px", marginTop: "4px", textAlign: "center" }}>
                <div style={{ display: "inline-block", background: "#ffffff", padding: "5px", border: "2px solid #000000", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                  <RealQRCode value={qrPayload} size={125} />
                </div>
                <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#0D6E5F", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  VIGENCIA: 1 AÑO ({currentYear} – {nextYear})
                </div>
                <div style={{ fontSize: "9px", fontWeight: "bold", color: "#000000", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.25" }}>
                  POR FAVOR DE COLOCAR<br />EN EL RETROVISOR
                </div>
              </div>
            </td>

            <td style={RIGHT_CELL_STYLE}>
              <ReglamentoReverso sections={sections} />
              <div style={{ borderTop: "1px solid #cccccc", paddingTop: "5px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8px", color: "#555555", gap: "8px", overflow: "hidden" }}>
                <span style={{ flexShrink: 0, fontWeight: "600" }}>Las Palomas Rocky Point HOA</span>
                <span style={{ fontFamily: "monospace", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
                  Corbatín #{vehicle.corbatinNum} · {vehicle.placas} · Vigencia 1 Año ({currentYear}–{nextYear})
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function TarjetaCorbatinVerdePrintable({
  corb,
  sections,
}: {
  corb: { corbatinNum: string };
  sections?: ReglamentoSection[];
}) {
  const corbNumFormatted = formatCorbatinVerdeNum(corb.corbatinNum);
  const qrPayload = `LP-HOA|CORB-VERDE:${corbNumFormatted}`;

  return (
    <div id="corbatin-verde-printable" style={CARD_SHELL_STYLE}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", margin: 0, padding: 0 }}>
        <tbody>
          <tr>
            <td style={LEFT_CELL_STYLE}>
              <div style={{ textAlign: "center", width: "100%" }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#000000", textAlign: "center", letterSpacing: "0.5px" }}>
                  PROVEEDOR — ACCESO TEMPORAL
                </div>
                <div style={DOUBLE_RULE_STYLE} />
                <div style={{ padding: "4px 0", textAlign: "center", display: "flex", justifyContent: "center" }}>
                  <LPLogo size={150} />
                </div>
                <div style={DOUBLE_RULE_STYLE} />
                <div style={{ fontSize: "64px", fontWeight: "bold", color: "#000000", lineHeight: "1", textAlign: "center", width: "100%", padding: "2px 0", fontFamily: "var(--font-mono, monospace)" }}>
                  {corbNumFormatted}
                </div>
                <div style={DOUBLE_RULE_STYLE} />
              </div>

              <div style={{ textAlign: "center", fontSize: "11px", color: "#222222", lineHeight: "1.35", padding: "4px 0" }}>
                <div style={{ fontWeight: "bold", fontSize: "13px", color: "#000000", marginBottom: "1.5px" }}>LAS PALOMAS ROCKY POINT HOA</div>
                <div style={{ color: "#333333", fontWeight: "bold", fontSize: "11px" }}>Control de Acceso Vehicular</div>
              </div>

              <div style={{ borderTop: "1px dashed #444444", paddingTop: "8px", marginTop: "4px", textAlign: "center" }}>
                <div style={{ display: "inline-block", background: "#ffffff", padding: "5px", border: "2px solid #000000", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                  <RealQRCode value={qrPayload} size={130} />
                </div>
                <div style={{ fontSize: "9px", fontWeight: "bold", color: "#000000", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1.3" }}>
                  POR FAVOR DE COLOCAR<br />EN EL RETROVISOR
                </div>
              </div>
            </td>

            <td style={RIGHT_CELL_STYLE}>
              <ReglamentoReverso sections={sections} />
              <div style={{ borderTop: "1px solid #cccccc", paddingTop: "5px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8px", color: "#555555", gap: "8px", overflow: "hidden" }}>
                <span style={{ flexShrink: 0, fontWeight: "600" }}>Las Palomas Rocky Point HOA</span>
                <span style={{ fontFamily: "monospace", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
                  Corbatín Verde #{corbNumFormatted} · Acceso Temporal
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

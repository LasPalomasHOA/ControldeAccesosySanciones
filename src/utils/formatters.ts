/** Reproduce un aviso sonoro corto para notificaciones entrantes. */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, gainPeak: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(gainPeak, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(587.33, now, 0.15, 0.28); // D5
    playTone(880, now + 0.12, 0.18, 0.33); // A5
  } catch {
    // Silencioso si el navegador restringe el audio antes de interacción
  }
}

export function normalizeFotoUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./")
  ) {
    return trimmed;
  }
  return trimmed.startsWith("uploads/") ? `/${trimmed}` : `/uploads/${trimmed}`;
}

/** Formato de Corbatín Verde con prefijo '00' obligatorio: 001, 002, 0010, 00100. */
export const formatCorbatinVerdeNum = (num: number | string): string => {
  const cleanNum = parseInt(String(num).replace(/[^0-9]/g, ""), 10);
  if (isNaN(cleanNum) || cleanNum <= 0) return "001";
  return `00${cleanNum}`;
};

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API failed, using fallback:", err);
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
}

const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function formatFechaLegible(dateStr?: string | null, includeTime = true): string {
  if (!dateStr || dateStr === "—" || dateStr === "N/A" || dateStr === "S/N") return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);

    const day = String(d.getDate()).padStart(2, "0");
    const month = MONTHS_ES[d.getMonth()];
    const year = d.getFullYear();

    const hasTime = typeof dateStr === "string" && (dateStr.includes("T") || dateStr.includes(":"));
    if (!includeTime || !hasTime) {
      return `${day} ${month} ${year}`;
    }

    const rawHours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = rawHours >= 12 ? "PM" : "AM";
    const hours = String(rawHours % 12 || 12).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return String(dateStr);
  }
}

/** Convierte timestamps UTC / ISO a hora local del resort en America/Hermosillo. */
export function formatHoraLocal(timeStr?: string | Date | null): string {
  if (!timeStr || timeStr === "—" || timeStr === "N/A" || timeStr === "null" || timeStr === "undefined") return "—";
  const raw = String(timeStr).trim();
  if (!raw || raw === "-") return "—";

  if (/^\d{1,2}:\d{2}(\s*hrs)?$/i.test(raw)) {
    return raw.replace(/ hrs/i, "");
  }
  if (/^\d{1,2}:\d{2}\s*([ap]\.?\s*m\.?)(\s*hrs)?$/i.test(raw)) {
    return raw.replace(/ hrs/i, "");
  }

  try {
    let isoStr = raw;
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(raw)) {
      isoStr = raw.replace(" ", "T") + "Z";
    }
    const dateObj = new Date(isoStr);

    if (!isNaN(dateObj.getTime())) {
      try {
        return dateObj.toLocaleTimeString("en-US", {
          timeZone: "America/Hermosillo",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } catch {
        const utcMs = dateObj.getTime() + dateObj.getTimezoneOffset() * 60000;
        const d = new Date(utcMs - 7 * 3600000);
        const rawHours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const ampm = rawHours >= 12 ? "PM" : "AM";
        const hours = String(rawHours % 12 || 12).padStart(2, "0");
        return `${hours}:${minutes} ${ampm}`;
      }
    }
  } catch {
    // fallback
  }

  return raw.replace(/ hrs/i, "");
}

/** Lee y parsea JSON de sessionStorage/localStorage de forma segura. */
export function readStorageJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const saved = storage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

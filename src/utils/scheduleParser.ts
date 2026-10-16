import { ReglamentoSection } from "../components/SupervisorReglamentoEditor";

export interface ScheduleDayLimit {
  isWorkDay: boolean;
  startMinutes: number; // Ej: 8 * 60 = 480 (08:00)
  limitMinutes: number; // Ej: 18 * 60 = 1080 (18:00)
  startTimeStr: string; // "08:00"
  limitTimeStr: string; // "18:00"
  rawText?: string;
}

export interface ScheduleConfig {
  weekdays: ScheduleDayLimit;
  saturday: ScheduleDayLimit;
  sunday: ScheduleDayLimit;
  sourceSectionTitle?: string;
  isDynamic: boolean;
}

export interface ContratistaExcedido {
  registroId: string;
  empresaNombre: string;
  conductor: string;
  telefono: string;
  placas: string;
  corbatinNum: string;
  horaEntrada: string;
  horaLimite: string;
  minutosExcedidos: number;
  esPernocta: boolean;
  fechaIngreso: string;
  idVehiculo?: string;
  idCorbatin?: string;
  rawRegistro: any;
}

// Horarios institucionales predeterminados de Las Palomas HOA (Fallback seguro)
const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  weekdays: {
    isWorkDay: true,
    startMinutes: 8 * 60,
    limitMinutes: 18 * 60,
    startTimeStr: "08:00",
    limitTimeStr: "18:00",
    rawText: "Lunes a viernes: 08:00 a 18:00 hrs"
  },
  saturday: {
    isWorkDay: true,
    startMinutes: 9 * 60,
    limitMinutes: 14 * 60,
    startTimeStr: "09:00",
    limitTimeStr: "14:00",
    rawText: "Sábado: 09:00 a 14:00 hrs"
  },
  sunday: {
    isWorkDay: false,
    startMinutes: 0,
    limitMinutes: 0,
    startTimeStr: "00:00",
    limitTimeStr: "00:00",
    rawText: "Domingos: Sin labores autorizadas"
  },
  sourceSectionTitle: "Valores Institucionales por Defecto",
  isDynamic: false
};

/**
 * Convierte un string "HH:MM" a minutos transcurridos en el día (0 - 1439)
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Extrae dinámicamente la configuración de horarios desde las secciones activas del reglamento.
 * Totalmente desacoplado del orden o número de regla.
 */
export function parseScheduleFromSections(sections: ReglamentoSection[]): ScheduleConfig {
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return DEFAULT_SCHEDULE_CONFIG;
  }

  // 1. Localizar la sección relevante por coincidencia semántica
  const scheduleKeywords = /horario|jornada|turnos|d[ií]as\s+h[aá]biles|horas\s+de\s+trabajo/i;
  let targetSection = sections.find(s => scheduleKeywords.test(s.title || ""));

  // Si no se encuentra por título, buscar en las normas por patrones de hora ("HH:MM a HH:MM")
  if (!targetSection) {
    targetSection = sections.find(s =>
      Array.isArray(s.items) && s.items.some(it => /\b\d{1,2}:\d{2}\s*(?:a|a\s+las|-)\s*\d{1,2}:\d{2}\b/i.test(it))
    );
  }

  if (!targetSection || !Array.isArray(targetSection.items) || targetSection.items.length === 0) {
    return DEFAULT_SCHEDULE_CONFIG;
  }

  const result: ScheduleConfig = {
    weekdays: { ...DEFAULT_SCHEDULE_CONFIG.weekdays },
    saturday: { ...DEFAULT_SCHEDULE_CONFIG.saturday },
    sunday: { ...DEFAULT_SCHEDULE_CONFIG.sunday },
    sourceSectionTitle: targetSection.title,
    isDynamic: true
  };

  const timeRangeRegex = /(\d{1,2}:\d{2})\s*(?:a|a\s+las|-)\s*(\d{1,2}:\d{2})/i;

  targetSection.items.forEach(item => {
    const text = (item || "").trim();
    if (!text) return;

    // A. Lunes a Viernes
    if (/lunes\s*(?:a|al|-)\s*viernes|entre\s*semana/i.test(text)) {
      const match = text.match(timeRangeRegex);
      if (match) {
        const start = match[1];
        const end = match[2];
        result.weekdays = {
          isWorkDay: true,
          startTimeStr: start,
          limitTimeStr: end,
          startMinutes: parseTimeToMinutes(start),
          limitMinutes: parseTimeToMinutes(end),
          rawText: text
        };
      }
    }
    // B. Sábado
    else if (/s[aá]bado/i.test(text)) {
      const match = text.match(timeRangeRegex);
      if (match) {
        const start = match[1];
        const end = match[2];
        result.saturday = {
          isWorkDay: true,
          startTimeStr: start,
          limitTimeStr: end,
          startMinutes: parseTimeToMinutes(start),
          limitMinutes: parseTimeToMinutes(end),
          rawText: text
        };
      }
    }
    // C. Domingo
    else if (/domingo/i.test(text)) {
      if (/no\s*(?:se\s*permite|laboral|autorizado)/i.test(text)) {
        result.sunday = {
          isWorkDay: false,
          startTimeStr: "00:00",
          limitTimeStr: "00:00",
          startMinutes: 0,
          limitMinutes: 0,
          rawText: text
        };
      } else {
        const match = text.match(timeRangeRegex);
        if (match) {
          result.sunday = {
            isWorkDay: true,
            startTimeStr: match[1],
            limitTimeStr: match[2],
            startMinutes: parseTimeToMinutes(match[1]),
            limitMinutes: parseTimeToMinutes(match[2]),
            rawText: text
          };
        }
      }
    }
  });

  return result;
}

/**
 * Obtiene el límite aplicable para el día de la semana actual
 */
export function getCurrentDaySchedule(config: ScheduleConfig, now = new Date()): ScheduleDayLimit & { dayName: string } {
  const day = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  switch (day) {
    case 6:
      return { ...config.saturday, dayName: "Sábado" };
    case 0:
      return { ...config.sunday, dayName: "Domingo" };
    default:
      return { ...config.weekdays, dayName: "Lunes a Viernes" };
  }
}

/**
 * Evalúa los registros activos de la bitácora ("Dentro") y retorna la lista de contratistas que exceden el horario.
 */
export function evaluateOvertimeContractors(
  bitacora: any[],
  sections: ReglamentoSection[],
  now = new Date()
): ContratistaExcedido[] {
  if (!bitacora || !Array.isArray(bitacora)) return [];

  const config = parseScheduleFromSections(sections);
  const todaySchedule = getCurrentDaySchedule(config, now);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDateStr = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

  const excedidos: ContratistaExcedido[] = [];

  bitacora.forEach(b => {
    // Solo evaluar quienes estén actualmente adentro
    if (b.estado !== "Dentro" || b.horaSalida || b.raw_hora_salida) {
      return;
    }

    // Fecha de ingreso
    let fechaIngresoStr = b.fecha;
    if (!fechaIngresoStr && b.created_at) {
      try {
        fechaIngresoStr = new Date(b.created_at).toISOString().split("T")[0];
      } catch {}
    }
    if (!fechaIngresoStr) {
      fechaIngresoStr = todayDateStr;
    }

    const esFechaAnterior = fechaIngresoStr < todayDateStr;

    // Caso 1: Pernocta / Ingreso de día anterior que no ha registrado salida
    if (esFechaAnterior) {
      excedidos.push({
        registroId: String(b.id),
        empresaNombre: b.empresaNombre || "Empresa Externa",
        conductor: b.conductor || "Conductor No Especificado",
        telefono: b.telefono || "",
        placas: b.placas || "—",
        corbatinNum: b.corbatinNum || "—",
        horaEntrada: b.horaEntrada || "—",
        horaLimite: todaySchedule.limitTimeStr,
        minutosExcedidos: 120, // Marcador de exceso crítico
        esPernocta: true,
        fechaIngreso: fechaIngresoStr,
        idVehiculo: b.vehicleId || b.id_vehiculo,
        idCorbatin: b.corbatinNum ? b.corbatinNum.replace("#", "") : undefined,
        rawRegistro: b
      });
      return;
    }

    // Caso 2: Ingresó hoy, pero el día no es laborable (ej. Domingo)
    if (!todaySchedule.isWorkDay) {
      excedidos.push({
        registroId: String(b.id),
        empresaNombre: b.empresaNombre || "Empresa Externa",
        conductor: b.conductor || "Conductor No Especificado",
        telefono: b.telefono || "",
        placas: b.placas || "—",
        corbatinNum: b.corbatinNum || "—",
        horaEntrada: b.horaEntrada || "—",
        horaLimite: "Día Inhábil",
        minutosExcedidos: Math.max(1, currentMinutes - (b.raw_hora_entrada ? parseTimeToMinutes(b.raw_hora_entrada) : 0)),
        esPernocta: false,
        fechaIngreso: fechaIngresoStr,
        idVehiculo: b.vehicleId || b.id_vehiculo,
        idCorbatin: b.corbatinNum ? b.corbatinNum.replace("#", "") : undefined,
        rawRegistro: b
      });
      return;
    }

    // Caso 3: Ingresó hoy y la hora actual ya superó la hora límite del día
    if (currentMinutes > todaySchedule.limitMinutes) {
      const minutosExcedidos = currentMinutes - todaySchedule.limitMinutes;
      excedidos.push({
        registroId: String(b.id),
        empresaNombre: b.empresaNombre || "Empresa Externa",
        conductor: b.conductor || "Conductor No Especificado",
        telefono: b.telefono || "",
        placas: b.placas || "—",
        corbatinNum: b.corbatinNum || "—",
        horaEntrada: b.horaEntrada || "—",
        horaLimite: todaySchedule.limitTimeStr,
        minutosExcedidos,
        esPernocta: false,
        fechaIngreso: fechaIngresoStr,
        idVehiculo: b.vehicleId || b.id_vehiculo,
        idCorbatin: b.corbatinNum ? b.corbatinNum.replace("#", "") : undefined,
        rawRegistro: b
      });
    }
  });

  return excedidos;
}

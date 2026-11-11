const DEFAULT_REGLAS = [
  { id_regla: 1, numero_falta: 1, permite_acceso: true, requiere_administrador: false, horas_suspension: 0, mensaje_alerta: 'Primera Falta: Llamada de atención. Acceso permitido.', activo: true },
  { id_regla: 2, numero_falta: 2, permite_acceso: false, requiere_administrador: false, horas_suspension: 24, mensaje_alerta: 'Segunda Falta: Suspensión temporal de 24 horas. Acceso denegado.', activo: true },
  { id_regla: 3, numero_falta: 3, permite_acceso: false, requiere_administrador: false, horas_suspension: 168, mensaje_alerta: 'Tercera Falta: Suspensión temporal de 1 semana. Acceso denegado.', activo: true },
  { id_regla: 4, numero_falta: 4, permite_acceso: false, requiere_administrador: true, horas_suspension: -1, mensaje_alerta: 'Cuarta Falta: Sanción definitiva (bloqueo permanente). Requiere resolución de Dirección HOA.', activo: true }
];

/**
 * Devuelve las 12:00:00.000 AM (medianoche local) del día calendario siguiente a baseDate.
 * Si el proceso corre en UTC puro (ej. servidor cloud con getTimezoneOffset() === 0),
 * toma como referencia la zona horaria local de Sonora (America/Hermosillo, UTC-7).
 */
function getNextDayMidnightLocal(baseDate = new Date()) {
  const now = baseDate instanceof Date ? baseDate : new Date(baseDate);
  if (now.getTimezoneOffset() === 0) {
    const sonoraOffsetMs = -7 * 60 * 60 * 1000;
    const localTime = new Date(now.getTime() + sonoraOffsetMs);
    return new Date(
      Date.UTC(
        localTime.getUTCFullYear(),
        localTime.getUTCMonth(),
        localTime.getUTCDate() + 1,
        7, 0, 0, 0
      )
    );
  }
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
}

/**
 * Normaliza la fecha de inicio de una sanción al inicio reglamentario (12:00 AM hora local).
 * Si la fecha fue guardada con hora distinta a 00:00:00 (por ejemplo, la hora exacta de aprobación del día anterior),
 * la ajusta a las 00:00:00 del día siguiente. Si ya está en medianoche local, se conserva tal cual.
 */
function normalizarInicioSancion(fechaInicioRaw) {
  if (!fechaInicioRaw) return null;

  if (typeof fechaInicioRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaInicioRaw.trim())) {
    const [y, m, day] = fechaInicioRaw.trim().split('-').map(Number);
    if (new Date().getTimezoneOffset() === 0) {
      return new Date(Date.UTC(y, m - 1, day, 7, 0, 0, 0));
    }
    return new Date(y, m - 1, day, 0, 0, 0, 0);
  }

  const d = new Date(fechaInicioRaw);
  if (isNaN(d.getTime())) return null;

  if (d.getTimezoneOffset() === 0) {
    const sonoraOffsetMs = -7 * 60 * 60 * 1000;
    const localTime = new Date(d.getTime() + sonoraOffsetMs);
    if (localTime.getUTCHours() !== 0 || localTime.getUTCMinutes() !== 0 || localTime.getUTCSeconds() !== 0) {
      return getNextDayMidnightLocal(d);
    }
    return new Date(Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate(), 7, 0, 0, 0));
  }

  if (d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0) {
    return getNextDayMidnightLocal(d);
  }

  d.setMilliseconds(0);
  return d;
}

function extraerHorasRegla(plainR, defaultHoras = 0) {
  let horas = plainR?.horas_suspension;
  if (horas === undefined || horas === null) {
    const hMatch = String(plainR?.mensaje_alerta || '').match(/\[HORAS:(-?\d+)\]/);
    if (hMatch) {
      horas = parseInt(hMatch[1], 10);
    } else {
      horas = defaultHoras;
    }
  }
  return Number(horas);
}

/**
 * Carga y normaliza todas las reglas activas de reincidencia indexadas por numero_falta.
 */
async function cargarMapaReglas(db) {
  const reglasMap = new Map();
  for (const d of DEFAULT_REGLAS) {
    reglasMap.set(d.numero_falta, { ...d });
  }

  try {
    const reglasRaw = await db.ReglaReincidencia.findAll({ where: { activo: true } });
    for (const r of (reglasRaw || [])) {
      const plainR = typeof r?.toJSON === 'function' ? r.toJSON() : r;
      const numFalta = Number(plainR.numero_falta || plainR.id_regla);
      if (!numFalta) continue;
      const def = reglasMap.get(numFalta);
      const horas = extraerHorasRegla(plainR, def ? def.horas_suspension : 0);
      reglasMap.set(numFalta, {
        ...plainR,
        id_regla: plainR.id_regla || numFalta,
        numero_falta: numFalta,
        horas_suspension: horas,
        permite_acceso: Boolean(plainR.permite_acceso),
        requiere_administrador: Boolean(plainR.requiere_administrador),
        mensaje_alerta: String(plainR.mensaje_alerta || '').replace(/\[HORAS:.*?\]/g, '').trim()
      });
    }
  } catch (e) {
    // Usar defaults si la consulta falla
  }

  return reglasMap;
}

/**
 * Calcula fecha_inicio (12:00 AM del día siguiente al reporte/aprobación)
 * y fecha_fin dinámica según las horas de penalización configuradas en la regla.
 */
function calcularFechasSancion(fechaInicioRaw, regla, fallbackFechaFin = null, nivelFallback = 1) {
  const fechaInicio = normalizarInicioSancion(fechaInicioRaw);
  const def = DEFAULT_REGLAS.find(d => d.numero_falta === Number(nivelFallback)) || DEFAULT_REGLAS[0];
  const horasRegla = regla
    ? extraerHorasRegla(regla, def.horas_suspension)
    : def.horas_suspension;

  let fechaFin = null;
  if (horasRegla === -1) {
    fechaFin = null;
  } else if (horasRegla > 0 && fechaInicio) {
    fechaFin = new Date(fechaInicio.getTime() + horasRegla * 60 * 60 * 1000);
  } else if (regla && horasRegla === 0) {
    fechaFin = null;
  } else {
    fechaFin = fallbackFechaFin ? new Date(fallbackFechaFin) : null;
  }

  return { fechaInicio, fechaFin, horasRegla };
}

function isSancionBloqueantePorRegla(sancion, regla) {
  if (regla) {
    return !regla.permite_acceso || regla.horas_suspension > 0 || regla.horas_suspension === -1 || regla.requiere_administrador;
  }
  const nivel = Number(sancion?.numero_reincidencia || sancion?.id_regla || 1);
  return nivel >= 2 || Boolean(sancion?.fecha_fin);
}

module.exports = {
  DEFAULT_REGLAS,
  getNextDayMidnightLocal,
  normalizarInicioSancion,
  extraerHorasRegla,
  cargarMapaReglas,
  calcularFechasSancion,
  isSancionBloqueantePorRegla
};

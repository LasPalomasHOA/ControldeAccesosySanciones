const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models/index.cjs');
const { DEFAULT_REGLAS, calcularFechasSancion } = require('../utils/sancionReglas.cjs');

/**
 * Recalcula fecha_inicio (12:00 AM) y fecha_fin en BD para sanciones activas/programadas
 * cuando el supervisor edita las horas de penalización de una regla.
 */
async function sincronizarSancionesPorRegla(reglaActualizada) {
  try {
    const numFalta = Number(reglaActualizada?.numero_falta || reglaActualizada?.id_regla);
    if (!numFalta) return;

    const sanciones = await db.Sancion.findAll({
      where: {
        numero_reincidencia: numFalta,
        estatus: { [Op.in]: ['ACTIVA', 'PROGRAMADA', 'RATIFICADA', 'EN_APELACION', 'PERMANENTE'] }
      }
    });

    for (const s of sanciones) {
      const { fechaInicio, fechaFin } = calcularFechasSancion(
        s.fecha_inicio,
        reglaActualizada,
        s.fecha_fin,
        numFalta
      );
      if (fechaInicio) {
        await s.update({
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        });
      }
    }
  } catch (err) {
    console.warn('Advertencia al sincronizar fechas de sanciones tras editar regla:', err.message);
  }
}

let columnCheckDone = false;
async function ensureColumnExists() {
  if (columnCheckDone) return;
  try {
    const schema = db.sequelize?.options?.define?.schema || 'control_acceso';
    await db.sequelize.query(`
      ALTER TABLE IF EXISTS "${schema}".reglas_reincidencia 
      ADD COLUMN IF NOT EXISTS horas_suspension INTEGER DEFAULT 0;
    `);
    columnCheckDone = true;
  } catch (e) {
    columnCheckDone = true;
  }
}

// Normalizar regla para presentación limpia y robusta
function normalizarRegla(r) {
  const plain = typeof r?.toJSON === 'function' ? r.toJSON() : (r || {});
  let horas = plain.horas_suspension;
  const msg = String(plain.mensaje_alerta || '');

  if (horas === undefined || horas === null) {
    const match = msg.match(/\[HORAS:(-?\d+)\]/);
    if (match) {
      horas = parseInt(match[1], 10);
    } else {
      const num = Number(plain.numero_falta);
      if (num === 1) horas = 0;
      else if (num === 2) horas = 24;
      else if (num === 3) horas = 168;
      else horas = -1;
    }
  }

  const cleanMsg = msg
    .replace(/\[HORAS:.*?\]/g, '')
    .trim();

  return {
    ...plain,
    id_regla: plain.id_regla || plain.numero_falta,
    horas_suspension: Number(horas),
    mensaje_alerta: cleanMsg
  };
}

// GET /api/reglas - Listar reglas de reincidencia
router.get('/', async (req, res) => {
  try {
    await ensureColumnExists();
    let reglas = await db.ReglaReincidencia.findAll({ order: [['numero_falta', 'ASC']] });
    
    if (!reglas || reglas.length === 0) {
      for (const d of DEFAULT_REGLAS) {
        await db.ReglaReincidencia.findOrCreate({
          where: { numero_falta: d.numero_falta },
          defaults: d
        }).catch(() => {});
      }
      reglas = await db.ReglaReincidencia.findAll({ order: [['numero_falta', 'ASC']] });
    }

    const resultado = (reglas && reglas.length > 0 ? reglas : DEFAULT_REGLAS).map(normalizarRegla);
    res.json(resultado);
  } catch (error) {
    console.warn('Advertencia al consultar reglas de reincidencia (retornando defaults):', error.message);
    res.json(DEFAULT_REGLAS);
  }
});

// PUT /api/reglas - Actualización masiva de la matriz de reincidencias
router.put('/', async (req, res) => {
  try {
    await ensureColumnExists();
    const reglasInput = Array.isArray(req.body)
      ? req.body
      : (Array.isArray(req.body?.reglas) ? req.body.reglas : []);

    if (reglasInput.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de reglas para actualizar' });
    }

    const updated = [];
    for (const item of reglasInput) {
      const numFalta = Number(item.numero_falta);
      if (!numFalta) continue;

      let regla = await db.ReglaReincidencia.findOne({
        where: { numero_falta: numFalta }
      });

      const horas = (item.horas_suspension !== undefined && item.horas_suspension !== null)
        ? Number(item.horas_suspension)
        : (numFalta === 1 ? 0 : (numFalta === 2 ? 24 : (numFalta === 3 ? 168 : -1)));

      const cleanMsg = String(item.mensaje_alerta || '').replace(/\[HORAS:.*?\]/g, '').trim();
      const encodedMsg = `${cleanMsg} [HORAS:${horas}]`;

      const payload = {
        permite_acceso: Boolean(item.permite_acceso),
        requiere_administrador: Boolean(item.requiere_administrador),
        mensaje_alerta: encodedMsg,
        horas_suspension: horas,
        activo: item.activo !== false
      };

      if (regla) {
        try {
          await regla.update(payload);
        } catch (colErr) {
          await regla.update({
            permite_acceso: payload.permite_acceso,
            requiere_administrador: payload.requiere_administrador,
            mensaje_alerta: payload.mensaje_alerta,
            activo: payload.activo
          });
        }
      } else {
        try {
          regla = await db.ReglaReincidencia.create({
            numero_falta: numFalta,
            ...payload
          });
        } catch (colErr) {
          regla = await db.ReglaReincidencia.create({
            numero_falta: numFalta,
            permite_acceso: payload.permite_acceso,
            requiere_administrador: payload.requiere_administrador,
            mensaje_alerta: payload.mensaje_alerta,
            activo: payload.activo
          });
        }
      }

      const reglaNormalizada = normalizarRegla(regla);
      await sincronizarSancionesPorRegla(reglaNormalizada);
      updated.push(reglaNormalizada);
    }

    res.json({ success: true, count: updated.length, reglas: updated });
  } catch (error) {
    console.error('Error al actualizar reglas de reincidencia:', error);
    res.status(500).json({ error: 'Error al actualizar reglas de reincidencia', details: error.message });
  }
});

// PUT /api/reglas/:id - Actualización de una regla específica
router.put('/:id', async (req, res) => {
  try {
    await ensureColumnExists();
    const id = req.params.id;
    let regla = await db.ReglaReincidencia.findByPk(id);
    if (!regla) {
      regla = await db.ReglaReincidencia.findOne({ where: { numero_falta: Number(id) } });
    }
    if (!regla) {
      return res.status(404).json({ error: 'Regla de reincidencia no encontrada' });
    }

    const { mensaje_alerta, permite_acceso, requiere_administrador, horas_suspension, activo } = req.body;
    const numFalta = regla.numero_falta;
    const horas = (horas_suspension !== undefined && horas_suspension !== null)
      ? Number(horas_suspension)
      : (numFalta === 1 ? 0 : (numFalta === 2 ? 24 : (numFalta === 3 ? 168 : -1)));

    const cleanMsg = String(mensaje_alerta !== undefined ? mensaje_alerta : regla.mensaje_alerta).replace(/\[HORAS:.*?\]/g, '').trim();
    const encodedMsg = `${cleanMsg} [HORAS:${horas}]`;

    try {
      await regla.update({
        mensaje_alerta: encodedMsg,
        permite_acceso: permite_acceso !== undefined ? Boolean(permite_acceso) : regla.permite_acceso,
        requiere_administrador: requiere_administrador !== undefined ? Boolean(requiere_administrador) : regla.requiere_administrador,
        horas_suspension: horas,
        activo: activo !== undefined ? Boolean(activo) : regla.activo
      });
    } catch (e) {
      await regla.update({
        mensaje_alerta: encodedMsg,
        permite_acceso: permite_acceso !== undefined ? Boolean(permite_acceso) : regla.permite_acceso,
        requiere_administrador: requiere_administrador !== undefined ? Boolean(requiere_administrador) : regla.requiere_administrador,
        activo: activo !== undefined ? Boolean(activo) : regla.activo
      });
    }

    const reglaNormalizada = normalizarRegla(regla);
    await sincronizarSancionesPorRegla(reglaNormalizada);
    res.json(reglaNormalizada);
  } catch (error) {
    console.error('Error al actualizar regla:', error);
    res.status(500).json({ error: 'Error al actualizar regla', details: error.message });
  }
});

module.exports = router;

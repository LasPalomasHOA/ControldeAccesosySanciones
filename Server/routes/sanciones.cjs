const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');
const events = require('../events.cjs');
const { saveBase64Image } = require('../utils/imageHandler.cjs');

// GET /api/sanciones - Listar todas las sanciones con soporte para apelaciones (limitado a 100)
router.get('/', async (req, res) => {
  try {
    const { id_vehiculo } = req.query;
    const where = {};
    if (id_vehiculo) {
      where.id_vehiculo = id_vehiculo;
    }

    const sanciones = await db.Sancion.findAll({
      where,
      limit: 100,
      include: [
        { model: db.Vehiculo, as: 'vehiculo', attributes: ['id_vehiculo', 'placas', 'marca', 'modelo', 'color', 'estatus_acceso'] },
        { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social', 'telefono', 'correo'] },
        { model: db.ReglaReincidencia, as: 'regla' },
        {
          model: db.ReporteInfraccion,
          as: 'reporte',
          attributes: ['id_reporte', 'fecha_hora', 'id_infraccion', 'ubicacion_texto', 'descripcion_hechos', 'estatus_revision'],
          include: [
            { model: db.CatalogoInfraccion, as: 'infraccion' },
            { model: db.Evidencia, as: 'evidencias', attributes: ['id_evidencia', 'archivo', 'descripcion', 'fecha_captura', 'activa'] }
          ]
        },
        { model: db.Usuario, as: 'usuario_aprobador', attributes: ['id_usuario', 'nombre'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const ahora = new Date();

    // Calcular el índice cronológico real de reincidencia por vehículo excluyendo apelaciones aprobadas (CANCELADA/ACLARADA) y levantamientos definitivos
    const isCanceladaOLevantada = (plainRow) => {
      const est = String(plainRow.estatus || '').trim().toUpperCase();
      if (est === 'CANCELADA' || est === 'ACLARADA' || est === 'CANCELADO' || est === 'ACLARADO') {
        return true;
      }
      const mot = String(plainRow.motivo || '');
      if (mot.includes('[RESOLUCION_OFICINA_DATA]') && mot.includes('levantamiento_definitivo')) {
        return true;
      }
      return false;
    };

    const plainList = sanciones.map(s => s.get({ plain: true }));
    const nivelRealPorSancionId = new Map();
    const porVehiculo = new Map();

    for (const p of plainList) {
      if (!p.id_vehiculo || isCanceladaOLevantada(p)) continue;
      if (!porVehiculo.has(p.id_vehiculo)) porVehiculo.set(p.id_vehiculo, []);
      porVehiculo.get(p.id_vehiculo).push(p);
    }

    for (const [, listaVeh] of porVehiculo.entries()) {
      listaVeh.sort((a, b) => Number(a.id_sancion || 0) - Number(b.id_sancion || 0));
      listaVeh.forEach((item, idx) => {
        const trueNivel = Math.min(idx + 1, 4);
        nivelRealPorSancionId.set(item.id_sancion, trueNivel);
      });
    }

    const resultado = plainList.map(plain => {
      let motivoLimpio = plain.motivo || '';
      let apelacionObj = null;

      // Extraer datos de apelación si existen
      if (motivoLimpio.includes('[APELACION_DATA]')) {
        try {
          const match = motivoLimpio.match(/\[APELACION_DATA\](.*?)\[\/APELACION_DATA\]/);
          if (match && match[1]) {
            apelacionObj = JSON.parse(match[1]);
          }
        } catch (e) { }
      }

      // Extraer datos de dictamen si existen
      let dictamenSupervisor = null;
      if (motivoLimpio.includes('[DICTAMEN_DATA]')) {
        const dMatch = motivoLimpio.match(/\[DICTAMEN_DATA\](.*?)\[\/DICTAMEN_DATA\]/);
        if (dMatch && dMatch[1]) {
          dictamenSupervisor = dMatch[1];
        }
      }

      // Extraer datos de resolución de oficina (levantamiento / permiso temporal)
      let resolucionOficina = null;
      if (motivoLimpio.includes('[RESOLUCION_OFICINA_DATA]')) {
        try {
          const rMatch = motivoLimpio.match(/\[RESOLUCION_OFICINA_DATA\](.*?)\[\/RESOLUCION_OFICINA_DATA\]/);
          if (rMatch && rMatch[1]) {
            resolucionOficina = JSON.parse(rMatch[1]);
          }
        } catch (e) { }
      }

      // Limpiar etiquetas del motivo para presentación limpia
      motivoLimpio = motivoLimpio
        .replace(/\[APELACION_DATA\].*?\[\/APELACION_DATA\]/g, '')
        .replace(/\[DICTAMEN_DATA\].*?\[\/DICTAMEN_DATA\]/g, '')
        .replace(/\[RESOLUCION_OFICINA_DATA\].*?\[\/RESOLUCION_OFICINA_DATA\]/g, '')
        .trim();

      const nivel = nivelRealPorSancionId.get(plain.id_sancion) || Number(plain.numero_reincidencia || plain.id_regla || 1);
      const normalizarInicio7AMLocal = (rawInicio) => {
        if (!rawInicio) return null;
        const d = rawInicio instanceof Date ? rawInicio : new Date(rawInicio);
        if (isNaN(d.getTime())) return null;
        if (d.getTimezoneOffset() === 0) {
          const sonoraOffsetMs = -7 * 60 * 60 * 1000;
          const localTime = new Date(d.getTime() + sonoraOffsetMs);
          if (localTime.getUTCHours() === 7 && localTime.getUTCMinutes() === 0 && localTime.getUTCSeconds() === 0) {
            return new Date(Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate(), 14, 0, 0, 0));
          }
          if (localTime.getUTCHours() === 0 && localTime.getUTCMinutes() === 0 && localTime.getUTCSeconds() === 0) {
            return new Date(Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate(), 14, 0, 0, 0));
          }
          return new Date(Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate() + 1, 14, 0, 0, 0));
        }
        if (d.getHours() === 7 && d.getMinutes() === 0 && d.getSeconds() === 0) {
          return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0, 0, 0);
        }
        if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
          return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 0, 0, 0);
        }
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 7, 0, 0, 0);
      };

      const fechaInicioEfectiva = normalizarInicio7AMLocal(plain.fecha_inicio) || (plain.fecha_inicio ? new Date(plain.fecha_inicio) : null);
      let fechaFinEfectiva = plain.fecha_fin;
      if (!isCanceladaOLevantada(plain)) {
        if (fechaInicioEfectiva) {
          // Extraer horas de suspensión de la regla para calcular fecha_fin desde las 7:00 AM del día siguiente
          let h = plain.regla?.horas_suspension;
          if (h === undefined || h === null) {
            const hMatch = (plain.regla?.mensaje_alerta || '').match(/\[HORAS:(-?\d+)\]/);
            if (hMatch) h = parseInt(hMatch[1], 10);
            else {
              if (nivel === 2) h = 24;
              else if (nivel === 3) h = 168;
              else if (nivel >= 4) h = -1;
              else h = 0;
            }
          }
          if (Number(h) === -1 || Number(h) === 0) {
            fechaFinEfectiva = null;
          } else if (Number(h) > 0) {
            fechaFinEfectiva = new Date(fechaInicioEfectiva.getTime() + Number(h) * 60 * 60 * 1000);
          }
        }
      }

      // Normalizar status con cálculo dinámico de expiración en memoria
      const isExpired = fechaFinEfectiva && ahora >= new Date(fechaFinEfectiva) && (plain.estatus === 'ACTIVA' || plain.estatus === 'RATIFICADA');
      const estatusEfectivo = isExpired ? 'VENCIDA' : plain.estatus;

      let frontendStatus = 'Activa';
      if (resolucionOficina && resolucionOficina.tipoResolucion === 'levantamiento_definitivo') {
        frontendStatus = 'Levantada';
      } else if (resolucionOficina && resolucionOficina.tipoResolucion === 'permiso_temporal') {
        const expDate = resolucionOficina.fechaExpiracionPermiso ? new Date(resolucionOficina.fechaExpiracionPermiso) : null;
        if (expDate && ahora <= expDate) {
          frontendStatus = 'Permiso Provisional';
        } else {
          frontendStatus = 'Activa';
        }
      } else if (estatusEfectivo === 'EN_APELACION') {
        frontendStatus = 'En Apelación';
      } else if (estatusEfectivo === 'CANCELADA' || estatusEfectivo === 'ACLARADA') {
        frontendStatus = 'Aclarada';
      } else if (estatusEfectivo === 'RATIFICADA') {
        frontendStatus = 'Ratificada';
      } else if (estatusEfectivo === 'VENCIDA') {
        frontendStatus = 'Cumplida';
      } else {
        frontendStatus = 'Activa';
      }

      if (apelacionObj) {
        if (frontendStatus === 'Aclarada' || frontendStatus === 'Levantada') apelacionObj.estado = 'Aprobada';
        if (frontendStatus === 'Ratificada') apelacionObj.estado = 'Rechazada';
        if (dictamenSupervisor) apelacionObj.dictamenSupervisor = dictamenSupervisor;
      }

      const medidasPorNivel = {
        1: 'Primera Falta: Llamada de atención. Acceso permitido.',
        2: 'Segunda Falta: Suspensión temporal de 24 horas. Acceso denegado.',
        3: 'Tercera Falta: Suspensión temporal de 1 semana. Acceso denegado.',
        4: 'Cuarta Falta: Sanción definitiva (bloqueo permanente).'
      };
      const enVigor = !fechaInicioEfectiva || ahora >= fechaInicioEfectiva;

      return {
        ...plain,
        fecha_inicio: fechaInicioEfectiva || plain.fecha_inicio,
        fecha_fin: fechaFinEfectiva,
        estatus: estatusEfectivo,
        enVigor,
        id: String(plain.id_sancion),
        motivo: motivoLimpio,
        descripcion: motivoLimpio,
        placa: plain.vehiculo?.placas || '',
        placas: plain.vehiculo?.placas || '',
        empresaNombre: plain.empresa?.razon_social || '',
        infraccionCodigo: plain.reporte?.infraccion?.codigo || 'INF-01',
        infraccionDescripcion: plain.reporte?.infraccion?.nombre || motivoLimpio,
        tipo: plain.reporte?.infraccion?.nombre || 'Infracción Vehicular',
        gravedad: nivel >= 3 ? 'critica' : (nivel === 2 ? 'grave' : 'moderada'),
        estado: estatusEfectivo === 'ACTIVA' ? 'activa' : (estatusEfectivo === 'VENCIDA' ? 'resuelta' : (frontendStatus === 'Levantada' ? 'levantada' : 'pendiente_aprobacion')),
        status: frontendStatus,
        fechaSancion: plain.fecha_inicio,
        fecha: plain.fecha_inicio ? new Date(plain.fecha_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        montoMulta: nivel * 100,
        medidaDisciplinaria: (plain.regla?.mensaje_alerta ? plain.regla.mensaje_alerta.replace(/\[HORAS:.*?\]/g, '').trim() : '') || medidasPorNivel[nivel] || `Sanción nivel ${nivel}`,
        evidenciaUrl: (() => {
          const first = plain.reporte?.evidencias?.[0]?.archivo || '';
          if (first && first.startsWith('[') && first.endsWith(']')) {
            try { const p = JSON.parse(first); return Array.isArray(p) ? (p[0] || '') : first; } catch (e) { }
          }
          if (first && first.includes(',') && !first.startsWith('data:')) {
            return first.split(',')[0].trim();
          }
          return first;
        })(),
        evidencias: (() => {
          const list = [];
          if (plain.reporte?.evidencias && Array.isArray(plain.reporte.evidencias)) {
            for (const ev of plain.reporte.evidencias) {
              if (ev.archivo) {
                const a = String(ev.archivo).trim();
                if (a.startsWith('[') && a.endsWith(']')) {
                  try {
                    const parsed = JSON.parse(a);
                    if (Array.isArray(parsed)) list.push(...parsed);
                    else list.push(a);
                  } catch (e) { list.push(a); }
                } else if (a.includes(',') && !a.startsWith('data:')) {
                  list.push(...a.split(',').map(s => s.trim()).filter(Boolean));
                } else {
                  list.push(a);
                }
              }
            }
          }
          return Array.from(new Set(list)).filter(Boolean);
        })(),
        apelacion: apelacionObj,
        resolucionOficina: resolucionOficina
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar sanciones:', error);
    res.status(500).json({ error: 'Error al consultar sanciones', details: error.message });
  }
});

// PUT /api/sanciones/:id - Actualizar / Resolver sanción o registrar apelación / resolución de oficina
router.put('/:id', async (req, res) => {
  try {
    const sancion = await db.Sancion.findByPk(req.params.id, {
      include: [{ model: db.Vehiculo, as: 'vehiculo' }]
    });
    if (!sancion) return res.status(404).json({ error: 'Sanción no encontrada' });

    const { estatus, fecha_fin, motivo, apelacion, dictamen, resolucionOficina } = req.body;
    if (estatus) sancion.estatus = estatus;
    if (fecha_fin) sancion.fecha_fin = fecha_fin;

    // Si viene información de apelación
    if (apelacion) {
      sancion.estatus = 'EN_APELACION';
      const cleanArgs = typeof apelacion === 'object' ? JSON.stringify(apelacion) : String(apelacion);
      const baseMotivo = (sancion.motivo || 'Sanción vehicular')
        .replace(/\[APELACION_DATA\].*?\[\/APELACION_DATA\]/g, '')
        .trim();
      sancion.motivo = `${baseMotivo} [APELACION_DATA]${cleanArgs}[/APELACION_DATA]`;
    }

    // Si viene resolución directa de oficina (levantamiento definitivo o permiso temporal)
    if (resolucionOficina) {
      const cleanRes = typeof resolucionOficina === 'object' ? JSON.stringify(resolucionOficina) : String(resolucionOficina);
      const baseMotivo = (sancion.motivo || 'Sanción vehicular')
        .replace(/\[RESOLUCION_OFICINA_DATA\].*?\[\/RESOLUCION_OFICINA_DATA\]/g, '')
        .trim();
      sancion.motivo = `${baseMotivo} [RESOLUCION_OFICINA_DATA]${cleanRes}[/RESOLUCION_OFICINA_DATA]`;

      if (resolucionOficina.tipoResolucion === 'levantamiento_definitivo') {
        sancion.estatus = 'CANCELADA';
        if (sancion.vehiculo) {
          sancion.vehiculo.estatus_acceso = 'HABILITADO';
          await sancion.vehiculo.save();
        }
      } else if (resolucionOficina.tipoResolucion === 'permiso_temporal') {
        // En permiso temporal se habilita por vigencia dinámica (sin perder el estatus base SUSPENDIDO cuando expire)
        const expDate = resolucionOficina.fechaExpiracionPermiso ? new Date(resolucionOficina.fechaExpiracionPermiso) : null;
        if (sancion.vehiculo) {
          sancion.vehiculo.estatus_acceso = (expDate && new Date() < expDate) ? 'HABILITADO' : 'SUSPENDIDO';
          await sancion.vehiculo.save();
        }
      }
    }

    // Si se dictamina o actualiza con dictamen
    if (dictamen) {
      const baseMotivo = (sancion.motivo || 'Sanción vehicular')
        .replace(/\[DICTAMEN_DATA\].*?\[\/DICTAMEN_DATA\]/g, '')
        .trim();
      sancion.motivo = `${baseMotivo} [DICTAMEN_DATA]${dictamen}[/DICTAMEN_DATA]`;
    }

    if (motivo && !apelacion && !dictamen && !resolucionOficina) {
      sancion.motivo = motivo;
    }

    // Si se envían evidencias adicionales al actualizar la sanción
    if (req.body.evidencias || req.body.evidencia_url || req.body.fotos) {
      let rawFotos = [];
      if (Array.isArray(req.body.evidencias)) rawFotos.push(...req.body.evidencias);
      if (Array.isArray(req.body.fotos)) rawFotos.push(...req.body.fotos);
      if (req.body.evidencia_url) {
        if (Array.isArray(req.body.evidencia_url)) rawFotos.push(...req.body.evidencia_url);
        else rawFotos.push(req.body.evidencia_url);
      }
      for (const f of rawFotos.filter(Boolean)) {
        try {
          const archivoStorageUrl = await saveBase64Image(f, 'evidencia');
          if (archivoStorageUrl && sancion.id_reporte) {
            await db.Evidencia.create({
              id_reporte: sancion.id_reporte,
              archivo: archivoStorageUrl,
              descripcion: 'Evidencia fotográfica adjunta',
              fecha_captura: new Date(),
              id_usuario: req.user?.id_usuario || sancion.id_usuario,
              activa: true
            });
          }
        } catch (eEv) {
          console.warn('[sanciones] Error guardando evidencia adicional:', eEv.message);
        }
      }
    }

    if (estatus === 'CANCELADA' || estatus === 'ACLARADA' || estatus === 'VENCIDA') {
      if (sancion.vehiculo) {
        sancion.vehiculo.estatus_acceso = 'HABILITADO';
        await sancion.vehiculo.save();
      }
    } else if (estatus === 'ACTIVA' || estatus === 'RATIFICADA' || estatus === 'EN_APELACION') {
      const nivelSancion = Number(sancion.numero_reincidencia || sancion.id_regla || 1);
      const yaInicio = !sancion.fecha_inicio || new Date() >= new Date(sancion.fecha_inicio);
      if (sancion.vehiculo && nivelSancion >= 2 && yaInicio && (!resolucionOficina || resolucionOficina.tipoResolucion !== 'permiso_temporal')) {
        sancion.vehiculo.estatus_acceso = 'SUSPENDIDO';
        await sancion.vehiculo.save();
      }
    }

    await sancion.save();

    // Emitir evento SSE en tiempo real
    try {
      if (resolucionOficina) {
        events.broadcastEvent('CASTIGO_GESTIONADO_OFICINA', { id_sancion: sancion.id_sancion, estatus: sancion.estatus, resolucionOficina });
      } else if (apelacion) {
        events.broadcastEvent('NUEVA_APELACION', { id_sancion: sancion.id_sancion, estatus: sancion.estatus });
      } else if (dictamen || estatus) {
        events.broadcastEvent('SANCION_DICTAMINADA', { id_sancion: sancion.id_sancion, estatus: sancion.estatus });
      }
    } catch (e) { }

    res.json(sancion);
  } catch (error) {
    console.error('Error al actualizar sanción:', error);
    res.status(500).json({ error: 'Error al actualizar sanción', details: error.message });
  }
});

// POST /api/sanciones/:id/evidencias - Agregar evidencias adicionales a una sanción (vía su reporte)
router.post('/:id/evidencias', async (req, res) => {
  try {
    const sancion = await db.Sancion.findByPk(req.params.id);
    if (!sancion) return res.status(404).json({ error: 'Sanción no encontrada' });

    let rawFotos = [];
    if (Array.isArray(req.body.evidencias)) rawFotos.push(...req.body.evidencias);
    if (Array.isArray(req.body.fotos)) rawFotos.push(...req.body.fotos);
    if (req.body.evidencia_url) {
      if (Array.isArray(req.body.evidencia_url)) rawFotos.push(...req.body.evidencia_url);
      else rawFotos.push(req.body.evidencia_url);
    }
    if (req.body.archivo) rawFotos.push(req.body.archivo);

    const fotosAProcesar = rawFotos
      .map(f => (typeof f === 'object' && f !== null ? (f.archivo || f.url || f.uri || '') : String(f || '')))
      .map(s => s.trim())
      .filter(Boolean);

    const creadas = [];
    for (let i = 0; i < fotosAProcesar.length; i++) {
      const foto = fotosAProcesar[i];
      const archivoStorageUrl = await saveBase64Image(foto, 'evidencia');
      if (archivoStorageUrl && sancion.id_reporte) {
        const ev = await db.Evidencia.create({
          id_reporte: sancion.id_reporte,
          archivo: archivoStorageUrl,
          descripcion: req.body.descripcion || `Evidencia fotográfica adjunta`,
          fecha_captura: new Date(),
          id_usuario: req.user?.id_usuario || sancion.id_usuario,
          activa: true
        });
        creadas.push(ev);
      }
    }

    res.status(201).json({ success: true, count: creadas.length, evidencias: creadas });
  } catch (error) {
    console.error('Error al adjuntar evidencia a sanción:', error);
    res.status(500).json({ error: 'Error al adjuntar evidencia', details: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models/index.cjs');
const events = require('../events.cjs');
const { saveBase64Image } = require('../utils/imageHandler.cjs');
const { requireAuth } = require('../middlewares/auth.cjs');

/**
 * Calcula las 7:00 AM (07:00:00.000) del día calendario siguiente en hora local.
 * Si el proceso corre en UTC puro (ej. servidor cloud con getTimezoneOffset() === 0),
 * toma como referencia la zona horaria local de Sonora (America/Hermosillo, UTC-7),
 * donde las 07:00 AM locales equivalen a las 14:00 UTC.
 */
function getNextDay7AMLocal(baseDate = new Date()) {
  const now = baseDate instanceof Date ? baseDate : new Date(baseDate);
  if (now.getTimezoneOffset() === 0) {
    const sonoraOffsetMs = -7 * 60 * 60 * 1000;
    const localTime = new Date(now.getTime() + sonoraOffsetMs);
    return new Date(
      Date.UTC(
        localTime.getUTCFullYear(),
        localTime.getUTCMonth(),
        localTime.getUTCDate() + 1,
        14, 0, 0, 0
      )
    );
  }
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0, 0, 0);
}

// GET /api/reportes/stream - Canal SSE para actualizaciones en vivo
router.get('/stream', (req, res) => {
  if (process.env.VERCEL) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'close');
    // Indicamos al cliente que no intente reconectar en bucle en serverless
    res.write('retry: 3600000\n\n');
    res.write(`data: ${JSON.stringify({ type: 'SERVERLESS_STANDBY', message: 'SSE no aplicable en Vercel Serverless' })}\n\n`);
    return res.end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = Date.now() + Math.random();
  const newClient = { id: clientId, res };
  events.addClient(newClient);

  // Mensaje inicial de conexión
  res.write(`data: ${JSON.stringify({ type: 'CONECTADO', message: 'Canal SSE activo', timestamp: Date.now() })}\n\n`);

  // Ping periódico cada 20s para mantener viva la conexión
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(keepAliveInterval);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
    events.removeClient(clientId);
  });
});

// GET /api/reportes - Listar reportes de infracciones (limitado a 100 más recientes)
router.get('/', requireAuth, async (req, res) => {
  try {
    const reportes = await db.ReporteInfraccion.findAll({
      limit: 100,
      include: [
        {
          model: db.Vehiculo,
          as: 'vehiculo',
          attributes: ['id_vehiculo', 'placas', 'marca', 'modelo', 'color'],
          include: [
            { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social', 'telefono'] },
            { model: db.Corbatin, as: 'corbatines', attributes: ['id_corbatin', 'numero', 'estatus'] }
          ]
        },
        { model: db.Corbatin, as: 'corbatin', attributes: ['id_corbatin', 'numero', 'estatus'] },
        { model: db.CatalogoInfraccion, as: 'infraccion', attributes: ['id_infraccion', 'id_reglamento', 'codigo', 'nombre', 'descripcion', 'categoria', 'activo'] },
        { model: db.Usuario, as: 'agente', attributes: ['id_usuario', 'nombre', 'correo'] },
        { model: db.Evidencia, as: 'evidencias', attributes: ['id_evidencia', 'id_reporte', 'archivo', 'descripcion', 'fecha_captura', 'activa'] },
        { model: db.RevisionReporte, as: 'revisiones', attributes: ['id_revision', 'id_reporte', 'decision', 'comentarios', 'fecha_revision', 'nivel_reincidencia_aplicado'] },
        { model: db.Sancion, as: 'sancion', attributes: ['id_sancion', 'estatus', 'fecha_inicio', 'fecha_fin', 'motivo', 'numero_reincidencia'] }
      ],
      order: [['fecha_hora', 'DESC']]
    });
    res.json(reportes);
  } catch (error) {
    console.error('Error al consultar reportes:', error);
    res.status(500).json({ error: 'Error al consultar reportes de infracciones', details: error.message });
  }
});

// POST /api/reportes - Crear reporte de infracción con prevención de duplicados
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      id_vehiculo,
      id_corbatin,
      id_infraccion,
      id_usuario,
      ubicacion_texto,
      descripcion_hechos,
      evidencia_url,
      evidencias_urls,
      evidencias
    } = req.body;
    if (!id_vehiculo || !id_infraccion || !id_usuario) {
      return res.status(400).json({ error: 'id_vehiculo, id_infraccion e id_usuario son obligatorios' });
    }

    // Normalizar todas las evidencias recibidas (1, 2, 3...) sin duplicar URLs
    const rawEvidenciasList = [];
    const seenUrls = new Set();
    const pushEvidenciaCandidate = (url, descripcion, fechaHora) => {
      if (!url || typeof url !== 'string' || !url.trim()) return;
      const trimmed = url.trim();
      if (seenUrls.has(trimmed)) return;
      seenUrls.add(trimmed);
      rawEvidenciasList.push({
        url: trimmed,
        descripcion: descripcion || null,
        fechaHora: fechaHora ? new Date(fechaHora) : new Date()
      });
    };

    if (Array.isArray(evidencias)) {
      for (const ev of evidencias) {
        if (typeof ev === 'string') {
          pushEvidenciaCandidate(ev, null, null);
        } else if (ev && typeof ev === 'object') {
          pushEvidenciaCandidate(ev.fotoUrl || ev.archivo || ev.url, ev.descripcion, ev.fechaHora || ev.fecha_captura);
        }
      }
    }
    if (Array.isArray(evidencias_urls)) {
      for (const u of evidencias_urls) {
        pushEvidenciaCandidate(u, null, null);
      }
    }
    if (evidencia_url) {
      pushEvidenciaCandidate(evidencia_url, null, null);
    }

    // Prevención de reporte duplicado idéntico en los últimos 2 minutos
    const haceDosMinutos = new Date(Date.now() - 2 * 60 * 1000);
    const reporteExistente = await db.ReporteInfraccion.findOne({
      where: {
        id_vehiculo,
        id_infraccion,
        estatus_revision: 'PENDIENTE',
        fecha_hora: {
          [Op.gte]: haceDosMinutos
        }
      },
      include: [{ model: db.Evidencia, as: 'evidencias', attributes: ['id_evidencia'] }]
    });

    if (reporteExistente) {
      return res.status(200).json({
        ...reporteExistente.get({ plain: true }),
        duplicatePrevented: true,
        evidencias_insertadas: reporteExistente.evidencias ? reporteExistente.evidencias.length : 0,
        message: 'Reporte pendiente existente reutilizado para evitar duplicidad.'
      });
    }

    // Auto-vincular corbatín activo del vehículo si no fue especificado directamente
    let finalIdCorbatin = id_corbatin || null;
    if (!finalIdCorbatin && id_vehiculo) {
      const corbActivo = await db.Corbatin.findOne({
        where: { id_vehiculo, estatus: 'ACTIVO' }
      });
      if (corbActivo) {
        finalIdCorbatin = corbActivo.id_corbatin;
      }
    }

    const nuevoReporte = await db.ReporteInfraccion.create({
      id_vehiculo,
      id_corbatin: finalIdCorbatin,
      id_infraccion,
      id_usuario,
      fecha_hora: new Date(),
      ubicacion_texto: ubicacion_texto || null,
      descripcion_hechos: descripcion_hechos || 'Infracción detectada en campo',
      estatus_revision: 'PENDIENTE'
    });

    let evidenciasInsertadas = 0;
    for (let i = 0; i < rawEvidenciasList.length; i++) {
      const item = rawEvidenciasList[i];
      const archivoStorageUrl = await saveBase64Image(item.url, 'evidencia');
      if (archivoStorageUrl) {
        await db.Evidencia.create({
          id_reporte: nuevoReporte.id_reporte,
          archivo: archivoStorageUrl,
          descripcion:
            item.descripcion ||
            `Evidencia fotográfica ${i + 1} de ${rawEvidenciasList.length} adjunta`,
          fecha_captura: item.fechaHora || new Date(),
          id_usuario,
          activa: true
        });
        evidenciasInsertadas++;
      }
    }

    // Emitir evento SSE en tiempo real a todos los clientes conectados
    try {
      events.broadcastEvent('NUEVO_REPORTE', {
        id_reporte: nuevoReporte.id_reporte,
        id_vehiculo: nuevoReporte.id_vehiculo,
        id_infraccion: nuevoReporte.id_infraccion,
        descripcion_hechos: nuevoReporte.descripcion_hechos,
        ubicacion_texto: nuevoReporte.ubicacion_texto
      });
    } catch (e) {}

    res.status(201).json({
      ...nuevoReporte.get({ plain: true }),
      evidencias_insertadas: evidenciasInsertadas
    });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ error: 'Error al registrar reporte de infracción', details: error.message });
  }
});

// POST /api/reportes/:id/revisar - Dictamen del supervisor con protección de concurrencia
router.post('/:id/revisar', requireAuth, async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { decision, comentarios, id_usuario } = req.body;

    // 1. Bloquear únicamente la fila del reporte sin LEFT OUTER JOINS para evitar error de PostgreSQL "FOR UPDATE cannot be applied to outer join"
    const reporte = await db.ReporteInfraccion.findByPk(req.params.id, {
      lock: transaction.LOCK ? transaction.LOCK.UPDATE : undefined,
      transaction
    });

    if (!reporte) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Reporte de infracción no encontrado' });
    }

    // 2. Comprobar si ya fue dictaminado previamente por otro supervisor
    if (reporte.estatus_revision !== 'PENDIENTE') {
      await transaction.rollback();
      return res.status(409).json({
        error: `Este reporte ya fue dictaminado previamente como ${reporte.estatus_revision} por otro supervisor.`,
        yaDictaminado: true,
        estatus_revision: reporte.estatus_revision,
        reporte
      });
    }

    // 3. Verificar si ya existe sanción asociada a este reporte
    const sancionExistente = await db.Sancion.findOne({
      where: { id_reporte: reporte.id_reporte },
      transaction
    });

    if (sancionExistente) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Ya existe una sanción registrada para este reporte de infracción.',
        yaDictaminado: true,
        sancion: sancionExistente
      });
    }

    // 4. Validar id_usuario para respetar integridad referencial
    let usuarioValidoId = 2; // Default Supervisor Operativo
    if (id_usuario && !isNaN(Number(id_usuario))) {
      const uExiste = await db.Usuario.findByPk(Number(id_usuario), { transaction });
      if (uExiste) usuarioValidoId = Number(id_usuario);
    }

    // 5. Cargar vehículo asociado con su empresa
    const vehiculo = reporte.id_vehiculo
      ? await db.Vehiculo.findByPk(reporte.id_vehiculo, {
          include: [{ model: db.Empresa, as: 'empresa' }],
          transaction
        })
      : null;

    // 6. Actualizar estatus del reporte
    reporte.estatus_revision = decision === 'APROBADO' ? 'APROBADO' : 'RECHAZADO';
    await reporte.save({ transaction });

    // 7. Contar reincidencias previas del vehículo excluyendo sanciones apeladas/canceladas/aclaradas o levantadas definitivamente
    const sancionesPrevias = reporte.id_vehiculo
      ? await db.Sancion.findAll({
          where: {
            id_vehiculo: reporte.id_vehiculo,
            estatus: {
              [Op.notIn]: ['CANCELADA', 'ACLARADA', 'CANCELADO', 'ACLARADO', 'cancelada', 'aclarada']
            }
          },
          attributes: ['id_sancion', 'estatus', 'motivo'],
          transaction
        })
      : [];
    const conteoSanciones = sancionesPrevias.filter(s => {
      const m = s.motivo || '';
      if (m.includes('[RESOLUCION_OFICINA_DATA]') && m.includes('levantamiento_definitivo')) {
        return false;
      }
      return true;
    }).length;
    const nivelReincidencia = Math.min(conteoSanciones + 1, 4);

    // 8. Crear dictamen de revisión
    const revision = await db.RevisionReporte.create(
      {
        id_reporte: reporte.id_reporte,
        id_usuario: usuarioValidoId,
        decision,
        comentarios: comentarios || null,
        fecha_revision: new Date(),
        nivel_reincidencia_aplicado: decision === 'APROBADO' ? nivelReincidencia : null
      },
      { transaction }
    );

    // 9. Si se aprueba, generar sanción única programada para iniciar al día siguiente a las 7:00 AM (hora local)
    let sancion = null;
    if (decision === 'APROBADO') {
      const regla = await db.ReglaReincidencia.findOne({
        where: { numero_falta: nivelReincidencia },
        transaction
      });

      // Extraer horas de suspensión configuradas para esta regla
      let horasSuspension = regla?.horas_suspension;
      if (horasSuspension === undefined || horasSuspension === null) {
        const hMatch = (regla?.mensaje_alerta || '').match(/\[HORAS:(-?\d+)\]/);
        if (hMatch) {
          horasSuspension = parseInt(hMatch[1], 10);
        } else {
          // Defaults estándar de HOA
          if (nivelReincidencia === 1) horasSuspension = 0;
          else if (nivelReincidencia === 2) horasSuspension = 24;
          else if (nivelReincidencia === 3) horasSuspension = 168; // 1 semana = 168 horas
          else horasSuspension = -1; // -1 = Bloqueo definitivo
        }
      }

      const permiteAcceso = regla ? Boolean(regla.permite_acceso) : false;
      const fechaInicioSancion = getNextDay7AMLocal(new Date());
      let fechaFinSancion = null;

      // Calcular fecha_fin dinámica con base en las horas de penalización configuradas desde las 7:00 AM del día siguiente
      if (horasSuspension && horasSuspension > 0) {
        fechaFinSancion = new Date(fechaInicioSancion.getTime() + horasSuspension * 60 * 60 * 1000);
      } else if (!permiteAcceso && (horasSuspension === -1 || regla?.requiere_administrador || nivelReincidencia >= 4)) {
        // Bloqueo permanente / definitivo
        fechaFinSancion = null;
      }

      const mensajeLimpio = (regla?.mensaje_alerta || '')
        .replace(/\[HORAS:.*?\]/g, '')
        .trim();

      const motivoFinal = comentarios || mensajeLimpio || `Sanción por falta nivel ${nivelReincidencia}`;

      sancion = await db.Sancion.create(
        {
          id_reporte: reporte.id_reporte,
          id_vehiculo: reporte.id_vehiculo || 1,
          id_empresa: vehiculo?.id_empresa || 1,
          id_regla: regla?.id_regla || nivelReincidencia,
          numero_reincidencia: nivelReincidencia,
          fecha_inicio: fechaInicioSancion,
          fecha_fin: fechaFinSancion,
          estatus: 'ACTIVA',
          motivo: motivoFinal,
          id_usuario: usuarioValidoId
        },
        { transaction }
      );

      // Si la sanción ya está en vigor (fechaInicioSancion <= ahora) y no permite acceso, actualizar estatus a SUSPENDIDO.
      // Cuando fechaInicioSancion es mañana a las 7:00 AM, el vehículo permanece HABILITADO hoy y pasa a SUSPENDIDO automáticamente a las 7:00 AM.
      if ((!permiteAcceso || (horasSuspension && horasSuspension > 0)) && reporte.id_vehiculo && new Date() >= fechaInicioSancion) {
        await db.Vehiculo.update(
          { estatus_acceso: 'SUSPENDIDO' },
          { where: { id_vehiculo: reporte.id_vehiculo }, transaction }
        );
      }
    }

    await transaction.commit();

    // Emitir evento SSE en tiempo real a todos los clientes conectados
    try {
      events.broadcastEvent('REPORTE_DICTAMINADO', {
        id_reporte: reporte.id_reporte,
        decision,
        estatus_revision: reporte.estatus_revision,
        id_vehiculo: reporte.id_vehiculo,
        id_empresa: vehiculo?.id_empresa,
        empresaNombre: vehiculo?.empresa?.razon_social || '',
        placas: vehiculo?.placas || '',
        id_sancion: sancion?.id_sancion
      });
    } catch (e) {}

    res.json({ reporte, revision, sancion });
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {});
    console.error('Error al dictaminar reporte:', error);
    res.status(500).json({ error: 'Error al procesar dictamen', details: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/reportes - Listar reportes de infracciones
router.get('/', async (req, res) => {
  try {
    const reportes = await db.ReporteInfraccion.findAll({
      include: [
        {
          model: db.Vehiculo,
          as: 'vehiculo',
          include: [{ model: db.Empresa, as: 'empresa' }]
        },
        { model: db.CatalogoInfraccion, as: 'infraccion' },
        { model: db.Usuario, as: 'agente', attributes: ['id_usuario', 'nombre', 'correo'] },
        { model: db.Evidencia, as: 'evidencias' },
        { model: db.RevisionReporte, as: 'revisiones' },
        { model: db.Sancion, as: 'sancion' }
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
router.post('/', async (req, res) => {
  try {
    const { id_vehiculo, id_corbatin, id_infraccion, id_usuario, ubicacion_texto, descripcion_hechos, evidencia_url } = req.body;
    if (!id_vehiculo || !id_infraccion || !id_usuario) {
      return res.status(400).json({ error: 'id_vehiculo, id_infraccion e id_usuario son obligatorios' });
    }

    // Prevención de reporte duplicado idéntico en los últimos 2 minutos
    const haceDosMinutos = new Date(Date.now() - 2 * 60 * 1000);
    const reporteExistente = await db.ReporteInfraccion.findOne({
      where: {
        id_vehiculo,
        id_infraccion,
        estatus_revision: 'PENDIENTE',
        fecha_hora: {
          [db.Sequelize.Op.gte]: haceDosMinutos
        }
      },
      include: [{ model: db.Evidencia, as: 'evidencias' }]
    });

    if (reporteExistente) {
      return res.status(200).json({
        ...reporteExistente.get({ plain: true }),
        duplicatePrevented: true,
        message: 'Reporte pendiente existente reutilizado para evitar duplicidad.'
      });
    }

    const nuevoReporte = await db.ReporteInfraccion.create({
      id_vehiculo,
      id_corbatin: id_corbatin || null,
      id_infraccion,
      id_usuario,
      fecha_hora: new Date(),
      ubicacion_texto: ubicacion_texto || null,
      descripcion_hechos: descripcion_hechos || 'Infracción detectada en campo',
      estatus_revision: 'PENDIENTE'
    });

    if (evidencia_url) {
      await db.Evidencia.create({
        id_reporte: nuevoReporte.id_reporte,
        archivo: evidencia_url,
        descripcion: 'Evidencia fotográfica adjunta',
        fecha_captura: new Date(),
        id_usuario,
        activa: true
      });
    }

    res.status(201).json(nuevoReporte);
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ error: 'Error al registrar reporte de infracción', details: error.message });
  }
});

// POST /api/reportes/:id/revisar - Dictamen del supervisor con protección de concurrencia
router.post('/:id/revisar', async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { decision, comentarios, id_usuario } = req.body;

    // Bloquear el reporte a nivel de fila durante la transacción para evitar condiciones de carrera si 2 supervisores dictaminan a la vez
    const reporte = await db.ReporteInfraccion.findByPk(req.params.id, {
      include: [
        { model: db.Vehiculo, as: 'vehiculo' },
        { model: db.Sancion, as: 'sancion' },
        { model: db.RevisionReporte, as: 'revisiones' }
      ],
      lock: transaction.LOCK ? transaction.LOCK.UPDATE : undefined,
      transaction
    });

    if (!reporte) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Reporte de infracción no encontrado' });
    }

    // Comprobar si ya fue dictaminado previamente por otro supervisor
    if (reporte.estatus_revision !== 'PENDIENTE' || (reporte.sancion && reporte.sancion.id_sancion)) {
      await transaction.rollback();
      return res.status(409).json({
        error: `Este reporte ya fue dictaminado previamente como ${reporte.estatus_revision} por otro supervisor.`,
        yaDictaminado: true,
        estatus_revision: reporte.estatus_revision,
        reporte,
        sancion: reporte.sancion
      });
    }

    // Verificar si ya existe sanción asociada
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

    reporte.estatus_revision = decision === 'APROBADO' ? 'APROBADO' : 'RECHAZADO';
    await reporte.save({ transaction });

    // Contar reincidencias previas del vehículo de forma consistente
    const conteoSanciones = await db.Sancion.count({
      where: { id_vehiculo: reporte.id_vehiculo },
      transaction
    });
    const nivelReincidencia = Math.min(conteoSanciones + 1, 4);

    const revision = await db.RevisionReporte.create(
      {
        id_reporte: reporte.id_reporte,
        id_usuario: id_usuario || 2,
        decision,
        comentarios: comentarios || null,
        fecha_revision: new Date(),
        nivel_reincidencia_aplicado: decision === 'APROBADO' ? nivelReincidencia : null
      },
      { transaction }
    );

    // Si se aprueba, generar sanción única
    let sancion = null;
    if (decision === 'APROBADO') {
      const regla = await db.ReglaReincidencia.findOne({
        where: { numero_falta: nivelReincidencia },
        transaction
      });

      sancion = await db.Sancion.create(
        {
          id_reporte: reporte.id_reporte,
          id_vehiculo: reporte.id_vehiculo,
          id_empresa: reporte.vehiculo?.id_empresa || 1,
          id_regla: regla?.id_regla || 1,
          numero_reincidencia: nivelReincidencia,
          fecha_inicio: new Date(),
          fecha_fin:
            nivelReincidencia === 1
              ? null
              : new Date(Date.now() + (nivelReincidencia === 2 ? 7 : 30) * 24 * 60 * 60 * 1000),
          estatus: 'ACTIVA',
          motivo: comentarios || `Sanción por falta nivel ${nivelReincidencia}`,
          id_usuario: id_usuario || 2
        },
        { transaction }
      );

      // Actualizar estatus de acceso en vehículo si la regla bloquea
      if (regla && !regla.permite_acceso && reporte.vehiculo) {
        reporte.vehiculo.estatus_acceso = 'SUSPENDIDO';
        await reporte.vehiculo.save({ transaction });
      }
    }

    await transaction.commit();
    res.json({ reporte, revision, sancion });
  } catch (error) {
    if (transaction) await transaction.rollback().catch(() => {});
    console.error('Error al dictaminar reporte:', error);
    res.status(500).json({ error: 'Error al procesar dictamen', details: error.message });
  }
});

module.exports = router;

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

// POST /api/reportes - Crear reporte de infracción
router.post('/', async (req, res) => {
  try {
    const { id_vehiculo, id_corbatin, id_infraccion, id_usuario, ubicacion_texto, descripcion_hechos, evidencia_url } = req.body;
    if (!id_vehiculo || !id_infraccion || !id_usuario) {
      return res.status(400).json({ error: 'id_vehiculo, id_infraccion e id_usuario son obligatorios' });
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

// POST /api/reportes/:id/revisar - Dictamen del supervisor
router.post('/:id/revisar', async (req, res) => {
  try {
    const { decision, comentarios, id_usuario } = req.body;
    const reporte = await db.ReporteInfraccion.findByPk(req.params.id, {
      include: [{ model: db.Vehiculo, as: 'vehiculo' }]
    });

    if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

    reporte.estatus_revision = decision === 'APROBADO' ? 'APROBADO' : 'RECHAZADO';
    await reporte.save();

    // Contar reincidencias previas
    const conteoSanciones = await db.Sancion.count({
      where: { id_vehiculo: reporte.id_vehiculo }
    });
    const nivelReincidencia = Math.min(conteoSanciones + 1, 4);

    const revision = await db.RevisionReporte.create({
      id_reporte: reporte.id_reporte,
      id_usuario: id_usuario || 2,
      decision,
      comentarios: comentarios || null,
      fecha_revision: new Date(),
      nivel_reincidencia_aplicado: decision === 'APROBADO' ? nivelReincidencia : null
    });

    // Si se aprueba, generar sanción
    let sancion = null;
    if (decision === 'APROBADO') {
      const regla = await db.ReglaReincidencia.findOne({ where: { numero_falta: nivelReincidencia } });

      sancion = await db.Sancion.create({
        id_reporte: reporte.id_reporte,
        id_vehiculo: reporte.id_vehiculo,
        id_empresa: reporte.vehiculo?.id_empresa || 1,
        id_regla: regla?.id_regla || 1,
        numero_reincidencia: nivelReincidencia,
        fecha_inicio: new Date(),
        fecha_fin: nivelReincidencia === 1 ? null : new Date(Date.now() + (nivelReincidencia === 2 ? 7 : 30) * 24 * 60 * 60 * 1000),
        estatus: 'ACTIVA',
        motivo: comentarios || `Sanción por falta nivel ${nivelReincidencia}`,
        id_usuario: id_usuario || 2
      });

      // Actualizar estatus de acceso en vehículo si la regla bloquea
      if (regla && !regla.permite_acceso && reporte.vehiculo) {
        reporte.vehiculo.estatus_acceso = 'SUSPENDIDO';
        await reporte.vehiculo.save();
      }
    }

    res.json({ reporte, revision, sancion });
  } catch (error) {
    console.error('Error al dictaminar reporte:', error);
    res.status(500).json({ error: 'Error al procesar dictamen' });
  }
});

module.exports = router;

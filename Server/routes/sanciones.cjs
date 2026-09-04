const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');
const events = require('../events.cjs');

// GET /api/sanciones - Listar todas las sanciones con soporte para apelaciones
router.get('/', async (req, res) => {
  try {
    const sanciones = await db.Sancion.findAll({
      include: [
        { model: db.Vehiculo, as: 'vehiculo' },
        { model: db.Empresa, as: 'empresa' },
        { model: db.ReglaReincidencia, as: 'regla' },
        { 
          model: db.ReporteInfraccion, 
          as: 'reporte',
          include: [
            { model: db.CatalogoInfraccion, as: 'infraccion' },
            { model: db.Evidencia, as: 'evidencias' }
          ]
        },
        { model: db.Usuario, as: 'usuario_aprobador', attributes: ['id_usuario', 'nombre'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const resultado = sanciones.map(s => {
      const plain = s.get({ plain: true });
      let motivoLimpio = plain.motivo || '';
      let apelacionObj = null;

      // Extraer datos de apelación si existen
      if (motivoLimpio.includes('[APELACION_DATA]')) {
        try {
          const match = motivoLimpio.match(/\[APELACION_DATA\](.*?)\[\/APELACION_DATA\]/);
          if (match && match[1]) {
            apelacionObj = JSON.parse(match[1]);
          }
        } catch (e) {}
      }

      // Extraer datos de dictamen si existen
      let dictamenSupervisor = null;
      if (motivoLimpio.includes('[DICTAMEN_DATA]')) {
        const dMatch = motivoLimpio.match(/\[DICTAMEN_DATA\](.*?)\[\/DICTAMEN_DATA\]/);
        if (dMatch && dMatch[1]) {
          dictamenSupervisor = dMatch[1];
        }
      }

      // Limpiar etiquetas del motivo para presentación limpia
      motivoLimpio = motivoLimpio
        .replace(/\[APELACION_DATA\].*?\[\/APELACION_DATA\]/g, '')
        .replace(/\[DICTAMEN_DATA\].*?\[\/DICTAMEN_DATA\]/g, '')
        .trim();

      // Normalizar status
      let frontendStatus = 'Activa';
      if (plain.estatus === 'EN_APELACION') {
        frontendStatus = 'En Apelación';
      } else if (plain.estatus === 'CANCELADA' || plain.estatus === 'ACLARADA') {
        frontendStatus = 'Aclarada';
      } else if (plain.estatus === 'RATIFICADA') {
        frontendStatus = 'Ratificada';
      } else if (plain.estatus === 'VENCIDA') {
        frontendStatus = 'Cumplida';
      } else {
        frontendStatus = 'Activa';
      }

      if (apelacionObj) {
        if (frontendStatus === 'Aclarada') apelacionObj.estado = 'Aprobada';
        if (frontendStatus === 'Ratificada') apelacionObj.estado = 'Rechazada';
        if (dictamenSupervisor) apelacionObj.dictamenSupervisor = dictamenSupervisor;
      }

      return {
        ...plain,
        id: String(plain.id_sancion),
        motivo: motivoLimpio,
        descripcion: motivoLimpio,
        placa: plain.vehiculo?.placas || '',
        placas: plain.vehiculo?.placas || '',
        empresaNombre: plain.empresa?.razon_social || '',
        infraccionCodigo: plain.reporte?.infraccion?.codigo || 'INF-01',
        infraccionDescripcion: plain.reporte?.infraccion?.nombre || motivoLimpio,
        tipo: plain.reporte?.infraccion?.nombre || 'Infracción Vehicular',
        gravedad: plain.numero_reincidencia >= 3 ? 'critica' : (plain.numero_reincidencia === 2 ? 'grave' : 'moderada'),
        estado: plain.estatus === 'ACTIVA' ? 'activa' : (plain.estatus === 'VENCIDA' ? 'resuelta' : 'pendiente_aprobacion'),
        status: frontendStatus,
        fechaSancion: plain.fecha_inicio,
        fecha: plain.fecha_inicio ? new Date(plain.fecha_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        montoMulta: plain.numero_reincidencia * 100,
        medidaDisciplinaria: plain.regla?.mensaje_alerta || `Sanción nivel ${plain.numero_reincidencia}`,
        evidenciaUrl: plain.reporte?.evidencias?.[0]?.archivo || '',
        apelacion: apelacionObj
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar sanciones:', error);
    res.status(500).json({ error: 'Error al consultar sanciones', details: error.message });
  }
});

// PUT /api/sanciones/:id - Actualizar / Resolver sanción o registrar apelación
router.put('/:id', async (req, res) => {
  try {
    const sancion = await db.Sancion.findByPk(req.params.id, {
      include: [{ model: db.Vehiculo, as: 'vehiculo' }]
    });
    if (!sancion) return res.status(404).json({ error: 'Sanción no encontrada' });

    const { estatus, fecha_fin, motivo, apelacion, dictamen } = req.body;
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

    // Si se dictamina o actualiza con dictamen
    if (dictamen) {
      const baseMotivo = (sancion.motivo || 'Sanción vehicular')
        .replace(/\[DICTAMEN_DATA\].*?\[\/DICTAMEN_DATA\]/g, '')
        .trim();
      sancion.motivo = `${baseMotivo} [DICTAMEN_DATA]${dictamen}[/DICTAMEN_DATA]`;
    }

    if (motivo && !apelacion && !dictamen) {
      sancion.motivo = motivo;
    }

    if (estatus === 'CANCELADA' || estatus === 'ACLARADA' || estatus === 'VENCIDA') {
      if (sancion.vehiculo) {
        sancion.vehiculo.estatus_acceso = 'HABILITADO';
        await sancion.vehiculo.save();
      }
    } else if (estatus === 'ACTIVA' || estatus === 'RATIFICADA' || estatus === 'EN_APELACION') {
      if (sancion.vehiculo) {
        sancion.vehiculo.estatus_acceso = 'SUSPENDIDO';
        await sancion.vehiculo.save();
      }
    }

    await sancion.save();

    // Emitir evento SSE en tiempo real
    try {
      if (apelacion) {
        events.broadcastEvent('NUEVA_APELACION', { id_sancion: sancion.id_sancion, estatus: sancion.estatus });
      } else if (dictamen || estatus) {
        events.broadcastEvent('SANCION_DICTAMINADA', { id_sancion: sancion.id_sancion, estatus: sancion.estatus });
      }
    } catch (e) {}

    res.json(sancion);
  } catch (error) {
    console.error('Error al actualizar sanción:', error);
    res.status(500).json({ error: 'Error al actualizar sanción', details: error.message });
  }
});

module.exports = router;

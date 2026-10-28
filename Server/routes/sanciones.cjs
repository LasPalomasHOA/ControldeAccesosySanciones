const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');
const events = require('../events.cjs');

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
            { model: db.Evidencia, as: 'evidencias', attributes: ['id_evidencia', 'descripcion', 'fecha_captura', 'activa'] }
          ]
        },
        { model: db.Usuario, as: 'usuario_aprobador', attributes: ['id_usuario', 'nombre'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const ahora = new Date();

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

      // Extraer datos de resolución de oficina (levantamiento / permiso temporal)
      let resolucionOficina = null;
      if (motivoLimpio.includes('[RESOLUCION_OFICINA_DATA]')) {
        try {
          const rMatch = motivoLimpio.match(/\[RESOLUCION_OFICINA_DATA\](.*?)\[\/RESOLUCION_OFICINA_DATA\]/);
          if (rMatch && rMatch[1]) {
            resolucionOficina = JSON.parse(rMatch[1]);
          }
        } catch (e) {}
      }

      // Limpiar etiquetas del motivo para presentación limpia
      motivoLimpio = motivoLimpio
        .replace(/\[APELACION_DATA\].*?\[\/APELACION_DATA\]/g, '')
        .replace(/\[DICTAMEN_DATA\].*?\[\/DICTAMEN_DATA\]/g, '')
        .replace(/\[RESOLUCION_OFICINA_DATA\].*?\[\/RESOLUCION_OFICINA_DATA\]/g, '')
        .trim();

      // Normalizar status con cálculo dinámico de expiración en memoria
      const isExpired = plain.fecha_fin && ahora >= new Date(plain.fecha_fin) && (plain.estatus === 'ACTIVA' || plain.estatus === 'RATIFICADA');
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

      const nivel = Number(plain.numero_reincidencia || plain.id_regla || 1);
      const medidasPorNivel = {
        1: 'Primera Falta: Llamada de atención. Acceso permitido.',
        2: 'Segunda Falta: Suspensión temporal de 24 horas. Acceso denegado.',
        3: 'Tercera Falta: Suspensión temporal de 1 semana. Acceso denegado.',
        4: 'Cuarta Falta: Sanción definitiva (bloqueo permanente).'
      };
      const enVigor = !plain.fecha_inicio || ahora >= new Date(plain.fecha_inicio);

      return {
        ...plain,
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
        medidaDisciplinaria: medidasPorNivel[nivel] || plain.regla?.mensaje_alerta || `Sanción nivel ${nivel}`,
        evidenciaUrl: plain.reporte?.evidencias?.[0]?.archivo || '',
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
        // En permiso temporal se habilita el acceso vehicular para la jornada
        if (sancion.vehiculo) {
          sancion.vehiculo.estatus_acceso = 'HABILITADO';
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
    } catch (e) {}

    res.json(sancion);
  } catch (error) {
    console.error('Error al actualizar sanción:', error);
    res.status(500).json({ error: 'Error al actualizar sanción', details: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/sanciones - Listar todas las sanciones
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
      return {
        ...plain,
        id: String(plain.id_sancion),
        placa: plain.vehiculo?.placas || '',
        empresaNombre: plain.empresa?.razon_social || '',
        infraccionCodigo: plain.reporte?.infraccion?.codigo || 'INF-01',
        infraccionDescripcion: plain.reporte?.infraccion?.nombre || plain.motivo,
        tipo: plain.reporte?.infraccion?.nombre || plain.motivo,
        gravedad: plain.numero_reincidencia >= 3 ? 'critica' : (plain.numero_reincidencia === 2 ? 'grave' : 'moderada'),
        estado: plain.estatus === 'ACTIVA' ? 'activa' : (plain.estatus === 'VENCIDA' ? 'resuelta' : 'pendiente_aprobacion'),
        status: plain.estatus === 'ACTIVA' ? 'Activa' : 'Cumplida',
        fechaSancion: plain.fecha_inicio,
        montoMulta: plain.numero_reincidencia * 100,
        medidaDisciplinaria: plain.regla?.mensaje_alerta || `Sanción nivel ${plain.numero_reincidencia}`,
        descripcion: plain.motivo,
        evidenciaUrl: plain.reporte?.evidencias?.[0]?.archivo || ''
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar sanciones:', error);
    res.status(500).json({ error: 'Error al consultar sanciones', details: error.message });
  }
});

// PUT /api/sanciones/:id - Actualizar / Resolver sanción
router.put('/:id', async (req, res) => {
  try {
    const sancion = await db.Sancion.findByPk(req.params.id, {
      include: [{ model: db.Vehiculo, as: 'vehiculo' }]
    });
    if (!sancion) return res.status(404).json({ error: 'Sanción no encontrada' });

    const { estatus, fecha_fin } = req.body;
    if (estatus) sancion.estatus = estatus;
    if (fecha_fin) sancion.fecha_fin = fecha_fin;

    if (estatus === 'VENCIDA' || estatus === 'CANCELADA') {
      if (sancion.vehiculo) {
        sancion.vehiculo.estatus_acceso = 'HABILITADO';
        await sancion.vehiculo.save();
      }
    }

    await sancion.save();
    res.json(sancion);
  } catch (error) {
    console.error('Error al actualizar sanción:', error);
    res.status(500).json({ error: 'Error al actualizar sanción' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/bitacora - Listar accesos de caseta
router.get('/', async (req, res) => {
  try {
    const accesos = await db.BitacoraAcceso.findAll({
      include: [
        { model: db.Caseta, as: 'caseta' },
        { 
          model: db.Vehiculo, 
          as: 'vehiculo',
          include: [
            { model: db.Empresa, as: 'empresa' },
            { model: db.Corbatin, as: 'corbatines' }
          ]
        },
        { model: db.Corbatin, as: 'corbatin' },
        { 
          model: db.Trabajador, 
          as: 'conductor',
          include: [{ model: db.Empresa, as: 'empresa' }]
        },
        { model: db.Usuario, as: 'guardia', attributes: ['id_usuario', 'nombre'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const resultado = accesos.map(a => {
      const plain = a.get({ plain: true });
      const empNombre = plain.vehiculo?.empresa?.razon_social || plain.conductor?.empresa?.razon_social || '';
      const conductorNombre = plain.conductor ? `${plain.conductor.nombre} ${plain.conductor.apellidos}` : (plain.observaciones?.includes('Peatonal') ? 'Colaborador Peatonal' : 'Conductor Acreditado');
      const corbatinNum = plain.corbatin?.numero 
        ? String(plain.corbatin.numero) 
        : (plain.vehiculo?.corbatines?.[0]?.numero ? String(plain.vehiculo.corbatines[0].numero) : '');

      return {
        ...plain,
        id: String(plain.id_acceso),
        placa: plain.vehiculo?.placas || 'PEATONAL',
        empresaNombre: empNombre,
        conductor: conductorNombre,
        trabajadorNombre: conductorNombre,
        telefono: plain.vehiculo?.empresa?.telefono || plain.conductor?.telefono || '',
        corbatinNumero: corbatinNum,
        hora_entrada: plain.hora_entrada ? new Date(plain.hora_entrada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hrs' : '',
        hora_salida: plain.hora_salida ? new Date(plain.hora_salida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' hrs' : null,
        tipo: plain.id_vehiculo ? 'Vehicular' : 'Peatonal',
        estado: plain.hora_salida ? 'Salida Registrada' : 'Dentro',
        agenteNombre: plain.guardia?.nombre || 'Oficial en Caseta',
        cabina: plain.caseta?.nombre || 'Caseta Principal'
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar bitácora:', error);
    res.status(500).json({ error: 'Error al consultar bitácora de accesos', details: error.message });
  }
});

// POST /api/bitacora - Registrar entrada en caseta
router.post('/', async (req, res) => {
  try {
    const { 
      id_caseta, 
      id_vehiculo, 
      id_corbatin, 
      id_conductor, 
      id_usuario, 
      estatus_acceso, 
      motivo_rechazo, 
      ubicacion_trabajo, 
      observaciones,
      tipo // 'entrada' | 'salida'
    } = req.body;

    const ahora = new Date();
    const esSalida = tipo === 'salida' || estatus_acceso === 'SALIDA';

    let finalCorbatinId = id_corbatin || null;
    if (!finalCorbatinId && id_vehiculo) {
      const corb = await db.Corbatin.findOne({ where: { id_vehiculo, estatus: 'ACTIVO' } });
      if (corb) finalCorbatinId = corb.id_corbatin;
    }

    const nuevoAcceso = await db.BitacoraAcceso.create({
      id_caseta: id_caseta || 1,
      id_vehiculo: id_vehiculo || null,
      id_corbatin: finalCorbatinId,
      id_conductor: id_conductor || null,
      id_usuario: id_usuario || 4,
      fecha: ahora.toISOString().split('T')[0],
      hora_entrada: esSalida ? null : ahora,
      hora_salida: esSalida ? ahora : null,
      ubicacion_trabajo: ubicacion_trabajo || null,
      estatus_acceso: estatus_acceso || (esSalida ? 'SALIDA' : 'AUTORIZADO'),
      motivo_rechazo: motivo_rechazo || null,
      observaciones: observaciones || null
    });

    res.status(201).json(nuevoAcceso);
  } catch (error) {
    console.error('Error al registrar acceso en bitácora:', error);
    res.status(500).json({ error: 'Error al registrar acceso en caseta', details: error.message });
  }
});

// PUT /api/bitacora/:id/salida - Registrar salida de caseta
router.put('/:id/salida', async (req, res) => {
  try {
    const acceso = await db.BitacoraAcceso.findByPk(req.params.id);
    if (!acceso) return res.status(404).json({ error: 'Registro de acceso no encontrado' });

    acceso.hora_salida = new Date();
    acceso.estatus_acceso = 'SALIDA';
    await acceso.save();

    res.json(acceso);
  } catch (error) {
    console.error('Error al registrar salida en bitácora:', error);
    res.status(500).json({ error: 'Error al registrar salida en caseta' });
  }
});

module.exports = router;

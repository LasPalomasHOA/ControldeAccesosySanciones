const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');
const events = require('../events.cjs');

// GET /api/bitacora - Listar accesos de caseta (limitado a los 100 más recientes para ahorrar Egress)
router.get('/', async (req, res) => {
  try {
    const accesos = await db.BitacoraAcceso.findAll({
      limit: 100,
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
        num_pasajeros: plain.num_pasajeros !== undefined && plain.num_pasajeros !== null ? Number(plain.num_pasajeros) : 0,
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
      num_pasajeros,
      tipo // 'entrada' | 'salida'
    } = req.body;

    const ahora = new Date();
    const esSalida = tipo === 'salida' || estatus_acceso === 'SALIDA';

    // 1. Validar y resolver id_caseta
    let finalCasetaId = 1;
    if (id_caseta && !isNaN(Number(id_caseta))) {
      const cExists = await db.Caseta.findByPk(Number(id_caseta));
      if (cExists) {
        finalCasetaId = Number(id_caseta);
      } else {
        const firstCaseta = await db.Caseta.findOne();
        if (firstCaseta) finalCasetaId = firstCaseta.id_caseta;
      }
    } else {
      const firstCaseta = await db.Caseta.findOne();
      if (firstCaseta) finalCasetaId = firstCaseta.id_caseta;
    }

    // 2. Validar y resolver id_usuario (para integridad referencial)
    let finalUsuarioId = null;
    if (id_usuario && !isNaN(Number(id_usuario))) {
      const uExists = await db.Usuario.findByPk(Number(id_usuario));
      if (uExists) finalUsuarioId = Number(id_usuario);
    }
    if (!finalUsuarioId) {
      const firstUser = (await db.Usuario.findOne({ where: { activo: true } })) || (await db.Usuario.findOne());
      finalUsuarioId = firstUser ? firstUser.id_usuario : 1;
    }

    // 3. Validar y resolver id_vehiculo
    let finalVehiculoId = null;
    if (id_vehiculo && !isNaN(Number(id_vehiculo))) {
      const vExists = await db.Vehiculo.findByPk(Number(id_vehiculo));
      if (vExists) finalVehiculoId = Number(id_vehiculo);
    }

    // 4. Validar y resolver id_conductor (trabajador)
    let finalConductorId = null;
    if (id_conductor && !isNaN(Number(id_conductor))) {
      const tExists = await db.Trabajador.findByPk(Number(id_conductor));
      if (tExists) finalConductorId = Number(id_conductor);
    }

    // 5. Validar y resolver id_corbatin
    let finalCorbatinId = null;
    if (id_corbatin && !isNaN(Number(id_corbatin))) {
      const corbExists = await db.Corbatin.findByPk(Number(id_corbatin));
      if (corbExists) finalCorbatinId = Number(id_corbatin);
    } else if (finalVehiculoId) {
      const corb = await db.Corbatin.findOne({ where: { id_vehiculo: finalVehiculoId, estatus: 'ACTIVO' } });
      if (corb) finalCorbatinId = corb.id_corbatin;
    }

    const nuevoAcceso = await db.BitacoraAcceso.create({
      id_caseta: finalCasetaId,
      id_vehiculo: finalVehiculoId,
      id_corbatin: finalCorbatinId,
      id_conductor: finalConductorId,
      id_usuario: finalUsuarioId,
      num_pasajeros: num_pasajeros !== undefined && num_pasajeros !== null ? Number(num_pasajeros) : 0,
      fecha: ahora.toISOString().split('T')[0],
      hora_entrada: esSalida ? null : ahora,
      hora_salida: esSalida ? ahora : null,
      ubicacion_trabajo: ubicacion_trabajo || null,
      estatus_acceso: estatus_acceso || (esSalida ? 'SALIDA' : 'AUTORIZADO'),
      motivo_rechazo: motivo_rechazo || null,
      observaciones: observaciones || null
    });

    try {
      events.broadcastEvent('NUEVO_ACCESO', {
        id_acceso: nuevoAcceso.id_acceso,
        id_vehiculo: nuevoAcceso.id_vehiculo,
        tipo: esSalida ? 'salida' : 'entrada'
      });
    } catch (e) {}

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

    try {
      events.broadcastEvent('SALIDA_REGISTRADA', {
        id_acceso: acceso.id_acceso
      });
    } catch (e) {}

    res.json(acceso);
  } catch (error) {
    console.error('Error al registrar salida en bitácora:', error);
    res.status(500).json({ error: 'Error al registrar salida en caseta' });
  }
});

module.exports = router;

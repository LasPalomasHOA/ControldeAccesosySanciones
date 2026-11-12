const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');
const events = require('../events.cjs');

// GET /api/bitacora - Listar accesos de caseta (limitado a los 100 más recientes para ahorrar Egress)
router.get('/', async (req, res) => {
  try {
    const whereClause = {};
    if (req.query.id_vehiculo && !isNaN(Number(req.query.id_vehiculo))) {
      whereClause.id_vehiculo = Number(req.query.id_vehiculo);
    }
    if (req.query.id_corbatin && !isNaN(Number(req.query.id_corbatin))) {
      whereClause.id_corbatin = Number(req.query.id_corbatin);
    }
    const queryLimit = req.query.limit && !isNaN(Number(req.query.limit))
      ? Math.min(Math.max(Number(req.query.limit), 1), 100)
      : 100;

    const accesos = await db.BitacoraAcceso.findAll({
      where: whereClause,
      limit: queryLimit,
      attributes: ['id_acceso', 'id_caseta', 'id_vehiculo', 'id_corbatin', 'id_conductor', 'id_usuario', 'fecha', 'hora_entrada', 'hora_salida', 'num_pasajeros', 'estatus_acceso', 'motivo_rechazo', 'ubicacion_trabajo', 'observaciones', 'created_at', 'updated_at'],
      include: [
        { model: db.Caseta, as: 'caseta', attributes: ['id_caseta', 'nombre'] },
        {
          model: db.Vehiculo,
          as: 'vehiculo',
          attributes: ['id_vehiculo', 'placas', 'marca', 'modelo', 'color'],
          include: [
            { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social', 'telefono'] },
            { model: db.Corbatin, as: 'corbatines', attributes: ['id_corbatin', 'numero', 'estatus'] }
          ]
        },
        {
          model: db.Corbatin,
          as: 'corbatin',
          attributes: ['id_corbatin', 'numero', 'estatus', 'tipos', 'empresa_nombre', 'telefono', 'vigencia_texto']
        },
        {
          model: db.Trabajador,
          as: 'conductor',
          attributes: ['id_trabajador', 'nombre', 'apellidos', 'telefono'],
          include: [{ model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social', 'telefono'] }]
        },
        { model: db.Usuario, as: 'guardia', attributes: ['id_usuario', 'nombre'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const resultado = accesos.map(a => {
      const plain = a.get({ plain: true });
      const isVisitante = Boolean(plain.observaciones && plain.observaciones.includes('[VISITANTE]')) || (plain.ubicacion_trabajo && plain.ubicacion_trabajo.includes('Visitante'));
      const isCorbatinVerde = !isVisitante && ((plain.corbatin?.tipos || '').toUpperCase() === 'VERDE' || Boolean(plain.observaciones && plain.observaciones.includes('CORBATÍN VERDE')));
      const empNombre = isVisitante ? 'Visitante' : (plain.corbatin?.empresa_nombre || plain.vehiculo?.empresa?.razon_social || plain.conductor?.empresa?.razon_social || '');

      let conductorNombre = 'Conductor Acreditado';
      if (plain.conductor) {
        conductorNombre = `${plain.conductor.nombre} ${plain.conductor.apellidos}`;
      } else if (plain.observaciones && plain.observaciones.includes('Chofer:')) {
        const m = plain.observaciones.match(/Chofer:\s*([^|\]]+)/i);
        if (m && m[1]) conductorNombre = m[1].trim();
      } else if (plain.observaciones && plain.observaciones.includes('Chofer [')) {
        const m = plain.observaciones.match(/Chofer\s*\[([^\]]+)\]/i);
        if (m && m[1]) conductorNombre = m[1].trim();
      } else if (plain.observaciones && plain.observaciones.includes('Peatonal')) {
        conductorNombre = 'Colaborador Peatonal';
      }

      let corbatinNum = '';
        if (isVisitante && plain.observaciones && plain.observaciones.includes('Corbatín:')) {
          const m = plain.observaciones.match(/Corbat[íi]n:\s*#?([0-9]+)/i);
          if (m && m[1]) corbatinNum = String(parseInt(m[1], 10));
        } else if (plain.corbatin?.numero) {
          corbatinNum = isCorbatinVerde
            ? `00${parseInt(String(plain.corbatin.numero).replace(/[^0-9]/g, ''), 10) || plain.corbatin.numero}`
            : String(plain.corbatin.numero);
        } else if (plain.vehiculo?.corbatines?.[0]?.numero) {
          corbatinNum = String(plain.vehiculo.corbatines[0].numero);
        } else if (plain.observaciones && plain.observaciones.includes('CORBATÍN VERDE #')) {
          const m = plain.observaciones.match(/CORBATÍN VERDE #([0-9]+)/i);
          if (m && m[1]) corbatinNum = `00${parseInt(m[1], 10)}`;
        }

        let vehiculoTexto = '';
        if (plain.observaciones && plain.observaciones.includes('Vehículo:')) {
          const m = plain.observaciones.match(/Veh[íi]culo:\s*([^|\]]+)/i);
          if (m && m[1]) vehiculoTexto = m[1].trim();
        }

        let placasFinal = plain.vehiculo?.placas;
        if (!placasFinal && plain.observaciones && plain.observaciones.includes('Placas:')) {
          const m = plain.observaciones.match(/Placas:\s*([^|\]]+)/i);
          if (m && m[1]) placasFinal = m[1].trim();
        }
        if (!placasFinal) {
          placasFinal = isVisitante ? 'VISITANTE' : (isCorbatinVerde ? 'PROYECTO' : (plain.id_vehiculo ? 'VEHICULAR' : 'PEATONAL'));
        }

        const rawHoraEntrada = plain.hora_entrada
          ? (plain.hora_entrada instanceof Date ? plain.hora_entrada.toISOString() : new Date(plain.hora_entrada).toISOString())
          : null;
        const rawHoraSalida = plain.hora_salida
          ? (plain.hora_salida instanceof Date ? plain.hora_salida.toISOString() : new Date(plain.hora_salida).toISOString())
          : null;

        const trabajoLimpio = (plain.ubicacion_trabajo && plain.ubicacion_trabajo.trim() !== 'x')
          ? plain.ubicacion_trabajo.trim()
        : (plain.observaciones && plain.observaciones.trim() !== 'x' && !plain.observaciones.startsWith('Chofer [') && !plain.observaciones.startsWith('Peatonal [') && !plain.observaciones.startsWith('[CORBATÍN VERDE') && !plain.observaciones.startsWith('[VISITANTE')
      ? plain.observaciones.trim()
          : (isVisitante ? 'Visita autorizada al complejo' : (isCorbatinVerde ? `Proyecto Temporal — ${empNombre || 'Contratista'}` : (plain.id_vehiculo ? 'Mantenimiento / Acceso regular' : 'Labores y mantenimiento a pie'))));

const tipoFinal = isVisitante ? 'Visitante' : (isCorbatinVerde ? 'Corbatín Verde' : (plain.id_vehiculo ? 'Vehicular' : 'Peatonal'));

return {
  ...plain,
  id: String(plain.id_acceso),
  num_pasajeros: plain.num_pasajeros !== undefined && plain.num_pasajeros !== null ? Number(plain.num_pasajeros) : 0,
  placa: placasFinal,
  empresaNombre: empNombre,
  conductor: conductorNombre,
  trabajadorNombre: conductorNombre,
  telefono: plain.corbatin?.telefono || plain.vehiculo?.empresa?.telefono || plain.conductor?.telefono || '',
  corbatinNumero: corbatinNum || '—',
  corbatinNum: corbatinNum || '—',
  tipoCorbatin: isVisitante ? 'VISITANTE' : (isCorbatinVerde ? 'VERDE' : 'NORMAL'),
  color: vehiculoTexto || plain.vehiculo?.color || 'N/A',
  ubicacion_trabajo: trabajoLimpio,
  trabajos: trabajoLimpio,
  raw_hora_entrada: rawHoraEntrada || plain.hora_entrada,
  raw_hora_salida: rawHoraSalida || plain.hora_salida,
  fecha: plain.fecha || (rawHoraEntrada ? rawHoraEntrada.split('T')[0] : (plain.created_at ? new Date(plain.created_at).toISOString().split('T')[0] : null)),
  hora_entrada: plain.hora_entrada ? new Date(plain.hora_entrada).toLocaleTimeString('es-MX', { timeZone: 'America/Hermosillo', hour: '2-digit', minute: '2-digit' }) : (rawHoraEntrada || ''),
  hora_salida: plain.hora_salida ? new Date(plain.hora_salida).toLocaleTimeString('es-MX', { timeZone: 'America/Hermosillo', hour: '2-digit', minute: '2-digit' }) : null,
  fechaHora: rawHoraEntrada || (plain.created_at ? new Date(plain.created_at).toISOString() : new Date().toISOString()),
  tipo: tipoFinal,
  tipoAcceso: tipoFinal,
  estado: plain.hora_salida ? 'Salida Registrada' : 'Dentro',
  agenteNombre: plain.guardia?.nombre || 'Oficial en Caseta',
  guardiaNombre: plain.guardia?.nombre || 'Oficial de Turno',
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

    // Resolver identificadores numéricos de forma directa para evitar consultas previas innecesarias
    const finalCasetaId = (id_caseta && !isNaN(Number(id_caseta))) ? Number(id_caseta) : 1;
    const finalUsuarioId = (id_usuario && !isNaN(Number(id_usuario))) ? Number(id_usuario) : 1;
    const finalVehiculoId = (id_vehiculo && !isNaN(Number(id_vehiculo))) ? Number(id_vehiculo) : null;
    const finalConductorId = (id_conductor && !isNaN(Number(id_conductor))) ? Number(id_conductor) : null;
    const finalCorbatinId = (id_corbatin && !isNaN(Number(id_corbatin))) ? Number(id_corbatin) : null;

    // VALIDACIÓN: No permitir registrar entrada si el vehículo ya está dentro sin salida registrada
    if (!esSalida && finalVehiculoId) {
      const accesoActivo = await db.BitacoraAcceso.findOne({
        where: {
          id_vehiculo: finalVehiculoId,
          hora_salida: null
        },
        order: [['created_at', 'DESC']]
      });

      if (accesoActivo) {
        return res.status(400).json({
          error: 'El vehículo ya se encuentra dentro de las instalaciones. Debe registrar su salida antes de registrar una nueva entrada.',
          id_acceso_activo: accesoActivo.id_acceso
        });
      }
    }

    if (!esSalida && finalCorbatinId) {
      const accesoActivo = await db.BitacoraAcceso.findOne({
        where: {
          id_corbatin: finalCorbatinId,
          hora_salida: null
        },
        order: [['created_at', 'DESC']]
      });

      if (accesoActivo) {
        return res.status(400).json({
          error: 'El corbatín ya cuenta con una entrada activa pendiente de salida.',
          id_acceso_activo: accesoActivo.id_acceso
        });
      }
    }

    // Validación de corbatín físico de visitante (1 al 30)
    if (!esSalida && observaciones && String(observaciones).includes('[VISITANTE]')) {
      const m = String(observaciones).match(/Corbat[íi]n:\s*#?([0-9]+)/i);
      if (m && m[1]) {
        const numVis = m[1];
        const visitActivo = await db.BitacoraAcceso.findOne({
          where: {
            observaciones: { [db.Sequelize.Op.like]: `%[VISITANTE]%Corbatín: #${numVis}%` },
            hora_salida: null
          }
        });
        if (visitActivo) {
          return res.status(400).json({
            error: `El Corbatín de Visitante #${numVis} ya se encuentra asignado a un visitante dentro del complejo. Debe registrar su salida antes de volver a asignarlo.`
          });
        }
      }
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
    } catch (e) { }

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
    } catch (e) { }

    res.json(acceso);
  } catch (error) {
    console.error('Error al registrar salida en bitácora:', error);
    res.status(500).json({ error: 'Error al registrar salida en caseta' });
  }
});

module.exports = router;

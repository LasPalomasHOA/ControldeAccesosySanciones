const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');
const events = require('../events.cjs');
const { saveBase64Image } = require('../utils/imageHandler.cjs');

// GET /api/vehiculos - Listar todos los vehículos
router.get('/', async (req, res) => {
  try {
    const { id_empresa, estatus_acceso } = req.query;
    const where = {};
    if (id_empresa) where.id_empresa = id_empresa;
    if (estatus_acceso) where.estatus_acceso = estatus_acceso;

    const vehiculos = await db.Vehiculo.findAll({
      where,
      include: [
        { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] },
        { model: db.Corbatin, as: 'corbatines' },
        { 
          model: db.ConductorVehiculo, 
          as: 'asignaciones_conductores',
          include: [{ model: db.Trabajador, as: 'trabajador' }]
        },
        { model: db.Sancion, as: 'sanciones', where: { estatus: 'ACTIVA' }, required: false }
      ],
      order: [['created_at', 'DESC']]
    });

    const formatFoto = (url) => {
      if (!url) return null;
      const str = String(url).trim();
      if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:') || str.startsWith('blob:') || str.startsWith('/uploads/')) return str;
      if (str.startsWith('uploads/')) return `/${str}`;
      return `/uploads/${str}`;
    };

    const resultado = vehiculos.map(v => {
      const plain = v.get({ plain: true });
      const corbatinActivo = plain.corbatines?.find(c => c.estatus === 'ACTIVO') || plain.corbatines?.[0];
      const conductorAsignado = plain.asignaciones_conductores?.[0]?.trabajador;

      let estadoAcceso = 'permitido';
      if (plain.estatus_acceso === 'SUSPENDIDO' || plain.estatus_acceso === 'RESTRINGIDO') {
        estadoAcceso = 'bloqueado';
      } else if (plain.sanciones && plain.sanciones.length > 0) {
        estadoAcceso = 'alerta_sancion';
      }

      return {
        ...plain,
        id: String(plain.id_vehiculo),
        placa: plain.placas,
        empresaId: String(plain.id_empresa),
        empresaNombre: plain.empresa?.razon_social || '',
        año: plain.año,
        anio: plain.año,
        foto_url: formatFoto(plain.foto_url),
        foto: formatFoto(plain.foto_url),
        corbatinNumero: corbatinActivo ? String(corbatinActivo.numero) : '',
        corbatinVencimiento: corbatinActivo?.fecha_vencimiento ? new Date(corbatinActivo.fecha_vencimiento).toISOString().split('T')[0] : '',
        qr_token: corbatinActivo?.qr_token || '',
        conductor: conductorAsignado ? `${conductorAsignado.nombre} ${conductorAsignado.apellidos}` : '',
        conductorId: conductorAsignado?.id_trabajador || null,
        reincidencias: plain.sanciones?.length || 0,
        estadoAcceso,
        status: plain.estatus_acceso === 'HABILITADO' ? 'Habilitado' : (plain.estatus_acceso === 'SUSPENDIDO' ? 'Suspendido' : (plain.estatus_acceso === 'DESHABILITADO' ? 'Deshabilitado' : 'Restringido'))
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error al consultar vehículos', details: error.message });
  }
});

// GET /api/vehiculos/:id - Obtener vehículo por ID
router.get('/:id', async (req, res) => {
  try {
    const vehiculo = await db.Vehiculo.findByPk(req.params.id, {
      include: [
        { model: db.Empresa, as: 'empresa' },
        { model: db.Corbatin, as: 'corbatines' },
        { 
          model: db.ConductorVehiculo, 
          as: 'asignaciones_conductores',
          include: [{ model: db.Trabajador, as: 'trabajador' }]
        },
        { model: db.Sancion, as: 'sanciones' }
      ]
    });

    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(vehiculo);
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({ error: 'Error al consultar vehículo' });
  }
});

// POST /api/vehiculos - Registrar vehículo
router.post('/', async (req, res) => {
  try {
    const { 
      id_empresa, 
      empresaId, 
      marca, 
      modelo, 
      año, 
      anio, 
      placas, 
      placa, 
      color, 
      foto_url, 
      foto, 
      estatus_acceso, 
      id_conductor 
    } = req.body;

    const empId = id_empresa || empresaId;
    const finalPlacas = (placas || placa || '').toUpperCase();
    const finalAño = año || anio || null;

    if (!empId || !marca || !modelo || !finalPlacas || !color) {
      return res.status(400).json({ error: 'Empresa, marca, modelo, placas y color son obligatorios' });
    }

    const nuevoVehiculo = await db.Vehiculo.create({
      id_empresa: empId,
      marca,
      modelo,
      año: finalAño ? parseInt(finalAño, 10) : null,
      placas: finalPlacas,
      color,
      foto_url: foto_url || foto || null,
      estatus_acceso: estatus_acceso || 'HABILITADO'
    });

    // Generar corbatín inicial automáticamente
    const countCorbatines = await db.Corbatin.count();
    const corbatinNum = 100 + countCorbatines + 1;
    const nuevoCorbatin = await db.Corbatin.create({
      id_vehiculo: nuevoVehiculo.id_vehiculo,
      numero: corbatinNum,
      qr_token: `CORB-${corbatinNum}-${finalPlacas}-${new Date().getFullYear()}`,
      fecha_emision: new Date(),
      fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      estatus: 'ACTIVO'
    });

    // Asignar conductor si se especificó
    if (id_conductor) {
      await db.ConductorVehiculo.create({
        id_vehiculo: nuevoVehiculo.id_vehiculo,
        id_trabajador: id_conductor,
        activo: true
      });
    }

    res.status(201).json({
      ...nuevoVehiculo.get({ plain: true }),
      corbatin: nuevoCorbatin
    });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ error: 'Error al registrar vehículo', details: error.message });
  }
});

// PUT /api/vehiculos/:id - Actualizar vehículo
router.put('/:id', async (req, res) => {
  try {
    const vehiculo = await db.Vehiculo.findByPk(req.params.id);
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });

    const { marca, modelo, año, anio, placas, placa, color, foto_url, foto, estatus_acceso, estadoAcceso } = req.body;

    if (marca !== undefined) vehiculo.marca = marca;
    if (modelo !== undefined) vehiculo.modelo = modelo;
    if (año !== undefined || anio !== undefined) vehiculo.año = (año || anio) ? parseInt(año || anio, 10) : null;
    if (placas || placa) vehiculo.placas = (placas || placa).toUpperCase();
    if (color !== undefined) vehiculo.color = color;
    if (foto_url !== undefined || foto !== undefined) {
      vehiculo.foto_url = foto_url || foto;
    }
    if (estatus_acceso !== undefined) vehiculo.estatus_acceso = estatus_acceso;
    else if (estadoAcceso !== undefined) {
      vehiculo.estatus_acceso = estadoAcceso === 'bloqueado' ? 'SUSPENDIDO' : 'HABILITADO';
    }

    await vehiculo.save();

    try {
      events.broadcastEvent('VEHICULO_ACTUALIZADO', {
        id_vehiculo: vehiculo.id_vehiculo,
        estatus_acceso: vehiculo.estatus_acceso
      });
    } catch (e) {}

    res.json(vehiculo);
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ error: 'Error al actualizar vehículo' });
  }
});

// DELETE /api/vehiculos/:id - Eliminar vehículo
router.delete('/:id', async (req, res) => {
  try {
    const vehiculo = await db.Vehiculo.findByPk(req.params.id);
    if (!vehiculo) return res.json({ message: 'Vehículo ya no existe', id_vehiculo: req.params.id });
    
    // Eliminar asociaciones dependientes
    await db.Corbatin.destroy({ where: { id_vehiculo: req.params.id } });
    await db.ConductorVehiculo.destroy({ where: { id_vehiculo: req.params.id } });
    await vehiculo.destroy();
    res.json({ message: 'Vehículo eliminado correctamente', id_vehiculo: req.params.id });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ error: 'Error al eliminar vehículo', details: error.message });
  }
});

module.exports = router;

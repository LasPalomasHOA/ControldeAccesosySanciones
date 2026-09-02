const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/empresas - Listar empresas con conteos de trabajadores y vehículos
router.get('/', async (req, res) => {
  try {
    const empresas = await db.Empresa.findAll({
      include: [
        { model: db.Trabajador, as: 'trabajadores', attributes: ['id_trabajador'] },
        { model: db.Vehiculo, as: 'vehiculos', attributes: ['id_vehiculo'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const resultado = empresas.map(emp => {
      const plain = emp.get({ plain: true });
      return {
        ...plain,
        id: String(plain.id_empresa),
        nombre: plain.razon_social,
        responsable: plain.responsable_nombre,
        estado: plain.estatus === 'ACTIVA' ? 'activo' : 'suspendido',
        totalTrabajadores: plain.trabajadores?.length || 0,
        totalVehiculos: plain.vehiculos?.length || 0
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({ error: 'Error al consultar empresas' });
  }
});

// GET /api/empresas/:id - Obtener empresa por ID
router.get('/:id', async (req, res) => {
  try {
    const empresa = await db.Empresa.findByPk(req.params.id, {
      include: [
        { model: db.Trabajador, as: 'trabajadores' },
        { model: db.Vehiculo, as: 'vehiculos' },
        { model: db.Usuario, as: 'usuarios', attributes: ['id_usuario', 'nombre', 'correo'] }
      ]
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    res.status(500).json({ error: 'Error al consultar empresa' });
  }
});

// POST /api/empresas - Registrar nueva empresa
router.post('/', async (req, res) => {
  try {
    const { razon_social, nombre, responsable_nombre, responsable, telefono, correo, estatus, estado } = req.body;
    const razon = razon_social || nombre;
    const resp = responsable_nombre || responsable;

    if (!razon || !resp || !telefono) {
      return res.status(400).json({ error: 'Razón social, responsable y teléfono son obligatorios' });
    }

    const nueva = await db.Empresa.create({
      razon_social: razon,
      responsable_nombre: resp,
      telefono,
      correo: correo || null,
      estatus: estatus || (estado === 'activo' ? 'ACTIVA' : 'ACTIVA')
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al crear empresa:', error);
    res.status(500).json({ error: 'Error al registrar empresa', details: error.message });
  }
});

// PUT /api/empresas/:id - Actualizar empresa
router.put('/:id', async (req, res) => {
  try {
    const empresa = await db.Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const { razon_social, nombre, responsable_nombre, responsable, telefono, correo, estatus, estado } = req.body;
    if (razon_social || nombre) empresa.razon_social = razon_social || nombre;
    if (responsable_nombre || responsable) empresa.responsable_nombre = responsable_nombre || responsable;
    if (telefono !== undefined) empresa.telefono = telefono;
    if (correo !== undefined) empresa.correo = correo;
    if (estatus !== undefined) empresa.estatus = estatus;
    else if (estado !== undefined) empresa.estatus = estado === 'activo' ? 'ACTIVA' : 'SUSPENDIDA';

    await empresa.save();
    res.json(empresa);
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json({ error: 'Error al actualizar empresa' });
  }
});

// DELETE /api/empresas/:id - Eliminar empresa
router.delete('/:id', async (req, res) => {
  try {
    const empresa = await db.Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    await empresa.destroy();
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    res.status(500).json({ error: 'Error al eliminar empresa' });
  }
});

module.exports = router;

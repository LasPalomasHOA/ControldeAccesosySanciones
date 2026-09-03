const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');
const { saveBase64Image } = require('../utils/imageHandler.cjs');

// GET /api/trabajadores - Listar todos los trabajadores (o filtrar por id_empresa)
router.get('/', async (req, res) => {
  try {
    const { id_empresa, activo } = req.query;
    const where = {};
    if (id_empresa) where.id_empresa = id_empresa;
    if (activo !== undefined) where.activo = activo === 'true';

    const trabajadores = await db.Trabajador.findAll({
      where,
      include: [{ model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }],
      order: [['created_at', 'DESC']]
    });

    const resultado = trabajadores.map(t => {
      const plain = t.get({ plain: true });
      return {
        ...plain,
        id: String(plain.id_trabajador),
        id_empresa: String(plain.id_empresa),
        empresaNombre: plain.empresa?.razon_social || ''
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos de trabajadores', details: error.message });
  }
});

// GET /api/trabajadores/:id - Obtener un trabajador por ID
router.get('/:id', async (req, res) => {
  try {
    const trabajador = await db.Trabajador.findByPk(req.params.id, {
      include: [{ model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }]
    });
    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }
    const plain = trabajador.get({ plain: true });
    res.json({
      ...plain,
      id: String(plain.id_trabajador),
      id_empresa: String(plain.id_empresa),
      empresaNombre: plain.empresa?.razon_social || ''
    });
  } catch (error) {
    console.error('Error al obtener trabajador:', error);
    res.status(500).json({ error: 'Error al consultar el trabajador' });
  }
});

// POST /api/trabajadores - Registrar nuevo trabajador
router.post('/', async (req, res) => {
  try {
    const { id_empresa, nombre, apellidos, telefono, foto_url, activo } = req.body;

    if (!id_empresa || !nombre || !apellidos) {
      return res.status(400).json({ error: 'id_empresa, nombre y apellidos son campos obligatorios' });
    }

    const nuevo = await db.Trabajador.create({
      id_empresa,
      nombre,
      apellidos,
      telefono: telefono || null,
      foto_url: foto_url || null,
      activo: activo !== undefined ? activo : true
    });

    const plain = nuevo.get({ plain: true });
    res.status(201).json({
      ...plain,
      id: String(plain.id_trabajador),
      id_empresa: String(plain.id_empresa)
    });
  } catch (error) {
    console.error('Error al crear trabajador:', error);
    res.status(500).json({ error: 'Error al registrar el trabajador', details: error.message });
  }
});

// PUT /api/trabajadores/:id - Modificar trabajador existente
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellidos, telefono, foto_url, activo } = req.body;
    const trabajador = await db.Trabajador.findByPk(req.params.id);

    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    if (nombre !== undefined) trabajador.nombre = nombre;
    if (apellidos !== undefined) trabajador.apellidos = apellidos;
    if (telefono !== undefined) trabajador.telefono = telefono;
    if (foto_url !== undefined) {
      trabajador.foto_url = foto_url;
    }
    if (activo !== undefined) trabajador.activo = activo;

    await trabajador.save();
    const plain = trabajador.get({ plain: true });
    res.json({
      ...plain,
      id: String(plain.id_trabajador),
      id_empresa: String(plain.id_empresa)
    });
  } catch (error) {
    console.error('Error al actualizar trabajador:', error);
    res.status(500).json({ error: 'Error al actualizar el trabajador', details: error.message });
  }
});

// DELETE /api/trabajadores/:id - Eliminar trabajador
router.delete('/:id', async (req, res) => {
  try {
    const trabajador = await db.Trabajador.findByPk(req.params.id);
    if (!trabajador) {
      return res.json({ message: 'El trabajador ya no existe o fue eliminado previamente', id_trabajador: req.params.id });
    }

    await trabajador.destroy();
    res.json({ message: 'Trabajador eliminado correctamente', id_trabajador: req.params.id });
  } catch (error) {
    console.error('Error al eliminar trabajador:', error);
    res.status(500).json({ error: 'Error al eliminar el trabajador' });
  }
});

module.exports = router;

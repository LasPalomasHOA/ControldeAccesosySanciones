const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/corbatines - Listar todos los corbatines
router.get('/', async (req, res) => {
  try {
    const corbatines = await db.Corbatin.findAll({
      include: [
        {
          model: db.Vehiculo,
          as: 'vehiculo',
          include: [{ model: db.Empresa, as: 'empresa' }]
        }
      ],
      order: [['numero', 'DESC']]
    });
    res.json(corbatines);
  } catch (error) {
    console.error('Error al obtener corbatines:', error);
    res.status(500).json({ error: 'Error al consultar corbatines' });
  }
});

// POST /api/corbatines - Crear o renovar corbatín
router.post('/', async (req, res) => {
  try {
    const { id_vehiculo, numero, qr_token, fecha_vencimiento, estatus } = req.body;
    if (!id_vehiculo) return res.status(400).json({ error: 'id_vehiculo es obligatorio' });

    const vehiculo = await db.Vehiculo.findByPk(id_vehiculo);
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });

    let finalNum = numero;
    if (!finalNum) {
      const total = await db.Corbatin.count();
      finalNum = 100 + total + 1;
    }

    const token = qr_token || `CORB-${finalNum}-${vehiculo.placas}-${new Date().getFullYear()}`;

    const nuevo = await db.Corbatin.create({
      id_vehiculo,
      numero: finalNum,
      qr_token: token,
      fecha_emision: new Date(),
      fecha_vencimiento: fecha_vencimiento || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      estatus: estatus || 'ACTIVO'
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al crear corbatín:', error);
    res.status(500).json({ error: 'Error al registrar corbatín', details: error.message });
  }
});

module.exports = router;

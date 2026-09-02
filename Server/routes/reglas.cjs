const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/reglas - Listar reglas de reincidencia
router.get('/', async (req, res) => {
  try {
    const reglas = await db.ReglaReincidencia.findAll({ order: [['numero_falta', 'ASC']] });
    res.json(reglas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar reglas de reincidencia' });
  }
});

module.exports = router;

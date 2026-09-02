const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/casetas - Listar casetas
router.get('/', async (req, res) => {
  try {
    const casetas = await db.Caseta.findAll({ order: [['id_caseta', 'ASC']] });
    res.json(casetas);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar casetas' });
  }
});

module.exports = router;

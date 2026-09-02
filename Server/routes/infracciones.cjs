const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/infracciones - Catálogo de infracciones
router.get('/', async (req, res) => {
  try {
    const infracciones = await db.CatalogoInfraccion.findAll({
      where: { activo: true },
      order: [['codigo', 'ASC']]
    });
    res.json(infracciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar catálogo de infracciones' });
  }
});

module.exports = router;

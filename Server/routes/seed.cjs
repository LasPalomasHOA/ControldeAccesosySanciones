const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../seedData.cjs');

// POST /api/seed - Sembrar datos base iniciales
router.post('/', async (req, res) => {
  try {
    const result = await seedDatabase(req.body.force === true);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al inicializar datos base en PostgreSQL', details: error.message });
  }
});

module.exports = router;

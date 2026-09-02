const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/roles - Listar todos los roles
router.get('/', async (req, res) => {
  try {
    const roles = await db.Rol.findAll({ where: { activo: true }, order: [['id_rol', 'ASC']] });
    res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al consultar roles' });
  }
});

module.exports = router;

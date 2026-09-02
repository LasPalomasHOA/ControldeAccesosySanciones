const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// GET /api/reglamentos - Obtener reglamento vigente y aceptaciones
router.get('/', async (req, res) => {
  try {
    const reglamentos = await db.Reglamento.findAll({
      include: [
        { model: db.CatalogoInfraccion, as: 'infracciones' },
        { model: db.AceptacionReglamento, as: 'aceptaciones' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(reglamentos);
  } catch (error) {
    console.error('Error al obtener reglamentos:', error);
    res.status(500).json({ error: 'Error al consultar reglamentos' });
  }
});

// GET /api/reglamentos/vigente - Obtener reglamento vigente actual
router.get('/vigente', async (req, res) => {
  try {
    const vigente = await db.Reglamento.findOne({
      where: { vigente: true },
      include: [{ model: db.CatalogoInfraccion, as: 'infracciones' }]
    });
    res.json(vigente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reglamento vigente' });
  }
});

// POST /api/reglamentos/aceptar - Firmar/Aceptar reglamento
router.post('/aceptar', async (req, res) => {
  try {
    const { id_reglamento, id_empresa, id_usuario, firma_nombre } = req.body;
    if (!id_empresa || !id_usuario) {
      return res.status(400).json({ error: 'id_empresa e id_usuario son obligatorios' });
    }

    let regId = id_reglamento;
    if (!regId) {
      const regVigente = await db.Reglamento.findOne({ where: { vigente: true } });
      regId = regVigente?.id_reglamento || 1;
    }

    const nuevaAceptacion = await db.AceptacionReglamento.create({
      id_reglamento: regId,
      id_empresa,
      id_usuario,
      aceptado: true,
      fecha_hora: new Date(),
      firma_nombre: firma_nombre || 'Firma Electrónica'
    });

    res.status(201).json(nuevaAceptacion);
  } catch (error) {
    console.error('Error al aceptar reglamento:', error);
    res.status(500).json({ error: 'Error al registrar aceptación de reglamento' });
  }
});

module.exports = router;

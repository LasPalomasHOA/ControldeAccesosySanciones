const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');
const { saveBase64Image, resolveFotoToDataUrl } = require('../utils/imageHandler.cjs');

// GET /api/trabajadores - Listar todos los trabajadores (o filtrar por id_empresa)
router.get('/', async (req, res) => {
  try {
    const { id_empresa, activo } = req.query;
    const where = {};
    if (id_empresa) where.id_empresa = id_empresa;
    if (activo !== undefined) where.activo = activo === 'true';

    const trabajadores = await db.Trabajador.findAll({
      where,
      attributes: [
        'id_trabajador',
        'id_empresa',
        'nombre',
        'apellidos',
        'telefono',
        'foto_url',
        // Si es Base64 ('data:...'), enviamos un puntero ligero; si es URL de Storage o null, pasa igual
        [
          db.sequelize.literal(`CASE 
            WHEN comprobante_seguro_url LIKE 'data:%' THEN CONCAT('/api/trabajadores/', id_trabajador, '/documento/seguro.pdf')
            ELSE comprobante_seguro_url 
          END`),
          'comprobante_seguro_url'
        ],
        [
          db.sequelize.literal(`CASE 
            WHEN dc3_documento_url LIKE 'data:%' THEN CONCAT('/api/trabajadores/', id_trabajador, '/documento/dc3.pdf')
            ELSE dc3_documento_url 
          END`),
          'dc3_documento_url'
        ],
        'activo',
        'created_at',
        'updated_at'
      ],
      include: [{ model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }],
      order: [['id_trabajador', 'DESC']],
      limit: 100
    });

    const resultado = trabajadores.map(t => {
      const plain = t.get({ plain: true });
      return {
        ...plain,
        id: String(plain.id_trabajador),
        id_empresa: String(plain.id_empresa),
        empresaNombre: plain.empresa?.razon_social || '',
        foto_url: resolveFotoToDataUrl(plain.foto_url)
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos de trabajadores', details: error.message });
  }
});

// GET /api/trabajadores/:id/documento/:tipo - Sirve el binario/Base64 únicamente al abrir la vista previa
router.get('/:id/documento/:tipo', async (req, res) => {
  try {
    const { id, tipo } = req.params;
    const cleanTipo = String(tipo || '').toLowerCase().replace(/\.pdf$/i, '');
    const col = cleanTipo === 'seguro' ? 'comprobante_seguro_url' : 'dc3_documento_url';
    const trab = await db.Trabajador.findByPk(id, { attributes: [col] });
    const raw = trab ? trab[col] : null;

    if (!raw) return res.status(404).send('Documento no encontrado');
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return res.redirect(raw);
    }

    const match = raw.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const buffer = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', match[1]);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }
    res.send(raw);
  } catch (error) {
    res.status(500).send('Error al cargar documento');
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
    const {
      id_empresa,
      nombre,
      apellidos,
      telefono,
      foto_url,
      comprobante_seguro_url,
      comprobante_seguro,
      seguro_imss_url,
      dc3_documento_url,
      dc3_url,
      dc3_documento,
      activo
    } = req.body;

    if (!id_empresa || !nombre || !apellidos) {
      return res.status(400).json({ error: 'id_empresa, nombre y apellidos son campos obligatorios' });
    }

    const optimizedFoto = foto_url ? await saveBase64Image(foto_url, 'trabajador') : null;
    const rawSeguro = comprobante_seguro_url || comprobante_seguro || seguro_imss_url || null;
    const seguroDoc = rawSeguro ? await saveBase64Image(rawSeguro, 'seguro_imss') : null;
    const rawDc3 = dc3_documento_url || dc3_url || dc3_documento || null;
    const dc3Doc = rawDc3 ? await saveBase64Image(rawDc3, 'dc3_documento') : null;

    const nuevo = await db.Trabajador.create({
      id_empresa,
      nombre,
      apellidos,
      telefono: telefono || null,
      foto_url: optimizedFoto,
      comprobante_seguro_url: seguroDoc,
      dc3_documento_url: dc3Doc,
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
    const {
      nombre,
      apellidos,
      telefono,
      foto_url,
      comprobante_seguro_url,
      comprobante_seguro,
      seguro_imss_url,
      dc3_documento_url,
      dc3_url,
      dc3_documento,
      activo
    } = req.body;
    const trabajador = await db.Trabajador.findByPk(req.params.id);

    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    if (nombre !== undefined) trabajador.nombre = nombre;
    if (apellidos !== undefined) trabajador.apellidos = apellidos;
    if (telefono !== undefined) trabajador.telefono = telefono;
    if (foto_url !== undefined) {
      trabajador.foto_url = foto_url ? await saveBase64Image(foto_url, 'trabajador') : null;
    }
    if (comprobante_seguro_url !== undefined || comprobante_seguro !== undefined || seguro_imss_url !== undefined) {
      const rawSeguro = comprobante_seguro_url || comprobante_seguro || seguro_imss_url || null;
      if (rawSeguro && !String(rawSeguro).startsWith('/api/trabajadores/')) {
        trabajador.comprobante_seguro_url = await saveBase64Image(rawSeguro, 'seguro_imss');
      } else if (!rawSeguro) {
        trabajador.comprobante_seguro_url = null;
      }
    }
    if (dc3_documento_url !== undefined || dc3_url !== undefined || dc3_documento !== undefined) {
      const rawDc3 = dc3_documento_url || dc3_url || dc3_documento || null;
      if (rawDc3 && !String(rawDc3).startsWith('/api/trabajadores/')) {
        trabajador.dc3_documento_url = await saveBase64Image(rawDc3, 'dc3_documento');
      } else if (!rawDc3) {
        trabajador.dc3_documento_url = null;
      }
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

// DELETE /api/trabajadores/:id - Eliminar trabajador permanentemente
router.delete('/:id', async (req, res) => {
  try {
    const trabajador = await db.Trabajador.findByPk(req.params.id);
    if (!trabajador) {
      return res.json({ message: 'El trabajador ya no existe o fue eliminado previamente', id_trabajador: req.params.id });
    }

    // 1. Desvincular referencias de conductor en la bitácora de accesos
    await db.BitacoraAcceso.update({ id_conductor: null }, { where: { id_conductor: req.params.id } }).catch(() => {});

    await trabajador.destroy();
    res.json({ message: 'Trabajador eliminado permanentemente de la base de datos', id_trabajador: req.params.id });
  } catch (error) {
    console.error('Error al eliminar trabajador:', error);
    res.status(500).json({ error: 'Error al eliminar el trabajador', details: error.message });
  }
});

module.exports = router;

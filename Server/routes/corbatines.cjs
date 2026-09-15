const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models/index.cjs');

// Helper para normalizar el formato de respuesta del corbatín
function formatCorbatin(c) {
  const plain = c.get ? c.get({ plain: true }) : c;
  const idStr = String(plain.id_corbatin || plain.id_corbatines || plain.id);
  const numStr = String(plain.numero || '').padStart(3, '0');
  const tipoVal = (plain.tipos || plain.tipo || 'NORMAL').toUpperCase();

  return {
    ...plain,
    id: idStr,
    id_corbatin: plain.id_corbatin || plain.id_corbatines || plain.id,
    id_corbatines: plain.id_corbatin || plain.id_corbatines || plain.id,
    tipos: tipoVal,
    tipo: tipoVal,
    corbatinNum: numStr,
    numero: plain.numero,
    empresaNombre: plain.empresa_nombre || plain.vehiculo?.empresa?.razon_social || plain.empresaNombre || '',
    telefono: plain.telefono || plain.vehiculo?.empresa?.telefono || '',
    email: plain.email || plain.vehiculo?.empresa?.correo || '',
    fechaEmision: plain.fecha_emision ? new Date(plain.fecha_emision).toISOString().split('T')[0] : '',
    fechaVencimiento: plain.fecha_vencimiento ? new Date(plain.fecha_vencimiento).toISOString().split('T')[0] : '',
    vigenciaTexto: plain.vigencia_texto || '6 Meses',
    activo: plain.activo !== false && plain.estatus !== 'CANCELADO' && plain.estatus !== 'DESHABILITADO',
    notas: plain.notas || plain.motivo_cancelacion || '',
    creadoPor: plain.creado_por || 'Supervisor HOA'
  };
}

// GET /api/corbatines - Listar todos los corbatines (soporta filtro ?tipos=VERDE o ?tipos=NORMAL)
router.get('/', async (req, res) => {
  try {
    const { tipo, tipos, activo, estatus } = req.query;
    const tipoFiltro = (tipos || tipo || '').toUpperCase();
    const where = {};

    if (tipoFiltro) {
      where[Op.or] = [
        { tipos: tipoFiltro },
        { tipos: tipoFiltro.toLowerCase() }
      ];
    }

    if (activo !== undefined) {
      where.activo = activo === 'true' || activo === true;
    }

    if (estatus) {
      where.estatus = estatus;
    }

    const corbatines = await db.Corbatin.findAll({
      where,
      include: [
        {
          model: db.Vehiculo,
          as: 'vehiculo',
          required: false,
          include: [{ model: db.Empresa, as: 'empresa', required: false }]
        }
      ],
      order: [['numero', 'ASC']]
    });

    const resultado = corbatines.map(formatCorbatin);
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener corbatines:', error);
    res.status(500).json({ error: 'Error al consultar corbatines', details: error.message });
  }
});

// GET /api/corbatines/:id - Obtener corbatín por ID
router.get('/:id', async (req, res) => {
  try {
    const corbatin = await db.Corbatin.findByPk(req.params.id, {
      include: [
        {
          model: db.Vehiculo,
          as: 'vehiculo',
          required: false,
          include: [{ model: db.Empresa, as: 'empresa', required: false }]
        }
      ]
    });

    if (!corbatin) {
      return res.status(404).json({ error: 'Corbatín no encontrado' });
    }

    res.json(formatCorbatin(corbatin));
  } catch (error) {
    console.error('Error al obtener corbatín:', error);
    res.status(500).json({ error: 'Error al consultar corbatín', details: error.message });
  }
});

// POST /api/corbatines - Crear uno o varios corbatines (Normales o Verdes)
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const items = Array.isArray(body) ? body : (body.items || body.corbatines ? (body.items || body.corbatines) : [body]);

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No se enviaron datos de corbatines a registrar' });
    }

    const creados = [];

    for (const item of items) {
      const tipo = (item.tipos || item.tipo || (item.empresaNombre || item.empresa_nombre ? 'VERDE' : 'NORMAL')).toUpperCase();
      let numeroInt = parseInt(item.numero || item.corbatinNum, 10);

      if (isNaN(numeroInt)) {
        const existingRecords = await db.Corbatin.findAll({
          where: { tipos: tipo },
          attributes: ['numero']
        });
        const existingSet = new Set(existingRecords.map(r => parseInt(r.numero, 10)).filter(n => !isNaN(n) && n > 0));
        let next = 1;
        while (existingSet.has(next)) {
          next++;
        }
        numeroInt = next;
      }

      const numFormatted = String(numeroInt).padStart(3, '0');
      const empresaNom = item.empresaNombre || item.empresa_nombre || item.empresa || '';
      const telefono = item.telefono || '';
      const email = item.email || '';
      const vigenciaTexto = item.vigenciaTexto || item.vigencia_texto || '6 Meses';
      const creadoPor = item.creadoPor || item.creado_por || 'Supervisor HOA';
      const notas = item.notas || '';
      const activo = item.activo !== undefined ? item.activo : true;
      const estatus = item.estatus || (activo ? 'ACTIVO' : 'DESHABILITADO');

      // Generar token QR
      const qrToken = item.qr_token || (
        tipo === 'VERDE'
          ? `LP-HOA|CORB-VERDE:${numFormatted}|EMP:${empresaNom}|TEL:${telefono}|VIG:${vigenciaTexto}`
          : `LP-HOA|CORB:${numFormatted}|FECHA:${new Date().getFullYear()}`
      );

      // Calcular fechas
      const fechaEmision = item.fechaEmision || item.fecha_emision ? new Date(item.fechaEmision || item.fecha_emision) : new Date();
      let fechaVencimiento = item.fechaVencimiento || item.fecha_vencimiento ? new Date(item.fechaVencimiento || item.fecha_vencimiento) : null;
      
      if (!fechaVencimiento) {
        let months = 6;
        if (vigenciaTexto === '1 Mes') months = 1;
        else if (vigenciaTexto === '3 Meses') months = 3;
        else if (vigenciaTexto === '6 Meses') months = 6;
        else if (vigenciaTexto === '1 Año') months = 12;
        fechaVencimiento = new Date(fechaEmision);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + months);
      }

      const nuevo = await db.Corbatin.create({
        id_vehiculo: item.id_vehiculo || null,
        tipos: tipo,
        numero: numeroInt,
        qr_token: qrToken,
        fecha_emision: fechaEmision,
        fecha_vencimiento: fechaVencimiento,
        estatus,
        empresa_nombre: empresaNom,
        telefono,
        email,
        vigencia_texto: vigenciaTexto,
        notas,
        creado_por: creadoPor,
        activo
      });

      creados.push(formatCorbatin(nuevo));
    }

    if (creados.length === 1 && !Array.isArray(body) && !body.items && !body.corbatines) {
      return res.status(201).json(creados[0]);
    }

    res.status(201).json({
      message: `${creados.length} corbatín(es) registrado(s) exitosamente`,
      corbatines: creados
    });
  } catch (error) {
    console.error('Error al registrar corbatín(es):', error);
    res.status(500).json({ error: 'Error al registrar corbatín(es)', details: error.message });
  }
});

// PUT /api/corbatines/:id - Actualizar corbatín (activo, estatus, notas, etc.)
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const corbatin = await db.Corbatin.findByPk(id);

    if (!corbatin) {
      return res.status(404).json({ error: 'Corbatín no encontrado' });
    }

    const {
      activo,
      estatus,
      motivo_cancelacion,
      notas,
      empresaNombre,
      empresa_nombre,
      telefono,
      email,
      vigenciaTexto,
      vigencia_texto,
      fechaVencimiento,
      fecha_vencimiento,
      fecha_impresion,
      tipo,
      tipos
    } = req.body;

    const updates = {};
    if (activo !== undefined) updates.activo = Boolean(activo);
    if (estatus !== undefined) updates.estatus = estatus;
    if (motivo_cancelacion !== undefined) updates.motivo_cancelacion = motivo_cancelacion;
    if (notas !== undefined) updates.notas = notas;
    if (empresaNombre !== undefined || empresa_nombre !== undefined) updates.empresa_nombre = empresaNombre || empresa_nombre;
    if (telefono !== undefined) updates.telefono = telefono;
    if (email !== undefined) updates.email = email;
    if (vigenciaTexto !== undefined || vigencia_texto !== undefined) updates.vigencia_texto = vigenciaTexto || vigencia_texto;
    if (fechaVencimiento !== undefined || fecha_vencimiento !== undefined) updates.fecha_vencimiento = new Date(fechaVencimiento || fecha_vencimiento);
    if (fecha_impresion !== undefined) updates.fecha_impresion = new Date(fecha_impresion);
    if (tipos !== undefined || tipo !== undefined) updates.tipos = (tipos || tipo).toUpperCase();

    // Sincronizar estatus si se activa/desactiva
    if (activo !== undefined && estatus === undefined) {
      updates.estatus = activo ? 'ACTIVO' : 'DESHABILITADO';
    }

    await corbatin.update(updates);
    const updated = await db.Corbatin.findByPk(id);
    res.json(formatCorbatin(updated));
  } catch (error) {
    console.error('Error al actualizar corbatín:', error);
    res.status(500).json({ error: 'Error al actualizar corbatín', details: error.message });
  }
});

// DELETE /api/corbatines/:id - Eliminar corbatín
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const corbatin = await db.Corbatin.findByPk(id);

    if (!corbatin) {
      return res.status(404).json({ error: 'Corbatín no encontrado' });
    }

    await corbatin.destroy();
    res.json({ message: `Corbatín #${corbatin.numero} eliminado exitosamente`, id });
  } catch (error) {
    console.error('Error al eliminar corbatín:', error);
    res.status(500).json({ error: 'Error al eliminar corbatín', details: error.message });
  }
});

module.exports = router;

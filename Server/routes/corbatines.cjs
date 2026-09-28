const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models/index.cjs');

// Helper de Formato Estricto para Corbatín Verde: Prefijo '00' obligatorio (001...009, 0010...0020)
function formatCorbatinVerdeNum(num) {
  const clean = parseInt(String(num || '').replace(/[^0-9]/g, ''), 10);
  if (isNaN(clean) || clean <= 0) return '001';
  return `00${clean}`;
}

// Helper para normalizar el formato de respuesta del corbatín
function formatCorbatin(c) {
  const plain = c.get ? c.get({ plain: true }) : c;
  const idStr = String(plain.id_corbatin || plain.id_corbatines || plain.id);
  const tipoVal = (plain.tipos || plain.tipo || 'NORMAL').toUpperCase();
  const cleanNum = parseInt(String(plain.numero || '').replace(/[^0-9]/g, ''), 10);
  const numStr = tipoVal === 'VERDE'
    ? formatCorbatinVerdeNum(cleanNum)
    : String(plain.numero || '').padStart(3, '0');

  const empNom = plain.empresa_nombre || plain.vehiculo?.empresa?.razon_social || plain.empresaNombre || '';
  const hasEmpresa = Boolean(empNom && empNom.trim());
  const fechaVenc = plain.fecha_vencimiento ? new Date(plain.fecha_vencimiento) : null;
  const isExpired = fechaVenc ? (fechaVenc.getTime() < new Date().setHours(0, 0, 0, 0)) : false;

  let estatusInventario = 'DISPONIBLE';
  if (plain.activo === false || plain.estatus === 'DESHABILITADO' || plain.estatus === 'CANCELADO') {
    estatusInventario = 'INACTIVO';
  } else if (hasEmpresa) {
    estatusInventario = isExpired ? 'VENCIDO' : 'ASIGNADO';
  } else {
    estatusInventario = 'DISPONIBLE';
  }

  const veh = plain.vehiculo ? {
    ...plain.vehiculo,
    foto_url: plain.vehiculo.foto_url || plain.vehiculo.foto || null,
    foto: plain.vehiculo.foto_url || plain.vehiculo.foto || null,
  } : null;

  return {
    ...plain,
    vehiculo: veh,
    id: idStr,
    id_corbatin: plain.id_corbatin || plain.id_corbatines || plain.id,
    id_corbatines: plain.id_corbatin || plain.id_corbatines || plain.id,
    id_empresa: plain.id_empresa || null,
    tipos: tipoVal,
    tipo: tipoVal,
    corbatinNum: numStr,
    numero: isNaN(cleanNum) ? 1 : cleanNum,
    estatus_inventario: estatusInventario,
    empresaNombre: empNom,
    telefono: plain.telefono || plain.vehiculo?.empresa?.telefono || '',
    email: plain.email || plain.vehiculo?.empresa?.correo || '',
    fechaEmision: plain.fecha_emision ? new Date(plain.fecha_emision).toISOString().split('T')[0] : '',
    fechaAsignacion: plain.fecha_asignacion ? new Date(plain.fecha_asignacion).toISOString().split('T')[0] : (hasEmpresa ? (plain.fecha_emision ? new Date(plain.fecha_emision).toISOString().split('T')[0] : '') : ''),
    fechaVencimiento: plain.fecha_vencimiento ? new Date(plain.fecha_vencimiento).toISOString().split('T')[0] : '',
    vigenciaTexto: plain.vigencia_texto || (hasEmpresa ? 'Temporal' : 'Disponible'),
    placasAsignadas: plain.placas_asignadas || '',
    conductorAsignado: plain.conductor_asignado || '',
    activo: plain.activo !== false && plain.estatus !== 'CANCELADO' && plain.estatus !== 'DESHABILITADO',
    notas: plain.notas || plain.motivo_cancelacion || '',
    creadoPor: plain.creado_por || 'Supervisor HOA',
    asignadoPor: plain.asignado_por || ''
  };
}

// Función auxiliar para inicializar el pool base de 20 corbatines verdes si no existen
async function asegurarPoolBaseVerdes() {
  try {
    const existentes = await db.Corbatin.findAll({
      where: {
        [Op.or]: [{ tipos: 'VERDE' }, { tipos: 'verde' }]
      }
    });

    const numerosExistentes = new Set(existentes.map(e => parseInt(e.numero, 10)).filter(n => !isNaN(n) && n > 0));

    // Si faltan números del 1 al 20, crearlos
    const toCreate = [];
    for (let i = 1; i <= 20; i++) {
      if (!numerosExistentes.has(i)) {
        const numFormatted = formatCorbatinVerdeNum(i);
        toCreate.push({
          id_vehiculo: null,
          tipos: 'VERDE',
          numero: i,
          qr_token: `LP-HOA|CORB-VERDE:${numFormatted}`,
          fecha_emision: new Date(),
          fecha_vencimiento: null,
          estatus: 'ACTIVO',
          empresa_nombre: '',
          telefono: '',
          email: '',
          vigencia_texto: 'Disponible',
          notas: 'Corbatín genérico del pool reutilizable',
          creado_por: 'Sistema HOA',
          activo: true
        });
      }
    }

    if (toCreate.length > 0) {
      await db.Corbatin.bulkCreate(toCreate);
    }
  } catch (err) {
    console.warn('Advertencia asegurando pool base de corbatines verdes:', err.message);
  }
}

// GET /api/corbatines - Listar todos los corbatines (soporta filtro ?tipos=VERDE o ?tipos=NORMAL)
router.get('/', async (req, res) => {
  try {
    const { tipo, tipos, activo, estatus, numero, id_vehiculo } = req.query;
    const tipoFiltro = (tipos || tipo || '').toUpperCase();
    const where = {};
    if (numero) where.numero = parseInt(numero, 10);
    if (id_vehiculo) where.id_vehiculo = id_vehiculo;

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

    // Auto-asegurar pool de 20 si se solicitan corbatines verdes
    if (tipoFiltro === 'VERDE') {
      const count = await db.Corbatin.count({
        where: { [Op.or]: [{ tipos: 'VERDE' }, { tipos: 'verde' }] }
      });
      if (count === 0) {
        await asegurarPoolBaseVerdes();
      }
    }

    const corbatines = await db.Corbatin.findAll({
      where,
      include: [
        {
          model: db.Vehiculo,
          as: 'vehiculo',
          attributes: ['id_vehiculo', 'id_empresa', 'placas', 'marca', 'modelo', 'color', 'año', 'foto_url', 'estatus_acceso'],
          required: false,
          include: [{ model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social', 'telefono', 'correo'], required: false }]
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

// POST /api/corbatines/verdes/inicializar-pool - Forzar inicialización de los 20 corbatines del pool
router.post('/verdes/inicializar-pool', async (req, res) => {
  try {
    await asegurarPoolBaseVerdes();
    const verdes = await db.Corbatin.findAll({
      where: { [Op.or]: [{ tipos: 'VERDE' }, { tipos: 'verde' }] },
      order: [['numero', 'ASC']]
    });
    res.json({
      message: 'Pool de 20 corbatines verdes verificado/inicializado exitosamente',
      corbatines: verdes.map(formatCorbatin)
    });
  } catch (error) {
    console.error('Error al inicializar pool de corbatines verdes:', error);
    res.status(500).json({ error: 'Error al inicializar pool', details: error.message });
  }
});

// GET /api/corbatines/:id - Obtener corbatín por ID o por Número
router.get('/:id', async (req, res) => {
  try {
    const param = req.params.id;
    let corbatin = await db.Corbatin.findByPk(param, {
      include: [
        {
          model: db.Vehiculo,
          as: 'vehiculo',
          required: false,
          include: [{ model: db.Empresa, as: 'empresa', required: false }]
        }
      ]
    });

    if (!corbatin && !isNaN(parseInt(param, 10))) {
      corbatin = await db.Corbatin.findOne({
        where: { numero: parseInt(param, 10) },
        include: [
          {
            model: db.Vehiculo,
            as: 'vehiculo',
            required: false,
            include: [{ model: db.Empresa, as: 'empresa', required: false }]
          }
        ]
      });
    }

    if (!corbatin) {
      return res.status(404).json({ error: 'Corbatín no encontrado' });
    }

    res.json(formatCorbatin(corbatin));
  } catch (error) {
    console.error('Error al obtener corbatín:', error);
    res.status(500).json({ error: 'Error al consultar corbatín', details: error.message });
  }
});

// POST /api/corbatines/:id/vincular - Vincular temporalmente corbatín verde a una empresa
router.post('/:id/vincular', async (req, res) => {
  try {
    const id = req.params.id;
    let corbatin = await db.Corbatin.findByPk(id);
    if (!corbatin && !isNaN(parseInt(id, 10))) {
      corbatin = await db.Corbatin.findOne({ where: { numero: parseInt(id, 10) } });
    }

    if (!corbatin) {
      return res.status(404).json({ error: 'Corbatín no encontrado' });
    }

    const {
      id_empresa,
      empresaNombre,
      empresa_nombre,
      telefono,
      email,
      vigenciaTexto,
      vigencia_texto,
      fechaVencimiento,
      fecha_vencimiento,
      fechaAsignacion,
      fecha_asignacion,
      placas,
      placasAsignadas,
      conductor,
      conductorAsignado,
      notas,
      asignadoPor,
      asignado_por
    } = req.body;

    const nombreFinal = empresaNombre || empresa_nombre;
    if (!nombreFinal || !nombreFinal.trim()) {
      return res.status(400).json({ error: 'El nombre de la empresa es obligatorio para la asignación.' });
    }

    const fechaAsig = fechaAsignacion || fecha_asignacion ? new Date(fechaAsignacion || fecha_asignacion) : new Date();
    let fechaVenc = fechaVencimiento || fecha_vencimiento ? new Date(fechaVencimiento || fecha_vencimiento) : null;
    const vigTexto = vigenciaTexto || vigencia_texto || 'Temporal';

    if (!fechaVenc) {
      let days = 30;
      if (vigTexto === '1 Día' || vigTexto === '1_dia') days = 1;
      else if (vigTexto === '1 Semana' || vigTexto === '1_semana') days = 7;
      else if (vigTexto === '15 Días' || vigTexto === '15_dias') days = 15;
      else if (vigTexto === '1 Mes' || vigTexto === '1_mes') days = 30;
      else if (vigTexto === '3 Meses' || vigTexto === '3_meses') days = 90;
      else if (vigTexto === '6 Meses' || vigTexto === '6_meses') days = 180;
      else if (vigTexto === '1 Año' || vigTexto === '1_ano') days = 365;

      fechaVenc = new Date(fechaAsig);
      fechaVenc.setDate(fechaVenc.getDate() + days);
    }

    const numFormatted = formatCorbatinVerdeNum(corbatin.numero);
    const updates = {
      empresa_nombre: nombreFinal.trim(),
      telefono: telefono || '',
      email: email || '',
      vigencia_texto: vigTexto,
      fecha_asignacion: fechaAsig,
      fecha_vencimiento: fechaVenc,
      notas: [notas || '', placas ? `Placas: ${placas}` : '', conductor ? `Chofer: ${conductor}` : ''].filter(Boolean).join(' | '),
      creado_por: asignadoPor || asignado_por || corbatin.creado_por || 'Supervisor HOA',
      estatus: 'ACTIVO',
      activo: true,
      qr_token: `LP-HOA|CORB-VERDE:${numFormatted}`
    };

    await corbatin.update(updates);
    const updated = await db.Corbatin.findByPk(corbatin.id_corbatin || corbatin.id);
    res.json({
      message: `Corbatín Verde #${numFormatted} vinculado exitosamente a ${nombreFinal}`,
      corbatin: formatCorbatin(updated)
    });
  } catch (error) {
    console.error('Error al vincular corbatín verde:', error);
    res.status(500).json({ error: 'Error al vincular corbatín', details: error.message });
  }
});

// POST /api/corbatines/:id/desvincular - Liberar corbatín verde para dejarlo disponible en inventario
router.post('/:id/desvincular', async (req, res) => {
  try {
    const id = req.params.id;
    let corbatin = await db.Corbatin.findByPk(id);
    if (!corbatin && !isNaN(parseInt(id, 10))) {
      corbatin = await db.Corbatin.findOne({ where: { numero: parseInt(id, 10) } });
    }

    if (!corbatin) {
      return res.status(404).json({ error: 'Corbatín no encontrado' });
    }

    const numFormatted = formatCorbatinVerdeNum(corbatin.numero);
    const empresaAnterior = corbatin.empresa_nombre || 'la empresa';

    await corbatin.update({
      empresa_nombre: '',
      telefono: '',
      email: '',
      vigencia_texto: 'Disponible',
      fecha_asignacion: null,
      fecha_vencimiento: null,
      notas: `Devuelto / Liberado el ${new Date().toISOString().split('T')[0]}. Anteriormente: ${empresaAnterior}`,
      estatus: 'ACTIVO',
      activo: true,
      qr_token: `LP-HOA|CORB-VERDE:${numFormatted}`
    });

    const updated = await db.Corbatin.findByPk(corbatin.id_corbatin || corbatin.id);
    res.json({
      message: `Corbatín Verde #${numFormatted} liberado y devuelto a Disponibles exitosamente`,
      corbatin: formatCorbatin(updated)
    });
  } catch (error) {
    console.error('Error al desvincular corbatín verde:', error);
    res.status(500).json({ error: 'Error al desvincular corbatín', details: error.message });
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

      const numFormatted = tipo === 'VERDE'
        ? formatCorbatinVerdeNum(numeroInt)
        : String(numeroInt).padStart(3, '0');
      const empresaNom = item.empresaNombre || item.empresa_nombre || item.empresa || '';
      const telefono = item.telefono || '';
      const email = item.email || '';
      const vigenciaTexto = item.vigenciaTexto || item.vigencia_texto || (empresaNom ? '6 Meses' : 'Disponible');
      const creadoPor = item.creadoPor || item.creado_por || 'Supervisor HOA';
      const notas = item.notas || '';
      const activo = item.activo !== undefined ? item.activo : true;
      const estatus = item.estatus || (activo ? 'ACTIVO' : 'DESHABILITADO');

      // Generar token QR
      const qrToken = item.qr_token || (
        tipo === 'VERDE'
          ? `LP-HOA|CORB-VERDE:${numFormatted}`
          : `LP-HOA|CORB:${numFormatted}|FECHA:${new Date().getFullYear()}`
      );

      // Calcular fechas
      const fechaEmision = item.fechaEmision || item.fecha_emision ? new Date(item.fechaEmision || item.fecha_emision) : new Date();
      let fechaVencimiento = item.fechaVencimiento || item.fecha_vencimiento ? new Date(item.fechaVencimiento || item.fecha_vencimiento) : null;
      
      if (!fechaVencimiento && empresaNom) {
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
    if (fechaVencimiento !== undefined || fecha_vencimiento !== undefined) {
      updates.fecha_vencimiento = (fechaVencimiento || fecha_vencimiento) ? new Date(fechaVencimiento || fecha_vencimiento) : null;
    }
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


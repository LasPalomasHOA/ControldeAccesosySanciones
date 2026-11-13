const express = require('express');
const router = express.Router();
const db = require('../models/index.cjs');

// Obtener las columnas reales existentes en la tabla "visitantes"
async function getVisitantesColumns(schema) {
  try {
    const [rows] = await db.sequelize.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = :schema AND table_name = 'visitantes'
    `, { replacements: { schema } });
    if (Array.isArray(rows) && rows.length > 0) {
      return new Set(rows.map(r => r.column_name.toLowerCase()));
    }
  } catch (e) { }
  return new Set(['nombre_conductor', 'marca', 'modelo', 'año', 'placas', 'color', 'corbatin_num', 'destino', 'pasajeros', 'observaciones', 'id_usuario', 'id_bitacora', 'fecha', 'hora_entrada', 'hora_salida', 'created_at', 'updated_at']);
}

// GET /api/visitantes - Listar todos los vehículos y accesos de visitantes registrados
router.get('/', async (req, res) => {
  try {
    const schema = process.env.DB_SCHEMA || 'control_acceso';

    // 1. Consultar tabla "visitantes" directamente
    let rawVisitantes = [];
    try {
      const [rows] = await db.sequelize.query(`
        SELECT * FROM "${schema}"."visitantes"
      `);
      rawVisitantes = rows || [];
    } catch (err) {
      console.warn('Nota al consultar tabla visitantes:', err.message);
    }

    // 2. Consultar bitácora para sincronizar registros de visitantes (como los ya registrados hoy)
    let rawBitacora = [];
    try {
      const [bRows] = await db.sequelize.query(`
        SELECT * FROM "${schema}"."bitacora_accesos"
        WHERE observaciones LIKE '%[VISITANTE]%' OR ubicacion_trabajo LIKE '%Visita%'
        ORDER BY id_acceso DESC
        LIMIT 200
      `);
      rawBitacora = bRows || [];
    } catch (bErr) {
      console.warn('Nota al consultar bitácora de visitantes:', bErr.message);
    }

    const registrosMap = new Map();

    // Incorporar primero los datos directos de la tabla "visitantes"
    for (const v of rawVisitantes) {
      const pl = String(v.placas || '').trim().toUpperCase();
      const corb = Number(v.corbatin_num || 1);
      const f = v.fecha ? String(v.fecha).split('T')[0] : '';
      const key = `${pl}_${corb}_${f}`;

      let salidaSync = v.hora_salida;
      let bitacoraIdSync = v.id_bitacora;

      // Si no tiene hora_salida o id_bitacora en visitantes, sincronizar desde bitácora
      if ((!salidaSync || !bitacoraIdSync) && rawBitacora.length > 0) {
        const bMatch = rawBitacora.find(b => 
          (bitacoraIdSync && Number(b.id_acceso) === Number(bitacoraIdSync)) ||
          (pl && b.observaciones && b.observaciones.includes(pl))
        );
        if (bMatch) {
          if (!bitacoraIdSync && bMatch.id_acceso) {
            bitacoraIdSync = bMatch.id_acceso;
          }
          if (!salidaSync && bMatch.hora_salida) {
            salidaSync = bMatch.hora_salida;
          }
          // Persistir actualización en la BD en segundo plano
          db.sequelize.query(`
            UPDATE "${schema}"."visitantes"
            SET "hora_salida" = COALESCE("hora_salida", :hora),
                "id_bitacora" = COALESCE("id_bitacora", :id_bitacora)
            WHERE "id" = :visId;
          `, { 
            replacements: { 
              hora: salidaSync || null, 
              id_bitacora: bitacoraIdSync || null, 
              visId: v.id 
            } 
          }).catch(() => {});
        }
      }

      registrosMap.set(key, {
        id: String(v.id || Math.random()),
        id_bitacora: bitacoraIdSync || null,
        id_usuario: v.id_usuario || null,
        nombre_conductor: v.nombre_conductor || v.chofer || 'Visitante',
        marca: v.marca || '',
        modelo: v.modelo || '',
        año: v.año || v.anio || '',
        anio: v.año || v.anio || '',
        placas: pl,
        color: v.color || '',
        corbatin_num: corb,
        destino: v.destino || 'Visita general',
        pasajeros: Number(v.pasajeros || 0),
        observaciones: v.observaciones || '',
        fecha: f,
        hora_entrada: v.hora_entrada,
        hora_salida: salidaSync,
        estado: salidaSync ? 'Salida Registrada' : 'Dentro',
        guardiaNombre: 'Oficial en Caseta'
      });
    }

    // Incorporar de la bitácora los que aún no estén en el mapa
    for (const b of rawBitacora) {
      const obs = b.observaciones || '';
      const mChofer = obs.match(/Chofer:\s*([^|\]]+)/i);
      const mMarca = obs.match(/Marca:\s*([^|\]]+)/i);
      const mModelo = obs.match(/Modelo:\s*([^|\]]+)/i);
      const mAnio = obs.match(/A[ñn]o:\s*([^|\]]+)/i);
      const mPlacas = obs.match(/Placas:\s*([^|\]]+)/i);
      const mColor = obs.match(/Color:\s*([^|\]]+)/i);
      const mCorb = obs.match(/Corbat[íi]n:\s*#?([0-9]+)/i);
      const mDestino = obs.match(/Destino:\s*([^|\]]+)/i);

      const pl = (mPlacas ? mPlacas[1].trim() : (b.vehiculo_placas || '')).toUpperCase();
      const corb = mCorb ? parseInt(mCorb[1], 10) : 1;
      const f = b.fecha ? String(b.fecha).split('T')[0] : (b.hora_entrada ? new Date(b.hora_entrada).toISOString().split('T')[0] : '');
      const key = `${pl}_${corb}_${f}`;

      if (!registrosMap.has(key)) {
        registrosMap.set(key, {
          id: String(b.id_acceso),
          id_bitacora: b.id_acceso,
          nombre_conductor: mChofer ? mChofer[1].trim() : 'Visitante',
          marca: mMarca ? mMarca[1].trim() : '',
          modelo: mModelo ? mModelo[1].trim() : '',
          año: mAnio ? mAnio[1].trim() : '',
          anio: mAnio ? mAnio[1].trim() : '',
          placas: pl,
          color: mColor ? mColor[1].trim() : '',
          corbatin_num: corb,
          destino: mDestino ? mDestino[1].trim() : (b.ubicacion_trabajo || 'Visita general'),
          pasajeros: Number(b.num_pasajeros || 0),
          observaciones: obs,
          fecha: f,
          hora_entrada: b.hora_entrada,
          hora_salida: b.hora_salida,
          estado: b.hora_salida ? 'Salida Registrada' : 'Dentro',
          guardiaNombre: 'Oficial en Caseta'
        });
      }
    }

    const resultado = Array.from(registrosMap.values());
    resultado.sort((a, b) => {
      const tA = a.hora_entrada ? new Date(a.hora_entrada).getTime() : 0;
      const tB = b.hora_entrada ? new Date(b.hora_entrada).getTime() : 0;
      return tB - tA;
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al consultar visitantes:', error);
    res.status(500).json({ error: 'Error al consultar lista de visitantes', details: error.message });
  }
});

// POST /api/visitantes - Registrar vehículo visitante
router.post('/', async (req, res) => {
  try {
    const schema = process.env.DB_SCHEMA || 'control_acceso';

    const {
      nombre_conductor,
      marca,
      modelo,
      año,
      anio,
      placas,
      color,
      corbatin_num,
      destino,
      pasajeros,
      observaciones,
      id_usuario,
      id_bitacora
    } = req.body;

    if (!nombre_conductor || !marca || !modelo || !placas || !corbatin_num) {
      return res.status(400).json({
        error: 'Nombre del chofer, marca, modelo, placas y número de corbatín son obligatorios.'
      });
    }

    const ahora = new Date();
    const hoyFecha = ahora.toISOString().split('T')[0];
    const numCorb = parseInt(corbatin_num, 10);

    // Validación diaria: si ya se usó hoy (con o sin salida), no se puede reusar hasta mañana
    try {
      const [rowsUsado] = await db.sequelize.query(`
        SELECT id FROM "${schema}"."visitantes"
        WHERE corbatin_num = :corb AND fecha = :fecha
        LIMIT 1
      `, { replacements: { corb: numCorb, fecha: hoyFecha } }).catch(() => [[]]);

      if (rowsUsado && rowsUsado.length > 0) {
        return res.status(400).json({
          error: `El Corbatín #${numCorb} ya fue utilizado hoy (${hoyFecha}). No puede reutilizarse el mismo día para evitar duplicidad.`
        });
      }
    } catch (chkErr) { }

    const anioFinal = String(año || anio || '').trim();
    const choferFinal = String(nombre_conductor).trim();
    const marcaFinal = String(marca).trim();
    const modeloFinal = String(modelo).trim();
    const placasFinal = String(placas).trim().toUpperCase();
    const colorFinal = String(color || '').trim();
    const destinoFinal = destino ? String(destino).trim() : null;
    const pasajerosFinal = pasajeros !== undefined && pasajeros !== null ? Math.max(0, Number(pasajeros)) : 0;
    const obsFinal = observaciones ? String(observaciones).trim() : null;

    let finalBitacoraId = id_bitacora ? Number(id_bitacora) : null;

    // Si aún no tiene id_bitacora, crearlo también en BitacoraAcceso
    if (!finalBitacoraId) {
      try {
        const obsBitacora = `[VISITANTE] Chofer: ${choferFinal} | Marca: ${marcaFinal} | Modelo: ${modeloFinal} | Año: ${anioFinal || "S/A"} | Placas: ${placasFinal} | Color: ${colorFinal || "S/C"} | Corbatín: #${numCorb} | Destino: ${destinoFinal || "Visita general"}${obsFinal ? ` | Obs: ${obsFinal}` : ""}`;
        const nuevoAcceso = await db.BitacoraAcceso.create({
          id_caseta: 1,
          id_vehiculo: null,
          id_corbatin: null,
          id_conductor: null,
          id_usuario: 1,
          num_pasajeros: pasajerosFinal,
          fecha: hoyFecha,
          hora_entrada: ahora,
          hora_salida: null,
          ubicacion_trabajo: `Visita a: ${destinoFinal || "Residencia / Complejo"}`,
          estatus_acceso: 'AUTORIZADO',
          observaciones: obsBitacora
        });
        if (nuevoAcceso?.id_acceso) {
          finalBitacoraId = Number(nuevoAcceso.id_acceso);
        }
      } catch (bitErr) {
        console.warn('Nota: creación en bitácora secundaria:', bitErr.message);
      }
    }

    // Inserción dinámica que sólo usa las columnas existentes en "visitantes"
    const existingCols = await getVisitantesColumns(schema);
    const insertCols = [];
    const insertVals = [];
    const replacements = {};

    function addCol(colName, val) {
      if (existingCols.has(colName.toLowerCase())) {
        insertCols.push(`"${colName}"`);
        insertVals.push(`:${colName}`);
        replacements[colName] = val;
      }
    }

    addCol('nombre_conductor', choferFinal);
    addCol('marca', marcaFinal);
    addCol('modelo', modeloFinal);
    if (existingCols.has('año')) {
      addCol('año', anioFinal);
    } else if (existingCols.has('anio')) {
      addCol('anio', anioFinal);
    }
    addCol('placas', placasFinal);
    addCol('color', colorFinal);
    addCol('corbatin_num', numCorb);
    addCol('destino', destinoFinal);
    addCol('pasajeros', pasajerosFinal);
    addCol('observaciones', obsFinal);
    addCol('fecha', hoyFecha);
    addCol('hora_entrada', ahora);

    if (existingCols.has('id_usuario') && id_usuario) {
      addCol('id_usuario', Number(id_usuario));
    }
    if (existingCols.has('id_bitacora') && finalBitacoraId) {
      addCol('id_bitacora', finalBitacoraId);
    }
    if (existingCols.has('created_at')) {
      insertCols.push('"created_at"');
      insertVals.push('NOW()');
    }
    if (existingCols.has('updated_at')) {
      insertCols.push('"updated_at"');
      insertVals.push('NOW()');
    }

    let nuevoVisitante = null;
    try {
      const sql = `
        INSERT INTO "${schema}"."visitantes" (${insertCols.join(', ')})
        VALUES (${insertVals.join(', ')})
        RETURNING *;
      `;
      const [insertResult] = await db.sequelize.query(sql, { replacements });
      if (insertResult && insertResult[0]) {
        nuevoVisitante = insertResult[0];
      }
    } catch (insertErr) {
      console.warn('Nota al insertar en tabla visitantes:', insertErr.message);
    }

    res.status(201).json(nuevoVisitante || {
      id: finalBitacoraId || Date.now(),
      nombre_conductor: choferFinal,
      marca: marcaFinal,
      modelo: modeloFinal,
      año: anioFinal,
      placas: placasFinal,
      color: colorFinal,
      corbatin_num: numCorb,
      destino: destinoFinal,
      hora_entrada: ahora
    });
  } catch (error) {
    console.error('Error al registrar visitante:', error);
    res.status(500).json({ error: 'Error al registrar visitante en la base de datos', details: error.message });
  }
});

// PUT /api/visitantes/:id/salida - Registrar salida de visitante
router.put('/:id/salida', async (req, res) => {
  try {
    const ahora = new Date();
    const schema = process.env.DB_SCHEMA || 'control_acceso';
    const targetId = req.params.id;
    const numId = (!isNaN(Number(targetId))) ? Number(targetId) : null;

    let rowVisitante = null;

    // 1. Actualizar salida en tabla "visitantes" (buscando por id primario o id_bitacora)
    if (numId !== null) {
      try {
        const [updated] = await db.sequelize.query(`
          UPDATE "${schema}"."visitantes"
          SET "hora_salida" = :hora
          WHERE ("id" = :numId OR "id_bitacora" = :numId)
          RETURNING *;
        `, { replacements: { hora: ahora, numId } });
        if (updated && updated.length > 0) {
          rowVisitante = updated[0];
        }
      } catch (uErr) {
        console.warn('Nota al actualizar tabla visitantes por ID:', uErr.message);
      }
    }

    // Si aún no se encontró, intentar por placa si targetId la contiene
    if (!rowVisitante && targetId) {
      try {
        const [byPlaca] = await db.sequelize.query(`
          UPDATE "${schema}"."visitantes"
          SET "hora_salida" = :hora
          WHERE "placas" = :placa AND "hora_salida" IS NULL
          RETURNING *;
        `, { replacements: { hora: ahora, placa: String(targetId).toUpperCase() } });
        if (byPlaca && byPlaca.length > 0) {
          rowVisitante = byPlaca[0];
        }
      } catch (pErr) {}
    }

    // 2. Actualizar salida en "bitacora_accesos"
    const idBitacora = rowVisitante?.id_bitacora || numId;
    if (idBitacora) {
      await db.sequelize.query(`
        UPDATE "${schema}"."bitacora_accesos"
        SET "hora_salida" = :hora, "estatus_acceso" = 'SALIDA'
        WHERE "id_acceso" = :idBitacora AND "hora_salida" IS NULL;
      `, { replacements: { hora: ahora, idBitacora } }).catch(() => {});
    }

    // 3. Si el registro en visitantes tenía id_bitacora en NULL, intentar enlazarlo con bitácora abierta
    if (rowVisitante && !rowVisitante.id_bitacora && rowVisitante.placas) {
      try {
        const [bitMatch] = await db.sequelize.query(`
          UPDATE "${schema}"."bitacora_accesos"
          SET "hora_salida" = :hora, "estatus_acceso" = 'SALIDA'
          WHERE "hora_salida" IS NULL AND "observaciones" LIKE :placaPat
          RETURNING id_acceso;
        `, { replacements: { hora: ahora, placaPat: `%${rowVisitante.placas}%` } });

        if (bitMatch && bitMatch.length > 0 && bitMatch[0]?.id_acceso) {
          await db.sequelize.query(`
            UPDATE "${schema}"."visitantes"
            SET "id_bitacora" = :idAcceso
            WHERE "id" = :visId;
          `, { replacements: { idAcceso: bitMatch[0].id_acceso, visId: rowVisitante.id } });
        }
      } catch (linkErr) {}
    }

    res.json({ id: targetId, hora_salida: ahora, estado: 'Salida Registrada' });
  } catch (error) {
    console.error('Error al registrar salida de visitante:', error);
    res.status(500).json({ error: 'Error al registrar salida de visitante', details: error.message });
  }
});

module.exports = router;

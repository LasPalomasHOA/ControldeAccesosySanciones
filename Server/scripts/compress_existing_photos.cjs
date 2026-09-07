const sharp = require('sharp');
const db = require('../models/index.cjs');

async function compressBase64(base64Str, maxWidth = 500, quality = 70) {
  if (!base64Str || typeof base64Str !== 'string') return base64Str;
  const match = base64Str.match(/^data:([A-Za-z0-9\-+/]+);base64,(.+)$/);
  let buffer;
  if (match) {
    buffer = Buffer.from(match[2], 'base64');
  } else if (base64Str.length > 500 && !base64Str.startsWith('http') && !base64Str.startsWith('/')) {
    try {
      buffer = Buffer.from(base64Str, 'base64');
    } catch {
      return base64Str;
    }
  } else {
    return base64Str;
  }

  if (buffer.length <= 40 * 1024) {
    console.log(`  Imagen ya es pequeña (${(buffer.length / 1024).toFixed(1)} KB), se omite.`);
    return base64Str;
  }

  const originalSize = buffer.length;
  try {
    const compressedBuffer = await sharp(buffer)
      .resize({ width: maxWidth, height: maxWidth, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    const newBase64 = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
    console.log(`  Comprimida de ${(originalSize / 1024).toFixed(1)} KB -> ${(compressedBuffer.length / 1024).toFixed(1)} KB (Ahorro: ${(100 - (compressedBuffer.length / originalSize * 100)).toFixed(1)}%)`);
    return newBase64;
  } catch (err) {
    console.warn(`  Aviso al comprimir: ${err.message}`);
    return base64Str;
  }
}

async function run() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conectado a la base de datos Supabase.');

    // 1. Trabajadores
    console.log('\n--- Optimizando fotos de Trabajadores ---');
    const trabajadores = await db.Trabajador.findAll();
    for (const t of trabajadores) {
      if (t.foto_url && t.foto_url.length > 500) {
        console.log(`Trabajador: ${t.nombre} ${t.apellidos} (ID: ${t.id_trabajador})`);
        const opt = await compressBase64(t.foto_url, 480, 70);
        if (opt !== t.foto_url) {
          await t.update({ foto_url: opt });
        }
      }
    }

    // 2. Vehículos
    console.log('\n--- Optimizando fotos de Vehículos ---');
    const vehiculos = await db.Vehiculo.findAll();
    for (const v of vehiculos) {
      if (v.foto_url && v.foto_url.length > 500) {
        console.log(`Vehículo: ${v.marca} ${v.modelo} - Placas: ${v.placas} (ID: ${v.id_vehiculo})`);
        const opt = await compressBase64(v.foto_url, 600, 70);
        if (opt !== v.foto_url) {
          await v.update({ foto_url: opt });
        }
      }
    }

    // 3. Usuarios
    console.log('\n--- Optimizando fotos de Usuarios ---');
    const usuarios = await db.Usuario.findAll();
    for (const u of usuarios) {
      if (u.foto_url && u.foto_url.length > 500) {
        console.log(`Usuario: ${u.nombre} (ID: ${u.id_usuario})`);
        const opt = await compressBase64(u.foto_url, 400, 70);
        if (opt !== u.foto_url) {
          await u.update({ foto_url: opt });
        }
      }
    }

    console.log('\n✅ Migración de compresión completada con éxito.');
  } catch (e) {
    console.error('Error durante la migración:', e);
  } finally {
    await db.sequelize.close();
  }
}

run();

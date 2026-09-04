const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/index.cjs');
const { saveBase64Image } = require('../utils/imageHandler.cjs');

// POST /api/usuarios/login - Autenticación con contraseña cifrada (bcrypt)
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await db.Usuario.findOne({
      where: { correo, activo: true },
      include: [
        { model: db.Rol, as: 'rol' },
        { model: db.Empresa, as: 'empresa' }
      ]
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
    }

    // Comprobar contraseña con bcrypt (o fallback si fue texto plano)
    const esValida = usuario.password_hash.startsWith('$2')
      ? bcrypt.compareSync(password, usuario.password_hash)
      : (usuario.password_hash === password);

    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
    }

    const plain = usuario.get({ plain: true });
    delete plain.password_hash;
    
    // Normalizar rol
    const rolMap = {
      'ADMINISTRADOR': 'admin',
      'SUPERVISOR': 'supervisor',
      'AGENTE': 'guardia',
      'CASETA': 'guardia',
      'PROVEEDOR': 'proveedor'
    };

    res.json({
      ...plain,
      id: String(plain.id_usuario),
      rol: rolMap[plain.rol?.nombre] || plain.rol?.nombre?.toLowerCase() || 'admin',
      rolNombre: plain.rol?.nombre,
      empresaNombre: plain.empresa?.razon_social || '',
      foto_url: plain.foto_url || null,
      avatar: plain.foto_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150`
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al procesar inicio de sesión', details: error.message });
  }
});

// GET /api/usuarios - Listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await db.Usuario.findAll({
      include: [
        { model: db.Rol, as: 'rol' },
        { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const rolMap = {
      'ADMINISTRADOR': 'admin',
      'SUPERVISOR': 'supervisor',
      'AGENTE': 'guardia',
      'CASETA': 'guardia',
      'PROVEEDOR': 'proveedor'
    };

    const resultado = usuarios.map(u => {
      const plain = u.get({ plain: true });
      delete plain.password_hash;
      return {
        ...plain,
        id: String(plain.id_usuario),
        rol: rolMap[plain.rol?.nombre] || plain.rol?.nombre?.toLowerCase() || 'admin',
        rolNombre: plain.rol?.nombre,
        empresaNombre: plain.empresa?.razon_social || '',
        foto_url: plain.foto_url || null,
        avatar: plain.foto_url || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150`
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al consultar usuarios', details: error.message });
  }
});

// POST /api/usuarios - Crear usuario con contraseña encriptada
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, password, password_hash, id_rol, id_empresa, rol, activo, foto_url } = req.body;
    if (!nombre || !correo) {
      return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
    }

    const emailNormalizado = correo.trim().toLowerCase();
    const existente = await db.Usuario.findOne({ where: { correo: emailNormalizado } });
    if (existente) {
      return res.status(409).json({ error: `El correo "${emailNormalizado}" ya está registrado en el sistema.` });
    }

    let finalIdRol = id_rol;
    if (!finalIdRol && rol) {
      const rolEncontrado = await db.Rol.findOne({ where: { nombre: rol.toUpperCase() } });
      if (rolEncontrado) finalIdRol = rolEncontrado.id_rol;
    }
    if (!finalIdRol) finalIdRol = 1;

    // Si es guardia de caseta (rol 4 o 'caseta'), la foto es obligatoria
    const esGuardia = finalIdRol === 4 || (rol && ['CASETA', 'AGENTE', 'GUARDIA'].includes(rol.toUpperCase()));
    if (esGuardia && !foto_url) {
      return res.status(400).json({ error: 'La fotografía del oficial de caseta es obligatoria.' });
    }

    const finalFotoUrl = foto_url || null;

    const rawPassword = password || password_hash || '123456';
    const hash = bcrypt.hashSync(rawPassword, 10);

    const nuevo = await db.Usuario.create({
      id_empresa: id_empresa || null,
      id_rol: finalIdRol,
      nombre: nombre.trim(),
      correo: emailNormalizado,
      password_hash: hash,
      foto_url: finalFotoUrl,
      activo: activo !== undefined ? activo : true
    });

    const plain = nuevo.get({ plain: true });
    delete plain.password_hash;
    res.status(201).json({
      ...plain,
      id: String(plain.id_usuario),
      foto_url: finalFotoUrl,
      avatar: finalFotoUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150`
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario', details: error.message });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const usuario = await db.Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { nombre, correo, password, activo, id_rol, id_empresa } = req.body;
    if (nombre !== undefined) usuario.nombre = nombre;
    if (correo !== undefined) usuario.correo = correo;
    if (password !== undefined && password.trim() !== '') {
      usuario.password_hash = bcrypt.hashSync(password, 10);
    }
    if (activo !== undefined) usuario.activo = activo;
    if (id_rol !== undefined) usuario.id_rol = id_rol;
    if (id_empresa !== undefined) usuario.id_empresa = id_empresa;

    await usuario.save();
    const plain = usuario.get({ plain: true });
    delete plain.password_hash;
    res.json(plain);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario permanentemente
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await db.Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.json({ message: 'El usuario ya no existe o fue eliminado previamente', id: req.params.id });
    }

    // Desvincular referencias en tablas donde id_usuario sea clave foránea opcional
    await db.RevisionReporte.update({ id_usuario: null }, { where: { id_usuario: req.params.id } }).catch(() => {});
    await db.ReporteInfraccion.update({ id_usuario: null }, { where: { id_usuario: req.params.id } }).catch(() => {});
    await db.Evidencia.update({ id_usuario: null }, { where: { id_usuario: req.params.id } }).catch(() => {});
    await db.Sancion.update({ id_usuario: null }, { where: { id_usuario: req.params.id } }).catch(() => {});
    await db.BitacoraAcceso.update({ id_usuario: null }, { where: { id_usuario: req.params.id } }).catch(() => {});
    await db.AceptacionReglamento.update({ id_usuario: null }, { where: { id_usuario: req.params.id } }).catch(() => {});

    try {
      await usuario.destroy();
      res.json({ message: 'Usuario eliminado permanentemente de la base de datos', id: req.params.id });
    } catch (destroyErr) {
      console.warn('No se pudo hacer hard delete por restricción de integridad, aplicando soft delete:', destroyErr.message);
      usuario.activo = false;
      await usuario.save();
      res.json({ message: 'Usuario desactivado por tener registros históricos inmutables', id: req.params.id });
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario', details: error.message });
  }
});

module.exports = router;

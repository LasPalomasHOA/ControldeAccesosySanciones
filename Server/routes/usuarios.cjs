const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/index.cjs');
const { saveBase64Image, resolveFotoToDataUrl } = require('../utils/imageHandler.cjs');
const { signToken } = require('../utils/jwt.cjs');
const { checkLoginRateLimit, recordFailedLogin, clearFailedLogins } = require('../middlewares/rateLimiter.cjs');
const { requireAuth } = require('../middlewares/auth.cjs');

// POST /api/usuarios/login - Autenticación con contraseña cifrada (bcrypt), protección de fuerza bruta y emisión de JWT
router.post('/login', checkLoginRateLimit, async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await db.Usuario.findOne({
      where: { correo, activo: true },
      include: [
        { model: db.Rol, as: 'rol', attributes: ['id_rol', 'nombre'] },
        { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }
      ]
    });

    if (!usuario) {
      recordFailedLogin(req);
      return res.status(401).json({ error: 'Credenciales incorrectas o usuario inactivo' });
    }

    const passwordValido = bcrypt.compareSync(password, usuario.password_hash);
    if (!passwordValido) {
      recordFailedLogin(req);
      return res.status(401).json({ error: 'Credenciales incorrectas o usuario inactivo' });
    }

    // Login exitoso: restablecer contador de intentos de fuerza bruta
    clearFailedLogins(req);

    const plain = usuario.get({ plain: true });
    delete plain.password_hash;
    
    // Normalizar rol
    const rolMap = {
      'ADMINISTRADOR': 'admin',
      'SUPERVISOR': 'supervisor',
      'AGENTE': 'caseta',
      'CASETA': 'caseta',
      'GUARDIA': 'caseta',
      'PROVEEDOR': 'proveedor',
      'CONTABILIDAD': 'contabilidad'
    };

    const resolvedFoto = resolveFotoToDataUrl(plain.foto_url);
    const rolCalculado = rolMap[plain.rol?.nombre] || plain.rol?.nombre?.toLowerCase() || 'admin';

    // Verificar si el contratista ya aceptó el reglamento vigente en la base de datos
    let hasAcceptedReglamento = true;
    if (rolCalculado === 'proveedor') {
      hasAcceptedReglamento = false;
      try {
        const regVigente = await db.Reglamento.findOne({ where: { vigente: true } });
        if (regVigente) {
          const conditions = [{ id_usuario: plain.id_usuario }];
          if (plain.id_empresa) conditions.push({ id_empresa: plain.id_empresa });
          const aceptacion = await db.AceptacionReglamento.findOne({
            where: {
              id_reglamento: regVigente.id_reglamento,
              [db.Sequelize.Op.or]: conditions
            }
          });
          hasAcceptedReglamento = !!aceptacion;
        }
      } catch (checkErr) {
        console.warn('Error verificando aceptación de reglamento:', checkErr.message);
      }
    }

    // Generar JWT firmado con datos de sesión
    const token = signToken({
      id_usuario: plain.id_usuario,
      correo: plain.correo,
      rol: rolCalculado,
      id_rol: plain.id_rol,
      id_empresa: plain.id_empresa
    });

    res.json({
      ...plain,
      id: String(plain.id_usuario),
      rol: rolCalculado,
      rolNombre: plain.rol?.nombre,
      empresaNombre: plain.empresa?.razon_social || '',
      foto_url: resolvedFoto || null,
      avatar: resolvedFoto || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150`,
      hasAcceptedReglamento,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al procesar inicio de sesión', details: error.message });
  }
});

// GET /api/usuarios/verificar-sesion/:id - Consulta ultraligera (< 500 bytes)
router.get('/verificar-sesion/:id', async (req, res) => {
  try {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) {
      return res.status(401).json({ error: 'ID de usuario no válido', activo: false });
    }

    const usuario = await db.Usuario.findByPk(idNum, {
      attributes: [
        'id_usuario', 'id_rol', 'id_empresa', 'nombre', 'correo', 'activo',
        [
          db.sequelize.literal(`CASE WHEN foto_url LIKE 'data:%' THEN NULL ELSE foto_url END`),
          'foto_url'
        ]
      ],
      include: [
        { model: db.Rol, as: 'rol', attributes: ['id_rol', 'nombre'] },
        { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }
      ]
    });

    if (!usuario) {
      return res.status(401).json({ error: 'El usuario ya no existe o fue eliminado', activo: false });
    }

    if (usuario.activo === false) {
      return res.status(403).json({ error: 'Tu cuenta ha sido desactivada por un administrador', activo: false });
    }

    const plain = usuario.get({ plain: true });

    const rolMap = {
      'ADMINISTRADOR': 'admin',
      'SUPERVISOR': 'supervisor',
      'AGENTE': 'caseta',
      'CASETA': 'caseta',
      'GUARDIA': 'caseta',
      'PROVEEDOR': 'proveedor',
      'CONTABILIDAD': 'contabilidad'
    };
    const idRolFallback = {
      1: 'admin',
      2: 'supervisor',
      3: 'caseta',
      4: 'caseta',
      5: 'proveedor',
      6: 'contabilidad'
    };
    const nombreRolFallback = {
      1: 'ADMINISTRADOR',
      2: 'SUPERVISOR',
      3: 'AGENTE',
      4: 'CASETA',
      5: 'PROVEEDOR',
      6: 'CONTABILIDAD'
    };

    const resolvedFoto = resolveFotoToDataUrl(plain.foto_url);
    const rolKey = plain.rol?.nombre ? String(plain.rol.nombre).toUpperCase() : null;
    const rolNormalizado = (rolKey && rolMap[rolKey]) || (plain.id_rol && idRolFallback[plain.id_rol]) || plain.rol?.nombre?.toLowerCase() || 'caseta';
    const rolNombreCalculado = plain.rol?.nombre || (plain.id_rol && nombreRolFallback[plain.id_rol]) || (rolNormalizado === 'caseta' ? 'CASETA' : 'ADMINISTRADOR');

    // En verificación de reglamento, consultar solo id_reglamento sin traer contenido_texto
    let hasAcceptedReglamento = true;
    if (rolNormalizado === 'proveedor') {
      hasAcceptedReglamento = false;
      try {
        const regVigente = await db.Reglamento.findOne({
          where: { vigente: true },
          attributes: ['id_reglamento']
        });
        if (regVigente) {
          const conditions = [{ id_usuario: plain.id_usuario }];
          if (plain.id_empresa) conditions.push({ id_empresa: plain.id_empresa });
          const aceptacion = await db.AceptacionReglamento.findOne({
            attributes: ['id_aceptacion'],
            where: {
              id_reglamento: regVigente.id_reglamento,
              [db.Sequelize.Op.or]: conditions
            }
          });
          hasAcceptedReglamento = !!aceptacion;
        }
      } catch (checkErr) {
        console.warn('Error verificando aceptación de reglamento en verificación:', checkErr.message);
      }
    }

    // Generar o refrescar token de sesión
    const token = signToken({
      id_usuario: plain.id_usuario,
      correo: plain.correo,
      rol: rolNormalizado,
      id_rol: plain.id_rol,
      id_empresa: plain.id_empresa
    });

    res.json({
      ...plain,
      id: String(plain.id_usuario),
      rol: rolNormalizado,
      rolNombre: rolNombreCalculado,
      empresaNombre: plain.empresa?.razon_social || '',
      foto_url: resolvedFoto || null,
      avatar: resolvedFoto || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150`,
      hasAcceptedReglamento,
      activo: true,
      token
    });
  } catch (error) {
    console.error('Error al verificar sesión de usuario:', error);
    res.status(500).json({ error: 'Error al verificar sesión', details: error.message });
  }
});

// GET /api/usuarios - Listar todos los usuarios (Requiere Autenticación)
router.get('/', requireAuth, async (req, res) => {
  try {
    const usuarios = await db.Usuario.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: db.Rol, as: 'rol' },
        { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    const rolMap = {
      'ADMINISTRADOR': 'admin',
      'SUPERVISOR': 'supervisor',
      'AGENTE': 'caseta',
      'CASETA': 'caseta',
      'GUARDIA': 'caseta',
      'PROVEEDOR': 'proveedor',
      'CONTABILIDAD': 'contabilidad'
    };

    const idRolFallback = {
      1: 'admin',
      2: 'supervisor',
      3: 'caseta',
      4: 'caseta',
      5: 'proveedor',
      6: 'contabilidad'
    };

    const nombreRolFallback = {
      1: 'ADMINISTRADOR',
      2: 'SUPERVISOR',
      3: 'AGENTE',
      4: 'CASETA',
      5: 'PROVEEDOR',
      6: 'CONTABILIDAD'
    };

    const resultado = usuarios.map(u => {
      const plain = u.get({ plain: true });
      delete plain.password_hash;
      const resolvedFoto = resolveFotoToDataUrl(plain.foto_url);
      const rolKey = plain.rol?.nombre ? String(plain.rol.nombre).toUpperCase() : null;
      const rolNormalizado = (rolKey && rolMap[rolKey]) || (plain.id_rol && idRolFallback[plain.id_rol]) || plain.rol?.nombre?.toLowerCase() || 'caseta';
      const rolNombreCalculado = plain.rol?.nombre || (plain.id_rol && nombreRolFallback[plain.id_rol]) || (rolNormalizado === 'caseta' ? 'CASETA' : 'ADMINISTRADOR');

      return {
        ...plain,
        id: String(plain.id_usuario),
        rol: rolNormalizado,
        rolNombre: rolNombreCalculado,
        empresaNombre: plain.empresa?.razon_social || '',
        foto_url: resolvedFoto || null,
        avatar: resolvedFoto || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150`
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al consultar usuarios', details: error.message });
  }
});

// POST /api/usuarios - Crear usuario con contraseña encriptada (Requiere Autenticación)
router.post('/', requireAuth, async (req, res) => {
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
    if (rol) {
      const targetNames = (rol.toUpperCase() === 'CASETA' || rol.toUpperCase() === 'GUARDIA') ? ['CASETA', 'AGENTE', 'GUARDIA'] : [rol.toUpperCase()];
      const rolEncontrado = await db.Rol.findOne({ where: { nombre: targetNames } });
      if (rolEncontrado) finalIdRol = rolEncontrado.id_rol;
    }
    if (!finalIdRol) finalIdRol = 4;

    // Si es guardia de caseta (rol 4 o 'caseta'), la foto es obligatoria
    const esGuardia = finalIdRol === 4 || finalIdRol === 3 || (rol && ['CASETA', 'AGENTE', 'GUARDIA'].includes(rol.toUpperCase()));
    if (esGuardia && !foto_url) {
      return res.status(400).json({ error: 'La fotografía del oficial de caseta es obligatoria.' });
    }

    const finalFotoUrl = foto_url ? await saveBase64Image(foto_url, 'usuario') : null;

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
    plain.foto_url = resolveFotoToDataUrl(plain.foto_url);
    res.status(201).json(plain);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario', details: error.message });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario existente (Requiere Autenticación)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { nombre, correo, password, activo, id_rol, id_empresa, foto_url } = req.body;
    const usuario = await db.Usuario.findByPk(req.params.id, {
      include: [
        { model: db.Rol, as: 'rol' },
        { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }
      ]
    });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (nombre !== undefined) usuario.nombre = nombre;
    if (correo !== undefined) usuario.correo = correo;
    if (password !== undefined && password.trim() !== '') {
      usuario.password_hash = bcrypt.hashSync(password, 10);
    }
    if (activo !== undefined) usuario.activo = activo;
    if (id_rol !== undefined) usuario.id_rol = id_rol;
    if (id_empresa !== undefined) usuario.id_empresa = id_empresa;
    if (foto_url !== undefined) usuario.foto_url = foto_url ? await saveBase64Image(foto_url, 'usuario') : null;

    await usuario.save();

    // Recargar con asociaciones para devolver la respuesta completa
    await usuario.reload({
      include: [
        { model: db.Rol, as: 'rol' },
        { model: db.Empresa, as: 'empresa', attributes: ['id_empresa', 'razon_social'] }
      ]
    });

    const plain = usuario.get({ plain: true });
    delete plain.password_hash;
    plain.foto_url = resolveFotoToDataUrl(plain.foto_url);

    const rolMap = {
      'ADMINISTRADOR': 'admin',
      'SUPERVISOR': 'supervisor',
      'AGENTE': 'caseta',
      'CASETA': 'caseta',
      'GUARDIA': 'caseta',
      'PROVEEDOR': 'proveedor',
      'CONTABILIDAD': 'contabilidad'
    };
    const idRolFallback = { 1: 'admin', 2: 'supervisor', 3: 'caseta', 4: 'caseta', 5: 'proveedor', 6: 'contabilidad' };
    const nombreRolFallback = { 1: 'ADMINISTRADOR', 2: 'SUPERVISOR', 3: 'AGENTE', 4: 'CASETA', 5: 'PROVEEDOR', 6: 'CONTABILIDAD' };

    const rolKey = plain.rol?.nombre ? String(plain.rol.nombre).toUpperCase() : null;
    plain.rol = (rolKey && rolMap[rolKey]) || (plain.id_rol && idRolFallback[plain.id_rol]) || plain.rol?.nombre?.toLowerCase() || 'caseta';
    plain.rolNombre = plain.rol?.nombre || (plain.id_rol && nombreRolFallback[plain.id_rol]) || (plain.rol === 'caseta' ? 'CASETA' : 'ADMINISTRADOR');

    res.json(plain);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario permanentemente (Requiere Autenticación)
router.delete('/:id', requireAuth, async (req, res) => {
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

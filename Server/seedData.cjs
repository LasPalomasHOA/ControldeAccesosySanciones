const bcrypt = require('bcryptjs');
const db = require('./models/index.cjs');

async function seedDatabase(force = false) {
  try {
    console.log('🔄 Verificando e inicializando datos base en PostgreSQL con contraseñas encriptadas...');

    // Contraseña única de prueba encriptada: '123456'
    const passwordHash = bcrypt.hashSync('123456', 10);

    // 1. Roles
    const rolesData = [
      { id_rol: 1, nombre: 'ADMINISTRADOR', descripcion: 'Acceso total y configuración del sistema', activo: true },
      { id_rol: 2, nombre: 'SUPERVISOR', descripcion: 'Gestión de reportes, dictámenes y sanciones', activo: true },
      { id_rol: 3, nombre: 'AGENTE', descripcion: 'Levantamiento de reportes y evidencias en campo', activo: true },
      { id_rol: 4, nombre: 'CASETA', descripcion: 'Control y registro de accesos en casetas', activo: true },
      { id_rol: 5, nombre: 'PROVEEDOR', descripcion: 'Gestión de colaboradores y vehículos de empresa externa', activo: true }
    ];

    for (const r of rolesData) {
      await db.Rol.findOrCreate({
        where: { nombre: r.nombre },
        defaults: r
      });
    }
    console.log('✅ Roles asegurados.');

    // 2. Reglas de Reincidencia
    const reglasData = [
      { id_regla: 1, numero_falta: 1, permite_acceso: true, requiere_administrador: false, mensaje_alerta: 'Primera Falta: Amonestación formal. Acceso permitido.', activo: true },
      { id_regla: 2, numero_falta: 2, permite_acceso: false, requiere_administrador: false, mensaje_alerta: 'Segunda Falta: Suspensión temporal de 7 días. Acceso denegado.', activo: true },
      { id_regla: 3, numero_falta: 3, permite_acceso: false, requiere_administrador: false, mensaje_alerta: 'Tercera Falta: Suspensión de 30 días y multa. Acceso denegado.', activo: true },
      { id_regla: 4, numero_falta: 4, permite_acceso: false, requiere_administrador: true, mensaje_alerta: 'Cuarta Falta: Bloqueo permanente. Requiere resolución de Dirección HOA.', activo: true }
    ];

    for (const reg of reglasData) {
      await db.ReglaReincidencia.findOrCreate({
        where: { numero_falta: reg.numero_falta },
        defaults: reg
      });
    }
    console.log('✅ Reglas de reincidencia aseguradas.');

    // 3. Casetas
    const casetasData = [
      { id_caseta: 1, nombre: 'Caseta Principal (Acceso Norte)', descripcion: 'Control principal de visitantes y contratistas', activa: true },
      { id_caseta: 2, nombre: 'Caseta Secundaria (Proveedores / Carga)', descripcion: 'Ingreso exclusivo para vehículos pesados y materiales', activa: true },
      { id_caseta: 3, nombre: 'Caseta Playa Hermosa (Sur)', descripcion: 'Control perimetral y salidas de personal', activa: true }
    ];

    for (const c of casetasData) {
      await db.Caseta.findOrCreate({
        where: { nombre: c.nombre },
        defaults: c
      });
    }
    console.log('✅ Casetas aseguradas.');

    // 4. Reglamento oficial
    const [reglamento] = await db.Reglamento.findOrCreate({
      where: { version: 'V2026-1' },
      defaults: {
        version: 'V2026-1',
        titulo: 'Reglamento General de Acceso, Tránsito y Operación para Contratistas y Proveedores',
        archivo_url: 'https://laspalomashoa.com/docs/reglamento_v2026_1.pdf',
        fecha_publicacion: new Date().toISOString().split('T')[0],
        vigente: true
      }
    });
    console.log('✅ Reglamento asegurado.');

    // 5. Catálogo de Infracciones
    const infraccionesData = [
      { codigo: 'INF-01', nombre: 'Exceso de velocidad (>20 km/h)', descripcion: 'Circular a velocidad superior al límite de 20 km/h en vialidades internas', categoria: 'VEHÍCULOS' },
      { codigo: 'INF-02', nombre: 'Trabajos fuera del horario autorizado', descripcion: 'Realizar ruidos o labores de construcción después de las 18:00 hrs o domingos', categoria: 'ÁREA DE TRABAJO' },
      { codigo: 'INF-03', nombre: 'Falta de Equipo de Protección (EPP)', descripcion: 'Personal sin chaleco reflejante, botas o casco dentro del área operativa', categoria: 'INGRESO' },
      { codigo: 'INF-04', nombre: 'Estacionamiento en áreas no autorizadas', descripcion: 'Bloquear banquetas, rampas o cajones de condóminos con unidades de trabajo', categoria: 'VEHÍCULOS' },
      { codigo: 'INF-05', nombre: 'Falta de Corbatín QR visible', descripcion: 'No portar el identificador oficial en el retrovisor durante la estancia', categoria: 'VEHÍCULOS' },
      { codigo: 'INF-06', nombre: 'Manejo inadecuado de escombros/basura', descripcion: 'Arrojar residuos en áreas verdes o no retirar escombros al finalizar la jornada', categoria: 'ÁREA DE TRABAJO' }
    ];

    for (const inf of infraccionesData) {
      await db.CatalogoInfraccion.findOrCreate({
        where: { codigo: inf.codigo },
        defaults: {
          ...inf,
          id_reglamento: reglamento.id_reglamento,
          activo: true
        }
      });
    }
    console.log('✅ Catálogo de infracciones asegurado.');

    // 6. Empresas Demo
    const [empresa1] = await db.Empresa.findOrCreate({
      where: { razon_social: 'Constructora Integral del Noroeste S.A. de C.V.' },
      defaults: {
        razon_social: 'Constructora Integral del Noroeste S.A. de C.V.',
        nombre_comercial: 'Constructora Integral',
        responsable_nombre: 'Ing. Roberto Silva Morales',
        telefono: '638-102-3344',
        correo: 'contacto@constructoraintegral.com',
        estatus: 'ACTIVA'
      }
    });

    const [empresa2] = await db.Empresa.findOrCreate({
      where: { razon_social: 'Mantenimiento & Climas Rocky Point S. de R.L.' },
      defaults: {
        razon_social: 'Mantenimiento & Climas Rocky Point S. de R.L.',
        nombre_comercial: 'Climas Rocky Point',
        responsable_nombre: 'Lic. Laura Elena Vega',
        telefono: '638-382-9900',
        correo: 'servicio@climasrockypoint.com',
        estatus: 'ACTIVA'
      }
    });
    console.log('✅ Empresas aseguradas.');

    // 7. Usuarios del sistema con contraseña '123456' encriptada con bcrypt
    const usuariosList = [
      {
        correo: 'admin@laspalomashoa.com',
        id_empresa: null,
        id_rol: 1, // ADMINISTRADOR
        nombre: 'Administrador de Seguridad HOA',
        password_hash: passwordHash,
        activo: true
      },
      {
        correo: 'supervisor@laspalomashoa.com',
        id_empresa: null,
        id_rol: 2, // SUPERVISOR
        nombre: 'Supervisor Operativo',
        password_hash: passwordHash,
        activo: true
      },
      {
        correo: 'agente@laspalomashoa.com',
        id_empresa: null,
        id_rol: 3, // AGENTE
        nombre: 'Oficial Carlos Méndez',
        password_hash: passwordHash,
        activo: true
      },
      {
        correo: 'caseta@laspalomashoa.com',
        id_empresa: null,
        id_rol: 4, // CASETA
        nombre: 'Guardia Caseta Principal',
        password_hash: passwordHash,
        activo: true
      },
      {
        correo: 'proveedor@constructoraintegral.com',
        id_empresa: empresa1.id_empresa,
        id_rol: 5, // PROVEEDOR
        nombre: 'Roberto Silva Morales',
        password_hash: passwordHash,
        activo: true
      }
    ];

    for (const u of usuariosList) {
      const [userRecord, created] = await db.Usuario.findOrCreate({
        where: { correo: u.correo },
        defaults: u
      });
      // Asegurar que siempre tenga el hash de '123456'
      if (!created && userRecord.password_hash !== passwordHash) {
        userRecord.password_hash = passwordHash;
        await userRecord.save();
      }
    }
    console.log('✅ Usuarios del sistema asegurados con contraseñas encriptadas (bcrypt 123456).');

    // 8. Trabajadores Demo
    const [t1] = await db.Trabajador.findOrCreate({
      where: { id_empresa: empresa1.id_empresa, nombre: 'Juan Carlos', apellidos: 'López Hernández' },
      defaults: {
        id_empresa: empresa1.id_empresa,
        nombre: 'Juan Carlos',
        apellidos: 'López Hernández',
        telefono: '638-111-2233',
        foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        activo: true
      }
    });

    const [t2] = await db.Trabajador.findOrCreate({
      where: { id_empresa: empresa1.id_empresa, nombre: 'Miguel Ángel', apellidos: 'García Torres' },
      defaults: {
        id_empresa: empresa1.id_empresa,
        nombre: 'Miguel Ángel',
        apellidos: 'García Torres',
        telefono: '638-222-3344',
        foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        activo: true
      }
    });

    // 9. Vehículos Demo (con año)
    const [v1] = await db.Vehiculo.findOrCreate({
      where: { placas: 'SON-4589-B' },
      defaults: {
        id_empresa: empresa1.id_empresa,
        marca: 'Nissan',
        modelo: 'NP300 Pick-Up',
        año: 2023,
        placas: 'SON-4589-B',
        color: 'Blanco',
        foto_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=500',
        estatus_acceso: 'HABILITADO'
      }
    });

    const [v2] = await db.Vehiculo.findOrCreate({
      where: { placas: 'SON-1290-A' },
      defaults: {
        id_empresa: empresa1.id_empresa,
        marca: 'Ford',
        modelo: 'Transit Van',
        año: 2022,
        placas: 'SON-1290-A',
        color: 'Gris Plata',
        foto_url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=500',
        estatus_acceso: 'HABILITADO'
      }
    });

    // 10. Corbatines Demo
    await db.Corbatin.findOrCreate({
      where: { id_vehiculo: v1.id_vehiculo },
      defaults: {
        id_vehiculo: v1.id_vehiculo,
        numero: 101,
        qr_token: `CORB-101-${v1.placas}-2026`,
        fecha_emision: new Date(),
        fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        estatus: 'ACTIVO'
      }
    });

    await db.Corbatin.findOrCreate({
      where: { id_vehiculo: v2.id_vehiculo },
      defaults: {
        id_vehiculo: v2.id_vehiculo,
        numero: 102,
        qr_token: `CORB-102-${v2.placas}-2026`,
        fecha_emision: new Date(),
        fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        estatus: 'ACTIVO'
      }
    });

    // 11. Asignación de conductor a vehículo
    await db.ConductorVehiculo.findOrCreate({
      where: { id_vehiculo: v1.id_vehiculo, id_trabajador: t1.id_trabajador },
      defaults: {
        id_vehiculo: v1.id_vehiculo,
        id_trabajador: t1.id_trabajador,
        activo: true
      }
    });

    console.log('🎉 Base de datos de PostgreSQL sembrada y lista con éxito con contraseñas encriptadas.');
    return { success: true, message: 'Datos base actualizados con contraseñas encriptadas (123456).' };
  } catch (error) {
    console.error('❌ Error al sembrar base de datos:', error);
    throw error;
  }
}

module.exports = { seedDatabase };

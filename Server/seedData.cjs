const db = require('./models/index.cjs');

/**
 * Inicializa únicamente los catálogos esenciales del sistema
 * (Roles, Reglas de Reincidencia, Casetas, Reglamento Oficial e Infracciones).
 * No inserta usuarios de prueba, empresas ni vehículos demo.
 */
async function seedDatabase() {
  try {
    // 1. Roles del Sistema
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

    // 3. Casetas de Control de Acceso
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

    // 4. Reglamento Oficial
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

    // 5. Catálogo Oficial de Infracciones
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

    return { success: true, message: 'Catálogos base esenciales del sistema verificados correctamente.' };
  } catch (error) {
    console.error('❌ Error al inicializar catálogos base:', error);
    throw error;
  }
}

module.exports = { seedDatabase };

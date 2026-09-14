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
    const defaultTexto = `REGLAMENTO DE COLABORADORES EXTERNOS — LAS PALOMAS ROCKY POINT HOA

1. DISPOSICIONES GENERALES
Todo contratista, proveedor o empresa externa que opere dentro de las instalaciones de Las Palomas debe registrar sus vehículos en este portal antes de su primer acceso. El incumplimiento faculta a la administración a denegar el ingreso inmediato.

2. REGISTRO E IDENTIFICACIÓN
2.1 Cada vehículo debe portar el corbatín vigente emitido por este sistema, colocado en el espejo retrovisor interno de forma visible en todo momento.
2.2 La información registrada debe ser verídica y mantenerse actualizada. Cualquier cambio de conductor habitual debe notificarse dentro de las 48 horas siguientes.
2.3 Los vehículos sin corbatín válido o con sanciones/suspensiones activas serán detenidos en caseta y no se permitirá su ingreso hasta solventar la aclaración.

3. NORMAS DE CIRCULACIÓN Y SEGURIDAD
3.1 Límite de velocidad interior: 10 km/h en andadores y 20 km/h en vialidad perimetral.
3.2 Se prohíbe terminantemente el uso de teléfono celular al conducir dentro del predio.
3.3 Los vehículos de carga deben permanecer en las zonas de maniobra asignadas (Sótano 2).
3.4 El personal debe portar uniforme, gafete visible y Equipo de Protección Personal (EPP) obligatorio.

4. ZONAS Y HORARIOS DE TRABAJO
4.1 El acceso para labores está permitido de Lunes a Viernes de 08:00 a 18:00 hrs y Sábados de 09:00 a 14:00 hrs.
4.2 Queda estrictamente prohibido generar ruidos de impacto antes de las 09:00 hrs.
4.3 Trabajos en domingos o días inhábiles requieren autorización especial previa por escrito del comité de HOA.

5. SISTEMA DE SANCIONES DISCIPLINARIAS Y SUSPENSIONES
5.1 Las infracciones capturadas en campo por los agentes de seguridad serán validadas y dictaminadas por supervisión HOA.
5.2 1ª Infracción: Amonestación formal escrita registrada en expediente.
5.3 2ª Infracción: Suspensión de acceso vehicular al predio por 24 a 48 horas.
5.4 3ª Infracción: Suspensión de acceso vehicular por 1 semana.
5.5 Falta Grave o Reincidencia: Suspensión por 1 mes o restricción definitiva del colaborador/unidad.
5.6 Las sanciones activas bloquean de forma automática e inmediata la pluma de acceso en el sistema de casetas. No existen multas económicas, únicamente medidas disciplinarias y de suspensión.

6. DERECHO DE APELACIÓN Y ACLARACIÓN
El representante acreditado de la empresa contratista cuenta con el derecho reglamentario de interponer recurso de apelación y aclaración formal ante la Supervisión HOA para su resolución en un plazo no mayor a 24 horas.

7. RESPONSABILIDADES CIVILES
La empresa contratista asume plena responsabilidad civil y solidaria por los daños o percances que sus colaboradores o unidades vehiculares ocasionen a la infraestructura o áreas comunes de Las Palomas.`;

    const defaultSecciones = [
      { title: "1. INGRESO", items: ["Registrar: corbatín, compañía, vehículo, placas, nombre y celular.", "Indicar área de trabajo y horario.", "Portar uniforme, gafete visible y EPP obligatorio."] },
      { title: "2. ÁREA DE TRABAJO", items: ["Permanecer solo en el área asignada.", "Usar señalización de seguridad (conos, cintas).", "Uso obligatorio de EPP (incluye arnés en altura).", "Consumir alimentos solo en áreas designadas.", "No usar elevadores de huéspedes."] },
      { title: "3. VEHÍCULOS", items: ["Altura máxima: 2.40 m.", "Estacionarse solo en áreas autorizadas (Sótano 2).", "Colocar corbatín visible en el retrovisor o tablero."] },
      { title: "4. PROHIBICIONES", items: ['No tirar escombro en "Trash Chute".', "No dejar materiales en áreas comunes.", "No usar bocinas ni generar ruido excesivo.", "No dormir en áreas comunes."] },
      { title: "5. SANCIONES DISCIPLINARIAS", items: ["1ª: Amonestación escrita", "2ª: Suspensión de 24 a 48 hrs", "3ª: Suspensión de 1 semana", "Reincidencia: Restricción definitiva"] },
      { title: "6. HORARIOS", items: ["Lunes a viernes: 08:00 a 18:00 hrs", "Sábado: 09:00 a 14:00 hrs", "No generar ruido antes de 09:00 hrs", "Horarios especiales requieren autorización HOA."] }
    ];

    const [reglamento, creadoReglamento] = await db.Reglamento.findOrCreate({
      where: { version: 'V2026-1' },
      defaults: {
        version: 'V2026-1',
        titulo: 'Reglamento General de Acceso, Tránsito y Operación para Contratistas y Proveedores',
        archivo_url: 'https://laspalomashoa.com/docs/reglamento_v2026_1.pdf',
        fecha_publicacion: new Date().toISOString().split('T')[0],
        vigente: true,
        contenido_texto: defaultTexto,
        contenido_secciones: defaultSecciones
      }
    });

    if (!creadoReglamento && (!reglamento.contenido_texto || !reglamento.contenido_secciones)) {
      await reglamento.update({
        contenido_texto: reglamento.contenido_texto || defaultTexto,
        contenido_secciones: reglamento.contenido_secciones || defaultSecciones
      }).catch(() => {});
    }

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

import { Empresa, Trabajador, Vehiculo, Acceso, ReglamentoArticulo, InfraccionCat, Sancion, Usuario } from '../types';

export const mockUsuarios: Usuario[] = [
  {
    id: 'u1',
    nombre: 'Ana Laura Gómez',
    correo: 'admin@laspalomas.com',
    rol: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'u2',
    nombre: 'Ing. Fernando Ruiz',
    correo: 'supervisor@laspalomas.com',
    rol: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'u3',
    nombre: 'Oficial Martínez',
    correo: 'guardia@laspalomas.com',
    rol: 'guardia',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'u4',
    nombre: 'Carlos Ortega (Proveedor)',
    correo: 'carlos@construccionespuerto.com',
    rol: 'proveedor',
    empresaId: 'emp1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  }
];

export const mockEmpresas: Empresa[] = [
  {
    id: 'emp1',
    nombre: 'Construcciones del Puerto S.A.',
    rfc: 'CPU120304AA1',
    responsable: 'Ing. Carlos Ortega',
    telefono: '638-383-1245',
    correo: 'carlos@construccionespuerto.com',
    estado: 'activo',
    totalTrabajadores: 4,
    totalVehiculos: 2
  },
  {
    id: 'emp2',
    nombre: 'Jardinería Bella Vista',
    rfc: 'JBV980712BB2',
    responsable: 'María Elena Solares',
    telefono: '638-112-9843',
    correo: 'maria@bellavista.com',
    estado: 'activo',
    totalTrabajadores: 3,
    totalVehiculos: 1
  },
  {
    id: 'emp3',
    nombre: 'Limpieza Marina Resort',
    rfc: 'LMR050915CC3',
    responsable: 'Roberto Méndez',
    telefono: '638-105-2244',
    correo: 'mendez@marinalimpieza.com',
    estado: 'suspendido',
    totalTrabajadores: 3,
    totalVehiculos: 2
  },
  {
    id: 'emp4',
    nombre: 'Pinturas Rocky Point',
    rfc: 'PRP141120DD4',
    responsable: 'Lic. Luis Gómez',
    telefono: '638-385-6677',
    correo: 'luis@pinturasrocky.com',
    estado: 'activo',
    totalTrabajadores: 2,
    totalVehiculos: 1
  }
];

export const mockTrabajadores: Trabajador[] = [
  {
    id: 't1',
    nombre: 'Carlos',
    apellidos: 'Ortega Vega',
    nss: '4392-74-8891-2',
    rol: 'Residente de Obra',
    empresaId: 'emp1',
    empresaNombre: 'Construcciones del Puerto S.A.',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  },
  {
    id: 't2',
    nombre: 'Juan',
    apellidos: 'Pérez López',
    nss: '1288-75-9983-1',
    rol: 'Albañil Oficial',
    empresaId: 'emp1',
    empresaNombre: 'Construcciones del Puerto S.A.',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  },
  {
    id: 't3',
    nombre: 'Raúl',
    apellidos: 'Castro González',
    nss: '9843-88-1243-9',
    rol: 'Ayudante General',
    empresaId: 'emp1',
    empresaNombre: 'Construcciones del Puerto S.A.',
    foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  },
  {
    id: 't4',
    nombre: 'Martín',
    apellidos: 'Ruiz Durán',
    nss: '3312-80-2342-1',
    rol: 'Yesero Carpintero',
    empresaId: 'emp1',
    empresaNombre: 'Construcciones del Puerto S.A.',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  },
  {
    id: 't5',
    nombre: 'María Elena',
    apellidos: 'Solares Rocha',
    nss: '8872-66-1029-4',
    rol: 'Diseñadora de Paisajes',
    empresaId: 'emp2',
    empresaNombre: 'Jardinería Bella Vista',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  },
  {
    id: 't6',
    nombre: 'Pedro',
    apellidos: 'Hernández Solís',
    nss: '4482-90-2384-2',
    rol: 'Jardinero General',
    empresaId: 'emp2',
    empresaNombre: 'Jardinería Bella Vista',
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  },
  {
    id: 't7',
    nombre: 'José',
    apellidos: 'Ramírez Ortiz',
    nss: '7721-69-9043-1',
    rol: 'Jefe de Cuadrilla',
    empresaId: 'emp3',
    empresaNombre: 'Limpieza Marina Resort',
    foto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    estado: 'bloqueado',
    observaciones: 'Bloqueado por reincidencia grave en reglamento de ruido y desechos'
  },
  {
    id: 't8',
    nombre: 'Sofía',
    apellidos: 'Martínez Cárdenas',
    nss: '2288-91-3829-0',
    rol: 'Supervisora Operativa',
    empresaId: 'emp3',
    empresaNombre: 'Limpieza Marina Resort',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  },
  {
    id: 't9',
    nombre: 'Julio',
    apellidos: 'Cruz Rosas',
    nss: '1132-70-4923-5',
    rol: 'Auxiliar de Limpieza',
    empresaId: 'emp3',
    empresaNombre: 'Limpieza Marina Resort',
    foto: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  },
  {
    id: 't10',
    nombre: 'Francisco',
    apellidos: 'Jara Bello',
    nss: '6672-88-3921-2',
    rol: 'Pintor Oficial',
    empresaId: 'emp4',
    empresaNombre: 'Pinturas Rocky Point',
    foto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150',
    estado: 'activo'
  }
];

export const mockVehiculos: Vehiculo[] = [
  {
    id: 'v1',
    placa: 'SON-88-29',
    marca: 'Ford',
    modelo: 'F-150',
    color: 'Blanco',
    empresaId: 'emp1',
    empresaNombre: 'Construcciones del Puerto S.A.',
    estadoAcceso: 'permitido',
    corbatinNumero: 'C-102',
    corbatinVencimiento: '2026-12-31',
    reincidencias: 0
  },
  {
    id: 'v2',
    placa: 'SON-11-23',
    marca: 'Toyota',
    modelo: 'Hilux',
    color: 'Blanco',
    empresaId: 'emp1',
    empresaNombre: 'Construcciones del Puerto S.A.',
    estadoAcceso: 'alerta_sancion',
    corbatinNumero: 'C-103',
    corbatinVencimiento: '2026-12-31',
    reincidencias: 1
  },
  {
    id: 'v3',
    placa: 'SON-34-12',
    marca: 'Chevrolet',
    modelo: 'Silverado',
    color: 'Gris',
    empresaId: 'emp2',
    empresaNombre: 'Jardinería Bella Vista',
    estadoAcceso: 'permitido',
    corbatinNumero: 'J-205',
    corbatinVencimiento: '2026-10-15',
    reincidencias: 0
  },
  {
    id: 'v4',
    placa: 'SON-90-54',
    marca: 'Nissan',
    modelo: 'NP300',
    color: 'Rojo',
    empresaId: 'emp3',
    empresaNombre: 'Limpieza Marina Resort',
    estadoAcceso: 'bloqueado',
    corbatinNumero: 'L-404',
    corbatinVencimiento: '2026-09-30',
    reincidencias: 3
  },
  {
    id: 'v5',
    placa: 'SON-44-88',
    marca: 'Dodge',
    modelo: 'Ram',
    color: 'Negro',
    empresaId: 'emp3',
    empresaNombre: 'Limpieza Marina Resort',
    estadoAcceso: 'alerta_sancion',
    corbatinNumero: 'L-405',
    corbatinVencimiento: '2026-09-30',
    reincidencias: 2
  },
  {
    id: 'v6',
    placa: 'SON-55-77',
    marca: 'Isuzu',
    modelo: 'Elf',
    color: 'Blanco',
    empresaId: 'emp4',
    empresaNombre: 'Pinturas Rocky Point',
    estadoAcceso: 'permitido',
    corbatinNumero: 'P-301',
    corbatinVencimiento: '2026-11-20',
    reincidencias: 0
  }
];

export const mockAccesos: Acceso[] = [
  {
    id: 'acc1',
    vehiculoId: 'v1',
    trabajadorId: 't1',
    placa: 'SON-88-29',
    trabajadorNombre: 'Carlos Ortega Vega',
    empresaNombre: 'Construcciones del Puerto S.A.',
    tipo: 'entrada',
    fechaHora: '2026-08-27T07:15:00-07:00',
    agenteNombre: 'Oficial Martínez',
    cabina: 'Cabina Principal 1'
  },
  {
    id: 'acc2',
    vehiculoId: 'v3',
    trabajadorId: 't6',
    placa: 'SON-34-12',
    trabajadorNombre: 'Pedro Hernández Solís',
    empresaNombre: 'Jardinería Bella Vista',
    tipo: 'entrada',
    fechaHora: '2026-08-27T07:30:00-07:00',
    agenteNombre: 'Oficial Martínez',
    cabina: 'Cabina Principal 2'
  },
  {
    id: 'acc3',
    vehiculoId: 'v2',
    trabajadorId: 't2',
    placa: 'SON-11-23',
    trabajadorNombre: 'Juan Pérez López',
    empresaNombre: 'Construcciones del Puerto S.A.',
    tipo: 'entrada',
    fechaHora: '2026-08-27T07:45:00-07:00',
    agenteNombre: 'Oficial Martínez',
    cabina: 'Cabina Principal 1',
    observaciones: 'Ingresó con herramienta pesada'
  },
  {
    id: 'acc4',
    vehiculoId: 'v5',
    trabajadorId: 't8',
    placa: 'SON-44-88',
    trabajadorNombre: 'Sofía Martínez Cárdenas',
    empresaNombre: 'Limpieza Marina Resort',
    tipo: 'entrada',
    fechaHora: '2026-08-27T08:00:00-07:00',
    agenteNombre: 'Oficial Martínez',
    cabina: 'Cabina Principal 2',
    observaciones: 'Alerta visual de reincidencias en sistema'
  },
  {
    id: 'acc5',
    vehiculoId: 'v1',
    trabajadorId: 't1',
    placa: 'SON-88-29',
    trabajadorNombre: 'Carlos Ortega Vega',
    empresaNombre: 'Construcciones del Puerto S.A.',
    tipo: 'salida',
    fechaHora: '2026-08-27T12:00:00-07:00',
    agenteNombre: 'Auxiliar Gómez',
    cabina: 'Cabina Salida 1'
  }
];

export const mockReglamento: ReglamentoArticulo[] = [
  {
    id: 'art1',
    seccion: 'Sección I: Velocidad',
    titulo: 'Límite de velocidad vehicular',
    descripcion: 'La velocidad máxima permitida dentro de los caminos del desarrollo es de 10 km/h para todo vehículo comercial o de contratistas. Se prohíbe el exceso de velocidad.',
    multaUSD: 100
  },
  {
    id: 'art2',
    seccion: 'Sección II: Residuos',
    titulo: 'Desecho indebido de escombros y basura',
    descripcion: 'Todos los materiales sobrantes de construcción, basura de empaque y residuos de comida deben ser retirados diariamente del área de trabajo. Queda prohibido el vertido en lotes baldíos.',
    multaUSD: 150
  },
  {
    id: 'art3',
    seccion: 'Sección III: Convivencia',
    titulo: 'Horarios de trabajo y ruido excesivo',
    descripcion: 'Las actividades ruidosas de construcción y mantenimiento solo se permiten de lunes a viernes de 8:00 AM a 5:00 PM y sábados de 8:00 AM a 1:00 PM. Fuera de este horario, se considera infracción.',
    multaUSD: 150
  },
  {
    id: 'art4',
    seccion: 'Sección IV: Vialidad',
    titulo: 'Obstrucción de accesos y estacionamiento prohibido',
    descripcion: 'Los vehículos comerciales deben estacionarse únicamente en las zonas asignadas y no deben obstruir carriles de emergencia, hidrantes ni las cocheras de los residentes.',
    multaUSD: 50
  },
  {
    id: 'art5',
    seccion: 'Sección V: Conducta',
    titulo: 'Comportamiento del personal',
    descripcion: 'Se exige respeto absoluto hacia los residentes, huéspedes y el personal de seguridad del HOA. Se prohíbe deambular fuera del área asignada a la obra.',
    multaUSD: 200
  }
];

export const mockInfraccionesCat: InfraccionCat[] = [
  {
    id: 'inf1',
    codigo: 'VEL-01',
    descripcion: 'Exceso de velocidad (>10 km/h)',
    categoria: 'velocidad',
    multaBase: 100
  },
  {
    id: 'inf2',
    codigo: 'BAS-02',
    descripcion: 'Vertido de escombros / basura en área común',
    categoria: 'basura',
    multaBase: 150
  },
  {
    id: 'inf3',
    codigo: 'RUI-03',
    descripcion: 'Actividades ruidosas fuera de horario permitido',
    categoria: 'ruido',
    multaBase: 150
  },
  {
    id: 'inf4',
    codigo: 'EST-04',
    descripcion: 'Estacionamiento en carril de emergencia o hidrante',
    categoria: 'estacionamiento',
    multaBase: 50
  },
  {
    id: 'inf5',
    codigo: 'SEG-05',
    descripcion: 'Falta de equipo de protección en obra visible',
    categoria: 'seguridad',
    multaBase: 100
  },
  {
    id: 'inf6',
    codigo: 'OTR-06',
    descripcion: 'Deambular sin autorización en áreas residenciales',
    categoria: 'otro',
    multaBase: 200
  }
];

export const mockSanciones: Sancion[] = [
  {
    id: 'san1',
    vehiculoId: 'v2',
    placa: 'SON-11-23',
    trabajadorNombre: 'Juan Pérez López',
    infraccionCodigo: 'VEL-01',
    infraccionDescripcion: 'Exceso de velocidad (>10 km/h). Registrado a 32 km/h cerca de Torre Cantabria.',
    gravedad: 'moderada',
    estado: 'activa',
    fechaSancion: '2026-08-26T15:30:00-07:00',
    montoMulta: 100,
    evidenciaUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=300',
    comentarios: 'Se le advirtió verbalmente al ingresar. Conducía a velocidad de riesgo en zona de condominios.',
    agenteNombre: 'Oficial Martínez'
  },
  {
    id: 'san2',
    vehiculoId: 'v5',
    placa: 'SON-44-88',
    trabajadorNombre: 'Julio Cruz Rosas',
    infraccionCodigo: 'BAS-02',
    infraccionDescripcion: 'Desecho indebido de contenedores de pintura en jardineras residenciales.',
    gravedad: 'grave',
    estado: 'activa',
    fechaSancion: '2026-08-25T11:20:00-07:00',
    montoMulta: 150,
    evidenciaUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=300',
    comentarios: 'Segunda infracción de esta empresa en la misma semana. Se reportó al responsable de cuadrilla.',
    agenteNombre: 'Supervisor Ruiz'
  },
  {
    id: 'san3',
    vehiculoId: 'v4',
    placa: 'SON-90-54',
    trabajadorNombre: 'José Ramírez Ortiz',
    infraccionCodigo: 'RUI-03',
    infraccionDescripcion: 'Trabajos con rotomartillo a las 8:30 PM (Horario permitido hasta 5:00 PM).',
    gravedad: 'grave',
    estado: 'activa',
    fechaSancion: '2026-08-24T20:30:00-07:00',
    montoMulta: 150,
    evidenciaUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=300',
    comentarios: 'Tercera falta de esta unidad. Se aplica bloqueo de acceso temporal de 15 días según reglamento.',
    agenteNombre: 'Oficial Martínez'
  },
  {
    id: 'san4',
    vehiculoId: 'v1',
    placa: 'SON-88-29',
    trabajadorNombre: 'Carlos Ortega Vega',
    infraccionCodigo: 'EST-04',
    infraccionDescripcion: 'Estacionamiento sobre banquetas y rampa de discapacitados en Torre Cantabria.',
    gravedad: 'leve',
    estado: 'resuelta',
    fechaSancion: '2026-08-20T10:15:00-07:00',
    fechaResolucion: '2026-08-22T09:00:00-07:00',
    montoMulta: 50,
    comentarios: 'Infracción liquidada en oficinas de HOA por el responsable de la empresa.',
    agenteNombre: 'Oficial Martínez'
  },
  {
    id: 'san5',
    placa: 'SON-11-23',
    trabajadorNombre: 'Juan Pérez López',
    infraccionCodigo: 'SEG-05',
    infraccionDescripcion: 'Ingreso a obra de demolición sin casco ni botas de seguridad.',
    gravedad: 'moderada',
    estado: 'pendiente_aprobacion',
    fechaSancion: '2026-08-27T10:45:00-07:00',
    montoMulta: 100,
    evidenciaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=300',
    comentarios: 'Reporte cargado por guardia desde la app móvil. Requiere aprobación de supervisor.',
    agenteNombre: 'Oficial Martínez'
  }
];

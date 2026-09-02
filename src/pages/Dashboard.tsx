import React from 'react';
import { useHOA } from '../context/HOAContext';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Building2,
  Users,
  Car,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Shield,
  FileCheck2,
  Lock,
  Compass
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { empresas, trabajadores, vehiculos, accesos, sanciones } = useHOA();

  // Calculations
  const totalEmpresas = empresas.filter(e => e.estado === 'activo').length;
  const totalTrabajadores = trabajadores.filter(t => t.estado === 'activo').length;
  const vehiculosBloqueados = vehiculos.filter(v => v.estadoAcceso === 'bloqueado').length;
  const sancionesActivas = sanciones.filter(s => s.estado === 'activa').length;
  const aprobacionesPendientes = sanciones.filter(s => s.estado === 'pendiente_aprobacion').length;

  // Chart Data: Infracciones por Categoría
  const infraccionesPorCategoria = sanciones.reduce((acc: Record<string, number>, curr) => {
    const cat = curr.infraccionCodigo.split('-')[0]; // VEL, BAS, RUI, EST, SEG, OTR
    const catName =
      cat === 'VEL' ? 'Velocidad' :
      cat === 'BAS' ? 'Desechos/Basura' :
      cat === 'RUI' ? 'Ruido' :
      cat === 'EST' ? 'Estacionamiento' :
      cat === 'SEG' ? 'Seguridad Obra' : 'Otros';
    acc[catName] = (acc[catName] || 0) + 1;
    return acc;
  }, {});

  const dataCategorias = Object.keys(infraccionesPorCategoria).map(key => ({
    name: key,
    value: infraccionesPorCategoria[key]
  }));

  const COLORS = ['#0f172a', '#06b6d4', '#e11d48', '#f59e0b', '#8b5cf6', '#64748b'];

  // Chart Data: Accesos por Hora (Simulados sobre la bitácora)
  const dataAccesos = [
    { hora: '07:00', Entradas: 12, Salidas: 2 },
    { hora: '08:00', Entradas: 25, Salidas: 5 },
    { hora: '09:00', Entradas: 15, Salidas: 8 },
    { hora: '10:00', Entradas: 8, Salidas: 12 },
    { hora: '11:00', Entradas: 5, Salidas: 14 },
    { hora: '12:00', Entradas: 9, Salidas: 20 },
    { hora: '13:00', Entradas: 6, Salidas: 18 }
  ];

  // Helper for status badge
  const getVehiculoStatusBadge = (status: string) => {
    switch (status) {
      case 'permitido':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-xs font-semibold">Permitido</span>;
      case 'alerta_sancion':
        return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-xs font-semibold">Alerta Sanción</span>;
      case 'bloqueado':
        return <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded text-xs font-semibold">Bloqueado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Resumen Operativo</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Estadísticas y control de acceso vehicular en tiempo real.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm font-medium">
          Última actualización: hace unos segundos
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Empresas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Empresas Activas</span>
            <div className="text-2xl font-extrabold text-slate-800">{totalEmpresas}</div>
            <Link to="/empresas" className="text-cyan-600 text-xs font-semibold hover:underline inline-flex items-center gap-1 mt-1">
              Ver listado <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-500">
            <Building2 size={24} />
          </div>
        </div>

        {/* Trabajadores */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Personal Activo</span>
            <div className="text-2xl font-extrabold text-slate-800">{totalTrabajadores}</div>
            <Link to="/trabajadores" className="text-indigo-600 text-xs font-semibold hover:underline inline-flex items-center gap-1 mt-1">
              Ver nómina <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
            <Users size={24} />
          </div>
        </div>

        {/* Vehiculos Bloqueados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Unidades Bloqueadas</span>
            <div className="text-2xl font-extrabold text-rose-600">{vehiculosBloqueados}</div>
            <Link to="/vehiculos" className="text-rose-600 text-xs font-semibold hover:underline inline-flex items-center gap-1 mt-1">
              Ver lista restringida <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
            <Car size={24} />
          </div>
        </div>

        {/* Sanciones Activas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sanciones Activas</span>
            <div className="text-2xl font-extrabold text-amber-600">{sancionesActivas}</div>
            <Link to="/sanciones" className="text-amber-600 text-xs font-semibold hover:underline inline-flex items-center gap-1 mt-1">
              Ver multas <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Supervisor Attention Banner */}
      {aprobacionesPendientes > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <ShieldAlert className="text-white animate-bounce" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">Bandeja de Aprobaciones Pendientes</h4>
              <p className="text-xs text-white/80 mt-0.5">Hay {aprobacionesPendientes} infracciones reportadas por agentes de seguridad que requieren tu revisión.</p>
            </div>
          </div>
          <Link
            to="/aprobaciones"
            className="self-start sm:self-auto bg-white text-rose-600 px-4 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-slate-50 transition-colors"
          >
            Revisar bandeja
          </Link>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow Chart (Vite / Access) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-slate-500" />
            Flujo de Accesos Registrados (Hoy)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataAccesos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hora" tickLine={false} style={{ fontSize: '11px', fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Entradas" fill="#00b4d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Salidas" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Infractions Category Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-slate-500" />
            Sanciones por Tipo
          </h3>
          <div className="h-56 flex-1 relative flex items-center justify-center">
            {dataCategorias.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataCategorias}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dataCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400 font-medium">Sin reportes registrados</div>
            )}
            {/* Center label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-2xl font-extrabold text-slate-800">{sanciones.length}</span>
            </div>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-3">
            {dataCategorias.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom Row: Recent access bitácora & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Access List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-slate-500" />
              Ingresos Recientes
            </h3>
            <Link to="/bitacora" className="text-xs text-indigo-600 hover:underline font-semibold">
              Ver bitácora completa
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">Fecha/Hora</th>
                  <th className="py-2.5 px-3">Vehículo (Placa)</th>
                  <th className="py-2.5 px-3">Conductor</th>
                  <th className="py-2.5 px-3">Empresa</th>
                  <th className="py-2.5 px-3 text-center">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accesos.slice(0, 5).map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 text-slate-700 font-medium">
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(acc.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                      <span className="text-[10px] block">
                        {new Date(acc.fechaHora).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-800">
                        {acc.placa || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 truncate max-w-[120px]">
                      {acc.trabajadorNombre || 'Sin conductor'}
                    </td>
                    <td className="py-2.5 px-3 truncate max-w-[125px] text-slate-500">
                      {acc.empresaNombre}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.tipo === 'entrada'
                            ? 'bg-cyan-50 text-cyan-600'
                            : 'bg-slate-150 text-slate-600'
                        }`}
                      >
                        {acc.tipo === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-slate-500" />
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-1 gap-2.5 flex-1">
            <Link
              to="/caseta"
              className="p-3 border border-slate-100 hover:border-cyan-200 bg-slate-50/50 hover:bg-cyan-50/10 rounded-lg flex items-center gap-3 group transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <Compass size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Módulo de Caseta</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Registro de entrada rápido para oficiales.</div>
              </div>
            </Link>

            <Link
              to="/corbatines"
              className="p-3 border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/10 rounded-lg flex items-center gap-3 group transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <FileCheck2 size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Imprimir Corbatín</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Generador de acreditación de vehículos.</div>
              </div>
            </Link>

            <Link
              to="/vehiculos"
              className="p-3 border border-slate-100 hover:border-rose-200 bg-slate-50/50 hover:bg-rose-50/10 rounded-lg flex items-center gap-3 group transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                <Lock size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Lista Restringida</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Consulta de matrículas suspendidas.</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

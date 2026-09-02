import React from 'react';
import { NavLink } from 'react-router-dom';
import { useHOA } from '../context/HOAContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Car,
  FileSpreadsheet,
  AlertTriangle,
  Printer,
  Compass,
  Clock,
  ShieldAlert,
  LogOut,
  FolderLock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { usuarioActual } = useHOA();
  const { rol } = usuarioActual;

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-500 pl-3'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-100 shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-white p-0.5 flex items-center justify-center">
          <img src="/src/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-md" />
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight tracking-wide text-white">Las Palomas</h1>
          <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">HOA Control</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {/* Common Dashboard for Admin / Supervisor / Guardia */}
        {rol !== 'proveedor' && (
          <>
            <div className="text-xs font-semibold text-slate-600 px-3 uppercase tracking-wider mb-2">Panel Control</div>
            <NavLink to="/" end className={getLinkClass}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </>
        )}

        {/* Administration Links (Admin, Supervisor) */}
        {(rol === 'admin' || rol === 'supervisor') && (
          <>
            <div className="text-xs font-semibold text-slate-600 px-3 uppercase tracking-wider mt-5 mb-2">Administración</div>
            <NavLink to="/empresas" className={getLinkClass}>
              <Building2 size={18} />
              <span>Empresas</span>
            </NavLink>
            <NavLink to="/trabajadores" className={getLinkClass}>
              <Users size={18} />
              <span>Trabajadores</span>
            </NavLink>
            <NavLink to="/vehiculos" className={getLinkClass}>
              <Car size={18} />
              <span>Vehículos</span>
            </NavLink>
            <NavLink to="/corbatines" className={getLinkClass}>
              <Printer size={18} />
              <span>Imprimir Corbatines</span>
            </NavLink>
            <NavLink to="/usuarios" className={getLinkClass}>
              <Users size={18} />
              <span>Gestión de Cuentas</span>
            </NavLink>
          </>
        )}

        {/* Access and Security Controls (Admin, Supervisor, Guardia) */}
        {rol !== 'proveedor' && (
          <>
            <div className="text-xs font-semibold text-slate-600 px-3 uppercase tracking-wider mt-5 mb-2">Operaciones</div>
            <NavLink to="/caseta" className={getLinkClass}>
              <Compass size={18} />
              <span>Caseta Acceso</span>
            </NavLink>
            <NavLink to="/bitacora" className={getLinkClass}>
              <Clock size={18} />
              <span>Bitácora</span>
            </NavLink>
          </>
        )}

        {/* Sanctions & Approvals (Admin, Supervisor) */}
        {(rol === 'admin' || rol === 'supervisor') && (
          <>
            <div className="text-xs font-semibold text-slate-600 px-3 uppercase tracking-wider mt-5 mb-2">Reglamento</div>
            <NavLink to="/aprobaciones" className={getLinkClass}>
              <ShieldAlert size={18} />
              <span>Bandeja de Aprobaciones</span>
            </NavLink>
            <NavLink to="/sanciones" className={getLinkClass}>
              <AlertTriangle size={18} />
              <span>Lista de Sanciones</span>
            </NavLink>
          </>
        )}

        {/* Proveedor Specific Links */}
        {rol === 'proveedor' && (
          <>
            <div className="text-xs font-semibold text-slate-600 px-3 uppercase tracking-wider mb-2">Portal Proveedor</div>
            <NavLink to="/reglamento-proveedor" className={getLinkClass}>
              <FolderLock size={18} />
              <span>Reglamento HOA</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer / Role Switcher Reminder */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <NavLink
          to="/login"
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </NavLink>
      </div>
    </aside>
  );
};

import React from 'react';
import { useHOA } from '../context/HOAContext';
import { Shield, Sparkles, User, RefreshCw } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { usuarioActual, usuarios, setUsuarioActual } = useHOA();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = usuarios.find(u => u.id === e.target.value);
    if (selectedUser) {
      setUsuarioActual(selectedUser);
    }
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Administrador</span>;
      case 'supervisor':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Supervisor</span>;
      case 'guardia':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Seguridad Caseta</span>;
      case 'proveedor':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Contratista</span>;
      default:
        return null;
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 shadow-sm">
      {/* Search / Page Title */}
      <div className="flex items-center gap-3">
        <Shield className="text-slate-800" size={20} />
        <span className="font-semibold text-slate-800 hidden sm:inline-block">Control de Acceso y Gestión de Sanciones</span>
        <span className="text-slate-300 hidden sm:inline-block">|</span>
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-medium border border-indigo-100">
          <Sparkles size={13} />
          <span>Rocky Point A.C.</span>
        </div>
      </div>

      {/* Right Side: Demo Role Switcher & User Details */}
      <div className="flex items-center gap-4">
        {/* Switcher Indicator */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600">
          <RefreshCw size={14} className="text-slate-400 animate-spin-hover" />
          <span className="text-xs font-medium text-slate-500">Demo Rol:</span>
          <select
            value={usuarioActual.id}
            onChange={handleRoleChange}
            className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.rol.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-slate-800">{usuarioActual.nombre}</div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              {getRoleBadge(usuarioActual.rol)}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 shadow-inner bg-slate-100 flex items-center justify-center">
            {usuarioActual.avatar ? (
              <img src={usuarioActual.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

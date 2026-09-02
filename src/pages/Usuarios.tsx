import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Plus, Search, X, Shield, Users, Mail, Building, AlertCircle } from 'lucide-react';
import { Usuario } from '../types';

export const Usuarios: React.FC = () => {
  const { usuarios, usuarioActual, empresas, agregarUsuario } = useHOA();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rolDestino, setRolDestino] = useState<'supervisor' | 'guardia' | 'proveedor'>('supervisor');
  const [empresaId, setEmpresaId] = useState('');
  const [error, setError] = useState('');

  const activeCompanies = empresas.filter(e => e.estado === 'activo');

  const openAddModal = () => {
    setNombre('');
    setCorreo('');
    
    // Set default rol based on user's role
    if (usuarioActual.rol === 'admin') {
      setRolDestino('supervisor');
    } else {
      setRolDestino('guardia');
    }
    setEmpresaId(activeCompanies[0]?.id || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !correo) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (rolDestino === 'proveedor' && !empresaId) {
      setError('Debes seleccionar una empresa para vincular al proveedor.');
      return;
    }

    agregarUsuario({
      nombre,
      correo,
      rol: rolDestino,
      empresaId: rolDestino === 'proveedor' ? empresaId : undefined
    });

    setIsModalOpen(false);
  };

  // Filter users based on logged-in role permissions
  // Admin: only manages supervisores.
  // Supervisor: only manages guardias and proveedores.
  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase());

    const isPermitted =
      usuarioActual.rol === 'admin'
        ? u.rol === 'supervisor'
        : u.rol === 'guardia' || u.rol === 'proveedor';

    return matchesSearch && isPermitted;
  });

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'supervisor':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Supervisor</span>;
      case 'guardia':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Guardia Caseta</span>;
      case 'proveedor':
        return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">Proveedor</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Gestión de Cuentas y Accesos</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {usuarioActual.rol === 'admin'
              ? 'Administra las credenciales y accesos para el equipo de Supervisores de HOA.'
              : 'Administra y registra cuentas autorizadas para Guardias de Caseta y Proveedores Contratistas.'}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md transition-colors"
        >
          <Plus size={16} />
          <span>Crear Cuenta</span>
        </button>
      </div>

      {/* Filter and Search Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4 text-center">Rol Asignado</th>
                <th className="py-3 px-4 text-center">Empresa Vinculada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsuarios.length > 0 ? (
                filteredUsuarios.map((u) => {
                  const emp = empresas.find(e => e.id === u.empresaId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shadow-inner bg-slate-100 shrink-0">
                          <img src={u.avatar} alt={u.nombre} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{u.nombre}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">UID: {u.id}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600 font-mono text-xs">
                        {u.correo}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getRoleBadge(u.rol)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500 truncate max-w-[180px]">
                        {u.rol === 'proveedor' ? (emp ? emp.nombre : 'No asignada') : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron cuentas gestionadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Account Creation Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col gap-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Crear Nueva Cuenta</h3>
              <p className="text-xs text-slate-400 mt-0.5">Autoriza credenciales de ingreso para el HOA.</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg flex items-start gap-2.5 text-xs mb-1">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Oficial Ramón Pérez"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Ej. ramon@laspalomas.com"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rol de Cuenta</label>
                <select
                  value={rolDestino}
                  onChange={(e) => setRolDestino(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50 font-semibold"
                >
                  {usuarioActual.rol === 'admin' ? (
                    <option value="supervisor">Supervisor de HOA</option>
                  ) : (
                    <>
                      <option value="guardia">Guardia de Seguridad Caseta</option>
                      <option value="proveedor">Proveedor / Contratista Responsable</option>
                    </>
                  )}
                </select>
              </div>

              {rolDestino === 'proveedor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Empresa a Vincular</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                      value={empresaId}
                      onChange={(e) => setEmpresaId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50 font-semibold"
                    >
                      <option value="" disabled>Selecciona una empresa</option>
                      {activeCompanies.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

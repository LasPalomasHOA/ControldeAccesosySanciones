import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Plus, Search, Edit2, X, AlertCircle, ShieldAlert } from 'lucide-react';
import { Trabajador } from '../types';

export const Trabajadores: React.FC = () => {
  const { trabajadores, empresas, agregarTrabajador, editarTrabajador } = useHOA();
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'bloqueado' | 'pendiente'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<Trabajador | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [nss, setNss] = useState('');
  const [rol, setRol] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [estado, setEstado] = useState<'activo' | 'bloqueado' | 'pendiente'>('activo');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');

  // Get active companies list
  const activeCompanies = empresas.filter(e => e.estado === 'activo');

  const openAddModal = () => {
    setEditingTrabajador(null);
    setNombre('');
    setApellidos('');
    setNss('');
    setRol('');
    setEmpresaId(activeCompanies[0]?.id || '');
    setEstado('activo');
    setObservaciones('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (trab: Trabajador) => {
    setEditingTrabajador(trab);
    setNombre(trab.nombre || '');
    setApellidos(trab.apellidos || '');
    setNss(trab.nss || '');
    setRol(trab.rol || '');
    setEmpresaId(String(trab.empresaId || trab.id_empresa || ''));
    setEstado(trab.estado || 'activo');
    setObservaciones(trab.observaciones || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellidos || !nss || !rol || !empresaId) {
      setError('Todos los campos excepto observaciones son obligatorios.');
      return;
    }

    const nssRegex = /^\d{4}-\d{2}-\d{4}-\d{1}$/;
    if (!nssRegex.test(nss)) {
      setError('NSS inválido. Debe tener formato (ej. 1288-75-9983-1).');
      return;
    }

    const selectedEmpresa = empresas.find(e => e.id === empresaId);
    const empresaNombre = selectedEmpresa ? selectedEmpresa.nombre : '';

    // Choose mockup avatar photo
    const foto = editingTrabajador?.foto || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100) + 1500000000000}?auto=format&fit=crop&q=80&w=150`;

    if (editingTrabajador) {
      editarTrabajador({
        ...editingTrabajador,
        nombre,
        apellidos,
        nss,
        rol,
        empresaId,
        empresaNombre,
        estado,
        observaciones: observaciones || undefined
      });
    } else {
      agregarTrabajador({
        nombre,
        apellidos,
        nss,
        rol,
        empresaId,
        empresaNombre,
        foto,
        estado,
        observaciones: observaciones || undefined
      });
    }

    setIsModalOpen(false);
  };

  const filteredTrabajadores = trabajadores.filter(t => {
    const matchesSearch =
      (t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.apellidos || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.nss || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.rol || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = companyFilter === 'all' || t.empresaId === companyFilter;
    const matchesStatus = statusFilter === 'all' || t.estado === statusFilter;

    return matchesSearch && matchesCompany && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'activo':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full text-xs font-semibold">Activo</span>;
      case 'pendiente':
        return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full text-xs font-semibold">Pendiente</span>;
      case 'bloqueado':
        return <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full text-xs font-semibold">Bloqueado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Nómina de Trabajadores</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Registro, acreditación y estatus de ingreso para personal obrero de contratistas.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md transition-colors"
        >
          <Plus size={16} />
          <span>Registrar Trabajador</span>
        </button>
      </div>

      {/* Filter and Search Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre, NSS o puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Company Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empresa:</span>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 py-1.5 px-2.5 focus:outline-none"
            >
              <option value="all">Todas</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 py-1.5 px-2.5 focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="activo">Activos</option>
              <option value="pendiente">Pendientes</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Trabajador</th>
                <th className="py-3 px-4">NSS</th>
                <th className="py-3 px-4">Puesto / Rol</th>
                <th className="py-3 px-4">Empresa Contratista</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTrabajadores.length > 0 ? (
                filteredTrabajadores.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-inner">
                        <img src={t.foto} alt={t.nombre} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{t.nombre} {t.apellidos}</div>
                        <div className="text-slate-400 text-xs mt-0.5">ID: {t.id}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-bold text-slate-600">
                      {t.nss}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {t.rol}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold truncate max-w-[180px]">
                      {t.empresaNombre}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(t.estado)}
                      {t.estado === 'bloqueado' && t.observaciones && (
                        <div className="text-[9px] text-rose-500 font-bold block mt-1 hover:underline cursor-help" title={t.observaciones}>
                          Ver motivo
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(t)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No se encontraron trabajadores registrados con los criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Drawer (Registrar/Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-lg text-slate-800">
                {editingTrabajador ? 'Editar Trabajador' : 'Registrar Nuevo Trabajador'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg flex items-start gap-2.5 text-xs mb-5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Apellidos</label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej. Pérez López"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NSS (Seguro Social)</label>
                <input
                  type="text"
                  value={nss}
                  onChange={(e) => setNss(e.target.value)}
                  placeholder="Format: 1288-75-9983-1"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Puesto / Rol del Trabajador</label>
                <input
                  type="text"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  placeholder="Ej. Albañil Oficial, Electricista..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Empresa Asignada</label>
                <select
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50 font-semibold"
                >
                  <option value="" disabled>Selecciona una empresa</option>
                  {activeCompanies.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                  ))}
                </select>
                {activeCompanies.length === 0 && (
                  <span className="text-[10px] text-rose-500 block mt-1">
                    * No hay empresas activas registradas. Primero debes activar o registrar una empresa.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estatus de Acceso</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50 font-semibold"
                >
                  <option value="activo">Activo (Acceso Autorizado)</option>
                  <option value="pendiente">Pendiente (Revisión de documentos)</option>
                  <option value="bloqueado">Bloqueado (Restringido)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Observaciones / Motivo de Bloqueo</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles sobre bloqueos o requerimientos pendientes..."
                  rows={3}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                />
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={activeCompanies.length === 0}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors shadow"
                >
                  {editingTrabajador ? 'Actualizar Cambios' : 'Registrar Trabajador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

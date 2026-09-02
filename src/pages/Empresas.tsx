import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Plus, Search, Edit2, X, AlertCircle } from 'lucide-react';
import { Empresa } from '../types';

export const Empresas: React.FC = () => {
  const { empresas, agregarEmpresa, editarEmpresa } = useHOA();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'suspendido'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  
  // Form State
  const [nombre, setNombre] = useState('');
  const [rfc, setRfc] = useState('');
  const [responsable, setResponsable] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState<'activo' | 'suspendido'>('activo');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingEmpresa(null);
    setNombre('');
    setRfc('');
    setResponsable('');
    setTelefono('');
    setCorreo('');
    setEstado('activo');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Empresa) => {
    setEditingEmpresa(emp);
    setNombre(emp.nombre);
    setRfc(emp.rfc);
    setResponsable(emp.responsable);
    setTelefono(emp.telefono);
    setCorreo(emp.correo);
    setEstado(emp.estado);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !rfc || !responsable || !telefono || !correo) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const rfcRegex = /^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/i;
    if (!rfcRegex.test(rfc)) {
      setError('RFC inválido. Debe tener formato oficial (ej. CPU120304AA1).');
      return;
    }

    if (editingEmpresa) {
      editarEmpresa({
        ...editingEmpresa,
        nombre,
        rfc: rfc.toUpperCase(),
        responsable,
        telefono,
        correo,
        estado
      });
    } else {
      agregarEmpresa({
        id: `emp_${Date.now()}`,
        nombre,
        rfc: rfc.toUpperCase(),
        responsable,
        telefono,
        correo,
        estado
      });
    }

    setIsModalOpen(false);
  };

  const filteredEmpresas = empresas.filter(emp => {
    const matchesSearch =
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || emp.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 font-sans">Empresas Contratistas</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Registro y control de acceso para constructoras y empresas proveedoras.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md transition-colors"
        >
          <Plus size={16} />
          <span>Registrar Empresa</span>
        </button>
      </div>

      {/* Filter and Search Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nombre, RFC o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">Estado:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              statusFilter === 'all'
                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('activo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              statusFilter === 'activo'
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setStatusFilter('suspendido')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              statusFilter === 'suspendido'
                ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Suspendidas
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Empresa / RFC</th>
                <th className="py-3 px-4">Contacto Responsable</th>
                <th className="py-3 px-4 text-center">Nómina Autorizada</th>
                <th className="py-3 px-4 text-center">Vehículos Registrados</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmpresas.length > 0 ? (
                filteredEmpresas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{emp.nombre}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{emp.rfc}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-slate-800">{emp.responsable}</div>
                      <div className="text-slate-400 mt-0.5">{emp.telefono} &bull; {emp.correo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full text-xs">
                        {emp.totalTrabajadores} personal
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-cyan-50 text-cyan-600 font-bold px-2 py-0.5 rounded-full text-xs">
                        {emp.totalVehiculos} uni
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                          emp.estado === 'activo'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}
                      >
                        {emp.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(emp)}
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
                    No se encontraron empresas con los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Drawer (Registrar/Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex justify-end transition-opacity duration-300">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto transform transition-transform duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-lg text-slate-800">
                {editingEmpresa ? 'Editar Empresa' : 'Registrar Nueva Empresa'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg flex items-start gap-2.5 text-xs mb-5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Comercial</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Construcciones del Puerto S.A."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">RFC</label>
                <input
                  type="text"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value)}
                  placeholder="Ej. CPU120304AA1"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Responsable / Representante</label>
                <input
                  type="text"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  placeholder="Ej. Ing. Carlos Ortega"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 638-383-1245"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Ej. carlos@empresa.com"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estado Operativo</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as 'activo' | 'suspendido')}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50 font-semibold"
                >
                  <option value="activo" className="text-emerald-600 font-semibold">Activo / Habilitado</option>
                  <option value="suspendido" className="text-rose-600 font-semibold">Suspendido / Bloqueado</option>
                </select>
                <span className="text-[10px] text-slate-400 block mt-1.5 leading-relaxed">
                  * Las empresas suspendidas no podrán ingresar personal ni vehículos comercializados por la caseta principal.
                </span>
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
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow"
                >
                  {editingEmpresa ? 'Actualizar Cambios' : 'Registrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

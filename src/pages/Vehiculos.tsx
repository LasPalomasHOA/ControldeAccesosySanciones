import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Plus, Search, Edit2, X, AlertCircle, FileText, History, Info, ShieldAlert } from 'lucide-react';
import { Vehiculo } from '../types';

export const Vehiculos: React.FC = () => {
  const { vehiculos, empresas, sanciones, accesos, agregarVehiculo, editarVehiculo } = useHOA();
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'permitido' | 'alerta_sancion' | 'bloqueado'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);

  // Detail Modal State
  const [detailVehiculo, setDetailVehiculo] = useState<Vehiculo | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'sanciones' | 'accesos'>('general');

  // Form State
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [color, setColor] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [corbatinNumero, setCorbatinNumero] = useState('');
  const [corbatinVencimiento, setCorbatinVencimiento] = useState('');
  const [estadoAcceso, setEstadoAcceso] = useState<'permitido' | 'alerta_sancion' | 'bloqueado'>('permitido');
  const [error, setError] = useState('');

  const activeCompanies = empresas.filter(e => e.estado === 'activo');

  const openAddModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehiculo(null);
    setPlaca('');
    setMarca('');
    setModelo('');
    setColor('');
    setEmpresaId(activeCompanies[0]?.id || '');
    setCorbatinNumero('');
    setCorbatinVencimiento('');
    setEstadoAcceso('permitido');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehiculo, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehiculo(v);
    setPlaca(v.placa);
    setMarca(v.marca);
    setModelo(v.modelo);
    setColor(v.color);
    setEmpresaId(v.empresaId);
    setCorbatinNumero(v.corbatinNumero);
    setCorbatinVencimiento(v.corbatinVencimiento);
    setEstadoAcceso(v.estadoAcceso);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa || !marca || !modelo || !color || !empresaId || !corbatinNumero || !corbatinVencimiento) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const placaRegex = /^[A-Z0-9-]{6,10}$/i;
    if (!placaRegex.test(placa)) {
      setError('Placa inválida. Debe tener entre 6 y 10 caracteres alfanuméricos y guiones.');
      return;
    }

    const selectedEmpresa = empresas.find(e => e.id === empresaId);
    const empresaNombre = selectedEmpresa ? selectedEmpresa.nombre : '';

    if (editingVehiculo) {
      editarVehiculo({
        ...editingVehiculo,
        placa: placa.toUpperCase(),
        marca,
        modelo,
        color,
        empresaId,
        empresaNombre,
        corbatinNumero,
        corbatinVencimiento,
        estadoAcceso
      });
    } else {
      agregarVehiculo({
        placa: placa.toUpperCase(),
        marca,
        modelo,
        color,
        empresaId,
        empresaNombre,
        corbatinNumero,
        corbatinVencimiento,
        estadoAcceso
      });
    }

    setIsModalOpen(false);
  };

  const filteredVehiculos = vehiculos.filter(v => {
    const matchesSearch =
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.corbatinNumero.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = companyFilter === 'all' || v.empresaId === companyFilter;
    const matchesStatus = statusFilter === 'all' || v.estadoAcceso === statusFilter;

    return matchesSearch && matchesCompany && matchesStatus;
  });

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

  // Associated details for selected vehicle
  const vehicleSanciones = detailVehiculo
    ? sanciones.filter(s => s.placa === detailVehiculo.placa)
    : [];

  const vehicleAccesos = detailVehiculo
    ? accesos.filter(a => a.placa === detailVehiculo.placa)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Parque Vehicular Autorizado</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestión de vehículos comerciales, matrículas restringidas y corbatines de acceso.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md transition-colors"
        >
          <Plus size={16} />
          <span>Registrar Vehículo</span>
        </button>
      </div>

      {/* Filter and Search Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por placa, modelo o corbatín..."
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
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estatus:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 py-1.5 px-2.5 focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="permitido">Permitidos</option>
              <option value="alerta_sancion">Con Advertencias</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50/50">
                <th className="py-3 px-4">Placa / Unidad</th>
                <th className="py-3 px-4">Empresa Asignada</th>
                <th className="py-3 px-4 text-center">Corbatín / Vence</th>
                <th className="py-3 px-4 text-center">Reincidencias</th>
                <th className="py-3 px-4 text-center">Estatus Acceso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVehiculos.length > 0 ? (
                filteredVehiculos.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => { setDetailVehiculo(v); setActiveTab('general'); }}
                    className="hover:bg-slate-50/50 transition-colors font-medium cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-900 text-cyan-400 font-mono font-bold text-sm px-2.5 py-1 rounded shadow-sm border border-slate-800">
                        {v.placa}
                      </span>
                      <span className="text-slate-500 font-semibold text-xs ml-3">
                        {v.marca} {v.modelo} &bull; <span className="text-slate-400">{v.color}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 truncate max-w-[200px]">
                      {v.empresaNombre}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-slate-800">{v.corbatinNumero}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Vence: {v.corbatinVencimiento}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                          v.reincidencias >= 3
                            ? 'bg-rose-100 text-rose-700'
                            : v.reincidencias > 0
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {v.reincidencias} faltas
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getVehiculoStatusBadge(v.estadoAcceso)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => openEditModal(v, e)}
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
                    No se encontraron vehículos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sliding Drawer (associated list of logs, sanctions etc) */}
      {detailVehiculo && (
        <div className="fixed inset-0 bg-slate-950/60 z-40 flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="bg-slate-900 text-cyan-400 font-mono font-bold text-base px-3 py-1 rounded border border-slate-800">
                  {detailVehiculo.placa}
                </span>
                <span className="text-slate-500 font-bold ml-3 text-sm">
                  {detailVehiculo.marca} {detailVehiculo.modelo}
                </span>
              </div>
              <button
                onClick={() => setDetailVehiculo(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 -mb-px transition-colors ${
                  activeTab === 'general' ? 'border-cyan-500 text-slate-800' : 'border-transparent hover:text-slate-700'
                }`}
              >
                <Info size={14} />
                General
              </button>
              <button
                onClick={() => setActiveTab('sanciones')}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 -mb-px transition-colors ${
                  activeTab === 'sanciones' ? 'border-cyan-500 text-slate-800' : 'border-transparent hover:text-slate-700'
                }`}
              >
                <ShieldAlert size={14} />
                Historial Sanciones ({vehicleSanciones.length})
              </button>
              <button
                onClick={() => setActiveTab('accesos')}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 -mb-px transition-colors ${
                  activeTab === 'accesos' ? 'border-cyan-500 text-slate-800' : 'border-transparent hover:text-slate-700'
                }`}
              >
                <History size={14} />
                Historial Accesos ({vehicleAccesos.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 space-y-4">
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-slate-400 uppercase tracking-wide font-bold">Placa</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">{detailVehiculo.placa}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-slate-400 uppercase tracking-wide font-bold">Color Unidad</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">{detailVehiculo.color}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-slate-400 uppercase tracking-wide font-bold">Marca / Modelo</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">{detailVehiculo.marca} {detailVehiculo.modelo}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-slate-400 uppercase tracking-wide font-bold">Empresa Asignada</div>
                      <div className="text-sm font-bold text-slate-800 mt-1 truncate">{detailVehiculo.empresaNombre}</div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={15} className="text-slate-400" />
                      Acreditación de Corbatín Contratista
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                      <div>
                        <span className="text-slate-400">Número Corbatín:</span>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{detailVehiculo.corbatinNumero}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Vencimiento:</span>
                        <div className="font-bold text-slate-800 text-sm mt-0.5">{detailVehiculo.corbatinVencimiento}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estatus de Acceso Actual</h4>
                    <div className="flex items-center gap-3">
                      {getVehiculoStatusBadge(detailVehiculo.estadoAcceso)}
                      <span className="text-xs text-slate-400 font-medium">
                        Tiene {detailVehiculo.reincidencias} faltas registradas. El acceso se bloquea tras la 3ra sanción activa.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sanciones' && (
                <div className="space-y-3">
                  {vehicleSanciones.length > 0 ? (
                    vehicleSanciones.map(san => (
                      <div key={san.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50 flex items-start gap-3">
                        <AlertCircle className={`shrink-0 mt-0.5 ${san.estado === 'activa' ? 'text-rose-500' : 'text-slate-400'}`} size={16} />
                        <div className="text-xs font-medium space-y-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{san.infraccionCodigo} ({san.infraccionDescripcion})</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              san.estado === 'activa'
                                ? 'bg-rose-50 text-rose-600'
                                : san.estado === 'resuelta'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-150 text-slate-500'
                            }`}>
                              {san.estado}
                            </span>
                          </div>
                          <p className="text-slate-400">Aplicado: {new Date(san.fechaSancion).toLocaleDateString()}</p>
                          <div className="text-slate-500 leading-relaxed font-semibold">Multa: ${san.montoMulta} USD</div>
                          {san.comentarios && <p className="text-slate-400 italic font-normal">Nota: "{san.comentarios}"</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6 font-medium">Este vehículo no cuenta con historial de infracciones.</p>
                  )}
                </div>
              )}

              {activeTab === 'accesos' && (
                <div className="space-y-3">
                  {vehicleAccesos.length > 0 ? (
                    vehicleAccesos.map(acc => (
                      <div key={acc.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between text-xs font-medium">
                        <div>
                          <div className="font-bold text-slate-800">{acc.cabina}</div>
                          <div className="text-slate-400 mt-0.5">Registró: {acc.agenteNombre}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.tipo === 'entrada' ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-150 text-slate-600'
                          }`}>
                            {acc.tipo === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                          </span>
                          <div className="text-slate-400 mt-1">{new Date(acc.fechaHora).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6 font-medium">No hay registros de ingreso/salida para esta matrícula.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Drawer (Registrar/Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-lg text-slate-800">
                {editingVehiculo ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
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
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Número de Placa</label>
                <input
                  type="text"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  placeholder="Ej. SON-88-29"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Marca</label>
                  <input
                    type="text"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Ej. Ford"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Modelo</label>
                  <input
                    type="text"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ej. F-150"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Blanco"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Empresa Propietaria</label>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nº de Corbatín</label>
                  <input
                    type="text"
                    value={corbatinNumero}
                    onChange={(e) => setCorbatinNumero(e.target.value)}
                    placeholder="Ej. C-102"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vencimiento Acreditación</label>
                  <input
                    type="date"
                    value={corbatinVencimiento}
                    onChange={(e) => setCorbatinVencimiento(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estatus de Acceso Inicial</label>
                <select
                  value={estadoAcceso}
                  onChange={(e) => setEstadoAcceso(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50 font-semibold"
                >
                  <option value="permitido">Permitido (Habilitado)</option>
                  <option value="alerta_sancion">Alerta Sanción (Amonestaciones)</option>
                  <option value="bloqueado">Bloqueado (Entrada Denegada)</option>
                </select>
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
                  {editingVehiculo ? 'Actualizar Cambios' : 'Registrar Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Search, Compass, ArrowLeftRight, CheckCircle, AlertTriangle, UserCheck, ShieldClose, Clock, Plus, X, AlertCircle } from 'lucide-react';
import { Vehiculo, Trabajador } from '../types';

export const Caseta: React.FC = () => {
  const {
    vehiculos,
    trabajadores,
    accesos,
    agregarAcceso,
    empresas,
    agregarTrabajador,
    agregarVehiculo
  } = useHOA();

  // Selected state
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [selectedTrabajador, setSelectedTrabajador] = useState<Trabajador | null>(null);
  const [cabina, setCabina] = useState('Cabina Principal 1');
  const [observaciones, setObservaciones] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Quick Registration Modals
  const [isQuickWorkerOpen, setIsQuickWorkerOpen] = useState(false);
  const [isQuickVehicleOpen, setIsQuickVehicleOpen] = useState(false);

  // Quick Worker Form State
  const [qwNombre, setQwNombre] = useState('');
  const [qwApellidos, setQwApellidos] = useState('');
  const [qwNss, setQwNss] = useState('');
  const [qwEmpresaId, setQwEmpresaId] = useState('');
  const [qwError, setQwError] = useState('');

  // Quick Vehicle Form State
  const [qvPlaca, setQvPlaca] = useState('');
  const [qvMarca, setQvMarca] = useState('');
  const [qvModelo, setQvModelo] = useState('');
  const [qvColor, setQvColor] = useState('');
  const [qvCorbatin, setQvCorbatin] = useState('');
  const [qvVence, setQvVence] = useState('');
  const [qvEmpresaId, setQvEmpresaId] = useState('');
  const [qvError, setQvError] = useState('');

  const activeCompanies = empresas.filter(e => e.estado === 'activo');

  const matchedVehicles = plateSearch.trim()
    ? vehiculos.filter(v => (v.placa || v.placas || '').toLowerCase().includes(plateSearch.toLowerCase()))
    : [];

  const handleSelectVehiculo = (v: Vehiculo) => {
    setSelectedVehiculo(v);
    setPlateSearch(v.placa || v.placas || '');
    // Find workers of same company
    const companyWorkers = trabajadores.filter(t => t.empresaId === v.empresaId && t.estado === 'activo');
    setSelectedTrabajador(companyWorkers[0] || null);
  };

  const handleRegisterAccess = (tipo: 'entrada' | 'salida') => {
    if (!selectedVehiculo) return;

    agregarAcceso({
      vehiculoId: selectedVehiculo.id,
      trabajadorId: selectedTrabajador?.id,
      placa: selectedVehiculo.placa,
      trabajadorNombre: selectedTrabajador
        ? `${selectedTrabajador.nombre} ${selectedTrabajador.apellidos}`
        : undefined,
      empresaNombre: selectedVehiculo.empresaNombre,
      tipo,
      agenteNombre: 'Oficial Caseta (Demo)',
      observaciones: observaciones || undefined,
      cabina
    });

    setSuccessMessage(`Acceso de ${tipo.toUpperCase()} registrado exitosamente para la placa ${selectedVehiculo.placa}.`);
    
    // Clear form
    setPlateSearch('');
    setSelectedVehiculo(null);
    setSelectedTrabajador(null);
    setObservaciones('');

    setTimeout(() => {
      setSuccessMessage('');
    }, 4500);
  };

  const handleSaveQuickWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qwNombre || !qwApellidos || !qwNss || !qwEmpresaId) {
      setQwError('Todos los campos son obligatorios.');
      return;
    }

    const nssRegex = /^\d{4}-\d{2}-\d{4}-\d{1}$/;
    if (!nssRegex.test(qwNss)) {
      setQwError('NSS inválido. Formato correcto: 1288-75-9983-1.');
      return;
    }

    const selectedEmp = empresas.find(emp => emp.id === qwEmpresaId);
    agregarTrabajador({
      nombre: qwNombre,
      apellidos: qwApellidos,
      nss: qwNss,
      rol: 'Chofer Comercial',
      empresaId: qwEmpresaId,
      empresaNombre: selectedEmp ? selectedEmp.nombre : 'Proveedor',
      foto: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100) + 1500000000000}?auto=format&fit=crop&q=80&w=150`,
      estado: 'activo'
    });

    setSuccessMessage(`Trabajador ${qwNombre} registrado de forma rápida y habilitado para ingreso.`);
    setIsQuickWorkerOpen(false);
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  const handleSaveQuickVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qvPlaca || !qvMarca || !qvModelo || !qvColor || !qvCorbatin || !qvVence || !qvEmpresaId) {
      setQvError('Todos los campos son obligatorios.');
      return;
    }

    const placaRegex = /^[A-Z0-9-]{6,10}$/i;
    if (!placaRegex.test(qvPlaca)) {
      setQvError('Placa inválida (6-10 caracteres alfanuméricos).');
      return;
    }

    const selectedEmp = empresas.find(emp => emp.id === qvEmpresaId);
    agregarVehiculo({
      placa: qvPlaca.toUpperCase(),
      marca: qvMarca,
      modelo: qvModelo,
      color: qvColor,
      empresaId: qvEmpresaId,
      empresaNombre: selectedEmp ? selectedEmp.nombre : 'Proveedor',
      corbatinNumero: qvCorbatin,
      corbatinVencimiento: qvVence,
      estadoAcceso: 'permitido'
    });

    setSuccessMessage(`Unidad ${qvPlaca} registrada de forma rápida y habilitada para acceso.`);
    setIsQuickVehicleOpen(false);
    
    // Auto-select the newly added vehicle
    setTimeout(() => {
      const addedVeh = vehiculos.find(v => v.placa === qvPlaca.toUpperCase());
      if (addedVeh) {
        handleSelectVehiculo(addedVeh);
      }
      setSuccessMessage('');
    }, 1500);
  };

  const getEstatusColor = (status?: string) => {
    switch (status) {
      case 'permitido':
        return 'border-emerald-500 bg-emerald-50/20 text-emerald-700';
      case 'alerta_sancion':
        return 'border-amber-500 bg-amber-50/20 text-amber-700';
      case 'bloqueado':
        return 'border-rose-500 bg-rose-50/20 text-rose-700';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Compass size={24} className="text-cyan-500" />
            Caseta de Control de Acceso (Tablet Layout)
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Registro ágil de entradas y salidas de contratistas con validación automática de sanciones y reincidencias.
          </p>
        </div>

        {/* Quick Registration Actions for Guards */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setQwNombre('');
              setQwApellidos('');
              setQwNss('');
              setQwEmpresaId(activeCompanies[0]?.id || '');
              setQwError('');
              setIsQuickWorkerOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow-md transition-colors"
          >
            <Plus size={14} />
            <span>Chofer Express</span>
          </button>
          <button
            onClick={() => {
              setQvPlaca('');
              setQvMarca('');
              setQvModelo('');
              setQvColor('');
              setQvCorbatin('');
              setQvVence('');
              setQvEmpresaId(activeCompanies[0]?.id || '');
              setQvError('');
              setIsQuickVehicleOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 text-xs shadow-md transition-colors"
          >
            <Plus size={14} />
            <span>Vehículo Express</span>
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-md flex items-center gap-3 font-semibold text-xs animate-pulse">
          <CheckCircle size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tablet Layout Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Side 3 Columns: Check-in / Check-out Form */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            Registro de Acceso Vehicular
          </h3>

          <div className="space-y-4">
            {/* Cabina Selector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cabina / Filtro:</label>
                <select
                  value={cabina}
                  onChange={(e) => setCabina(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 bg-slate-50"
                >
                  <option>Cabina Principal 1</option>
                  <option>Cabina Principal 2</option>
                  <option>Acceso Norte</option>
                  <option>Acceso Sur</option>
                </select>
              </div>
            </div>

            {/* Vehicle Plate Search input */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Búsqueda de Matrícula (Placa):</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Escribe la placa (ej. SON-88-29 o 11-23)..."
                  value={plateSearch}
                  onChange={(e) => {
                    setPlateSearch(e.target.value);
                    if (selectedVehiculo && e.target.value !== selectedVehiculo.placa) {
                      setSelectedVehiculo(null);
                      setSelectedTrabajador(null);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 font-mono font-bold"
                />
              </div>

              {/* Autocomplete dropdown */}
              {matchedVehicles.length > 0 && !selectedVehiculo && (
                <div className="absolute left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl mt-1.5 max-h-48 overflow-y-auto z-20 divide-y divide-slate-100">
                  {matchedVehicles.map(v => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVehiculo(v)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between text-xs font-medium"
                    >
                      <div>
                        <span className="bg-slate-900 text-cyan-400 font-mono font-bold px-2 py-0.5 rounded mr-3">{v.placa}</span>
                        <span className="text-slate-800 font-semibold">{v.marca} {v.modelo} &bull; {v.empresaNombre}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                        v.estadoAcceso === 'permitido' ? 'bg-emerald-50 text-emerald-600' :
                        v.estadoAcceso === 'alerta_sancion' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {v.estadoAcceso}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Vehicle Info Card */}
            {selectedVehiculo && (
              <div className={`p-4 border-[2px] rounded-xl flex flex-col gap-3.5 transition-all ${getEstatusColor(selectedVehiculo.estadoAcceso)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">Detalles del Vehículo</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedVehiculo.marca} {selectedVehiculo.modelo} &bull; {selectedVehiculo.color}</p>
                    <span className="text-xs text-slate-500 block font-semibold mt-1">Propietario: {selectedVehiculo.empresaNombre}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Tarjetón</span>
                    <span className="font-extrabold text-slate-800 text-sm block font-mono">{selectedVehiculo.corbatinNumero}</span>
                  </div>
                </div>

                {/* Warnings Display */}
                {selectedVehiculo.estadoAcceso === 'bloqueado' && (
                  <div className="bg-rose-5050/10 border border-rose-500/20 text-rose-600 p-3 rounded-lg flex items-start gap-2.5 text-xs font-bold leading-normal">
                    <ShieldClose size={18} className="shrink-0 mt-0.5" />
                    <div>
                      ACCESO RESTRINGIDO PERMANENTE O TEMPORAL. 
                      <p className="font-normal text-[11px] mt-1 text-rose-500/90">
                        Esta matrícula cuenta con {selectedVehiculo.reincidencias} infracciones activas. El reglamento de HOA bloquea automáticamente accesos tras acumular 3 faltas.
                      </p>
                    </div>
                  </div>
                )}

                {selectedVehiculo.estadoAcceso === 'alerta_sancion' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-3 rounded-lg flex items-start gap-2.5 text-xs font-bold leading-normal">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      ALERTA: UNIDAD CON SANCIONES ACTIVAS ({selectedVehiculo.reincidencias} FALTAS).
                      <p className="font-normal text-[11px] mt-1 text-amber-600/90">
                        Permitir ingreso solo tras validar que el conductor cuenta con orden especial de supervisión. Registre comentarios del ingreso.
                      </p>
                    </div>
                  </div>
                )}

                {/* Driver Selector */}
                <div className="border-t border-slate-200/40 pt-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Conductor Asignado:</label>
                  <select
                    value={selectedTrabajador?.id || ''}
                    onChange={(e) => setSelectedTrabajador(trabajadores.find(t => t.id === e.target.value) || null)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 bg-white"
                  >
                    <option value="">-- Sin conductor registrado (Vehículo vacío) --</option>
                    {trabajadores
                      .filter(t => t.empresaId === selectedVehiculo.empresaId && t.estado === 'activo')
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nombre} {t.apellidos} ({t.rol})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Observations input */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comentarios / Bitácora de Caseta:</label>
                  <textarea
                    placeholder="Escribe anomalías o motivos del acceso..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 bg-white text-slate-700"
                  />
                </div>

                {/* Gate Trigger Actions */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200/40 pt-4 bg-transparent">
                  <button
                    onClick={() => handleRegisterAccess('entrada')}
                    disabled={selectedVehiculo.estadoAcceso === 'bloqueado'}
                    className={`py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 ${
                      selectedVehiculo.estadoAcceso === 'bloqueado'
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span>Registrar Entrada</span>
                  </button>
                  <button
                    onClick={() => handleRegisterAccess('salida')}
                    className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight size={16} />
                    <span>Registrar Salida</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side 2 Columns: Live Stream of Recent Operations */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[525px] overflow-hidden">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={16} className="text-slate-500" />
            Ingresos Recientes
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {accesos.slice(0, 7).map((acc) => (
              <div key={acc.id} className="p-3 border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 rounded-xl text-xs font-medium space-y-1.5 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-900 text-cyan-400 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                    {acc.placa || 'PE-0000'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    acc.tipo === 'entrada' ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-150 text-slate-600'
                  }`}>
                    {acc.tipo === 'entrada' ? 'Ingreso' : 'Salida'}
                  </span>
                </div>
                <div className="text-slate-850 font-semibold truncate">
                  Conductor: {acc.trabajadorNombre || 'No especificado'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Firma: {acc.agenteNombre} &bull; {acc.cabina}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold truncate bg-slate-100/50 px-2 py-1 rounded">
                  {new Date(acc.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {acc.empresaNombre}
                </div>
                {acc.observaciones && (
                  <p className="text-[10px] text-rose-500 font-bold border-l-2 border-rose-500 pl-1.5 italic mt-1.5">
                    Nota: "{acc.observaciones}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK WORKER MODAL (Guards registration express) */}
      {isQuickWorkerOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col gap-4 relative">
            <button onClick={() => setIsQuickWorkerOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5">
              <X size={18} />
            </button>

            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-base text-slate-800">Registro Rápido de Chofer (Express)</h3>
              <p className="text-xs text-slate-400">Registra un conductor no acreditado previamente.</p>
            </div>

            {qwError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg flex gap-2 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{qwError}</div>
              </div>
            )}

            <form onSubmit={handleSaveQuickWorker} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={qwNombre}
                    onChange={(e) => setQwNombre(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none"
                    placeholder="Ej. Martín"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={qwApellidos}
                    onChange={(e) => setQwApellidos(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none"
                    placeholder="Ej. Ramos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">NSS (Seguro Social)</label>
                <input
                  type="text"
                  value={qwNss}
                  onChange={(e) => setQwNss(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  placeholder="Format: 1288-75-9983-1"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Empresa Contratista</label>
                <select
                  value={qwEmpresaId}
                  onChange={(e) => setQwEmpresaId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none font-bold"
                >
                  <option value="" disabled>Selecciona una empresa</option>
                  {activeCompanies.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuickWorkerOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-slate-900 text-white rounded-xl shadow hover:bg-slate-800">
                  Registrar Chofer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VEHICLE MODAL (Guards registration express) */}
      {isQuickVehicleOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col gap-4 relative">
            <button onClick={() => setIsQuickVehicleOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5">
              <X size={18} />
            </button>

            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-bold text-base text-slate-800">Registro Rápido de Vehículo (Express)</h3>
              <p className="text-xs text-slate-400">Registra una unidad comercial no acreditada previamente.</p>
            </div>

            {qvError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg flex gap-2 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{qvError}</div>
              </div>
            )}

            <form onSubmit={handleSaveQuickVehicle} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Matrícula (Placa)</label>
                <input
                  type="text"
                  value={qvPlaca}
                  onChange={(e) => setQvPlaca(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none font-mono font-bold"
                  placeholder="Ej. SON-88-29"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Marca</label>
                  <input
                    type="text"
                    value={qvMarca}
                    onChange={(e) => setQvMarca(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none"
                    placeholder="Ej. Ford"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Modelo</label>
                  <input
                    type="text"
                    value={qvModelo}
                    onChange={(e) => setQvModelo(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none"
                    placeholder="Ej. F-150"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Color</label>
                  <input
                    type="text"
                    value={qvColor}
                    onChange={(e) => setQvColor(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none"
                    placeholder="Ej. Blanco"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Número de Tarjetón</label>
                  <input
                    type="text"
                    value={qvCorbatin}
                    onChange={(e) => setQvCorbatin(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none"
                    placeholder="Ej. C-199"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Vencimiento Acreditación</label>
                  <input
                    type="date"
                    value={qvVence}
                    onChange={(e) => setQvVence(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Empresa Contratista</label>
                <select
                  value={qvEmpresaId}
                  onChange={(e) => setQvEmpresaId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none font-bold"
                >
                  <option value="" disabled>Selecciona una empresa</option>
                  {activeCompanies.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuickVehicleOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-slate-900 text-white rounded-xl shadow hover:bg-slate-800">
                  Registrar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

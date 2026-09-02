import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { ShieldCheck, BookOpen, AlertTriangle, FileText, CheckCircle2, Users, Car, Plus, X, AlertCircle } from 'lucide-react';

export const ReglamentoProveedor: React.FC = () => {
  const {
    usuarioActual,
    empresas,
    trabajadores,
    vehiculos,
    reglamentoAceptado,
    aceptarReglamento,
    agregarTrabajador,
    agregarVehiculo
  } = useHOA();

  const empresaId = usuarioActual.empresaId || 'emp1';
  const empresa = empresas.find(e => e.id === empresaId);

  // Checkbox acknowledgment states
  const [chkSpeed, setChkSpeed] = useState(false);
  const [chkWaste, setChkWaste] = useState(false);
  const [chkNoise, setChkNoise] = useState(false);
  const [chkConduct, setChkConduct] = useState(false);

  const isAccepted = reglamentoAceptado[empresaId] === true;
  const canAccept = chkSpeed && chkWaste && chkNoise && chkConduct;

  const handleAcceptance = () => {
    if (canAccept) {
      aceptarReglamento(empresaId);
    }
  };

  // Modals visibility
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Add Worker Form State
  const [wNombre, setWNombre] = useState('');
  const [wApellidos, setWApellidos] = useState('');
  const [wNss, setWNss] = useState('');
  const [wRol, setWRol] = useState('');
  const [wError, setWError] = useState('');

  // Add Vehicle Form State
  const [vPlaca, setVPlaca] = useState('');
  const [vMarca, setVMarca] = useState('');
  const [vModelo, setVModelo] = useState('');
  const [vColor, setVColor] = useState('');
  const [vCorbatin, setVCorbatin] = useState('');
  const [vVence, setVVence] = useState('');
  const [vError, setVError] = useState('');

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wNombre || !wApellidos || !wNss || !wRol) {
      setWError('Todos los campos son obligatorios.');
      return;
    }

    const nssRegex = /^\d{4}-\d{2}-\d{4}-\d{1}$/;
    if (!nssRegex.test(wNss)) {
      setWError('NSS inválido. Debe tener formato (ej. 1288-75-9983-1).');
      return;
    }

    agregarTrabajador({
      nombre: wNombre,
      apellidos: wApellidos,
      nss: wNss,
      rol: wRol,
      empresaId,
      empresaNombre: empresa ? empresa.nombre : 'Proveedor',
      foto: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100) + 1500000000000}?auto=format&fit=crop&q=80&w=150`,
      estado: 'activo'
    });

    setIsWorkerModalOpen(false);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vPlaca || !vMarca || !vModelo || !vColor || !vCorbatin || !vVence) {
      setVError('Todos los campos son obligatorios.');
      return;
    }

    const placaRegex = /^[A-Z0-9-]{6,10}$/i;
    if (!placaRegex.test(vPlaca)) {
      setVError('Placa inválida. Debe tener entre 6 y 10 caracteres alfanuméricos y guiones.');
      return;
    }

    agregarVehiculo({
      placa: vPlaca.toUpperCase(),
      marca: vMarca,
      modelo: vModelo,
      color: vColor,
      empresaId,
      empresaNombre: empresa ? empresa.nombre : 'Proveedor',
      corbatinNumero: vCorbatin,
      corbatinVencimiento: vVence,
      estadoAcceso: 'permitido'
    });

    setIsVehicleModalOpen(false);
  };

  // Filter own assets
  const misTrabajadores = trabajadores.filter(t => t.empresaId === empresaId);
  const misVehiculos = vehiculos.filter(v => v.empresaId === empresaId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <BookOpen className="text-indigo-600" size={24} />
          Portal de Contratistas y Proveedores
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Consulta tu nómina autorizada, vehículos registrados y aceptación del reglamento de HOA.
        </p>
      </div>

      {/* CASE 1: NOT ACCEPTED YET - Regulation Visor */}
      {!isAccepted ? (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Visual Header */}
          <div className="bg-slate-900 text-white p-6 text-center space-y-2">
            <ShieldCheck className="text-cyan-400 w-12 h-12 mx-auto animate-pulse" />
            <h3 className="text-lg font-extrabold tracking-wide uppercase">Lectura Obligatoria de Reglamento</h3>
            <p className="text-xs text-slate-400">
              Para habilitar tus acreditaciones en caseta, debes aceptar el reglamento interno.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Warning Banner */}
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs flex items-start gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Atención:</strong> Las unidades de <strong>{empresa?.nombre}</strong> no podrán cruzar los accesos de seguridad a partir de mañana si el responsable no acepta digitalmente los términos descritos abajo.
              </div>
            </div>

            {/* Scrollable Doc Visor */}
            <div className="h-60 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-4 text-xs text-slate-650 leading-relaxed font-semibold space-y-4 shadow-inner">
              <h4 className="font-extrabold text-slate-800 text-center text-sm border-b border-slate-200 pb-2">
                REGLAMENTO DE CONTRATISTAS - LAS PALOMAS HOA
              </h4>
              
              <div>
                <h5 className="font-extrabold text-slate-800 uppercase">Artículo 1: Velocidades Máximas</h5>
                <p className="mt-1">
                  Todo vehículo comercial, de carga o de personal de contratistas tiene estrictamente prohibido superar los 10 km/h dentro del desarrollo. El exceso de velocidad constituye una falta grave sujeta a sanción de $100 USD.
                </p>
              </div>

              <div>
                <h5 className="font-extrabold text-slate-800 uppercase">Artículo 2: Gestión de Residuos</h5>
                <p className="mt-1">
                  Es responsabilidad de la constructora remover diariamente todo escombro, material sobrante y basura (incluyendo empaques y restos de comida). El vertido de escombros en lotes vecinos o áreas verdes conlleva multa de $150 USD.
                </p>
              </div>

              <div>
                <h5 className="font-extrabold text-slate-800 uppercase">Artículo 3: Horarios de Ruido</h5>
                <p className="mt-1">
                  Las labores que generen ruido (uso de rotomartillos, sierras, etc.) están limitadas de Lunes a Viernes de 8:00 AM a 5:00 PM y Sábados de 8:00 AM a 1:00 PM. Trabajar fuera de horario conlleva sanción de $150 USD y suspensión temporal de labores.
                </p>
              </div>

              <div>
                <h5 className="font-extrabold text-slate-800 uppercase">Artículo 4: Estacionamiento y Vialidad</h5>
                <p className="mt-1">
                  Queda prohibido estacionarse sobre banquetas, rampas de discapacitados, carriles de circulación general o frente a hidrantes. Se aplicará sanción de $50 USD por obstrucción.
                </p>
              </div>

              <div>
                <h5 className="font-extrabold text-slate-800 uppercase">Artículo 5: Acumulación de Sanciones</h5>
                <p className="mt-1">
                  La acumulación de 3 infracciones activas (no pagadas) para una misma placa vehicular o una misma empresa provocará el bloqueo inmediato del tarjetón de acceso por caseta principal por un período mínimo de 15 días.
                </p>
              </div>
            </div>

            {/* Checkbox inputs */}
            <div className="space-y-3.5 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-700">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chkSpeed}
                  onChange={(e) => setChkSpeed(e.target.checked)}
                  className="rounded border-slate-350 text-cyan-600 focus:ring-cyan-500 shrink-0 mt-0.5"
                />
                <span>Entiendo y respetará el límite de velocidad máxima de <strong>10 km/h</strong>.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chkWaste}
                  onChange={(e) => setChkWaste(e.target.checked)}
                  className="rounded border-slate-350 text-cyan-600 focus:ring-cyan-500 shrink-0 mt-0.5"
                />
                <span>Me comprometo a retirar diariamente escombros y mantener limpio el frente de la obra.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chkNoise}
                  onChange={(e) => setChkNoise(e.target.checked)}
                  className="rounded border-slate-350 text-cyan-600 focus:ring-cyan-500 shrink-0 mt-0.5"
                />
                <span>Respetaré los horarios ruidosos permitidos y terminaré labores ruidosas a las 5:00 PM.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chkConduct}
                  onChange={(e) => setChkConduct(e.target.checked)}
                  className="rounded border-slate-350 text-cyan-600 focus:ring-cyan-500 shrink-0 mt-0.5"
                />
                <span>Acepto que tras acumular 3 multas activas mis accesos vehiculares serán bloqueados automáticamente.</span>
              </label>
            </div>

            {/* Accept Button */}
            <div className="border-t border-slate-100 pt-5 flex items-center justify-end bg-white">
              <button
                onClick={handleAcceptance}
                disabled={!canAccept}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all duration-200 uppercase tracking-widest"
              >
                <ShieldCheck size={16} />
                <span>Confirmar y Aceptar Reglamento</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CASE 2: ACCEPTED - Show Provider dashboard */
        <div className="space-y-6">
          {/* Status Header Banner */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Empresa Contratista</div>
              <h3 className="text-lg font-black text-slate-800 mt-1">{empresa?.nombre}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">RFC: {empresa?.rfc} &bull; Representante: {empresa?.responsable}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-sm">
                <CheckCircle2 size={15} />
                <span>Reglamento Aceptado</span>
              </div>
              <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wider ${
                empresa?.estado === 'activo' ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-rose-50 text-rose-600 border-rose-150'
              }`}>
                Estado: {empresa?.estado}
              </span>
            </div>
          </div>

          {/* Grid Tables for their own workers and vehicles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* own Workers list */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users size={16} className="text-slate-500" />
                    Mis Trabajadores Autorizados
                  </h3>
                  <button
                    onClick={() => {
                      setWNombre('');
                      setWApellidos('');
                      setWNss('');
                      setWRol('');
                      setWError('');
                      setIsWorkerModalOpen(true);
                    }}
                    className="text-xs bg-slate-900 hover:bg-slate-850 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus size={13} />
                    <span>Registrar</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {misTrabajadores.map(trab => (
                    <div key={trab.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-medium bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-inner bg-slate-100 shrink-0">
                          <img src={trab.foto} alt={trab.nombre} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{trab.nombre} {trab.apellidos}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{trab.rol} &bull; NSS: {trab.nss}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        trab.estado === 'activo' ? 'bg-emerald-50 text-emerald-600' :
                        trab.estado === 'pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {trab.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* own Vehicles list */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Car size={16} className="text-slate-500" />
                    Mis Vehículos y Tarjetones
                  </h3>
                  <button
                    onClick={() => {
                      setVPlaca('');
                      setVMarca('');
                      setVModelo('');
                      setVColor('');
                      setVCorbatin('');
                      setVVence('');
                      setVError('');
                      setIsVehicleModalOpen(true);
                    }}
                    className="text-xs bg-slate-900 hover:bg-slate-850 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus size={13} />
                    <span>Registrar</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {misVehiculos.map(veh => (
                    <div key={veh.id} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-medium bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-cyan-400 font-mono font-bold px-2 py-0.5 rounded text-[10px] border border-slate-800">
                            {veh.placa}
                          </span>
                          <span className="text-slate-800 font-semibold">{veh.marca} {veh.modelo}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          Tarjetón: {veh.corbatinNumero} (Vence: {veh.corbatinVencimiento})
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase block ${
                          veh.estadoAcceso === 'permitido' ? 'bg-emerald-50 text-emerald-600' :
                          veh.estadoAcceso === 'alerta_sancion' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {veh.estadoAcceso}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {veh.reincidencias} infracciones
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR TRABAJADOR */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col gap-4 relative">
            <button
              onClick={() => setIsWorkerModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Registrar Trabajador</h3>
              <p className="text-xs text-slate-400 mt-0.5">Da de alta personal para tu nómina autorizada.</p>
            </div>

            {wError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg flex items-start gap-2.5 text-xs mb-1">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{wError}</div>
              </div>
            )}

            <form onSubmit={handleSaveWorker} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={wNombre}
                    onChange={(e) => setWNombre(e.target.value)}
                    placeholder="Ej. Pedro"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Apellidos</label>
                  <input
                    type="text"
                    value={wApellidos}
                    onChange={(e) => setWApellidos(e.target.value)}
                    placeholder="Ej. González"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">NSS (Seguro Social)</label>
                <input
                  type="text"
                  value={wNss}
                  onChange={(e) => setWNss(e.target.value)}
                  placeholder="Formato: 1288-75-9983-1"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rol / Puesto en la Obra</label>
                <input
                  type="text"
                  value={wRol}
                  onChange={(e) => setWRol(e.target.value)}
                  placeholder="Ej. Albañil, Pintor, Electricista..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow"
                >
                  Guardar Trabajador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR VEHÍCULO */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col gap-4 relative">
            <button
              onClick={() => setIsVehicleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Registrar Vehículo</h3>
              <p className="text-xs text-slate-400 mt-0.5">Registra una unidad comercial para ingresar al HOA.</p>
            </div>

            {vError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg flex items-start gap-2.5 text-xs mb-1">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>{vError}</div>
              </div>
            )}

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Placa del Vehículo</label>
                <input
                  type="text"
                  value={vPlaca}
                  onChange={(e) => setVPlaca(e.target.value)}
                  placeholder="Ej. SON-88-29"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Marca</label>
                  <input
                    type="text"
                    value={vMarca}
                    onChange={(e) => setVMarca(e.target.value)}
                    placeholder="Ej. Toyota"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Modelo</label>
                  <input
                    type="text"
                    value={vModelo}
                    onChange={(e) => setVModelo(e.target.value)}
                    placeholder="Ej. Hilux"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Color</label>
                  <input
                    type="text"
                    value={vColor}
                    onChange={(e) => setVColor(e.target.value)}
                    placeholder="Ej. Gris"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Número de Tarjetón</label>
                  <input
                    type="text"
                    value={vCorbatin}
                    onChange={(e) => setVCorbatin(e.target.value)}
                    placeholder="Ej. C-104"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vencimiento Acreditación</label>
                  <input
                    type="date"
                    value={vVence}
                    onChange={(e) => setVVence(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors shadow"
                >
                  Guardar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

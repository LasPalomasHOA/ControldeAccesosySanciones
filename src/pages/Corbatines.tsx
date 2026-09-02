import React, { useState } from 'react';
import { useHOA } from '../context/HOAContext';
import { Printer, Car, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';

export const Corbatines: React.FC = () => {
  const { vehiculos } = useHOA();
  const [selectedVehiculoId, setSelectedVehiculoId] = useState(vehiculos[0]?.id || '');

  const activeVehiculo = vehiculos.find(v => v.id === selectedVehiculoId);

  const handlePrint = () => {
    window.print();
  };

  // Simulated QR Code SVG pattern
  const renderSimulatedQR = () => {
    return (
      <svg viewBox="0 0 100 100" className="w-32 h-32 text-slate-900 mx-auto">
        <rect width="100" height="100" fill="white" />
        {/* Corners */}
        <rect x="5" y="5" width="25" height="25" fill="currentColor" />
        <rect x="10" y="10" width="15" height="15" fill="white" />
        <rect x="12" y="12" width="11" height="11" fill="currentColor" />

        <rect x="70" y="5" width="25" height="25" fill="currentColor" />
        <rect x="75" y="10" width="15" height="15" fill="white" />
        <rect x="77" y="12" width="11" height="11" fill="currentColor" />

        <rect x="5" y="70" width="25" height="25" fill="currentColor" />
        <rect x="10" y="75" width="15" height="15" fill="white" />
        <rect x="12" y="77" width="11" height="11" fill="currentColor" />

        {/* Small corner alignment */}
        <rect x="72" y="72" width="10" height="10" fill="currentColor" />
        <rect x="74" y="74" width="6" height="6" fill="white" />
        <rect x="76" y="76" width="2" height="2" fill="currentColor" />

        {/* Random dots (simulating payload) */}
        <rect x="35" y="10" width="6" height="6" fill="currentColor" />
        <rect x="45" y="5" width="4" height="4" fill="currentColor" />
        <rect x="55" y="12" width="8" height="4" fill="currentColor" />
        <rect x="35" y="25" width="10" height="4" fill="currentColor" />

        <rect x="10" y="35" width="6" height="8" fill="currentColor" />
        <rect x="22" y="45" width="4" height="10" fill="currentColor" />
        <rect x="15" y="58" width="8" height="4" fill="currentColor" />

        <rect x="40" y="40" width="20" height="20" fill="currentColor" />
        <rect x="45" y="45" width="10" height="10" fill="white" />
        <rect x="48" y="48" width="4" height="4" fill="currentColor" />

        <rect x="75" y="35" width="12" height="6" fill="currentColor" />
        <rect x="82" y="48" width="6" height="8" fill="currentColor" />
        <rect x="70" y="58" width="10" height="4" fill="currentColor" />

        <rect x="35" y="70" width="6" height="12" fill="currentColor" />
        <rect x="45" y="78" width="12" height="6" fill="currentColor" />
        <rect x="55" y="70" width="8" height="4" fill="currentColor" />

        <rect x="35" y="88" width="24" height="6" fill="currentColor" />
        <rect x="68" y="88" width="14" height="4" fill="currentColor" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info (No Print) */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Generación de Corbatín</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Genera e imprime el tarjetón / corbatín oficial de acceso para el parabrisas del vehículo.
          </p>
        </div>
        <button
          onClick={handlePrint}
          disabled={!activeVehiculo}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 text-sm shadow-md transition-colors"
        >
          <Printer size={16} />
          <span>Imprimir Corbatín</span>
        </button>
      </div>

      {/* Selector and Main Visual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side Selector: No Print */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print col-span-1">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Car size={16} className="text-slate-500" />
            Selección de Vehículo
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Unidad Registrada:
            </label>
            <select
              value={selectedVehiculoId}
              onChange={(e) => setSelectedVehiculoId(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-700 bg-slate-50 font-semibold"
            >
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {v.marca} {v.modelo} ({v.empresaNombre})
                </option>
              ))}
            </select>
          </div>

          {activeVehiculo && (
            <div className="text-xs text-slate-500 leading-relaxed space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-500 shrink-0" size={15} />
                <span>
                  Corbatín vigente hasta el: <strong>{activeVehiculo.corbatinVencimiento}</strong>
                </span>
              </div>
              <p>
                * Al hacer clic en <strong>Imprimir</strong>, el sistema generará una vista formateada optimizada para hojas carta. Recorta por las guías del contorno y colócalo colgado del espejo retrovisor central.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Corbatín Badge Visual Preview */}
        <div className="col-span-1 lg:col-span-2 flex justify-center">
          {activeVehiculo ? (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center max-w-sm w-full no-print">
              <div className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-wider">Vista Previa del Tarjetón</div>
              
              {/* Hangtag Badge Box */}
              <div className="border-[3px] border-slate-900 rounded-2xl p-6 bg-white flex flex-col justify-between h-[500px] shadow-lg relative overflow-hidden">
                {/* Rearview mirror cutout visual */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-20 h-20 rounded-full border-[3px] border-slate-900 bg-slate-50 z-10"></div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-900 z-10"></div>

                {/* Tag Header */}
                <div className="mt-8 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Las Palomas</div>
                  <div className="text-xs font-extrabold text-slate-900 tracking-wider mt-0.5 uppercase">Rocky Point HOA</div>
                  <div className="bg-slate-900 text-cyan-400 text-xs font-extrabold px-3 py-1 rounded mt-2.5 inline-block tracking-widest uppercase">
                    Contratista
                  </div>
                </div>

                {/* QR Section */}
                <div className="my-6">
                  {renderSimulatedQR()}
                  <div className="text-[9px] text-slate-400 font-mono mt-2 tracking-wider">ID-{activeVehiculo.id.toUpperCase()}</div>
                </div>

                {/* Big Info Display */}
                <div className="space-y-4 border-t border-dashed border-slate-200 pt-5">
                  {/* Plate */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matrícula Autorizada</span>
                    <div className="text-2xl font-black text-slate-950 font-mono mt-0.5 tracking-wide">
                      {activeVehiculo.placa}
                    </div>
                  </div>

                  {/* Corbatin No & Company */}
                  <div className="grid grid-cols-2 gap-2 text-left border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">No. Tarjetón</span>
                      <span className="font-extrabold text-slate-800 text-sm">{activeVehiculo.corbatinNumero}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vence</span>
                      <span className="font-extrabold text-emerald-600 text-sm block truncate">
                        {activeVehiculo.corbatinVencimiento}
                      </span>
                    </div>
                  </div>

                  {/* Company Footer */}
                  <div className="text-center text-[10px] font-extrabold text-slate-500 uppercase tracking-wide border-t border-slate-100 pt-2.5 truncate">
                    {activeVehiculo.empresaNombre}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-400 font-semibold w-full">
              No hay vehículos registrados para mostrar.
            </div>
          )}
        </div>
      </div>

      {/* PRINT-ONLY AREA (Hidden on browser view, visible on window.print()) */}
      {activeVehiculo && (
        <div className="hidden print-only mx-auto w-[9.5cm] h-[21cm] bg-white border-[4px] border-black p-6 flex flex-col justify-between text-center relative font-sans">
          {/* Mirror Hook Hole */}
          <div className="absolute top-[-2cm] left-1/2 -translate-x-1/2 w-[5cm] h-[5cm] rounded-full border-[4px] border-black bg-white"></div>
          <div className="absolute top-[3cm] left-1/2 -translate-x-1/2 w-0.5 h-[1.5cm] bg-black"></div>

          {/* Top Space Spacer */}
          <div className="h-16"></div>

          {/* Header */}
          <div>
            <h1 className="text-sm font-extrabold tracking-widest text-black uppercase leading-tight">Las Palomas</h1>
            <div className="text-xs font-black tracking-widest text-black uppercase mt-0.5">Rocky Point HOA</div>
            <div className="border-2 border-black bg-black text-white text-xs font-black px-4 py-1.5 rounded mt-3 inline-block uppercase tracking-widest">
              Contratista
            </div>
          </div>

          {/* QR */}
          <div className="my-8">
            {renderSimulatedQR()}
            <div className="text-[8px] text-black font-mono mt-1 tracking-wider">ID-{activeVehiculo.id.toUpperCase()}</div>
          </div>

          {/* Content */}
          <div className="space-y-4 border-t-2 border-dashed border-black pt-6">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider block">Matrícula Autorizada</span>
              <div className="text-3xl font-black text-black font-mono tracking-wide mt-1">
                {activeVehiculo.placa}
              </div>
              <span className="text-[10px] font-bold text-black uppercase mt-1.5 block">
                {activeVehiculo.marca} {activeVehiculo.modelo}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left border-t-2 border-black pt-4">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider block">No. Tarjetón</span>
                <span className="font-black text-black text-base">{activeVehiculo.corbatinNumero}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider block">Vence</span>
                <span className="font-black text-black text-base">{activeVehiculo.corbatinVencimiento}</span>
              </div>
            </div>

            <div className="text-center text-[9px] font-black text-black uppercase border-t-2 border-black pt-3 truncate">
              {activeVehiculo.empresaNombre}
            </div>
          </div>

          {/* Back Warning */}
          <div className="text-[7px] text-black font-bold uppercase leading-relaxed border-t border-black pt-3 mt-3">
            Este tarjetón es intransferible y debe permanecer visible en el retrovisor.
            Sujeto al reglamento interno de Las Palomas HOA.
          </div>
        </div>
      )}
    </div>
  );
};

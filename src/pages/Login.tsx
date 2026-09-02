import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHOA } from '../context/HOAContext';
import { Shield, User, ArrowRight, Building, HelpCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { usuarios, setUsuarioActual } = useHOA();
  const navigate = useNavigate();

  const handleLogin = (usuarioId: string) => {
    const user = usuarios.find(u => u.id === usuarioId);
    if (user) {
      setUsuarioActual(user);
      if (user.rol === 'proveedor') {
        navigate('/reglamento-proveedor');
      } else {
        navigate('/');
      }
    }
  };

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'supervisor':
        return <Building className="w-5 h-5 text-amber-500" />;
      case 'guardia':
        return <Shield className="w-5 h-5 text-emerald-500" />;
      case 'proveedor':
        return <User className="w-5 h-5 text-blue-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getRoleDesc = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Control completo, altas, bajas, configuración y resolución de multas.';
      case 'supervisor':
        return 'Auditoría de accesos, aprobación de infracciones del agente móvil y reportes.';
      case 'guardia':
        return 'Bitácora en tiempo real, registro de ingresos/salidas y caseta virtual.';
      case 'proveedor':
        return 'Consulta de personal autorizado, vehículos y aceptación del reglamento.';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-xl bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-500/30 bg-white p-1 mx-auto shadow-lg mb-4 flex items-center justify-center">
            <img src="/src/assets/logo.jpg" alt="Las Palomas" className="w-full h-full object-cover rounded-xl" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Las Palomas Rocky Point</h2>
          <p className="text-slate-400 text-sm mt-2">
            Sistema de Acceso Vehicular y Control de Sanciones
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 p-4 rounded-xl text-xs mb-6 leading-relaxed">
          <strong>Acceso de Demostración:</strong> Selecciona uno de los perfiles de usuario preconfigurados abajo para simular el inicio de sesión y probar las diferentes funcionalidades del panel.
        </div>

        {/* Profile List */}
        <div className="space-y-4">
          {usuarios.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user.id)}
              className="w-full text-left bg-slate-950/60 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/35 p-4 rounded-xl flex items-center justify-between transition-all duration-200 group hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                  <img src={user.avatar} alt={user.nombre} className="w-full h-full object-cover" />
                </div>
                {/* Name and Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {user.nombre}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-850 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 border border-slate-800 uppercase tracking-wider">
                      {getRoleIcon(user.rol)}
                      <span className="ml-1">{user.rol}</span>
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 mr-4 line-clamp-1">
                    {getRoleDesc(user.rol)}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-cyan-500 transition-all">
                <ArrowRight size={16} />
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-slate-500">
          Las Palomas Rocky Point HOA A.C. &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

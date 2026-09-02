import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Empresa, Trabajador, Vehiculo, Acceso, Sancion, Usuario } from '../types';
import { api } from '../services/api';
import {
  mockEmpresas,
  mockTrabajadores,
  mockVehiculos,
  mockAccesos,
  mockSanciones,
  mockUsuarios
} from '../data/mockData';

interface HOAContextType {
  empresas: Empresa[];
  trabajadores: Trabajador[];
  vehiculos: Vehiculo[];
  accesos: Acceso[];
  sanciones: Sancion[];
  usuarios: Usuario[];
  usuarioActual: Usuario;
  reglamentoAceptado: Record<string, boolean>;
  isLoading: boolean;
  recargarDatos: () => Promise<void>;
  setUsuarioActual: (usuario: Usuario) => void;
  aceptarReglamento: (empresaId: string) => Promise<void>;
  agregarEmpresa: (empresa: Omit<Empresa, 'totalTrabajadores' | 'totalVehiculos'>) => Promise<void>;
  editarEmpresa: (empresa: Empresa) => Promise<void>;
  agregarTrabajador: (trabajador: Omit<Trabajador, 'id'>) => Promise<void>;
  editarTrabajador: (trabajador: Trabajador) => Promise<void>;
  agregarVehiculo: (vehiculo: Omit<Vehiculo, 'id' | 'reincidencias'>) => Promise<void>;
  editarVehiculo: (vehiculo: Vehiculo) => Promise<void>;
  agregarAcceso: (acceso: Omit<Acceso, 'id' | 'fechaHora'>) => Promise<void>;
  agregarSancion: (sancion: Omit<Sancion, 'id' | 'fechaSancion'>) => Promise<void>;
  aprobarSancion: (sancionId: string) => Promise<void>;
  rechazarSancion: (sancionId: string) => Promise<void>;
  resolverSancion: (sancionId: string) => Promise<void>;
  agregarUsuario: (usuario: Omit<Usuario, 'id' | 'avatar'>) => Promise<void>;
  editarUsuario: (id: string | number, data: any) => Promise<void>;
  eliminarUsuario: (id: string | number) => Promise<void>;
}

const HOAContext = createContext<HOAContextType | undefined>(undefined);

export const HOAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [sanciones, setSanciones] = useState<Sancion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioActual, setUsuarioActualState] = useState<Usuario>(mockUsuarios[0]);
  const [reglamentoAceptado, setReglamentoAceptado] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carga de datos desde PostgreSQL API
  const recargarDatos = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        resEmpresas,
        resTrabajadores,
        resVehiculos,
        resBitacora,
        resSanciones,
        resUsuarios
      ] = await Promise.allSettled([
        api.getEmpresas(),
        api.getTrabajadores(),
        api.getVehiculos(),
        api.getBitacora(),
        api.getSanciones(),
        api.getUsuarios()
      ]);

      if (resEmpresas.status === 'fulfilled' && Array.isArray(resEmpresas.value)) {
        setEmpresas(resEmpresas.value);
      } else {
        const local = localStorage.getItem('hoa_empresas');
        setEmpresas(local ? JSON.parse(local) : mockEmpresas);
      }

      if (resTrabajadores.status === 'fulfilled' && Array.isArray(resTrabajadores.value)) {
        setTrabajadores(resTrabajadores.value);
      } else {
        const local = localStorage.getItem('hoa_trabajadores');
        setTrabajadores(local ? JSON.parse(local) : mockTrabajadores);
      }

      if (resVehiculos.status === 'fulfilled' && Array.isArray(resVehiculos.value)) {
        setVehiculos(resVehiculos.value);
      } else {
        const local = localStorage.getItem('hoa_vehiculos');
        setVehiculos(local ? JSON.parse(local) : mockVehiculos);
      }

      if (resBitacora.status === 'fulfilled' && Array.isArray(resBitacora.value)) {
        setAccesos(resBitacora.value);
      } else {
        const local = localStorage.getItem('hoa_accesos');
        setAccesos(local ? JSON.parse(local) : mockAccesos);
      }

      if (resSanciones.status === 'fulfilled' && Array.isArray(resSanciones.value)) {
        setSanciones(resSanciones.value);
      } else {
        const local = localStorage.getItem('hoa_sanciones');
        setSanciones(local ? JSON.parse(local) : mockSanciones);
      }

      if (resUsuarios.status === 'fulfilled' && Array.isArray(resUsuarios.value)) {
        setUsuarios(resUsuarios.value);
        if (resUsuarios.value.length > 0) {
          setUsuarioActualState(resUsuarios.value[0]);
        }
      } else {
        const local = localStorage.getItem('hoa_usuarios');
        setUsuarios(local ? JSON.parse(local) : mockUsuarios);
      }

    } catch (error) {
      console.warn('Conexión directa a API falló, cargando desde caché local:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    recargarDatos();
  }, [recargarDatos]);

  const setUsuarioActual = (usuario: Usuario) => {
    setUsuarioActualState(usuario);
    localStorage.setItem('hoa_usuario_actual', JSON.stringify(usuario));
  };

  const agregarUsuario = async (nuevo: Omit<Usuario, 'id' | 'avatar'>) => {
    try {
      await api.createUsuario(nuevo);
      await recargarDatos();
    } catch (error) {
      const usuarioCompleto: Usuario = {
        ...nuevo,
        id: `u_${Date.now()}`,
        avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100) + 1500000000000}?auto=format&fit=crop&q=80&w=150`
      };
      setUsuarios(prev => [usuarioCompleto, ...prev]);
    }
  };

  const editarUsuario = async (id: string | number, data: any) => {
    try {
      await api.updateUsuario(id, data);
      await recargarDatos();
    } catch (error) {
      setUsuarios(prev => prev.map(u => String(u.id) === String(id) ? { ...u, ...data } : u));
    }
  };

  const eliminarUsuario = async (id: string | number) => {
    try {
      await api.deleteUsuario(id);
      await recargarDatos();
    } catch (error) {
      setUsuarios(prev => prev.filter(u => String(u.id) !== String(id)));
    }
  };

  const aceptarReglamento = async (empresaId: string) => {
    try {
      await api.aceptarReglamento({
        id_empresa: empresaId,
        id_usuario: usuarioActual.id || 1,
        firma_nombre: usuarioActual.nombre
      });
      setReglamentoAceptado(prev => ({ ...prev, [empresaId]: true }));
    } catch (error) {
      setReglamentoAceptado(prev => ({ ...prev, [empresaId]: true }));
    }
  };

  const agregarEmpresa = async (nueva: Omit<Empresa, 'totalTrabajadores' | 'totalVehiculos'>) => {
    try {
      await api.createEmpresa({
        razon_social: nueva.nombre,
        responsable_nombre: nueva.responsable,
        telefono: nueva.telefono,
        correo: nueva.correo,
        estatus: nueva.estado === 'activo' ? 'ACTIVA' : 'SUSPENDIDA'
      });
      await recargarDatos();
    } catch (error) {
      const empresaCompleta: Empresa = { ...nueva, totalTrabajadores: 0, totalVehiculos: 0 };
      setEmpresas(prev => [empresaCompleta, ...prev]);
    }
  };

  const editarEmpresa = async (editada: Empresa) => {
    try {
      const id = editada.id_empresa ?? editada.id;
      if (id !== undefined && id !== null) {
        await api.updateEmpresa(id, {
          razon_social: editada.nombre,
          responsable_nombre: editada.responsable,
          telefono: editada.telefono,
          correo: editada.correo,
          estatus: editada.estado === 'activo' ? 'ACTIVA' : 'SUSPENDIDA'
        });
        await recargarDatos();
      }
    } catch (error) {
      setEmpresas(prev => prev.map(emp => emp.id === editada.id ? editada : emp));
    }
  };

  const agregarTrabajador = async (nuevo: Omit<Trabajador, 'id'>) => {
    try {
      const idEmp = nuevo.id_empresa || nuevo.empresaId || 1;
      await api.createTrabajador({
        id_empresa: idEmp,
        nombre: nuevo.nombre,
        apellidos: nuevo.apellidos || '',
        telefono: nuevo.telefono || null,
        foto_url: nuevo.foto_url || nuevo.foto || null,
        activo: nuevo.activo !== undefined ? nuevo.activo : true
      });
      await recargarDatos();
    } catch (error) {
      const trabajadorCompleto: Trabajador = {
        ...nuevo,
        id_trabajador: Date.now(),
        id_empresa: nuevo.id_empresa || nuevo.empresaId || 1,
        id: `t_${Date.now()}`,
        activo: nuevo.activo !== undefined ? nuevo.activo : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTrabajadores(prev => [trabajadorCompleto, ...prev]);
    }
  };

  const editarTrabajador = async (editado: Trabajador) => {
    try {
      const id = editado.id_trabajador ?? editado.id;
      if (id !== undefined && id !== null) {
        await api.updateTrabajador(id, {
          nombre: editado.nombre,
          apellidos: editado.apellidos,
          telefono: editado.telefono,
          foto_url: editado.foto_url || editado.foto,
          activo: editado.activo
        });
        await recargarDatos();
      }
    } catch (error) {
      setTrabajadores(prev => prev.map(t => t.id === editado.id ? editado : t));
    }
  };

  const agregarVehiculo = async (nuevo: Omit<Vehiculo, 'id' | 'reincidencias'>) => {
    try {
      await api.createVehiculo({
        id_empresa: nuevo.empresaId || 1,
        marca: nuevo.marca,
        modelo: nuevo.modelo,
        año: nuevo.año || nuevo.anio || null,
        placas: nuevo.placas || nuevo.placa,
        color: nuevo.color,
        foto_url: nuevo.foto_url || '',
        estatus_acceso: 'HABILITADO'
      });
      await recargarDatos();
    } catch (error) {
      const vehiculoCompleto: Vehiculo = { ...nuevo, id: `v_${Date.now()}`, reincidencias: 0 };
      setVehiculos(prev => [vehiculoCompleto, ...prev]);
    }
  };

  const editarVehiculo = async (editado: Vehiculo) => {
    try {
      const id = editado.id_vehiculo ?? editado.id;
      if (id !== undefined && id !== null) {
        await api.updateVehiculo(id, {
          marca: editado.marca,
          modelo: editado.modelo,
          año: editado.año || editado.anio,
          placas: editado.placas || editado.placa,
          color: editado.color,
          foto_url: editado.foto_url,
          estatus_acceso: editado.estadoAcceso === 'bloqueado' ? 'SUSPENDIDO' : 'HABILITADO'
        });
        await recargarDatos();
      }
    } catch (error) {
      setVehiculos(prev => prev.map(v => v.id === editado.id ? editado : v));
    }
  };

  const agregarAcceso = async (nuevo: Omit<Acceso, 'id' | 'fechaHora'>) => {
    try {
      await api.registrarAcceso({
        id_caseta: 1,
        id_vehiculo: nuevo.vehiculoId || 1,
        id_usuario: usuarioActual.id || 1,
        estatus_acceso: 'AUTORIZADO',
        observaciones: nuevo.observaciones || null,
        tipo: nuevo.tipo
      });
      await recargarDatos();
    } catch (error) {
      const accesoCompleto: Acceso = { ...nuevo, id: `acc_${Date.now()}`, fechaHora: new Date().toISOString() };
      setAccesos(prev => [accesoCompleto, ...prev]);
    }
  };

  const agregarSancion = async (nueva: Omit<Sancion, 'id' | 'fechaSancion'>) => {
    try {
      await api.createReporte({
        id_vehiculo: nueva.vehiculoId || 1,
        id_infraccion: 1,
        id_usuario: usuarioActual.id || 1,
        descripcion_hechos: nueva.comentarios || nueva.infraccionDescripcion,
        evidencia_url: nueva.evidenciaUrl || null
      });
      await recargarDatos();
    } catch (error) {
      const sancionCompleta: Sancion = { ...nueva, id: `san_${Date.now()}`, fechaSancion: new Date().toISOString() };
      setSanciones(prev => [sancionCompleta, ...prev]);
    }
  };

  const aprobarSancion = async (sancionId: string) => {
    try {
      await api.dictaminarReporte(sancionId, { decision: 'APROBADO', comentarios: 'Aprobado por supervisión' });
      await recargarDatos();
    } catch (error) {
      setSanciones(prev => prev.map(s => s.id === sancionId ? { ...s, estado: 'activa' } : s));
    }
  };

  const rechazarSancion = async (sancionId: string) => {
    try {
      await api.dictaminarReporte(sancionId, { decision: 'RECHAZADO', comentarios: 'Desestimado por supervisión' });
      await recargarDatos();
    } catch (error) {
      setSanciones(prev => prev.map(s => s.id === sancionId ? { ...s, estado: 'rechazada' } : s));
    }
  };

  const resolverSancion = async (sancionId: string) => {
    try {
      await api.updateSancion(sancionId, { estatus: 'VENCIDA', fecha_fin: new Date() });
      await recargarDatos();
    } catch (error) {
      setSanciones(prev => prev.map(s => s.id === sancionId ? { ...s, estado: 'resuelta', fechaResolucion: new Date().toISOString() } : s));
    }
  };

  return (
    <HOAContext.Provider
      value={{
        empresas,
        trabajadores,
        vehiculos,
        accesos,
        sanciones,
        usuarios,
        usuarioActual,
        reglamentoAceptado,
        isLoading,
        recargarDatos,
        setUsuarioActual,
        aceptarReglamento,
        agregarEmpresa,
        editarEmpresa,
        agregarTrabajador,
        editarTrabajador,
        agregarVehiculo,
        editarVehiculo,
        agregarAcceso,
        agregarSancion,
        aprobarSancion,
        rechazarSancion,
        resolverSancion,
        agregarUsuario,
        editarUsuario,
        eliminarUsuario
      }}
    >
      {children}
    </HOAContext.Provider>
  );
};

export const useHOA = () => {
  const context = useContext(HOAContext);
  if (context === undefined) {
    throw new Error('useHOA must be used within a HOAProvider');
  }
  return context;
};

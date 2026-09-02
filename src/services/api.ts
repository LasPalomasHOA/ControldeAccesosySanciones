// Servicio de Comunicación con la API REST y PostgreSQL
const API_BASE_URL = '/api';

export const api = {
  // Estado del servidor
  async checkStatus() {
    const res = await fetch(`${API_BASE_URL}/status`);
    return res.json();
  },

  // 1. Roles
  async getRoles() {
    const res = await fetch(`${API_BASE_URL}/roles`);
    return res.json();
  },

  // 2. Empresas
  async getEmpresas() {
    const res = await fetch(`${API_BASE_URL}/empresas`);
    return res.json();
  },
  async createEmpresa(data: any) {
    const res = await fetch(`${API_BASE_URL}/empresas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateEmpresa(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteEmpresa(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // 3. Usuarios
  async getUsuarios() {
    const res = await fetch(`${API_BASE_URL}/usuarios`);
    return res.json();
  },
  async login(correo: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password })
    });
    if (!res.ok) throw new Error('Credenciales inválidas');
    return res.json();
  },
  async createUsuario(data: any) {
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateUsuario(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteUsuario(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // 4. Trabajadores
  async getTrabajadores(params?: { id_empresa?: string | number }) {
    const query = params?.id_empresa ? `?id_empresa=${params.id_empresa}` : '';
    const res = await fetch(`${API_BASE_URL}/trabajadores${query}`);
    return res.json();
  },
  async createTrabajador(data: any) {
    const res = await fetch(`${API_BASE_URL}/trabajadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateTrabajador(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteTrabajador(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/trabajadores/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // 5. Vehículos (con soporte para año)
  async getVehiculos(params?: { id_empresa?: string | number }) {
    const query = params?.id_empresa ? `?id_empresa=${params.id_empresa}` : '';
    const res = await fetch(`${API_BASE_URL}/vehiculos${query}`);
    return res.json();
  },
  async createVehiculo(data: any) {
    const res = await fetch(`${API_BASE_URL}/vehiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateVehiculo(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/vehiculos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteVehiculo(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/vehiculos/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // 6. Corbatines
  async getCorbatines() {
    const res = await fetch(`${API_BASE_URL}/corbatines`);
    return res.json();
  },

  // 7. Reglamentos & Aceptación
  async getReglamentos() {
    const res = await fetch(`${API_BASE_URL}/reglamentos`);
    return res.json();
  },
  async getReglamentoVigente() {
    const res = await fetch(`${API_BASE_URL}/reglamentos/vigente`);
    return res.json();
  },
  async aceptarReglamento(data: { id_empresa: string | number; id_usuario: string | number; firma_nombre?: string }) {
    const res = await fetch(`${API_BASE_URL}/reglamentos/aceptar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 8. Casetas & Reglas
  async getCasetas() {
    const res = await fetch(`${API_BASE_URL}/casetas`);
    return res.json();
  },
  async getReglas() {
    const res = await fetch(`${API_BASE_URL}/reglas`);
    return res.json();
  },

  // 9. Infracciones & Reportes
  async getInfracciones() {
    const res = await fetch(`${API_BASE_URL}/infracciones`);
    return res.json();
  },
  async getReportes() {
    const res = await fetch(`${API_BASE_URL}/reportes`);
    return res.json();
  },
  async createReporte(data: any) {
    const res = await fetch(`${API_BASE_URL}/reportes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async dictaminarReporte(id: string | number, data: { decision: 'APROBADO' | 'RECHAZADO'; comentarios?: string; id_usuario?: number }) {
    const res = await fetch(`${API_BASE_URL}/reportes/${id}/revisar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 10. Sanciones
  async getSanciones() {
    const res = await fetch(`${API_BASE_URL}/sanciones`);
    return res.json();
  },
  async updateSancion(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/sanciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // 11. Bitácora de Accesos
  async getBitacora() {
    const res = await fetch(`${API_BASE_URL}/bitacora`);
    return res.json();
  },
  async registrarAcceso(data: any) {
    const res = await fetch(`${API_BASE_URL}/bitacora`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async registrarSalida(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/bitacora/${id}/salida`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // 12. Semilla / Inicialización
  async runSeed() {
    const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
    return res.json();
  }
};

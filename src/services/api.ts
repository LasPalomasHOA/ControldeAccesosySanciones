// Servicio de Comunicación con la API REST y PostgreSQL
const API_BASE_URL = '/api';

async function handleResponse<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text || `Error HTTP ${res.status}` };
  }
  if (!res.ok) {
    throw new Error(json.error || json.details || json.message || `Error del servidor (${res.status})`);
  }
  return json;
}

export const api = {
  // Estado del servidor
  async checkStatus() {
    const res = await fetch(`${API_BASE_URL}/status`);
    return handleResponse(res);
  },

  // 1. Roles
  async getRoles() {
    const res = await fetch(`${API_BASE_URL}/roles`);
    return handleResponse(res);
  },

  // 2. Empresas
  async getEmpresas() {
    const res = await fetch(`${API_BASE_URL}/empresas`);
    return handleResponse(res);
  },
  async createEmpresa(data: any) {
    const res = await fetch(`${API_BASE_URL}/empresas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateEmpresa(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteEmpresa(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/empresas/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // 3. Usuarios
  async getUsuarios() {
    const res = await fetch(`${API_BASE_URL}/usuarios`);
    return handleResponse(res);
  },
  async login(correo: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password })
    });
    return handleResponse(res);
  },
  async createUsuario(data: any) {
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateUsuario(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteUsuario(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // 4. Trabajadores
  async getTrabajadores(params?: { id_empresa?: string | number }) {
    const query = params?.id_empresa ? `?id_empresa=${params.id_empresa}` : '';
    const res = await fetch(`${API_BASE_URL}/trabajadores${query}`);
    return handleResponse(res);
  },
  async createTrabajador(data: any) {
    const res = await fetch(`${API_BASE_URL}/trabajadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateTrabajador(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteTrabajador(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/trabajadores/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // 5. Vehículos (con soporte para año)
  async getVehiculos(params?: { id_empresa?: string | number }) {
    const query = params?.id_empresa ? `?id_empresa=${params.id_empresa}` : '';
    const res = await fetch(`${API_BASE_URL}/vehiculos${query}`);
    return handleResponse(res);
  },
  async createVehiculo(data: any) {
    const res = await fetch(`${API_BASE_URL}/vehiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async updateVehiculo(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/vehiculos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async deleteVehiculo(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/vehiculos/${id}`, { method: 'DELETE' });
    return handleResponse(res);
  },

  // 6. Corbatines
  async getCorbatines() {
    const res = await fetch(`${API_BASE_URL}/corbatines`);
    return handleResponse(res);
  },

  // 7. Reglamentos & Aceptación
  async getReglamentos() {
    const res = await fetch(`${API_BASE_URL}/reglamentos`);
    return handleResponse(res);
  },
  async getReglamentoVigente() {
    const res = await fetch(`${API_BASE_URL}/reglamentos/vigente`);
    return handleResponse(res);
  },
  async aceptarReglamento(data: { id_empresa: string | number; id_usuario: string | number; firma_nombre?: string }) {
    const res = await fetch(`${API_BASE_URL}/reglamentos/aceptar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 8. Casetas & Reglas
  async getCasetas() {
    const res = await fetch(`${API_BASE_URL}/casetas`);
    return handleResponse(res);
  },
  async getReglas() {
    const res = await fetch(`${API_BASE_URL}/reglas`);
    return handleResponse(res);
  },

  // 9. Infracciones & Reportes
  async getInfracciones() {
    const res = await fetch(`${API_BASE_URL}/infracciones`);
    return handleResponse(res);
  },
  async getReportes() {
    const res = await fetch(`${API_BASE_URL}/reportes`);
    return handleResponse(res);
  },
  async createReporte(data: any) {
    const res = await fetch(`${API_BASE_URL}/reportes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async dictaminarReporte(id: string | number, data: { decision: 'APROBADO' | 'RECHAZADO'; comentarios?: string; id_usuario?: number }) {
    const res = await fetch(`${API_BASE_URL}/reportes/${id}/revisar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 10. Sanciones
  async getSanciones() {
    const res = await fetch(`${API_BASE_URL}/sanciones`);
    return handleResponse(res);
  },
  async updateSancion(id: string | number, data: any) {
    const res = await fetch(`${API_BASE_URL}/sanciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // 11. Bitácora de Accesos
  async getBitacora() {
    const res = await fetch(`${API_BASE_URL}/bitacora`);
    return handleResponse(res);
  },
  async registrarAcceso(data: any) {
    const res = await fetch(`${API_BASE_URL}/bitacora`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  async registrarSalida(id: string | number) {
    const res = await fetch(`${API_BASE_URL}/bitacora/${id}/salida`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  },

  // 12. Semilla / Inicialización
  async runSeed() {
    const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
    return handleResponse(res);
  }
};

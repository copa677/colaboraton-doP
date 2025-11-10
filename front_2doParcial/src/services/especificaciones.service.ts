import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL + '/productos';

export interface Especificacion {
  id?: number;
  nombre: string;
  descripcion: string;
  producto: number;
  producto_descripcion?: string;
  estado?: boolean;
}

export interface CreateEspecificacionData {
  nombre: string;
  descripcion: string;
  producto_id: number;
}

export interface UpdateEspecificacionData {
  nombre?: string;
  descripcion?: string;
}

// 📋 Obtener todas las especificaciones activas
export async function getAllEspecificaciones(): Promise<Especificacion[]> {
  const response = await axios.get(`${API}/especificaciones/`);
  return response.data;
}

// 📋 Obtener especificaciones por producto
export async function getEspecificacionesByProducto(productoId: number): Promise<Especificacion[]> {
  const response = await axios.get(`${API}/especificaciones/producto/${productoId}/`);
  return response.data;
}

// 🔍 Obtener una especificación por ID
export async function getEspecificacionById(id: number): Promise<Especificacion> {
  const response = await axios.get(`${API}/especificaciones/${id}/`);
  return response.data;
}

// 📥 Crear una nueva especificación
export async function crearEspecificacion(data: CreateEspecificacionData): Promise<Especificacion> {
  const response = await axios.post(`${API}/especificaciones/crear/`, data);
  return response.data;
}

// ✏️ Actualizar una especificación
export async function actualizarEspecificacion(id: number, data: UpdateEspecificacionData): Promise<Especificacion> {
  const response = await axios.put(`${API}/especificaciones/${id}/actualizar/`, data);
  return response.data;
}

// 🗑️ Eliminar una especificación (eliminación lógica)
export async function eliminarEspecificacion(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/especificaciones/${id}/eliminar/`);
  return response.data;
}

// 🔄 Restaurar una especificación eliminada
export async function restaurarEspecificacion(id: number): Promise<{message: string, especificacion: Especificacion}> {
  const response = await axios.post(`${API}/especificaciones/${id}/restaurar/`);
  return response.data;
}
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL + '/productos';

export interface Inventario {
  id?: number;
  cantidad: number;
  ubicacion: string;
  producto: number;
  producto_descripcion?: string;
  estado?: boolean;
  fecha_actualizacion?: string;
}

export interface CreateInventarioData {
  cantidad: number;
  ubicacion: string;
  producto_id: number;
}

export interface UpdateInventarioData {
  cantidad?: number;
  ubicacion?: string;
  estado?: boolean;
}

// 📋 Obtener todos los inventarios activos
export async function getAllInventarios(): Promise<Inventario[]> {
  const response = await axios.get(`${API}/inventario/`);
  return response.data;
}

// 🔍 Obtener inventario por producto
export async function getInventarioByProducto(productoId: number): Promise<Inventario> {
  const response = await axios.get(`${API}/inventario/producto/${productoId}/`);
  return response.data;
}

// 📥 Crear un nuevo registro de inventario
export async function crearInventario(data: CreateInventarioData): Promise<Inventario> {
  const response = await axios.post(`${API}/inventario/crear/`, data);
  return response.data;
}

// ✏️ Actualizar un registro de inventario
export async function actualizarInventario(id: number, data: UpdateInventarioData): Promise<Inventario> {
  const response = await axios.put(`${API}/inventario/${id}/actualizar/`, data);
  return response.data;
}

// 🗑️ Eliminar un registro de inventario (eliminación lógica)
export async function eliminarInventario(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/inventario/${id}/eliminar/`);
  return response.data;
}

// 🔄 Restaurar un registro de inventario eliminado
export async function restaurarInventario(id: number): Promise<{message: string, inventario: Inventario}> {
  const response = await axios.post(`${API}/inventario/${id}/restaurar/`);
  return response.data;
}
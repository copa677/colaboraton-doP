import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL + '/marcas';

export interface Marca {
  id?: number;  // opcional al crear
  nombre: string;
  estado?: boolean;  // opcional, lo maneja el backend
}

// 📋 Obtener todas las marcas activas
export async function getAllMarcas(): Promise<Marca[]> {
  const response = await axios.get(`${API}/marcas/`);
  return response.data;
}

// 📋 Obtener todas las marcas (activas e inactivas)
export async function getAllMarcasCompleto(): Promise<Marca[]> {
  const response = await axios.get(`${API}/marcas/todos/`);
  return response.data;
}

// 🔍 Obtener una marca por ID
export async function getMarcaById(id: number): Promise<Marca> {
  const response = await axios.get(`${API}/marcas/${id}/`);
  return response.data;
}

// 🔍 Buscar marcas por nombre
export async function buscarMarcas(nombre: string): Promise<Marca[]> {
  const response = await axios.get(`${API}/marcas/buscar/`, {
    params: { nombre }
  });
  return response.data;
}

// 📥 Crear una nueva marca
export async function crearMarca(data: Omit<Marca, "id" | "estado">): Promise<Marca> {
  const response = await axios.post(`${API}/marcas/crear/`, data);
  return response.data;
}

// ✏️ Actualizar una marca
export async function actualizarMarca(id: number, data: Partial<Omit<Marca, "id" | "estado">>): Promise<Marca> {
  const response = await axios.put(`${API}/marcas/${id}/actualizar/`, data);
  return response.data;
}

// 🗑️ Eliminar una marca (eliminación lógica)
export async function eliminarMarca(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/marcas/${id}/eliminar/`);
  return response.data;
}

// 🔄 Restaurar una marca eliminada
export async function restaurarMarca(id: number): Promise<{message: string, marca: Marca}> {
  const response = await axios.post(`${API}/marcas/${id}/restaurar/`);
  return response.data;
}
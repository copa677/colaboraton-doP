import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL + '/categorias';

export interface Categoria {
  id?: number;  // opcional al crear
  descripcion: string;
  estado?: boolean;  // opcional, lo maneja el backend
}

// 📋 Obtener todas las categorías activas
export async function getAllCategorias(): Promise<Categoria[]> {
  const response = await axios.get(`${API}/categorias/`);
  return response.data;
}

// 📋 Obtener todas las categorías (activas e inactivas)
export async function getAllCategoriasCompleto(): Promise<Categoria[]> {
  const response = await axios.get(`${API}/categorias/todos/`);
  return response.data;
}

// 🔍 Obtener una categoría por ID
export async function getCategoriaById(id: number): Promise<Categoria> {
  const response = await axios.get(`${API}/categorias/${id}/`);
  return response.data;
}

// 🔍 Buscar categorías por descripción
export async function buscarCategorias(descripcion: string): Promise<Categoria[]> {
  const response = await axios.get(`${API}/categorias/buscar/`, {
    params: { descripcion }
  });
  return response.data;
}

// 📥 Crear una nueva categoría
export async function crearCategoria(data: Omit<Categoria, "id" | "estado">): Promise<Categoria> {
  const response = await axios.post(`${API}/categorias/crear/`, data);
  return response.data;
}

// ✏️ Actualizar una categoría
export async function actualizarCategoria(id: number, data: Partial<Omit<Categoria, "id" | "estado">>): Promise<Categoria> {
  const response = await axios.put(`${API}/categorias/${id}/actualizar/`, data);
  return response.data;
}

// 🗑️ Eliminar una categoría (eliminación lógica)
export async function eliminarCategoria(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/categorias/${id}/eliminar/`);
  return response.data;
}

// 🔄 Restaurar una categoría eliminada
export async function restaurarCategoria(id: number): Promise<{message: string, categoria: Categoria}> {
  const response = await axios.post(`${API}/categorias/${id}/restaurar/`);
  return response.data;
}
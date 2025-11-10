import axios from "axios"

const API = import.meta.env.VITE_API_BASE_URL + '/productos';

export interface Categoria {
  id: number;
  descripcion: string;
  estado: boolean;
}

export interface Marca {
  id: number;
  nombre: string;
  estado: boolean;
}

export interface Especificacion {
  id: number;
  nombre: string;
  descripcion: string;
  producto: number;
  producto_descripcion?: string;
  estado: boolean;
}

export interface Inventario {
  id: number;
  cantidad: number;
  ubicacion: string;
  producto: number;
  producto_descripcion?: string;
  estado: boolean;
  fecha_actualizacion: string;
}

export interface ImagenProducto {
  id: number;
  imagen: string;
  imagen_url: string;
  producto: number;
  producto_descripcion?: string;
  es_principal: boolean;
  estado: boolean;
  fecha_creacion: string;
}

export interface Producto {
  id: number;
  descripcion: string;
  precio: string;
  categoria: number;
  nombre_categoria?: string;
  marca: number;
  nombre_marca?: string;
  especificaciones: Especificacion[];
  inventario?: Inventario;
  imagenes: ImagenProducto[];
  estado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateProductoData {
  descripcion: string;
  precio: number;
  categoria_id: number;
  marca_id: number;
}

export interface UpdateProductoData {
  descripcion?: string;
  precio?: number;
  categoria_id?: number;
  marca_id?: number;
  estado?: boolean;
}

// 📋 Listar productos activos
export async function listarProductos(): Promise<Producto[]> {
  const response = await axios.get(`${API}/productos/`)
  return response.data
}

// 📋 Listar todos los productos (activos e inactivos)
export async function listarTodosProductos(): Promise<Producto[]> {
  const response = await axios.get(`${API}/productos/todos/`)
  return response.data
}

// 🔍 Obtener un producto por ID
export async function obtenerProducto(id: number): Promise<Producto> {
  const response = await axios.get(`${API}/productos/${id}/`)
  return response.data
}

// 📥 Crear un nuevo producto
export async function crearProducto(data: CreateProductoData): Promise<Producto> {
  const response = await axios.post(`${API}/productos/crear/`, data)
  return response.data
}

// ✏️ Actualizar un producto
export async function actualizarProducto(id: number, data: UpdateProductoData): Promise<Producto> {
  const response = await axios.put(`${API}/productos/${id}/actualizar/`, data)
  return response.data
}

// 🗑️ Eliminar un producto (eliminación lógica)
export async function eliminarProducto(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/productos/${id}/eliminar/`)
  return response.data
}

// 🔄 Restaurar un producto eliminado
export async function restaurarProducto(id: number): Promise<Producto> {
  const response = await axios.post(`${API}/productos/${id}/restaurar/`)
  return response.data
}

// 🔍 Buscar productos por término
export async function buscarProductos(query: string): Promise<Producto[]> {
  const response = await axios.get(`${API}/productos/buscar/?q=${encodeURIComponent(query)}`)
  return response.data
}

// 🏷️ Filtrar productos por categoría
export async function listarProductosPorCategoria(categoriaId: number): Promise<Producto[]> {
  const response = await axios.get(`${API}/productos/categoria/${categoriaId}/`)
  return response.data
}

// 🏷️ Filtrar productos por marca
export async function listarProductosPorMarca(marcaId: number): Promise<Producto[]> {
  const response = await axios.get(`${API}/productos/marca/${marcaId}/`)
  return response.data
}

// 🏷️ Filtrar productos por categoría y marca
export async function listarProductosPorCategoriaMarca(categoriaId: number, marcaId: number): Promise<Producto[]> {
  const response = await axios.get(`${API}/productos/categoria/${categoriaId}/marca/${marcaId}/`)
  return response.data
}
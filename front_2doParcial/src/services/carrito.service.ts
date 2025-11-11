// services/carrito.service.ts
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL + '/carrito';

export interface ItemCarrito {
  id: number;
  producto: number;
  producto_descripcion: string;
  producto_precio: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  estado: boolean;
  fecha_agregado: string;
}

export interface Carrito {
  id: number;
  usuario: number;
  usuario_username: string;
  items: ItemCarrito[];
  total: string;
  cantidad_items: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado: boolean;
}

// Obtener carrito del usuario
export async function obtenerCarritoUsuario(usuarioId: number): Promise<Carrito> {
  const response = await axios.get(`${API}/carrito/usuario/${usuarioId}/`);
  return response.data;
}

// Crear nuevo carrito
export async function crearCarrito(usuarioId: number): Promise<Carrito> {
  const response = await axios.post(`${API}/carrito/crear/`, {
    usuario_id: usuarioId
  });
  return response.data;
}

// Obtener o crear carrito (función combinada)
export async function obtenerOCrearCarrito(usuarioId: number): Promise<Carrito> {
  try {
    // Intentar obtener carrito existente
    return await obtenerCarritoUsuario(usuarioId);
  } catch (error: any) {
    // Si no existe (404), crear uno nuevo
    if (error.response?.status === 404) {
      return await crearCarrito(usuarioId);
    }
    // Si es otro error, relanzarlo
    throw error;
  }
}

// Agregar item al carrito
export async function agregarItemCarrito(
  carritoId: number,
  productoId: number,
  cantidad: number = 1
): Promise<ItemCarrito> {
  const response = await axios.post(`${API}/carrito/${carritoId}/agregar-item/`, {
    producto_id: productoId,
    cantidad: cantidad
  });
  return response.data;
}

// Actualizar cantidad de item
export async function actualizarItemCarrito(
  itemId: number,
  cantidad: number
): Promise<ItemCarrito> {
  const response = await axios.put(`${API}/items/${itemId}/actualizar/`, {
    cantidad: cantidad
  });
  return response.data;
}

// Eliminar item del carrito
export async function eliminarItemCarrito(itemId: number): Promise<{ message: string }> {
  const response = await axios.delete(`${API}/items/${itemId}/eliminar/`);
  return response.data;
}

// Vaciar carrito
export async function vaciarCarrito(carritoId: number): Promise<{ message: string }> {
  const response = await axios.post(`${API}/carrito/${carritoId}/vaciar/`);
  return response.data;
}


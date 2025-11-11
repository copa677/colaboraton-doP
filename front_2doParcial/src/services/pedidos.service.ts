import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL + '/carrito';

// Interfaces basadas en tu modelo de Django
export interface Pedido {
  id: number;
  usuario: number;
  usuario_username: string;
  carrito: number;
  total: string;
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
  direccion_envio: string;
  telefono_contacto: string;
  notas?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Campos relacionados
  carrito_items?: any[]; // Items del carrito
  estado_display?: string;
}

export interface CreatePedidoData {
  direccion_envio: string;
  telefono_contacto: string;
  notas?: string;
}

export interface UpdatePedidoEstadoData {
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
}

// =========================================================================
// OPERACIONES CRUD DE PEDIDOS
// =========================================================================

/**
 * Crear un pedido a partir del carrito
 */
export async function crearPedido(carritoId: number, data: CreatePedidoData): Promise<Pedido> {
  const response = await axios.post(`${API}/pedidos/crear/${carritoId}/`, data);
  return response.data;
}

/**
 * Listar todos los pedidos de un usuario
 */
export async function listarPedidosUsuario(usuarioId: number): Promise<Pedido[]> {
  const response = await axios.get(`${API}/pedidos/usuario/${usuarioId}/`);
  return response.data;
}

/**
 * Obtener un pedido específico por ID
 */
export async function obtenerPedido(pedidoId: number): Promise<Pedido> {
  const response = await axios.get(`${API}/pedidos/${pedidoId}/`);
  return response.data;
}

/**
 * Actualizar estado de un pedido
 */
export async function actualizarEstadoPedido(
  pedidoId: number, 
  estado: UpdatePedidoEstadoData['estado']
): Promise<Pedido> {
  const response = await axios.put(`${API}/pedidos/${pedidoId}/actualizar-estado/`, {
    estado
  });
  return response.data;
}

/**
 * Cancelar un pedido
 */
export async function cancelarPedido(pedidoId: number): Promise<{
  message: string;
  pedido: Pedido;
}> {
  const response = await axios.post(`${API}/pedidos/${pedidoId}/cancelar/`);
  return response.data;
}

/**
 * Listar todos los pedidos (para administración)
 */
export async function listarTodosPedidos(): Promise<Pedido[]> {
  const response = await axios.get(`${API}/pedidos/todos/`);
  return response.data;
}

// =========================================================================
// UTILIDADES Y HELPERS
// =========================================================================

/**
 * Formatear fecha para display
 */
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtener color según estado del pedido
 */
export function getColorEstadoPedido(estado: string): string {
  const colores = {
    'pendiente': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'confirmado': 'text-blue-600 bg-blue-50 border-blue-200',
    'preparando': 'text-orange-600 bg-orange-50 border-orange-200',
    'enviado': 'text-purple-600 bg-purple-50 border-purple-200',
    'entregado': 'text-green-600 bg-green-50 border-green-200',
    'cancelado': 'text-red-600 bg-red-50 border-red-200'
  };
  return colores[estado as keyof typeof colores] || 'text-gray-600 bg-gray-50 border-gray-200';
}

/**
 * Obtener ícono según estado del pedido
 */
export function getIconoEstadoPedido(estado: string): string {
  const iconos = {
    'pendiente': '⏳',
    'confirmado': '✅',
    'preparando': '👨‍🍳',
    'enviado': '🚚',
    'entregado': '📦',
    'cancelado': '❌'
  };
  return iconos[estado as keyof typeof iconos] || '📄';
}

/**
 * Obtener texto descriptivo del estado del pedido
 */
export function getTextoEstadoPedido(estado: string): string {
  const textos = {
    'pendiente': 'Pendiente',
    'confirmado': 'Confirmado',
    'preparando': 'En preparación',
    'enviado': 'Enviado',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado'
  };
  return textos[estado as keyof typeof textos] || estado;
}

/**
 * Obtener el progreso del pedido (para barras de progreso)
 */
export function getProgresoPedido(estado: string): number {
  const progreso = {
    'pendiente': 0,
    'confirmado': 20,
    'preparando': 40,
    'enviado': 80,
    'entregado': 100,
    'cancelado': 0
  };
  return progreso[estado as keyof typeof progreso] || 0;
}

/**
 * Verificar si un pedido puede ser cancelado
 */
export function puedeCancelarPedido(estado: string): boolean {
  const estadosCancelables = ['pendiente', 'confirmado', 'preparando'];
  return estadosCancelables.includes(estado);
}

/**
 * Verificar si un pedido está completado
 */
export function estaCompletadoPedido(estado: string): boolean {
  return estado === 'entregado';
}

/**
 * Calcular tiempo estimado de entrega
 */
export function getTiempoEstimado(estado: string, fechaCreacion: string): string {
  const fecha = new Date(fechaCreacion);
  const estimaciones = {
    'pendiente': '1-2 días',
    'confirmado': '1-2 días',
    'preparando': '12-24 horas',
    'enviado': '2-4 horas',
    'entregado': 'Entregado',
    'cancelado': 'No aplica'
  };
  
  return estimaciones[estado as keyof typeof estimaciones] || 'Por confirmar';
}
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL + '/facturas';

// Interfaces basadas en tu modelo de Django
export interface Factura {
  id?: number;
  pedido: number;
  cod_factura: string;
  fecha_creacion: string;
  monto_total: string;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  estado_pago: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  metodo_pago?: 'tarjeta' | 'efectivo' | 'transferencia' | 'qr';
  fecha_pago?: string;
  codigo_autorizacion?: string;
  ultimos_digitos_tarjeta?: string;
  tipo_tarjeta?: string;
  estado?: boolean;
  
  // Campos relacionados (populados por el backend)
  pedido_info?: any; // Tipo Pedido del carrito.service
  usuario_username?: string;
  usuario_correo?: string;
  numero_factura?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  estado_display?: string;
  metodo_pago_display?: string;
}

export interface CreateFacturaManualData {
  pedido_id: number;
  metodo_pago: 'tarjeta' | 'efectivo' | 'transferencia' | 'qr';
  monto_total?: number;
}

export interface StripeSessionResponse {
  checkout_url: string;
  session_id: string;
  factura_id: number;
  cod_factura: string;
  monto_total: number;
}

export interface PaymentVerificationResponse {
  factura: Factura;
  stripe_status?: string;
  checkout_url?: string;
  message?: string;
}

// =========================================================================
// VISTAS DE PAGO CON STRIPE
// =========================================================================

/**
 * Crear sesión de pago con Stripe para un pedido
 */
export async function crearSesionPago(pedidoId: number): Promise<StripeSessionResponse> {
  const response = await axios.post(`${API}/pago/crear-sesion/${pedidoId}/`);
  return response.data;
}

/**
 * Verificar estado de pago de una factura
 */
export async function verificarEstadoPago(facturaId: number): Promise<PaymentVerificationResponse> {
  const response = await axios.get(`${API}/pago/verificar/${facturaId}/`);
  return response.data;
}

/**
 * Callback para pagos exitosos (usado después del redirect de Stripe)
 */
export async function pagoExitoso(sessionId: string, facturaId: string): Promise<{
  message: string;
  factura: Factura;
  pedido_id: number;
}> {
  const response = await axios.get(`${API}/pago/exito/`, {
    params: { session_id: sessionId, factura_id: facturaId }
  });
  return response.data;
}

/**
 * Callback para pagos cancelados
 */
export async function pagoCancelado(facturaId: string): Promise<{
  message: string;
  factura_id: string;
  cod_factura: string;
}> {
  const response = await axios.get(`${API}/pago/cancelado/`, {
    params: { factura_id: facturaId }
  });
  return response.data;
}

// =========================================================================
// CRUD FACTURAS
// =========================================================================

/**
 * Listar todas las facturas activas
 */
export async function listarFacturas(): Promise<Factura[]> {
  const response = await axios.get(`${API}/`);
  return response.data;
}

/**
 * Obtener una factura específica por ID
 */
export async function obtenerFactura(id: number): Promise<Factura> {
  const response = await axios.get(`${API}/${id}/`);
  return response.data;
}

/**
 * Obtener facturas de un usuario específico
 */
export async function obtenerFacturasUsuario(usuarioId: number): Promise<Factura[]> {
  const response = await axios.get(`${API}/usuario/${usuarioId}/`);
  return response.data;
}

/**
 * Obtener facturas del usuario autenticado
 */
export async function obtenerMisFacturas(usuarioId: number): Promise<Factura[]> {
  const response = await axios.get(`${API}/mis-facturas/`, {
    params: { usuario_id: usuarioId }
  });
  return response.data;
}

/**
 * Crear factura manual para pagos en efectivo/transferencia
 */
export async function crearFacturaManual(data: CreateFacturaManualData): Promise<Factura> {
  const response = await axios.post(`${API}/crear-manual/`, data);
  return response.data;
}

/**
 * Eliminación lógica de factura
 */
export async function eliminarFactura(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/${id}/eliminar/`);
  return response.data;
}

/**
 * Restaurar factura eliminada
 */
export async function restaurarFactura(id: number): Promise<{
  message: string;
  factura: Factura;
}> {
  const response = await axios.post(`${API}/${id}/restaurar/`);
  return response.data;
}

// =========================================================================
// UTILIDADES
// =========================================================================

/**
 * Formatear monto para display
 */
export function formatearMonto(monto: string | number): string {
  const amount = typeof monto === 'string' ? parseFloat(monto) : monto;
  return `$${amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Obtener color según estado de pago
 */
export function getColorEstadoPago(estado: string): string {
  const colores = {
    'completado': 'text-green-600 bg-green-50',
    'pendiente': 'text-yellow-600 bg-yellow-50',
    'fallido': 'text-red-600 bg-red-50',
    'reembolsado': 'text-blue-600 bg-blue-50'
  };
  return colores[estado as keyof typeof colores] || 'text-gray-600 bg-gray-50';
}

/**
 * Obtener ícono según estado de pago
 */
export function getIconoEstadoPago(estado: string): string {
  const iconos = {
    'completado': '✅',
    'pendiente': '⏳',
    'fallido': '❌',
    'reembolsado': '↩️'
  };
  return iconos[estado as keyof typeof iconos] || '📄';
}

/**
 * Obtener texto descriptivo del estado de pago
 */
export function getTextoEstadoPago(estado: string): string {
  const textos = {
    'completado': 'Pagado',
    'pendiente': 'Pendiente de pago',
    'fallido': 'Pago fallido',
    'reembolsado': 'Reembolsado'
  };
  return textos[estado as keyof typeof textos] || estado;
}
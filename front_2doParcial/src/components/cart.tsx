// components/cart.tsx - VERSIÓN CON FORMULARIO DE PEDIDO
"use client"

import { X, Plus, Minus, Loader2, ImageOff } from "lucide-react"
import { useState } from "react"
import FormularioPedido from "./factura/pedidoFromDAta"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface CartProps {
  items: CartItem[]
  onClose: () => void
  onUpdateQuantity: (id: number, quantity: number) => void
  updatingItems?: number[]
  onProceedToCheckout?: (formData: {
    direccion_envio: string
    telefono_contacto: string
    notas: string
  }) => void // ← NUEVA PROP
}

export default function Cart({
  items,
  onClose,
  onUpdateQuantity,
  updatingItems = [],
  onProceedToCheckout
}: CartProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [showCheckoutForm, setShowCheckoutForm] = useState(false) // ← NUEVO ESTADO

  const handleImageError = (itemId: number) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  }

  const isUpdating = (itemId: number) => updatingItems.includes(itemId);
  const hasImageError = (itemId: number) => imageErrors.has(itemId);

  // Función para manejar "Proceder al Pago"
  const handleProceedToPayment = () => {
    setShowCheckoutForm(true);
  }

  // Función para manejar el cierre del formulario
  const handleCloseCheckoutForm = () => {
    setShowCheckoutForm(false);
  }

  // Función para manejar el envío exitoso del formulario
  const handleCheckoutSuccess = (formData: {
    direccion_envio: string
    telefono_contacto: string
    notas: string
  }) => {
    if (onProceedToCheckout) {
      onProceedToCheckout(formData);
    }
    // Cerrar tanto el formulario como el carrito
    setShowCheckoutForm(false);
    onClose();
  }

  // Si se está mostrando el formulario de checkout, mostrar solo el formulario
  if (showCheckoutForm) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <FormularioPedido 
            onSubmitSuccess={handleCheckoutSuccess}
            onCancel={handleCloseCheckoutForm}
            total={total}
            itemsCount={items.length}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Tu Carrito</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            disabled={updatingItems.length > 0}
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-4xl mb-4">🛒</div>
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b">
                  {/* Contenedor de imagen mejorado */}
                  <div className="flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center">
                    {hasImageError(item.id) ? (
                      <div className="text-gray-400 flex flex-col items-center">
                        <ImageOff size={20} />
                        <span className="text-xs mt-1">Sin imagen</span>
                      </div>
                    ) : (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(item.id)}
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-sm text-blue-600 font-bold mt-1">${item.price}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={isUpdating(item.id)}
                        className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="px-3 py-1 bg-gray-100 rounded text-sm font-semibold min-w-12 text-center flex items-center justify-center border">
                        {isUpdating(item.id) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={isUpdating(item.id)}
                        className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col justify-between">
                    <p className="font-bold text-blue-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    {isUpdating(item.id) && (
                      <p className="text-xs text-gray-500">Actualizando...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
              
              {/* Resumen del pedido */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm text-blue-800">
                  <span>Productos:</span>
                  <span>{items.length} item(s)</span>
                </div>
                <div className="flex justify-between text-sm text-blue-800 mt-1">
                  <span>Total:</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={handleProceedToPayment}
                disabled={updatingItems.length > 0 || items.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {updatingItems.length > 0 ? 'Actualizando...' : 'Proceder al Pago'}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Serás redirigido al formulario de información de envío
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
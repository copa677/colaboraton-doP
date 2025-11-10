"use client"

import { X, Plus, Minus } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

export default function Cart({
  items,
  onClose,
  onUpdateQuantity,
}: {
  items: CartItem[]
  onClose: () => void
  onUpdateQuantity: (id: number, quantity: number) => void
}) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-end">
      <div className="bg-card w-full max-w-md h-full overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Tu Carrito</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">Tu carrito está vacío</div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                  <div className="text-4xl flex-shrink-0 bg-muted rounded-lg p-3 flex items-center justify-center">
                    {item.image}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{item.name}</p>
                    <p className="text-sm text-primary font-bold mt-1">${item.price}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-muted rounded-lg transition text-foreground"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-1 bg-muted rounded text-sm font-semibold text-foreground min-w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-muted rounded-lg transition text-foreground"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition">
                Proceder al Pago
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

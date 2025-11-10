"use client"

import { Heart, ShoppingCart } from "lucide-react"
import { useState } from "react"

interface Product {
  id: number
  name: string
  price: number
  image: string
  rating: number
  reviews: number
  category: string
}

export default function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: () => void
}) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition group">
      <div className="relative bg-muted h-48 flex items-center justify-center overflow-hidden">
        <div className="text-6xl group-hover:scale-110 transition duration-300">{product.image}</div>
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition"
        >
          <Heart size={18} className={liked ? "fill-red-500 text-red-500" : "text-gray-400"} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-balance">{product.name}</h3>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-medium text-foreground">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">${product.price}</span>
        </div>

        <button
          onClick={onAddToCart}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Agregar
        </button>
      </div>
    </div>
  )
}

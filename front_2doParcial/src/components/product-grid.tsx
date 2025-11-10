"use client"

import ProductCard from "./product-card"

const products = [
  {
    id: 1,
    name: 'Laptop Pro 15"',
    category: "Laptops",
    price: 1299,
    image: "💻",
    rating: 4.8,
    reviews: 342,
  },
  {
    id: 2,
    name: 'Televisor 4K 55"',
    category: "Televisores",
    price: 599,
    image: "📺",
    rating: 4.6,
    reviews: 128,
  },
  {
    id: 3,
    name: "Refrigerador Inteligente",
    category: "Electrodomésticos",
    price: 1899,
    image: "🧊",
    rating: 4.7,
    reviews: 95,
  },
  {
    id: 4,
    name: "Mouse Inalámbrico",
    category: "Accesorios",
    price: 29,
    image: "🖱️",
    rating: 4.5,
    reviews: 512,
  },
  {
    id: 5,
    name: "Procesador Intel i9",
    category: "Componentes",
    price: 599,
    image: "⚙️",
    rating: 4.9,
    reviews: 287,
  },
  {
    id: 6,
    name: "Teclado Mecánico RGB",
    category: "Accesorios",
    price: 149,
    image: "⌨️",
    rating: 4.8,
    reviews: 654,
  },
  {
    id: 7,
    name: "Lavadora Automática",
    category: "Electrodomésticos",
    price: 799,
    image: "🔄",
    rating: 4.7,
    reviews: 203,
  },
  {
    id: 8,
    name: "Audífonos Premium",
    category: "Audio",
    price: 349,
    image: "🎧",
    rating: 4.6,
    reviews: 789,
  },
  {
    id: 9,
    name: "Laptop Gaming",
    category: "Laptops",
    price: 1899,
    image: "🎮",
    rating: 4.9,
    reviews: 421,
  },
  {
    id: 10,
    name: 'Monitor 4K 32"',
    category: "Accesorios",
    price: 449,
    image: "🖥️",
    rating: 4.7,
    reviews: 156,
  },
  {
    id: 11,
    name: "Tarjeta Gráfica RTX",
    category: "Componentes",
    price: 799,
    image: "🎨",
    rating: 4.8,
    reviews: 334,
  },
  {
    id: 12,
    name: "Horno Microondas",
    category: "Electrodomésticos",
    price: 199,
    image: "🔥",
    rating: 4.5,
    reviews: 267,
  },
]

export default function ProductGrid({ onAddToCart }: { onAddToCart: (product: any) => void }) {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-balance">Productos Destacados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={() => onAddToCart(product)} />
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react";
import Header from "../../components/header";
import Hero from "../../components/hero";
import Categories from "../../components/categories";
import ProductGrid from "../../components/product-grid";
import Footer from "../../components/footer";
import Cart from "../../components/cart";

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<
    Array<{ id: number; name: string; price: number; quantity: number; image: string }>
  >([])

  const addToCart = (product: { id: number; name: string; price: number; image: string }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header cartCount={cartItems.length} onCartClick={() => setCartOpen(!cartOpen)} />
      {cartOpen && <Cart items={cartItems} onClose={() => setCartOpen(false)} onUpdateQuantity={updateQuantity} />}
      <Hero />
      <Categories />
      <ProductGrid onAddToCart={addToCart} />
      <Footer />
    </main>
  )
}


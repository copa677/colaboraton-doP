"use client"

import type React from "react"

import { ShoppingCart, Menu, Search } from "lucide-react"
import { useState } from "react"
import UserMenu from "./user-menu"

export default function Header({ cartCount, onCartClick }: { cartCount: number; onCartClick: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Buscando:", searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">⚡</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">TechMart</h1>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="flex items-center w-full bg-muted rounded-lg px-3 py-2 border border-border hover:border-primary transition">
              <Search size={18} className="text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-foreground placeholder-muted-foreground"
              />
            </div>
          </form>

          <nav className="hidden lg:flex gap-8">
            <a href="#" className="text-foreground hover:text-primary transition">
              Inicio
            </a>
            <a href="#" className="text-foreground hover:text-primary transition">
              Productos
            </a>
            <a href="#" className="text-foreground hover:text-primary transition">
              Ofertas
            </a>
            
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onCartClick} className="relative p-2 hover:bg-muted rounded-lg transition">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <UserMenu />
            <button className="md:hidden p-2 hover:bg-muted rounded-lg transition">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

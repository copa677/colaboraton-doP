"use client"

import { useState, useCallback } from "react"
import { ShoppingCart, Menu, Search, X } from "lucide-react"
import UserMenu from "./user-menu"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
  cartCount: number
  onCartClick: () => void
}

export default function Header({ cartCount, onCartClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        console.log("Buscando:", searchQuery)
        setSearchOpen(false) // cerrar en móvil al buscar
      }
    },
    [searchQuery]
  )

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm backdrop-blur-md bg-card/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* LOGO */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-bold">⚡</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">TechMart</h1>
          </div>

          {/* BARRA DE BÚSQUEDA (solo escritorio) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md"
            role="search"
            aria-label="Buscar productos"
          >
            <div className="flex items-center w-full bg-muted rounded-lg px-3 py-2 border border-border focus-within:border-primary transition">
              <Search size={18} className="text-muted-foreground mr-2" />
              <input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-foreground placeholder-muted-foreground"
                aria-label="Buscar productos"
              />
            </div>
          </form>

          {/* NAVEGACIÓN DESKTOP */}
          <nav className="hidden lg:flex gap-8 font-medium">
            {["Inicio", "Productos", "Ofertas"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-foreground hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* ACCIONES DERECHA */}
          <div className="flex items-center gap-3">
            {/* 🔍 Icono de búsqueda móvil */}
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            {/* 🛒 Carrito */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-muted rounded-lg transition"
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground 
                             text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* 👤 Menú usuario */}
            <UserMenu />

            {/* ☰ Menú móvil */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition"
              aria-label="Abrir menú móvil"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Menú móvil */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <nav className="flex flex-col p-4 space-y-2">
            {["Inicio", "Productos", "Ofertas"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-foreground hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* 🔹 Búsqueda móvil (animada con framer-motion) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-16 bg-card border-b border-border px-4 py-3 shadow-md md:hidden"
          >
            <form onSubmit={handleSearch} className="flex items-center">
              <Search size={18} className="text-muted-foreground mr-2" />
              <input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition ml-2"
                aria-label="Cerrar búsqueda"
              >
                <X size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

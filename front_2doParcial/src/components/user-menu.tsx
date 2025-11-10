"use client"

import { User, LogOut, Heart, History, UserCircle } from "lucide-react"
import { useState } from "react"

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
    setIsOpen(false)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-lg transition flex items-center justify-center"
        aria-label="Menu de usuario"
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="py-1">
            {!isLoggedIn ? (
              <button
                onClick={handleLogin}
                className="w-full text-left px-4 py-2 hover:bg-muted transition flex items-center gap-2 text-foreground"
              >
                <LogOut size={16} />
                Inicio de sesión
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-muted transition flex items-center gap-2 text-foreground"
              >
                <LogOut size={16} />
                Cierre de sesión
              </button>
            )}

            {isLoggedIn && (
              <>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-muted transition flex items-center gap-2 text-foreground"
                >
                  <Heart size={16} />
                  Favoritos
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-muted transition flex items-center gap-2 text-foreground"
                >
                  <History size={16} />
                  Historial de pedidos
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-muted transition flex items-center gap-2 text-foreground"
                >
                  <UserCircle size={16} />
                  Perfil
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

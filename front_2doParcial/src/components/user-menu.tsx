"use client"

import { User, LogOut, Heart, History, UserCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogin = () => {
    setIsOpen(false)
    navigate('/login')
  }

  const handleLogout = () => {
    setIsOpen(false)
    logout()
    // El logout ya redirige a '/' automáticamente
  }

  

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-muted rounded-lg transition flex items-center justify-center"
        aria-label="Menu de usuario"
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="py-1">
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                className="w-full text-left px-4 py-2 hover:bg-muted transition flex items-center gap-2 text-foreground"
              >
                <LogOut size={16} />
                Iniciar Sesión
              </button>
            ) : (
              <>
                {/* Información del usuario */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{user?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.correo}</p>
                  <p className="text-xs text-primary font-medium capitalize mt-1">
                    {user?.tipo_usuario}
                  </p>
                </div>

                

                {/* Opciones del usuario */}
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-muted transition flex items-center gap-2 text-foreground"
                >
                  <UserCircle size={16} />
                  Mi Perfil
                </a>
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
                  Historial de Pedidos
                </a>

                {/* Separador */}
                <div className="border-t border-border my-1"></div>

                {/* Cerrar sesión */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition flex items-center gap-2 text-red-600"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
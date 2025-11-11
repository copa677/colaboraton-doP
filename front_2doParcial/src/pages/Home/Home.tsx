import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, UserCheck, BookOpen, Shield, Boxes,
  Menu, X, Zap, LogOut, ChevronRight, Tags, Building2, Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/home/usuarios', label: 'Usuarios', icon: Users },
    { path: '/home/empleado', label: 'Empleado', icon: Briefcase },
    { path: '/home/cliente', label: 'Cliente', icon: UserCheck },
    { path: '/home/permisos', label: 'Permisos', icon: Shield },
    { path: '/home/categorias', label: 'Categorias', icon: Tags },
    { path: '/home/marcas', label: 'Marcas', icon: Building2 },
    { path: '/home/productos', label: 'Productos', icon: Package },
    { path: '/home/inventario', label: 'Inventario', icon: Boxes },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Simular un pequeño delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500));

      logout();

      // Mostrar toast de éxito
      toast.success('Sesión cerrada exitosamente', {
        duration: 3000,
        position: 'top-right',
        icon: '👋',
        style: {
          background: '#10B981',
          color: 'white',
        },
      });

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      // Mostrar toast de error
      toast.error('Error al cerrar sesión. Intenta nuevamente.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: 'white',
        },
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-600 to-indigo-700 text-white transition-all duration-300 ease-in-out flex flex-col h-full fixed left-0 top-0 bottom-0`}>

        {/* Logo - parte superior fija */}
        <div className="p-6 flex items-center justify-between border-b border-blue-500 flex-shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xl font-bold">TechHome</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menú - área con scroll */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-2">
            {menuItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${active
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="font-medium flex-1 text-left">{label}</span>
                        {active && <ChevronRight className="w-4 h-4" />}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout - parte inferior fija */}
        <div className="p-4 border-t border-blue-500 flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isLoggingOut
                ? 'opacity-50 cursor-not-allowed'
                : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
          >
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-blue-100 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 flex-shrink-0" />
            )}
            {sidebarOpen && (
              <span className="font-medium">
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Bienvenido de nuevo, {user?.username || 'Usuario'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user?.username || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.correo || 'usuario@techhome.com'}
                </p>
                <p className="text-xs text-blue-600 font-medium capitalize">
                  {user?.tipo_usuario || 'Usuario'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {user ? getInitials(user.username) : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Renderiza la subruta */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Users, Briefcase, UserCheck, BookOpen, Shield, 
  Menu, X, Zap, LogOut, ChevronRight 
} from 'lucide-react';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/home/usuarios', label: 'Usuarios', icon: Users },
    { path: '/home/empleado', label: 'Empleado', icon: Briefcase },
    { path: '/home/cliente', label: 'Cliente', icon: UserCheck },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-600 to-indigo-700 text-white transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-blue-500">
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

        {/* Menu */}
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-2">
            {menuItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
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

        {/* Logout */}
        <div className="p-4 border-t border-blue-500">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-blue-500 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Bienvenido de nuevo, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">Admin Usuario</p>
                <p className="text-xs text-gray-500">admin@techhome.com</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                A
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

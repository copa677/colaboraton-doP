import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Auth/Login';
import Home from '../pages/Home/Home';
import EmpleadosPage from '../pages/Empleados/Empleados';
import UsuariosPage from '../pages/Usuarios/usuarios';
import ClientesPage from '../pages/Clientes/Clientes';
import PermisosPage from '../pages/Permisos/permisos';
import CategoriasPage from '../pages/Categorias/categorias';
import MarcasPage from '../pages/Marcas/Marcas';
import ProductosPage from '../pages/Productos/productos';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta del Login */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
      />
      
      {/* Rutas protegidas */}
      <Route 
        path="/home" 
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      >
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="empleado" element={<EmpleadosPage />} />
        <Route path="cliente" element={<ClientesPage />} />
        <Route path="permisos" element={<PermisosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="marcas" element={<MarcasPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route index element={<Navigate to="usuarios" />} />
      </Route>
      
      {/* Ruta raíz - redirige según autenticación */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} 
      />
      
      {/* Ruta 404 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-800">404</h1>
              <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
              <button 
                onClick={() => window.location.href = isAuthenticated ? '/home' : '/login'}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {isAuthenticated ? 'Ir al Home' : 'Ir al Login'}
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
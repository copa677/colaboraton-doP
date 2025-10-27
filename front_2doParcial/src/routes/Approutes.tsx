import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Home from '../pages/Home/Home';
import EmpleadosPage from '../pages/Empleados/Empleados';
import UsuariosPage from '../pages/Usuarios/usuarios';
import ClientesPage from '../pages/Clientes/Clientes';

const AppRoutes = () => {
  // Simula si el usuario está autenticado
  // En producción, esto vendría de un Context o estado global
  const isAuthenticated = true; // Cambia a true para probar el Home

  return (
    <Routes>
      {/* Ruta del Login */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
      />
      
      {/* HOME + SUBRUTAS */}
      <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />}>
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="empleado" element={<EmpleadosPage />} />
        <Route path="cliente" element={<ClientesPage />} />
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
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
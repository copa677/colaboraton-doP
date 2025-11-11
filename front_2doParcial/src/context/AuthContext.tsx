import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUsuario } from '../services/usuarios.service'; 
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  correo: string;
  tipo_usuario: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  userType: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const userObj = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(userObj);
        setUserType(userObj.tipo_usuario);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await loginUsuario({ username, password });
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setIsAuthenticated(true);
      setUser(response.user);
      setUserType(response.user.tipo_usuario);
      
      // Redirigir según el tipo de usuario
      if (response.user.tipo_usuario === 'empleado') {
        navigate('/home'); // Panel administrativo
      } else {
        // Si es cliente, se queda en la página actual (home-cliente)
        // O puedes redirigir a una página específica para clientes
        navigate('/'); // Se queda en el home público
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setUserType(null);
    navigate('/'); // Redirige al home público
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, userType }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
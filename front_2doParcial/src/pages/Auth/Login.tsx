import { useState } from 'react';
import { Zap, User, Lock, Eye, EyeOff, ShoppingCart, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!username.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      toast.error('Completa todos los campos', {
        duration: 3000,
        position: 'top-right'
      });
      return;
    }

    setError('');

    try {
      const success = await login(username.trim(), password.trim());
      
      if (success) {
        // Si el usuario quiere que lo recuerden, guardar credenciales
        if (rememberMe) {
          localStorage.setItem('rememberedUser', username);
        } else {
          localStorage.removeItem('rememberedUser');
        }
        
        // Toast de éxito
        toast.success(`¡Bienvenido ${username}!`, {
          duration: 3000,
          position: 'top-right',
          icon: '👋',
          style: {
            background: '#10B981',
            color: 'white',
          },
        });
        
        // Redirigir al home después del toast
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        const errorMsg = 'Credenciales incorrectas. Por favor, intenta nuevamente.';
        setError(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: 'white',
          },
        });
      }
      
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
      
      // Mensajes de error más específicos
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      
      // Toast de error
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: 'white',
        },
      });
      
      console.error('Error en login:', error);
    }
  };

  // Cargar usuario recordado al montar el componente
  useState(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }
  });

  // Manejar envío con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Zap className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">TechHome</h1>
            <p className="text-blue-100 flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Electrodomésticos de calidad
            </p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h2>
            <p className="text-gray-600 mb-6">Inicia sesión en tu cuenta</p>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(''); // Limpiar error al escribir
                    }}
                    onKeyPress={handleKeyPress}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="usuario123"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(''); // Limpiar error al escribir
                    }}
                    onKeyPress={handleKeyPress}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                </label>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                  onClick={() => toast('Función en desarrollo', { duration: 3000 })}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Iniciando Sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <button 
                className="text-blue-600 hover:text-blue-700 font-semibold"
                disabled={loading}
                onClick={() => toast('Registro en desarrollo', { duration: 3000 })}
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-white text-sm mt-6">
          © 2025 TechHome. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
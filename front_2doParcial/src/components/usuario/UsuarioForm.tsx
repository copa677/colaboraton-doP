import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { registrarUsuario, actualizarUsuario } from '../../services/usuarios.service';
import type { Usuario } from '../../services/usuarios.service';
import toast from 'react-hot-toast';

interface UsuarioFormProps {
  usuario?: Usuario; // Para modo edición
  onSuccess: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const UsuarioForm: React.FC<UsuarioFormProps> = ({ 
  usuario, 
  onSuccess, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    correo: '',
    password: '',
    tipo_usuario: 'usuario'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Si estamos editando, cargar los datos del usuario
  useEffect(() => {
    if (usuario) {
      setFormData({
        username: usuario.username,
        correo: usuario.correo,
        password: '', // No cargar password en edición
        tipo_usuario: usuario.tipo_usuario
      });
    }
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Validaciones básicas
      if (!formData.username.trim() || !formData.correo.trim()) {
        toast.error('Username y correo son obligatorios');
        return;
      }

      if (!usuario && !formData.password) {
        toast.error('La contraseña es obligatoria para nuevos usuarios');
        return;
      }

      if (usuario) {
        // Modo edición
        const updateData: any = {
          username: formData.username,
          correo: formData.correo,
          tipo_usuario: formData.tipo_usuario
        };

        // Solo incluir password si se proporcionó uno nuevo
        if (formData.password) {
          updateData.password = formData.password;
        }

        await actualizarUsuario(usuario.id!, updateData);
        toast.success('Usuario actualizado correctamente');
      } else {
        // Modo creación
        await registrarUsuario(formData);
        toast.success('Usuario creado correctamente');
      }

      onSuccess();
      
    } catch (error: any) {
      console.error('Error guardando usuario:', error);
      toast.error(error.message || 'Error al guardar el usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isEditing = !!usuario;
  const isLoading = formLoading || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de Usuario *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="usuario123"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="usuario@ejemplo.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña {!isEditing && '*'}
          {isEditing && <span className="text-gray-500 text-xs ml-1">(dejar vacío para mantener la actual)</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder={isEditing ? "Nueva contraseña" : "••••••••"}
            required={!isEditing}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Tipo de Usuario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Usuario *
        </label>
        <select
          name="tipo_usuario"
          value={formData.tipo_usuario}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          disabled={isLoading}
        >
          <option value="usuario">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="empleado">Empleado</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            isEditing ? 'Actualizar Usuario' : 'Crear Usuario'
          )}
        </button>
      </div>
    </form>
  );
};
import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, IdCard } from 'lucide-react';
import {  registrarCliente, actualizarCliente } from '../../services/clientes.service';
import type { Cliente,CreateClienteData } from '../../services/clientes.service';

import toast from 'react-hot-toast';

interface ClienteFormProps {
  cliente?: Cliente; // Para modo edición
  onSuccess: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ 
  cliente, 
  onSuccess, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    // Datos de usuario
    username: '',
    correo: '',
    password: '',
    tipo_usuario: 'cliente',
    
    // Datos de cliente
    nombre_completo: '',
    telefono: '',
    direccion: '',
    ci: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Si estamos editando, cargar los datos del cliente
  useEffect(() => {
    if (cliente) {
      setFormData({
        username: '', // No se puede editar el username
        correo: '', // No se puede editar el correo
        password: '', // Password solo si se quiere cambiar
        tipo_usuario: 'cliente',
        nombre_completo: cliente.nombre_completo,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        ci: cliente.ci
      });
    }
  }, [cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Validaciones básicas
      if (!formData.nombre_completo.trim() || !formData.telefono.trim() || 
          !formData.direccion.trim() || !formData.ci.trim()) {
        toast.error('Todos los campos del cliente son obligatorios');
        return;
      }

      if (!cliente && (!formData.username.trim() || !formData.correo.trim() || !formData.password)) {
        toast.error('Todos los campos de usuario son obligatorios para nuevos clientes');
        return;
      }

      if (cliente) {
        // Modo edición - solo datos del cliente
        const updateData = {
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ci: formData.ci
        };

        await actualizarCliente(cliente.id!, updateData);
        toast.success('Cliente actualizado correctamente');
      } else {
        // Modo creación - datos de usuario + cliente
        const createData: CreateClienteData = {
          username: formData.username,
          correo: formData.correo,
          password: formData.password,
          tipo_usuario: 'cliente',
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ci: formData.ci
        };

        await registrarCliente(createData);
        toast.success('Cliente creado correctamente');
      }

      onSuccess();
      
    } catch (error: any) {
      console.error('Error guardando cliente:', error);
      toast.error(error.message || 'Error al guardar el cliente');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isEditing = !!cliente;
  const isLoading = formLoading || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEditing && (
        <>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Datos de Usuario</h3>
            <p className="text-sm text-blue-600">Estos datos serán usados para que el cliente acceda al sistema</p>
          </div>

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
                required={!isEditing}
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
                placeholder="cliente@ejemplo.com"
                required={!isEditing}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
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
                placeholder="••••••••"
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
        </>
      )}

      <div className="bg-green-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-green-800 mb-2">Datos Personales del Cliente</h3>
        <p className="text-sm text-green-600">Información de contacto y ubicación</p>
      </div>

      {/* Nombre Completo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Juan Pérez García"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* CI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cédula de Identidad *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IdCard className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="ci"
            value={formData.ci}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="1234567"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teléfono *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="+591 7111-2222"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dirección *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            rows={3}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
            placeholder="Av. Principal #123, Zona ..."
            required
            disabled={isLoading}
          />
        </div>
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
            isEditing ? 'Actualizar Cliente' : 'Crear Cliente'
          )}
        </button>
      </div>
    </form>
  );
};
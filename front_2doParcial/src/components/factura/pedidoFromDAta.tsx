// components/formulario-pedido.tsx
import React, { useState } from 'react';
import { AlertCircle, MapPin, Phone, FileText, X, ShoppingBag } from 'lucide-react';

interface PedidoFormData {
  direccion_envio: string;
  telefono_contacto: string;
  notas: string;
}

interface FormularioPedidoProps {
  onSubmitSuccess: (formData: PedidoFormData) => void;
  onCancel: () => void;
  total: number;
  itemsCount: number;
}

export default function FormularioPedido({ 
  onSubmitSuccess, 
  onCancel, 
  total, 
  itemsCount 
}: FormularioPedidoProps) {
  const [formData, setFormData] = useState<PedidoFormData>({
    direccion_envio: '',
    telefono_contacto: '',
    notas: '',
  });

  const [errors, setErrors] = useState<Partial<PedidoFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof PedidoFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PedidoFormData> = {};

    if (!formData.direccion_envio.trim()) {
      newErrors.direccion_envio = 'La dirección de envío es requerida';
    }
    if (!formData.telefono_contacto.trim()) {
      newErrors.telefono_contacto = 'El teléfono de contacto es requerido';
    } else if (!/^\d{7,20}$/.test(formData.telefono_contacto.replace(/[\s-]/g, ''))) {
      newErrors.telefono_contacto = 'Ingrese un teléfono válido (7-20 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simular envío al backend
    setTimeout(() => {
      console.log('Datos del pedido:', formData);
      
      // Llamar a la función de éxito
      onSubmitSuccess(formData);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Información de Envío</h1>
          <p className="text-blue-100 text-sm">Complete los datos para su pedido</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-white hover:text-blue-200 transition p-1"
        >
          <X size={24} />
        </button>
      </div>

      {/* Resumen del Pedido */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={20} className="text-blue-600" />
            <span className="font-semibold">Resumen del Pedido</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{itemsCount} producto(s)</p>
            <p className="text-lg font-bold text-blue-600">${total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dirección de Envío */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={18} className="text-blue-600" />
              <span>Dirección de Envío *</span>
            </label>
            <textarea
              name="direccion_envio"
              value={formData.direccion_envio}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
                errors.direccion_envio ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Calle, número, barrio, ciudad..."
            />
            {errors.direccion_envio && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.direccion_envio}
              </p>
            )}
          </div>

          {/* Teléfono de Contacto */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone size={18} className="text-blue-600" />
              <span>Teléfono de Contacto *</span>
            </label>
            <input
              type="tel"
              name="telefono_contacto"
              value={formData.telefono_contacto}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.telefono_contacto ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+591 12345678"
            />
            {errors.telefono_contacto && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.telefono_contacto}
              </p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={18} className="text-blue-600" />
              <span>Notas (Opcional)</span>
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              placeholder="Instrucciones especiales, horarios de entrega, etc..."
            />
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Confirmar Pedido'
              )}
            </button>
          </div>
        </form>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Los campos marcados con * son obligatorios</p>
        </div>
      </div>
    </div>
  );
}
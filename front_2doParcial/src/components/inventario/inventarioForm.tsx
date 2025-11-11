import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { crearInventario, actualizarInventario, type Inventario, type CreateInventarioData } from '../../services/inventario.service';
import { listarProductos, type Producto } from '../../services/productos.service';
import toast from 'react-hot-toast';

interface InventarioFormProps {
  inventario?: Inventario;
  onSuccess: () => void;
  onCancel: () => void;
}

export const InventarioForm: React.FC<InventarioFormProps> = ({ 
  inventario, 
  onSuccess, 
  onCancel
}) => {
  const [formData, setFormData] = useState({
    cantidad: inventario?.cantidad || 0,
    ubicacion: inventario?.ubicacion || '',
    producto_id: inventario?.producto?.toString() || '',
  });
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [productosLoading, setProductosLoading] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setProductosLoading(true);
    try {
      const productosData = await listarProductos();
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar la lista de productos');
    } finally {
      setProductosLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (inventario) {
        // Editar inventario existente
        await actualizarInventario(inventario.id!, {
          cantidad: formData.cantidad,
          ubicacion: formData.ubicacion
        });
        toast.success('Inventario actualizado correctamente');
      } else {
        // Crear nuevo inventario
        const createData: CreateInventarioData = {
          cantidad: formData.cantidad,
          ubicacion: formData.ubicacion,
          producto_id: parseInt(formData.producto_id)
        };
        await crearInventario(createData);
        toast.success('Inventario creado correctamente');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar inventario:', error);
      const errorMessage = error.response?.data?.error || 'Error al guardar el inventario';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? parseInt(value) || 0 : value
    }));
  };

  const isEditing = !!inventario;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Producto */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Producto *
          </label>
          <select
            name="producto_id"
            value={formData.producto_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
            disabled={isEditing || productosLoading || loading}
          >
            <option value="">Seleccionar producto</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.descripcion} - {producto.nombre_marca} ({producto.nombre_categoria})
              </option>
            ))}
          </select>
          {productosLoading && (
            <p className="text-xs text-gray-500 mt-1">Cargando productos...</p>
          )}
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              No se puede cambiar el producto de un inventario existente
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad *
          </label>
          <input
            type="number"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
            min="0"
            disabled={loading}
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación *
          </label>
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Ej: Almacén A - Estante 3"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || productosLoading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            isEditing ? 'Actualizar Inventario' : 'Crear Inventario'
          )}
        </button>
      </div>
    </form>
  );
};
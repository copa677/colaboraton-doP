import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { X, Plus, Trash2, Upload, Image, Save, AlertCircle } from 'lucide-react';

// Interfaces
interface Categoria {
  id: number;
  nombre: string;
}

interface Marca {
  id: number;
  nombre: string;
}

interface Especificacion {
  id: number;
  nombre: string;
  descripcion: string;
  estado?: boolean;
}

interface Imagen {
  id: number;
  imagen: string | ArrayBuffer | null;
  es_principal: boolean;
  estado?: boolean;
  file?: File;
}

interface Producto {
  id?: number;
  descripcion: string;
  precio: number | string;
  categoria?: Categoria;
  marca?: Marca;
  estado: boolean;
  imagenes: Imagen[];
  especificaciones: Especificacion[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ProductoFormProps {
  producto?: Producto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormDataState {
  descripcion: string;
  precio: number | string;
  categoria_id: number | string;
  marca_id: number | string;
  estado: boolean;
}

interface NuevaEspecificacionState {
  nombre: string;
  descripcion: string;
}

// Modal Component
export function Modal2({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ProductoForm Component
export function ProductoForm({ producto = null, onSuccess, onCancel }: ProductoFormProps) {
  const isEditMode = producto !== null;

  const [formData, setFormData] = useState<FormDataState>({
    descripcion: producto?.descripcion || '',
    precio: producto?.precio || '',
    categoria_id: producto?.categoria?.id || '',
    marca_id: producto?.marca?.id || '',
    estado: producto?.estado ?? true
  });

  const [especificaciones, setEspecificaciones] = useState<Especificacion[]>(
    producto?.especificaciones || []
  );

  const [imagenes, setImagenes] = useState<Imagen[]>(
    producto?.imagenes || []
  );

  const [nuevaEspecificacion, setNuevaEspecificacion] = useState<NuevaEspecificacionState>({
    nombre: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const categorias: Categoria[] = [
    { id: 1, nombre: 'Laptops' },
    { id: 2, nombre: 'Accesorios' },
    { id: 3, nombre: 'Monitores' },
    { id: 4, nombre: 'Audio' },
    { id: 5, nombre: 'Tablets' }
  ];

  const marcas: Marca[] = [
    { id: 1, nombre: 'Dell' },
    { id: 2, nombre: 'Logitech' },
    { id: 3, nombre: 'LG' },
    { id: 4, nombre: 'Corsair' },
    { id: 5, nombre: 'Sony' },
    { id: 6, nombre: 'Samsung' }
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAgregarEspecificacion = () => {
    if (!nuevaEspecificacion.nombre.trim() || !nuevaEspecificacion.descripcion.trim()) {
      alert('Complete todos los campos de la especificación');
      return;
    }

    setEspecificaciones(prev => [...prev, {
      id: Date.now(),
      nombre: nuevaEspecificacion.nombre,
      descripcion: nuevaEspecificacion.descripcion,
      estado: true
    }]);

    setNuevaEspecificacion({ nombre: '', descripcion: '' });
  };

  const handleEliminarEspecificacion = (id: number) => {
    setEspecificaciones(prev => prev.filter(esp => esp.id !== id));
  };

  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenes(prev => [...prev, {
          id: Date.now() + Math.random(),
          imagen: reader.result,
          es_principal: prev.length === 0,
          estado: true,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEliminarImagen = (id: number) => {
    setImagenes(prev => prev.filter(img => img.id !== id));
  };

  const handleSetImagenPrincipal = (id: number) => {
    setImagenes(prev => prev.map(img => ({ 
      ...img, 
      es_principal: img.id === id 
    })));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.precio || parseFloat(formData.precio as string) <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (!formData.categoria_id) newErrors.categoria_id = 'Seleccione una categoría';
    if (!formData.marca_id) newErrors.marca_id = 'Seleccione una marca';
    if (imagenes.length === 0) newErrors.imagenes = 'Agregue al menos una imagen';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const productoData = { ...formData, especificaciones, imagenes };
      console.log('Datos del producto:', productoData);
      alert(isEditMode ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese la descripción del producto"
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.descripcion}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.precio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.precio && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.precio}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.categoria_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {errors.categoria_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.categoria_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <select
                name="marca_id"
                value={formData.marca_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.marca_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione una marca</option>
                {marcas.map(marca => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
              {errors.marca_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.marca_id}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="estado"
                checked={formData.estado}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Producto activo
              </label>
            </div>
          </div>
        </div>

        {/* Especificaciones */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones</h3>
          
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de especificación
                </label>
                <input
                  type="text"
                  value={nuevaEspecificacion.nombre}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => 
                    setNuevaEspecificacion(prev => ({ ...prev, nombre: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Procesador, RAM, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={nuevaEspecificacion.descripcion}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => 
                    setNuevaEspecificacion(prev => ({ ...prev, descripcion: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Intel Core i7, 16GB, etc."
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAgregarEspecificacion}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Especificación
            </button>
          </div>

          {especificaciones.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Especificaciones agregadas:</h4>
              {especificaciones.map(espec => (
                <div key={espec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium text-gray-900">{espec.nombre}:</span>
                    <span className="ml-2 text-gray-600">{espec.descripcion}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminarEspecificacion(espec.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Imágenes */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Imágenes del Producto</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subir imágenes *
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                Seleccionar archivos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-gray-500">Formatos: JPG, PNG, WEBP</span>
            </div>
            {errors.imagenes && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.imagenes}
              </p>
            )}
          </div>

          {imagenes.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagenes.map(imagen => (
                <div key={imagen.id} className="relative group border rounded-lg overflow-hidden">
                  <img
                    src={typeof imagen.imagen === 'string' ? imagen.imagen : ''}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      {!imagen.es_principal && (
                        <button
                          type="button"
                          onClick={() => handleSetImagenPrincipal(imagen.id)}
                          className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition-colors"
                          title="Establecer como principal"
                        >
                          <Image className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEliminarImagen(imagen.id)}
                        className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition-colors"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {imagen.es_principal && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Producto' : 'Crear Producto')}
          </button>
        </div>
      </form>
    </div>
  );
}

// Ejemplo de uso en la página
export default function EjemploUso() {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const productoEjemplo: Producto = {
    id: 1,
    descripcion: 'Laptop Dell Inspiron 15',
    precio: 850.0,
    categoria: { id: 1, nombre: 'Laptops' },
    marca: { id: 1, nombre: 'Dell' },
    estado: true,
    imagenes: [
      { id: 1, imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', es_principal: true }
    ],
    especificaciones: [
      { id: 1, nombre: 'Procesador', descripcion: 'Intel Core i7 11th Gen' },
      { id: 2, nombre: 'RAM', descripcion: '16GB DDR4' }
    ]
  };

  return (
    <div className="p-8 space-y-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold">Ejemplo de Formularios de Producto</h1>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Crear Nuevo Producto
        </button>
        <button 
          onClick={() => setShowEditModal(true)} 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Editar Producto (Ejemplo)
        </button>
      </div>

      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        title="Crear Nuevo Producto" 
        size="lg"
      >
        <ProductoForm
          onSuccess={() => {
            setShowCreateModal(false);
            alert('Producto creado exitosamente');
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Editar Producto" 
        size="lg"
      >
        <ProductoForm
          producto={productoEjemplo}
          onSuccess={() => {
            setShowEditModal(false);
            alert('Producto actualizado exitosamente');
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
}
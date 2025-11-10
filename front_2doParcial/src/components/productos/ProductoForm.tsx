import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Plus, Trash2, Upload, Image, Save, AlertCircle } from 'lucide-react';
import { crearProducto, actualizarProducto } from '../../services/productos.service';
import { crearEspecificacion } from '../../services/especificaciones.service';
import { crearImagenProducto, eliminarImagenProducto, marcarImagenPrincipal } from '../../services/imagenesProductos.service';

// Interfaces
interface Categoria {
  id: number;
  descripcion: string;
  estado?: boolean;
}

interface Marca {
  id: number;
  nombre: string;
  estado?: boolean;
}

interface Especificacion {
  id?: number;
  nombre: string;
  descripcion: string;
  producto?: number;
  estado?: boolean;
}

interface Imagen {
  id?: number;
  imagen: string | ArrayBuffer | null;
  imagen_url?: string;
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

interface ProductoFormProps {
  producto?: Producto | null;
  categorias: Categoria[];
  marcas: Marca[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductoForm: React.FC<ProductoFormProps> = ({ 
  producto = null, 
  categorias,
  marcas,
  onSuccess, 
  onCancel 
}) => {
  const isEditMode = producto !== null;

  // Estados del formulario
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '');
  const [precio, setPrecio] = useState<number | string>(producto?.precio || '');
  const [categoriaId, setCategoriaId] = useState<number | string>(producto?.categoria?.id || '');
  const [marcaId, setMarcaId] = useState<number | string>(producto?.marca?.id || '');
  const [estado, setEstado] = useState(producto?.estado ?? true);
  const [especificaciones, setEspecificaciones] = useState<Especificacion[]>(
    producto?.especificaciones || []
  );
  const [imagenes, setImagenes] = useState<Imagen[]>(producto?.imagenes || []);
  const [nuevaEspecNombre, setNuevaEspecNombre] = useState('');
  const [nuevaEspecDescripcion, setNuevaEspecDescripcion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [subiendoImagenes, setSubiendoImagenes] = useState(false);

  // Handlers
  const handleAgregarEspecificacion = () => {
    if (!nuevaEspecNombre.trim() || !nuevaEspecDescripcion.trim()) {
      alert('Complete todos los campos de la especificación');
      return;
    }

    setEspecificaciones(prev => [...prev, {
      id: Date.now(), // ID temporal para UI
      nombre: nuevaEspecNombre,
      descripcion: nuevaEspecDescripcion,
      estado: true
    }]);

    setNuevaEspecNombre('');
    setNuevaEspecDescripcion('');
  };

  const handleEliminarEspecificacion = (id: number) => {
    setEspecificaciones(prev => prev.filter(esp => esp.id !== id));
  };

  const handleImagenChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach(file => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, seleccione solo archivos de imagen');
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenes(prev => [...prev, {
          id: Date.now() + Math.random(), // ID temporal para UI
          imagen: reader.result,
          es_principal: prev.length === 0,
          estado: true,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleEliminarImagen = async (id: number) => {
    // Si la imagen ya está en el servidor (tiene ID numérico y no temporal)
    const imagen = imagenes.find(img => img.id === id);
    if (imagen && typeof imagen.id === 'number' && imagen.id < 1000000) { // IDs reales son menores
      if (window.confirm('¿Estás seguro de eliminar esta imagen?')) {
        try {
          await eliminarImagenProducto(imagen.id);
          setImagenes(prev => prev.filter(img => img.id !== id));
        } catch (error) {
          console.error('Error eliminando imagen:', error);
          alert('Error al eliminar la imagen');
        }
      }
    } else {
      // Si es una imagen nueva (temporal)
      setImagenes(prev => prev.filter(img => img.id !== id));
    }
  };

  const handleSetImagenPrincipal = async (id: number) => {
    const imagen = imagenes.find(img => img.id === id);
    
    // Si la imagen ya está en el servidor
    if (imagen && typeof imagen.id === 'number' && imagen.id < 1000000) {
      try {
        await marcarImagenPrincipal(imagen.id);
        setImagenes(prev => prev.map(img => ({ 
          ...img, 
          es_principal: img.id === id 
        })));
      } catch (error) {
        console.error('Error marcando imagen como principal:', error);
        alert('Error al marcar la imagen como principal');
      }
    } else {
      // Si es una imagen nueva
      setImagenes(prev => prev.map(img => ({ 
        ...img, 
        es_principal: img.id === id 
      })));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!precio || parseFloat(precio as string) <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (!categoriaId) newErrors.categoria_id = 'Seleccione una categoría';
    if (!marcaId) newErrors.marca_id = 'Seleccione una marca';
    if (imagenes.length === 0 && !isEditMode) newErrors.imagenes = 'Agregue al menos una imagen';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const subirImagenes = async (productoId: number): Promise<void> => {
    setSubiendoImagenes(true);
    
    const imagenesParaSubir = imagenes.filter(img => img.file);
    
    console.log(`Subiendo ${imagenesParaSubir.length} imágenes para producto ${productoId}`);
    
    for (const [index, imagen] of imagenesParaSubir.entries()) {
      if (imagen.file) {
        try {
          console.log(`Subiendo imagen ${index + 1}/${imagenesParaSubir.length}`);
          
          const formData = new FormData();
          formData.append('imagen', imagen.file);
          formData.append('producto_id', productoId.toString());
          formData.append('es_principal', imagen.es_principal.toString());

          console.log('FormData contents:');
          for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
          }

          const imagenSubida = await crearImagenProducto(formData);
          console.log('Imagen subida exitosamente:', imagenSubida);
          
        } catch (error: any) {
          console.error('Error detallado subiendo imagen:', error);
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
          
          let errorMessage = 'Error al subir la imagen';
          if (error.response?.data) {
            if (typeof error.response.data === 'object') {
              errorMessage = error.response.data.message || JSON.stringify(error.response.data);
            } else {
              errorMessage = error.response.data;
            }
          }
          
          throw new Error(`Error al subir la imagen: ${errorMessage}`);
        }
      }
    }
    
    setSubiendoImagenes(false);
  };

  const guardarEspecificaciones = async (productoId: number): Promise<void> => {
    // Solo guardar especificaciones nuevas (las que tienen ID temporal > 1000000)
    const especificacionesNuevas = especificaciones.filter(esp => 
      !esp.id || esp.id > 1000000
    );
    
    console.log('Especificaciones a guardar:', especificacionesNuevas);
    
    for (const espec of especificacionesNuevas) {
      try {
        await crearEspecificacion({
          nombre: espec.nombre,
          descripcion: espec.descripcion,
          producto_id: productoId
        });
        console.log('Especificación guardada:', espec.nombre);
      } catch (error: any) {
        console.error('Error guardando especificación:', error);
        console.error('Detalles del error:', error.response?.data);
        throw new Error(`Error al guardar la especificación "${espec.nombre}": ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      console.log('Iniciando guardado de producto...');
      
      const productoData = {
        descripcion: descripcion.trim(),
        precio: parseFloat(precio as string),
        categoria_id: parseInt(categoriaId as string),
        marca_id: parseInt(marcaId as string),
        estado
      };

      console.log('Datos del producto:', productoData);

      let productoId: number;

      if (isEditMode && producto?.id) {
        // Modo edición - solo actualizar datos básicos
        console.log('Editando producto existente:', producto.id);
        const productoActualizado = await actualizarProducto(producto.id, productoData);
        productoId = productoActualizado.id;
        console.log('Producto actualizado, ID:', productoId);
        
      } else {
        // Modo creación
        console.log('Creando nuevo producto...');
        const nuevoProducto = await crearProducto(productoData);
        productoId = nuevoProducto.id;
        console.log('Producto creado, ID:', productoId);
      }

      // Guardar especificaciones (solo las nuevas)
      if (especificaciones.length > 0) {
        console.log('Guardando especificaciones...');
        await guardarEspecificaciones(productoId);
      }
      
      // Subir imágenes (solo las nuevas)
      const tieneImagenesNuevas = imagenes.some(img => img.file);
      if (tieneImagenesNuevas) {
        console.log('Subiendo nuevas imágenes...');
        await subirImagenes(productoId);
      }

      console.log('Producto guardado exitosamente');
      onSuccess();
      
    } catch (error: any) {
      console.error('Error completo guardando producto:', error);
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'Error al guardar el producto';
      
      if (error.response?.data) {
        // Si el backend devuelve detalles del error
        if (typeof error.response.data === 'object') {
          const errorData = error.response.data;
          if (errorData.descripcion) {
            errorMessage = `Error en descripción: ${Array.isArray(errorData.descripcion) ? errorData.descripcion.join(', ') : errorData.descripcion}`;
          } else if (errorData.precio) {
            errorMessage = `Error en precio: ${Array.isArray(errorData.precio) ? errorData.precio.join(', ') : errorData.precio}`;
          } else if (errorData.categoria_id) {
            errorMessage = `Error en categoría: ${Array.isArray(errorData.categoria_id) ? errorData.categoria_id.join(', ') : errorData.categoria_id}`;
          } else if (errorData.marca_id) {
            errorMessage = `Error en marca: ${Array.isArray(errorData.marca_id) ? errorData.marca_id.join(', ') : errorData.marca_id}`;
          } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = 'Error de validación en el formulario';
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
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
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese la descripción del producto"
                disabled={loading}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.descripcion}
                </p>
              )}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.precio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.precio && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.precio}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.categoria_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Seleccione una categoría</option>
                {categorias
                  .filter(cat => cat.estado)
                  .map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.descripcion}
                    </option>
                  ))
                }
              </select>
              {errors.categoria_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.categoria_id}
                </p>
              )}
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <select
                value={marcaId}
                onChange={(e) => setMarcaId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.marca_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Seleccione una marca</option>
                {marcas
                  .filter(marca => marca.estado)
                  .map(marca => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))
                }
              </select>
              {errors.marca_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.marca_id}
                </p>
              )}
            </div>

            {/* Estado */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={estado}
                onChange={(e) => setEstado(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
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
                  value={nuevaEspecNombre}
                  onChange={(e) => setNuevaEspecNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Procesador, RAM, etc."
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={nuevaEspecDescripcion}
                  onChange={(e) => setNuevaEspecDescripcion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Intel Core i7, 16GB, etc."
                  disabled={loading}
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAgregarEspecificacion}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
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
                    {espec.id && espec.id > 1000000 && (
                      <span className="ml-2 text-xs text-blue-600">(nueva)</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEliminarEspecificacion(espec.id!)}
                    className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                    disabled={loading}
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
              Subir imágenes {!isEditMode && '*'}
            </label>
            <div className="flex items-center gap-4">
              <label className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-4 h-4" />
                Seleccionar archivos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagenChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <span className="text-sm text-gray-500">Formatos: JPG, PNG, WEBP (max 5MB)</span>
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
                    src={typeof imagen.imagen === 'string' ? imagen.imagen : (imagen.imagen_url || '')}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      {!imagen.es_principal && (
                        <button
                          type="button"
                          onClick={() => handleSetImagenPrincipal(imagen.id!)}
                          className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                          title="Establecer como principal"
                          disabled={loading}
                        >
                          <Image className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEliminarImagen(imagen.id!)}
                        className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        title="Eliminar imagen"
                        disabled={loading}
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
                  {imagen.file && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Nueva
                    </div>
                  )}
                  {(loading || subiendoImagenes) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(loading || subiendoImagenes) && imagenes.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                {subiendoImagenes ? 'Subiendo imágenes...' : 'Procesando...'}
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            disabled={loading || subiendoImagenes}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || subiendoImagenes}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading || subiendoImagenes ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {subiendoImagenes ? 'Subiendo imágenes...' : 'Guardando...'}
              </>
            ) : (
              isEditMode ? 'Actualizar Producto' : 'Crear Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
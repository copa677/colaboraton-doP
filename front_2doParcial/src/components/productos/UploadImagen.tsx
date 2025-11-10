import { useState, useRef } from 'react';
import { Upload, X, Star, Trash2 } from 'lucide-react';
import { 
  crearImagenProducto, 
  eliminarImagenProducto, 
  marcarImagenPrincipal,
  type ImagenProducto
}  from '../../services/imagenesProductos.service';
import toast from 'react-hot-toast';

interface UploadImagenProps {
  productoId: number;
  imagenes: ImagenProducto[];
  onImagenesChange: () => void;
}

export default function UploadImagen({ productoId, imagenes, onImagenesChange }: UploadImagenProps) {
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubirImagen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setSubiendo(true);
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('producto_id', productoId.toString());
    
    // Si es la primera imagen, marcar como principal
    if (imagenes.length === 0) {
      formData.append('es_principal', 'true');
    }

    try {
      await crearImagenProducto(formData);
      toast.success('Imagen subida correctamente');
      onImagenesChange();
      
      // Resetear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      toast.error('Error al subir imagen: ' + (error.message || 'Error desconocido'));
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminarImagen = async (imagenId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      return;
    }

    try {
      await eliminarImagenProducto(imagenId);
      toast.success('Imagen eliminada correctamente');
      onImagenesChange();
    } catch (error: any) {
      console.error('Error eliminando imagen:', error);
      toast.error('Error al eliminar imagen: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleMarcarPrincipal = async (imagenId: number) => {
    try {
      await marcarImagenPrincipal(imagenId);
      toast.success('Imagen marcada como principal');
      onImagenesChange();
    } catch (error: any) {
      console.error('Error marcando imagen como principal:', error);
      toast.error('Error al marcar imagen como principal: ' + (error.message || 'Error desconocido'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Input para subir archivo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleSubirImagen}
          disabled={subiendo}
          className="hidden"
          id="imagen-upload"
        />
        <label
          htmlFor="imagen-upload"
          className="cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-600">
            {subiendo ? 'Subiendo imagen...' : 'Haz clic para subir una imagen'}
          </span>
          <span className="text-xs text-gray-500">
            PNG, JPG, JPEG hasta 5MB
          </span>
        </label>
      </div>

      {/* Galería de imágenes */}
      {imagenes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Imágenes del producto ({imagenes.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagenes.map((imagen) => (
              <div
                key={imagen.id}
                className={`relative group border-2 rounded-lg overflow-hidden ${
                  imagen.es_principal ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={imagen.imagen_url}
                  alt={`Imagen de ${imagen.producto_descripcion}`}
                  className="w-full h-24 object-cover"
                />
                
                {/* Overlay de acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!imagen.es_principal && (
                    <button
                      onClick={() => handleMarcarPrincipal(imagen.id!)}
                      className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      title="Marcar como principal"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEliminarImagen(imagen.id!)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Badge de imagen principal */}
                {imagen.es_principal && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export interface ImagenProducto {
  id?: number;
  imagen: string;  // Cloudinary public_id
  imagen_url: string;  // URL completa de la imagen
  producto: number;
  producto_descripcion?: string;
  es_principal: boolean;
  estado?: boolean;
  fecha_creacion?: string;
}

// 📋 Obtener imágenes por producto
export async function getImagenesByProducto(productoId: number): Promise<ImagenProducto[]> {
  const response = await axios.get(`${API}/imagenes-producto/producto/${productoId}/`);
  return response.data;
}

// 📥 Subir nueva imagen
export async function crearImagenProducto(formData: FormData): Promise<ImagenProducto> {
  const response = await axios.post(`${API}/imagenes-producto/crear/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

// ✏️ Actualizar imagen
export async function actualizarImagenProducto(id: number, data: Partial<ImagenProducto>): Promise<ImagenProducto> {
  const response = await axios.put(`${API}/imagenes-producto/${id}/actualizar/`, data);
  return response.data;
}

// 🗑️ Eliminar imagen (eliminación lógica)
export async function eliminarImagenProducto(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/imagenes-producto/${id}/eliminar/`);
  return response.data;
}

// 🔄 Restaurar imagen
export async function restaurarImagenProducto(id: number): Promise<{message: string, imagen: ImagenProducto}> {
  const response = await axios.post(`${API}/imagenes-producto/${id}/restaurar/`);
  return response.data;
}

// ⭐ Marcar imagen como principal
export async function marcarImagenPrincipal(id: number): Promise<{message: string, imagen: ImagenProducto}> {
  const response = await axios.post(`${API}/imagenes-producto/${id}/marcar-principal/`);
  return response.data;
}
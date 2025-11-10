import axios from "axios"

const API = import.meta.env.VITE_API_BASE_URL;

export interface Permiso {
  id?: number
  usuario: number
  usuario_username: string
  vista: string
  crear: boolean
  editar: boolean
  eliminar: boolean
  ver: boolean
  estado?: boolean
}

export interface CreatePermisoData {
  usuario: number
  vista: string
  crear: boolean
  editar: boolean
  eliminar: boolean
  ver: boolean
}

export interface UpdatePermisoData {
  vista?: string
  crear?: boolean
  editar?: boolean
  eliminar?: boolean
  ver?: boolean
}

// 📋 Obtener todos los permisos
export async function getAllPermisos(): Promise<Permiso[]> {
  const response = await axios.get(`${API}/permisos/listar/`)
  return response.data
}

// 📋 Obtener permisos por usuario
export async function getPermisosByUsuario(usuarioId: number): Promise<Permiso[]> {
  const response = await axios.get(`${API}/permisos/usuario/${usuarioId}/`)
  return response.data
}

// 🔍 Obtener un permiso por ID
export async function getPermisoById(id: number): Promise<Permiso> {
  const response = await axios.get(`${API}/permisos/${id}/`)
  return response.data
}

// 📥 Registrar un nuevo permiso
export async function crearPermiso(data: CreatePermisoData): Promise<Permiso> {
  const response = await axios.post(`${API}/permisos/crear/`, data)
  return response.data
}

// ✏️ Actualizar un permiso
export async function actualizarPermiso(id: number, data: UpdatePermisoData): Promise<Permiso> {
  const response = await axios.put(`${API}/permisos/${id}/actualizar/`, data)
  return response.data
}

// 🗑️ Eliminar un permiso
export async function eliminarPermiso(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/permisos/${id}/eliminar/`)
  return response.data
}
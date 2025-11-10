import axios from "axios"

const API = import.meta.env.VITE_API_BASE_URL;

export interface Usuario {
  id?: number  // opcional al crear
  username: string
  correo: string
  password?: string  // opcional en algunas operaciones
  tipo_usuario: string
  estado?: boolean  // opcional, lo maneja el backend
}

export interface LoginData {
  username: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
  user: {
    id: number
    username: string
    correo: string
    tipo_usuario: string
  }
}

// 🔐 Login de usuario
export async function loginUsuario(data: LoginData): Promise<LoginResponse> {
  const response = await axios.post(`${API}/usuarios/login/`, data)
  return response.data
}

// 📋 Obtener todos los usuarios activos
export async function getAllUsuarios(): Promise<Usuario[]> {
  const response = await axios.get(`${API}/usuarios/usuarios/`)
  return response.data
}

// 📋 Obtener todos los usuarios (activos e inactivos)
export async function getAllUsuariosCompleto(): Promise<Usuario[]> {
  const response = await axios.get(`${API}/usuarios/usuarios/todos/`)
  return response.data
}

// 📥 Registrar un nuevo usuario
export async function registrarUsuario(data: Omit<Usuario, "id" | "estado">): Promise<Usuario> {
  const response = await axios.post(`${API}/usuarios/usuarios/crear/`, data)
  return response.data
}

// 🔍 Obtener un usuario por ID
export async function getUsuarioById(id: number): Promise<Usuario> {
  const response = await axios.get(`${API}/usuarios/usuarios/${id}/`)
  return response.data
}

// ✏️ Actualizar un usuario
export async function actualizarUsuario(id: number, data: Partial<Omit<Usuario, "id" | "estado">>): Promise<Usuario> {
  const response = await axios.put(`${API}/usuarios/usuarios/${id}/editar/`, data)
  return response.data
}

// 🗑️ Eliminar un usuario (eliminación lógica)
export async function eliminarUsuario(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/usuarios/usuarios/${id}/eliminar/`)
  return response.data
}

// 🔄 Restaurar un usuario eliminado
export async function restaurarUsuario(id: number): Promise<{message: string, usuario: Usuario}> {
  const response = await axios.post(`${API}/usuarios/usuarios/${id}/restaurar/`)
  return response.data
}
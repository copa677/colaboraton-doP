import axios from "axios"

const API = import.meta.env.VITE_API_BASE_URL

export interface Cliente {
  id?: number
  usuario: number
  nombre_completo: string
  telefono: string
  direccion: string
  ci: string
  fecha_registro?: string
  estado?: boolean
}

export interface CreateClienteData {
  username: string
  correo: string
  password: string
  tipo_usuario?: string
  nombre_completo: string
  telefono: string
  direccion: string
  ci: string
}

export interface UpdateClienteData {
  nombre_completo?: string
  telefono?: string
  direccion?: string
  ci?: string
}

// 📋 Obtener todos los clientes activos
export async function getAllClientes(): Promise<Cliente[]> {
  const response = await axios.get(`${API}/clientes/listar/`)
  return response.data
}

// 📋 Obtener todos los clientes (activos e inactivos)
export async function getAllClientesCompleto(): Promise<Cliente[]> {
  const response = await axios.get(`${API}/clientes/todos/`)
  return response.data
}

// 📥 Registrar un nuevo cliente con usuario
export async function registrarCliente(data: CreateClienteData): Promise<Cliente> {
  const response = await axios.post(`${API}/clientes/crear/`, data)
  return response.data
}

// 🔍 Obtener un cliente por ID
export async function getClienteById(id: number): Promise<Cliente> {
  const response = await axios.get(`${API}/clientes/${id}/`)
  return response.data
}

// ✏️ Actualizar un cliente
export async function actualizarCliente(id: number, data: UpdateClienteData): Promise<Cliente> {
  const response = await axios.put(`${API}/clientes/${id}/actualizar/`, data)
  return response.data
}

// 🗑️ Eliminar un cliente (eliminación lógica)
export async function eliminarCliente(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/clientes/${id}/eliminar/`)
  return response.data
}

// 🔄 Restaurar un cliente eliminado
export async function restaurarCliente(id: number): Promise<{message: string, cliente: Cliente}> {
  const response = await axios.post(`${API}/clientes/${id}/restaurar/`)
  return response.data
}

// 🔍 Buscar cliente por CI
export async function buscarClientePorCI(ci: string): Promise<Cliente> {
  const response = await axios.get(`${API}/clientes/buscar/ci/?ci=${ci}`)
  return response.data
}

// 🔍 Buscar cliente por teléfono
export async function buscarClientePorTelefono(telefono: string): Promise<Cliente> {
  const response = await axios.get(`${API}/clientes/buscar/telefono/?telefono=${telefono}`)
  return response.data
}
import axios from "axios"

const API = import.meta.env.VITE_API_BASE_URL

export interface Empleado {
  id?: number
  usuario: number
  nombre_completo: string
  telefono: string
  ci: string
  rol: string
  direccion: string
  fecha_contratacion?: string
  salario?: number
  estado?: boolean
}

export interface CreateEmpleadoData {
  // Datos de usuario
  username: string
  correo: string
  password: string
  tipo_usuario?: string
  
  // Datos de empleado
  nombre_completo: string
  telefono: string
  ci: string
  rol: string
  direccion: string
  salario?: number
}

export interface UpdateEmpleadoData {
  nombre_completo?: string
  telefono?: string
  ci?: string
  rol?: string
  direccion?: string
  salario?: number
}

export interface CreateEmpleadoSimpleData {
  usuario: number
  nombre_completo: string
  telefono: string
  ci: string
  rol: string
  direccion: string
  salario?: number
}

// 📋 Obtener todos los empleados activos
export async function getAllEmpleados(): Promise<Empleado[]> {
  const response = await axios.get(`${API}/empleados/empleados/`)
  return response.data
}

// 📋 Obtener todos los empleados (activos e inactivos)
export async function getAllEmpleadosCompleto(): Promise<Empleado[]> {
  const response = await axios.get(`${API}/empleados/empleados/todos/`)
  return response.data
}

// 📥 Registrar un nuevo empleado con usuario
export async function registrarEmpleado(data: CreateEmpleadoData): Promise<Empleado> {
  const response = await axios.post(`${API}/empleados/empleados/crear/`, data)
  return response.data
}

// 📥 Registrar un nuevo empleado sin usuario (usuario existente)
export async function registrarEmpleadoSimple(data: CreateEmpleadoSimpleData): Promise<Empleado> {
  const response = await axios.post(`${API}/empleados/empleados/crear-simple/`, data)
  return response.data
}

// 🔍 Obtener un empleado por ID
export async function getEmpleadoById(id: number): Promise<Empleado> {
  const response = await axios.get(`${API}/empleados/empleados/${id}/`)
  return response.data
}

// ✏️ Actualizar un empleado
export async function actualizarEmpleado(id: number, data: UpdateEmpleadoData): Promise<Empleado> {
  const response = await axios.put(`${API}/empleados/empleados/${id}/actualizar/`, data)
  return response.data
}

// 🗑️ Eliminar un empleado (eliminación lógica)
export async function eliminarEmpleado(id: number): Promise<{message: string}> {
  const response = await axios.delete(`${API}/empleados/empleados/${id}/eliminar/`)
  return response.data
}

// 🔄 Restaurar un empleado eliminado
export async function restaurarEmpleado(id: number): Promise<{message: string, empleado: Empleado}> {
  const response = await axios.post(`${API}/empleados/empleados/${id}/restaurar/`)
  return response.data
}

// 🔍 Buscar empleado por CI
export async function buscarEmpleadoPorCI(ci: string): Promise<Empleado> {
  const response = await axios.get(`${API}/empleados/empleados/buscar/?ci=${ci}`)
  return response.data
}

// 👥 Listar empleados por rol
export async function listarEmpleadosPorRol(rol: string): Promise<Empleado[]> {
  const response = await axios.get(`${API}/empleados/empleados/rol/${rol}/`)
  return response.data
}
import { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, Phone, Mail, MapPin, Calendar, Edit, Trash2, RefreshCw } from 'lucide-react';
import { getAllEmpleados, eliminarEmpleado, restaurarEmpleado } from '../../services/empleados.service';
import type { Empleado } from '../../services/empleados.service';
import { EmpleadoModal } from '../../components/empleado/EmpleadoModal';
import toast from 'react-hot-toast';

export default function EmpleadosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Estados para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [empleadoEditando, setEmpleadoEditando] = useState<Empleado | null>(null);

  // Cargar empleados al montar el componente
  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    setLoading(true);
    try {
      const data = await getAllEmpleados();
      setEmpleados(data);
    } catch (error: any) {
      console.error('Error cargando empleados:', error);
      toast.error('Error al cargar los empleados: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarEmpleado = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar al empleado "${nombre}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await eliminarEmpleado(id);
      toast.success(`Empleado "${nombre}" eliminado correctamente`);
      await cargarEmpleados();
    } catch (error: any) {
      console.error('Error eliminando empleado:', error);
      toast.error('Error al eliminar empleado: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestaurarEmpleado = async (id: number, nombre: string) => {
    setActionLoading(id);
    try {
      await restaurarEmpleado(id);
      toast.success(`Empleado "${nombre}" restaurado correctamente`);
      await cargarEmpleados();
    } catch (error: any) {
      console.error('Error restaurando empleado:', error);
      toast.error('Error al restaurar empleado: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handlers para modales
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEmpleadoEditando(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (empleado: Empleado) => {
    setModalMode('edit');
    setEmpleadoEditando(empleado);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEmpleadoEditando(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    cargarEmpleados();
  };

  // Filtrar empleados basado en búsqueda y filtros
  const empleadosFiltrados = empleados.filter(empleado => {
    const coincideBusqueda = 
      empleado.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.ci.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.telefono.toLowerCase().includes(searchTerm.toLowerCase());
    
    const coincideRol = filterRol === 'todos' || empleado.rol === filterRol;
    const coincideEstado = filterEstado === 'todos' || 
      (filterEstado === 'activo' && empleado.estado) ||
      (filterEstado === 'inactivo' && !empleado.estado);

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  // Calcular estadísticas
  const totalEmpleados = empleados.length;
  const empleadosActivos = empleados.filter(e => e.estado).length;
  const empleadosInactivos = empleados.filter(e => !e.estado).length;
  const rolesUnicos = [...new Set(empleados.map(e => e.rol))];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Datos simulados para el email (en un proyecto real vendrían del backend)
  const getEmailSimulado = (empleado: Empleado) => {
    const username = empleado.nombre_completo.toLowerCase().split(' ').join('.');
    return `${username}@techhome.com`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Empleados</h1>
            <p className="text-gray-600 mt-1">Administra el personal de tu empresa</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando empleados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Empleados</h1>
            <p className="text-gray-600 mt-1">Administra el personal de tu empresa</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={cargarEmpleados}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Nuevo Empleado
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Empleados</h3>
              <Briefcase className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalEmpleados}</p>
            <p className="text-xs text-gray-500 mt-2">Registrados en el sistema</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Empleados Activos</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{empleadosActivos}</p>
            <p className="text-xs text-gray-500 mt-2">
              {totalEmpleados > 0 ? Math.round((empleadosActivos / totalEmpleados) * 100) : 0}% del total
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Empleados Inactivos</h3>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{empleadosInactivos}</p>
            <p className="text-xs text-gray-500 mt-2">
              {totalEmpleados > 0 ? Math.round((empleadosInactivos / totalEmpleados) * 100) : 0}% del total
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Roles Diferentes</h3>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{rolesUnicos.length}</p>
            <p className="text-xs text-gray-500 mt-2">Funciones en la empresa</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, CI o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select 
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los roles</option>
              {rolesUnicos.map(rol => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
            <select 
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Empleados Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empleadosFiltrados.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {empleados.length === 0 ? 'No hay empleados registrados' : 'No se encontraron empleados con los filtros aplicados'}
              </p>
            </div>
          ) : (
            empleadosFiltrados.map((empleado) => (
              <div key={empleado.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                      {getInitials(empleado.nombre_completo)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{empleado.nombre_completo}</h3>
                      <p className="text-blue-100 text-sm">{empleado.rol}</p>
                      <div className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                        empleado.estado ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {empleado.estado ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm capitalize">{empleado.rol}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{empleado.telefono}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{getEmailSimulado(empleado)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{empleado.direccion}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">CI: {empleado.ci}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Salario</span>
                      <span className="font-bold text-gray-800">
                        Bs. {empleado.salario ? empleado.salario.toLocaleString() : 'No definido'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Ingreso</span>
                      <span className="text-sm text-gray-600">
                        {empleado.fecha_contratacion || 'No registrada'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <button 
                      onClick={() => handleOpenEditModal(empleado)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    {empleado.estado ? (
                      <button 
                        onClick={() => handleEliminarEmpleado(empleado.id!, empleado.nombre_completo)}
                        disabled={actionLoading === empleado.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading === empleado.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Eliminar
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRestaurarEmpleado(empleado.id!, empleado.nombre_completo)}
                        disabled={actionLoading === empleado.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading === empleado.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          'Restaurar'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para Empleados */}
      <EmpleadoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        empleado={modalMode === 'edit' ? empleadoEditando : undefined}
        onSuccess={handleSuccess}
      />
    </>
  );
}
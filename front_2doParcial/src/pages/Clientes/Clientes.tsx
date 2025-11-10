import { useState, useEffect } from 'react';
import { UserCheck, Search, Plus, Star, ShoppingBag, Edit, Trash2, Phone, MapPin, RefreshCw } from 'lucide-react';
import { getAllClientes, eliminarCliente, restaurarCliente } from '../../services/clientes.service';
import type { Cliente } from '../../services/clientes.service';
import { ClienteModal } from '../../components/clientes/ClienteModal';
import toast from 'react-hot-toast';

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Estados para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const data = await getAllClientes();
      setClientes(data);
    } catch (error: any) {
      console.error('Error cargando clientes:', error);
      toast.error('Error al cargar los clientes: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCliente = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar al cliente "${nombre}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await eliminarCliente(id);
      toast.success(`Cliente "${nombre}" eliminado correctamente`);
      await cargarClientes();
    } catch (error: any) {
      console.error('Error eliminando cliente:', error);
      toast.error('Error al eliminar cliente: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestaurarCliente = async (id: number, nombre: string) => {
    setActionLoading(id);
    try {
      await restaurarCliente(id);
      toast.success(`Cliente "${nombre}" restaurado correctamente`);
      await cargarClientes();
    } catch (error: any) {
      console.error('Error restaurando cliente:', error);
      toast.error('Error al restaurar cliente: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handlers para modales
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setClienteEditando(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cliente: Cliente) => {
    setModalMode('edit');
    setClienteEditando(cliente);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setClienteEditando(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    cargarClientes();
  };

  // Filtrar clientes basado en búsqueda y filtros
  const clientesFiltrados = clientes.filter(cliente => {
    const coincideBusqueda = 
      cliente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.ci.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono.toLowerCase().includes(searchTerm.toLowerCase());
    
    const coincideEstado = filterEstado === 'todos' || 
      (filterEstado === 'activo' && cliente.estado) ||
      (filterEstado === 'inactivo' && !cliente.estado);

    return coincideBusqueda && coincideEstado;
  });

  // Calcular estadísticas
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter(c => c.estado).length;
  const clientesInactivos = clientes.filter(c => !c.estado).length;

  const getCategoriaCliente = (compras: number) => {
    if (compras >= 10) return 'VIP';
    if (compras >= 5) return 'Premium';
    return 'Regular';
  };

  const getBadgeColor = (categoria: string) => {
    switch (categoria) {
      case 'VIP': return 'bg-yellow-100 text-yellow-700';
      case 'Premium': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Datos simulados para las tarjetas
  const getDatosSimulados = (cliente: Cliente) => {
    const compras = (cliente.id || 1) * 2 + 1;
    const totalGastado = compras * 1500;
    const ciudades = ['Santa Cruz', 'La Paz', 'Cochabamba', 'Sucre', 'Tarija'];
    const ciudad = ciudades[(cliente.id || 0) % ciudades.length];
    
    return {
      compras,
      totalGastado,
      ciudad,
      categoria: getCategoriaCliente(compras),
      ultimaCompra: '2025-10-' + (20 + (cliente.id || 0))
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
            <p className="text-gray-600 mt-1">Administra tu base de clientes</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando clientes...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
            <p className="text-gray-600 mt-1">Administra tu base de clientes</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={cargarClientes}
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
              Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Clientes</h3>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalClientes}</p>
            <p className="text-xs text-gray-500 mt-2">Registrados en el sistema</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Clientes Activos</h3>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{clientesActivos}</p>
            <p className="text-xs text-gray-500 mt-2">
              {totalClientes > 0 ? Math.round((clientesActivos / totalClientes) * 100) : 0}% del total
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Clientes Inactivos</h3>
              <UserCheck className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{clientesInactivos}</p>
            <p className="text-xs text-gray-500 mt-2">
              {totalClientes > 0 ? Math.round((clientesInactivos / totalClientes) * 100) : 0}% del total
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">VIP & Premium</h3>
              <ShoppingBag className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {clientes.filter(c => getCategoriaCliente(getDatosSimulados(c).compras) !== 'Regular').length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Clientes destacados</p>
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

        {/* Clientes Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clientesFiltrados.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {clientes.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes con los filtros aplicados'}
              </p>
            </div>
          ) : (
            clientesFiltrados.map((cliente) => {
              const datosSimulados = getDatosSimulados(cliente);
              
              return (
                <div key={cliente.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {getInitials(cliente.nombre_completo)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{cliente.nombre_completo}</h3>
                          <p className="text-sm text-gray-600">CI: {cliente.ci}</p>
                          <div className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                            cliente.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {cliente.estado ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(datosSimulados.categoria)}`}>
                        {datosSimulados.categoria}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{datosSimulados.compras}</p>
                        <p className="text-xs text-gray-600">Compras</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">Bs. {datosSimulados.totalGastado.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Gastado</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">{datosSimulados.ultimaCompra}</p>
                        <p className="text-xs text-gray-500">Última compra</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{cliente.telefono}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{datosSimulados.ciudad}</span>
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="text-sm text-gray-600 mb-4">
                      <p className="font-medium">Dirección:</p>
                      <p className="text-xs">{cliente.direccion}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t pt-3">
                      <div className="text-xs text-gray-500">
                        Registrado: {cliente.fecha_registro || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(cliente)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {cliente.estado ? (
                          <button 
                            onClick={() => handleEliminarCliente(cliente.id!, cliente.nombre_completo)}
                            disabled={actionLoading === cliente.id}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                          >
                            {actionLoading === cliente.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRestaurarCliente(cliente.id!, cliente.nombre_completo)}
                            disabled={actionLoading === cliente.id}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 disabled:opacity-50 text-xs font-medium"
                          >
                            {actionLoading === cliente.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              'Restaurar'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal unificado para Clientes */}
      <ClienteModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        cliente={modalMode === 'edit' ? clienteEditando : undefined}
        onSuccess={handleSuccess}
      />
    </>
  );
}
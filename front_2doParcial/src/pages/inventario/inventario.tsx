import { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit, Trash2, MoreVertical, RefreshCw, MapPin, Calendar } from 'lucide-react';
import { InventarioModal } from '../../components/inventario/inventarioModal'; 
import { 
  getAllInventarios, 
  eliminarInventario, 
  restaurarInventario,
  type Inventario 
} from '../../services/inventario.service';
import { listarProductos, type Producto } from '../../services/productos.service';
import toast from 'react-hot-toast';

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterStock, setFilterStock] = useState('todos');
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [inventarioEditando, setInventarioEditando] = useState<Inventario | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [inventariosData, productosData] = await Promise.all([
        getAllInventarios(),
        listarProductos()
      ]);
      
      setInventarios(inventariosData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos del inventario');
    } finally {
      setLoading(false);
    }
  };

  // Obtener información del producto por ID
  const getProductoInfo = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    return producto || { 
      id: productoId, 
      descripcion: 'Producto no encontrado', 
      nombre_categoria: 'N/A',
      nombre_marca: 'N/A'
    };
  };

  const handleEliminarInventario = async (id: number, productoDesc: string) => {
    if (!window.confirm(`¿Estás seguro de desactivar el inventario de "${productoDesc}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await eliminarInventario(id);
      toast.success('Inventario desactivado correctamente');
      cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error al eliminar inventario:', error);
      toast.error('Error al desactivar el inventario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestaurarInventario = async (id: number) => {
    setActionLoading(id);
    try {
      await restaurarInventario(id);
      toast.success('Inventario restaurado correctamente');
      cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error al restaurar inventario:', error);
      toast.error('Error al restaurar el inventario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenCreateModal = () => setShowCreateModal(true);
  
  const handleOpenEditModal = (inventario: Inventario) => {
    setInventarioEditando(inventario);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setInventarioEditando(null);
  };

  const handleSuccess = () => {
    handleCloseModals();
    cargarDatos();
  };

  // Filtrar inventarios
  const inventariosFiltrados = inventarios.filter(inv => {
    const productoInfo = getProductoInfo(inv.producto);
    const coincideBusqueda = 
      productoInfo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const coincideEstado = filterEstado === 'todos' || 
      (filterEstado === 'activo' && inv.estado) ||
      (filterEstado === 'inactivo' && !inv.estado);

    const coincideStock = filterStock === 'todos' ||
      (filterStock === 'disponible' && inv.cantidad > 10) ||
      (filterStock === 'bajo' && inv.cantidad > 0 && inv.cantidad <= 10) ||
      (filterStock === 'agotado' && inv.cantidad === 0);

    return coincideBusqueda && coincideEstado && coincideStock;
  });

  // Estadísticas
  const totalItems = inventarios.reduce((sum, inv) => sum + inv.cantidad, 0);
  const productosActivos = inventarios.filter(inv => inv.estado).length;
  const stockBajo = inventarios.filter(inv => inv.cantidad > 0 && inv.cantidad <= 10).length;
  const agotados = inventarios.filter(inv => inv.cantidad === 0).length;

  const getStockBadge = (cantidad: number) => {
    if (cantidad === 0) return { color: 'bg-red-100 text-red-700', text: 'Agotado' };
    if (cantidad <= 10) return { color: 'bg-yellow-100 text-yellow-700', text: 'Stock Bajo' };
    return { color: 'bg-green-100 text-green-700', text: 'Disponible' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando inventario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Inventario</h1>
            <p className="text-gray-600 mt-1">Administra el stock de productos</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={cargarDatos}
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
              Nuevo Inventario
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Items</h3>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalItems}</p>
            <p className="text-xs text-gray-500 mt-2">En todos los almacenes</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Productos Activos</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{productosActivos}</p>
            <p className="text-xs text-gray-500 mt-2">Con inventario activo</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Stock Bajo</h3>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stockBajo}</p>
            <p className="text-xs text-gray-500 mt-2">Requieren reabastecimiento</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Agotados</h3>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{agotados}</p>
            <p className="text-xs text-gray-500 mt-2">Sin stock disponible</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por producto o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select 
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los stocks</option>
              <option value="disponible">Disponible</option>
              <option value="bajo">Stock Bajo</option>
              <option value="agotado">Agotado</option>
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

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Producto</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Cantidad</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Ubicación</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado Stock</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Última Act.</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron inventarios con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  inventariosFiltrados.map((inv) => {
                    const productoInfo = getProductoInfo(inv.producto);
                    const stockBadge = getStockBadge(inv.cantidad);
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 block">{productoInfo.descripcion}</span>
                              <span className="text-xs text-gray-500">
                                {productoInfo.nombre_categoria} • {productoInfo.nombre_marca}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-2xl font-bold text-gray-800">{inv.cantidad}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {inv.ubicacion}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockBadge.color}`}>
                            {stockBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDate(inv.fecha_actualizacion)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleOpenEditModal(inv)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {inv.estado ? (
                              <button 
                                onClick={() => handleEliminarInventario(inv.id, productoInfo.descripcion)}
                                disabled={actionLoading === inv.id}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                              >
                                {actionLoading === inv.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRestaurarInventario(inv.id)}
                                disabled={actionLoading === inv.id}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 disabled:opacity-50"
                              >
                                {actionLoading === inv.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <span className="text-xs font-medium">Restaurar</span>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-md">
          <p className="text-sm text-gray-600">
            Mostrando {inventariosFiltrados.length} de {inventarios.length} inventarios
            {searchTerm && ` · Filtrado por: "${searchTerm}"`}
          </p>
        </div>
      </div>

      {/* Modal para Crear/Editar Inventario */}
      <InventarioModal
        isOpen={showCreateModal || showEditModal}
        onClose={handleCloseModals}
        mode={showCreateModal ? 'create' : 'edit'}
        inventario={inventarioEditando || undefined}
        onSuccess={handleSuccess}
      />
    </>
  );
}
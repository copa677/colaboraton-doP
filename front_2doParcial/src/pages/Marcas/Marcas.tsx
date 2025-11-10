import { useState, useEffect } from 'react';
import { 
  Tag, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Check,
  Award
} from 'lucide-react';
import { 
  getAllMarcas, 
  crearMarca, 
  actualizarMarca, 
  eliminarMarca,
  restaurarMarca,
  type Marca 
} from '../../services/marcas.service';
import toast from 'react-hot-toast';

export default function MarcasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Estados para modales y formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [marcaEditando, setMarcaEditando] = useState<Marca | null>(null);
  const [formData, setFormData] = useState({ nombre: '' });

  // Cargar marcas al montar el componente
  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    setLoading(true);
    try {
      const data = await getAllMarcas();
      setMarcas(data);
    } catch (error: any) {
      console.error('Error cargando marcas:', error);
      toast.error('Error al cargar las marcas: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCrearMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setActionLoading(-1); // ID especial para creación
    try {
      await crearMarca({ nombre: formData.nombre.trim() });
      toast.success('Marca creada correctamente');
      setFormData({ nombre: '' });
      setShowCreateModal(false);
      await cargarMarcas();
    } catch (error: any) {
      console.error('Error creando marca:', error);
      if (error.response?.data?.nombre) {
        toast.error(error.response.data.nombre[0]);
      } else {
        toast.error('Error al crear marca: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditarMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!marcaEditando || !formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setActionLoading(marcaEditando.id!);
    try {
      await actualizarMarca(marcaEditando.id!, { 
        nombre: formData.nombre.trim() 
      });
      toast.success('Marca actualizada correctamente');
      setFormData({ nombre: '' });
      setShowEditModal(false);
      setMarcaEditando(null);
      await cargarMarcas();
    } catch (error: any) {
      console.error('Error actualizando marca:', error);
      if (error.response?.data?.nombre) {
        toast.error(error.response.data.nombre[0]);
      } else {
        toast.error('Error al actualizar marca: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleEliminarMarca = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la marca "${nombre}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await eliminarMarca(id);
      toast.success(`Marca "${nombre}" eliminada correctamente`);
      await cargarMarcas();
    } catch (error: any) {
      console.error('Error eliminando marca:', error);
      toast.error('Error al eliminar marca: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestaurarMarca = async (id: number, nombre: string) => {
    setActionLoading(id);
    try {
      await restaurarMarca(id);
      toast.success(`Marca "${nombre}" restaurada correctamente`);
      await cargarMarcas();
    } catch (error: any) {
      console.error('Error restaurando marca:', error);
      toast.error('Error al restaurar marca: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handlers para modales
  const handleOpenCreateModal = () => {
    setFormData({ nombre: '' });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (marca: Marca) => {
    setMarcaEditando(marca);
    setFormData({ nombre: marca.nombre });
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setMarcaEditando(null);
    setFormData({ nombre: '' });
  };

  // Filtrar marcas basado en búsqueda
  const marcasFiltradas = marcas.filter(marca =>
    marca.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalMarcas = marcas.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Marcas</h1>
            <p className="text-gray-600 mt-1">Administra las marcas del sistema</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando marcas...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Marcas</h1>
            <p className="text-gray-600 mt-1">Administra las marcas del sistema</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={cargarMarcas}
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
              Nueva Marca
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Marcas</h3>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalMarcas}</p>
            <p className="text-xs text-gray-500 mt-2">Activas en el sistema</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Estado</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalMarcas}</p>
            <p className="text-xs text-gray-500 mt-2">Todas activas</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Disponibilidad</h3>
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">100%</p>
            <p className="text-xs text-gray-500 mt-2">Marcas operativas</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar marcas por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Marcas Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {marcasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      {marcas.length === 0 ? 'No hay marcas registradas' : 'No se encontraron marcas con los filtros aplicados'}
                    </td>
                  </tr>
                ) : (
                  marcasFiltradas.map((marca) => (
                    <tr key={marca.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 font-mono">#{marca.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            <Tag className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-gray-800">{marca.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            marca.estado
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {marca.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(marca)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {marca.estado ? (
                            <button 
                              onClick={() => handleEliminarMarca(marca.id!, marca.nombre)}
                              disabled={actionLoading === marca.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                            >
                              {actionLoading === marca.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleRestaurarMarca(marca.id!, marca.nombre)}
                              disabled={actionLoading === marca.id}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 disabled:opacity-50"
                            >
                              {actionLoading === marca.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <span className="text-xs font-medium">Restaurar</span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-md">
          <p className="text-sm text-gray-600">
            Mostrando {marcasFiltradas.length} de {marcas.length} marcas
            {searchTerm && ` · Filtrado por: "${searchTerm}"`}
          </p>
        </div>
      </div>

      {/* Modal para Crear Marca */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Crear Nueva Marca</h2>
            </div>
            <form onSubmit={handleCrearMarca}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Marca
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese el nombre de la marca"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El nombre debe ser único entre las marcas activas
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={actionLoading === -1}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === -1 ? 'Creando...' : 'Crear Marca'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Marca */}
      {showEditModal && marcaEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Editar Marca: {marcaEditando.nombre}
              </h2>
            </div>
            <form onSubmit={handleEditarMarca}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Marca
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese el nombre de la marca"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El nombre debe ser único entre las marcas activas
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={actionLoading === marcaEditando.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === marcaEditando.id ? 'Actualizando...' : 'Actualizar Marca'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
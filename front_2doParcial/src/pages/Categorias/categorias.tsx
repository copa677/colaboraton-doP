import { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { 
  getAllCategorias, 
  crearCategoria, 
  actualizarCategoria, 
  eliminarCategoria,
  restaurarCategoria,
  type Categoria 
} from '../../services/categorias.service';
import toast from 'react-hot-toast';

export default function CategoriasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Estados para modales y formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({ descripcion: '' });

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const data = await getAllCategorias();
      setCategorias(data);
    } catch (error: any) {
      console.error('Error cargando categorías:', error);
      toast.error('Error al cargar las categorías: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    setActionLoading(-1); // ID especial para creación
    try {
      await crearCategoria({ descripcion: formData.descripcion.trim() });
      toast.success('Categoría creada correctamente');
      setFormData({ descripcion: '' });
      setShowCreateModal(false);
      await cargarCategorias();
    } catch (error: any) {
      console.error('Error creando categoría:', error);
      toast.error('Error al crear categoría: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoriaEditando || !formData.descripcion.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    setActionLoading(categoriaEditando.id!);
    try {
      await actualizarCategoria(categoriaEditando.id!, { 
        descripcion: formData.descripcion.trim() 
      });
      toast.success('Categoría actualizada correctamente');
      setFormData({ descripcion: '' });
      setShowEditModal(false);
      setCategoriaEditando(null);
      await cargarCategorias();
    } catch (error: any) {
      console.error('Error actualizando categoría:', error);
      toast.error('Error al actualizar categoría: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleEliminarCategoria = async (id: number, descripcion: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${descripcion}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await eliminarCategoria(id);
      toast.success(`Categoría "${descripcion}" eliminada correctamente`);
      await cargarCategorias();
    } catch (error: any) {
      console.error('Error eliminando categoría:', error);
      toast.error('Error al eliminar categoría: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestaurarCategoria = async (id: number, descripcion: string) => {
    setActionLoading(id);
    try {
      await restaurarCategoria(id);
      toast.success(`Categoría "${descripcion}" restaurada correctamente`);
      await cargarCategorias();
    } catch (error: any) {
      console.error('Error restaurando categoría:', error);
      toast.error('Error al restaurar categoría: ' + (error.message || 'Error desconocido'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handlers para modales
  const handleOpenCreateModal = () => {
    setFormData({ descripcion: '' });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setFormData({ descripcion: categoria.descripcion });
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setCategoriaEditando(null);
    setFormData({ descripcion: '' });
  };

  // Filtrar categorías basado en búsqueda
  const categoriasFiltradas = categorias.filter(categoria =>
    categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const totalCategorias = categorias.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Categorías</h1>
            <p className="text-gray-600 mt-1">Administra las categorías del sistema</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando categorías...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Categorías</h1>
            <p className="text-gray-600 mt-1">Administra las categorías del sistema</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={cargarCategorias}
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
              Nueva Categoría
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Categorías</h3>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalCategorias}</p>
            <p className="text-xs text-gray-500 mt-2">Activas en el sistema</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Estado</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalCategorias}</p>
            <p className="text-xs text-gray-500 mt-2">Todas activas</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Disponibilidad</h3>
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">100%</p>
            <p className="text-xs text-gray-500 mt-2">Categorías operativas</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar categorías por descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Descripción</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categoriasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      {categorias.length === 0 ? 'No hay categorías registradas' : 'No se encontraron categorías con los filtros aplicados'}
                    </td>
                  </tr>
                ) : (
                  categoriasFiltradas.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600 font-mono">#{categoria.id}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{categoria.descripcion}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            categoria.estado
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {categoria.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(categoria)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {categoria.estado ? (
                            <button 
                              onClick={() => handleEliminarCategoria(categoria.id!, categoria.descripcion)}
                              disabled={actionLoading === categoria.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                            >
                              {actionLoading === categoria.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleRestaurarCategoria(categoria.id!, categoria.descripcion)}
                              disabled={actionLoading === categoria.id}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 disabled:opacity-50"
                            >
                              {actionLoading === categoria.id ? (
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
            Mostrando {categoriasFiltradas.length} de {categorias.length} categorías
            {searchTerm && ` · Filtrado por: "${searchTerm}"`}
          </p>
        </div>
      </div>

      {/* Modal para Crear Categoría */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Crear Nueva Categoría</h2>
            </div>
            <form onSubmit={handleCrearCategoria}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese la descripción de la categoría"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={actionLoading === -1}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === -1 ? 'Creando...' : 'Crear Categoría'}
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

      {/* Modal para Editar Categoría */}
      {showEditModal && categoriaEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Editar Categoría: {categoriaEditando.descripcion}
              </h2>
            </div>
            <form onSubmit={handleEditarCategoria}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese la descripción de la categoría"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={actionLoading === categoriaEditando.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === categoriaEditando.id ? 'Actualizando...' : 'Actualizar Categoría'}
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
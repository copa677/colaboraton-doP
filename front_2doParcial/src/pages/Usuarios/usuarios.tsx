import { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, MoreVertical, RefreshCw } from 'lucide-react';
import { getAllUsuarios, eliminarUsuario, restaurarUsuario } from '../../services/usuarios.service';
import type { Usuario } from '../../services/usuarios.service';
import { Modal } from '../../components/usuario/Modal';
import { UsuarioForm } from '../../components/usuario/UsuarioForm';
import toast from 'react-hot-toast';

export default function UsuariosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRol, setFilterRol] = useState('todos');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    
    // Estados para modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const data = await getAllUsuarios();
            setUsuarios(data);
        } catch (error: any) {
            console.error('Error cargando usuarios:', error);
            toast.error('Error al cargar los usuarios: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarUsuario = async (id: number, username: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar al usuario "${username}"?`)) {
            return;
        }

        setActionLoading(id);
        try {
            await eliminarUsuario(id);
            toast.success(`Usuario "${username}" eliminado correctamente`);
            await cargarUsuarios();
        } catch (error: any) {
            console.error('Error eliminando usuario:', error);
            toast.error('Error al eliminar usuario: ' + (error.message || 'Error desconocido'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestaurarUsuario = async (id: number, username: string) => {
        setActionLoading(id);
        try {
            await restaurarUsuario(id);
            toast.success(`Usuario "${username}" restaurado correctamente`);
            await cargarUsuarios();
        } catch (error: any) {
            console.error('Error restaurando usuario:', error);
            toast.error('Error al restaurar usuario: ' + (error.message || 'Error desconocido'));
        } finally {
            setActionLoading(null);
        }
    };

    // Handlers para modales
    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };

    const handleOpenEditModal = (usuario: Usuario) => {
        setUsuarioEditando(usuario);
        setShowEditModal(true);
    };

    const handleCloseModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setUsuarioEditando(null);
    };

    const handleSuccess = () => {
        handleCloseModals();
        cargarUsuarios(); // Recargar la lista
    };

    // Filtrar usuarios basado en búsqueda y filtros
    const usuariosFiltrados = usuarios.filter(usuario => {
        const coincideBusqueda = 
            usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());
        
        const coincideRol = filterRol === 'todos' || usuario.tipo_usuario === filterRol;
        const coincideEstado = filterEstado === 'todos' || 
            (filterEstado === 'activo' && usuario.estado) ||
            (filterEstado === 'inactivo' && !usuario.estado);

        return coincideBusqueda && coincideRol && coincideEstado;
    });

    // Calcular estadísticas
    const totalUsuarios = usuarios.length;
    const usuariosActivos = usuarios.filter(u => u.estado).length;
    const usuariosInactivos = usuarios.filter(u => !u.estado).length;
    const rolesUnicos = [...new Set(usuarios.map(u => u.tipo_usuario))];

    const getBadgeColor = (rol: string) => {
        switch (rol) {
            case 'admin': return 'bg-purple-100 text-purple-700';
            case 'empleado': return 'bg-blue-100 text-blue-700';
            case 'cliente': return 'bg-green-100 text-green-700';
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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
                        <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Cargando usuarios...</p>
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
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
                        <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={cargarUsuarios}
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
                            Nuevo Usuario
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Total Usuarios</h3>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{totalUsuarios}</p>
                        <p className="text-xs text-gray-500 mt-2">Registrados en el sistema</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Activos</h3>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{usuariosActivos}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {totalUsuarios > 0 ? Math.round((usuariosActivos / totalUsuarios) * 100) : 0}% del total
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Inactivos</h3>
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{usuariosInactivos}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {totalUsuarios > 0 ? Math.round((usuariosInactivos / totalUsuarios) * 100) : 0}% del total
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600">Tipos de Usuario</h3>
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{rolesUnicos.length}</p>
                        <p className="text-xs text-gray-500 mt-2">Roles diferentes</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex gap-4 flex-col md:flex-row">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por username o email..."
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
                                    {rol.charAt(0).toUpperCase() + rol.slice(1)}
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

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Usuario</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Rol</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {usuariosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            {usuarios.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios con los filtros aplicados'}
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosFiltrados.map((usuario) => (
                                        <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {getInitials(usuario.username)}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-800 block">{usuario.username}</span>
                                                        <span className="text-xs text-gray-500">ID: {usuario.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{usuario.correo}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getBadgeColor(usuario.tipo_usuario)}`}
                                                >
                                                    {usuario.tipo_usuario}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        usuario.estado
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {usuario.estado ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleOpenEditModal(usuario)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {usuario.estado ? (
                                                        <button 
                                                            onClick={() => handleEliminarUsuario(usuario.id!, usuario.username)}
                                                            disabled={actionLoading === usuario.id}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                                                        >
                                                            {actionLoading === usuario.id ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleRestaurarUsuario(usuario.id!, usuario.username)}
                                                            disabled={actionLoading === usuario.id}
                                                            className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 disabled:opacity-50"
                                                        >
                                                            {actionLoading === usuario.id ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <span className="text-xs font-medium">Restaurar</span>
                                                            )}
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                                                        onClick={() => toast('Más opciones en desarrollo', { duration: 3000 })}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
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
                        Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
                        {searchTerm && ` · Filtrado por: "${searchTerm}"`}
                    </p>
                    <div className="text-sm text-gray-500">
                        {filterRol !== 'todos' && `Rol: ${filterRol} · `}
                        {filterEstado !== 'todos' && `Estado: ${filterEstado}`}
                    </div>
                </div>
            </div>

            {/* Modal para Crear Usuario */}
            <Modal
                isOpen={showCreateModal}
                onClose={handleCloseModals}
                title="Crear Nuevo Usuario"
                size="md"
            >
                <UsuarioForm
                    onSuccess={handleSuccess}
                    onCancel={handleCloseModals}
                />
            </Modal>

            {/* Modal para Editar Usuario */}
            <Modal
                isOpen={showEditModal}
                onClose={handleCloseModals}
                title={`Editar Usuario: ${usuarioEditando?.username}`}
                size="md"
            >
                <UsuarioForm
                    usuario={usuarioEditando || undefined}
                    onSuccess={handleSuccess}
                    onCancel={handleCloseModals}
                />
            </Modal>
        </>
    );
}
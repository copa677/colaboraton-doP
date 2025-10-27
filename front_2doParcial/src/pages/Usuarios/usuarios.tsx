import { useState } from 'react';
import { Users, Search, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';

export default function UsuariosPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const usuarios = [
        { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', rol: 'Admin', estado: 'Activo', ultimoAcceso: '2025-10-27' },
        { id: 2, nombre: 'María García', email: 'maria@email.com', rol: 'Usuario', estado: 'Activo', ultimoAcceso: '2025-10-26' },
        { id: 3, nombre: 'Carlos López', email: 'carlos@email.com', rol: 'Usuario', estado: 'Inactivo', ultimoAcceso: '2025-10-20' },
        { id: 4, nombre: 'Ana Martínez', email: 'ana@email.com', rol: 'Moderador', estado: 'Activo', ultimoAcceso: '2025-10-27' },
        { id: 5, nombre: 'Pedro Sánchez', email: 'pedro@email.com', rol: 'Usuario', estado: 'Activo', ultimoAcceso: '2025-10-25' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
                    <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Total Usuarios</h3>
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">156</p>
                    <p className="text-xs text-green-600 mt-2">+12% vs mes anterior</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Activos</h3>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">142</p>
                    <p className="text-xs text-gray-500 mt-2">91% del total</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Inactivos</h3>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">14</p>
                    <p className="text-xs text-gray-500 mt-2">9% del total</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Nuevos (30d)</h3>
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">24</p>
                    <p className="text-xs text-blue-600 mt-2">Este mes</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>Todos los roles</option>
                        <option>Admin</option>
                        <option>Moderador</option>
                        <option>Usuario</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>Todos los estados</option>
                        <option>Activo</option>
                        <option>Inactivo</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Scroll horizontal */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Usuario</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Rol</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Último Acceso</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {usuario.nombre.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-800">{usuario.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{usuario.email}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${usuario.rol === 'Admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : usuario.rol === 'Moderador'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {usuario.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${usuario.estado === 'Activo'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {usuario.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{usuario.ultimoAcceso}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Pagination */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-md">
                <p className="text-sm text-gray-600">Mostrando 1 a 5 de 156 usuarios</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Anterior
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}
import { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, MoreVertical, RefreshCw, Image, Tag, DollarSign, Grid } from 'lucide-react';

// Tipos
interface Categoria {
    id: number;
    nombre: string;
}

interface Marca {
    id: number;
    nombre: string;
}

interface Imagen {
    id: number;
    imagen: string;
    es_principal: boolean;
}

interface Especificacion {
    id: number;
    nombre: string;
    descripcion: string;
}

interface Producto {
    id: number;
    descripcion: string;
    precio: number;
    categoria: Categoria;
    marca: Marca;
    estado: boolean;
    imagenes: Imagen[];
    especificaciones: Especificacion[];
    fecha_creacion: string;
}

export default function ProductosPage() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterCategoria, setFilterCategoria] = useState<string>('todos');
    const [filterMarca, setFilterMarca] = useState<string>('todos');
    const [filterEstado, setFilterEstado] = useState<string>('todos');
    const [loading, setLoading] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid'); // 'grid' o 'table'

    // Mock data
    const productos: Producto[] = [
        {
            id: 1,
            descripcion: 'Laptop Dell Inspiron 15',
            precio: 850.0,
            categoria: { id: 1, nombre: 'Laptops' },
            marca: { id: 1, nombre: 'Dell' },
            estado: true,
            imagenes: [
                { id: 1, imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', es_principal: true },
                { id: 2, imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', es_principal: false }
            ],
            especificaciones: [
                { id: 1, nombre: 'Procesador', descripcion: 'Intel Core i7 11th Gen' },
                { id: 2, nombre: 'RAM', descripcion: '16GB DDR4' },
                { id: 3, nombre: 'Almacenamiento', descripcion: '512GB SSD' }
            ],
            fecha_creacion: '2024-01-15'
        },
        {
            id: 2,
            descripcion: 'Mouse Logitech MX Master 3',
            precio: 99.99,
            categoria: { id: 2, nombre: 'Accesorios' },
            marca: { id: 2, nombre: 'Logitech' },
            estado: true,
            imagenes: [
                { id: 3, imagen: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', es_principal: true }
            ],
            especificaciones: [
                { id: 4, nombre: 'Conectividad', descripcion: 'Bluetooth y USB-C' },
                { id: 5, nombre: 'DPI', descripcion: 'Hasta 4000 DPI' }
            ],
            fecha_creacion: '2024-02-10'
        },
        // ... resto de productos (igual que antes)
    ];

    const categorias = [...new Set(productos.map(p => p.categoria.nombre))];
    const marcas = [...new Set(productos.map(p => p.marca.nombre))];

    const productosFiltrados = productos.filter(producto => {
        const coincideBusqueda =
            producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            producto.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        const coincideCategoria = filterCategoria === 'todos' || producto.categoria.nombre === filterCategoria;
        const coincideMarca = filterMarca === 'todos' || producto.marca.nombre === filterMarca;
        const coincideEstado =
            filterEstado === 'todos' ||
            (filterEstado === 'activo' && producto.estado) ||
            (filterEstado === 'inactivo' && !producto.estado);

        return coincideBusqueda && coincideCategoria && coincideMarca && coincideEstado;
    });

    const totalProductos = productos.length;
    const productosActivos = productos.filter(p => p.estado).length;
    const productosInactivos = productos.filter(p => !p.estado).length;
    const valorInventario = productos.filter(p => p.estado).reduce((sum, p) => sum + p.precio, 0);

    const getCategoriaColor = (categoria: string) => {
        const colors: { [key: string]: string } = {
            'Laptops': 'bg-blue-100 text-blue-700',
            'Accesorios': 'bg-green-100 text-green-700',
            'Monitores': 'bg-purple-100 text-purple-700',
            'Audio': 'bg-pink-100 text-pink-700',
            'Tablets': 'bg-orange-100 text-orange-700'
        };
        return colors[categoria] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
                    <p className="text-gray-600 mt-1">Administra el catálogo de productos</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setLoading(!loading)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
                        <Plus className="w-5 h-5" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Total Productos</h3>
                        <Package className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{totalProductos}</p>
                    <p className="text-xs text-gray-500 mt-2">En el catálogo</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Activos</h3>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{productosActivos}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {totalProductos > 0 ? Math.round((productosActivos / totalProductos) * 100) : 0}% del total
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Inactivos</h3>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{productosInactivos}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {totalProductos > 0 ? Math.round((productosInactivos / totalProductos) * 100) : 0}% del total
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Valor Inventario</h3>
                        <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">${valorInventario.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-2">Productos activos</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex gap-4 flex-col md:flex-row">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por descripción o marca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterCategoria}
                        onChange={(e) => setFilterCategoria(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={filterMarca}
                        onChange={(e) => setFilterMarca(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todas las marcas</option>
                        {marcas.map(marca => (
                            <option key={marca} value={marca}>{marca}</option>
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
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Grid className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Products Grid View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productosFiltrados.length === 0 ? (
                        <div className="col-span-full bg-white p-12 rounded-xl shadow-md text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No se encontraron productos</p>
                        </div>
                    ) : (
                        productosFiltrados.map(producto => (
                            <div key={producto.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Imagen Principal */}
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                    <img
                                        src={producto.imagenes.find(img => img.es_principal)?.imagen || producto.imagenes[0]?.imagen}
                                        alt={producto.descripcion}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${producto.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {producto.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                        {producto.imagenes.length > 1 && (
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                <Image className="w-3 h-3" />
                                                {producto.imagenes.length}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                                {producto.descripcion}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(producto.categoria.nombre)}`}>
                                                    {producto.categoria.nombre}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {producto.marca.nombre}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-2xl font-bold text-blue-600">${producto.precio.toFixed(2)}</p>
                                    </div>

                                    {/* Especificaciones */}
                                    {producto.especificaciones.length > 0 && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs font-semibold text-gray-600 mb-2">Especificaciones:</p>
                                            <ul className="space-y-1">
                                                {producto.especificaciones.slice(0, 2).map(esp => (
                                                    <li key={esp.id} className="text-xs text-gray-600">
                                                        <span className="font-medium">{esp.nombre}:</span> {esp.descripcion}
                                                    </li>
                                                ))}
                                                {producto.especificaciones.length > 2 && (
                                                    <li className="text-xs text-blue-600 font-medium">
                                                        +{producto.especificaciones.length - 2} más...
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Acciones */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition-colors text-sm font-medium">
                                            <Edit className="w-4 h-4" />
                                            Editar
                                        </button>
                                        {producto.estado ? (
                                            <button className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg transition-colors text-sm">
                                                Restaurar
                                            </button>
                                        )}
                                        <button className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Products Table View */
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Producto</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Categoría</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Marca</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Precio</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Imágenes</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Estado</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {productosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No se encontraron productos
                                        </td>
                                    </tr>
                                ) : (
                                    productosFiltrados.map(producto => (
                                        <tr key={producto.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={producto.imagenes.find(img => img.es_principal)?.imagen || producto.imagenes[0]?.imagen}
                                                        alt={producto.descripcion}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <span className="font-medium text-gray-800 block">{producto.descripcion}</span>
                                                        <span className="text-xs text-gray-500">ID: {producto.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoriaColor(producto.categoria.nombre)}`}>
                                                    {producto.categoria.nombre}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{producto.marca.nombre}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-blue-600">${producto.precio.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Image className="w-4 h-4" />
                                                    {producto.imagenes.length}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${producto.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {producto.estado ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {producto.estado ? (
                                                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600">
                                                            <span className="text-xs font-medium">Restaurar</span>
                                                        </button>
                                                    )}
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
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
            )}

            {/* Pagination Info */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-md">
                <p className="text-sm text-gray-600">
                    Mostrando {productosFiltrados.length} de {productos.length} productos
                    {searchTerm && ` · Filtrado por: "${searchTerm}"`}
                </p>
                <div className="text-sm text-gray-500">
                    {filterCategoria !== 'todos' && `Categoría: ${filterCategoria} · `}
                    {filterMarca !== 'todos' && `Marca: ${filterMarca} · `}
                    {filterEstado !== 'todos' && `Estado: ${filterEstado}`}
                </div>
            </div>
        </div>
    );
}
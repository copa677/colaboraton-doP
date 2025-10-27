import { useState } from 'react';
import { UserCheck, Search, Plus, Star, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function ClientesPage() {
  const clientes = [
    { 
      id: 1, 
      nombre: 'Alejandro Torres', 
      email: 'alejandro@email.com',
      telefono: '+591 7111-2222',
      ciudad: 'Santa Cruz',
      compras: 8,
      totalGastado: 12450,
      ultimaCompra: '2025-10-25',
      categoria: 'Premium'
    },
    { 
      id: 2, 
      nombre: 'Sofía Mendoza', 
      email: 'sofia@email.com',
      telefono: '+591 7222-3333',
      ciudad: 'La Paz',
      compras: 15,
      totalGastado: 28900,
      ultimaCompra: '2025-10-27',
      categoria: 'VIP'
    },
    { 
      id: 3, 
      nombre: 'Miguel Quispe', 
      email: 'miguel@email.com',
      telefono: '+591 7333-4444',
      ciudad: 'Cochabamba',
      compras: 3,
      totalGastado: 4200,
      ultimaCompra: '2025-10-20',
      categoria: 'Regular'
    },
    { 
      id: 4, 
      nombre: 'Valentina Rojas', 
      email: 'valentina@email.com',
      telefono: '+591 7444-5555',
      ciudad: 'Santa Cruz',
      compras: 12,
      totalGastado: 19800,
      ultimaCompra: '2025-10-26',
      categoria: 'Premium'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra tu base de clientes</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Clientes</h3>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">1,248</p>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18% vs mes anterior
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Clientes VIP</h3>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">89</p>
          <p className="text-xs text-gray-500 mt-2">7% del total</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Ventas Totales</h3>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">2.4M</p>
          <p className="text-xs text-gray-500 mt-2">Bolivianos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Ticket Promedio</h3>
            <ShoppingBag className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">1,923</p>
          <p className="text-xs text-gray-500 mt-2">Bs. por compra</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>Todas las categorías</option>
            <option>VIP</option>
            <option>Premium</option>
            <option>Regular</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>Todas las ciudades</option>
            <option>Santa Cruz</option>
            <option>La Paz</option>
            <option>Cochabamba</option>
          </select>
        </div>
      </div>

      {/* Clientes Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {cliente.nombre.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{cliente.nombre}</h3>
                    <p className="text-sm text-gray-600">{cliente.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cliente.categoria === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                  cliente.categoria === 'Premium' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {cliente.categoria}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{cliente.compras}</p>
                  <p className="text-xs text-gray-600">Compras</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">Bs. {cliente.totalGastado.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Gastado</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{cliente.ultimaCompra}</p>
                  <p className="text-xs text-gray-500">Última compra</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
                <p><strong>Tel:</strong> {cliente.telefono}</p>
                <p><strong>Ciudad:</strong> {cliente.ciudad}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

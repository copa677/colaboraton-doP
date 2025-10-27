import { useState } from 'react';
import { Briefcase, Search, Plus, Phone, Mail, MapPin, Calendar } from 'lucide-react';

export default function EmpleadosPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const empleados = [
    { 
      id: 1, 
      nombre: 'Roberto Fernández', 
      cargo: 'Gerente de Ventas', 
      departamento: 'Ventas',
      telefono: '+591 7123-4567',
      email: 'roberto@techhome.com',
      ubicacion: 'Santa Cruz',
      fechaIngreso: '2023-01-15',
      salario: 8500,
      estado: 'Activo'
    },
    { 
      id: 2, 
      nombre: 'Laura Morales', 
      cargo: 'Vendedora Senior', 
      departamento: 'Ventas',
      telefono: '+591 7234-5678',
      email: 'laura@techhome.com',
      ubicacion: 'Santa Cruz',
      fechaIngreso: '2023-03-20',
      salario: 5500,
      estado: 'Activo'
    },
    { 
      id: 3, 
      nombre: 'Diego Ramírez', 
      cargo: 'Técnico', 
      departamento: 'Soporte',
      telefono: '+591 7345-6789',
      email: 'diego@techhome.com',
      ubicacion: 'La Paz',
      fechaIngreso: '2022-11-10',
      salario: 4800,
      estado: 'Activo'
    },
    { 
      id: 4, 
      nombre: 'Carmen Silva', 
      cargo: 'Contadora', 
      departamento: 'Finanzas',
      telefono: '+591 7456-7890',
      email: 'carmen@techhome.com',
      ubicacion: 'Santa Cruz',
      fechaIngreso: '2021-05-08',
      salario: 6200,
      estado: 'Activo'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Empleados</h1>
          <p className="text-gray-600 mt-1">Administra el personal de tu empresa</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
          <Plus className="w-5 h-5" />
          Nuevo Empleado
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Empleados</h3>
            <Briefcase className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">42</p>
          <p className="text-xs text-green-600 mt-2">+3 este mes</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Departamentos</h3>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
          <p className="text-3xl font-bold text-gray-800">8</p>
          <p className="text-xs text-gray-500 mt-2">Activos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Nómina Mensual</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-3xl font-bold text-gray-800">245K</p>
          <p className="text-xs text-gray-500 mt-2">Bolivianos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Ausencias Hoy</h3>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
          <p className="text-3xl font-bold text-gray-800">2</p>
          <p className="text-xs text-gray-500 mt-2">4.7% del personal</p>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option>Todos los departamentos</option>
            <option>Ventas</option>
            <option>Soporte</option>
            <option>Finanzas</option>
          </select>
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Empleados Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {empleados.map((empleado) => (
          <div key={empleado.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {empleado.nombre.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{empleado.nombre}</h3>
                  <p className="text-blue-100 text-sm">{empleado.cargo}</p>
                </div>
              </div>
            </div>

            {/* Body Card */}
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{empleado.departamento}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{empleado.telefono}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{empleado.email}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{empleado.ubicacion}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Ingreso: {empleado.fechaIngreso}</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Salario</span>
                  <span className="font-bold text-gray-800">Bs. {empleado.salario.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
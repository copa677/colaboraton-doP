import { useState, useEffect } from "react";
import { Shield, Search, Users, RefreshCw, Save, X, Check, Trash2 } from "lucide-react";
import { 
  getAllUsuarios, 
  type Usuario 
} from '../../services/usuarios.service';
import { 
  getPermisosByUsuario, 
  crearPermiso, 
  actualizarPermiso,
  eliminarPermiso,
  type Permiso as PermisoType,
  type CreatePermisoData,
  type UpdatePermisoData
} from '../../services/permisos.service';
import toast from 'react-hot-toast';

interface Ventana {
  id: string;
  nombre: string;
}

interface Permiso {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

type PermisosPorUsuario = Record<number, Record<string, Permiso>>;

export default function PermisosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [ventanaSeleccionada, setVentanaSeleccionada] = useState("");
  const [permisos, setPermisos] = useState<PermisosPorUsuario>({});
  const [guardando, setGuardando] = useState(false);

  // Mock data de ventanas (puedes mover esto a un servicio si es dinámico)
  const ventanas: Ventana[] = [
    { id: "usuarios", nombre: "Usuarios" },
    { id: "productos", nombre: "Productos" },
    { id: "ventas", nombre: "Ventas" },
    { id: "inventario", nombre: "Inventario" },
    { id: "reportes", nombre: "Reportes" },
    { id: "configuracion", nombre: "Configuración" },
    { id: "clientes", nombre: "Clientes" },
    { id: "proveedores", nombre: "Proveedores" },
  ];

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await getAllUsuarios();
      setUsuarios(data);
      await cargarPermisosGlobales(data);
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error al cargar los usuarios: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const cargarPermisosGlobales = async (usuariosData: Usuario[]) => {
    try {
      const permisosGlobales: PermisosPorUsuario = {};
      
      // Cargar permisos para cada usuario
      for (const usuario of usuariosData) {
        if (usuario.id) {
          try {
            const permisosUsuario = await getPermisosByUsuario(usuario.id);
            permisosGlobales[usuario.id] = convertirPermisosServicio(permisosUsuario);
          } catch (error) {
            console.warn(`No se pudieron cargar permisos para usuario ${usuario.id}:`, error);
            permisosGlobales[usuario.id] = {};
          }
        }
      }
      
      setPermisos(permisosGlobales);
    } catch (error) {
      console.error('Error cargando permisos globales:', error);
    }
  };

  const cargarPermisosUsuario = async (usuarioId: number) => {
    try {
      const permisosUsuario = await getPermisosByUsuario(usuarioId);
      const permisosConvertidos = convertirPermisosServicio(permisosUsuario);
      
      setPermisos(prev => ({
        ...prev,
        [usuarioId]: permisosConvertidos
      }));
    } catch (error: any) {
      console.error('Error cargando permisos del usuario:', error);
      toast.error('Error al cargar permisos: ' + (error.message || 'Error desconocido'));
    }
  };

  // Convertir permisos del servicio al formato de la interfaz
  const convertirPermisosServicio = (permisosServicio: PermisoType[]): Record<string, Permiso> => {
    const permisosConvertidos: Record<string, Permiso> = {};
    
    permisosServicio.forEach(permiso => {
      permisosConvertidos[permiso.vista] = {
        ver: permiso.ver,
        crear: permiso.crear,
        editar: permiso.editar,
        eliminar: permiso.eliminar
      };
    });
    
    return permisosConvertidos;
  };

  // Convertir permisos de la interfaz al formato del servicio
  const convertirPermisoParaServicio = (permiso: Permiso, usuarioId: number, vista: string): CreatePermisoData => {
    return {
      usuario: usuarioId,
      vista: vista,
      crear: permiso.crear,
      editar: permiso.editar,
      eliminar: permiso.eliminar,
      ver: permiso.ver
    };
  };

  const handleTogglePermiso = (accion: keyof Permiso) => {
    if (!selectedUsuario || !ventanaSeleccionada) return;

    setPermisos((prev) => ({
      ...prev,
      [selectedUsuario.id!]: {
        ...prev[selectedUsuario.id!],
        [ventanaSeleccionada]: {
          ...prev[selectedUsuario.id!]?.[ventanaSeleccionada] || { ver: false, crear: false, editar: false, eliminar: false },
          [accion]: !prev[selectedUsuario.id!]?.[ventanaSeleccionada]?.[accion]
        },
      },
    }));
  };

  const handleGuardarPermisos = async () => {
    if (!selectedUsuario || !ventanaSeleccionada) return;

    setGuardando(true);
    try {
      const permisosActuales = permisos[selectedUsuario.id!]?.[ventanaSeleccionada];
      
      if (!permisosActuales) {
        toast.error('No hay permisos para guardar');
        return;
      }

      // Buscar si ya existe un permiso para esta ventana y usuario
      const permisosUsuario = await getPermisosByUsuario(selectedUsuario.id!);
      const permisoExistente = permisosUsuario.find(p => p.vista === ventanaSeleccionada);

      if (permisoExistente) {
        // Actualizar permiso existente
        const datosActualizacion: UpdatePermisoData = {
          crear: permisosActuales.crear,
          editar: permisosActuales.editar,
          eliminar: permisosActuales.eliminar,
          ver: permisosActuales.ver
        };
        
        await actualizarPermiso(permisoExistente.id!, datosActualizacion);
        toast.success(`Permisos actualizados para ${ventanas.find(v => v.id === ventanaSeleccionada)?.nombre}`);
      } else {
        // Crear nuevo permiso
        const nuevoPermiso = convertirPermisoParaServicio(permisosActuales, selectedUsuario.id!, ventanaSeleccionada);
        await crearPermiso(nuevoPermiso);
        toast.success(`Permisos creados para ${ventanas.find(v => v.id === ventanaSeleccionada)?.nombre}`);
      }

      // Recargar permisos del usuario para asegurar consistencia
      await cargarPermisosUsuario(selectedUsuario.id!);
      
    } catch (error: any) {
      console.error('Error guardando permisos:', error);
      toast.error('Error al guardar permisos: ' + (error.message || 'Error desconocido'));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarPermisos = async () => {
    if (!selectedUsuario || !ventanaSeleccionada) return;

    if (!window.confirm(`¿Estás seguro de eliminar todos los permisos para esta ventana?`)) {
      return;
    }

    setGuardando(true);
    try {
      const permisosUsuario = await getPermisosByUsuario(selectedUsuario.id!);
      const permisoExistente = permisosUsuario.find(p => p.vista === ventanaSeleccionada);

      if (permisoExistente) {
        await eliminarPermiso(permisoExistente.id!);
        toast.success(`Permisos eliminados para ${ventanas.find(v => v.id === ventanaSeleccionada)?.nombre}`);
        
        // Actualizar estado local
        setPermisos(prev => ({
          ...prev,
          [selectedUsuario.id!]: {
            ...prev[selectedUsuario.id!],
            [ventanaSeleccionada]: undefined
          }
        }));
        
        // Limpiar selección
        setVentanaSeleccionada('');
      } else {
        toast.error('No se encontraron permisos para eliminar');
      }
    } catch (error: any) {
      console.error('Error eliminando permisos:', error);
      toast.error('Error al eliminar permisos: ' + (error.message || 'Error desconocido'));
    } finally {
      setGuardando(false);
    }
  };

  const handleSeleccionarUsuario = async (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setVentanaSeleccionada('');
    
    // Cargar permisos del usuario si no están en cache
    if (usuario.id && !permisos[usuario.id]) {
      await cargarPermisosUsuario(usuario.id);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideBusqueda =
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());

    const coincideRol =
      filterRol === "todos" || usuario.tipo_usuario === filterRol;
    const coincideEstado =
      filterEstado === "todos" ||
      (filterEstado === "activo" && usuario.estado) ||
      (filterEstado === "inactivo" && !usuario.estado);

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.estado).length;
  const usuariosInactivos = usuarios.filter((u) => !u.estado).length;
  const rolesUnicos = [...new Set(usuarios.map((u) => u.tipo_usuario))];

  const getBadgeColor = (rol: string) => {
    switch (rol) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "empleado":
        return "bg-blue-100 text-blue-700";
      case "cliente":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const permisosActuales =
    selectedUsuario && ventanaSeleccionada
      ? permisos[selectedUsuario.id!]?.[ventanaSeleccionada]
      : null;

  const tienePermisosConfigurados = 
    selectedUsuario && 
    ventanaSeleccionada && 
    permisosActuales;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Permisos</h1>
          <p className="text-gray-600 mt-1">Administra los permisos de usuarios por ventana</p>
        </div>
        <button 
          onClick={cargarUsuarios}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
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
            <h3 className="text-sm font-medium text-gray-600">Ventanas</h3>
            <Shield className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{ventanas.length}</p>
          <p className="text-xs text-gray-500 mt-2">Módulos del sistema</p>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Usuarios */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Seleccionar Usuario</h2>
            
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por username o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <select 
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Usuarios */}
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {usuariosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No se encontraron usuarios
              </div>
            ) : (
              usuariosFiltrados.map(usuario => (
                <div
                  key={usuario.id}
                  onClick={() => handleSeleccionarUsuario(usuario)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedUsuario?.id === usuario.id 
                      ? 'bg-blue-50 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getInitials(usuario.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-800 truncate">{usuario.username}</h3>
                        {!usuario.estado && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">Inactivo</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-1">{usuario.correo}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${getBadgeColor(usuario.tipo_usuario)}`}>
                        {usuario.tipo_usuario}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel de Permisos */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Configurar Permisos</h2>
            
            {selectedUsuario ? (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getInitials(selectedUsuario.username)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedUsuario.username}</p>
                    <p className="text-sm text-gray-600">{selectedUsuario.correo}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center text-gray-500">
                Selecciona un usuario para configurar permisos
              </div>
            )}

            {/* Selector de Ventana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Ventana/Módulo
              </label>
              <select 
                value={ventanaSeleccionada}
                onChange={(e) => setVentanaSeleccionada(e.target.value)}
                disabled={!selectedUsuario}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              >
                <option value="">-- Selecciona una ventana --</option>
                {ventanas.map(ventana => (
                  <option key={ventana.id} value={ventana.id}>
                    {ventana.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes de Permisos */}
          <div className="p-6">
            {!selectedUsuario ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona un usuario primero</p>
              </div>
            ) : !ventanaSeleccionada ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona una ventana para configurar permisos</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {ventanas.find(v => v.id === ventanaSeleccionada)?.nombre}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configura los permisos para este módulo
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Permiso Ver */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        permisosActuales?.ver ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {permisosActuales?.ver && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Ver</p>
                        <p className="text-sm text-gray-500">Permite visualizar información</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permisosActuales?.ver || false}
                        onChange={() => handleTogglePermiso('ver')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Permiso Crear */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        permisosActuales?.crear ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {permisosActuales?.crear && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Crear</p>
                        <p className="text-sm text-gray-500">Permite crear nuevos registros</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permisosActuales?.crear || false}
                        onChange={() => handleTogglePermiso('crear')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Permiso Editar */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        permisosActuales?.editar ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {permisosActuales?.editar && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Editar</p>
                        <p className="text-sm text-gray-500">Permite modificar registros existentes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permisosActuales?.editar || false}
                        onChange={() => handleTogglePermiso('editar')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Permiso Eliminar */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        permisosActuales?.eliminar ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {permisosActuales?.eliminar && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Eliminar</p>
                        <p className="text-sm text-gray-500">Permite eliminar registros</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permisosActuales?.eliminar || false}
                        onChange={() => handleTogglePermiso('eliminar')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleGuardarPermisos}
                    disabled={guardando || !tienePermisosConfigurados}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className={`w-5 h-5 ${guardando ? 'animate-spin' : ''}`} />
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  {tienePermisosConfigurados && (
                    <button 
                      onClick={handleEliminarPermisos}
                      disabled={guardando}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setVentanaSeleccionada('');
                      setSelectedUsuario(null);
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
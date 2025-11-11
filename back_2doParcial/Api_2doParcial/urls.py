from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/usuarios/', include('Usuarios.urls')),
    path('api/permisos/', include('Permisos.urls')),
    path('api/clientes/', include('Cliente.urls')),
    path('api/empleados/', include('Empleados.urls')),
    path('api/bitacora/', include('Bitacora.urls')),
    path('api/categorias/', include('Categorias.urls')),
    path('api/marcas/', include('Marcas.urls')),
    path('api/productos/', include('Productos.urls')),
    path('api/carrito/', include('Carrito.urls')),
    path('api/facturas/', include('Facturas.urls')),
]

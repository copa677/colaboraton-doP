from django.urls import path
from . import views

urlpatterns = [
    # === RUTAS DE PRODUCTOS (EXISTENTES) ===
    path('productos/', views.listar_productos, name='listar-productos'),
    path('productos/todos/', views.listar_todos_productos, name='listar-todos-productos'),
    path('productos/crear/', views.crear_producto, name='crear-producto'),
    path('productos/buscar/', views.buscar_productos, name='buscar-productos'),
    path('productos/categoria/<int:categoria_id>/', views.listar_productos_por_categoria, name='productos-por-categoria'),
    path('productos/marca/<int:marca_id>/', views.listar_productos_por_marca, name='productos-por-marca'),
    path('productos/categoria/<int:categoria_id>/marca/<int:marca_id>/', views.listar_productos_por_categoria_marca, name='productos-por-categoria-marca'),
    path('productos/<int:pk>/', views.obtener_producto, name='obtener-producto'),
    path('productos/<int:pk>/actualizar/', views.actualizar_producto, name='actualizar-producto'),
    path('productos/<int:pk>/eliminar/', views.eliminar_producto, name='eliminar-producto'),
    path('productos/<int:pk>/restaurar/', views.restaurar_producto, name='restaurar-producto'),
    
    # === RUTAS PARA ESPECIFICACIONES ===
    path('especificaciones/', views.listar_especificaciones, name='listar-especificaciones'),
    path('especificaciones/producto/<int:producto_id>/', views.listar_especificaciones_producto, name='especificaciones-por-producto'),
    path('especificaciones/crear/', views.crear_especificacion, name='crear-especificacion'),
    path('especificaciones/<int:pk>/actualizar/', views.actualizar_especificacion, name='actualizar-especificacion'),
    path('especificaciones/<int:pk>/eliminar/', views.eliminar_especificacion, name='eliminar-especificacion'),
    path('especificaciones/<int:pk>/restaurar/', views.restaurar_especificacion, name='restaurar-especificacion'),
    
    # === RUTAS PARA INVENTARIO ===
    path('inventario/', views.listar_inventarios, name='listar-inventarios'),
    path('inventario/producto/<int:producto_id>/', views.obtener_inventario_producto, name='inventario-por-producto'),
    path('inventario/crear/', views.crear_inventario, name='crear-inventario'),
    path('inventario/<int:pk>/actualizar/', views.actualizar_inventario, name='actualizar-inventario'),
    path('inventario/<int:pk>/eliminar/', views.eliminar_inventario, name='eliminar-inventario'),
    path('inventario/<int:pk>/restaurar/', views.restaurar_inventario, name='restaurar-inventario'),

    # === RUTAS PARA IMÁGENES DE PRODUCTOS ===
    path('imagenes-producto/producto/<int:producto_id>/', views.listar_imagenes_producto, name='imagenes-por-producto'),
    path('imagenes-producto/crear/', views.crear_imagen_producto, name='crear-imagen-producto'),
    path('imagenes-producto/<int:pk>/actualizar/', views.actualizar_imagen_producto, name='actualizar-imagen-producto'),
    path('imagenes-producto/<int:pk>/eliminar/', views.eliminar_imagen_producto, name='eliminar-imagen-producto'),
    path('imagenes-producto/<int:pk>/restaurar/', views.restaurar_imagen_producto, name='restaurar-imagen-producto'),
    path('imagenes-producto/<int:pk>/marcar-principal/', views.marcar_imagen_principal, name='marcar-imagen-principal'),
]
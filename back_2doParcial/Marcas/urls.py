from django.urls import path
from . import views

urlpatterns = [
    # === RUTAS DE MARCAS ===
    # Listar
    path('marcas/', views.listar_marcas, name='listar-marcas'),
    path('marcas/todos/', views.listar_todas_marcas, name='listar-todas-marcas'),
    
    # Crear
    path('marcas/crear/', views.crear_marca, name='crear-marca'),
    
    # Buscar
    path('marcas/buscar/', views.buscar_marca_por_nombre, name='buscar-marca'),
    
    # CRUD individual
    path('marcas/<int:pk>/', views.obtener_marca, name='obtener-marca'),
    path('marcas/<int:pk>/actualizar/', views.actualizar_marca, name='actualizar-marca'),
    path('marcas/<int:pk>/eliminar/', views.eliminar_marca, name='eliminar-marca'),
    path('marcas/<int:pk>/restaurar/', views.restaurar_marca, name='restaurar-marca'),
]
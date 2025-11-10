from django.urls import path
from . import views

urlpatterns = [
    # === RUTAS DE CATEGORÍAS ===
    # Listar
    path('categorias/', views.listar_categorias, name='listar-categorias'),
    path('categorias/todos/', views.listar_todas_categorias, name='listar-todas-categorias'),
    
    # Crear
    path('categorias/crear/', views.crear_categoria, name='crear-categoria'),
    
    # Buscar
    path('categorias/buscar/', views.buscar_categoria_por_descripcion, name='buscar-categoria'),
    
    # CRUD individual
    path('categorias/<int:pk>/', views.obtener_categoria, name='obtener-categoria'),
    path('categorias/<int:pk>/actualizar/', views.actualizar_categoria, name='actualizar-categoria'),
    path('categorias/<int:pk>/eliminar/', views.eliminar_categoria, name='eliminar-categoria'),
    path('categorias/<int:pk>/restaurar/', views.restaurar_categoria, name='restaurar-categoria'),
]
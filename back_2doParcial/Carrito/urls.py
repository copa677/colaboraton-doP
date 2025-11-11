from django.urls import path
from . import views

urlpatterns = [
    # === RUTAS PARA CARRITO ===
    path('carrito/usuario/<int:usuario_id>/', views.obtener_carrito_usuario, name='obtener-carrito-usuario'),
    path('carrito/crear/', views.crear_carrito, name='crear-carrito'),
    path('carrito/<int:pk>/eliminar/', views.eliminar_carrito, name='eliminar-carrito'),
    path('carrito/<int:carrito_id>/vaciar/', views.vaciar_carrito, name='vaciar-carrito'),
    
    # === RUTAS PARA ITEMS DEL CARRITO ===
    path('carrito/<int:carrito_id>/agregar-item/', views.agregar_item_carrito, name='agregar-item-carrito'),
    path('items/<int:item_id>/actualizar/', views.actualizar_item_carrito, name='actualizar-item-carrito'),
    path('items/<int:item_id>/eliminar/', views.eliminar_item_carrito, name='eliminar-item-carrito'),
    path('items/<int:item_id>/restaurar/', views.restaurar_item_carrito, name='restaurar-item-carrito'),
    
    # === RUTAS PARA PEDIDOS ===
    path('pedidos/crear/<int:carrito_id>/', views.crear_pedido, name='crear-pedido'),
    path('pedidos/usuario/<int:usuario_id>/', views.listar_pedidos_usuario, name='pedidos-usuario'),
    path('pedidos/<int:pedido_id>/', views.obtener_pedido, name='obtener-pedido'),
    path('pedidos/<int:pedido_id>/actualizar-estado/', views.actualizar_estado_pedido, name='actualizar-estado-pedido'),
    path('pedidos/<int:pedido_id>/cancelar/', views.cancelar_pedido, name='cancelar-pedido'),
    path('pedidos/todos/', views.listar_todos_pedidos, name='listar-todos-pedidos'),
]
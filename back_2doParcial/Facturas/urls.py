from django.urls import path
from . import views

urlpatterns = [
    # === RUTAS DE PAGO CON STRIPE ===
    path('pago/crear-sesion/<int:pedido_id>/', views.crear_sesion_pago, name='crear-sesion-pago'),
    path('pago/exito/', views.pago_exitoso, name='pago-exitoso'),
    path('pago/cancelado/', views.pago_cancelado, name='pago-cancelado'),
    path('pago/verificar/<int:factura_id>/', views.verificar_estado_pago, name='verificar-estado-pago'),
    
    # === WEBHOOK STRIPE ===
    path('webhook/stripe/', views.webhook_stripe, name='webhook-stripe'),
    
    # === CRUD FACTURAS ===
    path('', views.listar_facturas, name='listar-facturas'),
    path('<int:pk>/', views.obtener_factura, name='obtener-factura'),
    path('usuario/<int:usuario_id>/', views.obtener_facturas_usuario, name='facturas-usuario'),
    path('mis-facturas/', views.obtener_mis_facturas, name='mis-facturas'),
    
    # === FACTURA MANUAL ===
    path('crear-manual/', views.crear_factura_manual, name='crear-factura-manual'),
    path('verificar-pedido/<int:pedido_id>/', views.verificar_pedido, name='verificar-pedido'),
    # === ELIMINACIÓN Y RESTAURACIÓN ===
    path('<int:pk>/eliminar/', views.eliminar_factura, name='eliminar-factura'),
    path('<int:pk>/restaurar/', views.restaurar_factura, name='restaurar-factura'),
]
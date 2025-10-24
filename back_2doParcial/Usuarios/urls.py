from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('usuarios/', views.listar_usuarios, name='listar-usuarios'),
    path('usuarios/crear/', views.crear_usuario, name='crear-usuario'),
    path('usuarios/<int:pk>/', views.obtener_usuario, name='obtener-usuario'),
    path('usuarios/<int:pk>/editar/', views.editar_usuario, name='editar-usuario'),
    path('usuarios/<int:pk>/eliminar/', views.eliminar_usuario, name='eliminar-usuario'),
]
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Empleado
from .serializers import EmpleadoSerializer, EmpleadoCreateSerializer

# GET /api/empleados/ - Listar empleados activos (PROTEGIDA)
@api_view(['GET'])
def listar_empleados(request):
    """Listar solo empleados activos"""
    empleados = Empleado.objects.filter(estado=True)
    serializer = EmpleadoSerializer(empleados, many=True)
    return Response(serializer.data)


# GET /api/empleados/todos/ - Listar todos los empleados incluyendo inactivos (PROTEGIDA)
@api_view(['GET'])
def listar_todos_empleados(request):
    """Listar todos los empleados (activos e inactivos)"""
    empleados = Empleado.objects.all()
    serializer = EmpleadoSerializer(empleados, many=True)
    return Response(serializer.data)


# POST /api/empleados/ - Crear empleado con usuario (PROTEGIDA) - CON TRANSACCIÓN
@api_view(['POST'])
def crear_empleado(request):
    """Crear empleado con usuario asociado (transacción atómica)"""
    serializer = EmpleadoCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            empleado = serializer.save()
            response_serializer = EmpleadoSerializer(empleado)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Error al crear empleado: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# POST /api/empleados/simple/ - Crear empleado con usuario existente (PROTEGIDA)
@api_view(['POST'])
def crear_empleado_simple(request):
    """Crear empleado asociado a usuario existente"""
    serializer = EmpleadoSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            empleado = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# GET /api/empleados/{id}/ - Obtener empleado específico (PROTEGIDA)
@api_view(['GET'])
def obtener_empleado(request, pk):
    try:
        empleado = Empleado.objects.get(pk=pk, estado=True)
        serializer = EmpleadoSerializer(empleado)
        return Response(serializer.data)
    except Empleado.DoesNotExist:
        return Response(
            {'error': 'Empleado no encontrado o inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# PUT /api/empleados/{id}/ - Actualizar empleado (PROTEGIDA)
@api_view(['PUT'])
def actualizar_empleado(request, pk):
    try:
        empleado = Empleado.objects.get(pk=pk, estado=True)
    except Empleado.DoesNotExist:
        return Response(
            {'error': 'Empleado no encontrado o inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # No permitir cambiar el usuario en la actualización
    data = request.data.copy()
    if 'username' in data:
        data.pop('username')  # No permitir cambiar el usuario
    
    serializer = EmpleadoSerializer(empleado, data=data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/empleados/{id}/ - Eliminación lógica (PROTEGIDA)
@api_view(['DELETE'])
def eliminar_empleado(request, pk):
    try:
        empleado = Empleado.objects.get(pk=pk, estado=True)
        empleado.delete()  # Usa el método sobrescrito que hace eliminación lógica
        return Response(
            {'message': 'Empleado eliminado correctamente (eliminación lógica)'}, 
            status=status.HTTP_200_OK
        )
    except Empleado.DoesNotExist:
        return Response(
            {'error': 'Empleado no encontrado o ya está inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# POST /api/empleados/{id}/restaurar/ - Restaurar empleado (PROTEGIDA)
@api_view(['POST'])
def restaurar_empleado(request, pk):
    try:
        empleado = Empleado.objects.get(pk=pk, estado=False)
        empleado.restaurar()
        serializer = EmpleadoSerializer(empleado)
        return Response(
            {
                'message': 'Empleado restaurado correctamente',
                'empleado': serializer.data
            }, 
            status=status.HTTP_200_OK
        )
    except Empleado.DoesNotExist:
        return Response(
            {'error': 'Empleado no encontrado o ya está activo'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# GET /api/empleados/buscar/?ci=12345 - Buscar por CI (PROTEGIDA)
@api_view(['GET'])
def buscar_empleado_por_ci(request):
    ci = request.query_params.get('ci', None)
    
    if not ci:
        return Response(
            {'error': 'Parámetro CI requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        empleado = Empleado.objects.get(ci=ci, estado=True)
        serializer = EmpleadoSerializer(empleado)
        return Response(serializer.data)
    except Empleado.DoesNotExist:
        return Response(
            {'error': 'Empleado no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# GET /api/empleados/rol/{rol}/ - Listar por rol (PROTEGIDA)
@api_view(['GET'])
def listar_empleados_por_rol(request, rol):
    empleados = Empleado.objects.filter(rol=rol, estado=True)
    serializer = EmpleadoSerializer(empleados, many=True)
    return Response(serializer.data)
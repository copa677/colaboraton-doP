from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Cliente
from .serializers import ClienteSerializer, ClienteCreateSerializer

# GET /api/clientes/listar/ - Listar clientes activos (PROTEGIDA)
@api_view(['GET'])
def listar_clientes(request):
    clientes = Cliente.objects.filter(estado=True)
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)


# GET /api/clientes/todos/ - Listar todos los clientes, activos e inactivos (PROTEGIDA)
@api_view(['GET'])
def listar_todos_clientes(request):
    clientes = Cliente.objects.all()
    serializer = ClienteSerializer(clientes, many=True)
    return Response(serializer.data)


# GET /api/clientes/{id}/ - Obtener cliente específico (PROTEGIDA)
@api_view(['GET'])
def obtener_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk, estado=True)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado o inactivo'}, status=status.HTTP_404_NOT_FOUND)


# POST /api/clientes/crear/ - Crear cliente con usuario (PROTEGIDA) - ÚNICO MÉTODO DE CREACIÓN
@api_view(['POST'])
def crear_cliente(request):
    """Crear cliente con usuario asociado (transacción atómica)"""
    serializer = ClienteCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            cliente = serializer.save()
            response_serializer = ClienteSerializer(cliente)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Error al crear cliente: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /api/clientes/{id}/actualizar/ - Actualizar cliente (PROTEGIDA)
@api_view(['PUT'])
def actualizar_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk, estado=True)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado o inactivo'}, status=status.HTTP_404_NOT_FOUND)

    # No permitir cambiar el usuario en la actualización
    serializer = ClienteSerializer(cliente, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/clientes/{id}/eliminar/ - Eliminación lógica (PROTEGIDA)
@api_view(['DELETE'])
def eliminar_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk, estado=True)
        cliente.delete()  # eliminación lógica
        return Response({'message': 'Cliente eliminado correctamente (eliminación lógica)'}, status=status.HTTP_200_OK)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado o ya inactivo'}, status=status.HTTP_404_NOT_FOUND)


# POST /api/clientes/{id}/restaurar/ - Restaurar cliente eliminado (PROTEGIDA)
@api_view(['POST'])
def restaurar_cliente(request, pk):
    try:
        cliente = Cliente.objects.get(pk=pk, estado=False)
        cliente.restaurar()
        serializer = ClienteSerializer(cliente)
        return Response({'message': 'Cliente restaurado correctamente', 'cliente': serializer.data}, status=status.HTTP_200_OK)
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado o ya activo'}, status=status.HTTP_404_NOT_FOUND)


# GET /api/clientes/buscar/?ci=12345 - Buscar por CI (PROTEGIDA)
@api_view(['GET'])
def buscar_cliente_por_ci(request):
    ci = request.query_params.get('ci', None)
    
    if not ci:
        return Response(
            {'error': 'Parámetro CI requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        cliente = Cliente.objects.get(ci=ci, estado=True)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)
    except Cliente.DoesNotExist:
        return Response(
            {'error': 'Cliente no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# GET /api/clientes/buscar/?telefono=12345678 - Buscar por teléfono (PROTEGIDA)
@api_view(['GET'])
def buscar_cliente_por_telefono(request):
    telefono = request.query_params.get('telefono', None)
    
    if not telefono:
        return Response(
            {'error': 'Parámetro teléfono requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        cliente = Cliente.objects.get(telefono=telefono, estado=True)
        serializer = ClienteSerializer(cliente)
        return Response(serializer.data)
    except Cliente.DoesNotExist:
        return Response(
            {'error': 'Cliente no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
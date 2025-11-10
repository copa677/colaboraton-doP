from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Marca
from .serializers import MarcaSerializer

# GET /api/marcas/ - Listar marcas activas
@api_view(['GET'])
def listar_marcas(request):
    """Listar solo marcas activas"""
    marcas = Marca.objects.filter(estado=True)
    serializer = MarcaSerializer(marcas, many=True)
    return Response(serializer.data)


# GET /api/marcas/todos/ - Listar todas las marcas
@api_view(['GET'])
def listar_todas_marcas(request):
    """Listar todas las marcas (activas e inactivas)"""
    marcas = Marca.objects.all()
    serializer = MarcaSerializer(marcas, many=True)
    return Response(serializer.data)


# GET /api/marcas/{id}/ - Obtener marca específica
@api_view(['GET'])
def obtener_marca(request, pk):
    try:
        marca = Marca.objects.get(pk=pk, estado=True)
        serializer = MarcaSerializer(marca)
        return Response(serializer.data)
    except Marca.DoesNotExist:
        return Response(
            {'error': 'Marca no encontrada o inactiva'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# POST /api/marcas/crear/ - Crear marca
@api_view(['POST'])
def crear_marca(request):
    serializer = MarcaSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /api/marcas/{id}/actualizar/ - Actualizar marca
@api_view(['PUT'])
def actualizar_marca(request, pk):
    try:
        marca = Marca.objects.get(pk=pk, estado=True)
    except Marca.DoesNotExist:
        return Response(
            {'error': 'Marca no encontrada o inactiva'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = MarcaSerializer(marca, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/marcas/{id}/eliminar/ - Eliminación lógica
@api_view(['DELETE'])
def eliminar_marca(request, pk):
    try:
        marca = Marca.objects.get(pk=pk, estado=True)
        marca.delete()  # Eliminación lógica
        return Response(
            {'message': 'Marca eliminada correctamente (eliminación lógica)'}, 
            status=status.HTTP_200_OK
        )
    except Marca.DoesNotExist:
        return Response(
            {'error': 'Marca no encontrada o ya está inactiva'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# POST /api/marcas/{id}/restaurar/ - Restaurar marca
@api_view(['POST'])
def restaurar_marca(request, pk):
    try:
        marca = Marca.objects.get(pk=pk, estado=False)
        marca.restaurar()
        serializer = MarcaSerializer(marca)
        return Response(
            {
                'message': 'Marca restaurada correctamente',
                'marca': serializer.data
            }, 
            status=status.HTTP_200_OK
        )
    except Marca.DoesNotExist:
        return Response(
            {'error': 'Marca no encontrada o ya está activa'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# GET /api/marcas/buscar/?nombre=texto - Buscar por nombre
@api_view(['GET'])
def buscar_marca_por_nombre(request):
    nombre = request.query_params.get('nombre', None)
    
    if not nombre:
        return Response(
            {'error': 'Parámetro nombre requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    marcas = Marca.objects.filter(
        nombre__icontains=nombre, 
        estado=True
    )
    serializer = MarcaSerializer(marcas, many=True)
    return Response(serializer.data)
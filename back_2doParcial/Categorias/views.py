from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Categoria
from .serializers import CategoriaSerializer

# GET /api/categorias/ - Listar categorías activas
@api_view(['GET'])
def listar_categorias(request):
    """Listar solo categorías activas"""
    categorias = Categoria.objects.filter(estado=True)
    serializer = CategoriaSerializer(categorias, many=True)
    return Response(serializer.data)


# GET /api/categorias/todos/ - Listar todas las categorías
@api_view(['GET'])
def listar_todas_categorias(request):
    """Listar todas las categorías (activas e inactivas)"""
    categorias = Categoria.objects.all()
    serializer = CategoriaSerializer(categorias, many=True)
    return Response(serializer.data)


# GET /api/categorias/{id}/ - Obtener categoría específica
@api_view(['GET'])
def obtener_categoria(request, pk):
    try:
        categoria = Categoria.objects.get(pk=pk, estado=True)
        serializer = CategoriaSerializer(categoria)
        return Response(serializer.data)
    except Categoria.DoesNotExist:
        return Response(
            {'error': 'Categoría no encontrada o inactiva'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# POST /api/categorias/crear/ - Crear categoría
@api_view(['POST'])
def crear_categoria(request):
    serializer = CategoriaSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /api/categorias/{id}/actualizar/ - Actualizar categoría
@api_view(['PUT'])
def actualizar_categoria(request, pk):
    try:
        categoria = Categoria.objects.get(pk=pk, estado=True)
    except Categoria.DoesNotExist:
        return Response(
            {'error': 'Categoría no encontrada o inactiva'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = CategoriaSerializer(categoria, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/categorias/{id}/eliminar/ - Eliminación lógica
@api_view(['DELETE'])
def eliminar_categoria(request, pk):
    try:
        categoria = Categoria.objects.get(pk=pk, estado=True)
        categoria.delete()  # Eliminación lógica
        return Response(
            {'message': 'Categoría eliminada correctamente (eliminación lógica)'}, 
            status=status.HTTP_200_OK
        )
    except Categoria.DoesNotExist:
        return Response(
            {'error': 'Categoría no encontrada o ya está inactiva'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# POST /api/categorias/{id}/restaurar/ - Restaurar categoría
@api_view(['POST'])
def restaurar_categoria(request, pk):
    try:
        categoria = Categoria.objects.get(pk=pk, estado=False)
        categoria.restaurar()
        serializer = CategoriaSerializer(categoria)
        return Response(
            {
                'message': 'Categoría restaurada correctamente',
                'categoria': serializer.data
            }, 
            status=status.HTTP_200_OK
        )
    except Categoria.DoesNotExist:
        return Response(
            {'error': 'Categoría no encontrada o ya está activa'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# GET /api/categorias/buscar/?descripcion=texto - Buscar por descripción
@api_view(['GET'])
def buscar_categoria_por_descripcion(request):
    descripcion = request.query_params.get('descripcion', None)
    
    if not descripcion:
        return Response(
            {'error': 'Parámetro descripción requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    categorias = Categoria.objects.filter(
        descripcion__icontains=descripcion, 
        estado=True
    )
    serializer = CategoriaSerializer(categorias, many=True)
    return Response(serializer.data)
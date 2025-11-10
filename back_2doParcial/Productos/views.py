from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Producto, Especificacion, Inventario
from .serializers import (
    ProductoSerializer, ProductoCreateSerializer,
    EspecificacionSerializer, EspecificacionCreateSerializer,
    InventarioSerializer, InventarioCreateSerializer
)
from .models import ImagenProducto
from .serializers import (ImagenProductoSerializer, ImagenProductoCreateSerializer)


# =========================================================================
# VISTAS PARA IMÁGENES DE PRODUCTOS
# =========================================================================

@api_view(['GET'])
def listar_imagenes_producto(request, producto_id):
    """Listar todas las imágenes de un producto"""
    imagenes = ImagenProducto.objects.filter(producto_id=producto_id, estado=True)
    serializer = ImagenProductoSerializer(imagenes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def crear_imagen_producto(request):
    """Subir nueva imagen para un producto"""
    serializer = ImagenProductoCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        imagen_producto = serializer.save()
        response_serializer = ImagenProductoSerializer(imagen_producto)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def actualizar_imagen_producto(request, pk):
    """Actualizar información de una imagen (ej: marcar como principal)"""
    try:
        imagen_producto = ImagenProducto.objects.get(pk=pk, estado=True)
    except ImagenProducto.DoesNotExist:
        return Response({'error': 'Imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ImagenProductoSerializer(imagen_producto, data=request.data, partial=True)
    
    if serializer.is_valid():
        # Si se marca como principal, desmarcar otras
        if request.data.get('es_principal'):
            ImagenProducto.objects.filter(
                producto=imagen_producto.producto,
                es_principal=True,
                estado=True
            ).exclude(id=pk).update(es_principal=False)
        
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def eliminar_imagen_producto(request, pk):
    """Eliminación lógica de imagen"""
    try:
        imagen_producto = ImagenProducto.objects.get(pk=pk, estado=True)
        imagen_producto.delete()
        return Response({'message': 'Imagen eliminada correctamente'}, status=status.HTTP_200_OK)
    except ImagenProducto.DoesNotExist:
        return Response({'error': 'Imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def restaurar_imagen_producto(request, pk):
    """Restaurar imagen eliminada"""
    try:
        imagen_producto = ImagenProducto.objects.get(pk=pk, estado=False)
        imagen_producto.restaurar()
        serializer = ImagenProductoSerializer(imagen_producto)
        return Response({
            'message': 'Imagen restaurada correctamente',
            'imagen': serializer.data
        })
    except ImagenProducto.DoesNotExist:
        return Response({'error': 'Imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def marcar_imagen_principal(request, pk):
    """Marcar una imagen como principal"""
    try:
        imagen_producto = ImagenProducto.objects.get(pk=pk, estado=True)
        
        # Desmarcar todas las otras imágenes como principales
        ImagenProducto.objects.filter(
            producto=imagen_producto.producto,
            es_principal=True,
            estado=True
        ).exclude(id=pk).update(es_principal=False)
        
        # Marcar esta imagen como principal
        imagen_producto.es_principal = True
        imagen_producto.save()
        
        serializer = ImagenProductoSerializer(imagen_producto)
        return Response({
            'message': 'Imagen marcada como principal',
            'imagen': serializer.data
        })
    except ImagenProducto.DoesNotExist:
        return Response({'error': 'Imagen no encontrada'}, status=status.HTTP_404_NOT_FOUND)

# =========================================================================
# VISTAS PARA ESPECIFICACIONES
# =========================================================================

@api_view(['GET'])
def listar_especificaciones(request):
    especificaciones = Especificacion.objects.filter(estado=True)
    serializer = EspecificacionSerializer(especificaciones, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def listar_especificaciones_producto(request, producto_id):
    especificaciones = Especificacion.objects.filter(producto_id=producto_id, estado=True)
    serializer = EspecificacionSerializer(especificaciones, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def crear_especificacion(request):
    serializer = EspecificacionCreateSerializer(data=request.data)
    if serializer.is_valid():
        especificacion = serializer.save()
        response_serializer = EspecificacionSerializer(especificacion)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def actualizar_especificacion(request, pk):
    try:
        especificacion = Especificacion.objects.get(pk=pk, estado=True)
    except Especificacion.DoesNotExist:
        return Response({'error': 'Especificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = EspecificacionSerializer(especificacion, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def eliminar_especificacion(request, pk):
    try:
        especificacion = Especificacion.objects.get(pk=pk, estado=True)
        especificacion.delete()
        return Response({'message': 'Especificación eliminada correctamente'}, status=status.HTTP_200_OK)
    except Especificacion.DoesNotExist:
        return Response({'error': 'Especificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def restaurar_especificacion(request, pk):
    try:
        especificacion = Especificacion.objects.get(pk=pk, estado=False)
        especificacion.restaurar()
        serializer = EspecificacionSerializer(especificacion)
        return Response({'message': 'Especificación restaurada', 'especificacion': serializer.data})
    except Especificacion.DoesNotExist:
        return Response({'error': 'Especificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)

# =========================================================================
# VISTAS PARA INVENTARIO
# =========================================================================

@api_view(['GET'])
def listar_inventarios(request):
    inventarios = Inventario.objects.filter(estado=True)
    serializer = InventarioSerializer(inventarios, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def obtener_inventario_producto(request, producto_id):
    try:
        inventario = Inventario.objects.get(producto_id=producto_id, estado=True)
        serializer = InventarioSerializer(inventario)
        return Response(serializer.data)
    except Inventario.DoesNotExist:
        return Response({'error': 'Inventario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def crear_inventario(request):
    serializer = InventarioCreateSerializer(data=request.data)
    if serializer.is_valid():
        inventario = serializer.save()
        response_serializer = InventarioSerializer(inventario)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def actualizar_inventario(request, pk):
    try:
        inventario = Inventario.objects.get(pk=pk, estado=True)
    except Inventario.DoesNotExist:
        return Response({'error': 'Inventario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = InventarioSerializer(inventario, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def eliminar_inventario(request, pk):
    try:
        inventario = Inventario.objects.get(pk=pk, estado=True)
        inventario.delete()
        return Response({'message': 'Inventario eliminado correctamente'}, status=status.HTTP_200_OK)
    except Inventario.DoesNotExist:
        return Response({'error': 'Inventario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def restaurar_inventario(request, pk):
    try:
        inventario = Inventario.objects.get(pk=pk, estado=False)
        inventario.restaurar()
        serializer = InventarioSerializer(inventario)
        return Response({'message': 'Inventario restaurado', 'inventario': serializer.data})
    except Inventario.DoesNotExist:
        return Response({'error': 'Inventario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

# =========================================================================
# VISTAS PARA PRODUCTOS
# =========================================================================
# GET /api/productos/ - Listar productos activos
@api_view(['GET'])
def listar_productos(request):
    """Listar solo productos activos"""
    productos = Producto.objects.filter(estado=True)
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)


# GET /api/productos/todos/ - Listar todos los productos
@api_view(['GET'])
def listar_todos_productos(request):
    """Listar todos los productos (activos e inactivos)"""
    productos = Producto.objects.all()
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)


# GET /api/productos/{id}/ - Obtener producto específico
@api_view(['GET'])
def obtener_producto(request, pk):
    try:
        producto = Producto.objects.get(pk=pk, estado=True)
        serializer = ProductoSerializer(producto)
        return Response(serializer.data)
    except Producto.DoesNotExist:
        return Response(
            {'error': 'Producto no encontrado o inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# POST /api/productos/crear/ - Crear producto
@api_view(['POST'])
def crear_producto(request):
    """Crear nuevo producto con validaciones de categoría y marca activas"""
    serializer = ProductoCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        producto = serializer.save()
        response_serializer = ProductoSerializer(producto)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# PUT /api/productos/{id}/actualizar/ - Actualizar producto
@api_view(['PUT'])
def actualizar_producto(request, pk):
    try:
        producto = Producto.objects.get(pk=pk, estado=True)
    except Producto.DoesNotExist:
        return Response(
            {'error': 'Producto no encontrado o inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ProductoSerializer(producto, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# DELETE /api/productos/{id}/eliminar/ - Eliminación lógica
@api_view(['DELETE'])
def eliminar_producto(request, pk):
    try:
        producto = Producto.objects.get(pk=pk, estado=True)
        producto.delete()  # Eliminación lógica
        return Response(
            {'message': 'Producto eliminado correctamente (eliminación lógica)'}, 
            status=status.HTTP_200_OK
        )
    except Producto.DoesNotExist:
        return Response(
            {'error': 'Producto no encontrado o ya está inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# POST /api/productos/{id}/restaurar/ - Restaurar producto
@api_view(['POST'])
def restaurar_producto(request, pk):
    try:
        producto = Producto.objects.get(pk=pk, estado=False)
        producto.restaurar()
        serializer = ProductoSerializer(producto)
        return Response(
            {
                'message': 'Producto restaurado correctamente',
                'producto': serializer.data
            }, 
            status=status.HTTP_200_OK
        )
    except Producto.DoesNotExist:
        return Response(
            {'error': 'Producto no encontrado o ya está activa'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# GET /api/productos/buscar/?q=texto - Búsqueda general
@api_view(['GET'])
def buscar_productos(request):
    query = request.query_params.get('q', None)
    
    if not query:
        return Response(
            {'error': 'Parámetro de búsqueda (q) requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    productos = Producto.objects.filter(
        Q(descripcion__icontains=query) |
        Q(categoria__descripcion__icontains=query) |
        Q(marca__nombre__icontains=query),
        estado=True
    )
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)


# GET /api/productos/categoria/{categoria_id}/ - Filtrar por categoría
@api_view(['GET'])
def listar_productos_por_categoria(request, categoria_id):
    productos = Producto.objects.filter(categoria_id=categoria_id, estado=True)
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)


# GET /api/productos/marca/{marca_id}/ - Filtrar por marca
@api_view(['GET'])
def listar_productos_por_marca(request, marca_id):
    productos = Producto.objects.filter(marca_id=marca_id, estado=True)
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)


# GET /api/productos/categoria/{categoria_id}/marca/{marca_id}/ - Filtrar por categoría y marca
@api_view(['GET'])
def listar_productos_por_categoria_marca(request, categoria_id, marca_id):
    productos = Producto.objects.filter(
        categoria_id=categoria_id, 
        marca_id=marca_id, 
        estado=True
    )
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)
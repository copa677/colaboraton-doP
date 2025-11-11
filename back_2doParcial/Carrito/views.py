from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Carrito, ItemCarrito, Pedido
from .serializers import (
    CarritoSerializer, ItemCarritoSerializer, ItemCarritoCreateSerializer,
    PedidoSerializer, PedidoCreateSerializer
)
from Usuarios.models import Usuario

# =========================================================================
# VISTAS PARA CARRITO
# =========================================================================

@api_view(['GET'])
def obtener_carrito_usuario(request, usuario_id):
    """Obtener carrito de un usuario específico"""
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        carrito, created = Carrito.objects.get_or_create(usuario=usuario, estado=True)
        serializer = CarritoSerializer(carrito)
        return Response(serializer.data)
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado o inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def crear_carrito(request):
    """Crear un nuevo carrito para un usuario"""
    usuario_id = request.data.get('usuario_id')
    
    if not usuario_id:
        return Response(
            {'error': 'usuario_id es requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        
        # Verificar si ya existe un carrito activo
        if Carrito.objects.filter(usuario=usuario).exists():
            return Response(
                {'error': 'El usuario ya tiene un carrito activo'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        carrito = Carrito.objects.create(usuario=usuario)
        serializer = CarritoSerializer(carrito)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado o inactivo'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
def eliminar_carrito(request, pk):
    """Eliminación lógica del carrito"""
    try:
        carrito = Carrito.objects.get(pk=pk, estado=True)
        carrito.eliminar()
        return Response(
            {'message': 'Carrito eliminado correctamente'}, 
            status=status.HTTP_200_OK
        )
    except Carrito.DoesNotExist:
        return Response(
            {'error': 'Carrito no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def vaciar_carrito(request, carrito_id):
    """Vaciar todos los items del carrito"""
    try:
        carrito = Carrito.objects.get(id=carrito_id, estado=True)
        carrito.vaciar_carrito()
        return Response(
            {'message': 'Carrito vaciado correctamente'}, 
            status=status.HTTP_200_OK
        )
    except Carrito.DoesNotExist:
        return Response(
            {'error': 'Carrito no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

# =========================================================================
# VISTAS PARA ITEMS DEL CARRITO
# =========================================================================

@api_view(['POST'])
def agregar_item_carrito(request, carrito_id):
    """Agregar item al carrito"""
    try:
        carrito = Carrito.objects.get(id=carrito_id, estado=True)
    except Carrito.DoesNotExist:
        return Response(
            {'error': 'Carrito no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = ItemCarritoCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        producto = serializer.validated_data['producto_id']
        cantidad = serializer.validated_data['cantidad']
        
        # Verificar si el producto ya está en el carrito
        item_existente = ItemCarrito.objects.filter(
            carrito=carrito, 
            producto=producto, 
            estado=True
        ).first()
        
        if item_existente:
            # Actualizar cantidad si ya existe
            item_existente.cantidad += cantidad
            item_existente.save()
            response_serializer = ItemCarritoSerializer(item_existente)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            # Crear nuevo item
            item = ItemCarrito.objects.create(
                carrito=carrito,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=producto.precio
            )
            response_serializer = ItemCarritoSerializer(item)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def actualizar_item_carrito(request, item_id):
    """Actualizar cantidad de un item en el carrito"""
    try:
        item = ItemCarrito.objects.get(id=item_id, estado=True)
    except ItemCarrito.DoesNotExist:
        return Response(
            {'error': 'Item no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    cantidad = request.data.get('cantidad')
    
    if not cantidad or int(cantidad) <= 0:
        return Response(
            {'error': 'La cantidad debe ser un número mayor a 0'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    item.cantidad = int(cantidad)
    item.save()
    
    serializer = ItemCarritoSerializer(item)
    return Response(serializer.data)

@api_view(['DELETE'])
def eliminar_item_carrito(request, item_id):
    """Eliminar item del carrito (eliminación lógica)"""
    try:
        item = ItemCarrito.objects.get(id=item_id, estado=True)
        item.eliminar()
        return Response(
            {'message': 'Item eliminado del carrito'}, 
            status=status.HTTP_200_OK
        )
    except ItemCarrito.DoesNotExist:
        return Response(
            {'error': 'Item no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def restaurar_item_carrito(request, item_id):
    """Restaurar item eliminado del carrito"""
    try:
        item = ItemCarrito.objects.get(id=item_id, estado=False)
        item.restaurar()
        serializer = ItemCarritoSerializer(item)
        return Response(
            {'message': 'Item restaurado', 'item': serializer.data}, 
            status=status.HTTP_200_OK
        )
    except ItemCarrito.DoesNotExist:
        return Response(
            {'error': 'Item no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

# =========================================================================
# VISTAS PARA PEDIDOS
# =========================================================================

@api_view(['POST'])
@transaction.atomic
def crear_pedido(request, carrito_id):
    """Crear un pedido a partir del carrito"""
    try:
        carrito = Carrito.objects.get(id=carrito_id, estado=True)
    except Carrito.DoesNotExist:
        return Response(
            {'error': 'Carrito no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verificar que el carrito tenga items
    if carrito.items.filter(estado=True).count() == 0:
        return Response(
            {'error': 'El carrito está vacío'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = PedidoCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        # Crear el pedido
        pedido = Pedido.objects.create(
            usuario=carrito.usuario,
            carrito=carrito,
            total=carrito.total,
            direccion_envio=serializer.validated_data['direccion_envio'],
            telefono_contacto=serializer.validated_data['telefono_contacto'],
            notas=serializer.validated_data.get('notas', '')
        )
        
        # Desactivar el carrito (ya fue convertido en pedido)
        carrito.estado = False
        carrito.save()
        
        response_serializer = PedidoSerializer(pedido)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def listar_pedidos_usuario(request, usuario_id):
    """Listar todos los pedidos de un usuario"""
    try:
        usuario = Usuario.objects.get(id=usuario_id, estado=True)
        pedidos = Pedido.objects.filter(usuario=usuario)
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def obtener_pedido(request, pedido_id):
    """Obtener un pedido específico"""
    try:
        pedido = Pedido.objects.get(id=pedido_id)
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data)
    except Pedido.DoesNotExist:
        return Response(
            {'error': 'Pedido no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['PUT'])
def actualizar_estado_pedido(request, pedido_id):
    """Actualizar estado de un pedido"""
    try:
        pedido = Pedido.objects.get(id=pedido_id)
    except Pedido.DoesNotExist:
        return Response(
            {'error': 'Pedido no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    nuevo_estado = request.data.get('estado')
    estados_permitidos = [choice[0] for choice in Pedido.ESTADOS_PEDIDO]
    
    if nuevo_estado not in estados_permitidos:
        return Response(
            {'error': f'Estado inválido. Estados permitidos: {", ".join(estados_permitidos)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    pedido.estado = nuevo_estado
    pedido.save()
    
    serializer = PedidoSerializer(pedido)
    return Response(serializer.data)

@api_view(['POST'])
def cancelar_pedido(request, pedido_id):
    """Cancelar un pedido"""
    try:
        pedido = Pedido.objects.get(id=pedido_id)
        pedido.cancelar()
        serializer = PedidoSerializer(pedido)
        return Response(
            {'message': 'Pedido cancelado', 'pedido': serializer.data}, 
            status=status.HTTP_200_OK
        )
    except Pedido.DoesNotExist:
        return Response(
            {'error': 'Pedido no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def listar_todos_pedidos(request):
    """Listar todos los pedidos (para administración)"""
    pedidos = Pedido.objects.all()
    serializer = PedidoSerializer(pedidos, many=True)
    return Response(serializer.data)
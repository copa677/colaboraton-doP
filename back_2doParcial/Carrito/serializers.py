from rest_framework import serializers
from .models import Carrito, ItemCarrito, Pedido
from Usuarios.models import Usuario
from Productos.models import Producto

class ItemCarritoSerializer(serializers.ModelSerializer):
    producto_descripcion = serializers.CharField(source='producto.descripcion', read_only=True)
    producto_precio = serializers.DecimalField(source='producto.precio', max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ItemCarrito
        fields = [
            'id',
            'producto',
            'producto_descripcion',
            'producto_precio',
            'cantidad',
            'precio_unitario',
            'subtotal',
            'estado',
            'fecha_agregado'
        ]
        read_only_fields = ['precio_unitario', 'estado', 'fecha_agregado']

class ItemCarritoCreateSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)

    def validate_producto_id(self, value):
        try:
            producto = Producto.objects.get(id=value, estado=True)
            return producto
        except Producto.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado o inactivo")

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0")
        return value

class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    cantidad_items = serializers.IntegerField(read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Carrito
        fields = [
            'id',
            'usuario',
            'usuario_username',
            'items',
            'total',
            'cantidad_items',
            'fecha_creacion',
            'fecha_actualizacion',
            'estado'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion', 'estado']

class PedidoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    carrito_items = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id',
            'usuario',
            'usuario_username',
            'carrito',
            'carrito_items',
            'total',
            'estado',
            'estado_display',
            'direccion_envio',
            'telefono_contacto',
            'notas',
            'fecha_creacion',
            'fecha_actualizacion'
        ]
        read_only_fields = ['total', 'fecha_creacion', 'fecha_actualizacion']

    def get_carrito_items(self, obj):
        items = obj.carrito.items.filter(estado=True)
        return ItemCarritoSerializer(items, many=True).data

class PedidoCreateSerializer(serializers.Serializer):
    direccion_envio = serializers.CharField()
    telefono_contacto = serializers.CharField(max_length=20)
    notas = serializers.CharField(required=False, allow_blank=True)

    def validate_telefono_contacto(self, value):
        if not value.strip():
            raise serializers.ValidationError("El teléfono de contacto es requerido")
        return value

    def validate_direccion_envio(self, value):
        if not value.strip():
            raise serializers.ValidationError("La dirección de envío es requerida")
        return value
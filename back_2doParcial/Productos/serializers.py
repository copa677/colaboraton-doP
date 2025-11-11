from rest_framework import serializers
from .models import Producto, Especificacion, Inventario
from Categorias.models import Categoria
from Marcas.models import Marca
from .models import ImagenProducto

class ImagenProductoSerializer(serializers.ModelSerializer):
    imagen_url = serializers.SerializerMethodField()
    producto_descripcion = serializers.CharField(source='producto.descripcion', read_only=True)
    
    class Meta:
        model = ImagenProducto
        fields = [
            'id',
            'imagen',
            'imagen_url',
            'producto',
            'producto_descripcion',
            'es_principal',
            'estado',
            'fecha_creacion'
        ]
        read_only_fields = ['estado', 'fecha_creacion']

    def get_imagen_url(self, obj):
        return obj.imagen.url if obj.imagen else None

class ImagenProductoCreateSerializer(serializers.Serializer):
    imagen = serializers.ImageField()
    producto_id = serializers.IntegerField()
    es_principal = serializers.BooleanField(default=False)

    def validate_producto_id(self, value):
        try:
            producto = Producto.objects.get(id=value, estado=True)
            return producto
        except Producto.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado o inactivo")

    def create(self, validated_data):
        # Si se marca como principal, desmarcar otras imágenes principales
        if validated_data.get('es_principal'):
            ImagenProducto.objects.filter(
                producto=validated_data['producto_id'],
                es_principal=True,
                estado=True
            ).update(es_principal=False)
        
        return ImagenProducto.objects.create(
            imagen=validated_data['imagen'],
            producto=validated_data['producto_id'],
            es_principal=validated_data.get('es_principal', False)
        )

# Serializers para Especificaciones
class EspecificacionSerializer(serializers.ModelSerializer):
    producto_descripcion = serializers.CharField(source='producto.descripcion', read_only=True)
    
    class Meta:
        model = Especificacion
        fields = [
            'id',
            'nombre',
            'descripcion',
            'producto',
            'producto_descripcion',
            'estado'
        ]
        read_only_fields = ['estado']

class EspecificacionCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    descripcion = serializers.CharField()
    producto_id = serializers.IntegerField()

    def validate_producto_id(self, value):
        try:
            producto = Producto.objects.get(id=value, estado=True)
            return producto
        except Producto.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado o inactivo")

    def create(self, validated_data):
        return Especificacion.objects.create(
            nombre=validated_data['nombre'],
            descripcion=validated_data['descripcion'],
            producto=validated_data['producto_id']
        )

# Serializers para Inventario
class InventarioSerializer(serializers.ModelSerializer):
    producto_descripcion = serializers.CharField(source='producto.descripcion', read_only=True)
    
    class Meta:
        model = Inventario
        fields = [
            'id',
            'cantidad',
            'ubicacion',
            'producto',
            'producto_descripcion',
            'estado',
            'fecha_actualizacion'
        ]
        read_only_fields = ['estado', 'fecha_actualizacion']

class InventarioCreateSerializer(serializers.Serializer):
    cantidad = serializers.IntegerField()
    ubicacion = serializers.CharField(max_length=100)
    producto_id = serializers.IntegerField()

    def validate_producto_id(self, value):
        try:
            producto = Producto.objects.get(id=value, estado=True)
            return producto
        except Producto.DoesNotExist:
            raise serializers.ValidationError("Producto no encontrado o inactivo")

    def validate(self, data):
        # No validar existencia, permitir crear o actualizar
        return data

    def create(self, validated_data):
        producto = validated_data['producto_id']
        cantidad = validated_data['cantidad']
        ubicacion = validated_data['ubicacion']
        
        # Verificar si ya existe inventario para este producto
        try:
            inventario_existente = Inventario.objects.get(
                producto=producto, 
                estado=True
            )
            # Si existe, actualizar la cantidad sumando
            inventario_existente.cantidad += cantidad
            inventario_existente.ubicacion = ubicacion  # Opcional: actualizar ubicación
            inventario_existente.save()
            return inventario_existente
            
        except Inventario.DoesNotExist:
            # Si no existe, crear nuevo
            return Inventario.objects.create(
                cantidad=cantidad,
                ubicacion=ubicacion,
                producto=producto
            )

# Serializers para Producto 
class ProductoSerializer(serializers.ModelSerializer):
    nombre_categoria = serializers.CharField(source='categoria.descripcion', read_only=True)
    nombre_marca = serializers.CharField(source='marca.nombre', read_only=True)
    especificaciones = EspecificacionSerializer(many=True, read_only=True)
    inventario = InventarioSerializer(read_only=True)  # ← Agregar esto
    imagenes = ImagenProductoSerializer(many=True, read_only=True)  # ← Y esto
    
    class Meta:
        model = Producto
        fields = [
            'id', 'descripcion', 'precio', 'categoria', 'nombre_categoria',
            'marca', 'nombre_marca', 'especificaciones', 'inventario', 'imagenes',
            'estado', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['estado', 'fecha_creacion', 'fecha_actualizacion']

class ProductoCreateSerializer(serializers.Serializer):
    descripcion = serializers.CharField(max_length=255)
    precio = serializers.DecimalField(max_digits=10, decimal_places=2)
    categoria_id = serializers.IntegerField()
    marca_id = serializers.IntegerField()

    def validate_categoria_id(self, value):
        try:
            categoria = Categoria.objects.get(id=value, estado=True)
            return categoria
        except Categoria.DoesNotExist:
            raise serializers.ValidationError("Categoría no encontrada o inactiva")

    def validate_marca_id(self, value):
        try:
            marca = Marca.objects.get(id=value, estado=True)
            return marca
        except Marca.DoesNotExist:
            raise serializers.ValidationError("Marca no encontrada o inactiva")

    def validate(self, data):
        descripcion = data.get('descripcion')
        categoria = data.get('categoria_id')
        marca = data.get('marca_id')

        if Producto.objects.filter(
            descripcion__iexact=descripcion,
            categoria=categoria,
            marca=marca,
            estado=True
        ).exists():
            raise serializers.ValidationError(
                "Ya existe un producto activo con esta descripción, categoría y marca"
            )
        return data

    def validate_precio(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo")
        if value > 9999999.99:
            raise serializers.ValidationError("El precio excede el límite permitido")
        return value

    def create(self, validated_data):
        return Producto.objects.create(
            descripcion=validated_data['descripcion'],
            precio=validated_data['precio'],
            categoria=validated_data['categoria_id'],
            marca=validated_data['marca_id']
        )
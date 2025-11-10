from rest_framework import serializers
from django.db import transaction
from .models import Cliente
from Usuarios.models import Usuario

class ClienteSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_correo = serializers.CharField(source='usuario.correo', read_only=True)

    class Meta:
        model = Cliente
        fields = [
            'id',
            'usuario',
            'usuario_username',
            'usuario_correo',
            'nombre_completo',
            'telefono',
            'direccion',
            'ci',
            'fecha_registro',
            'estado'
        ]
        read_only_fields = ['fecha_registro', 'estado', 'usuario']

    def validate_ci(self, value):
        cliente_id = self.instance.id if self.instance else None
        if Cliente.objects.filter(ci=value, estado=True).exclude(id=cliente_id).exists():
            raise serializers.ValidationError("Ya existe un cliente activo con este CI")
        return value

    def validate_telefono(self, value):
        cliente_id = self.instance.id if self.instance else None
        if Cliente.objects.filter(telefono=value, estado=True).exclude(id=cliente_id).exists():
            raise serializers.ValidationError("Ya existe un cliente activo con este teléfono")
        return value

class ClienteCreateSerializer(serializers.Serializer):
    """Serializer para crear cliente con usuario asociado - CON TRANSACCIÓN"""
    # Datos del usuario
    username = serializers.CharField(max_length=50)
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    tipo_usuario = serializers.CharField(max_length=20, default='cliente')

    # Datos del cliente
    nombre_completo = serializers.CharField(max_length=150)
    telefono = serializers.CharField(max_length=20)
    direccion = serializers.CharField()
    ci = serializers.CharField(max_length=20)
    
    def validate_username(self, value):
        if Usuario.objects.filter(username=value, estado=True).exists():
            raise serializers.ValidationError("Este username ya está en uso")
        return value

    def validate_correo(self, value):
        if Usuario.objects.filter(correo=value, estado=True).exists():
            raise serializers.ValidationError("Este correo ya está en uso")
        return value

    def validate_ci(self, value):
        if Cliente.objects.filter(ci=value, estado=True).exists():
            raise serializers.ValidationError("Ya existe un cliente activo con este CI")
        return value

    def validate_telefono(self, value):
        if Cliente.objects.filter(telefono=value, estado=True).exists():
            raise serializers.ValidationError("Ya existe un cliente activo con este teléfono")
        return value

    @transaction.atomic
    def create(self, validated_data):
        # Extraer datos de usuario
        user_data = {
            'username': validated_data['username'],
            'correo': validated_data['correo'],
            'password': validated_data['password'],
            'tipo_usuario': validated_data.get('tipo_usuario', 'cliente')
        }

        # Extraer datos de cliente
        cliente_data = {
            'nombre_completo': validated_data['nombre_completo'],
            'telefono': validated_data['telefono'],
            'direccion': validated_data['direccion'],
            'ci': validated_data['ci']
        }

        # Crear usuario dentro de la transacción
        usuario = Usuario.objects.create(**user_data)

        # Crear cliente dentro de la transacción
        cliente = Cliente.objects.create(
            usuario=usuario,
            **cliente_data
        )

        return cliente
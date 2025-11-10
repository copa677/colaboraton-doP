from rest_framework import serializers
from django.db import transaction
from .models import Empleado
from Usuarios.models import Usuario

class EmpleadoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    usuario_correo = serializers.CharField(source='usuario.correo', read_only=True)
    username = serializers.CharField(write_only=True, required=True)  # Nuevo campo para buscar usuario
    
    class Meta:
        model = Empleado
        fields = [
            'id', 
            'usuario', 
            'username',  # Campo para escribir
            'usuario_username',  # Campo para leer
            'usuario_correo',
            'nombre_completo', 
            'telefono', 
            'ci', 
            'rol', 
            'direccion',
            'fecha_contratacion',
            'salario',
            'estado'
        ]
        read_only_fields = ['fecha_contratacion', 'estado', 'usuario']
    
    def validate_ci(self, value):
        empleado_id = self.instance.id if self.instance else None
        if Empleado.objects.filter(ci=value, estado=True).exclude(id=empleado_id).exists():
            raise serializers.ValidationError("Ya existe un empleado activo con este CI")
        return value
    
    def validate_username(self, value):
        # Verificar que el usuario existe y está activo
        if not Usuario.objects.filter(username=value, estado=True).exists():
            raise serializers.ValidationError("No existe un usuario activo con este username")
        return value
    
    def create(self, validated_data):
        # Extraer el username y buscar el usuario
        username = validated_data.pop('username')
        
        try:
            usuario = Usuario.objects.get(username=username, estado=True)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError({"username": "Usuario no encontrado o inactivo"})
        
        # Verificar que el usuario no tenga ya un empleado asociado
        if hasattr(usuario, 'empleado'):
            raise serializers.ValidationError({"username": "Este usuario ya tiene un empleado asociado"})
        
        # Crear el empleado con el usuario
        empleado = Empleado.objects.create(
            usuario=usuario,
            **validated_data
        )
        
        return empleado

class EmpleadoCreateSerializer(serializers.Serializer):
    """Serializer para crear empleado con usuario asociado - CON TRANSACCIÓN"""
    # Datos del usuario
    username = serializers.CharField(max_length=50)
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    tipo_usuario = serializers.CharField(max_length=20, default='empleado')
    
    # Datos del empleado
    nombre_completo = serializers.CharField(max_length=150)
    telefono = serializers.CharField(max_length=20)
    ci = serializers.CharField(max_length=20)
    rol = serializers.CharField(max_length=50)
    direccion = serializers.CharField()
    salario = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    
    def validate_username(self, value):
        if Usuario.objects.filter(username=value, estado=True).exists():
            raise serializers.ValidationError("Este username ya está en uso")
        return value
    
    def validate_correo(self, value):
        if Usuario.objects.filter(correo=value, estado=True).exists():
            raise serializers.ValidationError("Este correo ya está en uso")
        return value
    
    def validate_ci(self, value):
        if Empleado.objects.filter(ci=value, estado=True).exists():
            raise serializers.ValidationError("Ya existe un empleado activo con este CI")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        # Extraer datos de usuario
        user_data = {
            'username': validated_data['username'],
            'correo': validated_data['correo'],
            'password': validated_data['password'],
            'tipo_usuario': validated_data.get('tipo_usuario', 'empleado')
        }
        
        # Extraer datos de empleado
        empleado_data = {
            'nombre_completo': validated_data['nombre_completo'],
            'telefono': validated_data['telefono'],
            'ci': validated_data['ci'],
            'rol': validated_data['rol'],
            'direccion': validated_data['direccion'],
            'salario': validated_data.get('salario')
        }
        
        # Crear usuario dentro de la transacción
        usuario = Usuario.objects.create(**user_data)
        
        # Crear empleado dentro de la transacción
        empleado = Empleado.objects.create(
            usuario=usuario,
            **empleado_data
        )
        
        return empleado
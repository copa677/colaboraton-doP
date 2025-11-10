from rest_framework import serializers
from .models import Marca

class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = [
            'id',
            'nombre',
            'estado'
        ]
        read_only_fields = ['estado']

    def validate_nombre(self, value):
        """
        Validar que el nombre sea único entre marcas activas
        """
        marca_id = self.instance.id if self.instance else None
        if Marca.objects.filter(nombre__iexact=value, estado=True).exclude(id=marca_id).exists():
            raise serializers.ValidationError("Ya existe una marca activa con este nombre")
        return value
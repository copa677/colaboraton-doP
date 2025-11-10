from rest_framework import serializers
from .models import Categoria

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = [
            'id',
            'descripcion',
            'estado'
        ]
        read_only_fields = ['estado']

    def validate_descripcion(self, value):
        """
        Validar que la descripción sea única entre categorías activas
        """
        categoria_id = self.instance.id if self.instance else None
        if Categoria.objects.filter(descripcion__iexact=value, estado=True).exclude(id=categoria_id).exists():
            raise serializers.ValidationError("Ya existe una categoría activa con esta descripción")
        return value
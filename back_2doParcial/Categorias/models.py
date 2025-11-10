from django.db import models

class Categoria(models.Model):
    descripcion = models.CharField(max_length=255, unique=True)
    estado = models.BooleanField(default=True)  # Para eliminación lógica
    
    class Meta:
        db_table = 'categorias'
        ordering = ['id']
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'

    def delete(self, *args, **kwargs):
        """Eliminación lógica"""
        self.estado = False
        self.save()

    def restaurar(self):
        """Restaurar categoría eliminada"""
        self.estado = True
        self.save()

    def __str__(self):
        return self.descripcion
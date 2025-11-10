from django.db import models

class Marca(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    estado = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'marcas'
        ordering = ['id']
        verbose_name = 'Marca'
        verbose_name_plural = 'Marcas'

    def delete(self, *args, **kwargs):
        """Eliminación lógica"""
        self.estado = False
        self.save()

    def restaurar(self):
        """Restaurar marca eliminada"""
        self.estado = True
        self.save()

    def __str__(self):
        return self.nombre
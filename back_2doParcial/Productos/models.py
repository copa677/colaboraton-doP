from django.db import models
from Categorias.models import Categoria
from Marcas.models import Marca
from cloudinary.models import CloudinaryField # type: ignore

class Producto(models.Model):
    descripcion = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.PROTECT,
        related_name='productos'
    )
    marca = models.ForeignKey(
        Marca, 
        on_delete=models.PROTECT,
        related_name='productos'
    )
    estado = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'productos'
        ordering = ['-id']
        unique_together = ['descripcion', 'categoria', 'marca']

    def delete(self, *args, **kwargs):
        self.estado = False
        self.save()

    def restaurar(self):
        self.estado = True
        self.save()

    def __str__(self):
        return f"{self.descripcion} - {self.marca.nombre}"

class Especificacion(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='especificaciones'
    )
    estado = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'especificaciones'
        ordering = ['id']
        verbose_name = 'Especificación'
        verbose_name_plural = 'Especificaciones'

    def delete(self, *args, **kwargs):
        self.estado = False
        self.save()

    def restaurar(self):
        self.estado = True
        self.save()

    def __str__(self):
        return f"{self.nombre} - {self.producto.descripcion}"

class ImagenProducto(models.Model):
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='imagenes'
    )
    imagen = CloudinaryField(
        'imagen',
        folder='productos/',
        transformation=[
            {'width': 800, 'height': 600, 'crop': 'limit'},
            {'quality': 'auto:good'}
        ]
    )
    es_principal = models.BooleanField(default=False)
    estado = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'imagenes_productos'
        ordering = ['-es_principal', 'id']
        verbose_name = 'Imagen de Producto'
        verbose_name_plural = 'Imágenes de Productos'

    def delete(self, *args, **kwargs):
        self.estado = False
        self.save()

    def restaurar(self):
        self.estado = True
        self.save()

    def __str__(self):
        return f"Imagen - {self.producto.descripcion}"
    
class Inventario(models.Model):
    cantidad = models.IntegerField(default=0)
    ubicacion = models.CharField(max_length=100)
    producto = models.OneToOneField(
        Producto,
        on_delete=models.CASCADE,
        related_name='inventario'
    )
    estado = models.BooleanField(default=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inventario'
        ordering = ['id']
        verbose_name = 'Inventario'
        verbose_name_plural = 'Inventarios'

    def delete(self, *args, **kwargs):
        self.estado = False
        self.save()

    def restaurar(self):
        self.estado = True
        self.save()

    def __str__(self):
        return f"Inventario - {self.producto.descripcion} ({self.cantidad})"
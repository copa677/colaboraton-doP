from django.db import models
from Usuarios.models import Usuario
from Productos.models import Producto

class Carrito(models.Model):
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='carrito'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    estado = models.BooleanField(default=True)  # True = Activo, False = Abandonado/Comprado
    
    class Meta:
        db_table = 'carritos'
        ordering = ['-fecha_creacion']
        verbose_name = 'Carrito'
        verbose_name_plural = 'Carritos'

    def __str__(self):
        return f"Carrito de {self.usuario.username}"

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.filter(estado=True))

    @property
    def cantidad_items(self):
        return self.items.filter(estado=True).count()

    def vaciar_carrito(self):
        self.items.filter(estado=True).update(estado=False)

    def eliminar(self):
        """Eliminación lógica del carrito"""
        self.estado = False
        self.save()

class ItemCarrito(models.Model):
    carrito = models.ForeignKey(
        Carrito,
        on_delete=models.CASCADE,
        related_name='items'
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='carrito_items'
    )
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.BooleanField(default=True)
    fecha_agregado = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'items_carrito'
        ordering = ['-fecha_agregado']
        unique_together = ['carrito', 'producto', 'estado']
        verbose_name = 'Item de Carrito'
        verbose_name_plural = 'Items de Carrito'

    def __str__(self):
        return f"{self.cantidad} x {self.producto.descripcion}"

    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def eliminar(self):
        """Eliminación lógica del item"""
        self.estado = False
        self.save()

    def restaurar(self):
        """Restaurar item eliminado"""
        self.estado = True
        self.save()

class Pedido(models.Model):
    ESTADOS_PEDIDO = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('preparando', 'Preparando'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='pedidos'
    )
    carrito = models.OneToOneField(
        Carrito,
        on_delete=models.CASCADE,
        related_name='pedido'
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADOS_PEDIDO, default='pendiente')
    direccion_envio = models.TextField()
    telefono_contacto = models.CharField(max_length=20)
    notas = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pedidos'
        ordering = ['-fecha_creacion']
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'

    def __str__(self):
        return f"Pedido #{self.id} - {self.usuario.username}"

    def cancelar(self):
        self.estado = 'cancelado'
        self.save()
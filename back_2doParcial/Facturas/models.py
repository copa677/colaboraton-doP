from django.db import models
import uuid
from Usuarios.models import Usuario
from Carrito.models import Pedido

def generar_codigo_factura():
    """Función para generar código único de factura"""
    return f"FAC-{uuid.uuid4().hex[:8].upper()}"

class Factura(models.Model):
    ESTADOS_PAGO = [
        ('pendiente', 'Pendiente'),
        ('completado', 'Completado'),
        ('fallido', 'Fallido'),
        ('reembolsado', 'Reembolsado'),
    ]

    METODOS_PAGO = [
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia Bancaria'),
        ('qr', 'Pago QR'),
    ]

    # ID principal (usando el estándar de tu proyecto)
    id = models.AutoField(primary_key=True)
    
    # Relación con Pedido (adaptada a tu modelo)
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.PROTECT,
        related_name='facturas'
    )
    
    # Información de la factura
    cod_factura = models.CharField(
        max_length=100, 
        unique=True, 
        default=generar_codigo_factura  # ← FUNCIÓN REGULAR
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Campos Stripe
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True, null=True)
    estado_pago = models.CharField(max_length=20, choices=ESTADOS_PAGO, default='pendiente')
    metodo_pago = models.CharField(max_length=50, choices=METODOS_PAGO, blank=True, null=True)
    fecha_pago = models.DateTimeField(blank=True, null=True)
    
    # Datos del pago
    codigo_autorizacion = models.CharField(max_length=100, blank=True, null=True)
    ultimos_digitos_tarjeta = models.CharField(max_length=4, blank=True, null=True)
    tipo_tarjeta = models.CharField(max_length=50, blank=True, null=True)
    
    # Estado (siguiendo tu patrón de eliminación lógica)
    estado = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'facturas'
        ordering = ['-fecha_creacion']
        verbose_name = 'Factura'
        verbose_name_plural = 'Facturas'

    def delete(self, *args, **kwargs):
        """Eliminación lógica"""
        self.estado = False
        self.save()

    def restaurar(self):
        """Restaurar factura eliminada"""
        self.estado = True
        self.save()

    def __str__(self):
        return f"{self.cod_factura} - {self.pedido.usuario.username} - ${self.monto_total}"

    @property
    def fecha_vencimiento(self):
        """Calcula la fecha de vencimiento (30 días después de la creación)"""
        from datetime import timedelta
        if self.fecha_creacion:
            return self.fecha_creacion + timedelta(days=30)
        return None
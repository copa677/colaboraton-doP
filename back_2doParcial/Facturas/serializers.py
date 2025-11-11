from rest_framework import serializers
from .models import Factura
from Carrito.serializers import PedidoSerializer

class FacturaSerializer(serializers.ModelSerializer):
    # Campos relacionados
    pedido_info = PedidoSerializer(source='pedido', read_only=True)
    usuario_username = serializers.CharField(source='pedido.usuario.username', read_only=True)
    usuario_correo = serializers.CharField(source='pedido.usuario.correo', read_only=True)
    
    # Campos calculados y de presentación
    numero_factura = serializers.CharField(source='cod_factura', read_only=True)
    fecha_emision = serializers.DateTimeField(source='fecha_creacion', read_only=True)
    fecha_vencimiento = serializers.SerializerMethodField()
    estado_display = serializers.CharField(source='get_estado_pago_display', read_only=True)
    metodo_pago_display = serializers.CharField(source='get_metodo_pago_display', read_only=True)
    
    class Meta:
        model = Factura
        fields = [
            'id', 'pedido', 'pedido_info', 'usuario_username', 'usuario_correo',
            'numero_factura', 'cod_factura', 'fecha_emision', 'fecha_creacion', 
            'fecha_vencimiento', 'monto_total', 'stripe_payment_intent_id', 
            'stripe_checkout_session_id', 'estado_pago', 'estado_display',
            'metodo_pago', 'metodo_pago_display', 'fecha_pago', 'codigo_autorizacion', 
            'ultimos_digitos_tarjeta', 'tipo_tarjeta', 'estado'
        ]
        read_only_fields = [
            'id', 'cod_factura', 'fecha_creacion', 'stripe_payment_intent_id', 
            'stripe_checkout_session_id', 'estado_pago', 'metodo_pago', 'fecha_pago',
            'codigo_autorizacion', 'ultimos_digitos_tarjeta', 'tipo_tarjeta', 'estado'
        ]
    
    def get_fecha_vencimiento(self, obj):
        return obj.fecha_vencimiento

class FacturaCreateSerializer(serializers.Serializer):
    """Serializer para crear factura manual"""
    pedido_id = serializers.IntegerField()
    metodo_pago = serializers.ChoiceField(choices=Factura.METODOS_PAGO)
    monto_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate_pedido_id(self, value):
        from Carrito.models import Pedido
        try:
            pedido = Pedido.objects.get(id=value, estado=True)
            return pedido
        except Pedido.DoesNotExist:
            raise serializers.ValidationError("Pedido no encontrado o inactivo")

    def validate(self, data):
        pedido = data.get('pedido_id')
        monto_total = data.get('monto_total')
        
        # Si no se proporciona monto, usar el total del pedido
        if not monto_total:
            data['monto_total'] = pedido.total
        
        # Verificar que no exista factura pagada para este pedido
        if Factura.objects.filter(pedido=pedido, estado_pago='completado', estado=True).exists():
            raise serializers.ValidationError("Este pedido ya tiene una factura pagada")
        
        return data
import stripe # type: ignore
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Factura
from .serializers import FacturaSerializer, FacturaCreateSerializer
from Carrito.models import Pedido, ItemCarrito
from Productos.models import Producto , Inventario
from Usuarios.models import Usuario

# Configurar Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['GET'])
def verificar_pedido(request, pedido_id):
    """Verificar si un pedido existe y está listo para pago"""
    try:
        pedido = Pedido.objects.get(id=pedido_id)
        
        return Response({
            'existe': True,
            'pedido_id': pedido.id,
            'usuario': pedido.usuario.username,
            'estado': pedido.estado,
            'total': pedido.total,
            'carrito_id': pedido.carrito.id,
            'items_count': pedido.carrito.items.filter(estado=True).count(),
            'facturas_existentes': Factura.objects.filter(pedido=pedido).count()
        })
        
    except Pedido.DoesNotExist:
        return Response({
            'existe': False,
            'error': f'Pedido con ID {pedido_id} no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
# =========================================================================
# VISTAS DE PAGO CON STRIPE
# =========================================================================

@api_view(['POST'])
def crear_sesion_pago(request, pedido_id):
    """
    Crea una sesión de Stripe Checkout para un pedido
    """
    try:
        # 1. Verificar pedido
        pedido = get_object_or_404(Pedido, id=pedido_id)
        
        # 2. Verificar que no exista factura pagada para este pedido
        factura_pagada = Factura.objects.filter(
            pedido=pedido, 
            estado_pago__in=['completado'],
            estado=True
        ).first()
        
        if factura_pagada:
            return Response(
                {'error': 'Este pedido ya tiene un pago completado'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 3. Buscar factura pendiente existente o crear una nueva
        factura = Factura.objects.filter(
            pedido=pedido,
            estado_pago__in=['pendiente', 'fallido'],
            estado=True
        ).first()
        
        if not factura:
            factura = Factura.objects.create(
                pedido=pedido,
                monto_total=pedido.total
            )
        else:
            # Actualizar el monto por si cambió
            factura.monto_total = pedido.total
            factura.save()
        
        # 4. Obtener items del carrito para productos dinámicos
        items_carrito = ItemCarrito.objects.filter(carrito=pedido.carrito, estado=True)
        line_items = []
        
        for item in items_carrito:
            line_items.append({
                'price_data': {
                    'currency': 'usd',  # Cambiar según tu moneda
                    'product_data': {
                        'name': item.producto.descripcion,
                        'description': f"{item.producto.marca.nombre} - {item.producto.categoria.descripcion}",
                    },
                    'unit_amount': int(item.precio_unitario * 100),  # Stripe usa centavos
                },
                'quantity': item.cantidad,
            })
        
        # 5. Si no hay items, crear item genérico
        if not line_items:
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f"Pedido #{pedido.id}",
                        'description': f"Pedido de {pedido.usuario.username}",
                    },
                    'unit_amount': int(pedido.total * 100),
                },
                'quantity': 1,
            })

        success_url = f"{request.build_absolute_uri('/api/facturas/pago/exito/')}?session_id={{CHECKOUT_SESSION_ID}}&factura_id={factura.id}"

        cancel_url = f"{request.build_absolute_uri('/api/facturas/pago/cancelado/')}?factura_id={factura.id}"

        print(f"🔗 URL de éxito generada: {success_url}")
        print(f"🔗 URL de cancelación: {cancel_url}")

        # 6. Crear sesión de Stripe Checkout
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=pedido.usuario.correo,
            metadata={
                'factura_id': str(factura.id),
                'pedido_id': str(pedido_id),
            }
        )
        
        # 7. Actualizar factura con ID de sesión
        factura.stripe_checkout_session_id = checkout_session.id
        factura.save()
        
        return Response({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id,
            'factura_id': factura.id,
            'cod_factura': factura.cod_factura,
            'monto_total': float(factura.monto_total)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def pago_exitoso(request):
    """
    Callback para pagos exitosos - CON VACIADO DE CARRITO
    """
    try:
        session_id = request.GET.get('session_id')
        factura_id = request.GET.get('factura_id')
        
        print(f"🔍 Parámetros recibidos:")
        print(f"   session_id: {session_id}")
        print(f"   factura_id: {factura_id}")
        
        # Validar session_id
        if not session_id or session_id == '{CHECKOUT_SESSION_ID}':
            return Response(
                {'error': 'ID de sesión inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar sesión en Stripe
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            print(f"✅ Sesión Stripe: {session.id}, Estado: {session.payment_status}")
        except Exception as stripe_error:
            print(f"❌ Error al recuperar sesión Stripe: {stripe_error}")
            return Response(
                {'error': 'No se pudo verificar el estado del pago con Stripe'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar factura
        try:
            factura = Factura.objects.get(id=factura_id, estado=True)
            print(f"✅ Factura encontrada: {factura.id}")
        except Factura.DoesNotExist:
            print(f"❌ Factura no encontrada: {factura_id}")
            return Response(
                {'error': 'Factura no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if session.payment_status == 'paid':
            # ✅ 1. Actualizar factura
            factura.estado_pago = 'completado'
            factura.stripe_payment_intent_id = session.payment_intent
            factura.fecha_pago = timezone.now()
            factura.metodo_pago = 'tarjeta'
            factura.save()
            
            # ✅ 2. Actualizar estado del pedido
            pedido = factura.pedido
            pedido.estado = 'confirmado'
            pedido.save()
            
            # 3. ✅ DESCONTAR DEL INVENTARIO
            resultado_inventario = descontar_inventario_pedido(pedido)

            # ✅ 3. VACIAR EL CARRITO EN LA BASE DE DATOS
            carrito = pedido.carrito
            
            # Opción A: Desactivar items del carrito (eliminación lógica)
            items_carrito = carrito.items.filter(estado=True)
            items_count = items_carrito.count()
            items_carrito.update(estado=False)
            
            
            print(f"✅ Pago completado - Factura: {factura.id}, Pedido: {pedido.id}")
            print(f"🛒 Carrito vaciado - Items eliminados: {items_count}")
            
            return Response({
                'message': 'Pago completado exitosamente',
                'factura': FacturaSerializer(factura).data,
                'pedido_id': pedido.id,
                'carrito_vaciado': True,
                'items_eliminados': items_count
            })
        else:
            print(f"❌ Pago no completado - Estado: {session.payment_status}")
            return Response(
                {'error': f'El pago no se completó. Estado: {session.payment_status}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        print(f"💥 Error en pago_exitoso: {str(e)}")
        return Response(
            {'error': f'Error interno del servidor: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def pago_cancelado(request):
    """
    Callback para pagos cancelados
    """
    factura_id = request.GET.get('factura_id')
    factura = get_object_or_404(Factura, id=factura_id, estado=True)
    
    # Marcar como fallido
    factura.estado_pago = 'fallido'
    factura.save()
    
    return Response({
        'message': 'Pago cancelado',
        'factura_id': factura_id,
        'cod_factura': factura.cod_factura
    })

@api_view(['GET'])
def verificar_estado_pago(request, factura_id):
    """
    Verificar estado actual del pago
    """
    try:
        factura = get_object_or_404(Factura, id=factura_id, estado=True)
        
        if factura.stripe_checkout_session_id:
            session = stripe.checkout.Session.retrieve(factura.stripe_checkout_session_id)
            
            return Response({
                'factura': FacturaSerializer(factura).data,
                'stripe_status': session.payment_status,
                'checkout_url': session.url if session.payment_status == 'open' else None
            })
        else:
            return Response({
                'factura': FacturaSerializer(factura).data,
                'message': 'No se ha iniciado proceso de pago'
            })
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =========================================================================
# WEBHOOK STRIPE
# =========================================================================

@api_view(['POST'])
def webhook_stripe(request):
    """
    Webhook para eventos de Stripe
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid signature'}, status=400)
    
    # Manejar eventos
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        manejar_pago_exitoso_webhook(session)
    
    return Response({'success': True})

def manejar_pago_exitoso_webhook(session):
    """Manejar pago exitoso desde webhook - CON VACIADO DE CARRITO"""
    try:
        factura_id = session.metadata.get('factura_id')
        pedido_id = session.metadata.get('pedido_id')
        
        print(f"🔄 Procesando webhook - Factura: {factura_id}, Pedido: {pedido_id}")
        
        factura = Factura.objects.get(id=factura_id, estado=True)
        
        # 1. Actualizar factura
        factura.estado_pago = 'completado'
        factura.stripe_payment_intent_id = session.payment_intent
        factura.fecha_pago = timezone.now()
        factura.metodo_pago = 'tarjeta'
        factura.save()
        
        # 2. Actualizar pedido
        pedido = factura.pedido
        pedido.estado = 'confirmado'
        pedido.save()
        
        # 3. ✅ DESCONTAR INVENTARIO
        resultado_inventario = descontar_inventario_pedido(pedido)

        # 4. Vaciar carrito
        carrito = pedido.carrito
        items_count = carrito.items.filter(estado=True).count()
        carrito.save()
        
        print(f"✅ Webhook procesado - Factura: {factura.id}, Carrito vaciado: {items_count} items")
        
    except Exception as e:
        print(f"❌ Error en webhook: {e}")
# =========================================================================
# CRUD FACTURAS
# =========================================================================

@api_view(['GET'])
def listar_facturas(request):
    """
    Listar todas las facturas activas
    """
    facturas = Factura.objects.filter(estado=True).order_by('-fecha_creacion')
    serializer = FacturaSerializer(facturas, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def obtener_factura(request, pk):
    """
    Obtener una factura específica
    """
    factura = get_object_or_404(Factura, pk=pk, estado=True)
    serializer = FacturaSerializer(factura)
    return Response(serializer.data)

@api_view(['GET'])
def obtener_facturas_usuario(request, usuario_id):
    """
    Obtener facturas de un usuario específico
    """
    try:
        usuario = get_object_or_404(Usuario, id=usuario_id, estado=True)
        
        # Obtener facturas a través de los pedidos del usuario
        facturas = Factura.objects.filter(
            pedido__usuario=usuario,
            estado=True
        ).order_by('-fecha_creacion')
        
        serializer = FacturaSerializer(facturas, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': f'Error al obtener facturas: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def obtener_mis_facturas(request):
    """
    Obtener facturas del usuario autenticado (para frontend)
    """
    # En un sistema con autenticación JWT, aquí obtendrías el usuario del token
    usuario_id = request.GET.get('usuario_id')
    
    if not usuario_id:
        return Response(
            {'error': 'ID de usuario requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return obtener_facturas_usuario(request, usuario_id)

@api_view(['POST'])
@transaction.atomic
def crear_factura_manual(request):
    """
    Crear factura manual para pagos en efectivo/transferencia
    """
    serializer = FacturaCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            factura = Factura.objects.create(
                pedido=serializer.validated_data['pedido_id'],
                monto_total=serializer.validated_data['monto_total'],
                metodo_pago=serializer.validated_data['metodo_pago'],
                estado_pago='completado',
                fecha_pago=timezone.now()
            )
            
            # Actualizar estado del pedido
            pedido = factura.pedido
            pedido.estado = 'confirmado'
            pedido.save()
            
            response_serializer = FacturaSerializer(factura)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Error al crear factura: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def eliminar_factura(request, pk):
    """
    Eliminación lógica de factura
    """
    try:
        factura = Factura.objects.get(pk=pk, estado=True)
        factura.delete()
        return Response(
            {'message': 'Factura eliminada correctamente'}, 
            status=status.HTTP_200_OK
        )
    except Factura.DoesNotExist:
        return Response(
            {'error': 'Factura no encontrada'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def restaurar_factura(request, pk):
    """
    Restaurar factura eliminada
    """
    try:
        factura = Factura.objects.get(pk=pk, estado=False)
        factura.restaurar()
        serializer = FacturaSerializer(factura)
        return Response({
            'message': 'Factura restaurada correctamente',
            'factura': serializer.data
        })
    except Factura.DoesNotExist:
        return Response(
            {'error': 'Factura no encontrada'}, 
            status=status.HTTP_404_NOT_FOUND
        )


#----------------------------------------------------------------------
def descontar_inventario_pedido(pedido):
    """
    Descontar productos del inventario basado en los items del pedido
    """
    try:
        with transaction.atomic():
            items_carrito = ItemCarrito.objects.filter(
                carrito=pedido.carrito, 
                estado=True
            )
            
            resultados = {
                'items_procesados': 0,
                'items_sin_stock': [],
                'errores': []
            }
            
            for item in items_carrito:
                try:
                    # Obtener el inventario del producto
                    inventario = Inventario.objects.get(
                        producto=item.producto, 
                        estado=True
                    )
                    
                    # Verificar stock suficiente
                    if inventario.cantidad >= item.cantidad:
                        # Descontar del inventario
                        inventario.cantidad -= item.cantidad
                        inventario.save()
                        
                        resultados['items_procesados'] += 1
                        print(f"✅ Inventario actualizado - Producto: {item.producto.descripcion}, Cantidad descontada: {item.cantidad}, Stock restante: {inventario.cantidad}")
                    
                    else:
                        # Stock insuficiente
                        resultados['items_sin_stock'].append({
                            'producto': item.producto.descripcion,
                            'solicitado': item.cantidad,
                            'disponible': inventario.cantidad
                        })
                        print(f"❌ Stock insuficiente - Producto: {item.producto.descripcion}, Solicitado: {item.cantidad}, Disponible: {inventario.cantidad}")
                        
                except Inventario.DoesNotExist:
                    resultados['errores'].append(f"Inventario no encontrado para producto: {item.producto.descripcion}")
                    print(f"❌ Inventario no encontrado - Producto: {item.producto.descripcion}")
                
                except Exception as e:
                    resultados['errores'].append(f"Error con producto {item.producto.descripcion}: {str(e)}")
                    print(f"💥 Error al procesar inventario - Producto: {item.producto.descripcion}, Error: {str(e)}")
            
            return resultados
            
    except Exception as e:
        print(f"💥 Error general en descontar_inventario_pedido: {str(e)}")
        raise e
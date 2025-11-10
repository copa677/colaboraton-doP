import 'package:fast_pedido/widgets/bottom_menu.dart';
import 'package:fast_pedido/data/products_data.dart';
import 'package:flutter/material.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  int _cartItemCount = 0;
  int _expandedOrderIndex = -1;

  // Usar datos centralizados
  List<Map<String, dynamic>> get orders => ProductsData.orders;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        toolbarHeight: 70,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Center(
          child: Text(
            'Pedidos',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ),
        actions: [
          Container(width: 48), // Para centrar el título
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView.builder(
          itemCount: orders.length,
          itemBuilder: (context, index) {
            return _buildOrderCard(orders[index], index);
          },
        ),
      ),
      bottomNavigationBar: BottomMenu(
        cartBadge: _cartItemCount > 0 ? _cartItemCount : null,
        onFavorites: () =>
            Navigator.pushReplacementNamed(context, '/favorites'),
        onDelivery: () {},
        onCart: () => Navigator.pushReplacementNamed(context, '/cart'),
        onProfile: () => Navigator.pushNamed(context, '/profile'),
        selected: 'delivery',
      ),
    );
  }

  Widget _buildOrderCard(Map<String, dynamic> order, int index) {
    final isExpanded = _expandedOrderIndex == index;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.15),
            spreadRadius: 1,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
          BoxShadow(
            color: Colors.grey.withOpacity(0.05),
            spreadRadius: 0,
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header del pedido (siempre visible)
          GestureDetector(
            onTap: () {
              setState(() {
                _expandedOrderIndex = isExpanded ? -1 : index;
              });
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Nro: ${order['orderNumber']}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      Icon(
                        isExpanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down,
                        color: Colors.black54,
                        size: 24,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    order['branch'],
                    style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Fecha de solicitud: ${order['requestDate']}',
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey[600],
                              ),
                            ),
                            Text(
                              'Fecha de entrega: ${order['deliveryDate']}',
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        'Hora de entrega: ${order['deliveryTime']}',
                        style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          // Contenido desplegable
          if (isExpanded) ...[
            const Divider(height: 1, color: Colors.grey),
            Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Iconos de estado
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatusIcon(Icons.shopping_cart, 'Pedido', true),
                      _buildStatusIcon(Icons.cached, 'Proceso', true),
                      _buildStatusIcon(Icons.local_shipping, 'Envío', true),
                      _buildStatusIcon(Icons.check_circle, 'Entregado', false),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Lista de productos
                  ...order['products']
                      .map<Widget>((product) => _buildProductItem(product))
                      .toList(),
                  const SizedBox(height: 16),
                  // Botón y totales
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            _reorderProducts(order);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Volver a pedir',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.yellow[300],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'Total Parcial: ${order['totalPartial']}',
                              style: const TextStyle(fontSize: 11),
                            ),
                            Text(
                              'Costo de envío: ${order['shippingCost']}',
                              style: const TextStyle(fontSize: 11),
                            ),
                            Text(
                              'Costo Total: ${order['totalCost']}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusIcon(IconData icon, String label, bool isActive) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isActive ? Colors.red : Colors.grey[300],
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            size: 20,
            color: isActive ? Colors.white : Colors.grey[600],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: isActive ? Colors.black87 : Colors.grey[600],
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildProductItem(Map<String, dynamic> product) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product['name'],
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      'Precio: ${product['weight']}',
                      style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                    ),
                    const SizedBox(width: 16),
                    Text(
                      'Cantidad: ${product['quantity']}',
                      style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Text(
            product['price'],
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  void _reorderProducts(Map<String, dynamic> order) {
    // Convertir los productos de la orden al formato del carrito
    List<Map<String, dynamic>> orderProducts = [];

    for (var product in order['products']) {
      // Crear un ID único para el producto
      final productId = '${product['name']}_${product['price']}';

      // Mapear nombres de productos a imágenes específicas
      String productImage = _getProductImage(product['name']);

      orderProducts.add({
        'name': product['name'],
        'pricePerUnit': product['price'],
        'totalPrice': product['price'], // Se calculará en el carrito
        'image': productImage,
        'id': productId,
        'quantity': product['quantity'],
      });
    }

    // Navegar al carrito con los productos
    Navigator.pushNamed(
      context,
      '/cart',
      arguments: {'dashboardProducts': orderProducts},
    );

    // Mostrar confirmación
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '${order['products'].length} productos agregados al carrito',
        ),
        duration: const Duration(seconds: 2),
        backgroundColor: Colors.green,
      ),
    );
  }

  String _getProductImage(String productName) {
    // Mapear nombres de productos a sus imágenes correspondientes
    final String lowerName = productName.toLowerCase();

    if (lowerName.contains('coca cola') || lowerName.contains('cocacola')) {
      return 'assets/images/coca_cola.png';
    } else if (lowerName.contains('papel higiénico') ||
        lowerName.contains('papel')) {
      return 'assets/images/papel_higienico.png';
    } else if (lowerName.contains('leche')) {
      return 'assets/images/lacteos/leche_delactosada_pil.png';
    } else if (lowerName.contains('arroz')) {
      return 'assets/images/arroz.png';
    } else if (lowerName.contains('aceite')) {
      return 'assets/images/aceite.png';
    } else {
      // Imagen por defecto para productos no reconocidos
      return 'assets/images/default_product.png';
    }
  }
}

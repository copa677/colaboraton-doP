import 'package:flutter/material.dart';
import 'package:fast_pedido/widgets/bottom_menu.dart';
import 'package:fast_pedido/widgets/product_card.dart';
import 'package:fast_pedido/data/products_data.dart';
import 'package:fast_pedido/services/points_service.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  Map<String, int> _cartQuantities = {};
  final PointsService _pointsService = PointsService();

  // Variables para manejar las sugerencias
  Set<String> _favoriteSuggestions = {};
  Map<String, int> _suggestionQuantities = {};

  // Puntos totales (dashboard + carrito)
  int _totalPoints = 0;
  int _dashboardPoints = 0; // Puntos recibidos del dashboard

  List<Map<String, dynamic>> cartItems = [];

  // Calculamos dinámicamente el número de items en el carrito
  int get _cartItemCount {
    return _cartQuantities.values.fold(0, (sum, quantity) => sum + quantity);
  }

  // Método para calcular puntos totales (dashboard + productos nuevos del carrito)
  int _calculateTotalPoints() {
    int newCartPoints = 0;

    // Solo calcular puntos de productos agregados desde las sugerencias en el carrito
    // No recalcular puntos de productos que vinieron del dashboard
    for (var item in cartItems) {
      final quantity = _cartQuantities[item['id']] ?? 0;
      if (quantity > 0) {
        // Verificar si este producto fue agregado desde las sugerencias
        // (productos del dashboard ya tienen sus puntos contados en _dashboardPoints)
        bool isFromSuggestions = suggestions.any(
          (suggestion) =>
              '${suggestion['name']}_${suggestion['price']}' == item['id'],
        );

        if (isFromSuggestions) {
          // Solo calcular puntos para productos agregados desde sugerencias
          double unitPrice = _extractPrice(item['pricePerUnit']);
          int pointsPerUnit = unitPrice.floor();
          newCartPoints += pointsPerUnit * quantity;
        }
      }
    }

    // Actualizar el total de puntos
    _totalPoints = _dashboardPoints + newCartPoints;
    return _totalPoints;
  }

  // Usar datos centralizados
  List<Map<String, dynamic>> get suggestions => ProductsData.suggestions;

  double get totalAmount {
    double total = 0.0;

    // Calcular total de productos en el carrito principal
    for (var item in cartItems) {
      final quantity = _cartQuantities[item['id']] ?? 0;
      if (quantity > 0) {
        // Extraer el precio unitario del campo pricePerUnit
        double unitPrice = _extractPrice(item['pricePerUnit']);
        total += unitPrice * quantity;
      }
    }

    return total;
  }

  // Función para extraer el precio numérico de un string con formato "Bs. XX.XX"
  double _extractPrice(String priceString) {
    // Buscar números con punto decimal
    RegExp regExp = RegExp(r'\d+\.?\d*');
    Match? match = regExp.firstMatch(priceString);
    if (match != null) {
      String numberStr = match.group(0)!;
      return double.tryParse(numberStr) ?? 0.0;
    }
    return 0.0;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Procesar productos enviados desde el dashboard
    final arguments =
        ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (arguments != null) {
      // Recibir puntos del dashboard
      _dashboardPoints = _pointsService.userPoints;

      // Procesar productos del dashboard
      if (arguments['dashboardProducts'] != null) {
        _addDashboardProducts(
          arguments['dashboardProducts'] as List<Map<String, dynamic>>,
        );
      }
    }
  }

  void _addDashboardProducts(List<Map<String, dynamic>> dashboardProducts) {
    for (var product in dashboardProducts) {
      final productId = product['id'];
      final quantity = (product['quantity'] ?? 0) as int;

      if (quantity > 0) {
        // Verificar si el producto ya existe en el carrito
        bool productExists = cartItems.any((item) => item['id'] == productId);

        if (productExists) {
          // Si existe, actualizar la cantidad y recalcular el precio total
          int newQuantity = (_cartQuantities[productId] ?? 0) + quantity;
          _cartQuantities[productId] = newQuantity;

          // Recalcular el precio total del producto existente
          var existingItem = cartItems.firstWhere(
            (item) => item['id'] == productId,
          );
          double unitPrice = _extractPrice(existingItem['pricePerUnit']);
          existingItem['totalPrice'] =
              'Bs. ${(unitPrice * newQuantity).toStringAsFixed(2)}';
        } else {
          // Si no existe, agregar el producto al carrito
          cartItems.add({
            'name': product['name'],
            'pricePerUnit': product['pricePerUnit'],
            'totalPrice': product['totalPrice'],
            'image': product['image'],
            'id': productId,
          });
          _cartQuantities[productId] = quantity;
        }
      }
    }
    setState(() {});
  }

  void _transferSuggestionToCart(
    Map<String, dynamic> product,
    String productId,
    int quantity,
  ) {
    // Calcular el precio unitario y total
    double unitPrice = _extractPrice(product['price']);

    // Verificar si el producto ya existe en el carrito
    bool productExists = cartItems.any((item) => item['id'] == productId);

    if (productExists) {
      // Si existe, actualizar la cantidad
      int newQuantity = (_cartQuantities[productId] ?? 0) + quantity;
      _cartQuantities[productId] = newQuantity;

      // Actualizar el totalPrice del producto existente
      var existingItem = cartItems.firstWhere(
        (item) => item['id'] == productId,
      );
      existingItem['totalPrice'] =
          'Bs. ${(unitPrice * newQuantity).toStringAsFixed(2)}';
    } else {
      // Si no existe, agregar el producto al carrito
      cartItems.add({
        'name': product['name'],
        'pricePerUnit': product['price'],
        'totalPrice': 'Bs. ${(unitPrice * quantity).toStringAsFixed(2)}',
        'image': product['image'],
        'id': productId,
      });
      _cartQuantities[productId] = quantity;
    }

    setState(() {});
  }

  void _updateCartItemQuantity(String productId, int newQuantity) {
    // Encontrar el producto en el carrito y actualizar su cantidad y precio total
    var cartItem = cartItems.firstWhere((item) => item['id'] == productId);
    _cartQuantities[productId] = newQuantity;

    // Recalcular el precio total
    double unitPrice = _extractPrice(cartItem['pricePerUnit']);
    cartItem['totalPrice'] =
        'Bs. ${(unitPrice * newQuantity).toStringAsFixed(2)}';
  }

  void _removeFromCart(String productId) {
    _cartQuantities.remove(productId);
    cartItems.removeWhere((item) => item['id'] == productId);
    _suggestionQuantities.remove(productId); // También limpiar de sugerencias
  }

  void _showPurchaseDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Realizar Compra'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Total: Bs ${totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                '¿Cómo quieres realizar tu compra?',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                'Cancelar',
                style: TextStyle(color: Colors.grey),
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.pushNamed(
                  context,
                  '/delivery-date',
                  arguments: {
                    'totalAmount': totalAmount,
                    'deliveryType': 'pickup',
                  },
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
              ),
              icon: const Icon(Icons.store, size: 18),
              label: const Text('Recoger'),
            ),
            const SizedBox(width: 8),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.pushNamed(
                  context,
                  '/delivery-date',
                  arguments: {
                    'totalAmount': totalAmount,
                    'deliveryType': 'delivery',
                  },
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
              ),
              icon: const Icon(Icons.delivery_dining, size: 18),
              label: const Text('Delivery'),
            ),
          ],
        );
      },
    );
  }

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
        title: const Text(
          'Carrito',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ),
      body: Column(
        children: [
          // Lista de productos en el carrito
          Expanded(
            child: cartItems.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.shopping_cart_outlined,
                          size: 80,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Tu carrito está vacío',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Agrega productos para comenzar',
                          style: TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: cartItems.length,
                    itemBuilder: (context, index) {
                      return _buildCartItem(cartItems[index]);
                    },
                  ),
          ),
          // Sección inferior fija
          Container(
            color: Colors.white,
            child: Column(
              children: [
                // Botones de acción
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 5,
                  ),
                  child: Row(
                    children: [
                      //Boton de Limpiar Carrito
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            setState(() {
                              _cartQuantities.clear();
                              cartItems.clear();
                              _suggestionQuantities
                                  .clear(); // Limpiar también las sugerencias
                              _pointsService
                                  .reset(); // Reinicia los puntos globalmente
                              _totalPoints = 0;
                            });
                          },
                          icon: const Icon(Icons.delete, size: 18),
                          label: const Text('Eliminar Todo'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor:
                                Colors.grey[700], // Texto gris oscuro
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),
                      //Texto Puntos Ganados
                      const SizedBox(width: 12),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color.fromARGB(255, 255, 255, 255),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Colors.grey[300]!,
                              width: 1,
                            ),
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.stars,
                                    color: Colors.grey[600],
                                    size: 18,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${_pointsService.userPoints} pts',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.grey[700],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Puntos Ganados',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Colors.black87,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Total
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  color: Colors.grey[200],
                  child: Text(
                    'Total: Bs ${totalAmount.toStringAsFixed(2)}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                ),
                // Sugerencias
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      '¿Quieres algo mas?',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                ),
                // Lista horizontal de sugerencias usando ProductCard
                SizedBox(
                  height: 180,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: suggestions.length,
                    itemBuilder: (context, index) {
                      final product = suggestions[index];
                      final productId =
                          '${product['name']}_${product['price']}';
                      final isFavorite = _favoriteSuggestions.contains(
                        productId,
                      );
                      final quantity = _suggestionQuantities[productId] ?? 0;

                      return Padding(
                        padding: const EdgeInsets.only(right: 10),
                        child: SizedBox(
                          width: 145,
                          child: ProductCard(
                            product: {
                              'name': product['name'],
                              'price': product['price'],
                              'image': product['image'],
                              'id': productId,
                            },
                            fullWidth: false,
                            quantity: quantity,
                            isFavorite: isFavorite,
                            onAdd: () {
                              setState(() {
                                int newQuantity = quantity + 1;
                                _suggestionQuantities[productId] = newQuantity;
                                _transferSuggestionToCart(
                                  product,
                                  productId,
                                  1,
                                );
                              });
                              _pointsService.updatePoints(
                                product['price'],
                                isAdding: true,
                              );
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    '${product['name']} agregado al carrito (+${_pointsService.userPoints} pts)',
                                  ),
                                  duration: const Duration(seconds: 1),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            },
                            onRemove: () {
                              setState(() {
                                if (quantity > 1) {
                                  int newQuantity = quantity - 1;
                                  _suggestionQuantities[productId] =
                                      newQuantity;
                                  _updateCartItemQuantity(
                                    productId,
                                    newQuantity,
                                  );
                                } else if (quantity == 1) {
                                  _suggestionQuantities.remove(productId);
                                  _removeFromCart(productId);
                                }
                              });

                              _pointsService.updatePoints(
                                product['price'],
                                isAdding: false,
                              );
                            },
                            onToggleFavorite: () {
                              setState(() {
                                if (isFavorite) {
                                  _favoriteSuggestions.remove(productId);
                                } else {
                                  _favoriteSuggestions.add(productId);
                                }
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isFavorite
                                        ? '${product['name']} eliminado de favoritos'
                                        : '${product['name']} agregado a favoritos',
                                  ),
                                  duration: const Duration(seconds: 1),
                                ),
                              );
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ),
                // Botón realizar compra
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 40,
                    vertical: 5,
                  ),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: cartItems.isEmpty
                          ? null
                          : () {
                              // Lógica para realizar compra
                              _showPurchaseDialog();
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: cartItems.isEmpty
                            ? Colors.grey
                            : Colors.red,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        cartItems.isEmpty ? 'Carrito Vacío' : 'Realizar Compra',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      // Menú inferior de navegación
      bottomNavigationBar: BottomMenu(
        cartBadge: _cartItemCount > 0 ? _cartItemCount : null,
        onFavorites: () =>
            Navigator.pushReplacementNamed(context, '/favorites'),
        onDelivery: () => Navigator.pushReplacementNamed(context, '/orders'),
        onCart: () {}, // already on cart
        onProfile: () => Navigator.pushReplacementNamed(context, '/profile'),
        selected: 'cart',
      ),
    );
  }

  Widget _buildCartItem(Map<String, dynamic> item) {
    final quantity = _cartQuantities[item['id']] ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
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
      child: Row(
        children: [
          // Imagen del producto (más grande y centrada)
          Container(
            width: 90, // antes 60
            height: 90, // antes 60
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  spreadRadius: 1,
                  blurRadius: 6,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.asset(
                item['image'],
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Icon(
                    Icons.shopping_bag,
                    size: 50,
                    color: Colors.grey[400],
                  );
                },
              ),
            ),
          ),

          const SizedBox(width: 12),
          // Información del producto
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'],
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item['pricePerUnit'],
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
                const SizedBox(height: 8),
                Text(
                  item['totalPrice'],
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
          // Controles de cantidad y eliminar
          Column(
            children: [
              // Controles de cantidad
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        if (quantity > 1) {
                          int newQuantity = quantity - 1;
                          _cartQuantities[item['id']] = newQuantity;

                          // Recalcular el precio total
                          double unitPrice = _extractPrice(
                            item['pricePerUnit'],
                          );
                          item['totalPrice'] =
                              'Bs. ${(unitPrice * newQuantity).toStringAsFixed(2)}';

                          //  Restar puntos
                          _pointsService.updatePoints(
                            item['pricePerUnit'],
                            isAdding: false,
                          );
                        } else {
                          // Si la cantidad es 1, eliminar el producto del carrito
                          String productId = item['id'];
                          _cartQuantities.remove(productId);
                          cartItems.removeWhere(
                            (cartItem) => cartItem['id'] == productId,
                          );
                          _suggestionQuantities.remove(productId);

                          //  Restar puntos del producto eliminado
                          _pointsService.updatePoints(
                            item['pricePerUnit'],
                            isAdding: false,
                          );
                        }
                      });
                    },

                    child: Container(
                      padding: const EdgeInsets.all(4),
                      child: const Icon(
                        Icons.remove_circle_outline,
                        size: 24,
                        color: Colors.red,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '$quantity',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        int newQuantity = quantity + 1;
                        _cartQuantities[item['id']] = newQuantity;
                        // Recalcular el precio total
                        double unitPrice = _extractPrice(item['pricePerUnit']);
                        item['totalPrice'] =
                            'Bs. ${(unitPrice * newQuantity).toStringAsFixed(2)}';
                        // 🔹 Sumar puntos al incrementar
                        _pointsService.updatePoints(
                          item['pricePerUnit'],
                          isAdding: true,
                        );
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      child: const Icon(
                        Icons.add_circle_outline,
                        size: 24,
                        color: Colors.red,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Botón eliminar
              GestureDetector(
                onTap: () {
                  setState(() {
                    String productId = item['id'];
                    _cartQuantities.remove(productId);
                    cartItems.removeWhere(
                      (cartItem) => cartItem['id'] == productId,
                    );
                    _suggestionQuantities.remove(
                      productId,
                    ); // También limpiar de sugerencias
                    // Restar puntos al eliminar todo
                    _pointsService.updatePoints(
                      item['pricePerUnit'],
                      isAdding: false,
                    );
                  });
                },
                child: Container(
                  padding: const EdgeInsets.all(6),
                  child: const Icon(
                    Icons.delete_outline,
                    size: 20,
                    color: Colors.red,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:fast_pedido/widgets/product_card.dart';
import 'package:fast_pedido/widgets/search_bar.dart';
import 'package:fast_pedido/widgets/bottom_menu.dart';
import 'package:fast_pedido/data/products_data.dart';

class RecommendedScreen extends StatefulWidget {
  final String title;
  final List<Map<String, dynamic>> products;

  const RecommendedScreen({
    super.key,
    required this.title,
    required this.products,
  });

  @override
  State<RecommendedScreen> createState() => _RecommendedScreenState();
}

class _RecommendedScreenState extends State<RecommendedScreen> {
  Set<String> _favoriteProducts = {};
  Map<String, int> _productQuantities = {};
  late List<Map<String, dynamic>> _visible;
  String? _selectedCategory;
  int _userPoints = 0;

  // ✅ Igual que en Dashboard: getter para contar ítems
  int get _cartItemCount {
    return _productQuantities.values.fold<int>(
      0,
      (sum, quantity) => sum + quantity,
    );
  }

  // Datos centralizados desde ProductsData
  List<Map<String, dynamic>> get categories => ProductsData.categories;
  Map<String, List<Map<String, dynamic>>> get productsByCategory =>
      ProductsData.productsByCategory;
  List<Map<String, dynamic>> get offers => ProductsData.offers;
  List<Map<String, dynamic>> get recommended => ProductsData.recommended;

  @override
  void initState() {
    super.initState();
    _visible = List.from(widget.products);
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
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Image.asset(
              'assets/images/logo.png',
              height: 45,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.delivery_dining,
                    color: Colors.white,
                    size: 24,
                  ),
                );
              },
            ),
            const SizedBox(width: 10),
            const Text(
              'FastPedido',
              style: TextStyle(
                color: Colors.red,
                fontWeight: FontWeight.bold,
                fontSize: 20,
                decoration: TextDecoration.underline,
                decorationColor: Colors.red,
                decorationThickness: 2.5,
              ),
            ),
          ],
        ),
      ),

      // ✅ Igual que el Dashboard: menú inferior reutilizado
      bottomNavigationBar: BottomMenu(
        cartBadge: _cartItemCount > 0 ? _cartItemCount : null,
        onFavorites: () {
          List<Map<String, dynamic>> dashboardFavoritesToSend = [];
          _collectFavoriteProducts(offers, dashboardFavoritesToSend);
          _collectFavoriteProducts(recommended, dashboardFavoritesToSend);

          if (_selectedCategory != null) {
            final products = productsByCategory[_selectedCategory] ?? [];
            _collectFavoriteProducts(products, dashboardFavoritesToSend);
          }

          Navigator.pushNamed(
            context,
            '/favorites',
            arguments: {
              'dashboardFavorites': _favoriteProducts.toList(),
              'dashboardFavoriteProducts': dashboardFavoritesToSend,
            },
          );
        },
        onDelivery: () => Navigator.pushNamed(context, '/orders'),
        onCart: () => _navigateToCart(),
        onProfile: () => Navigator.pushNamed(context, '/profile'),
        selected: '',
      ),

      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 🔹 Barra de búsqueda reutilizable
              SearchBarWidget(
                hintText: 'Buscar productos...',
                onChanged: (query) {
                  setState(() {
                    _visible = widget.products
                        .where(
                          (p) => p['name'].toString().toLowerCase().contains(
                            query.toLowerCase(),
                          ),
                        )
                        .toList();
                  });
                },
                onFilterPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Función de filtro próximamente'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),

              // 🔹 Título de la pantalla
              Text(
                "Productos Recomendados",
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 12),

              // 🔹 Grid de productos recomendados
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.75,
                ),
                itemCount: _visible.length,
                itemBuilder: (context, index) {
                  final product = _visible[index];
                  final productId = '${product['name']}_${product['price']}';
                  final isFavorite = _favoriteProducts.contains(productId);
                  final quantity = _productQuantities[productId] ?? 0;

                  return ProductCard(
                    product: product,
                    fullWidth: false,
                    quantity: quantity,
                    isFavorite: isFavorite,
                    onAdd: () {
                      setState(() {
                        _productQuantities[productId] = quantity + 1;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            '${product['name']} agregado al carrito',
                          ),
                          duration: const Duration(seconds: 1),
                          backgroundColor: Colors.green,
                        ),
                      );
                    },
                    onRemove: () {
                      setState(() {
                        if (quantity > 1) {
                          _productQuantities[productId] = quantity - 1;
                        } else {
                          _productQuantities.remove(productId);
                        }
                      });
                    },
                    onToggleFavorite: () {
                      setState(() {
                        if (isFavorite) {
                          _favoriteProducts.remove(productId);
                        } else {
                          _favoriteProducts.add(productId);
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
                          backgroundColor: isFavorite
                              ? Colors.orange
                              : Colors.green,
                        ),
                      );
                    },
                  );
                },
              ),

              const SizedBox(height: 80), // espacio para el menú inferior
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToCart() {
    // Preparar los productos del dashboard para enviar al carrito
    List<Map<String, dynamic>> dashboardProducts = [];
    List<Map<String, dynamic>> dashboardFavoritesToSend = [];

    // Recopilar productos favoritos del dashboard con sus datos completos
    _collectFavoriteProducts(offers, dashboardFavoritesToSend);
    _collectFavoriteProducts(recommended, dashboardFavoritesToSend);

    if (_selectedCategory != null) {
      final products = productsByCategory[_selectedCategory] ?? [];
      _collectFavoriteProducts(products, dashboardFavoritesToSend);
    }

    // Revisar ofertas con cantidades
    for (var offer in offers) {
      final productId = '${offer['name']}_${offer['price']}';
      final quantity = _productQuantities[productId] ?? 0;
      if (quantity > 0) {
        dashboardProducts.add({
          'name': offer['name'],
          'pricePerUnit': offer['price'],
          'totalPrice': offer['price'], // Se calculará en el carrito
          'image': offer['image'],
          'id': productId,
          'quantity': quantity,
        });
      }
    }

    // Revisar recomendados con cantidades
    for (var recommended in recommended) {
      final productId = '${recommended['name']}_${recommended['price']}';
      final quantity = _productQuantities[productId] ?? 0;
      if (quantity > 0) {
        dashboardProducts.add({
          'name': recommended['name'],
          'pricePerUnit': recommended['price'],
          'totalPrice': recommended['price'], // Se calculará en el carrito
          'image': recommended['image'],
          'id': productId,
          'quantity': quantity,
        });
      }
    }

    // Revisar productos de categorías con cantidades
    if (_selectedCategory != null) {
      final products = productsByCategory[_selectedCategory] ?? [];
      for (var product in products) {
        final productId = '${product['name']}_${product['price']}';
        final quantity = _productQuantities[productId] ?? 0;
        if (quantity > 0) {
          dashboardProducts.add({
            'name': product['name'],
            'pricePerUnit': product['price'],
            'totalPrice': product['price'], // Se calculará en el carrito
            'image': product['image'],
            'id': productId,
            'quantity': quantity,
          });
        }
      }
    }

    // Navegar al carrito con los productos
    Navigator.pushNamed(
      context,
      '/cart',
      arguments: {
        'dashboardProducts': dashboardProducts,
        'dashboardFavoriteProducts': dashboardFavoritesToSend,
        'currentPoints': _userPoints, // Enviar puntos actuales
      },
    );

    // Limpiar las cantidades del dashboard después de enviar al carrito
    setState(() {
      _productQuantities.clear();
    });
  }

  void _collectFavoriteProducts(
    List<Map<String, dynamic>> productList,
    List<Map<String, dynamic>> favoritesToSend,
  ) {
    for (var product in productList) {
      final productId = '${product['name']}_${product['price']}';
      if (_favoriteProducts.contains(productId)) {
        favoritesToSend.add({
          'name': product['name'],
          'price': product['price'],
          'image': product['image'],
          'id': productId,
        });
      }
    }
  }
}

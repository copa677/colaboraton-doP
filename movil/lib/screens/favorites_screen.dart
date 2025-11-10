import 'package:flutter/material.dart';
import 'package:fast_pedido/widgets/bottom_menu.dart';
import 'package:fast_pedido/data/products_data.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  Map<String, int> _productQuantities = {};
  Set<String> _favoriteProducts = {};
  List<Map<String, dynamic>> _dashboardFavoriteProducts = [];

  // Calculamos dinámicamente el número de items en el carrito (solo productos que siguen siendo favoritos)
  int get _cartItemCount {
    int total = 0;
    _productQuantities.forEach((productId, quantity) {
      if (_favoriteProducts.contains(productId)) {
        total += quantity;
      }
    });
    return total;
  }

  // Usar datos centralizados
  List<Map<String, dynamic>> get favoriteProducts =>
      ProductsData.favoriteProducts;

  @override
  void initState() {
    super.initState();
    // Inicializar todos los productos como favoritos
    for (var product in favoriteProducts) {
      final productId = '${product['name']}_${product['price']}';
      _favoriteProducts.add(productId);
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Procesar favoritos enviados desde el dashboard
    final arguments =
        ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (arguments != null) {
      if (arguments['dashboardFavorites'] != null) {
        _addDashboardFavorites(arguments['dashboardFavorites'] as List<String>);
      }
      if (arguments['dashboardFavoriteProducts'] != null) {
        _addDashboardFavoriteProducts(
          arguments['dashboardFavoriteProducts'] as List<Map<String, dynamic>>,
        );
      }
    }
  }

  void _addDashboardFavorites(List<String> dashboardFavorites) {
    setState(() {
      // Agregar los favoritos del dashboard al conjunto de favoritos
      for (String favoriteId in dashboardFavorites) {
        _favoriteProducts.add(favoriteId);

        // Si el producto del dashboard no está en la lista predefinida, agregarlo dinámicamente
        bool productExists = favoriteProducts.any((product) {
          final productId = '${product['name']}_${product['price']}';
          return productId == favoriteId;
        });

        if (!productExists) {
          // Este sería un producto del dashboard que se agregó a favoritos
          // Por ahora solo lo agregamos al Set, la UI lo manejará automáticamente
          // ya que filtra por _favoriteProducts.contains(productId)
        }
      }
    });
  }

  void _addDashboardFavoriteProducts(
    List<Map<String, dynamic>> dashboardFavorites,
  ) {
    setState(() {
      // Agregar productos favoritos del dashboard a la lista local
      for (var product in dashboardFavorites) {
        final productId = product['id'];
        _favoriteProducts.add(productId);

        // Verificar si el producto ya está en la lista predefinida
        bool productExists = favoriteProducts.any((existingProduct) {
          final existingProductId =
              '${existingProduct['name']}_${existingProduct['price']}';
          return existingProductId == productId;
        });

        if (!productExists) {
          // Agregar a la lista de productos favoritos del dashboard
          _dashboardFavoriteProducts.add(product);
        }
      }
    });
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
        title: Row(
          children: [
            const Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Buscar por marca, categoría, producto',
                  hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                  prefixIcon: Icon(Icons.search, color: Colors.grey, size: 22),
                  filled: true,
                  fillColor: Color(0xFFF5F5F5),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(10)),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: EdgeInsets.symmetric(
                    vertical: 12,
                    horizontal: 0,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Icon(Icons.search, color: Colors.grey[600], size: 28),
          ],
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, 16),
            child: Text(
              'Productos Favoritos',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Builder(
                builder: (context) {
                  // Combinar productos favoritos predefinidos y del dashboard
                  List<Map<String, dynamic>> allFavoriteProducts = [];

                  // Agregar productos favoritos predefinidos que siguen siendo favoritos
                  for (var product in favoriteProducts) {
                    final productId = '${product['name']}_${product['price']}';
                    if (_favoriteProducts.contains(productId)) {
                      allFavoriteProducts.add(product);
                    }
                  }

                  // Agregar productos favoritos del dashboard que siguen siendo favoritos
                  for (var product in _dashboardFavoriteProducts) {
                    final productId = product['id'];
                    if (_favoriteProducts.contains(productId)) {
                      allFavoriteProducts.add({
                        'name': product['name'],
                        'price': product['price'],
                        'image': product['image'],
                      });
                    }
                  }

                  if (allFavoriteProducts.isEmpty) {
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.favorite_border,
                            size: 64,
                            color: Colors.grey,
                          ),
                          SizedBox(height: 16),
                          Text(
                            'No tienes productos favoritos',
                            style: TextStyle(
                              fontSize: 18,
                              color: Colors.grey,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Agrega productos a favoritos desde el dashboard',
                            style: TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                        ],
                      ),
                    );
                  }

                  return GridView.builder(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.75,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                    itemCount: allFavoriteProducts.length,
                    itemBuilder: (context, index) {
                      return _buildFavoriteCard(allFavoriteProducts[index]);
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomMenu(
        cartBadge: _cartItemCount > 0 ? _cartItemCount : null,
        onFavorites: () {},
        onDelivery: () => Navigator.pushReplacementNamed(context, '/orders'),
        onCart: () => _navigateToCart(),
        onProfile: () => Navigator.pushNamed(context, '/profile'),
        selected: 'favorites',
      ),
    );
  }

  Widget _buildFavoriteCard(Map<String, dynamic> product) {
    final productId = '${product['name']}_${product['price']}';
    final quantity = _productQuantities[productId] ?? 0;
    final showQuantityControls = quantity > 0;
    final isFavorite = _favoriteProducts.contains(productId);

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Image.asset(
                  product['image'],
                  fit: BoxFit.contain,
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
          ),
          const SizedBox(height: 6),
          Text(
            product['price'],
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            product['name'],
            style: TextStyle(
              fontSize: 10.5,
              height: 1.3,
              color: Colors.grey[800],
            ),
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (showQuantityControls)
                Row(
                  children: [
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          if (quantity > 0) {
                            _productQuantities[productId] = quantity - 1;
                            if (_productQuantities[productId] == 0) {
                              _productQuantities.remove(productId);
                            }
                          }
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        child: const Icon(
                          Icons.remove_circle_outline,
                          size: 20,
                          color: Colors.red,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '$quantity',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _productQuantities[productId] = quantity + 1;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        child: const Icon(
                          Icons.add_circle_outline,
                          size: 20,
                          color: Colors.red,
                        ),
                      ),
                    ),
                  ],
                )
              else
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _productQuantities[productId] = 1;
                    });
                    // Mostrar confirmación
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${product['name']} agregado al carrito'),
                        duration: const Duration(seconds: 1),
                        backgroundColor: Colors.green,
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withOpacity(0.3),
                          spreadRadius: 0,
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.add_shopping_cart,
                      size: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
              GestureDetector(
                onTap: () {
                  setState(() {
                    if (isFavorite) {
                      _favoriteProducts.remove(productId);
                      // También eliminar la cantidad si existe
                      _productQuantities.remove(productId);
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
                      backgroundColor: isFavorite ? Colors.red : Colors.green,
                    ),
                  );
                },
                child: Icon(
                  isFavorite ? Icons.favorite : Icons.favorite_border,
                  size: 22,
                  color: isFavorite ? Colors.red : Colors.grey[600],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _navigateToCart() {
    // Preparar los productos de favoritos para enviar al carrito
    List<Map<String, dynamic>> favoriteProductsToCart = [];

    // Revisar productos favoritos predefinidos con cantidades (solo los que siguen siendo favoritos)
    for (var product in favoriteProducts) {
      final productId = '${product['name']}_${product['price']}';
      final quantity = _productQuantities[productId] ?? 0;
      final isFavorite = _favoriteProducts.contains(productId);

      if (quantity > 0 && isFavorite) {
        favoriteProductsToCart.add({
          'name': product['name'],
          'pricePerUnit': product['price'],
          'totalPrice': product['price'], // Se calculará en el carrito
          'image': product['image'],
          'id': productId,
          'quantity': quantity,
        });
      }
    }

    // Revisar productos favoritos del dashboard con cantidades
    for (var product in _dashboardFavoriteProducts) {
      final productId = product['id'];
      final quantity = _productQuantities[productId] ?? 0;
      final isFavorite = _favoriteProducts.contains(productId);

      if (quantity > 0 && isFavorite) {
        favoriteProductsToCart.add({
          'name': product['name'],
          'pricePerUnit': product['price'],
          'totalPrice': product['price'], // Se calculará en el carrito
          'image': product['image'],
          'id': productId,
          'quantity': quantity,
        });
      }
    }

    // Navegar al carrito con los productos
    Navigator.pushNamed(
      context,
      '/cart',
      arguments: {'dashboardProducts': favoriteProductsToCart},
    );

    // Limpiar las cantidades de favoritos después de enviar al carrito
    setState(() {
      _productQuantities.clear();
    });
  }
}

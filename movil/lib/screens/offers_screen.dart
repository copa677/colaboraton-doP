import 'package:flutter/material.dart';
import 'package:fast_pedido/data/products_data.dart';
import 'package:fast_pedido/widgets/custom_appbar.dart';
import 'package:fast_pedido/widgets/offer_header.dart';
import 'package:fast_pedido/widgets/offers_grid.dart';
import 'package:fast_pedido/widgets/search_bar.dart';
import 'package:fast_pedido/widgets/bottom_menu.dart';
import 'package:fast_pedido/screens/dashboard_screen.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({super.key});

  @override
  State<OffersScreen> createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen> {
  final Set<String> _favorites = {};
  final Map<String, int> _quantities = {};
  final offers = ProductsData.allOffers;

  String _query = '';
  String _selectedMenu = '';

  int get _cartItemCount =>
      _quantities.values.fold(0, (sum, qty) => sum + qty);

  @override
  Widget build(BuildContext context) {
    final filteredOffers = offers
        .where((p) =>
            p['name'].toString().toLowerCase().contains(_query.toLowerCase()))
        .toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: const CustomAppBar(title: 'Ofertas'),

      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            SearchBarWidget(
              hintText: 'Buscar ofertas...',
              onChanged: (text) => setState(() => _query = text),
              onFilterPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Filtros disponibles próximamente'),
                    duration: Duration(seconds: 1),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),

            const OfferHeader(
              title: '¡Ofertas Increíbles!',
              subtitle: 'Descuentos de hasta 23%',
            ),
            const SizedBox(height: 16),

            Expanded(
              child: OffersGrid(
                offers: filteredOffers,
                favorites: _favorites,
                quantities: _quantities,
                onAdd: (id) => setState(() {
                  _quantities[id] = (_quantities[id] ?? 0) + 1;
                }),
                onRemove: (id) => setState(() {
                  final current = _quantities[id] ?? 0;
                  if (current > 0) _quantities[id] = current - 1;
                }),
                onToggleFavorite: (id) => setState(() {
                  _favorites.contains(id)
                      ? _favorites.remove(id)
                      : _favorites.add(id);
                }),
              ),
            ),
          ],
        ),
      ),

      //  Menú inferior funcional
      bottomNavigationBar: BottomMenu(
        selected: _selectedMenu,
        cartBadge: _cartItemCount > 0 ? _cartItemCount : null,

        // Favoritos
        onFavorites: () {
          setState(() => _selectedMenu = 'favorites');
          Navigator.pushNamed(context, '/favorites', arguments: {
            'dashboardFavorites': _favorites.toList(),
            'dashboardFavoriteProducts': offers
                .where((p) => _favorites
                    .contains('${p['name']}_${p['price']}'))
                .toList(),
          });
        },

        // Delivery (te lleva al dashboard principal)
        onDelivery: () {
          setState(() => _selectedMenu = 'delivery');
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const DashboardScreen()),
          );
        },

        // Carrito
        onCart: () {
          setState(() => _selectedMenu = 'cart');
          final cartProducts = offers
              .where((p) =>
                  (_quantities['${p['name']}_${p['price']}'] ?? 0) > 0)
              .map((p) => {
                    'name': p['name'],
                    'price': p['price'],
                    'image': p['image'],
                    'quantity': _quantities['${p['name']}_${p['price']}'],
                  })
              .toList();
          Navigator.pushNamed(context, '/cart', arguments: {
            'dashboardProducts': cartProducts,
            'dashboardFavoriteProducts': [],
            'currentPoints': 0,
          });
        },

        //  Perfil
        onProfile: () {
          setState(() => _selectedMenu = 'profile');
          Navigator.pushNamed(context, '/profile');
        },
      ),
    );
  }
}

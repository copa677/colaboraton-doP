import 'package:flutter/material.dart';

typedef NavCallback = void Function();

class BottomMenu extends StatelessWidget {
  final int? cartBadge;
  final NavCallback onFavorites;
  final NavCallback onDelivery;
  final NavCallback onCart;
  final NavCallback onProfile;
  final String selected; // 'favorites' | 'delivery' | 'cart' | 'profile'

  const BottomMenu({
    super.key,
    this.cartBadge,
    required this.onFavorites,
    required this.onDelivery,
    required this.onCart,
    required this.onProfile,
    this.selected = '',
  });

  Widget _buildItem(
    IconData icon,
    String label,
    bool isSelected,
    VoidCallback onTap, {
    int? badge,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.red : Colors.grey[200],
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              spreadRadius: 0,
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.white : Colors.grey[600],
              size: 28,
            ),
            if (badge != null && badge > 0)
              Positioned(
                right: -8,
                top: -8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Color(0xFFFF9800),
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 20,
                    minHeight: 20,
                  ),
                  child: Center(
                    child: Text(
                      '$badge',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 10,
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildItem(
              Icons.favorite_border,
              'Favoritos',
              selected == 'favorites',
              onFavorites,
            ),
            _buildItem(
              Icons.motorcycle,
              'Delivery',
              selected == 'delivery',
              onDelivery,
            ),
            _buildItem(
              Icons.shopping_cart_outlined,
              'Carrito',
              selected == 'cart',
              onCart,
              badge: cartBadge,
            ),
            _buildItem(
              Icons.person,
              'Perfil',
              selected == 'profile',
              onProfile,
            ),
          ],
        ),
      ),
    );
  }
}

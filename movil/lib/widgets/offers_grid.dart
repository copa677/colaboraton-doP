import 'package:flutter/material.dart';
import 'offer_card.dart';

class OffersGrid extends StatelessWidget {
  final List<Map<String, dynamic>> offers;
  final Set<String> favorites;
  final Map<String, int> quantities;
  final void Function(String id) onAdd;
  final void Function(String id) onRemove;
  final void Function(String id) onToggleFavorite;

  const OffersGrid({
    super.key,
    required this.offers,
    required this.favorites,
    required this.quantities,
    required this.onAdd,
    required this.onRemove,
    required this.onToggleFavorite,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      physics: const BouncingScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: offers.length,
      itemBuilder: (context, i) {
        final offer = offers[i];
        final id = '${offer['name']}_${offer['price']}';
        final isFav = favorites.contains(id);
        final qty = quantities[id] ?? 0;

        return OfferCard(
          product: offer,
          isFavorite: isFav,
          quantity: qty,
          onAdd: () => onAdd(id),
          onRemove: () => onRemove(id),
          onToggleFavorite: () => onToggleFavorite(id),
        );
      },
    );
  }
}

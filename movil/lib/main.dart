import 'package:fast_pedido/screens/profile_screen.dart';
import 'package:flutter/material.dart';
import 'screens/dashboard_screen.dart';
import 'screens/favorites_screen.dart';
import 'screens/orders_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/delivery_date_screen.dart';
import 'screens/billing_details_screen.dart';
import 'screens/credit_card_screen.dart';
import 'screens/qr_payment_screen.dart';
import 'screens/login.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FastPedido',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.red,
        scaffoldBackgroundColor: Colors.white,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const DashboardScreen(),
        '/favorites': (context) => const FavoritesScreen(),
        '/orders': (context) => const OrdersScreen(),
        '/cart': (context) => const CartScreen(),
        '/delivery-date': (context) => const DeliveryDateScreen(),
        '/billing-details': (context) => const BillingDetailsScreen(),
        '/credit-card': (context) => const CreditCardScreen(),
        '/qr-payment': (context) => const QRPaymentScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/login': (context) => const LoginScreen(),
      },
    );
  }
}

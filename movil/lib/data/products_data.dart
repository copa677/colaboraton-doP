/// Archivo centralizado de datos de productos para FastPedido
/// Organiza todos los productos por categoría de uso para mejorar la modularidad

class ProductsData {
  // Categorías principales para navegación
  static const List<Map<String, dynamic>> categories = [
    {'name': 'Verduras', 'image': 'assets/images/categoria/verduras.png'},
    {'name': 'Carnes', 'image': 'assets/images/categoria/carnes.png'},
    {'name': 'Lácteos', 'image': 'assets/images/categoria/lacteos.png'},
  ];

  // Productos en oferta para el dashboard
  static const List<Map<String, dynamic>> offers = [
    {
      'name': 'Carne molida\nde segunda',
      'price': 'Bs. 53.10',
      'originalPrice': 'Bs. 65.00',
      'discount': '18%',
      'image': 'assets/images/ofertas/carnemolidasegunda.png',
    },
    {
      'name': 'Cereal Nestle\nChocapic\n250gr',
      'price': 'Bs. 46.80',
      'originalPrice': 'Bs. 58.50',
      'discount': '20%',
      'image': 'assets/images/ofertas/chocapic.png',
    },
    {
      'name': 'Gaseosa\nCoca Cola de\n3lt',
      'price': 'Bs. 18.00',
      'originalPrice': 'Bs. 22.50',
      'discount': '20%',
      'image': 'assets/images/ofertas/cocacola3l.png',
    },
  ];

  // Productos recomendados para el dashboard y pantalla de recomendados
  static const List<Map<String, dynamic>> recommended = [
    {
      'name': 'Cerveza\nPaceña Lata\n269 ml CBX',
      'price': 'Bs. 7.40',
      'image': 'assets/images/recomendacion/cerveza.png',
    },
    {
      'name': 'Cereales\nLucky Charms',
      'price': 'Bs. 69.00',
      'image': 'assets/images/recomendacion/cereales.png',
    },
    {
      'name': 'Nutella',
      'price': 'Bs. 176.00',
      'image': 'assets/images/recomendacion/nutella.png',
    },
    {
      'name': 'Gaseosa Coca Cola Clasica Pack 6 un 300 ml',
      'price': 'Bs. 19.00',
      'image': 'assets/images/recomendacion/coca_pack.png',
    },
    {
      'name': 'Gaseosa Coca Cola Original Two Pack 3 L',
      'price': 'Bs. 38.00',
      'image': 'assets/images/recomendacion/coca_3lt.png',
    },
    {
      'name': 'Whisky Johnnie Walker Black Label 1 L',
      'price': 'Bs. 670.00',
      'image': 'assets/images/recomendacion/wisky.png',
    },
    {
      'name': 'Whisky Johnnie Walker Swing 750 ml',
      'price': 'Bs. 885.00',
      'image': 'assets/images/recomendacion/wiskyW.png',
    },
    {
      'name': 'Hamburguesa Hipermaxi Carne 6 un',
      'price': 'Bs. 31.90',
      'image': 'assets/images/recomendacion/hamburguesa.png',
    },
    {
      'name': 'Helado Delizia Chocolate 1 L',
      'price': 'Bs. 26.50',
      'image': 'assets/images/recomendacion/helado.png',
    },
  ];

  // Sugerencias para la pantalla del carrito
  static const List<Map<String, dynamic>> suggestions = [
    {
      'name': 'Carne molida\nde segunda',
      'price': 'Bs. 53.10',
      'image': 'assets/images/carne_molida.png',
    },
    {
      'name': 'Jugo Aquarius Pera 3 L',
      'price': 'Bs. 20.00',
      'image': 'assets/images/aquario.png',
    },
    {
      'name': 'Detergente Polvo Omo Limon 1800 gr',
      'price': 'Bs. 59.90',
      'image': 'assets/images/detergente.png',
    },
  ];

  // Productos organizados por categoría para navegación detallada
  static const Map<String, List<Map<String, dynamic>>> productsByCategory = {
    'Verduras': [
      {
        'name': 'Lechuga',
        'price': 'Bs. 8.50',
        'image': 'assets/images/verduras/lechuga.jpg',
      },
      {
        'name': 'Tomate',
        'price': 'Bs. 6.00',
        'image': 'assets/images/verduras/tomate.png',
      },
      {
        'name': 'Zanahoria',
        'price': 'Bs. 5.50',
        'image': 'assets/images/verduras/zanahoria.png',
      },
      {
        'name': 'Cebolla',
        'price': 'Bs. 4.00',
        'image': 'assets/images/verduras/cebolla.png',
      },
    ],
    'Carnes': [
      {
        'name': 'Carne Molida de Primera',
        'price': 'Bs. 82.00',
        'image': 'assets/images/carnes/carnemolida.png',
      },
      {
        'name': 'Filete de Pechuga Sofia 1 kg Bandeja',
        'price': 'Bs. 56.90',
        'image': 'assets/images/carnes/filete_pollo_1kg.png',
      },
      {
        'name': 'Picaña Frigor al Vacio kg',
        'price': 'Bs. 166.00',
        'image': 'assets/images/carnes/picaña_frigor.png',
      },
      {
        'name': 'Pollo Frial Entero Sofia kg',
        'price': 'Bs. 24.90',
        'image': 'assets/images/carnes/pollo_frial.png',
      },
      {
        'name': 'Silpancho kg',
        'price': 'Bs. 66.00',
        'image': 'assets/images/carnes/silpancho_procesado.png',
      },
      {
        'name': 'Milanesa de Pollo kg',
        'price': 'Bs. 66.00',
        'image': 'assets/images/carnes/milanesa.png',
      },
    ],
    'Lácteos': [
      {
        'name': 'Nueva Leche Pil Deslactosada 800 ml',
        'price': 'Bs. 9.90',
        'image': 'assets/images/lacteos/leche_delactosada_pil.png',
      },
      {
        'name': 'Mantequilla Pil Con Sal 200 gr',
        'price': 'Bs. 24.50',
        'image': 'assets/images/lacteos/mamtequilla_pil_conSal_200gr.png',
      },
      {
        'name': 'Dulce de Leche Pil 500 gr',
        'price': 'Bs. 25.00',
        'image': 'assets/images/lacteos/dulce_leche_pil.png',
      },
      {
        'name': 'Yogurt Pil Bebible Frutilla 1 L',
        'price': 'Bs. 16.90',
        'image': 'assets/images/lacteos/yogurt_bebible_1lt.png',
      },
      {
        'name': 'Yogurt Griego Delizia Sabor Fresa 170 gr',
        'price': 'Bs. 9.30',
        'image': 'assets/images/lacteos/yogurt_griego.png',
      },
      {
        'name': 'Queso San German Yapacani un',
        'price': 'Bs. 75.00',
        'image': 'assets/images/lacteos/queso_yapacani.png',
      },
    ],
  };

  // Productos favoritos predefinidos para favorites_screen.dart
  static const List<Map<String, dynamic>> favoriteProducts = [
    {
      'name': 'Gaseosa Pepsi\n500 Ml',
      'price': 'Bs. 8.00',
      'image': 'assets/images/favoritos/pepsi.png',
    },
    {
      'name': 'Papas Pringles\nOriginal 124 gr',
      'price': 'Bs. 49.00',
      'image': 'assets/images/favoritos/pringles.png',
    },
    {
      'name': 'Takis Fuego\nMax 240 gr',
      'price': 'Bs. 43.00',
      'image': 'assets/images/favoritos/takis.png',
    },
    {
      'name': 'Popcorn ACT II\nMantequilla\n99 gr',
      'price': 'Bs. 20.50',
      'image': 'assets/images/favoritos/popcorn.png',
    },
    {
      'name': 'Whisky Black\nLabel 750 ml',
      'price': 'Bs. 525.00',
      'image': 'assets/images/favoritos/whisky.png',
    },
    {
      'name': 'Singani Casa\nReal Etiqueta\nNegra 1 L',
      'price': 'Bs. 98.00',
      'image': 'assets/images/favoritos/singani.png',
    },
    {
      'name': 'Paneton\nHuereñito\nChocolate 600 g',
      'price': 'Bs. 39.90',
      'image': 'assets/images/favoritos/paneton.png',
    },
    {
      'name': 'Leche\nChocolatosa\nPil 800 ml',
      'price': 'Bs. 16.80',
      'image': 'assets/images/favoritos/leche.png',
    },
  ];

  // Lista dinámica de favoritos (se llena desde otros screens)
  static List<Map<String, dynamic>> favorites = [];

  // Productos para la pantalla de ofertas (puede incluir productos adicionales)
  static const List<Map<String, dynamic>> allOffers = [
    ...offers, // Incluye todas las ofertas del dashboard
    // Aquí se pueden agregar más ofertas específicas para la pantalla de ofertas
    {
      'name': 'Arroz\nGrano Oro\n1kg',
      'price': 'Bs. 12.90',
      'originalPrice': 'Bs. 15.50',
      'discount': '17%',
      'image': 'assets/images/ofertas/arroz.png',
    },
    {
      'name': 'Aceite\nCristal\n900ml',
      'price': 'Bs. 18.50',
      'originalPrice': 'Bs. 22.00',
      'discount': '16%',
      'image': 'assets/images/ofertas/aceite.png',
    },
  ];

  // Órdenes de ejemplo para orders_screen.dart
  static final List<Map<String, dynamic>> orders = [
    {
      'orderNumber': '116452',
      'branch': 'Sucursal: Hiper del 2do anillo',
      'requestDate': '15-10-2025',
      'deliveryDate': '08-11-2025',
      'deliveryTime': '17:00',
      'products': [
        {
          'name': 'Coca Cola 3 lts',
          'price': 'Bs. 45',
          'weight': '15 bs',
          'quantity': 3,
        },
        {
          'name':
              'Papel Higiénico Scott de 3 Capas\nFull algodón de 6 unidades',
          'price': 'Bs. 30',
          'weight': '15 bs',
          'quantity': 2,
        },
      ],
      'totalPartial': 'Bs. 75',
      'shippingCost': 'Bs. 10',
      'totalCost': 'Bs. 85',
    },
    {
      'orderNumber': '116453',
      'branch': 'Sucursal: Hiper del 2do anillo',
      'requestDate': '08-09-2025',
      'deliveryDate': '10-09-2025',
      'deliveryTime': '09:30',
      'products': [
        {
          'name': 'Leche Pil 1L',
          'price': 'Bs. 12',
          'weight': '10 bs',
          'quantity': 2,
        },
      ],
      'totalPartial': 'Bs. 24',
      'shippingCost': 'Bs. 8',
      'totalCost': 'Bs. 32',
    },
    {
      'orderNumber': '116454',
      'branch': 'Sucursal: Hiper del 2do anillo',
      'requestDate': '04-07-2025',
      'deliveryDate': '06-07-2025',
      'deliveryTime': '14:00',
      'products': [
        {
          'name': 'Arroz Superior 1kg',
          'price': 'Bs. 18',
          'weight': '12 bs',
          'quantity': 1,
        },
        {
          'name': 'Aceite 123 500ml',
          'price': 'Bs. 25',
          'weight': '8 bs',
          'quantity': 1,
        },
      ],
      'totalPartial': 'Bs. 43',
      'shippingCost': 'Bs. 12',
      'totalCost': 'Bs. 55',
    },
  ];

  // Método para obtener todos los productos (útil para búsquedas globales)
  static List<Map<String, dynamic>> getAllProducts() {
    List<Map<String, dynamic>> allProducts = [];

    // Agregar ofertas
    allProducts.addAll(offers);

    // Agregar recomendados
    allProducts.addAll(recommended);

    // Agregar sugerencias
    allProducts.addAll(suggestions);

    // Agregar productos por categoría
    for (var categoryProducts in productsByCategory.values) {
      allProducts.addAll(categoryProducts);
    }

    // Agregar ofertas adicionales
    allProducts.addAll(allOffers);

    return allProducts;
  }

  // Método para buscar productos por nombre
  static List<Map<String, dynamic>> searchProducts(String query) {
    final allProducts = getAllProducts();
    final lowerQuery = query.toLowerCase();

    return allProducts.where((product) {
      final productName = product['name']?.toString().toLowerCase() ?? '';
      return productName.contains(lowerQuery);
    }).toList();
  }

  // Método para obtener productos de una categoría específica
  static List<Map<String, dynamic>> getProductsByCategory(String categoryName) {
    return productsByCategory[categoryName] ?? [];
  }

  // Método para obtener un producto por ID (útil para carritos y favoritos)
  static Map<String, dynamic>? getProductById(String productId) {
    final allProducts = getAllProducts();

    for (var product in allProducts) {
      final id = '${product['name']}_${product['price']}';
      if (id == productId) {
        return product;
      }
    }

    return null;
  }
}

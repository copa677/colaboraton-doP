class PointsService {
  // Singleton global
  static final PointsService _instance = PointsService._internal();
  factory PointsService() => _instance;
  PointsService._internal();

  int _userPoints = 0;

  int get userPoints => _userPoints;

  // Extrae los puntos desde el texto del precio
  int calculatePointsFromPrice(String price) {
    final match = RegExp(r'\d+').firstMatch(price);
    if (match != null) {
      final value = int.tryParse(match.group(0) ?? '0') ?? 0;
      return value;
    }
    return 0;
  }

  // Sumar o restar puntos
  void updatePoints(String price, {required bool isAdding}) {
    final points = calculatePointsFromPrice(price);
    if (isAdding) {
      _userPoints += points;
    } else {
      _userPoints = (_userPoints - points).clamp(0, double.infinity).toInt();
    }
  }

  void reset() {
    _userPoints = 0;
  }
}

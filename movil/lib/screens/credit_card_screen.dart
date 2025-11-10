import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ExpiryDateFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    // Solo permitir números
    String newText = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');

    // Limitar a 4 dígitos máximo
    if (newText.length > 4) {
      newText = newText.substring(0, 4);
    }

    // Agregar / después del segundo dígito
    if (newText.length >= 3) {
      newText = '${newText.substring(0, 2)}/${newText.substring(2)}';
    }

    return TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: newText.length),
    );
  }
}

class CardNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    // Solo permitir números
    String newText = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');

    // Limitar a 16 dígitos máximo
    if (newText.length > 16) {
      newText = newText.substring(0, 16);
    }

    // Agregar espacios cada 4 dígitos
    String formatted = '';
    for (int i = 0; i < newText.length; i++) {
      if (i > 0 && i % 4 == 0) {
        formatted += ' ';
      }
      formatted += newText[i];
    }

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

class CreditCardScreen extends StatefulWidget {
  const CreditCardScreen({super.key});

  @override
  State<CreditCardScreen> createState() => _CreditCardScreenState();
}

class _CreditCardScreenState extends State<CreditCardScreen> {
  final TextEditingController _cardHolderController = TextEditingController();
  final TextEditingController _cardNumberController = TextEditingController();
  final TextEditingController _expiryDateController = TextEditingController();
  final TextEditingController _securityCodeController = TextEditingController();
  bool _saveCard = false;
  bool _obscureSecurityCode = true;

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
          'Tarjeta Crédito / Débito',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ),
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Campo Nombre del Titular
              _buildTextField(
                controller: _cardHolderController,
                label: 'Nombre del Titular de la tarjeta *',
                hintText: 'Ingresa el nombre completo',
              ),
              const SizedBox(height: 20),

              // Campo Número de Tarjeta
              _buildTextField(
                controller: _cardNumberController,
                label: 'Número de la Tarjeta *',
                hintText: 'XXXX XXXX XXXX XXXX',
                keyboardType: TextInputType.number,
                inputFormatters: [CardNumberFormatter()],
                maxLength: 19, // 16 dígitos + 3 espacios
              ),
              const SizedBox(height: 20),

              // Campo Fecha de Vencimiento
              _buildTextField(
                controller: _expiryDateController,
                label: 'Fecha de Vencimiento *',
                hintText: 'MM/YY',
                keyboardType: TextInputType.number,
                inputFormatters: [ExpiryDateFormatter()],
                maxLength: 5,
              ),
              const SizedBox(height: 20),

              // Campo Código de Seguridad
              _buildSecurityCodeField(),
              const SizedBox(height: 30),

              // Checkbox para guardar tarjeta
              Row(
                children: [
                  Checkbox(
                    value: _saveCard,
                    onChanged: (value) {
                      setState(() {
                        _saveCard = value ?? false;
                      });
                    },
                    activeColor: Colors.red,
                  ),
                  const Expanded(
                    child: Text(
                      'Quiero guardar esta tarjeta para mi próxima compra',
                      style: TextStyle(fontSize: 14, color: Colors.black87),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 40),

              // Botón Pagar
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    _processPayment();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Pagar',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hintText,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    int? maxLength,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: Colors.black87,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          maxLength: maxLength,
          decoration: InputDecoration(
            counterText: maxLength != null ? '' : null, // Ocultar contador
            hintText: hintText,
            hintStyle: TextStyle(fontSize: 14, color: Colors.grey[400]),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Colors.red),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSecurityCodeField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Código de Seguridad *',
          style: TextStyle(
            fontSize: 14,
            color: Colors.black87,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _securityCodeController,
          keyboardType: TextInputType.number,
          obscureText: _obscureSecurityCode,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(3),
          ],
          maxLength: 3,
          decoration: InputDecoration(
            counterText: '', // Ocultar contador
            hintText: 'XXX',
            hintStyle: TextStyle(fontSize: 14, color: Colors.grey[400]),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Colors.red),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureSecurityCode ? Icons.visibility_off : Icons.visibility,
                color: Colors.grey[600],
              ),
              onPressed: () {
                setState(() {
                  _obscureSecurityCode = !_obscureSecurityCode;
                });
              },
            ),
          ),
        ),
      ],
    );
  }

  void _processPayment() {
    // Validar campos
    if (_cardHolderController.text.trim().isEmpty ||
        _cardNumberController.text.trim().isEmpty ||
        _expiryDateController.text.trim().isEmpty ||
        _securityCodeController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor, completa todos los campos requeridos.'),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }

    // Simular procesamiento de pago
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return WillPopScope(
          onWillPop: () async => false,
          child: const AlertDialog(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(color: Colors.red),
                SizedBox(height: 16),
                Text('Procesando pago...'),
              ],
            ),
          ),
        );
      },
    );

    // Simular delay de procesamiento
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        Navigator.of(context).pop(); // Cerrar diálogo de carga
        _showPaymentSuccess();
      }
    });
  }

  void _showPaymentSuccess() {
    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 28),
              SizedBox(width: 8),
              Text('¡Pago Exitoso!'),
            ],
          ),
          content: const Text(
            'Tu pago ha sido procesado exitosamente.\nTu pedido ha sido confirmado.',
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Navegar a Orders
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  '/orders',
                  (route) => route.settings.name == '/',
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Ver Pedidos'),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _cardHolderController.dispose();
    _cardNumberController.dispose();
    _expiryDateController.dispose();
    _securityCodeController.dispose();
    super.dispose();
  }
}

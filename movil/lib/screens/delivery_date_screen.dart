import 'package:flutter/material.dart';

class DeliveryDateScreen extends StatefulWidget {
  const DeliveryDateScreen({super.key});

  @override
  State<DeliveryDateScreen> createState() => _DeliveryDateScreenState();
}

class _DeliveryDateScreenState extends State<DeliveryDateScreen> {
  DateTime selectedDate = DateTime(2025, 8, 17);
  DateTime currentMonth = DateTime(2025, 8);
  int selectedHour = 20;
  int selectedMinute = 0;
  bool showTimeSelector = false;

  double? _totalAmount;
  String? _deliveryType;

  // Controladores para los campos de tiempo
  late TextEditingController _hourController;
  late TextEditingController _minuteController;

  @override
  void initState() {
    super.initState();
    _hourController = TextEditingController(
      text: selectedHour.toString().padLeft(2, '0'),
    );
    _minuteController = TextEditingController(
      text: selectedMinute.toString().padLeft(2, '0'),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Obtener el total y tipo de entrega pasados desde la pantalla anterior
    final arguments =
        ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    _totalAmount = arguments?['totalAmount'];
    _deliveryType = arguments?['deliveryType'];
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
        title: Text(
          _deliveryType == 'pickup' ? 'Fecha para Recoger' : 'Fecha de Entrega',
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ),
      body: Stack(
        children: [
          // Contenido principal
          Column(
            children: [
              Expanded(
                child: Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F1E8),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        spreadRadius: 0,
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header con fecha seleccionada
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Seleccionar fecha',
                            style: TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                          IconButton(
                            icon: const Icon(Icons.edit, size: 20),
                            onPressed: () {
                              // Permitir editar la fecha
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _formatSelectedDate(selectedDate),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Selector de mes y año
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _formatMonthYear(currentMonth),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.chevron_left),
                                onPressed: () {
                                  setState(() {
                                    currentMonth = DateTime(
                                      currentMonth.year,
                                      currentMonth.month - 1,
                                    );
                                  });
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.chevron_right),
                                onPressed: () {
                                  setState(() {
                                    currentMonth = DateTime(
                                      currentMonth.year,
                                      currentMonth.month + 1,
                                    );
                                  });
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Días de la semana
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S']
                            .map(
                              (day) => SizedBox(
                                width: 40,
                                child: Text(
                                  day,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                      const SizedBox(height: 16),

                      // Calendario
                      Expanded(child: _buildCalendar()),

                      const SizedBox(height: 20),

                      // Botones inferiores
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton(
                            onPressed: () {
                              setState(() {
                                selectedDate = DateTime.now();
                              });
                            },
                            child: const Text(
                              'Limpiar',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                              ),
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              _showDateTimeConfirmation();
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Text(
                              'Continuar',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Overlay del selector de tiempo en la parte inferior
          if (showTimeSelector)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                decoration: const BoxDecoration(
                  color: Color(0xFFF5F1E8),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Ingresar hora',
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                    const SizedBox(height: 20),
                    _buildTimeSelector(),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        TextButton(
                          onPressed: () {
                            setState(() {
                              showTimeSelector = false;
                            });
                          },
                          child: const Text(
                            'Cancelar',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            setState(() {
                              showTimeSelector = false;
                            });
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 30,
                              vertical: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'OK',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCalendar() {
    // Obtener el primer día del mes
    DateTime firstDay = DateTime(currentMonth.year, currentMonth.month, 1);
    // Obtener el último día del mes
    DateTime lastDay = DateTime(currentMonth.year, currentMonth.month + 1, 0);
    // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    int firstWeekday = firstDay.weekday % 7;

    List<Widget> calendarDays = [];

    // Agregar espacios vacíos para los días anteriores al primer día del mes
    for (int i = 0; i < firstWeekday; i++) {
      calendarDays.add(const SizedBox(width: 40, height: 40));
    }

    // Agregar los días del mes
    for (int day = 1; day <= lastDay.day; day++) {
      DateTime dayDate = DateTime(currentMonth.year, currentMonth.month, day);
      bool isSelected =
          selectedDate.year == dayDate.year &&
          selectedDate.month == dayDate.month &&
          selectedDate.day == dayDate.day;

      calendarDays.add(
        GestureDetector(
          onTap: () {
            setState(() {
              selectedDate = dayDate;
              showTimeSelector = true;
            });
          },
          child: Container(
            width: 40,
            height: 40,
            margin: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: isSelected ? Colors.orange : Colors.transparent,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Text(
                day.toString(),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? Colors.white : Colors.black87,
                ),
              ),
            ),
          ),
        ),
      );
    }

    return GridView.count(crossAxisCount: 7, children: calendarDays);
  }

  Widget _buildTimeSelector() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Selector de hora editable
        Container(
          width: 80,
          decoration: BoxDecoration(
            color: Colors.orange[300],
            borderRadius: BorderRadius.circular(8),
          ),
          child: TextField(
            controller: _hourController,
            textAlign: TextAlign.center,
            keyboardType: TextInputType.number,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 15),
            ),
            onChanged: (value) {
              int? hour = int.tryParse(value);
              if (hour != null && hour >= 0 && hour <= 23) {
                setState(() {
                  selectedHour = hour;
                });
              }
            },
          ),
        ),
        const SizedBox(width: 10),
        const Text(
          ':',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(width: 10),
        // Selector de minutos editable
        Container(
          width: 80,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(8),
          ),
          child: TextField(
            controller: _minuteController,
            textAlign: TextAlign.center,
            keyboardType: TextInputType.number,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 15),
            ),
            onChanged: (value) {
              int? minute = int.tryParse(value);
              if (minute != null && minute >= 0 && minute <= 59) {
                setState(() {
                  selectedMinute = minute;
                });
              }
            },
          ),
        ),
        const SizedBox(width: 20),
        // Controles de hora
        Column(
          children: [
            GestureDetector(
              onTap: () {
                setState(() {
                  selectedHour = (selectedHour + 1) % 24;
                  _hourController.text = selectedHour.toString().padLeft(
                    2,
                    '0',
                  );
                });
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                child: const Icon(Icons.keyboard_arrow_up, size: 24),
              ),
            ),
            const Text(
              'Hora',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            GestureDetector(
              onTap: () {
                setState(() {
                  selectedHour = selectedHour > 0 ? selectedHour - 1 : 23;
                  _hourController.text = selectedHour.toString().padLeft(
                    2,
                    '0',
                  );
                });
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                child: const Icon(Icons.keyboard_arrow_down, size: 24),
              ),
            ),
          ],
        ),
        const SizedBox(width: 20),
        // Controles de minutos
        Column(
          children: [
            GestureDetector(
              onTap: () {
                setState(() {
                  selectedMinute = (selectedMinute + 15) % 60;
                  _minuteController.text = selectedMinute.toString().padLeft(
                    2,
                    '0',
                  );
                });
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                child: const Icon(Icons.keyboard_arrow_up, size: 24),
              ),
            ),
            const Text(
              'Minuto',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            GestureDetector(
              onTap: () {
                setState(() {
                  selectedMinute = selectedMinute >= 15
                      ? selectedMinute - 15
                      : 45;
                  _minuteController.text = selectedMinute.toString().padLeft(
                    2,
                    '0',
                  );
                });
              },
              child: Container(
                padding: const EdgeInsets.all(8),
                child: const Icon(Icons.keyboard_arrow_down, size: 24),
              ),
            ),
          ],
        ),
      ],
    );
  }

  String _formatSelectedDate(DateTime date) {
    const List<String> months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const List<String> weekdays = [
      'Lun',
      'Mar',
      'Mié',
      'Jue',
      'Vie',
      'Sáb',
      'Dom',
    ];

    String weekday = weekdays[date.weekday - 1];
    String month = months[date.month - 1];

    return '$weekday, $month ${date.day}';
  }

  String _formatMonthYear(DateTime date) {
    const List<String> months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return '${months[date.month - 1]} ${date.year}';
  }

  void _showDateTimeConfirmation() {
    String formattedDate = _formatSelectedDate(selectedDate);
    String formattedTime =
        '${selectedHour.toString().padLeft(2, '0')}:${selectedMinute.toString().padLeft(2, '0')}';

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirmar Fecha y Hora'),
          content: Text(
            'Fecha: $formattedDate\nHora: $formattedTime\n\n¿Está correcta la información?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Cambiar'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.pushNamed(
                  context,
                  '/billing-details',
                  arguments: {'totalAmount': _totalAmount},
                );
              },
              child: const Text('Continuar'),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _hourController.dispose();
    _minuteController.dispose();
    super.dispose();
  }
}

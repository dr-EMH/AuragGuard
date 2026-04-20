import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/location_service.dart';

class SosScreen extends StatefulWidget {
  const SosScreen({super.key});

  @override
  State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _ringController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _ringAnimation;

  bool _sosActivated = false;
  int _countdown = 5;
  Position? _currentPosition;
  String _locationStatus = 'جاري تحديد موقعك...';
  bool _locationLoaded = false;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _loadLocation(); // تحميل الموقع فور فتح الشاشة
  }

  void _setupAnimations() {
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _ringController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();

    _ringAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _ringController, curve: Curves.easeOut),
    );
  }

  // ====== تحميل الموقع ======
  Future<void> _loadLocation() async {
    setState(() => _locationStatus = '📡 جاري تحديد موقعك...');

    Position? position = await LocationService.getCurrentLocation();

    if (position != null) {
      setState(() {
        _currentPosition = position;
        _locationLoaded = true;
        _locationStatus =
        '✅ تم تحديد موقعك\n${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
      });
    } else {
      setState(() {
        _locationStatus = '❌ تعذر تحديد الموقع\nتأكد من تفعيل GPS';
        _locationLoaded = false;
      });
    }
  }

  // ====== تفعيل SOS ======
  void _activateSOS() {
    setState(() => _sosActivated = true);
    _startCountdown();
  }

  void _startCountdown() async {
    for (int i = 5; i >= 0; i--) {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) setState(() => _countdown = i);
    }
    if (mounted && _sosActivated) {
      await _sendSOS();
    }
  }

  // ====== إرسال SOS ======
  Future<void> _sendSOS() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> phones = prefs.getStringList('contact_phones') ?? [];

    if (phones.isEmpty) {
      _showNoContactsDialog();
      return;
    }

    // بناء رسالة الطوارئ
    String message;
    if (_currentPosition != null) {
      message = LocationService.buildSOSMessage(_currentPosition!);
    } else {
      message = '🚨 نداء استغاثة من AuraGuard!\nأحتاج مساعدة فورية!\n❌ تعذر تحديد الموقع';
    }

    // إرسال SMS لكل جهة اتصال
    for (String phone in phones) {
      final Uri smsUri = Uri(
        scheme: 'sms',
        path: phone,
        queryParameters: {'body': message},
      );
      if (await canLaunchUrl(smsUri)) {
        await launchUrl(smsUri);
      }
    }

    if (mounted) _showSOSSent();
  }

  void _cancelSOS() {
    setState(() {
      _sosActivated = false;
      _countdown = 5;
    });
  }

  // ====== ديالوج: لا توجد جهات اتصال ======
  void _showNoContactsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Colors.orange),
        ),
        title: const Column(
          children: [
            Icon(Icons.warning_amber, color: Colors.orange, size: 50),
            SizedBox(height: 10),
            Text(
              'لا توجد جهات اتصال!',
              style: TextStyle(color: Colors.white),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        content: const Text(
          'أضف جهات اتصال موثوقة من شاشة الإعدادات أولاً',
          style: TextStyle(color: Colors.white54),
          textAlign: TextAlign.center,
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _cancelSOS();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('حسناً', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // ====== ديالوج: تم الإرسال ======
  void _showSOSSent() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Colors.red),
        ),
        title: const Column(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 50),
            SizedBox(height: 10),
            Text(
              'تم إرسال نداء الاستغاثة!',
              style: TextStyle(color: Colors.white, fontSize: 18),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        content: const Text(
          'تم إخطار جهات الاتصال الموثوقة بموقعك الحالي',
          style: TextStyle(color: Colors.white54),
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('حسناً', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _ringController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'نظام الطوارئ 🚨',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // ====== بطاقة الموقع ======
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 30),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _locationLoaded
                    ? Colors.green.withOpacity(0.1)
                    : Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(
                  color: _locationLoaded
                      ? Colors.green.withOpacity(0.4)
                      : Colors.orange.withOpacity(0.4),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _locationLoaded ? Icons.location_on : Icons.location_off,
                    color: _locationLoaded ? Colors.green : Colors.orange,
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _locationStatus,
                      style: TextStyle(
                        color: _locationLoaded ? Colors.green : Colors.orange,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  // زرار تحديث الموقع
                  IconButton(
                    onPressed: _loadLocation,
                    icon: const Icon(Icons.refresh, color: Colors.white38, size: 20),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // ====== نص الحالة ======
            Text(
              _sosActivated ? 'سيتم إرسال نداء الاستغاثة!' : 'اضغط للاستغاثة',
              style: TextStyle(
                color: _sosActivated ? Colors.red : Colors.white70,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),

            if (_sosActivated)
              Text(
                'خلال $_countdown ثانية',
                style: const TextStyle(color: Colors.orange, fontSize: 14),
              ),

            const SizedBox(height: 40),

            // ====== زرار SOS ======
            Stack(
              alignment: Alignment.center,
              children: [
                if (_sosActivated) ...[
                  AnimatedBuilder(
                    animation: _ringAnimation,
                    builder: (context, child) {
                      return Container(
                        width: 160 + (100 * _ringAnimation.value),
                        height: 160 + (100 * _ringAnimation.value),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.red.withOpacity(1 - _ringAnimation.value),
                            width: 2,
                          ),
                        ),
                      );
                    },
                  ),
                  AnimatedBuilder(
                    animation: _ringAnimation,
                    builder: (context, child) {
                      double offset = (_ringAnimation.value + 0.5) % 1.0;
                      return Container(
                        width: 160 + (100 * offset),
                        height: 160 + (100 * offset),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.red.withOpacity(1 - offset),
                            width: 2,
                          ),
                        ),
                      );
                    },
                  ),
                ],
                AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _sosActivated ? _pulseAnimation.value : 1.0,
                      child: GestureDetector(
                        onTap: _sosActivated ? null : _activateSOS,
                        child: Container(
                          width: 180,
                          height: 180,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _sosActivated
                                ? Colors.red.withOpacity(0.3)
                                : Colors.red.withOpacity(0.15),
                            border: Border.all(
                              color: Colors.red,
                              width: _sosActivated ? 4 : 3,
                            ),
                            boxShadow: _sosActivated
                                ? [
                              BoxShadow(
                                color: Colors.red.withOpacity(0.5),
                                blurRadius: 30,
                                spreadRadius: 10,
                              )
                            ]
                                : [],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                _sosActivated ? Icons.warning_rounded : Icons.sos,
                                size: 70,
                                color: Colors.red,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _sosActivated ? '$_countdown' : 'SOS',
                                style: TextStyle(
                                  color: Colors.red,
                                  fontSize: _sosActivated ? 36 : 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),

            const SizedBox(height: 50),

            // ====== زرار الإلغاء ======
            if (_sosActivated)
              ElevatedButton.icon(
                onPressed: _cancelSOS,
                icon: const Icon(Icons.cancel, color: Colors.white),
                label: const Text(
                  'إلغاء الاستغاثة',
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[800],
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
              ),

            if (!_sosActivated)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 40),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.white38, size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'سيتم إرسال موقعك لجهات الاتصال الموثوقة فور الضغط',
                        style: TextStyle(color: Colors.white38, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
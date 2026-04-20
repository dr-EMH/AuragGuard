import 'package:geolocator/geolocator.dart';

class LocationService {
  // ====== طلب إذن الموقع ======
  static Future<bool> requestPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();

    // لو الإذن مرفوض، اطلبه
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    // لو رفض نهائياً
    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return permission == LocationPermission.whileInUse ||
        permission == LocationPermission.always;
  }

  // ====== جيب الموقع الحالي ======
  static Future<Position?> getCurrentLocation() async {
    try {
      // تأكد من الإذن أولاً
      bool hasPermission = await requestPermission();
      if (!hasPermission) return null;

      // جيب الموقع
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      return position;
    } catch (e) {
      return null;
    }
  }

  // ====== حوّل الموقع لرابط Google Maps ======
  static String getGoogleMapsLink(Position position) {
    return 'https://maps.google.com/?q=${position.latitude},${position.longitude}';
  }

  // ====== رسالة الطوارئ الكاملة ======
  static String buildSOSMessage(Position position) {
    final mapsLink = getGoogleMapsLink(position);
    return '🚨 نداء استغاثة من AuraGuard!\n'
        'أحتاج مساعدة فورية!\n'
        '📍 موقعي الحالي:\n$mapsLink\n'
        '⏰ الوقت: ${DateTime.now().toString().substring(0, 16)}';
  }
}
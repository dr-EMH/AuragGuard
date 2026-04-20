import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

class ApiService {
  // ====== عنوان السيرفر ======
  static const String baseUrl = 'http://localhost:3001';

  // ====== إرسال نداء استغاثة للسيرفر ======
  static Future<bool> sendSOSAlert({
    required Position position,
    String? userName,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/sos'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userName': userName ?? 'مستخدم AuraGuard',
          'latitude': position.latitude,
          'longitude': position.longitude,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 201) {
        print('✅ SOS sent to server successfully');
        return true;
      } else {
        print('❌ Server error: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ Connection error: $e');
      return false;
    }
  }

  // ====== تسجيل مستخدم جديد ======
  static Future<bool> registerUser({
    required String name,
    required String phone,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/users'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'phone': phone,
        }),
      );

      return response.statusCode == 201;
    } catch (e) {
      print('❌ Connection error: $e');
      return false;
    }
  }

  // ====== التحقق إن السيرفر شغال ======
  static Future<bool> checkServerStatus() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
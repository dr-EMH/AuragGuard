import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Map<String, dynamic>> _history = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> raw = prefs.getStringList('sos_history') ?? [];
    setState(() {
      _history = raw
          .map((e) => jsonDecode(e) as Map<String, dynamic>)
          .toList()
          .reversed
          .toList(); // الأحدث أولاً
    });
  }

  Future<void> _clearHistory() async {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Colors.red),
        ),
        title: const Text(
          'مسح السجل كله؟',
          style: TextStyle(color: Colors.white),
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء', style: TextStyle(color: Colors.white38)),
          ),
          ElevatedButton(
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove('sos_history');
              setState(() => _history = []);
              if (mounted) Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('امسح', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
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
          'سجل الحوادث 📋',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          if (_history.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep, color: Colors.red),
              onPressed: _clearHistory,
            ),
        ],
      ),
      body: _history.isEmpty ? _buildEmpty() : _buildList(),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history, size: 80, color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 20),
          const Text(
            'لا يوجد سجل بعد',
            style: TextStyle(color: Colors.white38, fontSize: 16),
          ),
          const SizedBox(height: 8),
          const Text(
            'هيتسجل هنا كل مرة تضغط SOS',
            style: TextStyle(color: Colors.white24, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _history.length,
      itemBuilder: (ctx, i) {
        final item = _history[i];
        final bool isTest = item['isTest'] == true;
        final DateTime time = DateTime.parse(item['timestamp']);
        final String timeStr =
            '${time.day}/${time.month}/${time.year}  ${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isTest
                ? Colors.blue.withOpacity(0.08)
                : Colors.red.withOpacity(0.08),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(
              color: isTest
                  ? Colors.blue.withOpacity(0.3)
                  : Colors.red.withOpacity(0.3),
            ),
          ),
          child: Row(
            children: [
              // أيقونة
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isTest
                      ? Colors.blue.withOpacity(0.15)
                      : Colors.red.withOpacity(0.15),
                ),
                child: Icon(
                  isTest ? Icons.science : Icons.sos,
                  color: isTest ? Colors.blue : Colors.red,
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),

              // التفاصيل
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isTest ? 'اختبار SOS' : '🚨 نداء استغاثة حقيقي',
                      style: TextStyle(
                        color: isTest ? Colors.blue : Colors.red,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      timeStr,
                      style:
                          const TextStyle(color: Colors.white38, fontSize: 12),
                    ),
                    if (item['location'] != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        '📍 ${item['location']}',
                        style: const TextStyle(
                            color: Colors.white54, fontSize: 12),
                      ),
                    ],
                    const SizedBox(height: 4),
                    Text(
                      'تم الإرسال لـ ${item['contactCount'] ?? 0} جهة اتصال',
                      style: const TextStyle(
                          color: Colors.white38, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ====== دالة مساعدة لحفظ حادثة جديدة في السجل ======
Future<void> saveSOSToHistory({
  required bool isTest,
  String? location,
  required int contactCount,
}) async {
  final prefs = await SharedPreferences.getInstance();
  final List<String> raw = prefs.getStringList('sos_history') ?? [];

  final newEntry = jsonEncode({
    'isTest': isTest,
    'timestamp': DateTime.now().toIso8601String(),
    'location': location,
    'contactCount': contactCount,
  });

  raw.add(newEntry);

  // احتفظ بآخر 50 حادثة بس
  if (raw.length > 50) raw.removeAt(0);

  await prefs.setStringList('sos_history', raw);
}
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // قائمة جهات الاتصال
  List<Map<String, String>> _contacts = [];

  // Controllers للـ input
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadContacts(); // تحميل جهات الاتصال المحفوظة
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  // ====== تحميل جهات الاتصال من الذاكرة ======
  Future<void> _loadContacts() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> names = prefs.getStringList('contact_names') ?? [];
    final List<String> phones = prefs.getStringList('contact_phones') ?? [];

    setState(() {
      _contacts = List.generate(
        names.length,
            (i) => {'name': names[i], 'phone': phones[i]},
      );
    });
  }

  // ====== حفظ جهات الاتصال في الذاكرة ======
  Future<void> _saveContacts() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      'contact_names',
      _contacts.map((c) => c['name']!).toList(),
    );
    await prefs.setStringList(
      'contact_phones',
      _contacts.map((c) => c['phone']!).toList(),
    );
  }

  // ====== إضافة جهة اتصال ======
  void _addContact() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: const Color(0xFF6C63FF).withOpacity(0.5)),
        ),
        title: const Text(
          'إضافة جهة اتصال',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // حقل الاسم
            TextField(
              controller: _nameController,
              style: const TextStyle(color: Colors.white),
              textAlign: TextAlign.right,
              decoration: InputDecoration(
                hintText: 'الاسم (مثال: محمد)',
                hintStyle: const TextStyle(color: Colors.white38),
                prefixIcon: const Icon(Icons.person, color: Color(0xFF6C63FF)),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: const Color(0xFF6C63FF).withOpacity(0.3),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF6C63FF)),
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.05),
              ),
            ),

            const SizedBox(height: 16),

            // حقل الرقم
            TextField(
              controller: _phoneController,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                hintText: 'رقم الهاتف (مثال: 01012345678)',
                hintStyle: const TextStyle(color: Colors.white38),
                prefixIcon: const Icon(Icons.phone, color: Color(0xFF6C63FF)),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: const Color(0xFF6C63FF).withOpacity(0.3),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF6C63FF)),
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.05),
              ),
            ),
          ],
        ),
        actions: [
          // زرار إلغاء
          TextButton(
            onPressed: () {
              _nameController.clear();
              _phoneController.clear();
              Navigator.pop(context);
            },
            child: const Text(
              'إلغاء',
              style: TextStyle(color: Colors.white38),
            ),
          ),

          // زرار حفظ
          ElevatedButton(
            onPressed: () {
              if (_nameController.text.isNotEmpty &&
                  _phoneController.text.isNotEmpty) {
                setState(() {
                  _contacts.add({
                    'name': _nameController.text,
                    'phone': _phoneController.text,
                  });
                });
                _saveContacts();
                _nameController.clear();
                _phoneController.clear();
                Navigator.pop(context);

                // رسالة نجاح
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('✅ تمت إضافة جهة الاتصال'),
                    backgroundColor: Colors.green,
                    duration: Duration(seconds: 2),
                  ),
                );
              } else {
                // رسالة خطأ
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('❌ من فضلك ادخل الاسم والرقم'),
                    backgroundColor: Colors.red,
                    duration: Duration(seconds: 2),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6C63FF),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'حفظ',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  // ====== حذف جهة اتصال ======
  void _deleteContact(int index) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Colors.red),
        ),
        title: const Text(
          'حذف جهة الاتصال؟',
          style: TextStyle(color: Colors.white),
          textAlign: TextAlign.center,
        ),
        content: Text(
          'هتحذف ${_contacts[index]['name']} من قائمة الطوارئ',
          style: const TextStyle(color: Colors.white54),
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              'إلغاء',
              style: TextStyle(color: Colors.white38),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() => _contacts.removeAt(index));
              _saveContacts();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('🗑️ تم حذف جهة الاتصال'),
                  backgroundColor: Colors.orange,
                  duration: Duration(seconds: 2),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'حذف',
              style: TextStyle(color: Colors.white),
            ),
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
          'جهات الاتصال 👥',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        // زرار إضافة في الـ AppBar
        actions: [
          IconButton(
            onPressed: _addContact,
            icon: const Icon(Icons.add_circle, color: Color(0xFF6C63FF), size: 30),
          ),
        ],
      ),
      body: Column(
        children: [
          // بانر المعلومات
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF).withOpacity(0.1),
              borderRadius: BorderRadius.circular(15),
              border: Border.all(
                color: const Color(0xFF6C63FF).withOpacity(0.3),
              ),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: Color(0xFF6C63FF), size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'أضف جهات اتصال موثوقة سيتم إخطارها فور تفعيل نداء الاستغاثة',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

          // عداد جهات الاتصال
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'جهات الاتصال (${_contacts.length}/5)',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (_contacts.isNotEmpty)
                  Text(
                    '${5 - _contacts.length} متبقية',
                    style: const TextStyle(color: Colors.white38, fontSize: 12),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // قائمة جهات الاتصال
          Expanded(
            child: _contacts.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _contacts.length,
              itemBuilder: (context, index) {
                return _buildContactCard(index);
              },
            ),
          ),

          // زرار الإضافة في الأسفل
          if (_contacts.length < 5)
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _addContact,
                  icon: const Icon(Icons.add, color: Colors.white),
                  label: const Text(
                    'إضافة جهة اتصال جديدة',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C63FF),
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ====== كارت جهة الاتصال ======
  Widget _buildContactCard(int index) {
    final contact = _contacts[index];
    final colors = [
      Colors.purple,
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.pink,
    ];
    final color = colors[index % colors.length];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          // أيقونة الشخص
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color.withOpacity(0.2),
            ),
            child: Center(
              child: Text(
                contact['name']![0].toUpperCase(),
                style: TextStyle(
                  color: color,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          const SizedBox(width: 15),

          // الاسم والرقم
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  contact['name']!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  contact['phone']!,
                  style: const TextStyle(color: Colors.white54, fontSize: 14),
                ),
              ],
            ),
          ),

          // أيقونة الطوارئ
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.red.withOpacity(0.3)),
            ),
            child: const Text(
              'طوارئ',
              style: TextStyle(color: Colors.red, fontSize: 11),
            ),
          ),

          const SizedBox(width: 8),

          // زرار الحذف
          IconButton(
            onPressed: () => _deleteContact(index),
            icon: const Icon(Icons.delete_outline, color: Colors.red, size: 22),
          ),
        ],
      ),
    );
  }

  // ====== شاشة فارغة ======
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.contacts_outlined,
            size: 80,
            color: Colors.white.withOpacity(0.1),
          ),
          const SizedBox(height: 20),
          const Text(
            'لا توجد جهات اتصال بعد',
            style: TextStyle(color: Colors.white38, fontSize: 16),
          ),
          const SizedBox(height: 8),
          const Text(
            'أضف جهات اتصال موثوقة\nلاستخدامها في حالات الطوارئ',
            style: TextStyle(color: Colors.white24, fontSize: 13),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
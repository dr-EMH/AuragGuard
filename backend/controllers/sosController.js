// قاعدة بيانات مؤقتة في الذاكرة
const sosAlerts = [];

// ====== استقبال نداء استغاثة جديد ======
const createSOS = (req, res) => {
  try {
    const { userId, userName, latitude, longitude, timestamp } = req.body;

    // تحقق من البيانات المطلوبة
    if (!latitude || !longitude) {
      return res.status(400).json({
        status: 'error',
        message: 'الموقع الجغرافي مطلوب',
      });
    }

    // إنشاء سجل الاستغاثة
    const sosAlert = {
      id: Date.now().toString(),
      userId: userId || 'anonymous',
      userName: userName || 'مستخدم مجهول',
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        mapsLink: `https://maps.google.com/?q=${latitude},${longitude}`,
      },
      timestamp: timestamp || new Date().toISOString(),
      status: 'active',
    };

    // حفظ في الذاكرة
    sosAlerts.push(sosAlert);

    console.log('🚨 SOS Alert Received!');
    console.log(`👤 User: ${sosAlert.userName}`);
    console.log(`📍 Location: ${latitude}, ${longitude}`);
    console.log(`🗺️  Maps: ${sosAlert.location.mapsLink}`);
    console.log('================================');

    res.status(201).json({
      status: 'success',
      message: 'تم استقبال نداء الاستغاثة',
      data: sosAlert,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'خطأ في السيرفر',
      error: error.message,
    });
  }
};

// ====== جيب كل نداءات الاستغاثة ======
const getAllSOS = (req, res) => {
  try {
    res.json({
      status: 'success',
      count: sosAlerts.length,
      data: sosAlerts,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'خطأ في السيرفر',
    });
  }
};

// ====== حدّث حالة نداء الاستغاثة ======
const updateSOSStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const alertIndex = sosAlerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'نداء الاستغاثة غير موجود',
      });
    }

    sosAlerts[alertIndex].status = status;

    res.json({
      status: 'success',
      message: 'تم تحديث الحالة',
      data: sosAlerts[alertIndex],
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'خطأ في السيرفر',
    });
  }
};

module.exports = { createSOS, getAllSOS, updateSOSStatus };
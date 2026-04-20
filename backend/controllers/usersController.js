// قاعدة بيانات مؤقتة في الذاكرة
const users = [];

// ====== تسجيل مستخدم جديد ======
const registerUser = (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'الاسم ورقم الهاتف مطلوبان',
      });
    }

    // تحقق إن الرقم مش موجود
    const existingUser = users.find((u) => u.phone === phone);
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'رقم الهاتف مسجل مسبقاً',
      });
    }

    const user = {
      id: Date.now().toString(),
      name,
      phone,
      email: email || '',
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    console.log(`✅ New User Registered: ${name} - ${phone}`);

    res.status(201).json({
      status: 'success',
      message: 'تم تسجيل المستخدم بنجاح',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'خطأ في السيرفر',
    });
  }
};

// ====== جيب كل المستخدمين ======
const getAllUsers = (req, res) => {
  try {
    res.json({
      status: 'success',
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'خطأ في السيرفر',
    });
  }
};

module.exports = { registerUser, getAllUsers };
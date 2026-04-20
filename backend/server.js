const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ====== Middleware ======
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== Routes ======
const sosRoutes = require('./routes/sos');
const usersRoutes = require('./routes/users');

app.use('/api/sos', sosRoutes);
app.use('/api/users', usersRoutes);

// ====== Route رئيسي للتأكد إن السيرفر شغال ======
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🛡️ AuraGuard Server is running!',
    version: '1.0.0',
    endpoints: {
      sos: '/api/sos',
      users: '/api/users',
    },
  });
});

// ====== معالجة الـ Routes الغير موجودة ======
app.use((req, res) => {  res.status(404).json({
    status: 'error',
    message: 'المسار غير موجود',
  });
});

// ====== تشغيل السيرفر ======
app.listen(PORT, () => {
  console.log('================================');
  console.log(`🛡️  AuraGuard Server Started!`);
  console.log(`🌐  http://localhost:${PORT}`);
  console.log(`📡  SOS API: http://localhost:${PORT}/api/sos`);
  console.log('================================');
});
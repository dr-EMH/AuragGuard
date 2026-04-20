const express = require('express');
const router = express.Router();
const { registerUser, getAllUsers } = require('../controllers/usersController');

// POST /api/users - تسجيل مستخدم
router.post('/', registerUser);

// GET /api/users - جيب كل المستخدمين
router.get('/', getAllUsers);

module.exports = router;
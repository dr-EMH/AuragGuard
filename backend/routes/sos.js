const express = require('express');
const router = express.Router();
const { createSOS, getAllSOS, updateSOSStatus } = require('../controllers/sosController');

// POST /api/sos - إرسال نداء استغاثة
router.post('/', createSOS);

// GET /api/sos - جيب كل النداءات
router.get('/', getAllSOS);

// PATCH /api/sos/:id - تحديث حالة النداء
router.patch('/:id', updateSOSStatus);

module.exports = router;
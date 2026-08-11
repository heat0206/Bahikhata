const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/chatbot — handles all chatbot messages
router.post('/', protect, handleMessage);

module.exports = router;

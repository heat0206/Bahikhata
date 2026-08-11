const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controllers/chatbotController');

// POST /api/chatbot — handles all chatbot messages
router.post('/', handleMessage);

module.exports = router;

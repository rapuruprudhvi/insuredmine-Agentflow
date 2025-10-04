const express = require('express');
const router = express.Router();
const {
  scheduleMessage,
  getScheduledMessages
} = require('../controllers/messageController');

// Schedule a message
router.post('/schedule', scheduleMessage);

// Get all scheduled messages
router.get('/scheduled', getScheduledMessages);

module.exports = router;
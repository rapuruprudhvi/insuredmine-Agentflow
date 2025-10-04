const express = require('express');
const router = express.Router();
const {
  scheduleMessage,
  getScheduledMessages
} = require('../controllers/messageController');


router.post('/schedule', scheduleMessage);
router.get('/scheduled', getScheduledMessages);

module.exports = router;
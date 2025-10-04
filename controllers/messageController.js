const schedule = require('node-schedule');
const ScheduledMessage = require('../models/ScheduledMessage');

// Store scheduled jobs in memory
const scheduledJobs = {};

// Schedule a message
const scheduleMessage = async (req, res) => {
  try {
    const { message, day, time, recipient_email, recipient_name } = req.body;

    if (!message || !day || !time || !recipient_email) {
      return res.status(400).json({
        success: false,
        message: 'Message, day, time, and recipient_email are required',
      });
    }

    // Save message to DB
    const scheduledMessage = new ScheduledMessage({
      message,
      scheduled_day: new Date(day),
      scheduled_time: time,
      recipient_email,
      recipient_name: recipient_name || '',
      status: 'pending',
    });

    await scheduledMessage.save();

    // Combine date and time
    const scheduleDateTime = new Date(`${day}T${time}`);

    if (isNaN(scheduleDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date or time format',
      });
    }

    // Schedule job
    const job = schedule.scheduleJob(scheduleDateTime, async () => {
      try {
        await ScheduledMessage.findByIdAndUpdate(scheduledMessage._id, {
          status: 'completed',
        });
        console.log(`Message sent at ${new Date()}`);
        console.log(`To: ${scheduledMessage.recipient_email} (${scheduledMessage.recipient_name || 'N/A'})`);
        console.log(`Message: ${message}`);
        delete scheduledJobs[scheduledMessage._id.toString()];
      } catch (error) {
        console.error('Error updating scheduled message:', error);
      }
    });

    scheduledJobs[scheduledMessage._id.toString()] = job;

    res.status(201).json({
      success: true,
      message: 'Message scheduled successfully',
      data: {
        id: scheduledMessage._id,
        message: scheduledMessage.message,
        scheduled_for: scheduleDateTime,
        recipient_email: scheduledMessage.recipient_email,
        recipient_name: scheduledMessage.recipient_name,
        status: scheduledMessage.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all scheduled messages
const getScheduledMessages = async (req, res) => {
  try {
    const messages = await ScheduledMessage.find().sort({ scheduled_day: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Initialize scheduled messages on server start
const initializeScheduledMessages = async () => {
  try {
    const pendingMessages = await ScheduledMessage.find({ status: 'pending' });

    pendingMessages.forEach((msg) => {
      const scheduleDateTime = new Date(
        `${msg.scheduled_day.toISOString().split('T')[0]}T${msg.scheduled_time}`
      );

      if (scheduleDateTime > new Date()) {
        const job = schedule.scheduleJob(scheduleDateTime, async () => {
          try {
            await ScheduledMessage.findByIdAndUpdate(msg._id, { status: 'completed' });
            console.log(`Message sent at ${new Date()}`);
            console.log(`To: ${msg.recipient_email} (${msg.recipient_name || 'N/A'})`);
            console.log(`Message: ${msg.message}`);
            delete scheduledJobs[msg._id.toString()];
          } catch (error) {
            console.error('Error updating scheduled message:', error);
          }
        });

        scheduledJobs[msg._id.toString()] = job;
        console.log(`Rescheduled message: ${msg.message} for ${scheduleDateTime}`);
      }
    });
  } catch (error) {
    console.error('Error initializing scheduled messages:', error);
  }
};

module.exports = {
  scheduleMessage,
  getScheduledMessages,
  initializeScheduledMessages,
};

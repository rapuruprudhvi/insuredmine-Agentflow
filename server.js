const express = require('express');
const connectDB = require('./config/db');
const monitorCPU = require('./utils/cpuMonitor');
const { initializeScheduledMessages } = require('./controllers/messageController');


const uploadRoutes = require('./routes/upload');
const policyRoutes = require('./routes/policy');
const messageRoutes = require('./routes/message');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
initializeScheduledMessages();

monitorCPU();

app.use('/api/upload', uploadRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/message', messageRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});


app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgentFlow API Server',
    endpoints: {
      upload: 'POST /api/upload - Upload XLSX/CSV file',
      search: 'GET /api/policy/search?username=<name> - Search policy by username',
      aggregated: 'GET /api/policy/aggregated - Get aggregated policies by user',
      scheduleMessage: 'POST /api/message/schedule - Schedule a message',
      getScheduledMessages: 'GET /api/message/scheduled - Get all scheduled messages',
      health: 'GET /health - Health check',
    },
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const os = require('os-utils');

let restartInProgress = false;

const monitorCPU = () => {
  setInterval(() => {
    os.cpuUsage((cpuPercent) => {
      const cpuUsagePercent = cpuPercent * 100;
      console.log(`CPU Usage: ${cpuUsagePercent.toFixed(2)}%`);

      // Check if CPU usage is above 70% and restart not already in progress
      if (cpuUsagePercent >= 70 && !restartInProgress) {
        console.log(`CPU usage is at ${cpuUsagePercent.toFixed(2)}%. Restarting server...`);
        restartInProgress = true;

        // Graceful shutdown
        process.exit(1);
      }
    });
  }, 5000); // Check every 5 seconds
};

module.exports = monitorCPU;
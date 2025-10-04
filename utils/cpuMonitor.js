const os = require('os-utils');

let restartInProgress = false;

const monitorCPU = () => {
  setInterval(() => {
    os.cpuUsage((cpuPercent) => {
      const cpuUsagePercent = cpuPercent * 100;
      console.log(`CPU Usage: ${cpuUsagePercent.toFixed(2)}%`);

      if (cpuUsagePercent >= 70 && !restartInProgress) {
        console.log(`CPU usage is at ${cpuUsagePercent.toFixed(2)}%. Restarting server...`);
        restartInProgress = true;

        process.exit(1);
      }
    });
  }, 5000); 
};

module.exports = monitorCPU;
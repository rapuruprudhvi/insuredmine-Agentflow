const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let fileType;
    if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      fileType = 'xlsx';
    } else if (fileExtension === '.csv') {
      fileType = 'csv';
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only XLSX and CSV are supported.',
      });
    }

    const worker = new Worker(path.join(__dirname, '../workers/uploadWorker.js'), {
      workerData: { filePath, fileType },
    });

    worker.on('message', (result) => {
      fs.unlinkSync(filePath);
      if (result.success) {
        res.status(200).json({ success: true, message: 'File processed successfully', data: result.results });
      } else {
        res.status(500).json({ success: false, message: 'Error processing file', error: result.error });
      }
    });

    worker.on('error', (error) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ success: false, message: 'Worker thread error', error: error.message });
    });

    worker.on('exit', (code) => {
      if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { uploadFile };

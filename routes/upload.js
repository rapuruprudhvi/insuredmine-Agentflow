const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadFile } = require('../controllers/uploadController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only XLSX and CSV files are allowed'));
    }
  }
});

router.post('/', upload.single('file'), uploadFile);

module.exports = router;

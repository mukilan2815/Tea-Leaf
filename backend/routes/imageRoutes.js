const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to upload an image
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File upload failed' });
  }

  // Simulated Prediction Response
  const prediction = {
    plant: 'Spinach',
    disease: 'Downy Mildew',
    riskLevel: 'High',
  };

  res.status(200).json({
    message: 'File uploaded successfully',
    prediction,
    filePath: req.file.path,
  });
});

module.exports = router;

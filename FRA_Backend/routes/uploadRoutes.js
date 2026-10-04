const express = require('express');
const router = express.Router();
const { uploadImageFile, uploadVideoFile } = require('../controllers/uploadController');
const { uploadImage, uploadVideo } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Upload endpoints
router.post('/image', protect, uploadImage.single('image'), uploadImageFile);
router.post('/video', protect, uploadVideo.single('video'), uploadVideoFile);

module.exports = router;

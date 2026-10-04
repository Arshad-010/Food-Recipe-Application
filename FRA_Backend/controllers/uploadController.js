const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const fs = require('fs');

/**
 * @desc Upload image file (Cloudinary if credentials set, local fallback otherwise)
 * @route POST /api/upload/image
 * @access Private
 */
const uploadImageFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    // If Cloudinary credentials are provided, upload to Cloudinary
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'food_recipe_app/recipes',
        resource_type: 'image',
      });

      // Remove local temp file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully to Cloudinary',
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    // Local static upload fallback
    const localUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to local storage',
      url: localUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Upload video file (Cloudinary if credentials set, local fallback otherwise)
 * @route POST /api/upload/video
 * @access Private
 */
const uploadVideoFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a video file to upload' });
    }

    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'food_recipe_app/videos',
        resource_type: 'video',
      });

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(200).json({
        success: true,
        message: 'Video uploaded successfully to Cloudinary',
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const localUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully to local storage',
      url: localUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImageFile,
  uploadVideoFile,
};

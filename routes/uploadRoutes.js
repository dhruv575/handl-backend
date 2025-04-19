const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadImage } = require('../utils/cloudinary');
const { auth } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

// Protect all routes
router.use(auth);

/**
 * @route   POST /api/upload/image
 * @desc    Upload an image to Cloudinary
 * @access  Private
 */
router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('No image file provided', 400));
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Determine folder based on query param
    const folder = req.query.type === 'profile' ? 'profiles' : 'general';
    
    // Upload to Cloudinary
    const imageUrl = await uploadImage(dataURI, folder);

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl
      }
    });
  } catch (error) {
    next(new ErrorResponse('Failed to upload image', 500));
  }
});

module.exports = router; 
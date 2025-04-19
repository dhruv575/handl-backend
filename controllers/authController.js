const { User } = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, name, email, phoneNumber, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email },
        { username },
        { phoneNumber }
      ]
    });

    if (user) {
      if (user.email === email) {
        return next(new ErrorResponse('Email already in use', 400));
      }
      if (user.username === username) {
        return next(new ErrorResponse('Username already taken', 400));
      }
      if (user.phoneNumber === phoneNumber) {
        return next(new ErrorResponse('Phone number already registered', 400));
      }
    }

    // Create user
    user = new User({
      username,
      name,
      email,
      phoneNumber,
      password
    });

    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('days');

    res.status(200).json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phoneNumber, profilePictureUrl, receiveTexts } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (profilePictureUrl !== undefined) updateFields.profilePictureUrl = profilePictureUrl;
    if (receiveTexts !== undefined) updateFields.receiveTexts = receiveTexts;

    // Check if phoneNumber already exists
    if (phoneNumber) {
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Phone number already registered', 400));
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user.getPublicProfile()
    });
  } catch (err) {
    next(err);
  }
}; 
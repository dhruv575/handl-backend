const { Day } = require('../models/Day');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

/**
 * @desc    Create a new day entry
 * @route   POST /api/days
 * @access  Private
 */
exports.createDay = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, score, high, low } = req.body;

    // Format date to midnight to ensure one entry per day
    const formattedDate = new Date(date);
    formattedDate.setHours(0, 0, 0, 0);

    // Check if an entry for this day already exists
    const existingDay = await Day.findOne({
      user: req.user.id,
      date: formattedDate
    });

    if (existingDay) {
      return next(new ErrorResponse('You already have an entry for this day', 400));
    }

    // Create new day entry
    const day = new Day({
      user: req.user.id,
      date: formattedDate,
      score,
      high,
      low
    });

    await day.save();

    res.status(201).json({
      success: true,
      data: day
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all day entries for current user
 * @route   GET /api/days
 * @access  Private
 */
exports.getDays = async (req, res, next) => {
  try {
    // Parse query parameters
    const { start, end, limit = 30, page = 1 } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Add date range if provided
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = new Date(start);
      if (end) query.date.$lte = new Date(end);
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const days = await Day.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination info
    const total = await Day.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: days.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: days
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a specific day entry
 * @route   GET /api/days/:id
 * @access  Private
 */
exports.getDay = async (req, res, next) => {
  try {
    const day = await Day.findById(req.params.id);

    if (!day) {
      return next(new ErrorResponse('Day entry not found', 404));
    }

    // Make sure the user owns the day entry
    if (day.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this entry', 401));
    }

    res.status(200).json({
      success: true,
      data: day
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a day entry
 * @route   PUT /api/days/:id
 * @access  Private
 */
exports.updateDay = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let day = await Day.findById(req.params.id);

    if (!day) {
      return next(new ErrorResponse('Day entry not found', 404));
    }

    // Make sure the user owns the day entry
    if (day.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this entry', 401));
    }

    // Update fields
    const { score, high, low } = req.body;
    
    if (score !== undefined) day.score = score;
    if (high !== undefined) day.high = high;
    if (low !== undefined) day.low = low;
    
    await day.save();

    res.status(200).json({
      success: true,
      data: day
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a day entry
 * @route   DELETE /api/days/:id
 * @access  Private
 */
exports.deleteDay = async (req, res, next) => {
  try {
    const day = await Day.findById(req.params.id);

    if (!day) {
      return next(new ErrorResponse('Day entry not found', 404));
    }

    // Make sure the user owns the day entry
    if (day.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this entry', 401));
    }

    await day.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get user streak
 * @route   GET /api/days/streak
 * @access  Private
 */
exports.getUserStreak = async (req, res, next) => {
  try {
    const streak = await Day.getUserStreak(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        streak
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get weekly average score
 * @route   GET /api/days/average
 * @access  Private
 */
exports.getWeeklyAverage = async (req, res, next) => {
  try {
    const average = await Day.getWeeklyAverage(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        average
      }
    });
  } catch (err) {
    next(err);
  }
}; 
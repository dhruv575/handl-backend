const asyncHandler = require('../middleware/async');
const { User } = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { sendSMS } = require('../utils/smsService');
const { validationResult } = require('express-validator');

/**
 * @desc    Send a reminder to a specific user
 * @route   POST /api/notifications/remind/:userId
 * @access  Private (Admin only)
 */
exports.sendUserReminder = asyncHandler(async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find the user
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Ensure user has a phone number
    if (!user.phoneNumber) {
      return next(new ErrorResponse('User does not have a phone number', 400));
    }

    // Create the message
    let message;
    if (req.body.customMessage) {
      message = req.body.customMessage;
    } else {
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      message = `Hi ${user.name}! Don't forget to log your high and low for ${currentDate} in the HandL app.`;
    }

    // Send the SMS
    const success = await sendSMS(user.phoneNumber, message);

    if (!success) {
      return next(new ErrorResponse('Failed to send SMS reminder', 500));
    }

    res.status(200).json({
      success: true,
      message: `Reminder sent to ${user.name} (${user.phoneNumber})`
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @desc    Send a reminder to all users
 * @route   POST /api/notifications/remind-all
 * @access  Private (Admin only)
 */
exports.sendAllReminders = asyncHandler(async (req, res, next) => {
  try {
    // Find all users with phone numbers
    const users = await User.find({ phoneNumber: { $exists: true, $ne: '' } });
    
    if (users.length === 0) {
      return next(new ErrorResponse('No users with phone numbers found', 404));
    }

    // Create the message
    let message;
    if (req.body.customMessage) {
      message = req.body.customMessage;
    } else {
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      message = `Don't forget to log your high and low for ${currentDate} in the HandL app!`;
    }

    // Send SMS to each user
    let sentCount = 0;
    let failedCount = 0;
    
    for (const user of users) {
      // Personalize the message for each user
      const personalizedMessage = req.body.customMessage 
        ? message
        : `Hi ${user.name}! ${message}`;
        
      const sent = await sendSMS(user.phoneNumber, personalizedMessage);
      
      if (sent) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Reminders sent to ${sentCount} users. Failed: ${failedCount}.`
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @desc    Toggle user's reminder preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
exports.updateNotificationPreferences = asyncHandler(async (req, res, next) => {
  const { receiveReminders } = req.body;
  
  if (receiveReminders === undefined) {
    return next(new ErrorResponse('Please provide notification preferences', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { receiveReminders },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: {
      receiveReminders: user.receiveReminders
    }
  });
}); 
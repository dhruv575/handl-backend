const asyncHandler = require('../middleware/async');
const { User } = require('../models/User');
const { Day } = require('../models/Day');
const ErrorResponse = require('../utils/errorResponse');
const { sendEmail, generateWeeklyRecap } = require('../utils/emailService');
const schedule = require('node-schedule');

/**
 * @desc    Send weekly recap email to a specific user
 * @route   POST /api/emails/recap/:userId
 * @access  Private (Admin only)
 */
exports.sendUserRecap = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Check if user has an email
  if (!user.email) {
    return next(new ErrorResponse('User does not have an email address', 400));
  }
  
  // Get user's days from the past week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const days = await Day.find({
    user: user._id,
    date: { $gte: oneWeekAgo }
  }).sort({ date: -1 });
  
  if (days.length === 0) {
    return next(new ErrorResponse('User has no entries for the past week', 400));
  }
  
  // Calculate stats
  const stats = {
    averageScore: calculateAverageScore(days),
    entriesCount: days.length,
    currentStreak: await calculateStreak(user._id)
  };
  
  // Generate email content
  const emailHtml = await generateWeeklyRecap({
    user,
    days,
    stats
  });
  
  // Send the email
  const success = await sendEmail(
    user.email,
    'Your Weekly HandL Recap',
    emailHtml
  );
  
  if (!success) {
    return next(new ErrorResponse('Failed to send email', 500));
  }
  
  res.status(200).json({
    success: true,
    message: `Weekly recap sent to ${user.email}`
  });
});

/**
 * @desc    Send weekly recap emails to all eligible users
 * @route   POST /api/emails/recap-all
 * @access  Private (Admin only)
 */
exports.sendAllRecaps = asyncHandler(async (req, res, next) => {
  // Find users who have at least one entry in the past week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  // Get all users with email addresses
  const users = await User.find({ email: { $exists: true, $ne: '' } });
  
  if (users.length === 0) {
    return next(new ErrorResponse('No users with email addresses found', 404));
  }
  
  let sentCount = 0;
  let failedCount = 0;
  
  // Process each user
  for (const user of users) {
    try {
      // Get user's days from the past week
      const days = await Day.find({
        user: user._id,
        date: { $gte: oneWeekAgo }
      }).sort({ date: -1 });
      
      // Skip users with no entries
      if (days.length === 0) continue;
      
      // Calculate stats
      const stats = {
        averageScore: calculateAverageScore(days),
        entriesCount: days.length,
        currentStreak: await calculateStreak(user._id)
      };
      
      // Generate email content
      const emailHtml = await generateWeeklyRecap({
        user,
        days,
        stats
      });
      
      // Send the email
      const success = await sendEmail(
        user.email,
        'Your Weekly HandL Recap',
        emailHtml
      );
      
      if (success) {
        sentCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      console.error(`Error processing recap for user ${user._id}:`, error);
      failedCount++;
    }
  }
  
  res.status(200).json({
    success: true,
    message: `Weekly recaps sent to ${sentCount} users. Failed: ${failedCount}.`
  });
});

/**
 * Schedule weekly recap emails (Sunday at 9 AM)
 */
exports.scheduleWeeklyRecaps = () => {
  // Schedule job to run every Sunday at 9:00 AM
  const job = schedule.scheduleJob('0 9 * * 0', async () => {
    console.log('Running scheduled job: Weekly recap emails');
    
    try {
      // Same logic as sendAllRecaps but without response handling
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const users = await User.find({ email: { $exists: true, $ne: '' } });
      
      let sentCount = 0;
      let failedCount = 0;
      
      for (const user of users) {
        try {
          const days = await Day.find({
            user: user._id,
            date: { $gte: oneWeekAgo }
          }).sort({ date: -1 });
          
          if (days.length === 0) continue;
          
          const stats = {
            averageScore: calculateAverageScore(days),
            entriesCount: days.length,
            currentStreak: await calculateStreak(user._id)
          };
          
          const emailHtml = await generateWeeklyRecap({
            user,
            days,
            stats
          });
          
          const success = await sendEmail(
            user.email,
            'Your Weekly HandL Recap',
            emailHtml
          );
          
          if (success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Error processing recap for user ${user._id}:`, error);
          failedCount++;
        }
      }
      
      console.log(`Weekly recaps sent to ${sentCount} users. Failed: ${failedCount}.`);
    } catch (error) {
      console.error('Error sending weekly recaps:', error);
    }
  });
  
  console.log('Weekly recap emails scheduled for Sundays at 9:00 AM.');
  return job;
};

// Helper function to calculate average score
const calculateAverageScore = (days) => {
  if (days.length === 0) return 0;
  
  const sum = days.reduce((acc, day) => acc + day.score, 0);
  return (sum / days.length).toFixed(1);
};

// Helper function to calculate streak
const calculateStreak = async (userId) => {
  // Get all days for the user sorted by date (descending)
  const days = await Day.find({ user: userId }).sort({ date: -1 });
  
  if (days.length === 0) return 0;
  
  let streak = 1;
  let currentDate = new Date(days[0].date);
  
  // Loop through days starting from the second one
  for (let i = 1; i < days.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    // Format dates to compare just the date part (not time)
    const prevDateStr = prevDate.toISOString().split('T')[0];
    const dayDateStr = new Date(days[i].date).toISOString().split('T')[0];
    
    // If the previous day exists in our records, increment streak
    if (prevDateStr === dayDateStr) {
      streak++;
      currentDate = new Date(days[i].date);
    } else {
      break;
    }
  }
  
  return streak;
}; 
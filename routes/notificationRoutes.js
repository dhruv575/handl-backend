const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  sendUserReminder,
  sendAllReminders,
  updateNotificationPreferences
} = require('../controllers/notificationController');

// Protect all routes
router.use(auth);

// Routes for users to manage their own notification preferences
router.put('/preferences', updateNotificationPreferences);

// Admin-only routes for sending reminders
router.post('/send/:userId', async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }
  return sendUserReminder(req, res, next);
});

router.post('/send-all', async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }
  return sendAllReminders(req, res, next);
});

module.exports = router; 
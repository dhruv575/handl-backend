const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  sendUserRecap,
  sendAllRecaps
} = require('../controllers/emailController');

// Protect all routes
router.use(auth);

// Admin-only routes for sending recap emails
router.post('/recap/:userId', async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }
  return sendUserRecap(req, res, next);
});

router.post('/recap-all', async (req, res, next) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Not authorized to access this route' 
    });
  }
  return sendAllRecaps(req, res, next);
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  sendFriendRequest,
  respondToFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
  searchUsers
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { friendRequestResponseValidation } = require('../middleware/validators');

// Protected routes - require authentication
router.use(auth);

// Search users
router.get('/search', searchUsers);

// Friend request routes
router.get('/friend-requests', getFriendRequests);
router.put('/friend-request/:userId', friendRequestResponseValidation, respondToFriendRequest);

// Friends management
router.get('/friends', getFriends);
router.delete('/friends/:friendId', removeFriend);

// Friend request to a specific user
router.post('/:username/friend-request', sendFriendRequest);

// Public profile route (must be last to avoid conflicts)
// This route is exempt from auth middleware
router.get('/:username', (req, res, next) => {
  // Skip auth for this route only
  req.skipAuth = true;
  next();
}, getUserProfile);

module.exports = router; 
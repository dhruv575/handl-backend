const { User } = require('../models/User');
const { Day } = require('../models/Day');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get public profile of a user by username
 * @route   GET /api/users/:username
 * @access  Public
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get recent days (last 5)
    const recentDays = await Day.find({ user: user._id })
      .sort({ date: -1 })
      .limit(5);

    // Get user streak
    const streak = await Day.getUserStreak(user._id);

    // Get weekly average
    const weeklyAverage = await Day.getWeeklyAverage(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        stats: {
          streak,
          weeklyAverage,
          totalEntries: await Day.countDocuments({ user: user._id })
        },
        recentDays
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Send friend request to a user
 * @route   POST /api/users/:username/friend-request
 * @access  Private
 */
exports.sendFriendRequest = async (req, res, next) => {
  try {
    // Find target user
    const targetUser = await User.findOne({ username: req.params.username });

    if (!targetUser) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Prevent sending friend request to self
    if (targetUser._id.toString() === req.user.id) {
      return next(new ErrorResponse('Cannot send friend request to yourself', 400));
    }

    // Check if already friends
    if (targetUser.friends.includes(req.user.id)) {
      return next(new ErrorResponse('You are already friends with this user', 400));
    }

    // Check if friend request already sent
    const pendingRequest = targetUser.friendRequests.find(
      request => request.from.toString() === req.user.id
    );

    if (pendingRequest) {
      return next(new ErrorResponse('Friend request already sent', 400));
    }

    // Add friend request
    targetUser.friendRequests.push({ from: req.user.id });
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Accept or reject friend request
 * @route   PUT /api/users/friend-request/:userId
 * @access  Private
 */
exports.respondToFriendRequest = async (req, res, next) => {
  try {
    const { action } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return next(new ErrorResponse('Invalid action. Use "accept" or "reject"', 400));
    }

    // Get current user with friend requests
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Find the friend request
    const requestIndex = currentUser.friendRequests.findIndex(
      request => request.from.toString() === req.params.userId
    );

    if (requestIndex === -1) {
      return next(new ErrorResponse('Friend request not found', 404));
    }

    // Handle the request
    if (action === 'accept') {
      // Add to friends list (for both users)
      currentUser.friends.push(req.params.userId);
      
      // Find the requester and add current user to their friends
      const requesterUser = await User.findById(req.params.userId);
      if (!requesterUser) {
        return next(new ErrorResponse('Requesting user not found', 404));
      }
      
      requesterUser.friends.push(req.user.id);
      await requesterUser.save();
    }

    // Remove the request from the list
    currentUser.friendRequests.splice(requestIndex, 1);
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: `Friend request ${action}ed successfully`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all friend requests for current user
 * @route   GET /api/users/friend-requests
 * @access  Private
 */
exports.getFriendRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests.from', 'username name profilePictureUrl');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      count: user.friendRequests.length,
      data: user.friendRequests
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all friends for current user
 * @route   GET /api/users/friends
 * @access  Private
 */
exports.getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username name profilePictureUrl');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      count: user.friends.length,
      data: user.friends
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove a friend
 * @route   DELETE /api/users/friends/:friendId
 * @access  Private
 */
exports.removeFriend = async (req, res, next) => {
  try {
    // Get current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if the user is actually a friend
    const friendIndex = currentUser.friends.findIndex(
      friend => friend.toString() === req.params.friendId
    );

    if (friendIndex === -1) {
      return next(new ErrorResponse('Friend not found', 404));
    }

    // Remove from friends list
    currentUser.friends.splice(friendIndex, 1);
    await currentUser.save();

    // Also remove the current user from the friend's friends list
    const friend = await User.findById(req.params.friendId);
    if (friend) {
      const userIndex = friend.friends.findIndex(
        friend => friend.toString() === req.user.id
      );
      
      if (userIndex !== -1) {
        friend.friends.splice(userIndex, 1);
        await friend.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Search for users by username or name
 * @route   GET /api/users/search
 * @access  Private
 */
exports.searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return next(new ErrorResponse('Search query is required', 400));
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.id } // Exclude current user
    }).select('username name profilePictureUrl');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
}; 
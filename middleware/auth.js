const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

/**
 * Middleware to verify JWT token and set req.user
 */
const auth = async (req, res, next) => {
  try {
    // Skip auth if skipAuth flag is set (used for certain public routes)
    if (req.skipAuth) {
      return next();
    }

    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = { auth }; 
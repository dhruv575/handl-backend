const { check } = require('express-validator');

/**
 * Validation rules for user registration
 */
exports.registerValidation = [
  check('username')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  
  check('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  
  check('email')
    .trim()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  check('phoneNumber')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Please provide a valid phone number'),
  
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

/**
 * Validation rules for user login
 */
exports.loginValidation = [
  check('email')
    .trim()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for profile update
 */
exports.profileUpdateValidation = [
  check('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  
  check('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Please provide a valid phone number')
];

/**
 * Validation rules for creating a day entry
 */
exports.createDayValidation = [
  check('date')
    .not()
    .isEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  check('score')
    .not()
    .isEmpty()
    .withMessage('Score is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Score must be a number between 1 and 10'),
  
  check('high')
    .not()
    .isEmpty()
    .withMessage('High point is required')
    .trim()
    .isLength({ max: 500 })
    .withMessage('High point cannot be more than 500 characters'),
  
  check('low')
    .not()
    .isEmpty()
    .withMessage('Low point is required')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Low point cannot be more than 500 characters')
];

/**
 * Validation rules for updating a day entry
 */
exports.updateDayValidation = [
  check('score')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Score must be a number between 1 and 10'),
  
  check('high')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('High point cannot be more than 500 characters'),
  
  check('low')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Low point cannot be more than 500 characters')
];

/**
 * Validation rules for friend request response
 */
exports.friendRequestResponseValidation = [
  check('action')
    .isIn(['accept', 'reject'])
    .withMessage('Action must be either "accept" or "reject"')
]; 
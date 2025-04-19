const express = require('express');
const router = express.Router();
const {
  createDay,
  getDays,
  getDay,
  updateDay,
  deleteDay,
  getUserStreak,
  getWeeklyAverage
} = require('../controllers/dayController');
const { auth } = require('../middleware/auth');
const {
  createDayValidation,
  updateDayValidation
} = require('../middleware/validators');

// All routes are protected
router.use(auth);

// Stats routes
router.get('/streak', getUserStreak);
router.get('/average', getWeeklyAverage);

// CRUD routes
router.route('/')
  .post(createDayValidation, createDay)
  .get(getDays);

router.route('/:id')
  .get(getDay)
  .put(updateDayValidation, updateDay)
  .delete(deleteDay);

module.exports = router; 
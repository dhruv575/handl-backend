const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  score: {
    type: Number,
    required: [true, 'Please provide a score between 1-10'],
    min: [1, 'Score must be at least 1'],
    max: [10, 'Score cannot be more than 10']
  },
  high: {
    type: String,
    required: [true, "Please share your day's high point"],
    trim: true,
    maxlength: [500, 'Your high point cannot be more than 500 characters']
  },
  low: {
    type: String,
    required: [true, "Please share your day's low point"],
    trim: true,
    maxlength: [500, 'Your low point cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index to ensure a user can only have one entry per day
DaySchema.index({ user: 1, date: 1 }, { 
  unique: true, 
  // Normalize the date to midnight in user's timezone (UTC for now)
  partialFilterExpression: {
    date: { $type: "date" }
  }
});

// Method to get formatted date string
DaySchema.methods.getFormattedDate = function() {
  const date = this.date;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Static method to get a user's streak (consecutive days with entries)
DaySchema.statics.getUserStreak = async function(userId) {
  const days = await this.find({ user: userId })
    .sort({ date: -1 })
    .lean();
  
  if (days.length === 0) return 0;
  
  let streak = 1;
  let currentDate = new Date(days[0].date);
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < days.length; i++) {
    const prevDate = new Date(days[i].date);
    prevDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(currentDate - prevDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return streak;
};

// Static method to get weekly average score
DaySchema.statics.getWeeklyAverage = async function(userId) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const result = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: oneWeekAgo }
      }
    },
    {
      $group: {
        _id: null,
        averageScore: { $avg: "$score" }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].averageScore : 0;
};

const Day = mongoose.model('Day', DaySchema);

module.exports = { Day }; 
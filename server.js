const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const colors = require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initTwilio, scheduleDailyReminders } = require('./utils/smsService');
// Commented out email functionality
// const { scheduleWeeklyRecaps } = require('./controllers/emailController');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure CORS to allow requests from our frontend domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.handl.club', 'https://handl.club'] 
    : 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));

// Initialize services
const twilioInitialized = initTwilio();

// Define routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/days', require('./routes/dayRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
// Commented out email routes
// app.use('/api/emails', require('./routes/emailRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('HandL API is running...');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'API is healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Set port and start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
  
  // Schedule jobs in production mode
  if (process.env.NODE_ENV === 'production') {
    // Only schedule SMS reminders if Twilio is initialized
    if (twilioInitialized) {
      scheduleDailyReminders();
    }
    // Commented out email recaps scheduling
    // Email recaps will use fallback templates if OpenAI is not available
    // scheduleWeeklyRecaps();
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
}); 
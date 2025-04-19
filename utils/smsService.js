const twilio = require('twilio');
const schedule = require('node-schedule');
const { User } = require('../models/User');

// Initialize Twilio client
let twilioClient;
let twilioPhoneNumber;

/**
 * Initialize the Twilio client with credentials
 */
const initTwilio = () => {
  try {
    // Check if required env variables are set
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('Twilio credentials not found. SMS functionality will be disabled.');
      return false;
    }
    
    // Initialize Twilio client
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    console.log('Twilio SMS service initialized successfully.');
    return true;
  } catch (error) {
    console.error('Failed to initialize Twilio:', error);
    return false;
  }
};

/**
 * Send an SMS to a specific user
 * @param {string} phoneNumber - The phone number to send the SMS to
 * @param {string} message - The message content
 * @returns {Promise} - Result of the send operation
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    // Check if Twilio is initialized
    if (!twilioClient) {
      console.warn('Twilio client not initialized. SMS not sent.');
      return false;
    }

    // Remove any spaces from the phone number
    const formattedNumber = phoneNumber.replace(/\s+/g, '');
    
    // Send the message
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedNumber
    });
    
    console.log(`SMS sent to ${phoneNumber}, SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}:`, error);
    return false;
  }
};

/**
 * Schedule daily reminders for all users at 10:30 PM in their timezone
 * For now, we'll use the server's timezone
 */
const scheduleDailyReminders = () => {
  // Schedule the job at 10:30 PM every day
  const job = schedule.scheduleJob('30 22 * * *', async () => {
    console.log('Running scheduled job: Daily reminders');
    
    try {
      // Get all users with phone numbers
      const users = await User.find({ phoneNumber: { $exists: true, $ne: '' } });
      
      let sentCount = 0;
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      
      // Send reminder to each user
      for (const user of users) {
        // Skip users without a valid phone number
        if (!user.phoneNumber) continue;
        
        const message = `Hi ${user.name}! Don't forget to log your high and low for ${currentDate} in the HandL app.`;
        
        const sent = await sendSMS(user.phoneNumber, message);
        if (sent) sentCount++;
      }
      
      console.log(`Daily reminders sent to ${sentCount}/${users.length} users.`);
    } catch (error) {
      console.error('Error sending daily reminders:', error);
    }
  });
  
  console.log('Daily reminders scheduled for 10:30 PM.');
  return job;
};

module.exports = {
  initTwilio,
  sendSMS,
  scheduleDailyReminders
}; 
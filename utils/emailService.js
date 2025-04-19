const sgMail = require('@sendgrid/mail');
const { OpenAI } = require('openai');
require('dotenv').config();

// Log environment variables status (without revealing values)
console.log('Environment variables check:');
console.log(`SENDGRID_API_KEY defined: ${Boolean(process.env.SENDGRID_API_KEY)}`);
console.log(`OPENAI_API_KEY defined: ${Boolean(process.env.OPENAI_API_KEY)}`);
console.log(`FROM_EMAIL defined: ${Boolean(process.env.FROM_EMAIL)}, value: ${process.env.FROM_EMAIL}`);

// Initialize SendGrid with error handling
try {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid initialized successfully');
  } else {
    console.warn('SendGrid API key is missing or empty');
  }
} catch (error) {
  console.error('Failed to initialize SendGrid:', error.message);
}

// Initialize OpenAI with error handling
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI initialized successfully');
  } else {
    console.warn('OpenAI API key is missing or empty');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI:', error.message);
}

/**
 * Send an email using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async (to, subject, html) => {
  try {
    const fromEmail = process.env.FROM_EMAIL || 'dhruvgup@seas.upenn.edu';
    console.log(`Sending email from: ${fromEmail} to: ${to}`);
    
    const msg = {
      to,
      from: fromEmail,
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return false;
  }
};

/**
 * Generate weekly recap content using OpenAI
 * @param {Object} data - User data and weekly statistics
 * @returns {Promise<string>} - Generated HTML content
 */
const generateWeeklyRecap = async (data) => {
  try {
    const { user, days, stats } = data;
    
    // Check if OpenAI is initialized
    if (!openai) {
      console.warn('OpenAI not initialized, using fallback template');
      return generateFallbackTemplate(data);
    }
    
    // Create a prompt for the OpenAI API
    const prompt = `
Generate a personalized weekly recap email for ${user.name} in HTML format.

User Stats:
- Week's Average Score: ${stats.averageScore}
- Number of Entries: ${stats.entriesCount}
- Current Streak: ${stats.currentStreak}

Recent Highs and Lows:
${days.map(day => `- ${day.date}: Score ${day.score}
  High: ${day.high}
  Low: ${day.low}`).join('\n')}

The email should:
1. Be encouraging and personal
2. Point out patterns in their highs and lows if any exist
3. Celebrate any good scores or streaks
4. Encourage consistency if they missed days
5. Include a short inspiring quote related to self-reflection
6. Format as HTML with inline CSS for a modern, clean look
7. Keep the email concise and uplifting
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert email copywriter specializing in personal development and wellness. Create engaging, personalized weekly recaps that inspire users to continue tracking their emotional wellbeing." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    return generateFallbackTemplate(data);
  }
};

// Helper function for fallback template
const generateFallbackTemplate = (data) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <h1 style="color: #4a6fa5;">Your Weekly HandL Recap</h1>
    <p>Hi ${data.user.name},</p>
    <p>Here's a summary of your week:</p>
    <ul>
      <li>Week's Average Score: ${data.stats.averageScore}</li>
      <li>Number of Entries: ${data.stats.entriesCount}</li>
      <li>Current Streak: ${data.stats.currentStreak}</li>
    </ul>
    <p>Keep tracking your highs and lows to gain insights into your emotional patterns.</p>
    <p>Have a great week ahead!</p>
    <p>- The HandL Team</p>
  </div>
  `;
};

module.exports = {
  sendEmail,
  generateWeeklyRecap
}; 
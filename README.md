# HandL Backend API

The backend server for the HandL (Highs and Lows) application, a daily tracking app that helps users record and reflect on their daily experiences.

## Features

- User authentication and authorization
- Daily entry management (create, read, update, delete)
- Friend connections and social features
- Profile management with image uploads
- Optional SMS reminders via Twilio
- Optional email weekly recaps

## Tech Stack

- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary for image hosting
- Optional: Twilio for SMS
- Optional: SendGrid for emails
- Optional: OpenAI for recap generation

## Deployment on Vercel

This backend is configured for deployment on Vercel as a serverless application.

### Prerequisites

1. A Vercel account
2. MongoDB Atlas database
3. Cloudinary account
4. (Optional) Twilio account for SMS
5. (Optional) SendGrid account for emails
6. (Optional) OpenAI API key for recap generation

### Deployment Steps

1. Fork or clone this repository
2. Install the Vercel CLI: `npm i -g vercel`
3. Login to Vercel: `vercel login`
4. Configure environment variables in the Vercel dashboard or using the CLI:
   ```
   vercel secrets add mongodb-uri "your-mongodb-connection-string"
   vercel secrets add jwt-secret "your-jwt-secret"
   # Add other necessary secrets
   ```
5. Deploy to Vercel: `vercel --prod`

### Environment Variables

The following environment variables need to be set in your Vercel project:

```
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
OPENAI_API_KEY=your_openai_key (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid (optional)
TWILIO_AUTH_TOKEN=your_twilio_token (optional)
TWILIO_PHONE_NUMBER=your_twilio_phone (optional)
SENDGRID_API_KEY=your_sendgrid_key (optional)
FROM_EMAIL=your_email_address (optional)
```

### Connecting Frontend

After deployment, update your frontend API configuration to point to your Vercel deployment URL:

```javascript
// For production (www.handl.club)
const API_URL = 'https://your-vercel-deployment-url.vercel.app/api';
```

### Testing the Deployment

Once deployed, you can test if the API is running by visiting:

```
https://your-vercel-deployment-url.vercel.app/api/health
```

This should return a JSON response indicating the API is healthy.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the development server: `npm run dev`

The server will be available at http://localhost:5000.

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Days
- `GET /api/days` - Get all days for current user
- `GET /api/days/:id` - Get a specific day
- `POST /api/days` - Create a new day entry
- `PUT /api/days/:id` - Update a day entry
- `DELETE /api/days/:id` - Delete a day entry

### Users
- `GET /api/users/search` - Search for users
- `GET /api/users/:username` - Get a user profile
- `GET /api/users/friends` - Get friends list
- `POST /api/users/:username/friend-request` - Send friend request
- `PUT /api/users/friend-request/:userId` - Accept/reject friend request

### Uploads
- `POST /api/uploads/image` - Upload an image

### Additional Information

For more detailed API documentation, please refer to the controller files in the codebase. 
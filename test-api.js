/**
 * Test script to check if the login API endpoint is working correctly.
 * This will help diagnose any CORS or API issues.
 * 
 * Usage:
 * 1. Install axios: npm install axios
 * 2. Run: node test-api.js
 */

const axios = require('axios');

const API_URL = 'https://handl-backend.vercel.app/api';

// Test credentials - replace these with valid test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

async function testLogin() {
  console.log('Testing login API endpoint with CORS headers...');
  
  try {
    // First test an OPTIONS request (preflight)
    const optionsConfig = {
      method: 'OPTIONS',
      url: `${API_URL}/auth/login`,
      headers: {
        'Origin': 'https://www.handl.club',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-auth-token'
      }
    };
    
    console.log('\nSending preflight OPTIONS request...');
    const optionsResponse = await axios(optionsConfig);
    
    console.log('Options Response Status:', optionsResponse.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers']
    });
    
    // Now test the actual login endpoint
    console.log('\nSending POST request to /auth/login...');
    const loginConfig = {
      method: 'POST',
      url: `${API_URL}/auth/login`,
      headers: {
        'Origin': 'https://www.handl.club',
        'Content-Type': 'application/json'
      },
      data: testCredentials
    };
    
    try {
      const loginResponse = await axios(loginConfig);
      console.log('Login Response Status:', loginResponse.status);
      console.log('Login Response Headers:', {
        'Access-Control-Allow-Origin': loginResponse.headers['access-control-allow-origin']
      });
      console.log('Login successful!');
    } catch (loginError) {
      // Even auth errors (401, 403) should have proper CORS headers
      // We're mainly checking if CORS is configured correctly
      if (loginError.response) {
        console.log('Login Response Status:', loginError.response.status);
        console.log('Login Response Headers:', {
          'Access-Control-Allow-Origin': loginError.response.headers['access-control-allow-origin']
        });
        console.log('Login failed with error:', loginError.response.data);
        console.log('NOTE: Auth failure is expected with test credentials. We just want to verify CORS headers are present.');
      } else {
        console.error('Network error during login:', loginError.message);
      }
    }
    
    console.log('\nCORS test completed.');
    
  } catch (error) {
    console.error('Error during CORS test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testLogin(); 
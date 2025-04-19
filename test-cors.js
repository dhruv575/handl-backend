/**
 * Test script to check CORS headers on the backend API
 * 
 * Usage:
 * 1. Install axios: npm install axios
 * 2. Run: node test-cors.js
 */

const axios = require('axios');

const API_URL = 'https://handl-backend.vercel.app/api/health';

async function testCORS() {
  try {
    // First, manually test a preflight (OPTIONS) request
    const preflightOptions = {
      method: 'OPTIONS',
      url: API_URL,
      headers: {
        'Origin': 'https://www.handl.club',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'x-auth-token,content-type'
      }
    };
    
    console.log('Testing preflight (OPTIONS) request...');
    const preflightResponse = await axios(preflightOptions);
    
    console.log('Preflight Response Status:', preflightResponse.status);
    console.log('Preflight Headers:', {
      'Access-Control-Allow-Origin': preflightResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': preflightResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': preflightResponse.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': preflightResponse.headers['access-control-allow-credentials']
    });
    
    // Then test a normal GET request
    const getOptions = {
      method: 'GET',
      url: API_URL,
      headers: {
        'Origin': 'https://www.handl.club'
      }
    };
    
    console.log('\nTesting actual (GET) request...');
    const getResponse = await axios(getOptions);
    
    console.log('GET Response Status:', getResponse.status);
    console.log('GET Headers:', {
      'Access-Control-Allow-Origin': getResponse.headers['access-control-allow-origin'],
    });
    console.log('GET Data:', getResponse.data);
    
    console.log('\nCORS configuration appears to be working correctly!');
  } catch (error) {
    console.error('Error testing CORS:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testCORS(); 
/**
 * Basic test script for testing auth routes manually
 * Run this in terminal with: node tests/auth.test.js
 */
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testUser = {
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  phoneNumber: '+12345678901',
  password: 'password123'
};

let token;

// Register User
const registerUser = async () => {
  try {
    console.log('Testing User Registration...');
    const res = await axios.post(`${API_URL}/auth/register`, testUser);
    
    console.log('Registration Successful!');
    console.log('Token:', res.data.token);
    console.log('User:', res.data.user);
    
    token = res.data.token;
    return true;
  } catch (error) {
    console.error('Registration Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Login User
const loginUser = async () => {
  try {
    console.log('\nTesting User Login...');
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('Login Successful!');
    console.log('Token:', res.data.token);
    console.log('User:', res.data.user);
    
    token = res.data.token;
    return true;
  } catch (error) {
    console.error('Login Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Get Current User
const getCurrentUser = async () => {
  try {
    console.log('\nTesting Get Current User...');
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    console.log('Get Current User Successful!');
    console.log('User:', res.data);
    return true;
  } catch (error) {
    console.error('Get Current User Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Update User Profile
const updateUserProfile = async () => {
  try {
    console.log('\nTesting Update User Profile...');
    const res = await axios.put(`${API_URL}/auth/profile`, {
      name: 'Updated Test User'
    }, {
      headers: {
        'x-auth-token': token
      }
    });
    
    console.log('Update User Profile Successful!');
    console.log('Updated User:', res.data);
    return true;
  } catch (error) {
    console.error('Update User Profile Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Run tests sequentially
const runTests = async () => {
  console.log('=== AUTH API TESTS ===\n');
  
  // Registration
  const registerSuccess = await registerUser();
  
  // If registration fails, try logging in (user might already exist)
  if (!registerSuccess) {
    await loginUser();
  }
  
  // Only continue if we have a token
  if (token) {
    await getCurrentUser();
    await updateUserProfile();
  }
  
  console.log('\n=== TESTS COMPLETED ===');
};

// Run the tests
runTests(); 
/**
 * Basic test script for testing day routes manually
 * Run this in terminal with: node tests/day.test.js
 */
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// This should be a token for a valid user
let token = null;

// Test data for day entry
const dayEntry = {
  date: new Date(),
  score: 8,
  high: 'Implemented the HandL backend API',
  low: 'Had trouble with route conflicts initially'
};

// Create Day
const createDay = async () => {
  try {
    console.log('Testing Create Day...');
    const res = await axios.post(`${API_URL}/days`, dayEntry, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Create Day Successful!');
    console.log('Created Day:', res.data);
    
    return res.data.data._id; // Return the ID for further tests
  } catch (error) {
    console.error('Create Day Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Get Days
const getDays = async () => {
  try {
    console.log('\nTesting Get Days...');
    const res = await axios.get(`${API_URL}/days`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Get Days Successful!');
    console.log('Count:', res.data.count);
    console.log('Pagination:', res.data.pagination);
    console.log('Days:', res.data.data.map(day => ({
      id: day._id,
      date: day.date,
      score: day.score
    })));
    
    return res.data.data.length > 0 ? res.data.data[0]._id : null;
  } catch (error) {
    console.error('Get Days Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Get Day by ID
const getDayById = async (id) => {
  try {
    console.log(`\nTesting Get Day by ID: ${id}...`);
    const res = await axios.get(`${API_URL}/days/${id}`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Get Day by ID Successful!');
    console.log('Day:', res.data);
    
    return true;
  } catch (error) {
    console.error('Get Day by ID Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Update Day
const updateDay = async (id) => {
  try {
    console.log(`\nTesting Update Day: ${id}...`);
    const res = await axios.put(`${API_URL}/days/${id}`, 
      { score: 9, high: 'Updated high point!' },
      { headers: { 'x-auth-token': token } }
    );
    
    console.log('Update Day Successful!');
    console.log('Updated Day:', res.data);
    
    return true;
  } catch (error) {
    console.error('Update Day Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Delete Day
const deleteDay = async (id) => {
  try {
    console.log(`\nTesting Delete Day: ${id}...`);
    const res = await axios.delete(`${API_URL}/days/${id}`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Delete Day Successful!');
    console.log('Response:', res.data);
    
    return true;
  } catch (error) {
    console.error('Delete Day Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Get Streak
const getStreak = async () => {
  try {
    console.log('\nTesting Get Streak...');
    const res = await axios.get(`${API_URL}/days/streak`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Get Streak Successful!');
    console.log('Streak:', res.data);
    
    return true;
  } catch (error) {
    console.error('Get Streak Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Get Weekly Average
const getWeeklyAverage = async () => {
  try {
    console.log('\nTesting Get Weekly Average...');
    const res = await axios.get(`${API_URL}/days/average`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Get Weekly Average Successful!');
    console.log('Average:', res.data);
    
    return true;
  } catch (error) {
    console.error('Get Weekly Average Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Login first to get token
const login = async () => {
  try {
    console.log('Logging in to get token...');
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    token = res.data.token;
    console.log('Login successful, token acquired!');
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

// Run tests sequentially
const runTests = async () => {
  console.log('=== DAY API TESTS ===\n');
  
  // Login to get token
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('Cannot proceed with tests without authentication');
    return;
  }
  
  // Create a day entry
  const newDayId = await createDay();
  
  // Get all days
  const existingDayId = await getDays() || newDayId;
  
  // If we have a day ID, run the rest of the tests
  if (existingDayId) {
    await getDayById(existingDayId);
    await updateDay(existingDayId);
    await getStreak();
    await getWeeklyAverage();
    
    // Optionally delete the day entry
    // Uncomment to test deletion
    // await deleteDay(existingDayId);
  }
  
  console.log('\n=== TESTS COMPLETED ===');
};

// Run the tests
runTests(); 
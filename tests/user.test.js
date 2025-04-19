/**
 * Basic test script for testing user routes manually
 * Run this in terminal with: node tests/user.test.js
 */
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// This should be a token for a valid user
let token = null;

// Get a user profile by username
const getUserProfile = async (username) => {
  try {
    console.log(`\nTesting Get User Profile for ${username}...`);
    const res = await axios.get(`${API_URL}/users/${username}`);
    
    console.log('Get User Profile Successful!');
    console.log('User:', res.data.data.user);
    console.log('Stats:', res.data.data.stats);
    console.log('Recent Days Count:', res.data.data.recentDays.length);
    
    return true;
  } catch (error) {
    console.error('Get User Profile Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Search users
const searchUsers = async (query) => {
  try {
    console.log(`\nTesting Search Users for "${query}"...`);
    const res = await axios.get(`${API_URL}/users/search?query=${query}`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Search Users Successful!');
    console.log('Count:', res.data.count);
    console.log('Users:', res.data.data);
    
    // Return a username for further tests
    return res.data.data.length > 0 ? res.data.data[0].username : null;
  } catch (error) {
    console.error('Search Users Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Send friend request
const sendFriendRequest = async (username) => {
  try {
    console.log(`\nTesting Send Friend Request to ${username}...`);
    const res = await axios.post(`${API_URL}/users/${username}/friend-request`, {}, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Send Friend Request Successful!');
    console.log('Response:', res.data);
    
    return true;
  } catch (error) {
    console.error('Send Friend Request Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Get friend requests
const getFriendRequests = async () => {
  try {
    console.log('\nTesting Get Friend Requests...');
    const res = await axios.get(`${API_URL}/users/friend-requests`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Get Friend Requests Successful!');
    console.log('Count:', res.data.count);
    console.log('Requests:', res.data.data);
    
    // Return a request ID for further tests
    return res.data.data.length > 0 ? res.data.data[0].from._id : null;
  } catch (error) {
    console.error('Get Friend Requests Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Respond to a friend request
const respondToFriendRequest = async (userId, action) => {
  try {
    console.log(`\nTesting Respond to Friend Request (${action}) for user ${userId}...`);
    const res = await axios.put(`${API_URL}/users/friend-request/${userId}`, 
      { action },
      { headers: { 'x-auth-token': token } }
    );
    
    console.log('Respond to Friend Request Successful!');
    console.log('Response:', res.data);
    
    return true;
  } catch (error) {
    console.error('Respond to Friend Request Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Get friends
const getFriends = async () => {
  try {
    console.log('\nTesting Get Friends...');
    const res = await axios.get(`${API_URL}/users/friends`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Get Friends Successful!');
    console.log('Count:', res.data.count);
    console.log('Friends:', res.data.data);
    
    // Return a friend ID for further tests
    return res.data.data.length > 0 ? res.data.data[0]._id : null;
  } catch (error) {
    console.error('Get Friends Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Remove a friend
const removeFriend = async (friendId) => {
  try {
    console.log(`\nTesting Remove Friend ${friendId}...`);
    const res = await axios.delete(`${API_URL}/users/friends/${friendId}`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('Remove Friend Successful!');
    console.log('Response:', res.data);
    
    return true;
  } catch (error) {
    console.error('Remove Friend Failed!');
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
    return res.data.user.username;
  } catch (error) {
    console.error('Login Failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
};

// Run tests sequentially
const runTests = async () => {
  console.log('=== USER API TESTS ===\n');
  
  // Login to get token
  const loggedInUsername = await login();
  if (!loggedInUsername) {
    console.error('Cannot proceed with tests without authentication');
    return;
  }
  
  // Get user profile
  await getUserProfile(loggedInUsername);
  
  // Search for users
  const foundUsername = await searchUsers('test');
  
  // If we found a user, try to send a friend request
  if (foundUsername && foundUsername !== loggedInUsername) {
    await sendFriendRequest(foundUsername);
  }
  
  // Get friend requests
  const requesterId = await getFriendRequests();
  
  // If we have a friend request, try to accept it
  if (requesterId) {
    await respondToFriendRequest(requesterId, 'accept');
  }
  
  // Get friends list
  const friendId = await getFriends();
  
  // If we have a friend, try to remove them
  if (friendId) {
    await removeFriend(friendId);
  }
  
  console.log('\n=== TESTS COMPLETED ===');
};

// Run the tests
runTests(); 
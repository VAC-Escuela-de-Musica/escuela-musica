// Debug script to check authentication status in browser
// Run this in the browser console to check auth state

console.log('=== DEBUG AUTH STATUS ===');
console.log('Token in localStorage:', localStorage.getItem('token'));
console.log('User in localStorage:', localStorage.getItem('user'));

// Check if token exists and is valid format
const token = localStorage.getItem('token');
if (token) {
  console.log('Token length:', token.length);
  console.log('Token starts with:', token.substring(0, 20) + '...');
  
  // Try to decode JWT payload (without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expires at:', new Date(payload.exp * 1000));
    console.log('Token is expired:', Date.now() > payload.exp * 1000);
  } catch (e) {
    console.error('Error decoding token:', e);
  }
} else {
  console.log('❌ No token found in localStorage');
}

// Check user data
const userData = localStorage.getItem('user');
if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('User data:', user);
  } catch (e) {
    console.error('Error parsing user data:', e);
  }
} else {
  console.log('❌ No user data found in localStorage');
}

// Test API headers
import { API_HEADERS } from '../frontend/src/config/api.js';
console.log('API Headers with auth:', API_HEADERS.withAuth());

// Test a simple API call
const testApiCall = async () => {
  try {
    const response = await fetch('http://146.83.198.35:1230/api/users', {
      headers: API_HEADERS.withAuth(),
      credentials: 'include'
    });
    
    console.log('Test API response status:', response.status);
    console.log('Test API response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Test API response body:', text);
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('Test API response JSON:', json);
    } catch (e) {
      console.log('Response is not JSON, likely HTML error page');
    }
  } catch (error) {
    console.error('Test API call failed:', error);
  }
};

console.log('Running test API call...');
testApiCall();
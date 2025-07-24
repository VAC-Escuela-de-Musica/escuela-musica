// Debug script to check token status and authentication
const API_BASE_URL = 'http://localhost:1230/api';

// Function to get token from localStorage (simulating browser environment)
function getStoredToken() {
  // This would normally be localStorage.getItem('token') in browser
  console.log('📋 Checking localStorage for token...');
  console.log('Note: Run this in browser console to check actual localStorage');
  console.log('localStorage.getItem("token")');
  console.log('localStorage.getItem("user")');
  return null; // Placeholder for Node.js environment
}

// Function to validate token with backend
async function validateToken(token) {
  if (!token) {
    console.log('❌ No token found');
    return false;
  }

  try {
    console.log('🔍 Validating token with backend...');
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Token validation response:', {
      status: response.status,
      ok: response.ok
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token is valid:', data);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log('❌ Token is invalid or expired:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Error validating token:', error);
    return false;
  }
}

// Function to test QR endpoint with token
async function testQREndpoint(token) {
  if (!token) {
    console.log('❌ No token provided for QR test');
    return;
  }

  try {
    console.log('🔍 Testing QR endpoint with token...');
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE_URL}/messaging/whatsapp-web/qr?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    console.log('📡 QR endpoint response:', {
      status: response.status,
      ok: response.ok
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ QR endpoint accessible:', data);
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log('❌ QR endpoint error:', errorData);
    }
  } catch (error) {
    console.error('❌ Error testing QR endpoint:', error);
  }
}

// Main debug function
async function debugTokenStatus() {
  console.log('🔧 === TOKEN STATUS DEBUG ===');
  console.log('');
  
  // Step 1: Check stored token
  console.log('1️⃣ Checking stored token...');
  const token = getStoredToken();
  
  // Step 2: Instructions for browser
  console.log('');
  console.log('2️⃣ BROWSER INSTRUCTIONS:');
  console.log('Open browser console and run:');
  console.log('console.log("Token:", localStorage.getItem("token"));');
  console.log('console.log("User:", localStorage.getItem("user"));');
  console.log('');
  
  // Step 3: Test with a sample token (user should replace)
  console.log('3️⃣ To test with your actual token, replace TOKEN_HERE and run:');
  console.log('node debug-token-status.js TOKEN_HERE');
  
  // If token provided as argument
  const providedToken = process.argv[2];
  if (providedToken && providedToken !== 'TOKEN_HERE') {
    console.log('');
    console.log('🔍 Testing provided token...');
    await validateToken(providedToken);
    await testQREndpoint(providedToken);
  }
  
  console.log('');
  console.log('🔧 === DEBUG COMPLETE ===');
}

// Run debug
debugTokenStatus().catch(console.error);

// Export for potential browser use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateToken, testQREndpoint, debugTokenStatus };
}
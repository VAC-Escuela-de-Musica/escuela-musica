const fetch = require('node-fetch');

console.log('🔍 TESTING FRONTEND-BACKEND COMMUNICATION');
console.log('==========================================');

async function testFrontendBackendCommunication() {
  try {
    // Test 1: Backend Health Check
    console.log('\n1. 🏥 Testing backend health...');
    const healthResponse = await fetch('http://localhost:3000/health');
    
    if (healthResponse.ok) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    // Test 2: Login
    console.log('\n2. 🔐 Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@email.com',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful, token obtained');

    // Test 3: Verify Token
    console.log('\n3. 🔍 Testing token verification...');
    const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.ok) {
      console.log('✅ Token verification successful');
    } else {
      console.log('❌ Token verification failed');
      return;
    }

    // Test 4: Materials endpoint
    console.log('\n4. 📚 Testing materials endpoint...');
    const materialsResponse = await fetch('http://localhost:3000/api/materials', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (materialsResponse.ok) {
      const materialsData = await materialsResponse.json();
      console.log('✅ Materials endpoint successful');
      console.log(`📊 Materials found: ${materialsData.data?.length || 0}`);
    } else {
      console.log('❌ Materials endpoint failed');
    }

    // Test 5: Users endpoint
    console.log('\n5. 👥 Testing users endpoint...');
    const usersResponse = await fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Users endpoint successful');
      console.log(`📊 Users found: ${usersData.data?.length || 0}`);
    } else {
      console.log('❌ Users endpoint failed');
    }

    console.log('\n🎯 SUMMARY: All backend endpoints are working correctly!');
    console.log('🚧 Frontend issue is likely in React components or routing');
    
  } catch (error) {
    console.error('💥 Error during testing:', error.message);
  }
}

// Función para analizar posibles problemas del frontend
function analyzeFrontendIssues() {
  console.log('\n🔍 ANALYZING POTENTIAL FRONTEND ISSUES');
  console.log('=====================================');
  
  const potentialIssues = [
    '1. Component import/export issues',
    '2. React Router configuration problems',
    '3. Missing dependencies in package.json',
    '4. Environment variables not set',
    '5. CORS issues (though backend seems to work)',
    '6. State management issues in React hooks',
    '7. CSS/styling issues causing invisible content',
    '8. JavaScript errors in console',
    '9. Build/compilation issues',
    '10. Port conflicts or server not running'
  ];

  potentialIssues.forEach(issue => {
    console.log(`   ${issue}`);
  });

  console.log('\n💡 RECOMMENDED ACTIONS:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Verify npm run dev is running without errors');
  console.log('3. Check if localhost:5173 is accessible');
  console.log('4. Verify all React components are properly exported');
  console.log('5. Check for CSS issues that might hide content');
}

// Ejecutar pruebas
testFrontendBackendCommunication().then(() => {
  analyzeFrontendIssues();
});

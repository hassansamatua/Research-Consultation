const http = require('http');

function testLoginFlow() {
  console.log('🔐 Testing complete login flow...');
  
  // Step 1: Login
  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginReq = http.request(loginOptions, (loginRes) => {
    let loginData = '';
    
    loginRes.on('data', (chunk) => {
      loginData += chunk;
    });
    
    loginRes.on('end', () => {
      console.log(`Login Status: ${loginRes.statusCode}`);
      
      if (loginRes.statusCode === 200) {
        try {
          const loginResult = JSON.parse(loginData);
          console.log('✅ Login successful');
          console.log('User:', loginResult.user);
          
          // Extract the cookie from the response headers
          const setCookieHeader = loginRes.headers['set-cookie'];
          if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              console.log('✅ Got authentication token:', tokenCookie.substring(0, 50) + '...');
              
              // Now test the student API with the token
              testStudentAPI(tokenCookie);
              
              // Also test the allocation API that's failing
              testAllocationAPI(tokenCookie);
            } else {
              console.log('❌ No token cookie found');
              process.exit(1);
            }
          } else {
            console.log('❌ No set-cookie header found');
            console.log('Headers:', loginRes.headers);
            process.exit(1);
          }
        } catch (error) {
          console.error('❌ Failed to parse login response:', error.message);
          console.log('Raw response:', loginData);
          process.exit(1);
        }
      } else {
        console.error('❌ Login failed');
        console.log('Response:', loginData);
        process.exit(1);
      }
    });
  });

  loginReq.on('error', (err) => {
    console.error('❌ Login request failed:', err.message);
    process.exit(1);
  });

  loginReq.on('timeout', () => {
    console.error('❌ Login request timed out');
    loginReq.destroy();
    process.exit(1);
  });

  // Send login credentials
  const loginBody = JSON.stringify({
    email: 'admin@zu.ac.tz',
    password: 'password123'
  });

  loginReq.write(loginBody);
  loginReq.end();
}

function testStudentAPI(cookie) {
  console.log('\n🎓 Testing /api/admin/all-students...');
  
  const apiOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/all-students',
    method: 'GET',
    timeout: 5000,
    headers: {
      'Cookie': cookie
    }
  };

  const apiReq = http.request(apiOptions, (apiRes) => {
    let apiData = '';
    
    apiRes.on('data', (chunk) => {
      apiData += chunk;
    });
    
    apiRes.on('end', () => {
      console.log(`Student API Status: ${apiRes.statusCode}`);
      
      if (apiRes.statusCode === 200) {
        try {
          const result = JSON.parse(apiData);
          console.log('✅ Student API successful - Real data returned');
          console.log(`Found ${result.total} students`);
        } catch (error) {
          console.error('❌ Failed to parse student API response:', error.message);
        }
      } else {
        console.error('❌ Student API failed');
        console.log('Response:', apiData);
      }
    });
  });

  apiReq.on('error', (err) => {
    console.error('❌ Student API request failed:', err.message);
  });

  apiReq.on('timeout', () => {
    console.error('❌ Student API request timed out');
    apiReq.destroy();
  });

  apiReq.end();
}

function testAllocationAPI(cookie) {
  console.log('\n👥 Testing /api/admin/allocate-supervisor...');
  
  const apiOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/allocate-supervisor',
    method: 'GET',
    timeout: 5000,
    headers: {
      'Cookie': cookie
    }
  };

  const apiReq = http.request(apiOptions, (apiRes) => {
    let apiData = '';
    
    apiRes.on('data', (chunk) => {
      apiData += chunk;
    });
    
    apiRes.on('end', () => {
      console.log(`Allocation API Status: ${apiRes.statusCode}`);
      
      if (apiRes.statusCode === 200) {
        try {
          const result = JSON.parse(apiData);
          console.log('✅ Allocation API successful');
          console.log(`Found ${result.allocations ? result.allocations.length : 0} allocations`);
        } catch (error) {
          console.error('❌ Failed to parse allocation API response:', error.message);
        }
      } else {
        console.error('❌ Allocation API failed (this is the 403 error you see)');
        console.log('Response:', apiData);
      }
    });
  });

  apiReq.on('error', (err) => {
    console.error('❌ Allocation API request failed:', err.message);
  });

  apiReq.on('timeout', () => {
    console.error('❌ Allocation API request timed out');
    apiReq.destroy();
  });

  apiReq.end();
}

testLoginFlow();

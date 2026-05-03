const http = require('http');

function testAuthenticatedAPI() {
  console.log('🔐 Testing authenticated API access...');
  
  // First, let's try to login to get a token
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
          
          // Extract the cookie from the response headers
          const setCookieHeader = loginRes.headers['set-cookie'];
          if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              console.log('✅ Got authentication token');
              
              // Now test the protected API with the token
              testProtectedAPI(tokenCookie);
            } else {
              console.log('❌ No token cookie found');
              process.exit(1);
            }
          } else {
            console.log('❌ No set-cookie header found');
            process.exit(1);
          }
        } catch (error) {
          console.error('❌ Failed to parse login response:', error.message);
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

function testProtectedAPI(cookie) {
  console.log('\n🎓 Testing protected student API...');
  
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
      console.log(`API Status: ${apiRes.statusCode}`);
      
      if (apiRes.statusCode === 200) {
        try {
          const result = JSON.parse(apiData);
          console.log('✅ Protected API access successful');
          console.log(`Found ${result.total} students`);
          
          if (result.students && result.students.length > 0) {
            result.students.forEach((student, index) => {
              console.log(`   ${index + 1}. ${student.first_name} ${student.last_name} - ${student.registration_number}`);
            });
          }
        } catch (error) {
          console.error('❌ Failed to parse API response:', error.message);
        }
      } else {
        console.error('❌ Protected API access failed');
        console.log('Response:', apiData);
      }
      
      process.exit(0);
    });
  });

  apiReq.on('error', (err) => {
    console.error('❌ API request failed:', err.message);
    process.exit(1);
  });

  apiReq.on('timeout', () => {
    console.error('❌ API request timed out');
    apiReq.destroy();
    process.exit(1);
  });

  apiReq.end();
}

testAuthenticatedAPI();

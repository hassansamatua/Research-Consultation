const http = require('http');

function testSupervisorAuth() {
  console.log('👨‍🏫 Testing supervisor authentication...');
  
  // Step 1: Login as supervisor
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
          console.log('✅ Supervisor login successful');
          console.log('User role:', loginResult.user.role_name);
          console.log('User:', loginResult.user.first_name, loginResult.user.last_name);
          
          // Extract the cookie
          const setCookieHeader = loginRes.headers['set-cookie'];
          if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              console.log('✅ Got authentication token');
              
              // Test the auth/me endpoint
              testAuthMe(tokenCookie);
              
              // Test the allocation endpoint for supervisors
              testSupervisorAllocation(tokenCookie);
            }
          }
        } catch (error) {
          console.error('❌ Login parse error:', error.message);
        }
      } else {
        console.error('❌ Supervisor login failed:', loginData);
      }
    });
  });

  loginReq.on('error', (err) => {
    console.error('❌ Login request error:', err.message);
  });

  // Login as supervisor
  const loginBody = JSON.stringify({
    email: 'dr.mohamed@zu.ac.tz',
    password: 'password123'
  });

  loginReq.write(loginBody);
  loginReq.end();
}

function testAuthMe(cookie) {
  console.log('\n👤 Testing /api/auth/me endpoint for supervisor...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    timeout: 5000,
    headers: {
      'Cookie': cookie
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Auth/me Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Auth/me successful');
          console.log('Current user:', result.user.email);
          console.log('Role:', result.user.role_name);
          console.log('User ID:', result.user.id);
        } catch (error) {
          console.error('❌ Auth/me parse error:', error.message);
        }
      } else {
        console.error('❌ Auth/me failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Auth/me request error:', err.message);
  });

  req.end();
}

function testSupervisorAllocation(cookie) {
  console.log('\n👥 Testing /api/admin/allocate-supervisor for supervisor...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/allocate-supervisor',
    method: 'GET',
    timeout: 5000,
    headers: {
      'Cookie': cookie
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Allocation Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Allocation endpoint successful');
          console.log('Allocations found:', result.allocations ? result.allocations.length : 0);
          
          if (result.allocations && result.allocations.length > 0) {
            console.log('Assigned students:');
            result.allocations.forEach((allocation, index) => {
              console.log(`   ${index + 1}. ${allocation.student_first_name} ${allocation.student_last_name} - ${allocation.registration_number}`);
            });
          }
        } catch (error) {
          console.error('❌ Allocation parse error:', error.message);
        }
      } else {
        console.error('❌ Allocation endpoint failed');
        console.log('Response:', data);
        
        if (res.statusCode === 403) {
          console.log('\n🔍 403 Error for supervisor:');
          console.log('This means the supervisor does not have permission to access this endpoint');
          console.log('The endpoint might be restricted to admin/super_admin only');
        }
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Allocation request error:', err.message);
  });

  req.end();
}

testSupervisorAuth();

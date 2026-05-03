const http = require('http');

function debugAuthentication() {
  console.log('🔍 Debugging authentication middleware...');
  
  // Step 1: Login and get the token
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
          console.log('User role:', loginResult.user.role_name);
          console.log('User ID:', loginResult.user.id);
          
          // Extract the cookie
          const setCookieHeader = loginRes.headers['set-cookie'];
          if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              console.log('✅ Got token cookie');
              
              // Test the auth/me endpoint first
              testAuthMe(tokenCookie);
              
              // Then test the problematic allocation endpoint
              testAllocationEndpoint(tokenCookie);
            }
          }
        } catch (error) {
          console.error('❌ Login parse error:', error.message);
        }
      } else {
        console.error('❌ Login failed:', loginData);
      }
    });
  });

  loginReq.on('error', (err) => {
    console.error('❌ Login request error:', err.message);
  });

  const loginBody = JSON.stringify({
    email: 'admin@zu.ac.tz',
    password: 'password123'
  });

  loginReq.write(loginBody);
  loginReq.end();
}

function testAuthMe(cookie) {
  console.log('\n👤 Testing /api/auth/me endpoint...');
  
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
          console.log('Is active:', result.user.is_active);
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

function testAllocationEndpoint(cookie) {
  console.log('\n👥 Testing /api/admin/allocate-supervisor endpoint...');
  
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
        } catch (error) {
          console.error('❌ Allocation parse error:', error.message);
        }
      } else {
        console.error('❌ Allocation endpoint failed (403 = Permission Denied)');
        console.log('Response:', data);
        
        if (res.statusCode === 403) {
          console.log('\n🔍 403 Error Analysis:');
          console.log('This means:');
          console.log('1. User is authenticated (token is valid)');
          console.log('2. But user does not have admin/super_admin role');
          console.log('3. OR the middleware is not reading the role correctly');
        }
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Allocation request error:', err.message);
  });

  req.end();
}

debugAuthentication();

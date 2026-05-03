const http = require('http');

function testSupervisorInfo() {
  console.log('👨‍🏫 Testing supervisor info API for students...');
  
  // Step 1: Login as student
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
          console.log('✅ Student login successful');
          console.log('User role:', loginResult.user.role_name);
          console.log('User:', loginResult.user.first_name, loginResult.user.last_name);
          
          // Extract the cookie
          const setCookieHeader = loginRes.headers['set-cookie'];
          if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              console.log('✅ Got authentication token');
              
              // Test the my-supervisor endpoint
              testMySupervisor(tokenCookie);
            }
          }
        } catch (error) {
          console.error('❌ Login parse error:', error.message);
        }
      } else {
        console.error('❌ Student login failed:', loginData);
      }
    });
  });

  loginReq.on('error', (err) => {
    console.error('❌ Login request error:', err.message);
  });

  // Login as student
  const loginBody = JSON.stringify({
    email: 'student1@zumis.ac.tz',
    password: 'password123'
  });

  loginReq.write(loginBody);
  loginReq.end();
}

function testMySupervisor(cookie) {
  console.log('\n👤 Testing /api/student/my-supervisor endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/student/my-supervisor',
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
      console.log(`My Supervisor Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ My supervisor endpoint successful');
          console.log('Message:', result.message);
          
          if (result.allocation) {
            console.log('\n📋 Supervisor Information:');
            console.log('Name:', result.allocation.first_name, result.allocation.last_name);
            console.log('Email:', result.allocation.email);
            console.log('Phone:', result.allocation.phone);
            console.log('Department:', result.allocation.department);
            console.log('Specialization:', result.allocation.specialization);
            console.log('Academic Rank:', result.allocation.academic_rank);
            console.log('Staff ID:', result.allocation.staff_id);
            console.log('Allocation Date:', result.allocation.allocated_at);
            console.log('Status:', result.allocation.status);
          } else {
            console.log('No supervisor assigned to this student');
          }
        } catch (error) {
          console.error('❌ Parse error:', error.message);
          console.log('Raw response:', data);
        }
      } else {
        console.error('❌ My supervisor endpoint failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  req.end();
}

testSupervisorInfo();

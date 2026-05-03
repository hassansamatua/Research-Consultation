const http = require('http');

function testSupervisorDashboard() {
  console.log('🎓 Testing Supervisor Dashboard APIs...');
  
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
          console.log('User:', loginResult.user.first_name, loginResult.user.last_name);
          console.log('Role:', loginResult.user.role_name);
          
          // Extract the cookie
          const setCookieHeader = loginRes.headers['set-cookie'];
          if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              console.log('✅ Got authentication token');
              
              // Test all supervisor APIs
              testSupervisorProfile(tokenCookie);
              testSupervisorAllocations(tokenCookie);
              testMessages(tokenCookie);
              testMeetings(tokenCookie);
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

function testSupervisorProfile(cookie) {
  console.log('\n👤 Testing /api/supervisor/profile...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/supervisor/profile',
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
      console.log(`Profile Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Supervisor profile retrieved');
          console.log('Name:', result.supervisor.first_name, result.supervisor.last_name);
          console.log('Department:', result.supervisor.department);
          console.log('Specialization:', result.supervisor.specialization);
        } catch (error) {
          console.error('❌ Parse error:', error.message);
        }
      } else {
        console.error('❌ Profile fetch failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  req.end();
}

function testSupervisorAllocations(cookie) {
  console.log('\n👥 Testing /api/supervisor/allocations...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/supervisor/allocations',
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
      console.log(`Allocations Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Supervisor allocations retrieved');
          console.log('Number of students:', result.allocations.length);
          result.allocations.forEach((allocation, index) => {
            console.log(`Student ${index + 1}: ${allocation.first_name} ${allocation.last_name} - ${allocation.registration_number}`);
          });
        } catch (error) {
          console.error('❌ Parse error:', error.message);
        }
      } else {
        console.error('❌ Allocations fetch failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  req.end();
}

function testMessages(cookie) {
  console.log('\n✉️ Testing /api/messages/send...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/messages/send',
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
      console.log(`Messages Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Messages retrieved');
          console.log('Total messages:', result.messages.length);
          result.messages.forEach((message, index) => {
            const unreadStatus = message.is_read ? 'read' : 'unread';
            console.log(`Message ${index + 1}: ${message.subject} (${unreadStatus})`);
          });
        } catch (error) {
          console.error('❌ Parse error:', error.message);
        }
      } else {
        console.error('❌ Messages fetch failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  req.end();
}

function testMeetings(cookie) {
  console.log('\n📅 Testing /api/meetings...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/meetings',
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
      console.log(`Meetings Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Meetings retrieved');
          console.log('Total meetings:', result.meetings.length);
          result.meetings.forEach((meeting, index) => {
            console.log(`Meeting ${index + 1}: ${meeting.title} with ${meeting.student_name} (${meeting.status})`);
          });
        } catch (error) {
          console.error('❌ Parse error:', error.message);
        }
      } else {
        console.error('❌ Meetings fetch failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  req.end();
}

testSupervisorDashboard();

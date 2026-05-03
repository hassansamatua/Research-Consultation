const http = require('http');

function debugMessageSending() {
  console.log('🔍 Debugging message sending issue...');
  
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
          
          // Extract the cookie
          const setCookieHeader = loginRes.headers['set-cookie'];
          if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              console.log('✅ Got authentication token');
              
              // First check what the supervisor API returns
              checkSupervisorInfo(tokenCookie);
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

function checkSupervisorInfo(cookie) {
  console.log('\n👨‍🏫 Checking supervisor info...');
  
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
      console.log(`Supervisor Info Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Supervisor info retrieved');
          console.log('Allocation data:', JSON.stringify(result.allocation, null, 2));
          
          if (result.allocation) {
            console.log('\n📋 Available IDs:');
            console.log('supervisor_id:', result.allocation.supervisor_id);
            console.log('supervisor_user_id:', result.allocation.supervisor_user_id);
            console.log('student_id:', result.allocation.student_id);
            console.log('user_id (student):', result.allocation.user_id);
            
            // Test sending message with different IDs
            testMessageWithDifferentIDs(cookie, result.allocation);
          } else {
            console.log('❌ No allocation found');
          }
        } catch (error) {
          console.error('❌ Parse error:', error.message);
        }
      } else {
        console.error('❌ Supervisor info failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  req.end();
}

function testMessageWithDifferentIDs(cookie, allocation) {
  console.log('\n📤 Testing message sending with different IDs...');
  
  // Test 1: Try with supervisor_user_id
  console.log('\n--- Test 1: Using supervisor_user_id ---');
  testSend(cookie, allocation.supervisor_user_id, 'Test with supervisor_user_id');
  
  // Test 2: Try with supervisor_id
  setTimeout(() => {
    console.log('\n--- Test 2: Using supervisor_id ---');
    testSend(cookie, allocation.supervisor_id, 'Test with supervisor_id');
  }, 2000);
}

function testSend(cookie, receiverId, testDescription) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/messages/send',
    method: 'POST',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`${testDescription} - Status: ${res.statusCode}`);
      
      if (res.statusCode === 201) {
        try {
          const result = JSON.parse(data);
          console.log(`✅ ${testDescription} - SUCCESS!`);
          console.log('Response:', result.message);
          console.log('Message ID:', result.message_id);
        } catch (error) {
          console.error(`❌ ${testDescription} - Parse error:`, error.message);
        }
      } else {
        console.error(`❌ ${testDescription} - FAILED`);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`❌ ${testDescription} - Request error:`, err.message);
  });

  const messageBody = JSON.stringify({
    receiver_id: receiverId,
    subject: testDescription,
    message_text: `This is a test message to verify which ID works for sending messages to the supervisor.`
  });

  req.write(messageBody);
  req.end();
}

debugMessageSending();

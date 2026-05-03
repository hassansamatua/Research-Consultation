const http = require('http');

function testMessageFunctionality() {
  console.log('💬 Testing message functionality...');
  
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
          console.log('User:', loginResult.user.first_name, loginResult.user.last_name);
          
          // Extract the cookie
          const setCookieHeader = loginRes.headers['set-cookie'];
          if (setCookieHeader) {
            const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              console.log('✅ Got authentication token');
              
              // Test sending a message
              testSendMessage(tokenCookie);
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

function testSendMessage(cookie) {
  console.log('\n📤 Testing message sending...');
  
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
      console.log(`Send Message Status: ${res.statusCode}`);
      
      if (res.statusCode === 201) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Message sent successfully!');
          console.log('Message ID:', result.message_id);
          console.log('Response:', result.message);
        } catch (error) {
          console.error('❌ Parse error:', error.message);
          console.log('Raw response:', data);
        }
      } else {
        console.error('❌ Message sending failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
  });

  // Send test message
  const messageBody = JSON.stringify({
    receiver_id: 3, // Supervisor's user ID
    subject: 'Test Message from Student',
    message_text: 'This is a test message to verify the messaging functionality works correctly.'
  });

  req.write(messageBody);
  req.end();
}

testMessageFunctionality();

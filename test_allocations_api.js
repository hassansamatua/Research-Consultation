const http = require('http');

// First login to get a session
function login() {
  return new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      email: 'dr.mohamed@zu.ac.tz',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const cookies = res.headers['set-cookie'];
          resolve(cookies);
        } else {
          reject(new Error(`Login failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

// Test allocations API
function testAllocations(cookies) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/supervisor/allocations',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve(data);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  try {
    console.log('🔑 Logging in...');
    const cookies = await login();
    console.log('✅ Login successful');
    
    console.log('\n📊 Testing allocations API...');
    const result = await testAllocations(cookies);
    
    try {
      const data = JSON.parse(result);
      console.log('\n📋 Allocations found:', data.allocations?.length || 0);
      if (data.allocations && data.allocations.length > 0) {
        console.log('\n👥 Student details:');
        data.allocations.forEach((alloc, index) => {
          console.log(`${index + 1}. ${alloc.student_first_name} ${alloc.student_last_name} - ${alloc.registration_number}`);
        });
      }
    } catch (parseError) {
      console.log('❌ Failed to parse JSON:', parseError.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTest();

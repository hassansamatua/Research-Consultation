const http = require('http');

function testStudentAPI() {
  console.log('🎓 Testing student API endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/all-students',
    method: 'GET',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      
      try {
        const result = JSON.parse(data);
        console.log('Response:', JSON.stringify(result, null, 2));
        
        if (result.students && result.students.length > 0) {
          console.log('\n✅ API returned student data:');
          result.students.forEach((student, index) => {
            console.log(`   ${index + 1}. ${student.first_name} ${student.last_name} - ${student.registration_number}`);
          });
        } else {
          console.log('❌ No students returned from API');
        }
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.log('Raw response:', data);
      }
      
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('❌ API request failed:', err.message);
    console.log('💡 Make sure the development server is running with: npm run dev');
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('❌ Request timed out');
    req.destroy();
    process.exit(1);
  });

  req.end();
}

testStudentAPI();

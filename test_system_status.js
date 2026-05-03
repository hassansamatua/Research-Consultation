const http = require('http');

function testServerStatus() {
  console.log('🌐 Testing server status...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server responded with status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('🎉 Application is running successfully!');
      console.log('📱 You can access it at: http://localhost:3000');
      console.log('');
      console.log('👤 Test Accounts:');
      console.log('   Admin: admin@zu.ac.tz');
      console.log('   Super Admin: superadmin@zu.ac.tz');
      console.log('   Supervisor: dr.mohamed@zu.ac.tz');
      console.log('   Student: student@zu.ac.tz');
      console.log('   Password for all: password123');
    } else {
      console.log('⚠️  Server responded but may have issues');
    }
    
    process.exit(0);
  });

  req.on('error', (err) => {
    console.error('❌ Server not accessible:', err.message);
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

testServerStatus();

const { authenticateUser } = require('./src/lib/auth');

async function testAuthentication() {
  try {
    console.log('🔐 Testing authentication...');
    
    // Test with sample user credentials
    const testEmail = 'admin@zu.ac.tz';
    const testPassword = 'admin123';
    
    const result = await authenticateUser(testEmail, testPassword);
    
    console.log('✅ Authentication successful');
    console.log('User:', {
      id: result.user.id,
      email: result.user.email,
      name: `${result.user.first_name} ${result.user.last_name}`,
      role: result.user.role_name
    });
    console.log('Token length:', result.token.length);
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    
    // Try to find existing users
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'research_consultant'
    });
    
    const [users] = await connection.execute('SELECT email, first_name, last_name, role_name FROM users u JOIN roles r ON u.role_id = r.id LIMIT 5');
    console.log('\n📋 Available users for testing:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.first_name} ${user.last_name}, ${user.role_name})`);
    });
    
    await connection.end();
  }
}

testAuthentication();

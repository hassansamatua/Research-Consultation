const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  let connection;
  
  try {
    console.log('🔧 Creating test user with known password...');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'research_consultant'
    });
    
    // Hash the password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('✅ Password hashed successfully');
    
    // Update the admin user with the new password
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@zu.ac.tz']
    );
    
    console.log('✅ Admin user password updated');
    
    // Also update the student user for testing
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'student1@zumis.ac.tz']
    );
    
    console.log('✅ Student user password updated');
    
    // Also update the supervisor user
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'dr.mohamed@zu.ac.tz']
    );
    
    console.log('✅ Supervisor user password updated');
    
    console.log('\n🎉 Test users created/updated:');
    console.log('   Admin: admin@zu.ac.tz / password123');
    console.log('   Student: student1@zumis.ac.tz / password123');
    console.log('   Supervisor: dr.mohamed@zu.ac.tz / password123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestUser();

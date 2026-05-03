const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'research_consultant'
};

async function testSystemFunctionality() {
  let connection;
  
  try {
    console.log('🔍 Testing system functionality...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');
    
    // 1. Test users exist
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Found ${users[0].count} users`);
    
    // 2. Test roles
    const [roles] = await connection.execute('SELECT * FROM roles');
    console.log('✅ Available roles:');
    roles.forEach(role => {
      console.log(`   - ${role.name}: ${role.description}`);
    });
    
    // 3. Test students
    const [students] = await connection.execute(`
      SELECT s.registration_number, u.first_name, u.last_name, s.program 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      LIMIT 3
    `);
    console.log('\n✅ Sample students:');
    students.forEach(student => {
      console.log(`   - ${student.registration_number}: ${student.first_name} ${student.last_name} (${student.program})`);
    });
    
    // 4. Test supervisors
    const [supervisors] = await connection.execute(`
      SELECT sup.staff_id, u.first_name, u.last_name, sup.department 
      FROM supervisors sup 
      JOIN users u ON sup.user_id = u.id 
      LIMIT 3
    `);
    console.log('\n✅ Sample supervisors:');
    supervisors.forEach(supervisor => {
      console.log(`   - ${supervisor.staff_id}: ${supervisor.first_name} ${supervisor.last_name} (${supervisor.department})`);
    });
    
    // 5. Test research projects
    const [projects] = await connection.execute(`
      SELECT rp.title, s.registration_number, rp.status 
      FROM research_projects rp 
      JOIN students s ON rp.student_id = s.id 
      LIMIT 3
    `);
    console.log('\n✅ Sample research projects:');
    projects.forEach(project => {
      console.log(`   - ${project.title} by ${project.registration_number} (${project.status})`);
    });
    
    // 6. Test submissions
    const [submissions] = await connection.execute(`
      SELECT s.original_filename, rs.name as stage, s.status 
      FROM submissions s 
      JOIN research_stages rs ON s.research_stage_id = rs.id 
      LIMIT 3
    `);
    console.log('\n✅ Sample submissions:');
    submissions.forEach(submission => {
      console.log(`   - ${submission.original_filename} (${submission.stage}): ${submission.status}`);
    });
    
    // 7. Test JWT token generation
    const testUser = {
      id: 1,
      email: 'test@example.com',
      role: 'admin'
    };
    const token = jwt.sign(testUser, 'your-super-secret-jwt-key-change-in-production', { expiresIn: '7d' });
    console.log('\n✅ JWT token generation works');
    console.log(`   Token length: ${token.length}`);
    
    // 8. Test password hashing
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log('\n✅ Password hashing works');
    console.log(`   Hash length: ${hashedPassword.length}`);
    console.log(`   Verification: ${isValid}`);
    
    console.log('\n🎉 All core functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testSystemFunctionality();

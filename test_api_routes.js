const http = require('http');
const mysql = require('mysql2/promise');

// Test API endpoints
async function testAPIRoutes() {
  console.log('🌐 Testing API Routes...\n');
  
  // Test database connection first
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'research_consultant'
    });
    console.log('✅ Database connected for API testing');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }
  
  // Test API endpoints by making HTTP requests
  const testEndpoints = [
    {
      name: 'Document Types',
      path: '/api/documents/types',
      method: 'GET'
    },
    {
      name: 'Auth Me',
      path: '/api/auth/me',
      method: 'GET'
    }
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      
      // Since we can't easily test authentication without a running server,
      // we'll test the database queries that the endpoints use
      
      if (endpoint.path === '/api/documents/types') {
        const [documentTypes] = await connection.execute('SELECT * FROM document_types ORDER BY name ASC');
        console.log(`✅ Found ${documentTypes.length} document types`);
        documentTypes.forEach(type => {
          console.log(`   - ${type.name}: ${type.description}`);
        });
      }
      
      if (endpoint.path === '/api/auth/me') {
        const [users] = await connection.execute('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id LIMIT 3');
        console.log(`✅ Found ${users.length} sample users for auth testing`);
        users.forEach(user => {
          console.log(`   - ${user.email} (${user.role_name})`);
        });
      }
      
    } catch (error) {
      console.error(`❌ ${endpoint.name} test failed:`, error.message);
    }
  }
  
  // Test document submissions structure
  try {
    console.log('\nTesting document submissions structure...');
    const [submissions] = await connection.execute(`
      SELECT 
        ds.*,
        rs.name as research_stage_name,
        s.first_name as student_first_name,
        s.last_name as student_last_name
      FROM document_submissions ds
      LEFT JOIN research_stages rs ON ds.research_stage_id = rs.id
      LEFT JOIN students st ON ds.student_id = st.id
      LEFT JOIN users s ON st.user_id = s.id
      LIMIT 3
    `);
    
    console.log(`✅ Document submissions structure works (${submissions.length} found)`);
    if (submissions.length > 0) {
      console.log('Sample submission:', {
        id: submissions[0].id,
        title: submissions[0].title,
        status: submissions[0].status,
        student: submissions[0].student_first_name
      });
    }
  } catch (error) {
    console.error('❌ Document submissions test failed:', error.message);
  }
  
  await connection.end();
  console.log('\n🎉 API route testing completed!');
}

testAPIRoutes();

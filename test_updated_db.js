const mysql = require('mysql2/promise');

// Updated database configuration - using actual values from .env
const dbConfig = {
  host: 'containers-us-west-XXX.railway.app',
  port: 7913,
  user: 'root',
  password: 'your-railway-generated-password',
  database: 'railway',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: false,
  charset: 'utf8mb4',
};

async function testUpdatedConnection() {
  console.log('Testing updated database configuration...');
  console.log('Host:', dbConfig.host);
  console.log('Port:', dbConfig.port);
  console.log('Database:', dbConfig.database);
  
  const pool = mysql.createPool(dbConfig);
  
  // Test connection with retry logic
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`\nConnection attempt ${attempt}...`);
      const startTime = Date.now();
      
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      
      const endTime = Date.now();
      console.log(`✅ Connection successful in ${endTime - startTime}ms`);
      
      // Test a simple query
      const [rows] = await pool.execute('SELECT COUNT(*) as userCount FROM users');
      console.log(`✅ Query successful - Found ${rows[0].userCount} users`);
      
      await pool.end();
      return true;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === 3) {
        console.error('❌ All attempts failed');
        await pool.end();
        return false;
      }
      
      // Wait before retrying
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

testUpdatedConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});

// Test Railway MySQL Connection
const { testConnection } = require('./src/lib/db.js');

async function testRailwayConnection() {
  console.log('Testing Railway MySQL connection...');
  
  try {
    const connected = await testConnection();
    
    if (connected) {
      console.log('✅ Successfully connected to Railway MySQL!');
      console.log('🎉 Your database is ready for production!');
    } else {
      console.log('❌ Failed to connect to Railway MySQL');
      console.log('Please check your .env file configuration');
    }
  } catch (error) {
    console.error('Connection error:', error.message);
  }
}

testRailwayConnection();

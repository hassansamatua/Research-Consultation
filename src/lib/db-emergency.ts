// Emergency Database Configuration - Minimal Connections
// Use this when database is hitting connection limits

import mysql from 'mysql2/promise';

// Emergency database configuration - absolute minimum
const emergencyDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'research_consultant',
  waitForConnections: true,
  connectionLimit: 1, // Emergency: Only 1 connection
  queueLimit: 5, // Very small queue
  connectTimeout: 5000, // 5 seconds
  acquireTimeout: 3000, // 3 seconds to acquire
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
};

// Create emergency connection pool
const emergencyPool = mysql.createPool(emergencyDbConfig);

// Emergency query execution with aggressive timeout
export async function emergencyQuery(query: string, params: any[] = []) {
  let connection: any;
  try {
    // Set timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timed out')), 8000);
    });

    const queryPromise = (async () => {
      connection = await emergencyPool.getConnection();
      const [rows] = await connection.execute(query, params);
      return rows;
    })();

    const result = await Promise.race([queryPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('Emergency query error:', error);
    
    if (error instanceof Error && (error as any).code === 'ER_CON_COUNT_ERROR') {
      throw new Error('Database is overloaded. Please wait a few minutes before trying again.');
    }
    
    throw error;
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Error releasing connection:', releaseError);
      }
    }
  }
}

// Emergency single record fetch
export async function emergencyGetOne(query: string, params: any[] = []) {
  const rows = await emergencyQuery(query, params) as any[];
  return rows.length > 0 ? rows[0] : null;
}

// Emergency multiple records fetch
export async function emergencyGetMany(query: string, params: any[] = []) {
  return await emergencyQuery(query, params) as any[];
}

export default emergencyPool;

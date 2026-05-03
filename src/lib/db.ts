import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'research_consultant',
  waitForConnections: true,
  connectionLimit: 5, // Reduced from 20 to 5
  queueLimit: 10, // Added queue limit
  connectTimeout: 10000, // Reduced from 60000 to 10 seconds
  acquireTimeout: 10000, // Added acquire timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection with retry logic
export async function testConnection(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('Database connected successfully');
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error('Max retry attempts reached. Database connection failed.');
        return false;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

// Execute query with error handling and connection management
export async function executeQuery(query: string, params: any[] = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Query execution error:', error);
    
    // Handle connection errors specifically
    if (error instanceof Error && (error as any).code === 'ER_CON_COUNT_ERROR') {
      console.error('Database connection limit reached. Please try again later.');
      throw new Error('Database is temporarily unavailable. Please try again in a few moments.');
    }
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Execute transaction
export async function executeTransaction(queries: { query: string; params?: any[] }[]) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Get single record
export async function getOne(query: string, params: any[] = []) {
  const rows = await executeQuery(query, params) as any[];
  return rows.length > 0 ? rows[0] : null;
}

// Get multiple records
export async function getMany(query: string, params: any[] = []) {
  return await executeQuery(query, params) as any[];
}

// Insert record
export async function insert(table: string, data: Record<string, any>) {
  const fields = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  
  const query = `INSERT INTO ${table} (${fields}) VALUES (${placeholders})`;
  const result = await executeQuery(query, values) as any;
  
  return result.insertId;
}

// Update record
export async function update(table: string, data: Record<string, any>, where: Record<string, any>) {
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
  const values = [...Object.values(data), ...Object.values(where)];
  
  const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const result = await executeQuery(query, values) as any;
  
  return result.affectedRows;
}

// Delete record
export async function deleteRecord(table: string, where: Record<string, any>) {
  const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
  const values = Object.values(where);
  
  const query = `DELETE FROM ${table} WHERE ${whereClause}`;
  const result = await executeQuery(query, values) as any;
  
  return result.affectedRows;
}

// Check if record exists
export async function exists(table: string, where: Record<string, any>) {
  const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
  const values = Object.values(where);
  
  const query = `SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause}`;
  const result = await getOne(query, values) as any;
  
  return result.count > 0;
}

export default pool;

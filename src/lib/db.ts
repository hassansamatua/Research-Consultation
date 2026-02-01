import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'research_consultant',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Execute query with error handling
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
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

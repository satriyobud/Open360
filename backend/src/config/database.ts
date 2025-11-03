import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL or use individual connection parameters
function getConnectionConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Parse mysql://user:password@host:port/database
    const match = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[3],
        port: parseInt(match[4]),
        user: match[1],
        password: match[2],
        database: match[5],
      };
    }
    // If no password
    const matchNoPass = databaseUrl.match(/mysql:\/\/([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (matchNoPass) {
      return {
        host: matchNoPass[2],
        port: parseInt(matchNoPass[3]),
        user: matchNoPass[1],
        password: '',
        database: matchNoPass[4],
      };
    }
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '360_feedback',
  };
}

const config = getConnectionConfig();

// Create connection pool
const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection
pool.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

// Helper function to execute queries
export async function query(sql: string, params?: any[]): Promise<any> {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to get a connection (for transactions)
export async function getConnection() {
  return await pool.getConnection();
}

export default pool;

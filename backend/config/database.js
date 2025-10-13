const { Pool } = require('pg');
require('dotenv').config();

// Create pool with connection timeout
const pool = new Pool({
  user: process.env.DB_USER || 'poojithanappari',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Restaurant_database',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  connectionTimeoutMillis: 5000, // 5 second connection timeout
  idleTimeoutMillis: 30000,
  max: 20
});

// Test connection function
async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📝 Connection details:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'restaurant_management'}`);
  console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`   Port: ${process.env.DB_PORT || 5432}`);
  
  let client;
  try {
    // Attempt to connect
    client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database time:', result.rows[0].current_time);
    
    // Test if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Database connection FAILED:');
    console.error('   Error:', error.message);
    
    // Provide specific troubleshooting based on error
    if (error.code === '28P01') {
      console.error('💡 Solution: Check your DB_PASSWORD in .env file');
    } else if (error.code === '3D000') {
      console.error('💡 Solution: Database does not exist. Create it in pgAdmin first.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Solution: PostgreSQL is not running on port 5432');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 Solution: Cannot find database host');
    }
    
    return false;
  } finally {
    // Release client back to pool
    if (client) {
      client.release();
    }
  }
}

// Export the pool and test function
module.exports = {
  pool,
  testConnection
};
import { db } from './db.js';

async function testConnection() {
  try {
    console.log('Testing database connection with individual PG environment variables...');
    const result = await db.execute('SELECT 1 as test');
    console.log('Database connection successful:', result);
    
    // Test users table exists
    const usersTest = await db.execute('SELECT COUNT(*) FROM users');
    console.log('Users table accessible:', usersTest);
    
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
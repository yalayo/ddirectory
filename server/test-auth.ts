import { storage } from './storage';

async function testAuth() {
  try {
    console.log('Testing authentication system...');
    
    // Test authentication with correct credentials
    const user = await storage.authenticateUser('admin', 'password123');
    if (user) {
      console.log('✓ Authentication successful:', { id: user.id, username: user.username, role: user.role });
    } else {
      console.log('✗ Authentication failed with correct credentials');
    }
    
    // Test authentication with wrong credentials
    const wrongUser = await storage.authenticateUser('admin', 'wrongpassword');
    if (!wrongUser) {
      console.log('✓ Authentication properly rejected wrong password');
    } else {
      console.log('✗ Authentication accepted wrong password');
    }
    
  } catch (error) {
    console.error('Authentication test failed:', error);
  }
}

testAuth();
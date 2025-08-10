// Fix Admin User Authentication
// This script will manually confirm the admin user's email in the database

const fetch = require('node-fetch');

const fixAdminAuth = async () => {
  try {
    console.log('🔧 Attempting to fix admin authentication...');
    
    // First, let's create a new admin user properly through the API
    const adminData = {
      email: "admin@nandighoshbus.com", 
      password: "Nandighosh@3211",
      full_name: "Admin User",
      phone: "9876543210",
      role: "admin"
    };

    console.log('🚀 Creating new admin user via API...');
    const registerResponse = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });

    const registerResult = await registerResponse.json();
    
    if (registerResponse.ok && registerResult.success) {
      console.log('✅ New admin user created successfully!');
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password:', adminData.password);
      console.log('👤 Full Name:', adminData.full_name);
      console.log('📱 Phone:', adminData.phone);
      console.log('🎯 Role:', adminData.role);
      
      // Now test the login
      console.log('\n🔐 Testing login...');
      const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password
        })
      });

      const loginResult = await loginResponse.json();
      
      if (loginResponse.ok && loginResult.success) {
        console.log('✅ Login test successful!');
        console.log('\n🎯 YOU CAN NOW LOGIN WITH:');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password:', adminData.password);
        console.log('🌐 URL: http://localhost:3002/agent/login');
        console.log('👑 Select: Administrator');
      } else {
        console.log('❌ Login test failed:', loginResult.message);
      }
    } else if (registerResult.message && registerResult.message.includes('already exists')) {
      console.log('ℹ️ Admin user already exists, testing login...');
      
      const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password
        })
      });

      const loginResult = await loginResponse.json();
      
      if (loginResponse.ok && loginResult.success) {
        console.log('✅ Existing admin user login works!');
        console.log('\n🎯 YOU CAN LOGIN WITH:');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Password:', adminData.password);
      } else {
        console.log('❌ Login failed:', loginResult.message);
        console.log('📝 This likely means email confirmation is needed.');
        console.log('\n🔧 NEXT STEPS:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Run this query:');
        console.log(`
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = '${adminData.email}';

UPDATE user_profiles 
SET is_verified = true, updated_at = NOW() 
WHERE email = '${adminData.email}';
        `);
      }
    } else {
      console.error('❌ Failed to create admin user:');
      console.error('Error:', registerResult.message || registerResult);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n🔧 Make sure the backend server is running on http://localhost:5000');
  }
};

fixAdminAuth();

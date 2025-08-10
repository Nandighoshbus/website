// Create Admin User via API
// This script creates an admin user using the backend registration endpoint

const createAdminUser = async () => {
  const adminData = {
    email: "saurav@nandighosh.com",
    password: "Nandighosh@3211",
    full_name: "Saurav Nanda",
    phone: "+919876543210",
    role: "admin"
  };

  try {
    console.log('🚀 Creating admin user...');
    const response = await fetch('http://localhost:5000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminData.email);
      console.log('🔑 Password:', adminData.password);
      console.log('👤 Full Name:', adminData.full_name);
      console.log('📱 Phone:', adminData.phone);
      console.log('🎯 Role:', adminData.role);
      console.log('\n🎯 LOGIN INSTRUCTIONS:');
      console.log('1. Go to: http://localhost:3002/agent/login');
      console.log('2. Select: Administrator');
      console.log('3. Email:', adminData.email);
      console.log('4. Password:', adminData.password);
    } else {
      console.error('❌ Failed to create admin user:');
      console.error('Status:', response.status);
      console.error('Error:', result.message || result);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n🔧 Make sure the backend server is running on http://localhost:5000');
  }
};

createAdminUser();

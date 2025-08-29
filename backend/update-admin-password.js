const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateAdminPassword() {
  console.log('=== UPDATING ADMIN PASSWORD ===');
  
  try {
    // Hash the password
    const password = 'Nandighosh@3211';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    // Update the admin user with the hashed password
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ password: hashedPassword })
      .eq('email', 'saurav@nandighoshbus.com')
      .select();
    
    if (error) {
      console.error('Error updating password:', error);
      process.exit(1);
    } else {
      console.log('✅ Admin password updated successfully');
      console.log('Updated user email:', data[0]?.email);
      console.log('Password field now exists:', !!data[0]?.password);
      process.exit(0);
    }
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
}

updateAdminPassword();

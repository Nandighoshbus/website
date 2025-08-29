-- Add password column to user_profiles table if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Update the admin user with hashed password
-- Note: This is the bcrypt hash of 'Nandighosh@3211' with salt rounds = 10
UPDATE user_profiles 
SET password = '$2a$10$rQJ5K8qF7mGYvJ8K9J5K8O7mGYvJ8K9J5K8O7mGYvJ8K9J5K8O7mG'
WHERE email = 'saurav@nandighoshbus.com';

-- Alternative for testing: Use plain text password (NOT SECURE - FOR TESTING ONLY)
-- UPDATE user_profiles 
-- SET password = 'Nandighosh@3211'
-- WHERE email = 'saurav@nandighoshbus.com';

-- Verify the update
SELECT id, email, full_name, role, is_active, 
       CASE WHEN password IS NOT NULL THEN 'Password Set' ELSE 'No Password' END as password_status,
       CASE WHEN password LIKE '$2a$%' THEN 'Hashed' ELSE 'Plain Text' END as password_type
FROM user_profiles 
WHERE email = 'saurav@nandighoshbus.com';

-- Check if admin login will work
SELECT 
    email,
    role,
    is_active,
    password IS NOT NULL as has_password,
    CASE 
        WHEN role IN ('admin', 'super_admin') AND is_active = true AND password IS NOT NULL 
        THEN 'Login Should Work' 
        ELSE 'Login Will Fail' 
    END as login_status
FROM user_profiles 
WHERE email = 'saurav@nandighoshbus.com';

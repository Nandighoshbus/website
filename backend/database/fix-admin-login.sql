-- Fix admin login by adding password column and setting admin password
-- Execute these commands in your Supabase SQL Editor

-- Step 1: Add password column to user_profiles table if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Step 2: For immediate testing - use plain text password (TEMPORARY SOLUTION)
-- This allows you to test login immediately while we work on proper hashing
UPDATE user_profiles 
SET password = 'Nandighosh@3211'
WHERE email = 'saurav@nandighoshbus.com';

-- Step 3: Verify the admin user is ready for login
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    password IS NOT NULL as has_password,
    CASE 
        WHEN role IN ('admin', 'super_admin') AND is_active = true AND password IS NOT NULL 
        THEN '✅ Ready for Login' 
        ELSE '❌ Login Will Fail' 
    END as login_status
FROM user_profiles 
WHERE email = 'saurav@nandighoshbus.com';

-- Step 4: (Optional) Later, you can update to use bcrypt hashed password
-- UPDATE user_profiles 
-- SET password = '$2a$10$[BCRYPT_HASH_HERE]'
-- WHERE email = 'saurav@nandighoshbus.com';

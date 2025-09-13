-- Create a test agent user in Supabase
-- Run this SQL in the Supabase SQL editor

-- 1. First, create/update a user with agent role in user_metadata
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'agent', 'full_name', 'Test Agent')
WHERE email = 'agent@nandighoshbus.com';

-- If the user doesn't exist, you need to create them first through Supabase Auth
-- or use the Agent Sign-up page

-- 2. Verify the update
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'agent@nandighoshbus.com';

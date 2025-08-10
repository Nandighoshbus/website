-- Quick Admin Creation (Run this in Supabase SQL Editor)

-- Insert admin profile
INSERT INTO user_profiles (
    id,
    email,
    phone,
    full_name,
    role,
    is_verified,
    is_active,
    preferences,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'saurav@nandighosh.com',
    '+919876543210',
    'Saurav Nanda',
    'admin',
    true,
    true,
    '{"employee_id": "ADM001", "department": "Administration"}',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = 'Saurav Nanda',
    role = 'admin',
    is_verified = true,
    updated_at = NOW();

-- Show the created user
SELECT email, full_name, role, phone, is_verified FROM user_profiles WHERE email = 'saurav@nandighosh.com';

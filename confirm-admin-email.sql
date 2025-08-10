-- Manually confirm the admin user's email in Supabase
-- This script will set email_confirmed_at to enable login

DO $$
DECLARE
    user_email TEXT := 'saurav@nandighosh.com';
    user_id_to_confirm UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id_to_confirm FROM auth.users WHERE email = user_email;
    
    IF user_id_to_confirm IS NOT NULL THEN
        -- Confirm email in auth.users
        UPDATE auth.users 
        SET email_confirmed_at = NOW()
        WHERE id = user_id_to_confirm;
        
        -- Set user as verified in user_profiles
        UPDATE user_profiles 
        SET is_verified = true, updated_at = NOW()
        WHERE id = user_id_to_confirm;
        
        RAISE NOTICE '✅ Admin user % has been manually verified and confirmed', user_email;
        RAISE NOTICE 'Email confirmed at: %', NOW();
        RAISE NOTICE 'User can now login successfully';
    ELSE
        RAISE NOTICE '❌ User % not found', user_email;
    END IF;
END $$;

-- Verify the confirmation
SELECT 
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    email_confirmed_at
FROM auth.users 
WHERE email = 'saurav@nandighosh.com';

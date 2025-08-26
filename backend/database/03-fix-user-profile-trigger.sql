-- Fix for user profile creation - Auto-create profile on user signup
-- This prevents the infinite recursion issue by using a trigger instead of RLS for profile creation

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')::user_role
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Alternative: Create a simpler RLS policy for user_profiles that doesn't cause recursion
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create non-recursive policies
CREATE POLICY "Enable read access for users to own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update access for users to own profile" ON user_profiles  
    FOR UPDATE USING (auth.uid() = id);

-- Allow service role to insert profiles (for the trigger)
CREATE POLICY "Enable insert for service role" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Row Level Security Policies for Nandighosh Bus Service
-- Run this AFTER the main schema file

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- User Profiles Policies (Fixed to prevent infinite recursion)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Agents Policies
DROP POLICY IF EXISTS "Users can view own agent profile" ON agents;
DROP POLICY IF EXISTS "Users can update own agent profile" ON agents;
DROP POLICY IF EXISTS "Admins can manage agents" ON agents;

CREATE POLICY "Users can view own agent profile" ON agents
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can update own agent profile" ON agents
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage agents" ON agents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Routes Policies (Public read, admin write)
DROP POLICY IF EXISTS "Anyone can view active routes" ON routes;
DROP POLICY IF EXISTS "Admins can manage routes" ON routes;

-- Allow anonymous users to view active routes
CREATE POLICY "Anyone can view active routes" ON routes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage routes" ON routes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Route Stops Policies
DROP POLICY IF EXISTS "Anyone can view route stops" ON route_stops;
DROP POLICY IF EXISTS "Admins can manage route stops" ON route_stops;

CREATE POLICY "Anyone can view route stops" ON route_stops
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage route stops" ON route_stops
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Buses Policies
DROP POLICY IF EXISTS "Anyone can view active buses" ON buses;
DROP POLICY IF EXISTS "Admins can manage buses" ON buses;

-- Allow anonymous users to view active buses
CREATE POLICY "Anyone can view active buses" ON buses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage buses" ON buses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Bus Schedules Policies
DROP POLICY IF EXISTS "Anyone can view active schedules" ON bus_schedules;
DROP POLICY IF EXISTS "Admins can manage schedules" ON bus_schedules;

-- Allow anonymous users to view active schedules
CREATE POLICY "Anyone can view active schedules" ON bus_schedules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage schedules" ON bus_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Bookings Policies
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Agents can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Agents can view their bookings" ON bookings
    FOR SELECT USING (
        agent_id IN (
            SELECT id FROM agents WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all bookings" ON bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Booking Passengers Policies
DROP POLICY IF EXISTS "Users can view own booking passengers" ON booking_passengers;
DROP POLICY IF EXISTS "Users can manage own booking passengers" ON booking_passengers;
DROP POLICY IF EXISTS "Admins can manage all booking passengers" ON booking_passengers;

CREATE POLICY "Users can view own booking passengers" ON booking_passengers
    FOR SELECT USING (
        booking_id IN (
            SELECT id FROM bookings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own booking passengers" ON booking_passengers
    FOR ALL USING (
        booking_id IN (
            SELECT id FROM bookings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all booking passengers" ON booking_passengers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Payments Policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        booking_id IN (
            SELECT id FROM bookings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (
        booking_id IN (
            SELECT id FROM bookings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Audit Logs Policies (Admin only)
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
        )
    );

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON routes, route_stops, buses, bus_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bookings, booking_passengers, payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON agents TO authenticated;

-- Grant anonymous permissions for public data
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON routes, route_stops, buses, bus_schedules TO anon;

-- Grant admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

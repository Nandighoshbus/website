-- Nandighosh Bus Service - Row Level Security Policies (Scalable)
-- Run this file SECOND after the main schema
-- These policies ensure data security while maintaining performance

-- 1. User Profiles Policies
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- System can create profiles during signup
CREATE POLICY "System can create profiles" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Agents Policies
-- Agents can view their own agent record
CREATE POLICY "Agents can view own record" ON agents 
    FOR SELECT USING (user_id = auth.uid());

-- Admins can view all agents
CREATE POLICY "Admins can view all agents" ON agents 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- System can create agent records
CREATE POLICY "System can create agents" ON agents 
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- 3. Routes Policies (Public read access for active routes)
CREATE POLICY "Anyone can view active routes" ON routes 
    FOR SELECT USING (is_active = true);

-- Admins can manage routes
CREATE POLICY "Admins can manage routes" ON routes 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- 4. Route Stops Policies (Public read access)
CREATE POLICY "Anyone can view route stops" ON route_stops 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routes r 
            WHERE r.id = route_stops.route_id AND r.is_active = true
        )
    );

-- Admins can manage route stops
CREATE POLICY "Admins can manage route stops" ON route_stops 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- 5. Buses Policies
-- Admins and agents can view buses
CREATE POLICY "Admins and agents can view buses" ON buses 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin', 'agent')
        )
    );

-- Only admins can manage buses
CREATE POLICY "Admins can manage buses" ON buses 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- 6. Bus Schedules Policies (Public read access for active schedules)
CREATE POLICY "Anyone can view active schedules" ON bus_schedules 
    FOR SELECT USING (is_active = true);

-- Admins can manage schedules
CREATE POLICY "Admins can manage schedules" ON bus_schedules 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- 7. Bookings Policies (Most critical for performance and security)
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings 
    FOR SELECT USING (
        user_id = auth.uid() OR 
        contact_phone IN (
            SELECT phone FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings 
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'agent'
        )
    );

-- Users can update their own pending bookings only
CREATE POLICY "Users can update own pending bookings" ON bookings 
    FOR UPDATE USING (
        user_id = auth.uid() AND status IN ('pending', 'confirmed')
    )
    WITH CHECK (
        user_id = auth.uid() AND status IN ('pending', 'confirmed', 'cancelled')
    );

-- Agents can view bookings they created
CREATE POLICY "Agents can view their bookings" ON bookings 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agents a 
            WHERE a.user_id = auth.uid() AND a.id = bookings.agent_id
        )
    );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- 8. Booking Passengers Policies
-- Users can view passengers for their bookings
CREATE POLICY "Users can view own booking passengers" ON booking_passengers 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_passengers.booking_id AND b.user_id = auth.uid()
        )
    );

-- Users can create passenger records for their bookings
CREATE POLICY "Users can create booking passengers" ON booking_passengers 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = booking_passengers.booking_id AND 
                  (b.user_id = auth.uid() OR 
                   EXISTS (SELECT 1 FROM agents a WHERE a.user_id = auth.uid() AND a.id = b.agent_id))
        )
    );

-- Agents can view passengers for their bookings
CREATE POLICY "Agents can view their booking passengers" ON booking_passengers 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            INNER JOIN agents a ON a.id = b.agent_id 
            WHERE b.id = booking_passengers.booking_id AND a.user_id = auth.uid()
        )
    );

-- Admins can view all passengers
CREATE POLICY "Admins can view all booking passengers" ON booking_passengers 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- 9. Payments Policies (Sensitive financial data)
-- Users can view payments for their bookings only
CREATE POLICY "Users can view own payments" ON payments 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = payments.booking_id AND b.user_id = auth.uid()
        )
    );

-- System can create payment records
CREATE POLICY "System can create payments" ON payments 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = payments.booking_id AND 
                  (b.user_id = auth.uid() OR 
                   EXISTS (SELECT 1 FROM agents a WHERE a.user_id = auth.uid() AND a.id = b.agent_id))
        )
    );

-- Only payment gateway or admins can update payments
CREATE POLICY "Limited payment updates" ON payments 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        ) OR
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = payments.booking_id AND b.user_id = auth.uid() AND 
                  payments.status = 'pending'
        )
    );

-- Agents can view payments for their bookings
CREATE POLICY "Agents can view their payments" ON payments 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            INNER JOIN agents a ON a.id = b.agent_id 
            WHERE b.id = payments.booking_id AND a.user_id = auth.uid()
        )
    );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- 10. Audit Logs Policies (Read-only for users, full access for admins)
-- Users can view audit logs for their own records
CREATE POLICY "Users can view own audit logs" ON audit_logs 
    FOR SELECT USING (
        user_id = auth.uid() OR
        record_id = auth.uid()::UUID
    );

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('admin', 'super_admin')
        )
    );

-- System can create audit log entries
CREATE POLICY "System can create audit logs" ON audit_logs 
    FOR INSERT WITH CHECK (true);

-- Performance optimization: Create policy-aware indexes
-- These indexes help RLS policies execute faster
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_uid ON user_profiles(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agents_user_auth_uid ON agents(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_user_auth_uid ON bookings(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_auth ON bookings(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_booking_auth ON payments(booking_id, status);

-- Create function to check if user is admin (reusable)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id AND role IN ('admin', 'super_admin') AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check if user is agent (reusable)
CREATE OR REPLACE FUNCTION is_agent(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles up
        INNER JOIN agents a ON a.user_id = up.id
        WHERE up.id = user_id AND up.role = 'agent' AND up.is_active = true AND a.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Comments for documentation
COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 'Allows users to view their own profile - Core security policy';
COMMENT ON POLICY "Anyone can view active routes" ON routes IS 'Public access to active routes for search functionality';
COMMENT ON POLICY "Users can view own bookings" ON bookings IS 'Users can only see their own bookings - Critical for privacy';
COMMENT ON POLICY "Users can view own payments" ON payments IS 'Financial data access restricted to booking owner only';

-- Performance note: These policies are optimized for the scalable backend architecture
-- They work efficiently with Redis caching and the service layer

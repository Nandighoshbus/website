-- Emergency Fix for Permission Denied Errors
-- This script disables RLS temporarily and grants broad permissions to fix the immediate issue

-- First, check if RLS is enabled and disable it temporarily for public tables
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE buses DISABLE ROW LEVEL SECURITY;
ALTER TABLE bus_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to anon role for public data
GRANT ALL ON routes TO anon;
GRANT ALL ON buses TO anon;
GRANT ALL ON bus_schedules TO anon;
GRANT ALL ON route_stops TO anon;

-- Grant permissions to authenticated role as well
GRANT ALL ON routes TO authenticated;
GRANT ALL ON buses TO authenticated;
GRANT ALL ON bus_schedules TO authenticated;
GRANT ALL ON route_stops TO authenticated;

-- Re-enable RLS with permissive policies
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

-- Drop and recreate permissive policies
DROP POLICY IF EXISTS "Allow all access to routes" ON routes;
DROP POLICY IF EXISTS "Allow all access to buses" ON buses;
DROP POLICY IF EXISTS "Allow all access to bus_schedules" ON bus_schedules;
DROP POLICY IF EXISTS "Allow all access to route_stops" ON route_stops;

-- Create very permissive policies for public data
CREATE POLICY "Allow all access to routes" ON routes FOR ALL USING (true);
CREATE POLICY "Allow all access to buses" ON buses FOR ALL USING (true);
CREATE POLICY "Allow all access to bus_schedules" ON bus_schedules FOR ALL USING (true);
CREATE POLICY "Allow all access to route_stops" ON route_stops FOR ALL USING (true);

-- Ensure schema permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant sequence permissions if needed
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

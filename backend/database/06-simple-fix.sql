-- Simple Fix: Temporarily disable RLS on public tables
-- This is the fastest way to resolve the permission denied errors

-- Disable RLS on public data tables
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE buses DISABLE ROW LEVEL SECURITY;
ALTER TABLE bus_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON routes, buses, bus_schedules, route_stops TO anon;
GRANT SELECT ON routes, buses, bus_schedules, route_stops TO authenticated;

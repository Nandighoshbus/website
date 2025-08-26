-- Add day column to routes table for date-based filtering
-- This allows routes to be associated with specific days of operation

-- Add day column to routes table
ALTER TABLE routes ADD COLUMN IF NOT EXISTS operating_days TEXT[];
ALTER TABLE routes ADD COLUMN IF NOT EXISTS day_of_week INTEGER; -- 0=Sunday, 1=Monday, etc.

-- Add comments for clarity
COMMENT ON COLUMN routes.operating_days IS 'Array of operating days like [''monday'', ''tuesday'', ''friday'']';
COMMENT ON COLUMN routes.day_of_week IS 'Day of week as integer: 0=Sunday, 1=Monday, 2=Tuesday, etc.';

-- Update existing routes with default operating days (all days)
UPDATE routes 
SET operating_days = ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
WHERE operating_days IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_routes_operating_days ON routes USING GIN (operating_days);
CREATE INDEX IF NOT EXISTS idx_routes_day_of_week ON routes (day_of_week);

-- Alternative: If you prefer a simpler approach with just day_of_week
-- You can also add a function to get day name from date
CREATE OR REPLACE FUNCTION get_day_name(input_date DATE)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(TO_CHAR(input_date, 'Day'));
END;
$$ LANGUAGE plpgsql;

-- Function to check if route operates on given date
CREATE OR REPLACE FUNCTION route_operates_on_date(route_operating_days TEXT[], check_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    day_name TEXT;
BEGIN
    day_name := TRIM(LOWER(TO_CHAR(check_date, 'Day')));
    RETURN day_name = ANY(route_operating_days);
END;
$$ LANGUAGE plpgsql;

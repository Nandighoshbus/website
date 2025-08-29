-- Add operating days column to routes table
-- This allows tracking which days of the week each route operates

-- Add operating_days column to routes table
ALTER TABLE routes 
ADD COLUMN operating_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]';

-- Add comment to explain the column
COMMENT ON COLUMN routes.operating_days IS 'Array of days when the route operates. Values: monday, tuesday, wednesday, thursday, friday, saturday, sunday';

-- Create index for operating days queries
CREATE INDEX idx_routes_operating_days ON routes USING GIN (operating_days);

-- Update existing routes to have default operating days (all days)
UPDATE routes 
SET operating_days = '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]'
WHERE operating_days IS NULL;

-- Example queries for operating days:
-- Find routes operating on specific day:
-- SELECT * FROM routes WHERE operating_days ? 'monday';

-- Find routes operating on weekends:
-- SELECT * FROM routes WHERE operating_days ?| array['saturday', 'sunday'];

-- Find routes operating on weekdays only:
-- SELECT * FROM routes WHERE operating_days @> '["monday", "tuesday", "wednesday", "thursday", "friday"]' 
-- AND NOT (operating_days ?| array['saturday', 'sunday']);

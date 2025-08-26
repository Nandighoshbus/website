-- Debug script to check routes, buses, and schedules data
-- This will help identify why no routes are found

-- Check if routes table has data
SELECT 'Routes Count' as table_name, COUNT(*) as count FROM routes;
SELECT 'Active Routes Count' as table_name, COUNT(*) as count FROM routes WHERE is_active = true;

-- Check sample routes data
SELECT 
    id, 
    route_code, 
    name, 
    source_city, 
    destination_city, 
    is_active,
    operating_days
FROM routes 
LIMIT 5;

-- Check if buses table has data
SELECT 'Buses Count' as table_name, COUNT(*) as count FROM buses;
SELECT 'Active Buses Count' as table_name, COUNT(*) as count FROM buses WHERE is_active = true;

-- Check if bus_schedules table has data
SELECT 'Bus Schedules Count' as table_name, COUNT(*) as count FROM bus_schedules;
SELECT 'Active Bus Schedules Count' as table_name, COUNT(*) as count FROM bus_schedules WHERE is_active = true;

-- Check sample bus schedules
SELECT 
    id,
    bus_id,
    route_id,
    departure_date,
    departure_time,
    available_seats,
    is_active
FROM bus_schedules 
WHERE is_active = true
LIMIT 5;

-- Check for specific route combinations (common test routes)
SELECT DISTINCT source_city, destination_city 
FROM routes 
WHERE is_active = true 
ORDER BY source_city, destination_city;

-- Check if there are any schedules for today or future dates
SELECT 
    COUNT(*) as future_schedules_count
FROM bus_schedules bs
JOIN routes r ON bs.route_id = r.id
WHERE bs.is_active = true 
  AND r.is_active = true
  AND bs.departure_date >= CURRENT_DATE;

-- Sample query to test the exact search logic
SELECT 
    bs.id,
    bs.departure_date,
    bs.departure_time,
    bs.available_seats,
    r.source_city,
    r.destination_city,
    r.operating_days,
    b.bus_name,
    b.bus_type
FROM bus_schedules bs
JOIN routes r ON bs.route_id = r.id
JOIN buses b ON bs.bus_id = b.id
WHERE bs.is_active = true
  AND r.is_active = true
  AND b.is_active = true
  AND r.source_city = 'Cuttack'  -- Replace with your test cities
  AND r.destination_city = 'Bhubaneswar'  -- Replace with your test cities
  AND bs.departure_date = '2025-08-27'  -- Replace with your test date
  AND bs.available_seats >= 1
ORDER BY bs.departure_time;

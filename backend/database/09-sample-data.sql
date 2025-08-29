-- Insert sample data to test the booking system
-- This will help resolve the "No Routes Found" issue

-- Insert sample routes
INSERT INTO routes (id, route_code, name, source_city, destination_city, distance_km, estimated_duration, base_fare, is_active, operating_days, created_at, updated_at) 
VALUES 
    (gen_random_uuid(), 'CB001', 'Cuttack to Bhubaneswar Express', 'Cuttack', 'Bhubaneswar', 30, '1 hour', 50.00, true, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], NOW(), NOW()),
    (gen_random_uuid(), 'BC001', 'Bhubaneswar to Cuttack Express', 'Bhubaneswar', 'Cuttack', 30, '1 hour', 50.00, true, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], NOW(), NOW()),
    (gen_random_uuid(), 'CP001', 'Cuttack to Puri Direct', 'Cuttack', 'Puri', 60, '2 hours', 80.00, true, ARRAY['monday', 'wednesday', 'friday', 'sunday'], NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    operating_days = EXCLUDED.operating_days,
    updated_at = NOW();

-- Insert sample buses
INSERT INTO buses (id, bus_number, bus_name, bus_type, total_seats, available_seats, amenities, registration_number, is_active, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'OD-01-1234', 'Kalinga Express', 'ac', 40, 40, '["AC", "WiFi", "Charging Port"]'::JSONB, 'OD01AB1234', true, NOW(), NOW()),
    (gen_random_uuid(), 'OD-01-5678', 'Jagannath Travels', 'non_ac', 45, 45, '["Comfortable Seats", "Music System"]'::JSONB, 'OD01CD5678', true, NOW(), NOW()),
    (gen_random_uuid(), 'OD-01-9012', 'Konark Luxury', 'luxury', 35, 35, '["AC", "WiFi", "Charging Port", "Entertainment System"]'::JSONB, 'OD01EF9012', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

INSERT INTO bus_schedules (departure_date, departure_time, arrival_date, arrival_time, base_fare, available_seats, booked_seats, blocked_seats, is_active, created_at, updated_at, bus_id, route_id)
SELECT 
    CURRENT_DATE as departure_date,
    '08:00:00'::TIME as departure_time,
    CURRENT_DATE as arrival_date,
    '09:00:00'::TIME as arrival_time,
    60.00 as base_fare,
    35 as available_seats,
    '[]'::JSONB as booked_seats,
    '[]'::JSONB as blocked_seats,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at,
    (SELECT id FROM buses WHERE bus_number = 'OD-01-1234' LIMIT 1) as bus_id,
    (SELECT id FROM routes WHERE route_code = 'CB001' LIMIT 1) as route_id
WHERE EXISTS (SELECT 1 FROM buses WHERE bus_number = 'OD-01-1234')
  AND EXISTS (SELECT 1 FROM routes WHERE route_code = 'CB001')

UNION ALL

SELECT 
    CURRENT_DATE as departure_date,
    '10:30:00'::TIME as departure_time,
    CURRENT_DATE as arrival_date,
    '11:30:00'::TIME as arrival_time,
    50.00 as base_fare,
    40 as available_seats,
    '[]'::JSONB as booked_seats,
    '[]'::JSONB as blocked_seats,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at,
    (SELECT id FROM buses WHERE bus_number = 'OD-01-5678' LIMIT 1) as bus_id,
    (SELECT id FROM routes WHERE route_code = 'CB001' LIMIT 1) as route_id
WHERE EXISTS (SELECT 1 FROM buses WHERE bus_number = 'OD-01-5678')
  AND EXISTS (SELECT 1 FROM routes WHERE route_code = 'CB001')

UNION ALL

SELECT 
    CURRENT_DATE + 1 as departure_date,
    '08:00:00'::TIME as departure_time,
    CURRENT_DATE + 1 as arrival_date,
    '09:00:00'::TIME as arrival_time,
    60.00 as base_fare,
    40 as available_seats,
    '[]'::JSONB as booked_seats,
    '[]'::JSONB as blocked_seats,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at,
    (SELECT id FROM buses WHERE bus_number = 'OD-01-1234' LIMIT 1) as bus_id,
    (SELECT id FROM routes WHERE route_code = 'BC001' LIMIT 1) as route_id
WHERE EXISTS (SELECT 1 FROM buses WHERE bus_number = 'OD-01-1234')
  AND EXISTS (SELECT 1 FROM routes WHERE route_code = 'BC001')
ON CONFLICT (id) DO UPDATE SET
    available_seats = EXCLUDED.available_seats,
    updated_at = NOW();

-- Update existing routes to have operating_days if they don't
UPDATE routes 
SET operating_days = ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
WHERE operating_days IS NULL OR array_length(operating_days, 1) IS NULL;

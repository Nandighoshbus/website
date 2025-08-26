-- Insert sample data to test the booking system
-- This will help resolve the "No Routes Found" issue

-- Insert sample routes
INSERT INTO routes (id, route_code, name, source_city, destination_city, distance_km, estimated_duration, base_fare, is_active, operating_days, created_at, updated_at) 
VALUES 
    ('route-1', 'CTC-BBS-001', 'Cuttack to Bhubaneswar Express', 'Cuttack', 'Bhubaneswar', 30, '1 hour', 50.00, true, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], NOW(), NOW()),
    ('route-2', 'BBS-CTC-001', 'Bhubaneswar to Cuttack Express', 'Bhubaneswar', 'Cuttack', 30, '1 hour', 50.00, true, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], NOW(), NOW()),
    ('route-3', 'CTC-PURI-001', 'Cuttack to Puri Direct', 'Cuttack', 'Puri', 60, '2 hours', 80.00, true, ARRAY['monday', 'wednesday', 'friday', 'sunday'], NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    operating_days = EXCLUDED.operating_days,
    updated_at = NOW();

-- Insert sample buses
INSERT INTO buses (id, bus_number, bus_name, bus_type, total_seats, amenities, is_active, created_at, updated_at)
VALUES 
    ('bus-1', 'OD-01-1234', 'Kalinga Express', 'ac', 40, ARRAY['AC', 'WiFi', 'Charging Port'], true, NOW(), NOW()),
    ('bus-2', 'OD-01-5678', 'Jagannath Travels', 'non_ac', 45, ARRAY['Comfortable Seats', 'Music System'], true, NOW(), NOW()),
    ('bus-3', 'OD-01-9012', 'Konark Luxury', 'luxury', 35, ARRAY['AC', 'WiFi', 'Charging Port', 'Entertainment System'], true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

-- Insert sample bus schedules for the next few days
INSERT INTO bus_schedules (id, bus_id, route_id, departure_date, departure_time, arrival_date, arrival_time, base_fare, available_seats, booked_seats, blocked_seats, is_active, created_at, updated_at)
VALUES 
    -- Today's schedules
    ('schedule-1', 'bus-1', 'route-1', CURRENT_DATE, '08:00:00', CURRENT_DATE, '09:00:00', 60.00, 35, ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW()),
    ('schedule-2', 'bus-2', 'route-1', CURRENT_DATE, '10:30:00', CURRENT_DATE, '11:30:00', 50.00, 40, ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW()),
    ('schedule-3', 'bus-1', 'route-2', CURRENT_DATE, '14:00:00', CURRENT_DATE, '15:00:00', 60.00, 38, ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW()),
    
    -- Tomorrow's schedules
    ('schedule-4', 'bus-1', 'route-1', CURRENT_DATE + 1, '08:00:00', CURRENT_DATE + 1, '09:00:00', 60.00, 40, ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW()),
    ('schedule-5', 'bus-2', 'route-1', CURRENT_DATE + 1, '10:30:00', CURRENT_DATE + 1, '11:30:00', 50.00, 45, ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW()),
    ('schedule-6', 'bus-3', 'route-2', CURRENT_DATE + 1, '16:00:00', CURRENT_DATE + 1, '17:00:00', 80.00, 35, ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW()),
    
    -- Day after tomorrow's schedules
    ('schedule-7', 'bus-1', 'route-1', CURRENT_DATE + 2, '08:00:00', CURRENT_DATE + 2, '09:00:00', 60.00, 40, ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW()),
    ('schedule-8', 'bus-2', 'route-3', CURRENT_DATE + 2, '09:00:00', CURRENT_DATE + 2, '11:00:00', 80.00, 42, ARRAY[]::text[], ARRAY[]::text[], true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    available_seats = EXCLUDED.available_seats,
    updated_at = NOW();

-- Update existing routes to have operating_days if they don't
UPDATE routes 
SET operating_days = ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
WHERE operating_days IS NULL OR array_length(operating_days, 1) IS NULL;

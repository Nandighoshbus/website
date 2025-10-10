-- Add Puri to Rourkela Bus Route
-- This script adds a complete bus service from Puri to Rourkela
-- Including route, bus, and schedules

-- ============================================
-- 1. INSERT ROUTE: Puri to Rourkela
-- ============================================
INSERT INTO routes (
    route_code, 
    name, 
    source_city, 
    destination_city, 
    distance_km, 
    estimated_duration, 
    base_fare, 
    is_active,
    created_at,
    updated_at
) VALUES (
    'PR-RKL',
    'Puri to Rourkela Express',
    'Puri',
    'Rourkela',
    450,
    '9 hours',
    650.00,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (route_code) DO UPDATE SET
    name = EXCLUDED.name,
    distance_km = EXCLUDED.distance_km,
    estimated_duration = EXCLUDED.estimated_duration,
    base_fare = EXCLUDED.base_fare,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- 2. INSERT BUS: Dedicated bus for this route
-- ============================================
INSERT INTO buses (
    bus_number,
    bus_name,
    bus_type,
    total_seats,
    available_seats,
    seat_layout,
    amenities,
    registration_number,
    manufacturing_year,
    is_active,
    created_at,
    updated_at
) VALUES (
    'OD-05-PR-2024',
    'Nandighosh Express',
    'ac',
    42,
    42,
    '{"rows": 11, "columns": 4}'::JSONB,
    '["AC", "WiFi", "Charging Port", "Water Bottle", "Blanket", "Reading Light"]'::JSONB,
    'OD05PR2024',
    2023,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (bus_number) DO UPDATE SET
    bus_name = EXCLUDED.bus_name,
    bus_type = EXCLUDED.bus_type,
    total_seats = EXCLUDED.total_seats,
    available_seats = EXCLUDED.available_seats,
    amenities = EXCLUDED.amenities,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- 3. INSERT ROUTE STOPS: Intermediate stops
-- ============================================
-- Stop 1: Puri (Origin)
INSERT INTO route_stops (
    route_id,
    stop_name,
    stop_code,
    city,
    stop_order,
    latitude,
    longitude,
    departure_time,
    arrival_time,
    fare_from_origin
) VALUES (
    (SELECT id FROM routes WHERE route_code = 'PR-RKL'),
    'Puri Bus Stand',
    'PUR-BS',
    'Puri',
    1,
    19.8135,
    85.8312,
    '06:00:00',
    NULL,
    0.00
)
ON CONFLICT (route_id, stop_order) DO UPDATE SET
    stop_name = EXCLUDED.stop_name,
    departure_time = EXCLUDED.departure_time,
    updated_at = NOW();

-- Stop 2: Bhubaneswar
INSERT INTO route_stops (
    route_id,
    stop_name,
    stop_code,
    city,
    stop_order,
    latitude,
    longitude,
    departure_time,
    arrival_time,
    fare_from_origin
) VALUES (
    (SELECT id FROM routes WHERE route_code = 'PR-RKL'),
    'Bhubaneswar Baramunda Bus Stand',
    'BBSR-BS',
    'Bhubaneswar',
    2,
    20.2961,
    85.8245,
    '08:00:00',
    '07:45:00',
    100.00
)
ON CONFLICT (route_id, stop_order) DO UPDATE SET
    stop_name = EXCLUDED.stop_name,
    arrival_time = EXCLUDED.arrival_time,
    departure_time = EXCLUDED.departure_time,
    fare_from_origin = EXCLUDED.fare_from_origin,
    updated_at = NOW();

-- Stop 3: Cuttack
INSERT INTO route_stops (
    route_id,
    stop_name,
    stop_code,
    city,
    stop_order,
    latitude,
    longitude,
    departure_time,
    arrival_time,
    fare_from_origin
) VALUES (
    (SELECT id FROM routes WHERE route_code = 'PR-RKL'),
    'Cuttack Badambadi Bus Stand',
    'CTC-BS',
    'Cuttack',
    3,
    20.4625,
    85.8830,
    '09:00:00',
    '08:45:00',
    150.00
)
ON CONFLICT (route_id, stop_order) DO UPDATE SET
    stop_name = EXCLUDED.stop_name,
    arrival_time = EXCLUDED.arrival_time,
    departure_time = EXCLUDED.departure_time,
    fare_from_origin = EXCLUDED.fare_from_origin,
    updated_at = NOW();

-- Stop 4: Angul
INSERT INTO route_stops (
    route_id,
    stop_name,
    stop_code,
    city,
    stop_order,
    latitude,
    longitude,
    departure_time,
    arrival_time,
    fare_from_origin
) VALUES (
    (SELECT id FROM routes WHERE route_code = 'PR-RKL'),
    'Angul Bus Stand',
    'ANG-BS',
    'Angul',
    4,
    20.8400,
    85.1018,
    '11:00:00',
    '10:45:00',
    300.00
)
ON CONFLICT (route_id, stop_order) DO UPDATE SET
    stop_name = EXCLUDED.stop_name,
    arrival_time = EXCLUDED.arrival_time,
    departure_time = EXCLUDED.departure_time,
    fare_from_origin = EXCLUDED.fare_from_origin,
    updated_at = NOW();

-- Stop 5: Sambalpur
INSERT INTO route_stops (
    route_id,
    stop_name,
    stop_code,
    city,
    stop_order,
    latitude,
    longitude,
    departure_time,
    arrival_time,
    fare_from_origin
) VALUES (
    (SELECT id FROM routes WHERE route_code = 'PR-RKL'),
    'Sambalpur Bus Stand',
    'SBP-BS',
    'Sambalpur',
    5,
    21.4669,
    83.9812,
    '13:30:00',
    '13:15:00',
    450.00
)
ON CONFLICT (route_id, stop_order) DO UPDATE SET
    stop_name = EXCLUDED.stop_name,
    arrival_time = EXCLUDED.arrival_time,
    departure_time = EXCLUDED.departure_time,
    fare_from_origin = EXCLUDED.fare_from_origin,
    updated_at = NOW();

-- Stop 6: Rourkela (Destination)
INSERT INTO route_stops (
    route_id,
    stop_name,
    stop_code,
    city,
    stop_order,
    latitude,
    longitude,
    departure_time,
    arrival_time,
    fare_from_origin
) VALUES (
    (SELECT id FROM routes WHERE route_code = 'PR-RKL'),
    'Rourkela Bus Stand',
    'RKL-BS',
    'Rourkela',
    6,
    22.2604,
    84.8536,
    NULL,
    '15:00:00',
    650.00
)
ON CONFLICT (route_id, stop_order) DO UPDATE SET
    stop_name = EXCLUDED.stop_name,
    arrival_time = EXCLUDED.arrival_time,
    fare_from_origin = EXCLUDED.fare_from_origin,
    updated_at = NOW();

-- ============================================
-- 4. INSERT BUS SCHEDULES: Daily service
-- ============================================
-- Schedule for today and next 7 days
INSERT INTO bus_schedules (
    bus_id,
    route_id,
    departure_date,
    departure_time,
    arrival_date,
    arrival_time,
    base_fare,
    available_seats,
    booked_seats,
    blocked_seats,
    days_of_operation,
    is_active,
    special_notes,
    created_at,
    updated_at
)
SELECT 
    (SELECT id FROM buses WHERE bus_number = 'OD-05-PR-2024') as bus_id,
    (SELECT id FROM routes WHERE route_code = 'PR-RKL') as route_id,
    CURRENT_DATE + (day_offset || ' days')::INTERVAL as departure_date,
    '06:00:00'::TIME as departure_time,
    CURRENT_DATE + (day_offset || ' days')::INTERVAL as arrival_date,
    '15:00:00'::TIME as arrival_time,
    650.00 as base_fare,
    42 as available_seats,
    '[]'::JSONB as booked_seats,
    '[]'::JSONB as blocked_seats,
    ARRAY[1,2,3,4,5,6,7] as days_of_operation,
    true as is_active,
    'Direct AC bus service from Puri to Rourkela with WiFi and charging facilities' as special_notes,
    NOW() as created_at,
    NOW() as updated_at
FROM generate_series(0, 7) as day_offset
WHERE EXISTS (SELECT 1 FROM buses WHERE bus_number = 'OD-05-PR-2024')
  AND EXISTS (SELECT 1 FROM routes WHERE route_code = 'PR-RKL')
ON CONFLICT (bus_id, departure_date, departure_time) DO UPDATE SET
    available_seats = EXCLUDED.available_seats,
    base_fare = EXCLUDED.base_fare,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================
-- Verify route was created
SELECT 
    route_code,
    name,
    source_city,
    destination_city,
    distance_km,
    estimated_duration,
    base_fare,
    is_active
FROM routes 
WHERE route_code = 'PR-RKL';

-- Verify bus was created
SELECT 
    bus_number,
    bus_name,
    bus_type,
    total_seats,
    amenities,
    is_active
FROM buses 
WHERE bus_number = 'OD-05-PR-2024';

-- Verify route stops
SELECT 
    rs.stop_order,
    rs.stop_name,
    rs.city,
    rs.arrival_time,
    rs.departure_time,
    rs.fare_from_origin
FROM route_stops rs
JOIN routes r ON rs.route_id = r.id
WHERE r.route_code = 'PR-RKL'
ORDER BY rs.stop_order;

-- Verify schedules
SELECT 
    bs.departure_date,
    bs.departure_time,
    bs.arrival_time,
    bs.base_fare,
    bs.available_seats,
    b.bus_name,
    r.name as route_name
FROM bus_schedules bs
JOIN buses b ON bs.bus_id = b.id
JOIN routes r ON bs.route_id = r.id
WHERE r.route_code = 'PR-RKL'
ORDER BY bs.departure_date;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Successfully added Puri to Rourkela bus route!';
    RAISE NOTICE '  Route Code: PR-RKL';
    RAISE NOTICE '  Bus Number: OD-05-PR-2024';
    RAISE NOTICE '  Distance: 450 km';
    RAISE NOTICE '  Duration: 9 hours';
    RAISE NOTICE '  Base Fare: ₹650';
    RAISE NOTICE '  Stops: Puri → Bhubaneswar → Cuttack → Angul → Sambalpur → Rourkela';
    RAISE NOTICE '  Schedules created for next 8 days';
END $$;

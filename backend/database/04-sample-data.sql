-- Nandighosh Bus Service - Sample Data for Development & Testing
-- Run this file FOURTH (optional - only for development/testing)
-- Contains realistic sample data optimized for performance testing

-- Sample routes (covering major Odisha destinations)
INSERT INTO routes (route_code, name, source_city, destination_city, distance_km, estimated_duration, base_fare) VALUES
('BB-CTC', 'Bhubaneswar to Cuttack', 'Bhubaneswar', 'Cuttack', 30, '1 hour', 50.00),
('BB-PR', 'Bhubaneswar to Puri', 'Bhubaneswar', 'Puri', 60, '1.5 hours', 80.00),
('CTC-RSL', 'Cuttack to Rourkela', 'Cuttack', 'Rourkela', 340, '7 hours', 450.00),
('BB-BRP', 'Bhubaneswar to Berhampur', 'Bhubaneswar', 'Berhampur', 180, '4 hours', 250.00),
('BB-SMB', 'Bhubaneswar to Sambalpur', 'Bhubaneswar', 'Sambalpur', 260, '5.5 hours', 350.00),
('CTC-BLS', 'Cuttack to Balasore', 'Cuttack', 'Balasore', 170, '3.5 hours', 200.00),
('PKR-KNJ', 'Puri to Konark', 'Puri', 'Konark', 35, '45 minutes', 40.00),
('RSL-JSG', 'Rourkela to Jharsuguda', 'Rourkela', 'Jharsuguda', 60, '1.5 hours', 80.00),
('BB-ANG', 'Bhubaneswar to Angul', 'Bhubaneswar', 'Angul', 140, '3 hours', 150.00),
('BB-JJP', 'Bhubaneswar to Jajpur', 'Bhubaneswar', 'Jajpur', 90, '2 hours', 100.00)
ON CONFLICT (route_code) DO NOTHING;

-- Get route IDs for further use (these will be actual UUIDs from your database)
-- In a real setup, you'd query these IDs and use them in subsequent inserts

-- Sample buses with different configurations
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
  is_active
) VALUES 
(
  'OD02AX1234',
  'Nandighosh Express',
  'ac',
  40,
  40,
  '{"rows": 10, "columns": 4, "layout": "2+2"}',
  '["AC", "WiFi", "Charging Points", "Water Bottle", "Reading Lights"]',
  'OD02AX1234',
  2022,
  true
),
(
  'OD02BX5678',
  'Nandighosh Luxury',
  'luxury',
  35,
  35,
  '{"rows": 9, "columns": 4, "layout": "2+2"}',
  '["AC", "WiFi", "Charging Points", "Blankets", "Snacks", "Entertainment", "Reclining Seats"]',
  'OD02BX5678',
  2023,
  true
),
(
  'OD02CX9012',
  'Nandighosh Sleeper',
  'sleeper',
  32,
  32,
  '{"rows": 8, "columns": 4, "layout": "2+1", "type": "sleeper"}',
  '["AC", "Blankets", "Charging Points", "Privacy Curtains"]',
  'OD02CX9012',
  2021,
  true
),
(
  'OD02DX3456',
  'Nandighosh Economy',
  'non_ac',
  45,
  45,
  '{"rows": 12, "columns": 4, "layout": "2+2"}',
  '["Charging Points", "Water Bottle"]',
  'OD02DX3456',
  2020,
  true
),
(
  'OD02EX7890',
  'Nandighosh Semi-Sleeper',
  'semi_sleeper',
  38,
  38,
  '{"rows": 10, "columns": 4, "layout": "2+2"}',
  '["AC", "Reclining Seats", "Charging Points", "Water Bottle", "Reading Lights"]',
  'OD02EX7890',
  2022,
  true
)
ON CONFLICT (bus_number) DO NOTHING;

-- Sample route stops for Bhubaneswar to Cuttack (most popular route)
-- Note: In production, you'll need to replace these with actual route IDs from your database
WITH bb_ctc_route AS (
  SELECT id FROM routes WHERE route_code = 'BB-CTC' LIMIT 1
)
INSERT INTO route_stops (route_id, stop_name, stop_code, city, stop_order, departure_time, arrival_time, fare_from_origin) 
SELECT 
  r.id,
  stop_data.name,
  stop_data.code,
  stop_data.city,
  stop_data.order_num,
  stop_data.dep_time::TIME,
  stop_data.arr_time::TIME,
  stop_data.fare
FROM bb_ctc_route r,
(VALUES 
  ('Master Canteen Square', 'MCS01', 'Bhubaneswar', 1, '06:00:00', '06:00:00', 0.00),
  ('Jaydev Vihar', 'JV01', 'Bhubaneswar', 2, '06:15:00', '06:15:00', 10.00),
  ('Chandrasekharpur', 'CSP01', 'Bhubaneswar', 3, '06:25:00', '06:25:00', 15.00),
  ('Patia', 'PAT01', 'Bhubaneswar', 4, '06:35:00', '06:35:00', 20.00),
  ('Cuttack Railway Station', 'CTC01', 'Cuttack', 5, '07:00:00', '07:00:00', 50.00),
  ('Badambadi', 'BAD01', 'Cuttack', 6, '07:15:00', '07:15:00', 50.00)
) AS stop_data(name, code, city, order_num, dep_time, arr_time, fare)
ON CONFLICT DO NOTHING;

-- Sample route stops for Bhubaneswar to Puri (tourist route)
WITH bb_pkr_route AS (
  SELECT id FROM routes WHERE route_code = 'BB-PKR' LIMIT 1
)
INSERT INTO route_stops (route_id, stop_name, stop_code, city, stop_order, departure_time, arrival_time, fare_from_origin) 
SELECT 
  r.id,
  stop_data.name,
  stop_data.code,
  stop_data.city,
  stop_data.order_num,
  stop_data.dep_time::TIME,
  stop_data.arr_time::TIME,
  stop_data.fare
FROM bb_pkr_route r,
(VALUES 
  ('Bhubaneswar ISBT', 'BB_ISBT', 'Bhubaneswar', 1, '05:30:00', '05:30:00', 0.00),
  ('Khordha', 'KHD01', 'Khordha', 2, '06:00:00', '06:00:00', 20.00),
  ('Delang', 'DLG01', 'Delang', 3, '06:30:00', '06:30:00', 40.00),
  ('Pipili', 'PIP01', 'Pipili', 4, '06:45:00', '06:45:00', 60.00),
  ('Puri Bus Stand', 'PKR01', 'Puri', 5, '07:30:00', '07:30:00', 80.00),
  ('Puri Railway Station', 'PKR02', 'Puri', 6, '07:45:00', '07:45:00', 80.00)
) AS stop_data(name, code, city, order_num, dep_time, arr_time, fare)
ON CONFLICT DO NOTHING;

-- Sample bus schedules for next 30 days (optimized for performance testing)
WITH route_bus_combinations AS (
  SELECT 
    r.id as route_id,
    b.id as bus_id,
    r.base_fare,
    b.total_seats,
    CASE 
      WHEN r.route_code = 'BB-CTC' THEN ARRAY['06:00:00', '08:00:00', '10:00:00', '14:00:00', '16:00:00', '18:00:00']
      WHEN r.route_code = 'BB-PKR' THEN ARRAY['05:30:00', '07:30:00', '09:30:00', '13:30:00', '15:30:00']
      WHEN r.route_code = 'CTC-RSL' THEN ARRAY['06:00:00', '14:00:00', '20:00:00']
      WHEN r.route_code = 'BB-BRP' THEN ARRAY['06:30:00', '13:30:00', '19:30:00']
      ELSE ARRAY['08:00:00', '15:00:00']
    END as departure_times
  FROM routes r
  CROSS JOIN buses b
  WHERE r.is_active = true AND b.is_active = true
),
date_series AS (
  SELECT generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    INTERVAL '1 day'
  )::DATE as schedule_date
),
schedule_combinations AS (
  SELECT 
    rbc.route_id,
    rbc.bus_id,
    ds.schedule_date,
    departure_time::TIME,
    (departure_time::TIME + INTERVAL '1 hour' * 
      CASE 
        WHEN rbc.route_id IN (SELECT id FROM routes WHERE route_code = 'BB-CTC') THEN 1
        WHEN rbc.route_id IN (SELECT id FROM routes WHERE route_code = 'BB-PKR') THEN 2
        WHEN rbc.route_id IN (SELECT id FROM routes WHERE route_code = 'CTC-RSL') THEN 7
        WHEN rbc.route_id IN (SELECT id FROM routes WHERE route_code = 'BB-BRP') THEN 4
        ELSE 3
      END
    )::TIME as arrival_time,
    rbc.base_fare * 
      CASE 
        WHEN EXTRACT(DOW FROM ds.schedule_date) IN (6, 0) THEN 1.2  -- Weekend premium
        ELSE 1.0
      END as fare,
    rbc.total_seats,
    -- Simulate some pre-existing bookings
    GREATEST(0, rbc.total_seats - (random() * 15)::INTEGER) as available_seats
  FROM route_bus_combinations rbc
  CROSS JOIN date_series ds
  CROSS JOIN UNNEST(rbc.departure_times) as departure_time
  WHERE EXTRACT(DOW FROM ds.schedule_date) = ANY(
    CASE 
      WHEN rbc.route_id IN (SELECT id FROM routes WHERE route_code IN ('BB-CTC', 'BB-PKR')) 
      THEN ARRAY[1,2,3,4,5,6,7]  -- Daily for popular routes
      ELSE ARRAY[1,2,3,4,5,7]    -- Skip Saturday for other routes
    END
  )
)
INSERT INTO bus_schedules (
  bus_id, 
  route_id, 
  departure_date, 
  departure_time, 
  arrival_date,
  arrival_time,
  base_fare, 
  available_seats,
  is_active
)
SELECT 
  sc.bus_id,
  sc.route_id,
  sc.schedule_date,
  sc.departure_time,
  sc.schedule_date + 
    CASE 
      WHEN sc.arrival_time < sc.departure_time THEN INTERVAL '1 day'
      ELSE INTERVAL '0 days'
    END,
  sc.arrival_time,
  sc.fare,
  sc.available_seats,
  true
FROM schedule_combinations sc
ON CONFLICT (bus_id, departure_date, departure_time) DO NOTHING;

-- Sample user profiles (for testing - remove in production)
-- Note: These require actual auth.users entries to be created first via Supabase Auth

-- Sample agents (for testing - requires user_profiles to exist first)
/*
INSERT INTO agents (
  user_id, 
  business_name, 
  business_type, 
  contact_person,
  business_address,
  license_number,
  commission_rate,
  is_active,
  verification_status
) VALUES 
-- You'll need to replace these UUIDs with actual user IDs from your database
-- These are just examples of the structure
*/

-- Performance testing data generation
-- This creates additional sample bookings for performance testing
-- Uncomment only for development/testing environments

/*
WITH sample_bookings AS (
  SELECT 
    bs.id as schedule_id,
    -- Generate sample user IDs (replace with actual ones)
    gen_random_uuid() as user_id,
    bs.departure_date as journey_date,
    ARRAY[1, 2] as seat_numbers,  -- Sample seats
    2 as total_passengers,
    bs.base_fare * 2 as total_amount,
    0 as discount_amount,
    bs.base_fare * 2 * 0.05 as tax_amount,
    bs.base_fare * 2 * 1.05 as net_amount,
    CASE 
      WHEN random() < 0.1 THEN 'cancelled'
      WHEN random() < 0.15 THEN 'pending'
      ELSE 'confirmed'
    END as status,
    '+91' || (6000000000 + (random() * 999999999)::BIGINT)::TEXT as contact_phone
  FROM bus_schedules bs 
  WHERE bs.departure_date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE - INTERVAL '1 day'
  AND random() < 0.3  -- 30% of schedules have bookings
  LIMIT 1000  -- Limit for initial testing
)
INSERT INTO bookings (
  user_id, schedule_id, journey_date, seat_numbers, total_passengers,
  total_amount, discount_amount, tax_amount, net_amount, status, contact_phone
)
SELECT * FROM sample_bookings;
*/

-- Analytics view for sample data verification
CREATE OR REPLACE VIEW sample_data_summary AS
SELECT 
  'routes' as entity,
  COUNT(*) as count,
  'Sample routes covering major Odisha destinations' as description
FROM routes
WHERE route_code IN ('BB-CTC', 'BB-PKR', 'CTC-RSL', 'BB-BRP', 'BB-SMB')
UNION ALL
SELECT 
  'buses' as entity,
  COUNT(*) as count,
  'Fleet with different bus types (AC, Luxury, Sleeper, Economy)' as description
FROM buses
WHERE bus_number LIKE 'OD02%'
UNION ALL
SELECT 
  'bus_schedules' as entity,
  COUNT(*) as count,
  'Schedules for next 30 days across all routes' as description
FROM bus_schedules
WHERE departure_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
UNION ALL
SELECT 
  'route_stops' as entity,
  COUNT(*) as count,
  'Stops for major routes (BB-CTC, BB-PKR)' as description
FROM route_stops
WHERE route_id IN (
  SELECT id FROM routes WHERE route_code IN ('BB-CTC', 'BB-PKR')
);

-- Performance indexes verification
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('bookings', 'bus_schedules', 'routes', 'user_profiles')
ORDER BY tablename, indexname;

-- Comments
COMMENT ON VIEW sample_data_summary IS 'Summary of sample data loaded for development and testing';

-- Final note: This sample data is designed for:
-- 1. Performance testing with realistic data volumes
-- 2. Feature testing with diverse route/bus combinations  
-- 3. Load testing with concurrent booking scenarios
-- 4. Analytics testing with varied booking patterns

-- Remember to:
-- 1. Replace sample UUIDs with actual ones from your database
-- 2. Remove sensitive sample data before production
-- 3. Run ANALYZE after loading data for optimal query plans
-- 4. Monitor performance with the created views and functions

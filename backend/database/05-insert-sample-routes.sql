-- Insert sample routes for testing admin dashboard
-- Run this in Supabase SQL Editor if routes table is empty

INSERT INTO routes (route_code, name, source_city, destination_city, distance_km, estimated_duration, base_fare, is_active) VALUES
('BB-CTC', 'Bhubaneswar to Cuttack', 'Bhubaneswar', 'Cuttack', 30, '1 hour', 50.00, true),
('BB-PR', 'Bhubaneswar to Puri', 'Bhubaneswar', 'Puri', 60, '1.5 hours', 80.00, true),
('CTC-RSL', 'Cuttack to Rourkela', 'Cuttack', 'Rourkela', 340, '7 hours', 450.00, true),
('BB-BRP', 'Bhubaneswar to Berhampur', 'Bhubaneswar', 'Berhampur', 180, '4 hours', 250.00, true),
('BB-SMB', 'Bhubaneswar to Sambalpur', 'Bhubaneswar', 'Sambalpur', 260, '5.5 hours', 350.00, true)
ON CONFLICT (route_code) DO NOTHING;

-- Verify the data was inserted
SELECT id, name, source_city, destination_city, distance_km, estimated_duration, is_active 
FROM routes 
ORDER BY created_at DESC;

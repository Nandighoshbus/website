-- Sample Data for Nandighosh Bus Service
-- Run this after the main schema.sql to populate with sample data

-- Insert sample routes (extending the ones already in schema.sql)
INSERT INTO routes (route_code, name, source_city, destination_city, distance_km, estimated_duration) VALUES
('BB-SMB', 'Bhubaneswar to Sambalpur', 'Bhubaneswar', 'Sambalpur', 260, '5.5 hours'),
('CTC-BLS', 'Cuttack to Balasore', 'Cuttack', 'Balasore', 170, '3.5 hours'),
('PKR-KNJ', 'Puri to Konark', 'Puri', 'Konark', 35, '45 minutes'),
('RSL-JSG', 'Rourkela to Jharsuguda', 'Rourkela', 'Jharsuguda', 60, '1.5 hours'),
('BB-ANG', 'Bhubaneswar to Angul', 'Bhubaneswar', 'Angul', 140, '3 hours')
ON CONFLICT (route_code) DO NOTHING;

-- Get route IDs for further insertions
-- (These would need to be run after getting the actual UUIDs from the database)

-- Sample route stops for Bhubaneswar to Cuttack route
-- You'll need to replace the UUIDs with actual route IDs from your database
-- Example structure:
/*
INSERT INTO route_stops (route_id, stop_name, stop_code, city, stop_order, departure_time, arrival_time) VALUES
('<bb-ctc-route-id>', 'Master Canteen Square', 'MCS01', 'Bhubaneswar', 1, '06:00:00', '06:00:00'),
('<bb-ctc-route-id>', 'Jaydev Vihar', 'JV01', 'Bhubaneswar', 2, '06:15:00', '06:15:00'),
('<bb-ctc-route-id>', 'Chandrasekharpur', 'CSP01', 'Bhubaneswar', 3, '06:25:00', '06:25:00'),
('<bb-ctc-route-id>', 'Patia', 'PAT01', 'Bhubaneswar', 4, '06:35:00', '06:35:00'),
('<bb-ctc-route-id>', 'Cuttack Railway Station', 'CTC01', 'Cuttack', 5, '07:00:00', '07:00:00'),
('<bb-ctc-route-id>', 'Badambadi', 'BAD01', 'Cuttack', 6, '07:15:00', '07:15:00');
*/

-- Sample buses
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
  '{
    "rows": 10,
    "columns": 4,
    "layout_type": "standard",
    "seats": []
  }',
  '["wifi", "charging_point", "blanket", "water", "gps_tracking"]',
  'OD02AX1234',
  2022,
  true
),
(
  'OD02BY5678',
  'Nandighosh Luxury',
  'luxury',
  32,
  32,
  '{
    "rows": 8,
    "columns": 4,
    "layout_type": "standard",
    "seats": []
  }',
  '["wifi", "charging_point", "blanket", "water", "ac", "reclining_seats", "entertainment"]',
  'OD02BY5678',
  2023,
  true
),
(
  'OD03CZ9012',
  'Nandighosh Sleeper',
  'sleeper',
  28,
  28,
  '{
    "rows": 14,
    "columns": 2,
    "layout_type": "sleeper",
    "seats": []
  }',
  '["charging_point", "blanket", "privacy_curtain", "reading_light"]',
  'OD03CZ9012',
  2021,
  true
),
(
  'OD04DW3456',
  'Nandighosh Semi-Sleeper',
  'semi_sleeper',
  36,
  36,
  '{
    "rows": 9,
    "columns": 4,
    "layout_type": "semi_sleeper",
    "seats": []
  }',
  '["charging_point", "blanket", "water", "adjustable_seats"]',
  'OD04DW3456',
  2022,
  true
),
(
  'OD05EX7890',
  'Nandighosh Economy',
  'non_ac',
  44,
  44,
  '{
    "rows": 11,
    "columns": 4,
    "layout_type": "standard",
    "seats": []
  }',
  '["charging_point"]',
  'OD05EX7890',
  2020,
  true
);

-- Sample bus schedules
-- Note: You'll need to replace route_id and bus_id with actual UUIDs from your database
/*
INSERT INTO bus_schedules (
  route_id,
  bus_id,
  schedule_code,
  departure_time,
  arrival_time,
  departure_date,
  arrival_date,
  base_price,
  available_seats,
  days_of_operation,
  is_active
) VALUES 
(
  '<bb-ctc-route-id>',
  '<bus-id-1>',
  'BB-CTC-0600-01',
  '06:00:00',
  '07:30:00',
  CURRENT_DATE,
  CURRENT_DATE,
  150.00,
  40,
  '{1,2,3,4,5,6,7}',
  true
),
(
  '<bb-pkr-route-id>',
  '<bus-id-2>',
  'BB-PKR-0800-01',
  '08:00:00',
  '09:30:00',
  CURRENT_DATE,
  CURRENT_DATE,
  200.00,
  32,
  '{1,2,3,4,5,6,7}',
  true
);
*/

-- Sample admin user (you'll need to create this through the API after starting the server)
-- This is just for reference - passwords should be hashed through the API
/*
Example API call to create admin user:
POST /api/v1/auth/register
{
  "email": "admin@nandighosh.com",
  "password": "Admin@123456",
  "full_name": "Nandighosh Admin",
  "phone": "9876543210",
  "role": "admin"
}
*/

-- Sample data for testing (run after main schema)
-- You can create test users through the API and then run booking scenarios

-- Add some sample cities for search functionality
-- This could be derived from existing routes
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  state VARCHAR(50) DEFAULT 'Odisha',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cities (name) VALUES 
('Bhubaneswar'),
('Cuttack'),
('Puri'),
('Berhampur'),
('Rourkela'),
('Sambalpur'),
('Balasore'),
('Konark'),
('Jharsuguda'),
('Angul'),
('Baripada'),
('Dhenkanal'),
('Jajpur'),
('Kendrapara'),
('Mayurbhanj')
ON CONFLICT DO NOTHING;

-- Sample pricing and dynamic pricing rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id),
  bus_type bus_type,
  base_price_per_km DECIMAL(5,2) DEFAULT 3.50,
  surge_multiplier DECIMAL(3,2) DEFAULT 1.00,
  weekend_surcharge DECIMAL(3,2) DEFAULT 0.10,
  holiday_surcharge DECIMAL(3,2) DEFAULT 0.20,
  early_bird_discount DECIMAL(3,2) DEFAULT 0.05,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample cancellation policies
CREATE TABLE IF NOT EXISTS cancellation_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  free_cancellation_hours INTEGER DEFAULT 24,
  cancellation_charges JSONB DEFAULT '[]',
  refund_processing_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cancellation_policies (name, free_cancellation_hours, cancellation_charges) VALUES
('Standard Policy', 24, '[
  {"hours_before_departure": 24, "charge_percentage": 0},
  {"hours_before_departure": 12, "charge_percentage": 25},
  {"hours_before_departure": 6, "charge_percentage": 50},
  {"hours_before_departure": 2, "charge_percentage": 75},
  {"hours_before_departure": 0, "charge_percentage": 100}
]'),
('Flexible Policy', 48, '[
  {"hours_before_departure": 48, "charge_percentage": 0},
  {"hours_before_departure": 24, "charge_percentage": 10},
  {"hours_before_departure": 12, "charge_percentage": 25},
  {"hours_before_departure": 6, "charge_percentage": 50},
  {"hours_before_departure": 0, "charge_percentage": 90}
]'),
('Non-Refundable', 0, '[
  {"hours_before_departure": 0, "charge_percentage": 100}
]');

-- Sample feedback and ratings table
CREATE TABLE IF NOT EXISTS booking_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  comfort_rating INTEGER CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample notifications table for push notifications, SMS, etc.
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  booking_id UUID REFERENCES bookings(id),
  type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_route ON pricing_rules(route_id);
CREATE INDEX IF NOT EXISTS idx_booking_feedback_booking ON booking_feedback(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_feedback_rating ON booking_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type_status ON notifications(type, status);

-- Sample offers and discounts table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  discount_value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  user_limit INTEGER DEFAULT 1, -- per user limit
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  applicable_routes JSONB DEFAULT '[]', -- array of route IDs
  applicable_bus_types JSONB DEFAULT '[]', -- array of bus types
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample offers
INSERT INTO offers (code, title, description, discount_type, discount_value, min_amount, max_discount, usage_limit, valid_until) VALUES
('WELCOME50', 'Welcome Bonus', 'Get ₹50 off on your first booking', 'fixed', 50.00, 200.00, 50.00, 1000, NOW() + INTERVAL '30 days'),
('SAVE20', 'Save 20%', 'Get 20% off on all bookings', 'percentage', 20.00, 300.00, 200.00, 500, NOW() + INTERVAL '15 days'),
('WEEKEND15', 'Weekend Special', 'Get 15% off on weekend bookings', 'percentage', 15.00, 250.00, 150.00, null, NOW() + INTERVAL '60 days');

-- Comment for reference
COMMENT ON TABLE cities IS 'List of cities for route search and autocomplete';
COMMENT ON TABLE pricing_rules IS 'Dynamic pricing rules for different routes and bus types';
COMMENT ON TABLE cancellation_policies IS 'Cancellation policies with different refund rules';
COMMENT ON TABLE booking_feedback IS 'User feedback and ratings for completed bookings';
COMMENT ON TABLE notifications IS 'System notifications for users (email, SMS, push)';
COMMENT ON TABLE offers IS 'Promotional offers and discount codes';

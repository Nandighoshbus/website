-- Nandighosh Bus Service Database Schema for Supabase
-- This script should be run in your Supabase SQL Editor

-- Enable Row Level Security
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS booking_passengers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bus_schedules CASCADE;
DROP TABLE IF EXISTS route_stops CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'agent', 'admin', 'super_admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('razorpay', 'upi', 'card', 'netbanking', 'wallet');
CREATE TYPE bus_type AS ENUM ('ac', 'non_ac', 'sleeper', 'semi_sleeper', 'luxury');
CREATE TYPE seat_type AS ENUM ('window', 'aisle', 'middle');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender gender,
    role user_role DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    address JSONB,
    emergency_contact JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents table (for bus service agents/partners)
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    agent_code VARCHAR(20) UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    business_name VARCHAR(200),
    business_address JSONB,
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    documents JSONB DEFAULT '[]',
    bank_details JSONB,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes table
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    source_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    distance_km INTEGER NOT NULL,
    estimated_duration INTERVAL NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    route_map JSONB, -- GeoJSON data for route mapping
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Route stops table
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    stop_code VARCHAR(20),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) DEFAULT 'Odisha',
    location POINT, -- PostGIS point for exact location
    stop_order INTEGER NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    stop_duration INTERVAL DEFAULT '00:10:00',
    is_pickup BOOLEAN DEFAULT TRUE,
    is_drop BOOLEAN DEFAULT TRUE,
    landmark TEXT,
    contact_phone VARCHAR(15),
    facilities JSONB DEFAULT '[]', -- ['parking', 'restroom', 'food']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buses table
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    bus_name VARCHAR(100),
    bus_type bus_type NOT NULL,
    operator_name VARCHAR(200) NOT NULL DEFAULT 'Nandighosh Travels',
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    seat_layout JSONB NOT NULL, -- Detailed seat configuration
    amenities JSONB DEFAULT '[]', -- ['wifi', 'charging_point', 'blanket', 'water']
    registration_number VARCHAR(20) UNIQUE,
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    manufacturing_year INTEGER,
    permit_details JSONB,
    insurance_details JSONB,
    fitness_certificate JSONB,
    driver_details JSONB,
    conductor_details JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    maintenance_status VARCHAR(50) DEFAULT 'good',
    last_service_date DATE,
    next_service_date DATE,
    fuel_type VARCHAR(20) DEFAULT 'diesel',
    mileage DECIMAL(5,2),
    images JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bus schedules table
CREATE TABLE bus_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    schedule_code VARCHAR(30) UNIQUE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    departure_date DATE NOT NULL,
    arrival_date DATE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    dynamic_pricing JSONB DEFAULT '{}', -- Price variations based on demand, time, etc.
    available_seats INTEGER NOT NULL,
    booked_seats JSONB DEFAULT '[]', -- Array of booked seat numbers
    blocked_seats JSONB DEFAULT '[]', -- Temporarily blocked seats
    days_of_operation INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- Days of week (1=Monday)
    is_active BOOLEAN DEFAULT TRUE,
    special_notes TEXT,
    cancellation_policy JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_bus_schedule UNIQUE (bus_id, departure_date, departure_time)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    schedule_id UUID NOT NULL REFERENCES bus_schedules(id),
    agent_id UUID REFERENCES agents(id), -- If booked through agent
    
    -- Trip details
    journey_date DATE NOT NULL,
    boarding_point UUID REFERENCES route_stops(id),
    dropping_point UUID REFERENCES route_stops(id),
    
    -- Booking details
    total_passengers INTEGER NOT NULL DEFAULT 1,
    seat_numbers INTEGER[] NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    
    -- Status and timestamps
    status booking_status DEFAULT 'pending',
    booking_source VARCHAR(50) DEFAULT 'website', -- website, mobile, agent, phone
    
    -- Contact details
    contact_phone VARCHAR(15) NOT NULL,
    contact_email VARCHAR(255),
    emergency_contact JSONB,
    
    -- Additional info
    special_requests TEXT,
    cancellation_reason TEXT,
    cancellation_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking passengers table
CREATE TABLE booking_passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_age INTEGER,
    passenger_gender gender,
    id_proof_type VARCHAR(50), -- aadhar, pan, passport, license
    id_proof_number VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE, -- Primary passenger (booker)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_method payment_method NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status payment_status DEFAULT 'pending',
    
    -- Gateway details
    gateway_transaction_id VARCHAR(200),
    gateway_response JSONB,
    gateway_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Refund details
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_reference VARCHAR(100),
    refund_date TIMESTAMPTZ,
    refund_reason TEXT,
    
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES user_profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_agents_code ON agents(agent_code);
CREATE INDEX idx_routes_source_dest ON routes(source_city, destination_city);
CREATE INDEX idx_route_stops_route ON route_stops(route_id);
CREATE INDEX idx_bus_schedules_route ON bus_schedules(route_id);
CREATE INDEX idx_bus_schedules_date ON bus_schedules(departure_date);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_journey_date ON bookings(journey_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_booking_passengers_booking ON booking_passengers(booking_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Row Level Security Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agents can view their bookings" ON bookings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM agents 
        WHERE user_id = auth.uid() AND id = bookings.agent_id
    )
);

-- Public read access for routes and schedules
CREATE POLICY "Anyone can view routes" ON routes FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view route stops" ON route_stops FOR SELECT USING (true);
CREATE POLICY "Anyone can view bus schedules" ON bus_schedules FOR SELECT USING (is_active = true);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_stops_updated_at BEFORE UPDATE ON route_stops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bus_schedules_updated_at BEFORE UPDATE ON bus_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_reference = 'NBS' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('booking_ref_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for booking reference
CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1;

-- Create trigger for booking reference generation
CREATE TRIGGER generate_booking_ref_trigger 
    BEFORE INSERT ON bookings 
    FOR EACH ROW 
    WHEN (NEW.booking_reference IS NULL)
    EXECUTE FUNCTION generate_booking_reference();

-- Function to generate agent code
CREATE OR REPLACE FUNCTION generate_agent_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.agent_code = 'AGT' || LPAD(NEXTVAL('agent_code_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for agent code
CREATE SEQUENCE IF NOT EXISTS agent_code_seq START 1;

-- Create trigger for agent code generation
CREATE TRIGGER generate_agent_code_trigger 
    BEFORE INSERT ON agents 
    FOR EACH ROW 
    WHEN (NEW.agent_code IS NULL)
    EXECUTE FUNCTION generate_agent_code();

-- Insert sample data (you can remove this in production)
-- Sample routes
INSERT INTO routes (route_code, name, source_city, destination_city, distance_km, estimated_duration) VALUES
('BB-CTC', 'Bhubaneswar to Cuttack', 'Bhubaneswar', 'Cuttack', 30, '1 hour'),
('BB-PKR', 'Bhubaneswar to Puri', 'Bhubaneswar', 'Puri', 60, '1.5 hours'),
('CTC-RSL', 'Cuttack to Rourkela', 'Cuttack', 'Rourkela', 340, '7 hours'),
('BB-BRP', 'Bhubaneswar to Berhampur', 'Bhubaneswar', 'Berhampur', 180, '4 hours');

COMMENT ON TABLE user_profiles IS 'Extended user profiles linked to Supabase auth.users';
COMMENT ON TABLE agents IS 'Bus service agents and partners';
COMMENT ON TABLE routes IS 'Bus routes between cities';
COMMENT ON TABLE route_stops IS 'Stops along each route';
COMMENT ON TABLE buses IS 'Fleet of buses';
COMMENT ON TABLE bus_schedules IS 'Scheduled trips for buses';
COMMENT ON TABLE bookings IS 'Passenger bookings';
COMMENT ON TABLE booking_passengers IS 'Individual passengers in each booking';
COMMENT ON TABLE payments IS 'Payment transactions';
COMMENT ON TABLE audit_logs IS 'Audit trail for all data changes';

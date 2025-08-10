-- Nandighosh Bus Service - Optimized Database Schema for Scalability
-- This is the main schema file to run in Supabase SQL Editor
-- Run this file FIRST before any other SQL files

-- Enable necessary extensions for performance and features
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Drop existing tables if they exist (for development only)
-- COMMENTED OUT FOR PRODUCTION - Uncomment only if you want to reset everything
-- DROP TABLE IF EXISTS booking_passengers CASCADE;
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS bus_schedules CASCADE;
-- DROP TABLE IF EXISTS route_stops CASCADE;
-- DROP TABLE IF EXISTS routes CASCADE;
-- DROP TABLE IF EXISTS buses CASCADE;
-- DROP TABLE IF EXISTS agents CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;

-- Custom types for better performance and data integrity
CREATE TYPE user_role AS ENUM ('customer', 'agent', 'admin', 'super_admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('razorpay', 'upi', 'card', 'netbanking', 'wallet');
CREATE TYPE bus_type AS ENUM ('ac', 'non_ac', 'sleeper', 'semi_sleeper', 'luxury');
CREATE TYPE seat_type AS ENUM ('window', 'aisle', 'middle');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');

-- 1. User Profiles Table (Optimized for scalability)
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

-- Performance indexes for user_profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email) WHERE is_active = true;
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone) WHERE is_active = true;
CREATE INDEX idx_user_profiles_role ON user_profiles(role) WHERE is_active = true;
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active, role);

-- 2. Agents Table (For bus service agents/partners)
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    agent_code VARCHAR(10) UNIQUE NOT NULL,
    business_name VARCHAR(100) NOT NULL,
    business_type VARCHAR(50) DEFAULT 'individual',
    contact_person VARCHAR(100),
    business_address JSONB,
    license_number VARCHAR(50),
    pan_number VARCHAR(10),
    gst_number VARCHAR(15),
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    current_balance DECIMAL(12,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(20) DEFAULT 'pending',
    verification_documents JSONB,
    onboarding_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for agents
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_code ON agents(agent_code) WHERE is_active = true;
CREATE INDEX idx_agents_active ON agents(is_active, verification_status);

-- 3. Routes Table (Optimized for frequent queries)
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    source_city VARCHAR(50) NOT NULL,
    destination_city VARCHAR(50) NOT NULL,
    distance_km INTEGER NOT NULL,
    estimated_duration VARCHAR(20),
    base_fare DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for routes
CREATE INDEX idx_routes_code ON routes(route_code) WHERE is_active = true;
CREATE INDEX idx_routes_cities ON routes(source_city, destination_city) WHERE is_active = true;
CREATE INDEX idx_routes_active ON routes(is_active);

-- 4. Route Stops Table (Optimized for journey queries)
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    stop_code VARCHAR(10) NOT NULL,
    city VARCHAR(50) NOT NULL,
    stop_order INTEGER NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    departure_time TIME,
    arrival_time TIME,
    fare_from_origin DECIMAL(8,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_route_stop_order UNIQUE (route_id, stop_order),
    CONSTRAINT unique_route_stop_code UNIQUE (route_id, stop_code)
);

-- Performance indexes for route_stops
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id, stop_order);
CREATE INDEX idx_route_stops_city ON route_stops(city);
CREATE INDEX idx_route_stops_location ON route_stops USING GIST (point(longitude, latitude));

-- 5. Buses Table (Fleet management)
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    bus_name VARCHAR(50),
    bus_type bus_type NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 40,
    available_seats INTEGER NOT NULL DEFAULT 40,
    seat_layout JSONB NOT NULL DEFAULT '{"rows": 10, "columns": 4}',
    amenities JSONB DEFAULT '[]',
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    manufacturing_year INTEGER,
    insurance_expiry DATE,
    fitness_expiry DATE,
    permit_expiry DATE,
    last_maintenance_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_seat_count CHECK (available_seats <= total_seats),
    CONSTRAINT valid_manufacturing_year CHECK (manufacturing_year >= 1990 AND manufacturing_year <= EXTRACT(YEAR FROM CURRENT_DATE))
);

-- Performance indexes for buses
CREATE INDEX idx_buses_number ON buses(bus_number) WHERE is_active = true;
CREATE INDEX idx_buses_type ON buses(bus_type, is_active);
CREATE INDEX idx_buses_active ON buses(is_active);

-- 6. Bus Schedules Table (Optimized for booking queries)
CREATE TABLE bus_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(id),
    route_id UUID NOT NULL REFERENCES routes(id),
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_date DATE NOT NULL,
    arrival_time TIME NOT NULL,
    base_fare DECIMAL(8,2) NOT NULL,
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

-- Critical performance indexes for bus_schedules (most queried table)
CREATE INDEX idx_bus_schedules_route_date ON bus_schedules(route_id, departure_date) WHERE is_active = true;
CREATE INDEX idx_bus_schedules_bus_date ON bus_schedules(bus_id, departure_date);
CREATE INDEX idx_bus_schedules_departure ON bus_schedules(departure_date, departure_time) WHERE is_active = true;
CREATE INDEX idx_bus_schedules_available ON bus_schedules(available_seats) WHERE is_active = true AND available_seats > 0;
CREATE INDEX idx_bus_schedules_composite ON bus_schedules(route_id, departure_date, available_seats) WHERE is_active = true;

-- 7. Bookings Table (Heavily optimized for performance)
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
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance constraints
    CONSTRAINT valid_passenger_count CHECK (total_passengers > 0 AND total_passengers <= 10),
    CONSTRAINT valid_amounts CHECK (net_amount > 0 AND total_amount >= net_amount)
);

-- Critical performance indexes for bookings (high-frequency queries)
CREATE INDEX idx_bookings_user_id ON bookings(user_id, created_at DESC);
CREATE INDEX idx_bookings_schedule_id ON bookings(schedule_id, status);
CREATE INDEX idx_bookings_journey_date ON bookings(journey_date, status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_status ON bookings(status, journey_date);
CREATE INDEX idx_bookings_agent ON bookings(agent_id, created_at DESC) WHERE agent_id IS NOT NULL;
CREATE INDEX idx_bookings_phone ON bookings(contact_phone);
-- Composite index for dashboard queries
CREATE INDEX idx_bookings_dashboard ON bookings(status, journey_date, created_at DESC);

-- 8. Booking Passengers Table (Individual passenger details)
CREATE TABLE booking_passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_age INTEGER NOT NULL,
    passenger_gender gender NOT NULL,
    id_proof_type VARCHAR(20),
    id_proof_number VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_booking_seat UNIQUE (booking_id, seat_number),
    CONSTRAINT valid_age CHECK (passenger_age >= 1 AND passenger_age <= 120)
);

-- Performance indexes for booking_passengers
CREATE INDEX idx_booking_passengers_booking_id ON booking_passengers(booking_id);

-- 9. Payments Table (Financial transactions)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    payment_id VARCHAR(100) UNIQUE, -- External payment gateway ID
    order_id VARCHAR(100), -- Internal order ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status payment_status DEFAULT 'pending',
    payment_method payment_method,
    gateway_name VARCHAR(50) DEFAULT 'razorpay',
    gateway_response JSONB,
    failure_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_payment_amount CHECK (amount > 0),
    CONSTRAINT valid_refund_amount CHECK (refund_amount >= 0 AND refund_amount <= amount)
);

-- Performance indexes for payments
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX idx_payments_status ON payments(status, created_at DESC);
CREATE INDEX idx_payments_gateway ON payments(gateway_name, status);

-- 10. Audit Logs Table (For compliance and debugging)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES user_profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes for audit_logs (with partitioning strategy)
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security on all tables
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

-- Performance monitoring views
CREATE OR REPLACE VIEW booking_performance_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as booking_date,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
    AVG(net_amount) as avg_booking_value,
    SUM(net_amount) as total_revenue
FROM bookings
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY booking_date DESC;

-- Comment on tables for documentation
COMMENT ON TABLE user_profiles IS 'Extended user profiles linked to Supabase auth.users - Optimized for scalability';
COMMENT ON TABLE agents IS 'Bus service agents and partners with performance indexes';
COMMENT ON TABLE routes IS 'Bus routes between cities - Heavily indexed for search performance';
COMMENT ON TABLE route_stops IS 'Stops along each route with geospatial indexing';
COMMENT ON TABLE buses IS 'Fleet of buses with maintenance tracking';
COMMENT ON TABLE bus_schedules IS 'Scheduled trips - Most critical table for performance';
COMMENT ON TABLE bookings IS 'Passenger bookings - Heavily optimized with composite indexes';
COMMENT ON TABLE booking_passengers IS 'Individual passengers in each booking';
COMMENT ON TABLE payments IS 'Payment transactions with gateway integration';
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and debugging';

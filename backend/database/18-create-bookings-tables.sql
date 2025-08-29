-- Create comprehensive booking system tables for agent ticket booking

-- 1. Routes table already exists in main schema - skip creation
-- Using existing routes table with columns: source_city, destination_city

-- 2. Buses table already exists in main schema - skip creation
-- Using existing buses table

-- 3. Schedules table - Bus schedules for routes (bus_schedules exists, creating simplified schedules)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    operating_days VARCHAR(20) NOT NULL, -- 'daily', 'weekdays', 'weekends', or specific days
    fare DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Passengers table - Passenger information
CREATE TABLE IF NOT EXISTS passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    age INTEGER,
    gender VARCHAR(10),
    id_proof_type VARCHAR(50), -- Aadhar, PAN, Passport, etc.
    id_proof_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings table - Main booking records
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    schedule_id UUID REFERENCES schedules(id) ON DELETE RESTRICT,
    passenger_id UUID REFERENCES passengers(id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    
    -- Journey details
    journey_date DATE NOT NULL,
    seat_numbers TEXT[], -- Array of seat numbers
    total_seats INTEGER NOT NULL,
    
    -- Pricing
    base_fare DECIMAL(10,2) NOT NULL,
    taxes DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    agent_commission DECIMAL(10,2) DEFAULT 0,
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    -- Booking status
    booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    
    -- Metadata
    booking_source VARCHAR(50) DEFAULT 'agent', -- agent, online, counter
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Agent earnings table - Track agent commissions
CREATE TABLE IF NOT EXISTS agent_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    earning_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_routes_source_destination ON routes(source_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_schedules_route_id ON schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_schedules_departure_time ON schedules(departure_time);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_journey_date ON bookings(journey_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_passengers_phone ON passengers(phone);
CREATE INDEX IF NOT EXISTS idx_agent_earnings_agent_id ON agent_earnings(agent_id);

-- Enable RLS on all tables
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access to routes, buses, schedules
CREATE POLICY "Allow public read routes" ON routes FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read buses" ON buses FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read schedules" ON schedules FOR SELECT USING (is_active = true);

-- RLS Policies for bookings - agents can only see their own bookings
CREATE POLICY "Agents can view own bookings" ON bookings 
    FOR SELECT USING (agent_id IN (
        SELECT id FROM agents WHERE user_id = auth.uid()
    ));

CREATE POLICY "Agents can create bookings" ON bookings 
    FOR INSERT WITH CHECK (agent_id IN (
        SELECT id FROM agents WHERE user_id = auth.uid()
    ));

-- RLS Policies for passengers - agents can manage passengers
CREATE POLICY "Agents can manage passengers" ON passengers 
    FOR ALL USING (true);

-- RLS Policies for agent earnings
CREATE POLICY "Agents can view own earnings" ON agent_earnings 
    FOR SELECT USING (agent_id IN (
        SELECT id FROM agents WHERE user_id = auth.uid()
    ));

-- Grant permissions
GRANT SELECT ON routes, buses, schedules TO anon, authenticated;
GRANT ALL ON passengers, bookings, agent_earnings TO authenticated;
GRANT ALL ON routes, buses, schedules, passengers, bookings, agent_earnings TO service_role;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

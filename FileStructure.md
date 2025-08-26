-- Local MySQL Database Setup for Nandighosh Bus Service
-- Run this script after installing MySQL locally

-- (Database selection is managed by your hosting control panel. Do not include CREATE DATABASE or USE statements.)
-- The following tables will be created in the selected database.

-- Users table (hybrid Supabase + MySQL)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    supabase_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255),
    password_hash VARCHAR(255), -- Optional for hybrid auth
    role ENUM('customer', 'agent', 'admin') DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_supabase_id (supabase_id),
    INDEX idx_role (role)
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_city (city)
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
    id VARCHAR(50) PRIMARY KEY,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    bus_type ENUM('AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper', 'Luxury') NOT NULL,
    capacity INT NOT NULL,
    amenities JSON,
    status ENUM('active', 'maintenance', 'retired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bus_number (bus_number),
    INDEX idx_status (status),
    INDEX idx_bus_type (bus_type)
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(50) PRIMARY KEY,
    route_name VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance DECIMAL(8,2),
    duration TIME,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_source_dest (source, destination),
    INDEX idx_status (status),
    INDEX idx_route_name (route_name)
);

-- Route stops table
CREATE TABLE IF NOT EXISTS route_stops (
    id VARCHAR(50) PRIMARY KEY,
    route_id VARCHAR(50) NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_id (route_id),
    INDEX idx_stop_order (route_id, stop_order)
);

-- Bus schedules table
CREATE TABLE IF NOT EXISTS bus_schedules (
    id VARCHAR(50) PRIMARY KEY,
    bus_id VARCHAR(50) NOT NULL,
    route_id VARCHAR(50) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    available_seats INT NOT NULL,
    status ENUM('scheduled', 'running', 'completed', 'cancelled') DEFAULT 'scheduled',
    schedule_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_route_date (route_id, schedule_date),
    INDEX idx_status (status)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    schedule_id VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    total_passengers INT NOT NULL,
    total_fare DECIMAL(10,2) NOT NULL,
    booking_status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES bus_schedules(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_booking_status (booking_status)
);

-- Booking passengers table
CREATE TABLE IF NOT EXISTS booking_passengers (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_age INT NOT NULL,
    passenger_gender ENUM('male', 'female', 'other') NOT NULL,
    seat_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('card', 'upi', 'netbanking', 'wallet', 'cash') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role ENUM('agent', 'supervisor', 'manager') DEFAULT 'agent',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- Insert sample data for testing
INSERT INTO users (id, email, phone, password_hash, role, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@nandighosh.com', '+91-9876543210', '$2b$10$example_hash', 'admin', TRUE),
('550e8400-e29b-41d4-a716-446655440001', 'customer@example.com', '+91-9876543211', '$2b$10$example_hash', 'customer', TRUE);

INSERT INTO buses (id, bus_number, bus_type, capacity, amenities, status) VALUES
('bus-550e8400-e29b-41d4-a716-446655440000', 'OD-01-1234', 'AC', 40, '["WiFi", "Charging Port", "Entertainment"]', 'active'),
('bus-550e8400-e29b-41d4-a716-446655440001', 'OD-01-1235', 'Non-AC', 45, '["Charging Port"]', 'active');

INSERT INTO routes (id, route_name, source, destination, distance, duration, status) VALUES
('route-550e8400-e29b-41d4-a716-446655440000', 'Bhubaneswar to Cuttack Express', 'Bhubaneswar', 'Cuttack', 30.5, '01:30:00', 'active'),
('route-550e8400-e29b-41d4-a716-446655440001', 'Bhubaneswar to Puri Express', 'Bhubaneswar', 'Puri', 65.0, '02:00:00', 'active');

INSERT INTO bus_schedules (id, bus_id, route_id, departure_time, arrival_time, fare, available_seats, schedule_date) VALUES
('schedule-550e8400-e29b-41d4-a716-446655440000', 'bus-550e8400-e29b-41d4-a716-446655440000', 'route-550e8400-e29b-41d4-a716-446655440000', '08:00:00', '09:30:00', 150.00, 40, CURDATE()),
('schedule-550e8400-e29b-41d4-a716-446655440001', 'bus-550e8400-e29b-41d4-a716-446655440001', 'route-550e8400-e29b-41d4-a716-446655440001', '10:00:00', '12:00:00', 200.00, 45, CURDATE());

-- Create indexes for better performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_schedules_departure ON bus_schedules(departure_time);

SHOW TABLES;
SELECT 'Database setup completed successfully!' as status;

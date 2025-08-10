-- Nandighosh Bus Service - Database Functions & Triggers for Scalability
-- Run this file THIRD after schema and policies
-- These functions optimize performance and maintain data consistency

-- 1. Automatic timestamp functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at 
    BEFORE UPDATE ON routes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_stops_updated_at 
    BEFORE UPDATE ON route_stops 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buses_updated_at 
    BEFORE UPDATE ON buses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bus_schedules_updated_at 
    BEFORE UPDATE ON bus_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Booking reference generation (optimized for high concurrency)
CREATE SEQUENCE IF NOT EXISTS booking_ref_seq START 1 CACHE 50;

CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
    ref_number INTEGER;
    date_part TEXT;
BEGIN
    -- Generate reference only if not provided
    IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        ref_number := NEXTVAL('booking_ref_seq');
        NEW.booking_reference := 'NBS' || date_part || LPAD(ref_number::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_booking_ref_trigger 
    BEFORE INSERT ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_booking_reference();

-- 3. Agent code generation (optimized)
CREATE SEQUENCE IF NOT EXISTS agent_code_seq START 1 CACHE 20;

CREATE OR REPLACE FUNCTION generate_agent_code()
RETURNS TRIGGER AS $$
DECLARE
    code_number INTEGER;
BEGIN
    IF NEW.agent_code IS NULL OR NEW.agent_code = '' THEN
        code_number := NEXTVAL('agent_code_seq');
        NEW.agent_code := 'AGT' || LPAD(code_number::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_agent_code_trigger 
    BEFORE INSERT ON agents 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_agent_code();

-- 4. Seat availability management (critical for scalability)
CREATE OR REPLACE FUNCTION update_seat_availability()
RETURNS TRIGGER AS $$
DECLARE
    seat_count INTEGER;
    schedule_record RECORD;
BEGIN
    -- Get schedule details
    SELECT * INTO schedule_record FROM bus_schedules WHERE id = NEW.schedule_id;
    
    IF TG_OP = 'INSERT' THEN
        -- Booking created - reduce available seats
        UPDATE bus_schedules 
        SET 
            available_seats = available_seats - NEW.total_passengers,
            booked_seats = booked_seats || to_jsonb(NEW.seat_numbers),
            updated_at = NOW()
        WHERE id = NEW.schedule_id;
        
        -- Update bus available seats
        UPDATE buses 
        SET available_seats = available_seats - NEW.total_passengers
        WHERE id = schedule_record.bus_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Booking status changed
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            -- Booking cancelled - restore seats
            UPDATE bus_schedules 
            SET 
                available_seats = available_seats + NEW.total_passengers,
                booked_seats = booked_seats - to_jsonb(NEW.seat_numbers),
                updated_at = NOW()
            WHERE id = NEW.schedule_id;
            
            -- Update bus available seats
            UPDATE buses 
            SET available_seats = available_seats + NEW.total_passengers
            WHERE id = schedule_record.bus_id;
            
        ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
            -- Cancelled booking restored
            UPDATE bus_schedules 
            SET 
                available_seats = available_seats - NEW.total_passengers,
                booked_seats = booked_seats || to_jsonb(NEW.seat_numbers),
                updated_at = NOW()
            WHERE id = NEW.schedule_id;
            
            -- Update bus available seats
            UPDATE buses 
            SET available_seats = available_seats - NEW.total_passengers
            WHERE id = schedule_record.bus_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seat_availability_trigger 
    AFTER INSERT OR UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_seat_availability();

-- 5. Audit logging function (for compliance and debugging)
CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    excluded_tables TEXT[] := ARRAY['audit_logs']; -- Don't audit audit logs
BEGIN
    -- Skip if table is in excluded list
    IF TG_TABLE_NAME = ANY(excluded_tables) THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Prepare old and new data
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    END IF;

    -- Insert audit record (async to avoid performance impact)
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_data,
        new_data,
        auth.uid(),
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply audit triggers to critical tables (selective for performance)
CREATE TRIGGER audit_bookings_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_payments_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON payments 
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER audit_user_profiles_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- 6. Performance optimization functions
CREATE OR REPLACE FUNCTION get_available_schedules(
    p_route_id UUID,
    p_departure_date DATE,
    p_passengers INTEGER DEFAULT 1
)
RETURNS TABLE (
    schedule_id UUID,
    bus_name VARCHAR(50),
    departure_time TIME,
    arrival_time TIME,
    available_seats INTEGER,
    base_fare DECIMAL(8,2),
    bus_type bus_type
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bs.id,
        b.bus_name,
        bs.departure_time,
        bs.arrival_time,
        bs.available_seats,
        bs.base_fare,
        b.bus_type
    FROM bus_schedules bs
    JOIN buses b ON b.id = bs.bus_id
    WHERE bs.route_id = p_route_id
      AND bs.departure_date = p_departure_date
      AND bs.is_active = true
      AND bs.available_seats >= p_passengers
      AND b.is_active = true
    ORDER BY bs.departure_time;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Booking statistics function (for analytics)
CREATE OR REPLACE FUNCTION get_booking_stats(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_bookings BIGINT,
    confirmed_bookings BIGINT,
    cancelled_bookings BIGINT,
    total_revenue DECIMAL(12,2),
    avg_booking_value DECIMAL(10,2),
    top_route VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    WITH booking_stats AS (
        SELECT 
            COUNT(*) as total_bookings,
            COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
            COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
            SUM(net_amount) FILTER (WHERE status = 'confirmed') as total_revenue,
            AVG(net_amount) FILTER (WHERE status = 'confirmed') as avg_booking_value
        FROM bookings 
        WHERE created_at::DATE BETWEEN start_date AND end_date
    ),
    top_route_stats AS (
        SELECT r.name as route_name
        FROM bookings b
        JOIN bus_schedules bs ON bs.id = b.schedule_id
        JOIN routes r ON r.id = bs.route_id
        WHERE b.created_at::DATE BETWEEN start_date AND end_date
          AND b.status = 'confirmed'
        GROUP BY r.name
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT 
        bs.total_bookings,
        bs.confirmed_bookings,
        bs.cancelled_bookings,
        COALESCE(bs.total_revenue, 0) as total_revenue,
        bs.avg_booking_value,
        COALESCE(tr.route_name, 'N/A') as top_route
    FROM booking_stats bs
    CROSS JOIN top_route_stats tr;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Clean up old audit logs (maintenance function)
CREATE OR REPLACE FUNCTION cleanup_audit_logs(
    retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < (CURRENT_DATE - retention_days * INTERVAL '1 day');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Seat blocking function (for temporary reservations)
CREATE OR REPLACE FUNCTION block_seats(
    p_schedule_id UUID,
    p_seat_numbers INTEGER[],
    p_user_id UUID,
    p_block_duration INTERVAL DEFAULT INTERVAL '10 minutes'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_blocked JSONB;
    new_blocked JSONB;
    block_record JSONB;
BEGIN
    -- Get current blocked seats
    SELECT blocked_seats INTO current_blocked 
    FROM bus_schedules 
    WHERE id = p_schedule_id;
    
    -- Create block record
    block_record := jsonb_build_object(
        'user_id', p_user_id,
        'seats', p_seat_numbers,
        'blocked_until', (NOW() + p_block_duration)::TEXT
    );
    
    -- Add to blocked seats
    new_blocked := COALESCE(current_blocked, '[]'::JSONB) || jsonb_build_array(block_record);
    
    -- Update schedule
    UPDATE bus_schedules 
    SET blocked_seats = new_blocked,
        updated_at = NOW()
    WHERE id = p_schedule_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 10. Performance monitoring views (for scaling decisions)
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
    'bookings' as table_name,
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count,
    pg_size_pretty(pg_total_relation_size('bookings')) as table_size
FROM bookings
UNION ALL
SELECT 
    'payments' as table_name,
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count,
    pg_size_pretty(pg_total_relation_size('payments')) as table_size
FROM payments
UNION ALL
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count,
    pg_size_pretty(pg_total_relation_size('audit_logs')) as table_size
FROM audit_logs;

-- Comments for documentation
COMMENT ON FUNCTION update_seat_availability() IS 'Critical function for maintaining seat inventory - optimized for high concurrency';
COMMENT ON FUNCTION get_available_schedules(UUID, DATE, INTEGER) IS 'High-performance function for schedule search - used by frontend';
COMMENT ON FUNCTION block_seats(UUID, INTEGER[], UUID, INTERVAL) IS 'Implements temporary seat blocking for booking flow';
COMMENT ON VIEW performance_metrics IS 'Monitoring view for database performance and scaling decisions';

-- Index maintenance recommendations
-- Run these periodically for optimal performance:
-- REINDEX INDEX CONCURRENTLY idx_bookings_dashboard;
-- ANALYZE bookings;
-- ANALYZE bus_schedules;
-- VACUUM (ANALYZE) audit_logs;

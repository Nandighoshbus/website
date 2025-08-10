-- Authentication Audit and Security Tables for Scalable Auth System
-- Execute this after the main schema (01-optimized-schema-scalable.sql)

-- Auth audit logs for security monitoring
CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    role VARCHAR(20),
    error TEXT,
    duration INTEGER, -- in milliseconds
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Login history for user tracking
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    login_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    success BOOLEAN DEFAULT true,
    failure_reason VARCHAR(100),
    session_duration INTEGER, -- in minutes
    location_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_fingerprint VARCHAR(64),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    attempt_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    failure_reason VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Security settings per user
CREATE TABLE IF NOT EXISTS user_security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    backup_codes JSONB DEFAULT '[]',
    trusted_devices JSONB DEFAULT '[]',
    login_notifications BOOLEAN DEFAULT true,
    security_questions JSONB DEFAULT '[]',
    password_changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- API rate limiting logs
CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL, -- IP or user ID
    endpoint VARCHAR(255) NOT NULL,
    attempts INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event_type ON auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_timestamp ON auth_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_severity ON auth_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_ip_address ON auth_audit_logs(ip_address);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_time ON login_history(login_time);
CREATE INDEX IF NOT EXISTS idx_login_history_ip_address ON login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON login_history(success);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip_address ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_attempt_time ON failed_login_attempts(attempt_time);

CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_settings_two_factor ON user_security_settings(two_factor_enabled);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_identifier ON rate_limit_logs(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_endpoint ON rate_limit_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_window_start ON rate_limit_logs(window_start);

-- Create functions for automatic cleanup of old records
CREATE OR REPLACE FUNCTION cleanup_old_auth_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Keep only last 90 days of auth audit logs
    DELETE FROM auth_audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Keep only last 180 days of login history
    DELETE FROM login_history 
    WHERE created_at < NOW() - INTERVAL '180 days';
    
    -- Clean up expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    -- Keep only last 30 days of failed login attempts
    DELETE FROM failed_login_attempts 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Clean up used/expired password reset tokens
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() OR used_at IS NOT NULL;
    
    -- Clean up expired/verified email verification tokens
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW() OR verified_at IS NOT NULL;
    
    -- Keep only last 7 days of rate limit logs
    DELETE FROM rate_limit_logs 
    WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER trigger_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_security_settings_updated_at
    BEFORE UPDATE ON user_security_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_rate_limit_logs_updated_at
    BEFORE UPDATE ON rate_limit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for user access to their own data
CREATE POLICY auth_audit_logs_user_access ON auth_audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY login_history_user_access ON login_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_sessions_user_access ON user_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY user_security_settings_user_access ON user_security_settings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY password_reset_tokens_user_access ON password_reset_tokens
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY email_verification_tokens_user_access ON email_verification_tokens
    FOR ALL USING (user_id = auth.uid());

-- Admin policies for monitoring and management
CREATE POLICY auth_audit_logs_admin_access ON auth_audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY login_history_admin_access ON login_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY failed_login_attempts_admin_access ON failed_login_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY rate_limit_logs_admin_access ON rate_limit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Service role policies for application access
CREATE POLICY auth_audit_logs_service_access ON auth_audit_logs
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY login_history_service_access ON login_history
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY user_sessions_service_access ON user_sessions
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY failed_login_attempts_service_access ON failed_login_attempts
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY user_security_settings_service_access ON user_security_settings
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY password_reset_tokens_service_access ON password_reset_tokens
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY email_verification_tokens_service_access ON email_verification_tokens
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY rate_limit_logs_service_access ON rate_limit_logs
    FOR ALL USING (current_setting('role') = 'service_role');

-- Create a view for security monitoring dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
    -- Recent failed logins
    (SELECT COUNT(*) FROM failed_login_attempts WHERE attempt_time > NOW() - INTERVAL '1 hour') as failed_logins_last_hour,
    (SELECT COUNT(*) FROM failed_login_attempts WHERE attempt_time > NOW() - INTERVAL '24 hours') as failed_logins_last_day,
    
    -- Active sessions
    (SELECT COUNT(*) FROM user_sessions WHERE is_active = true AND expires_at > NOW()) as active_sessions,
    
    -- Recent registrations
    (SELECT COUNT(*) FROM user_profiles WHERE created_at > NOW() - INTERVAL '24 hours') as new_registrations_today,
    
    -- Critical security events
    (SELECT COUNT(*) FROM auth_audit_logs WHERE severity = 'critical' AND timestamp > NOW() - INTERVAL '24 hours') as critical_events_today,
    
    -- Top failed login IPs
    (SELECT json_agg(ip_stats) FROM (
        SELECT ip_address, COUNT(*) as attempts
        FROM failed_login_attempts 
        WHERE attempt_time > NOW() - INTERVAL '24 hours'
        GROUP BY ip_address
        ORDER BY attempts DESC
        LIMIT 10
    ) as ip_stats) as top_failed_ips,
    
    -- Authentication success rate
    (SELECT 
        ROUND(
            (COUNT(*) FILTER (WHERE success = true)::numeric / COUNT(*) * 100), 2
        ) 
        FROM login_history 
        WHERE login_time > NOW() - INTERVAL '24 hours'
    ) as auth_success_rate_24h;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON security_dashboard TO authenticated, service_role;

-- Comments for documentation
COMMENT ON TABLE auth_audit_logs IS 'Audit trail for all authentication events';
COMMENT ON TABLE login_history IS 'Historical record of user login attempts';
COMMENT ON TABLE user_sessions IS 'Active user sessions tracking';
COMMENT ON TABLE failed_login_attempts IS 'Failed login attempts for security monitoring';
COMMENT ON TABLE user_security_settings IS 'Per-user security configuration';
COMMENT ON TABLE password_reset_tokens IS 'Password reset tokens management';
COMMENT ON TABLE email_verification_tokens IS 'Email verification tokens management';
COMMENT ON TABLE rate_limit_logs IS 'API rate limiting tracking';
COMMENT ON VIEW security_dashboard IS 'Real-time security monitoring dashboard';
COMMENT ON FUNCTION cleanup_old_auth_logs IS 'Automated cleanup of old authentication logs';

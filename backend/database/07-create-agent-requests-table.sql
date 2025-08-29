-- Create agent_requests table for agent registration requests
-- This table stores agent registration data for admin verification

CREATE TABLE IF NOT EXISTS agent_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    
    -- Address fields
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    
    -- Business information
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    experience_years VARCHAR(50),
    documents TEXT,
    reason TEXT,
    
    -- Status and workflow
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMP,
    
    -- Email verification
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP,
    
    -- Metadata
    registration_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_requests_email ON agent_requests(email);
CREATE INDEX IF NOT EXISTS idx_agent_requests_status ON agent_requests(status);
CREATE INDEX IF NOT EXISTS idx_agent_requests_created_at ON agent_requests(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE agent_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own requests
CREATE POLICY "Allow insert own request" ON agent_requests
    FOR INSERT WITH CHECK (true);

-- Allow service role to read all requests (for admin)
CREATE POLICY "Allow service role full access" ON agent_requests
    FOR ALL USING (true);

-- Grant permissions
GRANT SELECT, INSERT ON agent_requests TO anon;
GRANT ALL ON agent_requests TO authenticated;
GRANT ALL ON agent_requests TO service_role;

-- Grant sequence permissions (only if sequence exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'agent_requests_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE agent_requests_id_seq TO anon;
        GRANT USAGE, SELECT ON SEQUENCE agent_requests_id_seq TO authenticated;
        GRANT USAGE, SELECT ON SEQUENCE agent_requests_id_seq TO service_role;
    END IF;
END $$;

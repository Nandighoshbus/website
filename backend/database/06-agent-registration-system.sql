-- Agent Registration System Database Schema
-- Run this after the existing schema to add agent registration functionality

-- Enhanced agent_registrations table for pending requests
CREATE TABLE IF NOT EXISTS agent_registrations (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Agent Information
    branch_location VARCHAR(255) NOT NULL,
    custom_branch VARCHAR(255), -- For "Other" branch option
    address TEXT NOT NULL,
    emergency_contact VARCHAR(20) NOT NULL,
    experience_years INTEGER,
    expected_joining_date DATE NOT NULL,
    
    -- Registration Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES user_profiles(id), -- Updated to reference user_profiles
    reviewed_at TIMESTAMP,
    
    -- Metadata
    registration_ip VARCHAR(45),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: agents table already exists in main schema, but let's add missing columns if needed
DO $$
BEGIN
    -- Add columns to existing agents table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='registration_id') THEN
        ALTER TABLE agents ADD COLUMN registration_id INTEGER REFERENCES agent_registrations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='email_verified') THEN
        ALTER TABLE agents ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='branch_location') THEN
        ALTER TABLE agents ADD COLUMN branch_location VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agents' AND column_name='experience_years') THEN
        ALTER TABLE agents ADD COLUMN experience_years INTEGER;
    END IF;
END $$;

-- Agent documents table (for future document uploads)
CREATE TABLE IF NOT EXISTS agent_documents (
    id SERIAL PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE, -- Updated to UUID
    registration_id INTEGER REFERENCES agent_registrations(id) ON DELETE CASCADE,
    
    -- Document Information
    document_type VARCHAR(50) NOT NULL, -- 'profile_photo', 'id_proof', 'license', 'experience_certificate'
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Verification Status
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verified_by UUID REFERENCES user_profiles(id), -- Updated to reference user_profiles
    verification_notes TEXT,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure we reference either agent_id or registration_id, not both
    CONSTRAINT chk_reference CHECK (
        (agent_id IS NOT NULL AND registration_id IS NULL) OR 
        (agent_id IS NULL AND registration_id IS NOT NULL)
    )
);

-- Notifications table for system notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id UUID REFERENCES user_profiles(id), -- Updated to reference user_profiles
    recipient_type VARCHAR(20) NOT NULL, -- 'admin', 'agent', 'customer'
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'registration_request', 'approval', 'rejection', 'document_upload'
    
    -- Related Records
    related_table VARCHAR(50), -- 'agent_registrations', 'agents', etc.
    related_id INTEGER,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    
    -- Priority and Category
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category VARCHAR(50) DEFAULT 'general',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Admin actions log for audit trail
CREATE TABLE IF NOT EXISTS admin_actions (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES user_profiles(id), -- Updated to reference user_profiles
    action_type VARCHAR(50) NOT NULL, -- 'approve_agent', 'reject_agent', 'verify_document'
    target_table VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    
    -- Action Details
    old_values JSONB,
    new_values JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_registrations_status ON agent_registrations(status);
CREATE INDEX IF NOT EXISTS idx_agent_registrations_email ON agent_registrations(email);
CREATE INDEX IF NOT EXISTS idx_agent_registrations_created_at ON agent_registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active); -- Fixed: use is_active instead of status
CREATE INDEX IF NOT EXISTS idx_agents_branch_location ON agents(branch_location);
CREATE INDEX IF NOT EXISTS idx_agents_agent_code ON agents(agent_code);

CREATE INDEX IF NOT EXISTS idx_agent_documents_agent_id ON agent_documents(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_registration_id ON agent_documents(registration_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_type ON agent_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Only create triggers for new tables (agents table already has its trigger)
CREATE TRIGGER update_agent_registrations_updated_at BEFORE UPDATE ON agent_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_documents_updated_at BEFORE UPDATE ON agent_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

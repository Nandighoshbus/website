-- Add password column to agents table
-- This provides a direct password field instead of storing in verification_documents JSONB

ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add comment to document the purpose
COMMENT ON COLUMN agents.password IS 'Agent password for login authentication';

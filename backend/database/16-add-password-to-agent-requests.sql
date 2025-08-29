-- Add password column to agent_requests table
-- This allows storing the password during signup for later use during approval

ALTER TABLE agent_requests 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add comment to document the purpose
COMMENT ON COLUMN agent_requests.password IS 'Password provided during agent signup, used during approval process';

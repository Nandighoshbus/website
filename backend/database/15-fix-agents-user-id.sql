-- Fix agents table to remove foreign key constraint for user_id
-- This allows agents to be created with generated UUIDs without requiring user_profiles entries

-- Drop the foreign key constraint completely since we're not using user_profiles
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_user_id_fkey;

-- Add comment to document the change
COMMENT ON COLUMN agents.user_id IS 'Unique identifier for agent. No longer references user_profiles table.';

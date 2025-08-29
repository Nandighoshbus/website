-- Fix RLS policies to allow agent booking creation
-- The current booking policies only allow users to create bookings with their own user_id
-- But agents create bookings on behalf of passengers, so we need to allow agents to insert bookings

-- Drop existing booking policies that are blocking agent operations
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Agents can create bookings" ON bookings;

-- Create new policy that allows agents to create bookings
CREATE POLICY "Agents can create bookings" ON bookings
    FOR INSERT WITH CHECK (
        -- Allow if the booking is created by an agent (agent_id is set)
        agent_id IN (
            SELECT id FROM agents WHERE user_id = auth.uid()
        )
        OR
        -- Allow if user is creating their own booking (original functionality)
        user_id = auth.uid()
    );

-- Also need to allow agents to insert into passengers table
DROP POLICY IF EXISTS "Agents can create passengers" ON passengers;

CREATE POLICY "Agents can create passengers" ON passengers
    FOR INSERT WITH CHECK (
        -- Allow agents to create passenger records
        EXISTS (
            SELECT 1 FROM agents WHERE user_id = auth.uid()
        )
        OR
        -- Allow users to create their own passenger records
        auth.uid() IS NOT NULL
    );

-- Allow agents to insert into agent_earnings table
DROP POLICY IF EXISTS "Agents can create earnings" ON agent_earnings;

CREATE POLICY "Agents can create earnings" ON agent_earnings
    FOR INSERT WITH CHECK (
        agent_id IN (
            SELECT id FROM agents WHERE user_id = auth.uid()
        )
    );

-- Grant INSERT permissions to passengers and agent_earnings tables
GRANT INSERT ON passengers TO authenticated;
GRANT INSERT ON agent_earnings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON passengers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON agent_earnings TO authenticated;

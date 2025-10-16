-- Agent Credit System Implementation
-- This migration adds credit management functionality for agents
-- Agents can receive credits from admin and use them for booking payments

-- 1. Add credit fields to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS credit_balance DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_credits_received DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_credits_used DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2) DEFAULT 0.00;

-- Add constraints to ensure valid credit amounts
ALTER TABLE agents
ADD CONSTRAINT check_credit_balance_positive CHECK (credit_balance >= 0),
ADD CONSTRAINT check_total_credits_received_positive CHECK (total_credits_received >= 0),
ADD CONSTRAINT check_total_credits_used_positive CHECK (total_credits_used >= 0),
ADD CONSTRAINT check_credit_limit_positive CHECK (credit_limit >= 0);

-- Add comments for documentation
COMMENT ON COLUMN agents.credit_balance IS 'Current available credit balance for the agent';
COMMENT ON COLUMN agents.total_credits_received IS 'Total credits received from admin (lifetime)';
COMMENT ON COLUMN agents.total_credits_used IS 'Total credits used for bookings (lifetime)';
COMMENT ON COLUMN agents.credit_limit IS 'Maximum credit limit allowed for the agent';

-- 2. Create credit transactions table to track all credit movements
CREATE TABLE IF NOT EXISTS agent_credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund', 'adjustment')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    
    -- Reference information
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Admin and approval
    admin_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    
    -- Description and notes
    description TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_agent_credit_transactions_agent_id ON agent_credit_transactions(agent_id, created_at DESC);
CREATE INDEX idx_agent_credit_transactions_type ON agent_credit_transactions(transaction_type, created_at DESC);
CREATE INDEX idx_agent_credit_transactions_booking_id ON agent_credit_transactions(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_agent_credit_transactions_reference ON agent_credit_transactions(reference_number);
CREATE INDEX idx_agent_credit_transactions_status ON agent_credit_transactions(approval_status, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE agent_credit_transactions IS 'Tracks all credit transactions for agents including credits added by admin and debits for bookings';

-- 3. Add credit-related fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS credit_used DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cash_paid DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_split JSONB DEFAULT '{}';

-- Add constraints
ALTER TABLE bookings
ADD CONSTRAINT check_credit_used_positive CHECK (credit_used >= 0),
ADD CONSTRAINT check_cash_paid_positive CHECK (cash_paid >= 0);

-- Add comments
COMMENT ON COLUMN bookings.credit_used IS 'Amount of agent credit used for this booking';
COMMENT ON COLUMN bookings.cash_paid IS 'Amount paid in cash/other methods for this booking';
COMMENT ON COLUMN bookings.payment_split IS 'JSON object containing payment breakdown: {credit: amount, cash: amount, method: string}';

-- 4. Create function to add credits to agent
CREATE OR REPLACE FUNCTION add_agent_credit(
    p_agent_id UUID,
    p_amount DECIMAL(12,2),
    p_admin_id UUID,
    p_description TEXT DEFAULT NULL,
    p_admin_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_reference_number VARCHAR(50);
    v_current_balance DECIMAL(12,2);
    v_new_balance DECIMAL(12,2);
BEGIN
    -- Get current balance
    SELECT credit_balance INTO v_current_balance
    FROM agents
    WHERE id = p_agent_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agent not found';
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_amount;
    
    -- Generate reference number
    v_reference_number := 'CR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
    
    -- Create transaction record
    INSERT INTO agent_credit_transactions (
        agent_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        reference_number,
        admin_id,
        approved_by,
        approval_status,
        description,
        admin_notes,
        approved_at
    ) VALUES (
        p_agent_id,
        'credit',
        p_amount,
        v_current_balance,
        v_new_balance,
        v_reference_number,
        p_admin_id,
        p_admin_id,
        'approved',
        COALESCE(p_description, 'Credit added by admin'),
        p_admin_notes,
        NOW()
    ) RETURNING id INTO v_transaction_id;
    
    -- Update agent balance
    UPDATE agents
    SET 
        credit_balance = v_new_balance,
        total_credits_received = total_credits_received + p_amount,
        updated_at = NOW()
    WHERE id = p_agent_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to deduct credits from agent (for bookings)
CREATE OR REPLACE FUNCTION deduct_agent_credit(
    p_agent_id UUID,
    p_amount DECIMAL(12,2),
    p_booking_id UUID,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_reference_number VARCHAR(50);
    v_current_balance DECIMAL(12,2);
    v_new_balance DECIMAL(12,2);
BEGIN
    -- Get current balance
    SELECT credit_balance INTO v_current_balance
    FROM agents
    WHERE id = p_agent_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agent not found';
    END IF;
    
    -- Check if sufficient balance
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient credit balance. Available: %, Required: %', v_current_balance, p_amount;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance - p_amount;
    
    -- Generate reference number
    v_reference_number := 'DB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
    
    -- Create transaction record
    INSERT INTO agent_credit_transactions (
        agent_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        booking_id,
        reference_number,
        approval_status,
        description,
        approved_at
    ) VALUES (
        p_agent_id,
        'debit',
        p_amount,
        v_current_balance,
        v_new_balance,
        p_booking_id,
        v_reference_number,
        'approved',
        COALESCE(p_description, 'Credit used for booking'),
        NOW()
    ) RETURNING id INTO v_transaction_id;
    
    -- Update agent balance
    UPDATE agents
    SET 
        credit_balance = v_new_balance,
        total_credits_used = total_credits_used + p_amount,
        updated_at = NOW()
    WHERE id = p_agent_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to refund credits to agent (for cancelled bookings)
CREATE OR REPLACE FUNCTION refund_agent_credit(
    p_agent_id UUID,
    p_amount DECIMAL(12,2),
    p_booking_id UUID,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_reference_number VARCHAR(50);
    v_current_balance DECIMAL(12,2);
    v_new_balance DECIMAL(12,2);
BEGIN
    -- Get current balance
    SELECT credit_balance INTO v_current_balance
    FROM agents
    WHERE id = p_agent_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Agent not found';
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_amount;
    
    -- Generate reference number
    v_reference_number := 'RF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
    
    -- Create transaction record
    INSERT INTO agent_credit_transactions (
        agent_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        booking_id,
        reference_number,
        approval_status,
        description,
        approved_at
    ) VALUES (
        p_agent_id,
        'refund',
        p_amount,
        v_current_balance,
        v_new_balance,
        p_booking_id,
        v_reference_number,
        'approved',
        COALESCE(p_description, 'Credit refunded for cancelled booking'),
        NOW()
    ) RETURNING id INTO v_transaction_id;
    
    -- Update agent balance
    UPDATE agents
    SET 
        credit_balance = v_new_balance,
        total_credits_used = total_credits_used - p_amount,
        updated_at = NOW()
    WHERE id = p_agent_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Enable RLS on credit transactions table
ALTER TABLE agent_credit_transactions ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for credit transactions
-- Agents can view their own credit transactions
CREATE POLICY "Agents can view own credit transactions" ON agent_credit_transactions
    FOR SELECT USING (
        agent_id IN (
            SELECT id FROM agents WHERE user_id = auth.uid()
        )
    );

-- Admins can view all credit transactions
CREATE POLICY "Admins can view all credit transactions" ON agent_credit_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can insert credit transactions
CREATE POLICY "Admins can create credit transactions" ON agent_credit_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 9. Create view for agent credit summary
CREATE OR REPLACE VIEW agent_credit_summary AS
SELECT 
    a.id as agent_id,
    a.agent_code,
    a.business_name,
    a.credit_balance,
    a.total_credits_received,
    a.total_credits_used,
    a.credit_limit,
    COUNT(DISTINCT act.id) FILTER (WHERE act.transaction_type = 'credit') as total_credit_transactions,
    COUNT(DISTINCT act.id) FILTER (WHERE act.transaction_type = 'debit') as total_debit_transactions,
    COUNT(DISTINCT act.id) FILTER (WHERE act.transaction_type = 'refund') as total_refund_transactions,
    COALESCE(SUM(act.amount) FILTER (WHERE act.transaction_type = 'credit' AND act.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as credits_last_30_days,
    COALESCE(SUM(act.amount) FILTER (WHERE act.transaction_type = 'debit' AND act.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as debits_last_30_days,
    a.is_active,
    a.updated_at as last_updated
FROM agents a
LEFT JOIN agent_credit_transactions act ON a.id = act.agent_id
GROUP BY a.id, a.agent_code, a.business_name, a.credit_balance, a.total_credits_received, 
         a.total_credits_used, a.credit_limit, a.is_active, a.updated_at;

-- Add comment
COMMENT ON VIEW agent_credit_summary IS 'Summary view of agent credit balances and transaction statistics';

-- 10. Grant necessary permissions
GRANT SELECT ON agent_credit_transactions TO authenticated;
GRANT SELECT ON agent_credit_summary TO authenticated;

-- 11. Create trigger to update agent updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_agent_updated_at'
    ) THEN
        CREATE TRIGGER trigger_update_agent_updated_at
            BEFORE UPDATE ON agents
            FOR EACH ROW
            EXECUTE FUNCTION update_agent_updated_at();
    END IF;
END $$;

-- 12. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_credit_balance ON agents(credit_balance) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_credit_used ON bookings(credit_used) WHERE credit_used > 0;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Agent credit system successfully implemented!';
    RAISE NOTICE 'New tables: agent_credit_transactions';
    RAISE NOTICE 'New functions: add_agent_credit, deduct_agent_credit, refund_agent_credit';
    RAISE NOTICE 'New view: agent_credit_summary';
END $$;

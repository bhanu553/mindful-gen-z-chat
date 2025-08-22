-- Migration: Unified EchoMind Model - Single Flow for All Users
-- This migration implements the unified model where every user follows the same rules:
-- - 10-minute cooldown after each completed session
-- - Payment required for each new session (or unused paid credit)
-- - No more free vs premium branching

-- 1. Create simplified session_credit table (replaces complex user_credits)
CREATE TABLE IF NOT EXISTS session_credit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('unredeemed', 'redeemed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    redeemed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(payment_id) -- Ensures idempotency for webhook retries
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_credit_user_id ON session_credit(user_id);
CREATE INDEX IF NOT EXISTS idx_session_credit_status ON session_credit(status);
CREATE INDEX IF NOT EXISTS idx_session_credit_payment_id ON session_credit(payment_id);

-- 3. Enable RLS on session_credit table
ALTER TABLE session_credit ENABLE ROW LEVEL SECURITY;

-- Users can only see their own credits
CREATE POLICY "Users can access their own session credits" ON session_credit
    FOR ALL USING (auth.uid() = user_id);

-- 4. Create function to check if user can start new session (unified logic)
CREATE OR REPLACE FUNCTION can_start_unified_session(user_uuid UUID)
RETURNS TABLE(
    can_start BOOLEAN,
    reason TEXT,
    cooldown_remaining INTERVAL,
    next_available TIMESTAMP WITH TIME ZONE,
    has_credit BOOLEAN
) AS $$
DECLARE
    active_session RECORD;
    last_completed_session RECORD;
    unredeemed_credit BOOLEAN;
BEGIN
    -- Check for active incomplete session
    SELECT * INTO active_session FROM chat_sessions 
    WHERE user_id = user_uuid AND is_complete = false
    ORDER BY created_at DESC LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT false, 'Active session in progress'::TEXT, NULL::INTERVAL, NULL::TIMESTAMP WITH TIME ZONE, false;
        RETURN;
    END IF;
    
    -- Check cooldown period (10 minutes for everyone)
    SELECT * INTO last_completed_session FROM chat_sessions 
    WHERE user_id = user_uuid AND is_complete = true
    ORDER BY ended_at DESC LIMIT 1;
    
    IF FOUND AND last_completed_session.cooldown_until IS NOT NULL THEN
        IF NOW() < last_completed_session.cooldown_until THEN
            RETURN QUERY SELECT 
                false, 
                'Cooldown period active (10 minutes)'::TEXT, 
                last_completed_session.cooldown_until - NOW(),
                last_completed_session.cooldown_until,
                false;
            RETURN;
        END IF;
    END IF;
    
    -- Check if user has unredeemed credit
    SELECT EXISTS(
        SELECT 1 FROM session_credit 
        WHERE user_id = user_uuid 
        AND status = 'unredeemed'
    ) INTO unredeemed_credit;
    
    IF NOT unredeemed_credit THEN
        RETURN QUERY SELECT false, 'Payment required ($5.99) to start next session'::TEXT, NULL::INTERVAL, NULL::TIMESTAMP WITH TIME ZONE, false;
        RETURN;
    END IF;
    
    -- User can start new session
    RETURN QUERY SELECT true, 'Ready to start'::TEXT, NULL::INTERVAL, NULL::TIMESTAMP WITH TIME ZONE, true;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to redeem a credit atomically
CREATE OR REPLACE FUNCTION redeem_session_credit(user_uuid UUID)
RETURNS TABLE(
    success BOOLEAN,
    credit_id UUID,
    error_message TEXT
) AS $$
DECLARE
    credit_record RECORD;
BEGIN
    -- Find and lock an unredeemed credit for this user
    SELECT * INTO credit_record FROM session_credit 
    WHERE user_id = user_uuid 
    AND status = 'unredeemed'
    ORDER BY created_at ASC 
    LIMIT 1
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, 'No unredeemed credit available'::TEXT;
        RETURN;
    END IF;
    
    -- Mark credit as redeemed
    UPDATE session_credit 
    SET status = 'redeemed', redeemed_at = NOW()
    WHERE id = credit_record.id;
    
    RETURN QUERY SELECT true, credit_record.id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON session_credit TO authenticated;
GRANT USAGE ON SEQUENCE session_credit_id_seq TO authenticated;

-- 7. Insert initial free credit for existing users (one-time migration)
INSERT INTO session_credit (user_id, status)
SELECT 
    id as user_id,
    'unredeemed' as status
FROM profiles 
WHERE NOT EXISTS (
    SELECT 1 FROM session_credit WHERE user_id = profiles.id
);

-- 8. Update existing chat_sessions to have 10-minute cooldown if missing
UPDATE chat_sessions 
SET cooldown_until = ended_at + INTERVAL '10 minutes'
WHERE is_complete = true 
AND cooldown_until IS NULL 
AND ended_at IS NOT NULL;

COMMENT ON TABLE session_credit IS 'Simplified session credits: one credit = one session unlock';
COMMENT ON COLUMN session_credit.status IS 'Credit status: unredeemed (available), redeemed (used), refunded (cancelled)';
COMMENT ON COLUMN session_credit.payment_id IS 'Unique payment reference for idempotency';

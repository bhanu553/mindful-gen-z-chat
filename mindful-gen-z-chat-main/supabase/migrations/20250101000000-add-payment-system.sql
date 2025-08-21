-- Migration: Add Payment System and Enhanced Cooldown Support
-- This migration adds the missing columns and tables for the complete payment system
-- All changes are ADDITIVE - no existing columns or tables are modified

-- 1. Add missing columns to chat_sessions table
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMP WITH TIME ZONE;

-- 2. Add payment_status column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'paid', 'expired'));

-- 3. Create payments table for tracking PayPal transactions
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    paypal_order_id TEXT UNIQUE NOT NULL,
    paypal_payment_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method TEXT DEFAULT 'paypal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    webhook_data JSONB,
    verification_hash TEXT
);

-- 4. Create user_credits table for tracking paid sessions
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    credit_type TEXT NOT NULL CHECK (credit_type IN ('free', 'paid')),
    sessions_granted INTEGER DEFAULT 1,
    sessions_used INTEGER DEFAULT 0,
    sessions_remaining INTEGER DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_paypal_order_id ON payments(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_active ON user_credits(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_cooldown ON chat_sessions(cooldown_until);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ended ON chat_sessions(ended_at);

-- 6. Create RLS policies for new tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payments
CREATE POLICY "Users can access their own payments" ON payments
    FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own credits
CREATE POLICY "Users can access their own credits" ON user_credits
    FOR ALL USING (auth.uid() = user_id);

-- 7. Create function to update payment_status in profiles
CREATE OR REPLACE FUNCTION update_user_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profiles.payment_status based on active credits
    UPDATE profiles 
    SET payment_status = CASE 
        WHEN EXISTS (
            SELECT 1 FROM user_credits 
            WHERE user_id = NEW.user_id 
            AND credit_type = 'paid' 
            AND is_active = true 
            AND sessions_remaining > 0
        ) THEN 'paid'
        ELSE 'free'
    END
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically update payment_status
CREATE TRIGGER trigger_update_payment_status
    AFTER INSERT OR UPDATE OR DELETE ON user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_user_payment_status();

-- 9. Create function to calculate cooldown duration
CREATE OR REPLACE FUNCTION calculate_cooldown_duration(is_premium BOOLEAN)
RETURNS INTERVAL AS $$
BEGIN
    RETURN CASE 
        WHEN is_premium THEN INTERVAL '10 minutes'
        ELSE INTERVAL '30 days'
    END;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to check if user can start new session
CREATE OR REPLACE FUNCTION can_start_new_session(user_uuid UUID)
RETURNS TABLE(
    can_start BOOLEAN,
    reason TEXT,
    cooldown_remaining INTERVAL,
    next_available TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    user_profile RECORD;
    active_session RECORD;
    cooldown_duration INTERVAL;
BEGIN
    -- Get user profile
    SELECT * INTO user_profile FROM profiles WHERE user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'User not found'::TEXT, NULL::INTERVAL, NULL::TIMESTAMP WITH TIME ZONE;
        RETURN;
    END IF;
    
    -- Check for active incomplete session
    SELECT * INTO active_session FROM chat_sessions 
    WHERE user_id = user_uuid AND is_complete = false
    ORDER BY created_at DESC LIMIT 1;
    
    IF FOUND THEN
        RETURN QUERY SELECT false, 'Active session in progress'::TEXT, NULL::INTERVAL, NULL::TIMESTAMP WITH TIME ZONE;
        RETURN;
    END IF;
    
    -- Check cooldown
    SELECT * INTO active_session FROM chat_sessions 
    WHERE user_id = user_uuid AND is_complete = true
    ORDER BY ended_at DESC LIMIT 1;
    
    IF FOUND AND active_session.cooldown_until IS NOT NULL THEN
        IF NOW() < active_session.cooldown_until THEN
            RETURN QUERY SELECT 
                false, 
                'Cooldown period active'::TEXT, 
                active_session.cooldown_until - NOW(),
                active_session.cooldown_until;
            RETURN;
        END IF;
    END IF;
    
    -- Check if user has credits (for paid sessions)
    IF user_profile.payment_status = 'paid' THEN
        IF NOT EXISTS (
            SELECT 1 FROM user_credits 
            WHERE user_id = user_uuid 
            AND credit_type = 'paid' 
            AND is_active = true 
            AND sessions_remaining > 0
        ) THEN
            RETURN QUERY SELECT false, 'No paid credits available'::TEXT, NULL::INTERVAL, NULL::TIMESTAMP WITH TIME ZONE;
            RETURN;
        END IF;
    END IF;
    
    -- User can start new session
    RETURN QUERY SELECT true, 'Ready to start'::TEXT, NULL::INTERVAL, NULL::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql;

-- 11. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_credits TO authenticated;
GRANT USAGE ON SEQUENCE payments_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE user_credits_id_seq TO authenticated;

-- 12. Insert initial free credit for existing users
INSERT INTO user_credits (user_id, credit_type, sessions_granted, sessions_remaining, is_active)
SELECT 
    id as user_id,
    'free' as credit_type,
    1 as sessions_granted,
    1 as sessions_remaining,
    true as is_active
FROM profiles 
WHERE NOT EXISTS (
    SELECT 1 FROM user_credits WHERE user_id = profiles.id
);

-- 13. Update existing profiles to have correct payment_status
UPDATE profiles 
SET payment_status = 'free' 
WHERE payment_status IS NULL;

COMMENT ON TABLE payments IS 'Stores PayPal payment transactions and verification data';
COMMENT ON TABLE user_credits IS 'Tracks user session credits (free and paid)';
COMMENT ON COLUMN chat_sessions.ended_at IS 'Timestamp when session was marked complete';
COMMENT ON COLUMN chat_sessions.cooldown_until IS 'Timestamp when cooldown period expires';
COMMENT ON COLUMN profiles.payment_status IS 'Current payment status: free, paid, or expired';

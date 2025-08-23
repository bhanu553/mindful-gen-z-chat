-- Create session_credit table for unified payment model
-- Each credit represents proof of payment for exactly ONE future session

CREATE TABLE IF NOT EXISTS public.session_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_id TEXT UNIQUE NOT NULL, -- PayPal order ID for idempotency
    status TEXT NOT NULL CHECK (status IN ('unredeemed', 'redeemed', 'refunded')) DEFAULT 'unredeemed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(payment_id) -- Ensure webhook/app retries are idempotent
);

-- Add cooldown_until field to chat_sessions for unified 10-minute cooldown
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_credits_user_id_status 
ON public.session_credits(user_id, status);

CREATE INDEX IF NOT EXISTS idx_session_credits_payment_id 
ON public.session_credits(payment_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_cooldown_until 
ON public.chat_sessions(cooldown_until);

-- Create function to get user's next eligible session time
CREATE OR REPLACE FUNCTION get_user_next_eligible_time(user_uuid UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    last_session_cooldown TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the cooldown_until from the most recent completed session
    SELECT cooldown_until INTO last_session_cooldown
    FROM chat_sessions 
    WHERE user_id = user_uuid 
      AND is_complete = true 
      AND cooldown_until IS NOT NULL
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    RETURN COALESCE(last_session_cooldown, '1970-01-01'::TIMESTAMP WITH TIME ZONE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can start new session
CREATE OR REPLACE FUNCTION can_user_start_session(user_uuid UUID)
RETURNS TABLE(
    can_start BOOLEAN,
    reason TEXT,
    cooldown_remaining INTERVAL,
    has_credit BOOLEAN
) AS $$
DECLARE
    next_eligible TIMESTAMP WITH TIME ZONE;
    now_time TIMESTAMP WITH TIME ZONE := now();
    credit_count INTEGER;
BEGIN
    -- Check if user has an active session
    IF EXISTS (
        SELECT 1 FROM chat_sessions 
        WHERE user_id = user_uuid AND is_complete = false
    ) THEN
        RETURN QUERY SELECT 
            false, 
            'Session already active'::TEXT,
            '0'::INTERVAL,
            false;
        RETURN;
    END IF;
    
    -- Check cooldown
    next_eligible := get_user_next_eligible_time(user_uuid);
    IF now_time < next_eligible THEN
        RETURN QUERY SELECT 
            false, 
            'Cooldown active'::TEXT,
            next_eligible - now_time,
            false;
        RETURN;
    END IF;
    
    -- Check for unredeemed credit
    SELECT COUNT(*) INTO credit_count
    FROM session_credits 
    WHERE user_id = user_uuid AND status = 'unredeemed';
    
    IF credit_count = 0 THEN
        RETURN QUERY SELECT 
            false, 
            'Payment required'::TEXT,
            '0'::INTERVAL,
            false;
        RETURN;
    END IF;
    
    -- All conditions met
    RETURN QUERY SELECT 
        true, 
        'Ready to start'::TEXT,
        '0'::INTERVAL,
        true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

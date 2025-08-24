-- Enhance cooldown tracking and add session summary fields
-- This migration adds fields to better track session completion and cooldown states

-- Add session summary field to chat_sessions for better continuity
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS session_summary TEXT;

-- Add last_message_at field to track when the last message was sent
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE;

-- Add cooldown_started_at field to track when cooldown began
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS cooldown_started_at TIMESTAMP WITH TIME ZONE;

-- Create function to get user's current cooldown status
CREATE OR REPLACE FUNCTION get_user_cooldown_status(user_uuid UUID)
RETURNS TABLE(
    is_in_cooldown BOOLEAN,
    cooldown_remaining INTERVAL,
    cooldown_ends_at TIMESTAMP WITH TIME ZONE,
    has_credit BOOLEAN,
    credit_count INTEGER
) AS $$
DECLARE
    latest_session RECORD;
    now_time TIMESTAMP WITH TIME ZONE := now();
    credit_count INTEGER;
BEGIN
    -- Get the most recent completed session
    SELECT * INTO latest_session
    FROM chat_sessions 
    WHERE user_id = user_uuid 
      AND is_complete = true 
      AND cooldown_until IS NOT NULL
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    -- Check if user has unredeemed credits
    SELECT COUNT(*) INTO credit_count
    FROM session_credits 
    WHERE user_id = user_uuid AND status = 'unredeemed';
    
    -- If no completed session, user is not in cooldown
    IF latest_session IS NULL THEN
        RETURN QUERY SELECT 
            false, 
            '0'::INTERVAL,
            now_time,
            credit_count > 0,
            credit_count;
        RETURN;
    END IF;
    
    -- Check if cooldown is still active
    IF now_time < latest_session.cooldown_until THEN
        RETURN QUERY SELECT 
            true, 
            latest_session.cooldown_until - now_time,
            latest_session.cooldown_until,
            credit_count > 0,
            credit_count;
    ELSE
        RETURN QUERY SELECT 
            false, 
            '0'::INTERVAL,
            latest_session.cooldown_until,
            credit_count > 0,
            credit_count;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better performance on cooldown queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_cooldown
ON public.chat_sessions(user_id, is_complete, cooldown_until);

-- Create index for session summary queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_summary
ON public.chat_sessions(user_id, session_summary) WHERE session_summary IS NOT NULL;

-- Update existing sessions to set cooldown_started_at if cooldown_until exists
UPDATE public.chat_sessions 
SET cooldown_started_at = updated_at 
WHERE cooldown_until IS NOT NULL AND cooldown_started_at IS NULL;

-- Create function to automatically update last_message_at when messages are inserted
CREATE OR REPLACE FUNCTION update_session_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_message_at
DROP TRIGGER IF EXISTS trigger_update_session_last_message ON chat_messages;
CREATE TRIGGER trigger_update_session_last_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_last_message();

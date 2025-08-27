-- Fix cooldown timestamp columns and ensure they work properly
-- This migration ensures the ended_at and cooldown_until columns are properly configured

-- First, let's check if the columns exist and have the right types
DO $$
BEGIN
    -- Check if ended_at column exists and has correct type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_sessions' 
        AND column_name = 'ended_at' 
        AND data_type = 'timestamp with time zone'
    ) THEN
        ALTER TABLE public.chat_sessions ADD COLUMN ended_at TIMESTAMPTZ;
    END IF;
    
    -- Check if cooldown_until column exists and has correct type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_sessions' 
        AND column_name = 'cooldown_until' 
        AND data_type = 'timestamp with time zone'
    ) THEN
        ALTER TABLE public.chat_sessions ADD COLUMN cooldown_until TIMESTAMPTZ;
    END IF;
    
    -- Check if cooldown_started_at column exists and has correct type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_sessions' 
        AND column_name = 'cooldown_started_at' 
        AND data_type = 'timestamp with time zone'
    ) THEN
        ALTER TABLE public.chat_sessions ADD COLUMN cooldown_started_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create indexes for better performance on cooldown queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ended_at
ON public.chat_sessions(ended_at) WHERE ended_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_cooldown_until_active
ON public.chat_sessions(cooldown_until) WHERE cooldown_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_cooldown_started_at
ON public.chat_sessions(cooldown_started_at) WHERE cooldown_started_at IS NOT NULL;

-- Create a function to debug session completion updates
CREATE OR REPLACE FUNCTION debug_session_completion(
    session_id UUID,
    completion_time TIMESTAMPTZ,
    cooldown_until TIMESTAMPTZ
) RETURNS TEXT AS $$
DECLARE
    result TEXT;
    session_record RECORD;
BEGIN
    -- Update the session
    UPDATE public.chat_sessions 
    SET 
        is_complete = true,
        ended_at = completion_time,
        updated_at = completion_time,
        cooldown_until = cooldown_until,
        cooldown_started_at = completion_time
    WHERE id = session_id;
    
    -- Get the updated record to verify
    SELECT * INTO session_record 
    FROM public.chat_sessions 
    WHERE id = session_id;
    
    -- Return debug info
    result := 'Session ID: ' || session_id || 
              ', is_complete: ' || session_record.is_complete ||
              ', ended_at: ' || COALESCE(session_record.ended_at::text, 'NULL') ||
              ', cooldown_until: ' || COALESCE(session_record.cooldown_until::text, 'NULL') ||
              ', cooldown_started_at: ' || COALESCE(session_record.cooldown_started_at::text, 'NULL');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the debug function
GRANT EXECUTE ON FUNCTION debug_session_completion(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- COMPREHENSIVE FIX FOR COOLDOWN TIMESTAMP COLUMNS
-- This script ensures all timestamp columns work properly with is_complete
-- Run this directly in your Supabase SQL editor

-- Step 1: Drop and recreate the columns to ensure proper data types
ALTER TABLE public.chat_sessions DROP COLUMN IF EXISTS ended_at;
ALTER TABLE public.chat_sessions DROP COLUMN IF EXISTS cooldown_until;
ALTER TABLE public.chat_sessions DROP COLUMN IF EXISTS cooldown_started_at;

-- Step 2: Add the columns with proper data types and constraints
ALTER TABLE public.chat_sessions ADD COLUMN ended_at TIMESTAMPTZ;
ALTER TABLE public.chat_sessions ADD COLUMN cooldown_until TIMESTAMPTZ;
ALTER TABLE public.chat_sessions ADD COLUMN cooldown_started_at TIMESTAMPTZ;

-- Step 3: Add session_summary column if it doesn't exist
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS session_summary TEXT;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ended_at 
ON public.chat_sessions(ended_at) WHERE ended_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_cooldown_until 
ON public.chat_sessions(cooldown_until) WHERE cooldown_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_cooldown_started_at 
ON public.chat_sessions(cooldown_started_at) WHERE cooldown_started_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_complete 
ON public.chat_sessions(is_complete) WHERE is_complete = true;

-- Step 5: Create a function to properly update session completion
CREATE OR REPLACE FUNCTION update_session_completion(
  session_id UUID,
  completion_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  cooldown_end_time TIMESTAMPTZ;
  update_success BOOLEAN;
BEGIN
  -- Calculate cooldown end time (10 minutes from completion)
  cooldown_end_time := completion_time + INTERVAL '10 minutes';
  
  -- Update the session with all required fields (NO updated_at column)
  UPDATE public.chat_sessions 
  SET 
    is_complete = true,
    ended_at = completion_time,
    cooldown_started_at = completion_time,
    cooldown_until = cooldown_end_time
  WHERE id = session_id;
  
  -- Check if update was successful
  GET DIAGNOSTICS update_success = ROW_COUNT;
  
  -- Log the update for debugging
  RAISE NOTICE 'Session % completion update: ended_at=%, cooldown_until=%, success=%', 
    session_id, completion_time, cooldown_end_time, update_success;
  
  RETURN update_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create a function to get user's current cooldown status
CREATE OR REPLACE FUNCTION get_user_cooldown_status(user_uuid UUID)
RETURNS TABLE(
  is_in_cooldown BOOLEAN,
  cooldown_remaining_minutes INTEGER,
  cooldown_remaining_seconds INTEGER,
  cooldown_ends_at TIMESTAMPTZ,
  session_ended_at TIMESTAMPTZ
) AS $$
DECLARE
  latest_session RECORD;
  now_time TIMESTAMPTZ := NOW();
  remaining_ms BIGINT;
BEGIN
  -- Get the most recent completed session for the user
  SELECT * INTO latest_session
  FROM chat_sessions
  WHERE user_id = user_uuid 
    AND is_complete = true
    AND cooldown_until IS NOT NULL
  ORDER BY ended_at DESC
  LIMIT 1;
  
  -- If no session found or cooldown has expired
  IF latest_session IS NULL OR latest_session.cooldown_until <= now_time THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      0::INTEGER,
      0::INTEGER,
      NULL::TIMESTAMPTZ,
      NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Calculate remaining time
  remaining_ms := EXTRACT(EPOCH FROM (latest_session.cooldown_until - now_time)) * 1000;
  
  RETURN QUERY SELECT 
    true::BOOLEAN,
    FLOOR(remaining_ms / 60000)::INTEGER,
    FLOOR((remaining_ms % 60000) / 1000)::INTEGER,
    latest_session.cooldown_until,
    latest_session.ended_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create a trigger to automatically set timestamps when is_complete changes
CREATE OR REPLACE FUNCTION trigger_session_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_time TIMESTAMPTZ;
BEGIN
  -- Only trigger when is_complete changes from false to true
  IF OLD.is_complete = false AND NEW.is_complete = true THEN
    completion_time := NOW();
    
    -- Set all required timestamps (NO updated_at column)
    NEW.ended_at := completion_time;
    NEW.cooldown_started_at := completion_time;
    NEW.cooldown_until := completion_time + INTERVAL '10 minutes';
    
    RAISE NOTICE 'Trigger: Session % marked complete at %, cooldown until %', 
      NEW.id, completion_time, NEW.cooldown_until;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create the trigger
DROP TRIGGER IF EXISTS session_completion_trigger ON chat_sessions;
CREATE TRIGGER session_completion_trigger
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_session_completion();

-- Step 9: Create a function to manually fix existing sessions that have is_complete=true but missing timestamps
CREATE OR REPLACE FUNCTION fix_existing_completed_sessions()
RETURNS INTEGER AS $$
DECLARE
  fixed_count INTEGER := 0;
  session_record RECORD;
  completion_time TIMESTAMPTZ;
BEGIN
  -- Find sessions that are marked complete but missing timestamps
  FOR session_record IN 
    SELECT id, created_at 
    FROM chat_sessions 
    WHERE is_complete = true 
      AND (ended_at IS NULL OR cooldown_until IS NULL OR cooldown_started_at IS NULL)
  LOOP
    -- Use created_at + 1 hour as completion time (approximation)
    completion_time := session_record.created_at + INTERVAL '1 hour';
    
    -- Update the session (NO updated_at column)
    UPDATE chat_sessions 
    SET 
      ended_at = completion_time,
      cooldown_started_at = completion_time,
      cooldown_until = completion_time + INTERVAL '10 minutes'
    WHERE id = session_record.id;
    
    fixed_count := fixed_count + 1;
    
    RAISE NOTICE 'Fixed session %: set completion time to %', session_record.id, completion_time;
  END LOOP;
  
  RETURN fixed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Run the fix for existing sessions
SELECT fix_existing_completed_sessions() as sessions_fixed;

-- Step 11: Verify the columns exist and have correct types
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' 
  AND table_schema = 'public'
  AND column_name IN ('is_complete', 'ended_at', 'cooldown_until', 'cooldown_started_at', 'session_summary')
ORDER BY column_name;

-- Step 12: Show current state of completed sessions
SELECT 
  id,
  user_id,
  is_complete,
  ended_at,
  cooldown_started_at,
  cooldown_until,
  created_at
FROM chat_sessions 
WHERE is_complete = true
ORDER BY ended_at DESC
LIMIT 10;

-- Step 13: Test the cooldown status function with a sample user (replace with actual user ID)
-- SELECT * FROM get_user_cooldown_status('your-user-id-here');

-- Step 14: Create a function to manually test session completion
CREATE OR REPLACE FUNCTION test_session_completion(session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Call the update function
  RETURN update_session_completion(session_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 15: Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_session_completion(UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_cooldown_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fix_existing_completed_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION test_session_completion(UUID) TO authenticated;

-- Step 16: Final verification query
SELECT 
  'Database setup complete' as status,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN is_complete = true THEN 1 END) as completed_sessions,
  COUNT(CASE WHEN is_complete = true AND ended_at IS NOT NULL AND cooldown_until IS NOT NULL THEN 1 END) as properly_timestamped_sessions
FROM chat_sessions;

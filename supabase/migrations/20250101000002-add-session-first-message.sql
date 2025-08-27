-- Add session_first_message column to chat_sessions for personalized session starts
-- This migration adds a field to store the AI-generated first message for new sessions

-- Add session_first_message field to chat_sessions
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS session_first_message TEXT;

-- Create index for better performance on session_first_message queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_first_message
ON public.chat_sessions(user_id, session_first_message) WHERE session_first_message IS NOT NULL;

-- Create function to get user's most recent session first message
CREATE OR REPLACE FUNCTION get_user_session_first_message(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    first_message TEXT;
BEGIN
    -- Get the most recent session with a first message
    SELECT session_first_message INTO first_message
    FROM chat_sessions 
    WHERE user_id = user_uuid 
      AND session_first_message IS NOT NULL
      AND session_first_message != ''
    ORDER BY created_at DESC 
    LIMIT 1;
    
    RETURN COALESCE(first_message, 'Welcome to your therapy session! How are you feeling today?');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has a personalized first message
CREATE OR REPLACE FUNCTION has_personalized_first_message(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_message BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM chat_sessions 
        WHERE user_id = user_uuid 
          AND session_first_message IS NOT NULL
          AND session_first_message != ''
    ) INTO has_message;
    
    RETURN has_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

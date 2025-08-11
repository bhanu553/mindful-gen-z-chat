-- Add session_first_message column to chat_sessions table
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS session_first_message text;

-- Add comment for documentation
COMMENT ON COLUMN public.chat_sessions.session_first_message IS 'The first AI message for a new session, generated from onboarding data';

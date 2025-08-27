-- Fix missing timestamp columns in chat_sessions table
-- Run this directly in your Supabase SQL editor

-- Add ended_at column if it doesn't exist
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Add cooldown_until column if it doesn't exist  
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ;

-- Add cooldown_started_at column if it doesn't exist
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS cooldown_started_at TIMESTAMPTZ;

-- Add session_summary column if it doesn't exist
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS session_summary TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ended_at 
ON public.chat_sessions(ended_at) WHERE ended_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_cooldown_until 
ON public.chat_sessions(cooldown_until) WHERE cooldown_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_cooldown_started_at 
ON public.chat_sessions(cooldown_started_at) WHERE cooldown_started_at IS NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' 
AND table_schema = 'public'
AND column_name IN ('ended_at', 'cooldown_until', 'cooldown_started_at', 'session_summary')
ORDER BY column_name;

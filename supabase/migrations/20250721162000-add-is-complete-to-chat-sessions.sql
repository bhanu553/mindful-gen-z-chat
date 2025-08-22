-- Add is_complete field to chat_sessions table
-- This field is required for session completion detection and cooldown functionality

ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS is_complete boolean DEFAULT false;

-- Add updated_at field if it doesn't exist (used for cooldown calculations)
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text);

-- Update existing sessions to have is_complete = false
UPDATE public.chat_sessions 
SET is_complete = false 
WHERE is_complete IS NULL;

-- Update existing sessions to have updated_at = created_at if updated_at is NULL
UPDATE public.chat_sessions 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_chat_sessions_updated_at();

-- Add index on is_complete for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_complete 
ON public.chat_sessions(is_complete);

-- Add index on user_id and is_complete for user session queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id_is_complete 
ON public.chat_sessions(user_id, is_complete);

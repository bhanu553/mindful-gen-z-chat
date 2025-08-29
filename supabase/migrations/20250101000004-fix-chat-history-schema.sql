-- FIX CHAT HISTORY SCHEMA - Ensure messages are properly stored and retrieved
-- This migration fixes the disappearing chat issue by ensuring proper schema and constraints

-- Step 1: Fix chat_messages table schema
-- Add missing columns and ensure proper data types
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS content TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'therapy',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2);

-- Step 2: Ensure proper constraints and primary key
-- Drop existing primary key if it exists
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_pkey;

-- Add proper primary key
ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);

-- Step 3: Add foreign key constraints
-- Add foreign key to chat_sessions
ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;

-- Add foreign key to profiles (users)
ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 4: Add NOT NULL constraints for critical fields
ALTER TABLE public.chat_messages 
ALTER COLUMN session_id SET NOT NULL,
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN role SET NOT NULL,
ALTER COLUMN content SET NOT NULL;

-- Step 5: Create indexes for efficient message retrieval
-- Index for session-based message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id 
ON public.chat_messages(session_id);

-- Index for user-based message queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id 
ON public.chat_messages(user_id);

-- Index for chronological message ordering
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
ON public.chat_messages(created_at);

-- Composite index for session + user + chronological queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_user_created 
ON public.chat_messages(session_id, user_id, created_at);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_role 
ON public.chat_messages(role);

-- Step 6: Fix chat_sessions table schema
-- Add missing columns that are referenced in the code
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Therapy Session',
ADD COLUMN IF NOT EXISTS current_mode TEXT DEFAULT 'therapy',
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS session_first_message TEXT,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cooldown_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS session_summary TEXT;

-- Step 7: Ensure proper constraints for chat_sessions
-- Drop existing primary key if it exists
ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_pkey;

-- Add proper primary key
ALTER TABLE public.chat_sessions 
ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);

-- Add foreign key to profiles (users)
ALTER TABLE public.chat_sessions 
ADD CONSTRAINT chat_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add NOT NULL constraints for critical fields
ALTER TABLE public.chat_sessions 
ALTER COLUMN user_id SET NOT NULL;

-- Step 8: Create indexes for chat_sessions
-- Index for user-based session queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id 
ON public.chat_sessions(user_id);

-- Index for completion status queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_complete 
ON public.chat_sessions(is_complete);

-- Index for chronological session queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at 
ON public.chat_sessions(created_at);

-- Composite index for user + completion status
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_complete 
ON public.chat_sessions(user_id, is_complete);

-- Step 9: Create function to ensure message persistence
CREATE OR REPLACE FUNCTION ensure_message_persistence()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure created_at is always set
    IF NEW.created_at IS NULL THEN
        NEW.created_at = timezone('utc'::text, now());
    END IF;
    
    -- Ensure user_id and session_id are always set
    IF NEW.user_id IS NULL OR NEW.session_id IS NULL THEN
        RAISE EXCEPTION 'user_id and session_id cannot be null';
    END IF;
    
    -- Ensure content is not empty
    IF NEW.content IS NULL OR trim(NEW.content) = '' THEN
        RAISE EXCEPTION 'content cannot be null or empty';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger for message persistence
DROP TRIGGER IF EXISTS ensure_message_persistence_trigger ON public.chat_messages;
CREATE TRIGGER ensure_message_persistence_trigger
    BEFORE INSERT OR UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION ensure_message_persistence();

-- Step 11: Create function to get complete chat history
CREATE OR REPLACE FUNCTION get_session_chat_history(session_uuid UUID, user_uuid UUID)
RETURNS TABLE(
    id UUID,
    role TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    mode TEXT
) AS $$
BEGIN
    -- Verify session belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM public.chat_sessions 
        WHERE id = session_uuid AND user_id = user_uuid
    ) THEN
        RAISE EXCEPTION 'Session not found or access denied';
    END IF;
    
    -- Return all messages in chronological order
    RETURN QUERY
    SELECT 
        cm.id,
        cm.role,
        cm.content,
        cm.created_at,
        cm.mode
    FROM public.chat_messages cm
    WHERE cm.session_id = session_uuid
      AND cm.user_id = user_uuid
    ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create function to count session messages
CREATE OR REPLACE FUNCTION get_session_message_count(session_uuid UUID, user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    message_count INTEGER;
BEGIN
    -- Verify session belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM public.chat_sessions 
        WHERE id = session_uuid AND user_id = user_uuid
    ) THEN
        RETURN 0;
    END IF;
    
    -- Count messages
    SELECT COUNT(*) INTO message_count
    FROM public.chat_messages
    WHERE session_id = session_uuid AND user_id = user_uuid;
    
    RETURN message_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Update existing sessions to ensure they have proper data
-- Set user_id for any sessions that might be missing it
UPDATE public.chat_sessions 
SET user_id = (
    SELECT user_id FROM public.chat_messages 
    WHERE session_id = chat_sessions.id 
    LIMIT 1
)
WHERE user_id IS NULL;

-- Step 14: Update existing messages to ensure they have proper data
-- Set session_id for any messages that might be missing it
UPDATE public.chat_messages 
SET session_id = (
    SELECT id FROM public.chat_sessions 
    WHERE user_id = chat_messages.user_id 
    ORDER BY created_at ASC 
    LIMIT 1
)
WHERE session_id IS NULL;

-- Step 15: Verify schema integrity
-- Check that all required columns exist and have proper constraints
DO $$
BEGIN
    -- Verify chat_messages table structure
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        RAISE EXCEPTION 'chat_messages table schema is incomplete';
    END IF;
    
    -- Verify chat_sessions table structure
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_sessions' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        RAISE EXCEPTION 'chat_sessions table schema is incomplete';
    END IF;
    
    RAISE NOTICE 'Chat history schema verification completed successfully';
END $$;

-- Step 16: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT USAGE ON SEQUENCE public.chat_messages_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.chat_sessions_id_seq TO authenticated;

-- Step 17: Final verification
SELECT 
    'chat_messages' as table_name,
    COUNT(*) as message_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users
FROM public.chat_messages
UNION ALL
SELECT 
    'chat_sessions' as table_name,
    COUNT(*) as message_count,
    COUNT(DISTINCT id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users
FROM public.chat_sessions;

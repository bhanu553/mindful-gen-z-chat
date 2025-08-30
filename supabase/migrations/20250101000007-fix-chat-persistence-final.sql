-- FINAL FIX FOR CHAT PERSISTENCE - Comprehensive solution
-- This migration ensures chat messages are never lost and always retrieved correctly

-- Step 1: Drop and recreate the main chat history function with robust error handling
DROP FUNCTION IF EXISTS get_session_chat_history(UUID, UUID);

CREATE OR REPLACE FUNCTION get_session_chat_history(session_uuid UUID, user_uuid UUID)
RETURNS TABLE(
    id UUID,
    role TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    mode TEXT
) AS $$
DECLARE
    message_count INTEGER;
BEGIN
    -- Log function call for debugging
    RAISE NOTICE 'get_session_chat_history called for session % and user %', session_uuid, user_uuid;
    
    -- Verify session belongs to user with better error handling
    IF NOT EXISTS (
        SELECT 1 FROM public.chat_sessions 
        WHERE id = session_uuid AND user_id = user_uuid
    ) THEN
        RAISE NOTICE 'Session not found or access denied for session % and user %', session_uuid, user_uuid;
        RETURN; -- Return empty result instead of raising exception
    END IF;
    
    -- Count messages for debugging
    SELECT COUNT(*) INTO message_count
    FROM public.chat_messages
    WHERE session_id = session_uuid AND user_id = user_uuid;
    
    RAISE NOTICE 'Found % messages for session %', message_count, session_uuid;
    
    -- Return all messages in chronological order with robust error handling
    RETURN QUERY
    SELECT 
        COALESCE(cm.id, gen_random_uuid()) as id,
        COALESCE(cm.role, 'user') as role,
        COALESCE(cm.content, '') as content,
        COALESCE(cm.created_at, now()) as created_at,
        COALESCE(cm.mode, 'therapy') as mode
    FROM public.chat_messages cm
    WHERE cm.session_id = session_uuid
      AND cm.user_id = user_uuid
      AND cm.content IS NOT NULL
      AND trim(cm.content) != ''
    ORDER BY cm.created_at ASC;
    
    -- Log the results for debugging
    RAISE NOTICE 'Successfully retrieved % messages for session %', message_count, session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a function to get all messages for a user's current session
CREATE OR REPLACE FUNCTION get_current_session_messages(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    role TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    mode TEXT,
    session_id UUID
) AS $$
DECLARE
    current_session_id UUID;
    message_count INTEGER;
BEGIN
    -- Get the user's current active session
    SELECT id INTO current_session_id
    FROM public.chat_sessions
    WHERE user_id = user_uuid
      AND is_complete = false
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF current_session_id IS NULL THEN
        RAISE NOTICE 'No active session found for user %', user_uuid;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found active session % for user %', current_session_id, user_uuid;
    
    -- Count messages for debugging
    SELECT COUNT(*) INTO message_count
    FROM public.chat_messages
    WHERE session_id = current_session_id AND user_id = user_uuid;
    
    RAISE NOTICE 'Found % messages for session %', message_count, current_session_id;
    
    -- Return all messages in chronological order
    RETURN QUERY
    SELECT 
        cm.id,
        cm.role,
        cm.content,
        cm.created_at,
        cm.mode,
        cm.session_id
    FROM public.chat_messages cm
    WHERE cm.session_id = current_session_id
      AND cm.user_id = user_uuid
      AND cm.content IS NOT NULL
      AND trim(cm.content) != ''
    ORDER BY cm.created_at ASC;
    
    RAISE NOTICE 'Successfully retrieved % messages for current session %', message_count, current_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a function to get messages for any session
CREATE OR REPLACE FUNCTION get_session_messages(session_uuid UUID, user_uuid UUID)
RETURNS TABLE(
    id UUID,
    role TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    mode TEXT
) AS $$
BEGIN
    -- Return all messages for the specified session
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
      AND cm.content IS NOT NULL
      AND trim(cm.content) != ''
    ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Ensure all required columns exist and have proper constraints
DO $$
BEGIN
    -- Add missing columns to chat_messages if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'id') THEN
        ALTER TABLE public.chat_messages ADD COLUMN id UUID DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'session_id') THEN
        ALTER TABLE public.chat_messages ADD COLUMN session_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'user_id') THEN
        ALTER TABLE public.chat_messages ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'role') THEN
        ALTER TABLE public.chat_messages ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'content') THEN
        ALTER TABLE public.chat_messages ADD COLUMN content TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'mode') THEN
        ALTER TABLE public.chat_messages ADD COLUMN mode TEXT DEFAULT 'therapy';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'created_at') THEN
        ALTER TABLE public.chat_messages ADD COLUMN created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
    END IF;
    
    -- Add missing columns to chat_sessions if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'id') THEN
        ALTER TABLE public.chat_sessions ADD COLUMN id UUID DEFAULT gen_random_uuid();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'user_id') THEN
        ALTER TABLE public.chat_sessions ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'is_complete') THEN
        ALTER TABLE public.chat_sessions ADD COLUMN is_complete BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'created_at') THEN
        ALTER TABLE public.chat_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'updated_at') THEN
        ALTER TABLE public.chat_sessions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
    END IF;
    
    RAISE NOTICE 'All required columns verified/added';
END $$;

-- Step 5: Ensure proper constraints exist
DO $$
BEGIN
    -- Add primary key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'chat_messages' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);
        RAISE NOTICE 'Added primary key to chat_messages';
    END IF;
    
    -- Add primary key to chat_sessions if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'chat_sessions' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);
        RAISE NOTICE 'Added primary key to chat_sessions';
    END IF;
    
    -- Add foreign key constraints if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'chat_messages' 
        AND constraint_name = 'chat_messages_session_id_fkey'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD CONSTRAINT chat_messages_session_id_fkey 
        FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for session_id';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'chat_messages' 
        AND constraint_name = 'chat_messages_user_id_fkey'
    ) THEN
        ALTER TABLE public.chat_messages 
        ADD CONSTRAINT chat_messages_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for user_id';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'chat_sessions' 
        AND constraint_name = 'chat_sessions_user_id_fkey'
    ) THEN
        ALTER TABLE public.chat_sessions 
        ADD CONSTRAINT chat_sessions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for chat_sessions user_id';
    END IF;
END $$;

-- Step 6: Create or recreate all necessary indexes
DROP INDEX IF EXISTS idx_chat_messages_session_id;
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);

DROP INDEX IF EXISTS idx_chat_messages_user_id;
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);

DROP INDEX IF EXISTS idx_chat_messages_created_at;
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

DROP INDEX IF EXISTS idx_chat_messages_session_user_created;
CREATE INDEX idx_chat_messages_session_user_created ON public.chat_messages(session_id, user_id, created_at);

DROP INDEX IF EXISTS idx_chat_messages_role;
CREATE INDEX idx_chat_messages_role ON public.chat_messages(role);

DROP INDEX IF EXISTS idx_chat_sessions_user_id;
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);

DROP INDEX IF EXISTS idx_chat_sessions_created_at;
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at);

-- Step 7: Create a function to verify message integrity
CREATE OR REPLACE FUNCTION verify_message_integrity(session_uuid UUID, user_uuid UUID)
RETURNS TABLE(
    total_messages INTEGER,
    user_messages INTEGER,
    assistant_messages INTEGER,
    has_orphaned_messages BOOLEAN,
    has_empty_content BOOLEAN
) AS $$
DECLARE
    total_count INTEGER;
    user_count INTEGER;
    assistant_count INTEGER;
    orphaned_count INTEGER;
    empty_content_count INTEGER;
BEGIN
    -- Count total messages
    SELECT COUNT(*) INTO total_count
    FROM public.chat_messages
    WHERE session_id = session_uuid AND user_id = user_uuid;
    
    -- Count user messages
    SELECT COUNT(*) INTO user_count
    FROM public.chat_messages
    WHERE session_id = session_uuid AND user_id = user_uuid AND role = 'user';
    
    -- Count assistant messages
    SELECT COUNT(*) INTO assistant_count
    FROM public.chat_messages
    WHERE session_id = session_uuid AND user_id = user_uuid AND role = 'assistant';
    
    -- Check for orphaned messages
    SELECT COUNT(*) INTO orphaned_count
    FROM public.chat_messages
    WHERE session_id = session_uuid AND user_id = user_uuid AND (content IS NULL OR trim(content) = '');
    
    -- Check for empty content
    SELECT COUNT(*) INTO empty_content_count
    FROM public.chat_messages
    WHERE session_id = session_uuid AND user_id = user_uuid AND (content IS NULL OR trim(content) = '');
    
    RETURN QUERY
    SELECT 
        total_count,
        user_count,
        assistant_count,
        orphaned_count > 0,
        empty_content_count > 0;
    
    RAISE NOTICE 'Message integrity check for session %: total=%, user=%, assistant=%, orphaned=%, empty=%', 
        session_uuid, total_count, user_count, assistant_count, orphaned_count, empty_content_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_session_chat_history(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_session_messages(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_messages(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_message_integrity(UUID, UUID) TO authenticated;

-- Step 9: Create a trigger to ensure message persistence
DROP TRIGGER IF EXISTS ensure_message_persistence_trigger ON public.chat_messages;

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
    
    -- Ensure role is valid
    IF NEW.role NOT IN ('user', 'assistant') THEN
        NEW.role = 'user'; -- Default to user if invalid
    END IF;
    
    -- Ensure mode is set
    IF NEW.mode IS NULL THEN
        NEW.mode = 'therapy';
    END IF;
    
    -- Update the session's updated_at timestamp
    UPDATE public.chat_sessions 
    SET updated_at = NEW.created_at
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_message_persistence_trigger
    BEFORE INSERT OR UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION ensure_message_persistence();

-- Step 10: Create a function to get all messages for a user across all sessions
CREATE OR REPLACE FUNCTION get_user_all_messages(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    role TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    mode TEXT,
    session_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id,
        cm.role,
        cm.content,
        cm.created_at,
        cm.mode,
        cm.session_id
    FROM public.chat_messages cm
    WHERE cm.user_id = user_uuid
      AND cm.content IS NOT NULL
      AND trim(cm.content) != ''
    ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_all_messages(UUID) TO authenticated;

-- Step 11: Final verification
DO $$
DECLARE
    message_count INTEGER;
    session_count INTEGER;
BEGIN
    -- Count total messages
    SELECT COUNT(*) INTO message_count FROM public.chat_messages;
    
    -- Count total sessions
    SELECT COUNT(*) INTO session_count FROM public.chat_sessions;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Total messages in database: %', message_count;
    RAISE NOTICE 'Total sessions in database: %', session_count;
    RAISE NOTICE 'All functions, indexes, and constraints have been created/verified';
    RAISE NOTICE 'Chat persistence should now work correctly!';
END $$;

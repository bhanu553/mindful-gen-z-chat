-- FIX CHAT HISTORY PERSISTENCE - Ensure messages are never lost
-- This migration addresses the disappearing chat issue by improving message storage and retrieval

-- Step 1: Create a robust function to get complete chat history with error handling
CREATE OR REPLACE FUNCTION get_session_chat_history_robust(session_uuid UUID, user_uuid UUID)
RETURNS TABLE(
    id UUID,
    role TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    mode TEXT
) AS $$
BEGIN
    -- Verify session belongs to user with better error handling
    IF NOT EXISTS (
        SELECT 1 FROM public.chat_sessions 
        WHERE id = session_uuid AND user_id = user_uuid
    ) THEN
        RAISE NOTICE 'Session not found or access denied for session % and user %', session_uuid, user_uuid;
        RETURN; -- Return empty result instead of raising exception
    END IF;
    
    -- Return all messages in chronological order with error handling
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
    RAISE NOTICE 'Retrieved % messages for session %', (SELECT COUNT(*) FROM public.chat_messages WHERE session_id = session_uuid AND user_id = user_uuid), session_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a function to ensure message persistence
CREATE OR REPLACE FUNCTION ensure_message_persistence_robust()
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create a function to recover orphaned messages
CREATE OR REPLACE FUNCTION recover_orphaned_messages()
RETURNS INTEGER AS $$
DECLARE
    recovered_count INTEGER := 0;
    orphaned_message RECORD;
BEGIN
    -- Find messages without session_id and try to assign them
    FOR orphaned_message IN 
        SELECT cm.id, cm.user_id, cm.created_at
        FROM public.chat_messages cm
        WHERE cm.session_id IS NULL
          AND cm.user_id IS NOT NULL
    LOOP
        -- Try to find a session for this user around the message time
        UPDATE public.chat_messages 
        SET session_id = (
            SELECT cs.id 
            FROM public.chat_sessions cs 
            WHERE cs.user_id = orphaned_message.user_id
              AND cs.created_at <= orphaned_message.created_at
              AND (cs.ended_at IS NULL OR cs.ended_at >= orphaned_message.created_at)
            ORDER BY cs.created_at DESC 
            LIMIT 1
        )
        WHERE id = orphaned_message.id;
        
        IF FOUND THEN
            recovered_count := recovered_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Recovered % orphaned messages', recovered_count;
    RETURN recovered_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create a function to verify chat history integrity
CREATE OR REPLACE FUNCTION verify_chat_history_integrity(user_uuid UUID)
RETURNS TABLE(
    session_id UUID,
    message_count INTEGER,
    has_user_messages BOOLEAN,
    has_assistant_messages BOOLEAN,
    first_message_time TIMESTAMPTZ,
    last_message_time TIMESTAMPTZ,
    integrity_status TEXT
) AS $$
DECLARE
    session_record RECORD;
    user_msg_count INTEGER;
    assistant_msg_count INTEGER;
    first_msg_time TIMESTAMPTZ;
    last_msg_time TIMESTAMPTZ;
BEGIN
    FOR session_record IN 
        SELECT cs.id, cs.created_at, cs.ended_at
        FROM public.chat_sessions cs
        WHERE cs.user_id = user_uuid
        ORDER BY cs.created_at DESC
    LOOP
        -- Count messages by role
        SELECT 
            COUNT(*) FILTER (WHERE role = 'user'),
            COUNT(*) FILTER (WHERE role = 'assistant'),
            MIN(created_at),
            MAX(created_at)
        INTO user_msg_count, assistant_msg_count, first_msg_time, last_msg_time
        FROM public.chat_messages
        WHERE session_id = session_record.id AND user_id = user_uuid;
        
        -- Determine integrity status
        DECLARE
            status TEXT;
        BEGIN
            IF user_msg_count = 0 AND assistant_msg_count = 0 THEN
                status := 'NO_MESSAGES';
            ELSIF user_msg_count = 0 THEN
                status := 'ONLY_AI_MESSAGES';
            ELSIF assistant_msg_count = 0 THEN
                status := 'ONLY_USER_MESSAGES';
            ELSIF user_msg_count > 0 AND assistant_msg_count > 0 THEN
                status := 'COMPLETE';
            ELSE
                status := 'UNKNOWN';
            END IF;
            
            RETURN QUERY SELECT 
                session_record.id,
                (user_msg_count + assistant_msg_count),
                (user_msg_count > 0),
                (assistant_msg_count > 0),
                first_msg_time,
                last_msg_time,
                status;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create indexes for better message retrieval performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_user_role 
ON public.chat_messages(session_id, user_id, role);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created 
ON public.chat_messages(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_content_not_empty 
ON public.chat_messages(session_id, user_id) WHERE content IS NOT NULL AND trim(content) != '';

-- Step 6: Create a trigger to log message operations for debugging
CREATE OR REPLACE FUNCTION log_message_operations()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        RAISE NOTICE 'INSERT: New message % for session % user %', NEW.id, NEW.session_id, NEW.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        RAISE NOTICE 'UPDATE: Modified message % for session % user %', NEW.id, NEW.session_id, NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        RAISE NOTICE 'DELETE: Deleted message % for session % user %', OLD.id, OLD.session_id, OLD.user_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 7: Apply the trigger (optional - for debugging)
-- DROP TRIGGER IF EXISTS log_message_operations_trigger ON public.chat_messages;
-- CREATE TRIGGER log_message_operations_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON public.chat_messages
--     FOR EACH ROW
--     EXECUTE FUNCTION log_message_operations();

-- Step 8: Update existing trigger to use the robust version
DROP TRIGGER IF EXISTS ensure_message_persistence_trigger ON public.chat_messages;
CREATE TRIGGER ensure_message_persistence_trigger
    BEFORE INSERT OR UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION ensure_message_persistence_robust();

-- Step 9: Run recovery function to fix any existing orphaned messages
SELECT recover_orphaned_messages();

-- Step 10: Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_session_chat_history_robust(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recover_orphaned_messages() TO authenticated;
GRANT EXECUTE ON FUNCTION verify_chat_history_integrity(UUID) TO authenticated;

-- Step 11: Final verification
DO $$
DECLARE
    total_messages INTEGER;
    total_sessions INTEGER;
    orphaned_messages INTEGER;
BEGIN
    -- Count total messages
    SELECT COUNT(*) INTO total_messages FROM public.chat_messages;
    
    -- Count total sessions
    SELECT COUNT(*) INTO total_sessions FROM public.chat_sessions;
    
    -- Count orphaned messages
    SELECT COUNT(*) INTO orphaned_messages 
    FROM public.chat_messages 
    WHERE session_id IS NULL;
    
    RAISE NOTICE 'Chat history migration completed:';
    RAISE NOTICE 'Total messages: %', total_messages;
    RAISE NOTICE 'Total sessions: %', total_sessions;
    RAISE NOTICE 'Orphaned messages: %', orphaned_messages;
    
    IF orphaned_messages > 0 THEN
        RAISE NOTICE 'Running orphaned message recovery...';
        PERFORM recover_orphaned_messages();
    END IF;
END $$;

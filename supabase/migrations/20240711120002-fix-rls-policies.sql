-- Enable RLS on tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for chat_sessions - users can access their own sessions
CREATE POLICY "Users can access their own chat sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Create policy for chat_messages - users can access their own messages
CREATE POLICY "Users can access their own chat messages" ON chat_messages
    FOR ALL USING (auth.uid() = user_id);

-- If policies already exist, drop them first
DROP POLICY IF EXISTS "Users can access their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can access their own chat messages" ON chat_messages;

-- Recreate the policies
CREATE POLICY "Users can access their own chat sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own chat messages" ON chat_messages
    FOR ALL USING (auth.uid() = user_id); 
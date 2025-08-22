import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const userId = url.searchParams.get('userId'); // Add userId for authentication
    
    if (!sessionId) {
      return Response.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📋 Fetching messages for session:', sessionId, 'user:', userId);

    // First verify the session belongs to this user
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      console.error('❌ Session not found or access denied:', sessionError);
      return Response.json({ 
        error: 'Session not found or access denied',
        details: sessionError?.message || 'Session validation failed'
      }, { status: 403 });
    }

    console.log('✅ Session validated for user:', userId);
    
    // Fetch all messages for this session from Supabase
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, mode, created_at')
      .eq('session_id', sessionId)
      .eq('user_id', userId) // Ensure user can only access their own messages
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching messages:', error);
      return Response.json({ 
        error: 'Failed to fetch messages',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Found messages:', messages?.length || 0);
    
    // Return all messages for the session
    return Response.json({ 
      messages: messages || [],
      sessionId: sessionId,
      userId: userId
    });

  } catch (error) {
    console.error('❌ Error in /api/messages:', error);
    return Response.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}

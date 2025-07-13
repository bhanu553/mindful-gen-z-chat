
import { authenticateUser, setCorsHeaders } from '../auth/middleware.js';

export default async function handler(req, res) {
  console.log('🧪 Test Flow API called');
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { testMessage = "I want to heal from my past." } = req.body;
  const logs = [];
  const addLog = (message) => {
    console.log(message);
    logs.push(`${new Date().toISOString()}: ${message}`);
  };

  try {
    addLog('🧪 Starting end-to-end test simulation');
    
    // Step 1: Authenticate user
    addLog('🔐 Step 1: Authenticating user...');
    const auth = await authenticateUser(req);
    if (auth.error) {
      addLog(`❌ Authentication failed: ${auth.error}`);
      return res.status(auth.status).json({ error: auth.error, logs });
    }
    
    const { user, supabase } = auth;
    addLog(`✅ User authenticated: ${user.id}`);

    // Step 2: Create session
    addLog('📝 Step 2: Creating session...');
    const sessionData = {
      user_id: user.id,
      title: 'Test Session',
      current_mode: 'reflect',
      message_count: 0
    };
    
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      addLog(`❌ Session creation failed: ${JSON.stringify(sessionError)}`);
      return res.status(500).json({ 
        error: 'Session creation failed', 
        details: sessionError,
        logs 
      });
    }

    addLog(`✅ Session created: ${session.id}`);

    // Step 3: Save user message
    addLog('💬 Step 3: Saving user message...');
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: user.id,
        content: testMessage,
        role: 'user',
        mode: 'reflect'
      });

    if (userMsgError) {
      addLog(`❌ User message save failed: ${JSON.stringify(userMsgError)}`);
      return res.status(500).json({ 
        error: 'User message save failed',
        details: userMsgError,
        logs
      });
    }

    addLog('✅ User message saved');

    // Step 4: Simulate AI response
    addLog('🤖 Step 4: Simulating AI response...');
    const aiResponse = "Thank you for sharing that with me. Healing from the past is a brave journey, and I'm here to support you through it. What aspects of your past feel most important to address right now?";

    // Step 5: Save AI message
    addLog('💾 Step 5: Saving AI message...');
    const { error: aiMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: user.id,
        content: aiResponse,
        role: 'assistant',
        mode: 'reflect'
      });

    if (aiMsgError) {
      addLog(`❌ AI message save failed: ${JSON.stringify(aiMsgError)}`);
      return res.status(500).json({ 
        error: 'AI message save failed',
        details: aiMsgError,
        logs
      });
    }

    addLog('✅ AI message saved');

    // Step 6: Update session
    addLog('📊 Step 6: Updating session...');
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ message_count: 1 })
      .eq('id', session.id);

    if (updateError) {
      addLog(`⚠️ Session update failed: ${JSON.stringify(updateError)}`);
    } else {
      addLog('✅ Session updated');
    }

    // Step 7: Verify messages
    addLog('🔍 Step 7: Verifying messages...');
    const { data: messages, error: fetchError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (fetchError) {
      addLog(`❌ Message fetch failed: ${JSON.stringify(fetchError)}`);
    } else {
      addLog(`✅ Messages verified: ${messages.length} messages found`);
    }

    addLog('🎉 End-to-end test completed successfully');

    return res.status(200).json({
      success: true,
      session,
      messages: messages || [],
      testMessage,
      aiResponse,
      logs
    });

  } catch (error) {
    addLog(`❌ Unexpected error: ${error.message}`);
    console.error('❌ Test flow error:', error);
    return res.status(500).json({ 
      error: 'Test failed', 
      message: error.message,
      logs
    });
  }
}

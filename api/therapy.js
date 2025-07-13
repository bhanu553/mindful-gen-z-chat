
import { authenticateUser, setCorsHeaders } from './auth/middleware.js';
import { checkDailyLimit } from './utils/dailyLimits.js';
import { detectOptimalMode, getSystemPrompt } from './utils/modeDetection.js';
import { calculateSentiment } from './utils/sentiment.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  console.log('🚀 Unified therapy API called');
  console.log('📋 Method:', req.method);
  console.log('📋 Query:', JSON.stringify(req.query, null, 2));
  
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  const { action } = req.query;
  console.log('🎯 Action requested:', action);

  // Authenticate user for all actions
  console.log('🔐 Starting authentication...');
  const auth = await authenticateUser(req);
  if (auth.error) {
    console.error('❌ Authentication failed:', auth.error);
    return res.status(auth.status).json({ error: auth.error });
  }

  const { user, supabase } = auth;
  console.log('✅ User authenticated:', { id: user.id, email: user.email });

  try {
    switch (action) {
      case 'createSession':
        return await handleCreateSession(req, res, user, supabase);
      case 'sendMessage':
        return await handleSendMessage(req, res, user, supabase);
      case 'getSessions':
        return await handleGetSessions(req, res, user, supabase);
      case 'getMessages':
        return await handleGetMessages(req, res, user, supabase);
      case 'getUserStats':
        return await handleGetUserStats(req, res, user, supabase);
      default:
        console.error('❌ Unknown action:', action);
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('❌ Unified API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

async function handleCreateSession(req, res, user, supabase) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('📝 Creating new session...');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  const { title, mode = 'reflect' } = req.body;

  const sessionData = {
    user_id: user.id,
    title: title || 'New Therapy Session',
    current_mode: mode,
    message_count: 0
  };
  
  console.log('📊 Session data to insert:', JSON.stringify(sessionData, null, 2));

  const { data: session, error } = await supabase
    .from('chat_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) {
    console.error('❌ Supabase error creating session:', JSON.stringify(error, null, 2));
    return res.status(500).json({ 
      error: 'Failed to create session',
      details: error.message 
    });
  }

  console.log('✅ Session created successfully:', JSON.stringify(session, null, 2));
  
  return res.status(201).json({ 
    session,
    debug: {
      userId: user.id,
      sessionId: session.id,
      title: session.title,
      mode: session.current_mode
    }
  });
}

async function handleSendMessage(req, res, user, supabase) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('📝 Sending message...');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  const { message, sessionId, mode } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    console.error('❌ Invalid message:', { message, type: typeof message });
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!sessionId) {
    console.error('❌ Missing sessionId');
    return res.status(400).json({ error: 'Session ID is required' });
  }

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API key not configured');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  // Check daily message limit
  console.log('📊 Checking daily limits...');
  const limitCheck = await checkDailyLimit(supabase, user.id);
  if (limitCheck.error) {
    console.error('❌ Daily limit check failed:', limitCheck.error);
    return res.status(limitCheck.status).json({ error: limitCheck.error });
  }
  
  if (limitCheck.isLimitReached) {
    console.log('⚠️ Daily limit reached for user:', user.id);
    return res.status(429).json({ 
      error: "You've reached the daily message limit for free users.",
      remainingMessages: 0
    });
  }

  // Verify session exists and belongs to user
  console.log('🔍 Verifying session exists...');
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    console.error('❌ Session not found:', sessionError);
    return res.status(404).json({ error: 'Session not found' });
  }

  // Detect optimal mode
  const detectedMode = mode || detectOptimalMode(message);
  console.log('🧠 Mode Detection:', { originalMode: mode, detectedMode });

  // Get recent message history
  console.log('📚 Fetching message history...');
  const { data: recentMessages, error: historyError } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (historyError) {
    console.error('⚠️ Error fetching message history:', historyError);
  }

  // Prepare conversation history
  const conversationHistory = (recentMessages || [])
    .reverse()
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));

  // Get system prompt and call OpenAI
  const systemPrompt = getSystemPrompt(detectedMode);
  const openAIMessages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: message }
  ];

  console.log('🤖 Making OpenAI API call...');
  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: openAIMessages,
      temperature: 0.8,
      max_tokens: 500,
      stream: false
    }),
  });

  if (!openAIResponse.ok) {
    const errorText = await openAIResponse.text();
    console.error('❌ OpenAI API error:', errorText);
    return res.status(500).json({ error: 'AI service temporarily unavailable' });
  }

  const openAIData = await openAIResponse.json();
  const aiReply = openAIData.choices[0].message.content;
  console.log('✅ OpenAI response received');

  // Calculate sentiment and save messages
  const sentimentScore = calculateSentiment(message);

  // Save user message
  const { error: userMessageError } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      content: message,
      role: 'user',
      mode: detectedMode,
      sentiment_score: sentimentScore
    });

  if (userMessageError) {
    console.error('❌ Error saving user message:', userMessageError);
    return res.status(500).json({ error: 'Failed to save user message' });
  }

  // Save AI reply
  const { error: aiMessageError } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      content: aiReply,
      role: 'assistant',
      mode: detectedMode
    });

  if (aiMessageError) {
    console.error('❌ Error saving AI message:', aiMessageError);
    return res.status(500).json({ error: 'Failed to save AI response' });
  }

  // Update session
  await supabase
    .from('chat_sessions')
    .update({ 
      message_count: session.message_count + 1,
      current_mode: detectedMode
    })
    .eq('id', sessionId)
    .eq('user_id', user.id);

  console.log('✅ Message exchange completed successfully');

  return res.status(200).json({
    reply: aiReply,
    mode: detectedMode,
    sessionId: sessionId,
    remainingMessages: Math.max(0, 50 - (limitCheck.messageCount + 1))
  });
}

async function handleGetSessions(req, res, user, supabase) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('id, title, current_mode, message_count, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }

  return res.status(200).json({ sessions: sessions || [] });
}

async function handleGetMessages(req, res, user, supabase) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  // Verify session belongs to user
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, mode, sentiment_score, created_at')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }

  return res.status(200).json({ messages: messages || [] });
}

async function handleGetUserStats(req, res, user, supabase) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfNextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  // Get daily message count
  const { count: messageCount, error: messageError } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('role', 'user')
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', startOfNextDay.toISOString());
    
  if (messageError) {
    console.error('Error fetching message count:', messageError);
    return res.status(500).json({ error: 'Failed to fetch usage data' });
  }
  
  // Get total sessions
  const { count: sessionCount, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id);
    
  if (sessionError) {
    console.error('Error fetching session count:', sessionError);
    return res.status(500).json({ error: 'Failed to fetch session data' });
  }
  
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single();
    
  const isPremium = profile?.is_premium || false;
  const maxMessages = isPremium ? 300 : 50;
  
  return res.status(200).json({
    messagesUsedToday: messageCount || 0,
    remainingMessages: Math.max(0, maxMessages - (messageCount || 0)),
    totalSessions: sessionCount || 0,
    isPremium
  });
}

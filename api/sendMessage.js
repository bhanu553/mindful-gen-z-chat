import { authenticateUser, setCorsHeaders } from './auth/middleware.js';
import { checkDailyLimit } from './utils/dailyLimits.js';
import { detectOptimalMode, getSystemPrompt } from './utils/modeDetection.js';
import { calculateSentiment } from './utils/sentiment.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const auth = await authenticateUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const { user, supabase } = auth;
  const { message, sessionId, mode } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API key not configured');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  try {
    console.log('🚀 Processing message for session:', sessionId);

    // Check daily message limit
    const limitCheck = await checkDailyLimit(supabase, user.id);
    if (limitCheck.error) {
      return res.status(limitCheck.status).json({ error: limitCheck.error });
    }
    
    if (limitCheck.isLimitReached) {
      return res.status(429).json({ 
        error: "You've reached the daily message limit for free users.",
        remainingMessages: 0
      });
    }

    // Verify session exists and belongs to user
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

    // Detect optimal mode from message content
    const detectedMode = mode || detectOptimalMode(message);
    console.log('🧠 Mode Detection:', detectedMode);

    // Get recent message history for context (last 10 messages)
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

    // Prepare conversation history for OpenAI (reverse to get chronological order)
    const conversationHistory = (recentMessages || [])
      .reverse()
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    // Get system prompt for detected mode
    const systemPrompt = getSystemPrompt(detectedMode);

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🤖 Making OpenAI API call with', openAIMessages.length, 'messages');

    // Call OpenAI GPT-4o
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
      console.error('❌ OpenAI API error:', openAIResponse.status, errorText);
      return res.status(500).json({ error: 'AI service temporarily unavailable' });
    }

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', openAIData);
      return res.status(500).json({ error: 'Invalid AI response' });
    }

    const aiReply = openAIData.choices[0].message.content;
    console.log('✅ OpenAI response received:', aiReply.substring(0, 100) + '...');

    // Calculate sentiment score for user message
    const sentimentScore = calculateSentiment(message);

    // Save user message to database
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

    // Save AI reply to database
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

    // Update session message count and mode
    await supabase
      .from('chat_sessions')
      .update({ 
        message_count: session.message_count + 1,
        current_mode: detectedMode
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    console.log('✅ Message exchange completed successfully');

    // Return the AI response
    return res.status(200).json({
      reply: aiReply,
      mode: detectedMode,
      sessionId: sessionId,
      remainingMessages: Math.max(0, 50 - (limitCheck.messageCount + 1))
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
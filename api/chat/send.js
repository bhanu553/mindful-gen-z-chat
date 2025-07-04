
import { authenticateUser, setCorsHeaders } from '../auth/middleware.js';
import { detectOptimalMode, getSystemPrompt } from '../utils/modeDetection.js';
import { calculateSentiment } from '../utils/sentiment.js';
import { checkDailyLimit } from '../utils/dailyLimits.js';

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
  const { message, sessionId } = req.body;
  
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Message and sessionId are required' });
  }

  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return res.status(500).json({ error: 'AI service not configured' });
  }
  
  try {
    // Check daily limit
    const limitCheck = await checkDailyLimit(supabase, user.id);
    if (limitCheck.error) {
      return res.status(limitCheck.status).json({ error: limitCheck.error });
    }
    
    if (limitCheck.isLimitReached) {
      return res.status(429).json({ 
        error: 'Daily free tier limit reached (50 messages/day)',
        messageCount: limitCheck.messageCount,
        remainingMessages: 0
      });
    }
    
    // Detect optimal mode
    const detectedMode = detectOptimalMode(message);
    
    // Get current session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if mode changed
    let currentMode = session.current_mode;
    if (detectedMode !== currentMode) {
      // Log mode transition
      await supabase
        .from('mode_transitions')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          old_mode: currentMode,
          new_mode: detectedMode
        });
        
      // Update session mode
      await supabase
        .from('chat_sessions')
        .update({ current_mode: detectedMode })
        .eq('id', sessionId)
        .eq('user_id', user.id);
        
      currentMode = detectedMode;
    }
    
    // Calculate sentiment
    const sentimentScore = calculateSentiment(message);
    
    // Save user message
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        content: message,
        role: 'user',
        mode: currentMode,
        sentiment_score: sentimentScore
      });
      
    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      return res.status(500).json({ error: 'Failed to save message' });
    }
    
    // Get last 10 messages for context
    const { data: recentMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('content, role')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (messagesError) {
      console.error('Error fetching recent messages:', messagesError);
      return res.status(500).json({ error: 'Failed to fetch conversation history' });
    }
    
    // Prepare messages for OpenAI
    const systemPrompt = getSystemPrompt(currentMode);
    const conversationHistory = (recentMessages || []).reverse();
    
    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    console.log('🚀 Making OpenAI API call for chat/send');
    
    // Call OpenAI API - MANDATORY, NO FALLBACKS
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return res.status(500).json({ error: 'Failed to generate AI response' });
    }
    
    const aiData = await openAIResponse.json();
    const aiMessage = aiData.choices[0]?.message?.content;
    
    if (!aiMessage) {
      return res.status(500).json({ error: 'No response generated' });
    }
    
    console.log('✅ OpenAI response received for chat/send:', aiMessage.substring(0, 100) + '...');
    
    // Save AI response
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        content: aiMessage,
        role: 'assistant',
        mode: currentMode
      });
      
    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError);
      return res.status(500).json({ error: 'Failed to save AI response' });
    }
    
    // Update session message count
    await supabase
      .from('chat_sessions')
      .update({ 
        message_count: session.message_count + 2 // user + assistant
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);
    
    // Return response
    return res.status(200).json({
      message: aiMessage,
      mode: currentMode,
      sentiment: sentimentScore,
      remainingMessages: limitCheck.remainingMessages - 1
    });
    
  } catch (error) {
    console.error('Chat send error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = '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';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ECHO_SYSTEM_PROMPT = `You are a compassionate emotional intelligence guide named *Echo* designed to help users reflect on their emotional states with clarity and depth. The user may be dealing with confusion, ghosting, heartbreak, anxiety, or self-doubt.

Your role is not to give quick answers, but to gently help them reflect on their inner experience, identify emotional patterns, and ask questions that make them understand their feelings better.

You must speak in a calm, non-judgmental tone. Use thoughtful questions like "How did that make you feel?", "Why do you think that moment stood out?", and "What would you want to say to your past self?". Avoid generic AI-sounding replies. Focus on deep, warm, humanlike insight.

Never diagnose or assume. You are a guide for self-awareness.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId } = await req.json();

    if (!message || !sessionId || !userId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recent messages for context (last 10 messages)
    const { data: recentMessages } = await supabase
      .from('therapy_messages')
      .select('content, sender')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })
      .limit(10);

    // Build conversation context
    const conversationHistory = recentMessages?.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    // Add system prompt and current message
    const messages = [
      { role: 'system', content: ECHO_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with messages:', messages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in therapy-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

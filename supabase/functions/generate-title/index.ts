
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = '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';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('No messages provided');
    }

    const conversationText = messages.join(' ');
    
    const prompt = `Based on this therapy conversation in ${mode} mode, generate a meaningful, empathetic 2-3 word title that captures the core emotional theme. Examples: "Ghosting Recovery", "Self-Worth Journey", "Healing Heartbreak", "Anxiety Clarity", "Trust Rebuilding".

Conversation: "${conversationText}"

Title:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let title = data.choices[0].message.content.trim();
    
    // Clean up the title (remove quotes, ensure proper length)
    title = title.replace(/['"]/g, '').trim();
    
    // Ensure it's not too long
    if (title.length > 25) {
      title = title.substring(0, 25).trim();
    }

    return new Response(JSON.stringify({ 
      title,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating title:', error);
    
    // Return a fallback title
    const fallbacks = ['Reflection Session', 'Healing Journey', 'Growth Path', 'Inner Work'];
    const fallbackTitle = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    return new Response(JSON.stringify({ 
      title: fallbackTitle,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

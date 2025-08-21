
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Classifying message:', message);

    const classifyResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an emotion classification system for therapy sessions. Based on the user's message, identify which therapy mode they currently need:\n\n- Reflect: For processing thoughts, self-awareness, and understanding emotions\n- Recover: For healing from trauma, grief, or difficult experiences\n- Rebuild: For reconstructing self-esteem, relationships, or life structure after setbacks\n- Evolve: For personal growth, overcoming limitations, and reaching new potential\n\nOnly return one word: Reflect, Recover, Rebuild, or Evolve."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 10
      })
    });

    const classified = await classifyResponse.json();
    let mode = classified?.choices?.[0]?.message?.content?.trim();
    
    // Validate and fallback
    if (!["Reflect", "Recover", "Rebuild", "Evolve"].includes(mode)) {
      mode = "Reflect";
    }

    console.log('Classified mode:', mode);

    return new Response(
      JSON.stringify({ mode }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in classify-emotion function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to classify emotion', mode: 'Reflect' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

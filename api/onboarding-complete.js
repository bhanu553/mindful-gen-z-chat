import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImF1ZCI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k"
);

const THERAPY_PROMPT_TEMPLATE = `# EchoMind 6-Phase Therapy Process
...<your 6-phase prompt here>...`;

function formatOnboardingData(onboardingData) {
  // ...same as in chat.js...
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId } = req.body;
    if (!userId) {
      console.error('❌ No userId provided');
      return res.status(200).json({ success: true });
    }
    // Fetch onboarding data
    const { data: onboarding, error: onboardingError } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    if (onboardingError || !onboarding) {
      console.error('❌ Onboarding not found or error:', onboardingError);
      return res.status(200).json({ success: true });
    }
    // Format onboarding data
    let formattedOnboarding = '';
    if (!onboarding || typeof onboarding !== 'object') {
      formattedOnboarding = 'No onboarding data available. Please proceed with a welcoming, supportive first message.';
    } else {
      formattedOnboarding = formatOnboardingData(onboarding);
    }
    // Build prompt
    const analysisPrompt = THERAPY_PROMPT_TEMPLATE.replace(
      '{user_intake_form_here}',
      formattedOnboarding
    ) + '\n\n⚠️ IMPORTANT: Generate ONLY the initial therapeutic analysis and welcome message according to the therapy prompt structure above. Do NOT use any generic responses or default GPT behavior. Follow the therapy prompt exactly.';
    // Generate ai_analysis
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'OpenAI API key missing' });
    const openai = new OpenAI({ apiKey });
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: analysisPrompt },
        { role: 'user', content: 'Generate my initial therapeutic analysis and welcome message based on my onboarding form, following the therapy prompt structure exactly.' }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    const aiAnalysisRaw = analysisResponse.choices[0].message.content;
    const aiAnalysis = (aiAnalysisRaw && aiAnalysisRaw.trim() !== '' ? aiAnalysisRaw : 'Welcome to your first therapy session. Let\'s begin.')
      .split('\n')
      .filter(line => !line.match(/STEP [⿡⿢⿣]/) && !line.match(/\*\*STEP/) && !line.match(/STEP [0-9]+:/i))
      .join('\n');
    // Save ai_analysis to onboarding
    await supabase
      .from('user_onboarding')
      .update({ ai_analysis: aiAnalysis })
      .eq('user_id', userId)
      .eq('completed', true);
    // Save ai_analysis as first assistant message in chat history
    // Find or create session
    const { data: sessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    let session = sessions && sessions.length > 0 ? sessions[0] : null;
    if (!session) {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, is_complete: false, created_at: new Date().toISOString() })
        .select()
        .single();
      session = newSession;
    }
    // Only insert if not already present
    const { data: existingMessages } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('session_id', session.id)
      .eq('user_id', userId)
      .eq('role', 'assistant');
    if (!existingMessages || existingMessages.length === 0) {
      await supabase.from('chat_messages').insert({
        session_id: session.id,
        user_id: userId,
        content: aiAnalysis,
        role: 'assistant',
        mode: 'therapy',
        created_at: new Date().toISOString()
      });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error in onboarding-complete:', error);
    return res.status(200).json({ success: true });
  }
} 
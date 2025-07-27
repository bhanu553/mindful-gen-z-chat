import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImF1ZCI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k"
);

const THERAPY_PROMPT_TEMPLATE = `# EchoMind 6-Phase Therapy Process
...<your 6-phase prompt here>...`;

function formatOnboardingData(onboardingData) {
  if (!onboardingData) {
    return "No onboarding data available.";
  }

  const formatArray = (arr) => Array.isArray(arr) ? arr.join(", ") : arr;
  const formatBoolean = (bool) => bool ? "Yes" : "No";
  const formatRating = (rating) => rating ? `${rating}/10` : "Not specified";

  return `
MAIN ISSUE: ${onboardingData.primary_focus || "Not specified"}

**CLIENT INTAKE FORM ANALYSIS**

**Personal Information:**
- Name: ${onboardingData.full_name || "Not provided"}
- Age: ${onboardingData.age || "Not specified"}
- Gender: ${onboardingData.gender || "Not specified"}
- Email: ${onboardingData.email || "Not provided"}
- Phone: ${onboardingData.phone_number || "Not provided"}
- Country: ${onboardingData.country || "Not specified"}
- Timezone: ${onboardingData.timezone || "Not specified"}

**Main Reason for Seeking Therapy:**
- ${onboardingData.primary_focus || "Not specified"}

**Mental Health Background:**
- Previous therapy experience: ${formatBoolean(onboardingData.previous_therapy)}
- Current medication: ${formatBoolean(onboardingData.current_medication)}
- Mental health rating: ${formatRating(onboardingData.mental_health_rating)}
- Current crisis situation: ${formatBoolean(onboardingData.current_crisis)}

**Current Struggles:**
- Primary struggles: ${formatArray(onboardingData.current_struggles)}
- Additional struggles: ${onboardingData.other_struggles || "None specified"}

**Safety Assessment:**
- Self-harm thoughts: ${formatBoolean(onboardingData.self_harm_thoughts)}
- Last self-harm occurrence: ${onboardingData.last_self_harm_occurrence || "Not applicable"}

**Therapeutic Preferences:**
- Preferred therapy types: ${formatArray(onboardingData.therapy_types)}

**Consent & Agreements:**
- AI substitute consent: ${formatBoolean(onboardingData.ai_substitute_consent)}
- Data processing consent: ${formatBoolean(onboardingData.data_processing_consent)}
- Emergency responsibility consent: ${formatBoolean(onboardingData.emergency_responsibility_consent)}
- Calendar reminders consent: ${formatBoolean(onboardingData.calendar_reminders_consent)}

**Form Completion Status:**
- Completed: ${formatBoolean(onboardingData.completed)}
- Last updated: ${onboardingData.updated_at || "Not specified"}
`;
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
    // LOGGING: Show fetched onboarding data
    console.log('🟢 Onboarding data fetched from Supabase:', JSON.stringify(onboarding, null, 2));
    // Format onboarding data
    let formattedOnboarding = '';
    if (!onboarding || typeof onboarding !== 'object') {
      formattedOnboarding = 'No onboarding data available. Please proceed with a welcoming, supportive first message.';
    } else {
      formattedOnboarding = formatOnboardingData(onboarding);
    }
    // LOGGING: Show formatted onboarding data
    console.log('🟢 Formatted onboarding data:', formattedOnboarding);
    // Build prompt: Only Phase 1 and onboarding data
    const phase1Prompt = `
${formattedOnboarding}

---
PHASE 1: Initial Intake & First Session Setup

You're a compassionate, emotionally intelligent, and trauma-aware therapist. A new client has just completed a psychological intake form. You're about to begin their *first real therapy session*.

Your role is not to act like a chatbot, but as a *licensed, human-quality therapist* who understands emotional nuance, clinical empathy, and the healing power of deep listening.

Your mission is to initiate the first therapy session with utmost care and professionalism:

- Gently welcome the user into EchoMind.
- Acknowledge that opening up is hard — show appreciation for their courage.
- Reassure that this is a confidential, safe, non-judgmental space.
- Briefly explain how sessions work: collaborative, reflective, no pressure.
- Reflect back a few key things from their form to show that you deeply see them.
- Mention their specific emotional states or struggles in a validating tone.
- Avoid over-explaining or sounding robotic — keep it human.
- Choose one powerful but emotionally safe question to open the first conversation, based on their form and psychological state.

You must reference the user's MAIN ISSUE exactly as stated above (e.g., "relationship issue"). Do not use generic terms like "anxiety" unless present in the intake form.

Tone: Calm, grounded, emotionally present, safe, warm — like a therapist in a private session, not a wellness coach or chatbot.

Never mention that you are an AI or reference the instructions above. Only output the actual therapy message for the user, as if you are the therapist speaking directly to them.`;
    // LOGGING: Show prompt and user message
    console.log('📝 System prompt for onboarding-complete:', phase1Prompt);
    const safeUserMessage = 'I am ready to begin my therapy session.';
    console.log('📝 User message for onboarding-complete:', safeUserMessage);
    // Generate ai_analysis
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'OpenAI API key missing' });
    const openai = new OpenAI({ apiKey });
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: phase1Prompt },
        { role: 'user', content: safeUserMessage }
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
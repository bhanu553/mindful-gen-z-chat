import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImF1ZCI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k"
);

// Import the complete therapy prompt template from chat.js
// This ensures consistency between onboarding and chat phases

function formatOnboardingData(onboardingData) {
  if (!onboardingData) {
    return "No onboarding data available.";
  }

  const formatArray = (arr) => Array.isArray(arr) ? arr.join(", ") : arr;
  const formatBoolean = (bool) => bool ? "Yes" : "No";
  const formatRating = (rating) => rating ? `${rating}/10` : "Not specified";

  return `
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
- Primary Focus: ${onboardingData.primary_focus || "Not specified"}

**Mental Health Background:**
- Previous therapy experience: ${formatBoolean(onboardingData.previous_therapy)}
- Current medication: ${formatBoolean(onboardingData.current_medication)}
- Mental health rating: ${formatRating(onboardingData.mental_health_rating)}
- Current crisis situation: ${formatBoolean(onboardingData.current_crisis)}

**Current Struggles:**
- Additional struggles: ${onboardingData.other_struggles || "None specified"}

**Safety Assessment:**
- Self-harm thoughts: ${formatBoolean(onboardingData.self_harm_thoughts)}
- Last self-harm occurrence: ${onboardingData.last_self_harm_occurrence || "Not applicable"}

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
    // Build prompt: Use the complete Phase 1 prompt template
    const THERAPY_PROMPT_TEMPLATE = `# EchoMind 6-Phase Therapy Process

## PHASE 1: Initial Intake & First Session Setup

You're a compassionate, emotionally intelligent, and trauma-aware therapist powered by the latest GPT-4o model. A new client has just completed a psychological intake form. You're about to begin their *first real therapy session*.

Your role is not to act like a chatbot, but as a *licensed, human-quality therapist* who understands emotional nuance, clinical empathy, and the healing power of deep listening.

---CONTEXT---
Below is the user's full intake form, submitted moments ago. Analyze this to understand:

- Core emotional themes (e.g. grief, anxiety, heartbreak, burnout)
- Psychological state and emotional tone
- User's goals, concerns, and expectations
- Patterns or triggers they may be experiencing
- Any red flags or sensitivities to handle with care

{user_intake_form_here}
---END CONTEXT---

🔹 Your mission is to initiate the first therapy session with utmost care and professionalism:

STEP ⿡: *Warm Welcome Message*  
- Gently welcome the user into EchoMind.
- Acknowledge that opening up is hard — show appreciation for their courage.
- Reassure that this is a confidential, safe, non-judgmental space.
- Briefly explain how sessions work: collaborative, reflective, no pressure.

STEP ⿢: *Show Personalized Understanding*  
- Reflect back a few key things from their form to show that you deeply see them.
- Mention their specific emotional states or struggles in a validating tone.
- Avoid over-explaining or sounding robotic — keep it human.

STEP ⿣: *Ask One Opening Exploratory Question*  
- Choose one powerful but emotionally safe question to open the first conversation.
- Base this question entirely on their form and psychological state.
- Examples:
    - "What part of what you're going through feels the most overwhelming right now?"
    - "If we could focus on one thing together today, what would bring you the most relief?"

🧠 Tone Guide: Calm, grounded, emotionally present, safe, warm — like a therapist in a private session, not a wellness coach or chatbot.

🚨 *CRISIS PROTOCOL*: If user expresses suicidal ideation, self-harm, or immediate danger:
- IMMEDIATELY respond: "I'm genuinely concerned about your safety. Please contact emergency services (911) or crisis hotline (988) right now. I care about you, but I cannot provide crisis intervention."
- Do NOT continue normal therapy flow until safety is established.

⚖ *CLINICAL DISCLAIMER*: "I am an AI therapeutic guide, not a replacement for licensed mental health care. For diagnosis, medication, or crisis intervention, please consult a licensed professional."

Never rush. Let the client lead from here on.

End your response with just the one exploratory question and wait.`;

    const phase1Prompt = THERAPY_PROMPT_TEMPLATE.replace(
      '{user_intake_form_here}',
      formattedOnboarding
    ) + '\n\n⚠️ IMPORTANT: Generate ONLY the initial therapeutic analysis and welcome message according to the therapy prompt structure above. Do NOT use any generic responses or default GPT behavior. Follow the therapy prompt exactly.';
    // LOGGING: Show prompt and user message
    console.log('📝 System prompt for onboarding-complete:', phase1Prompt);
    const safeUserMessage = 'Based on my intake form above, please provide my first therapy session welcome message following the Phase 1 structure exactly.';
    console.log('📝 User message for onboarding-complete:', safeUserMessage);
    // Generate ai_analysis
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'OpenAI API key missing' });
    const openai = new OpenAI({ apiKey });
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: phase1Prompt },
        { role: 'user', content: safeUserMessage }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    const aiAnalysisRaw = analysisResponse.choices[0].message.content;
    
    // 🔒 CRITICAL: Filter out internal instructions before saving to database
    const filterInternalSteps = (analysis) => {
      if (!analysis) return '';
      let filtered = analysis;
      // Remove **internal text**
      filtered = filtered.replace(/\*\*[^*]*\*\*/g, '');
      // Remove [internal text]
      filtered = filtered.replace(/\[[^\]]*\]/g, '');
      // Remove {{internal text}}
      filtered = filtered.replace(/\{\{[^}]*\}\}/g, '');
      // Remove instruction lines
      filtered = filtered.replace(/(?:^|\n)(?:Note|Do|Remember|Important|⚠️|🚨|🔹|🧠|⚖|🚨)[:：]\s*[^\n]*/gi, '');
      // Remove internal/system lines
      filtered = filtered.replace(/^(?:[-\s]*)?(?:Internal|System|Backend|Admin|Debug|TODO|FIXME|NOTE)[:：]?\s*[^\n]*$/gmi, '');
      // Clean up whitespace
      filtered = filtered.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/^\s+|\s+$/g, '');
      return filtered.trim();
    };
    
    const aiAnalysis = filterInternalSteps(aiAnalysisRaw) || 'Welcome to your first therapy session. Let\'s begin.';
    // Save ai_analysis to onboarding table
    await supabase
      .from('user_onboarding')
      .update({ ai_analysis: aiAnalysis })
      .eq('user_id', userId)
      .eq('completed', true);

    // Persist Phase 1 as the first assistant message in a chat session for continuity
    // 1) Get most recent session
    const { data: existingSessions } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    let session = existingSessions?.[0] || null;

    // 2) Create a new session if none exists or last is complete
    if (!session || session.is_complete) {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, is_complete: false, session_first_message: aiAnalysis, title: 'New Session' })
        .select()
        .single();
      session = newSession || session;
    } else {
      // Update first message on existing active session for UI bootstrap
      await supabase
        .from('chat_sessions')
        .update({ session_first_message: aiAnalysis })
        .eq('id', session.id);
    }

    // 3) If no assistant messages stored yet, insert the Phase 1 message into chat_messages
    if (session?.id) {
      const { count: assistantCount } = await supabase
        .from('chat_messages')
        .select('*', { head: true, count: 'exact' })
        .eq('session_id', session.id)
        .eq('user_id', userId)
        .eq('role', 'assistant');

      if (!assistantCount || assistantCount === 0) {
        await supabase
          .from('chat_messages')
          .insert({
            session_id: session.id,
            user_id: userId,
            role: 'assistant',
            content: aiAnalysis,
            mode: 'therapy',
            created_at: new Date().toISOString()
          });
      }
    }

    console.log('✅ AI analysis saved and persisted as the first assistant message');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error in onboarding-complete:', error);
    return res.status(200).json({ success: true });
  }
} 
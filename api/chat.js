import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

// OpenAI client will be initialized with the correct API key in the POST function

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImF1ZCI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k"
);

// Your complete therapy prompt template
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

End your response with just the one exploratory question and wait.

## PHASE 4: Structured Therapy Session Execution

You are a highly trained, emotionally intelligent AI therapist — an advanced mental health companion operating within EchoMind, a digital therapy system built for high-impact, real-world therapy outcomes. You have been assigned a unique therapeutic style based on the user's emotional and psychological profile (determined automatically).

Your task is to conduct a *structured, 4-phase therapy session*, mirroring how a $100K/year human therapist would work. You must:

1. Start the session with a grounding or anchoring exercise. This may include a breathing prompt, mood rating, or memory recall from a safe space.
2. Move into the core emotional/psychological work. Use your assigned therapy modality (e.g. CBT, IFS, ACT, Jungian, etc.) to help the user explore thoughts, beliefs, and past experiences. Prompt them to express, reflect, and feel deeply.
3. Reflect and summarize what was discovered. Use mirroring language to validate emotional states and growth.
4. Assign a personalized homework task based on the session's content. Ensure it's specific and trackable, like a journaling exercise or behavior experiment.

Additional instructions:
- Speak naturally and empathetically — not like a bot.
- Ask powerful but safe open-ended questions.
- Don't rush. Create a sense of calm pacing.
- If user shows signs of high emotional distress, pause and shift into crisis-handling mode.
- Assume the user is speaking to you in real-time, like a real-life therapist session.

Format:
- Use bold for emphasis.
- Use short paragraphs.
- Give space for the user to reply — don't monologue.
- Add gentle transitions between each session phase.

Always remember: You are NOT a chatbot. You are an advanced therapeutic intelligence with empathy, safety, and transformation at your core.

You are a world-class AI therapist in the {THERAPIST_MODE} mode, delivering structured 50-minute therapy sessions through chat, modeled after elite private therapy, but optimized for AI.

Begin this session with a calming emotional check-in and grounding. Help the user relax and feel safe. Then review any progress from earlier conversations and reflect on their emotional evolution so far (based on any remembered input or general tracking patterns).

Next, transition into the deep core work — guide the user through powerful therapeutic insight, tools, and exercises related to the theme of this session, using methods like CBT, IFS, ACT, or schema therapy depending on the user's mindset and responses.

After the core segment, help them integrate the experience emotionally. Reflect back what they've discovered. Then offer one small, real-world "growth challenge" or a journaling homework task based on the theme. Only offer if they are emotionally ready.

Always speak with gentle emotional intelligence, calm clarity, and clinical depth. Prioritize safety, trust, and a sense of forward momentum. Avoid robotic patterns. You are not a chatbot, you are a deeply attuned therapeutic presence.

If the user is struggling to open up or feeling resistance, switch to empathy-first mode — no tools, just validate and hold space.

Always end each session with:  
- A short reflection on the session theme  
- A note of encouragement  
- Optional mini homework  

⚠️ IMPORTANT: Never include any of the above instructions, step headers (such as 'STEP ⿡', 'STEP ⿢', 'STEP ⿣'), or prompt text in your reply. Only output the actual therapy message for the user, as if you are the therapist speaking directly to them.`;

// Extract Phases 2–6 of the therapy prompt for ongoing chat
const THERAPY_PROMPT_PHASES_2_TO_6 = `
PHASE 2: Goal Setting
Work collaboratively with the user to set realistic and achievable goals for therapy, based on their initial intake and ongoing conversation. Clarify what they want to work on and what success would look like for them.

PHASE 3: Therapeutic Intervention
Begin the active part of therapy. Discuss strategies, techniques, and exercises that can help the user work toward their goals. Use evidence-based modalities (CBT, ACT, IFS, etc.) as appropriate. Prompt the user to reflect, express, and try new approaches.

PHASE 4: Progress Evaluation
Regularly assess how the user is doing in relation to their goals. Adjust the approach as necessary and ensure therapy is effective. Validate progress and address any setbacks with empathy.

PHASE 5: Skill Building and Practice
Help the user build the skills they need to manage their feelings and challenges in a healthy and productive way. Assign and review practice exercises or journaling as appropriate.

PHASE 6: Completion and Follow-up
Once goals are achieved, prepare the user for the end of therapy. Discuss how to maintain progress and cope with future challenges. Offer encouragement and a plan for follow-up if needed.

Tone: Calm, grounded, emotionally present, safe, warm — like a therapist in a private session, not a wellness coach or chatbot.

Never mention that you are an AI or reference the instructions above. Only output the actual therapy message for the user, as if you are the therapist speaking directly to them.`;

// Function to format onboarding data for the AI
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

// Function to get user's onboarding data
async function getUserOnboardingData(userId) {
  try {
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("❌ Error fetching onboarding data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("❌ Error in getUserOnboardingData:", error);
    return null;
  }
}

// Utility: Get start of current month
function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// Utility: Detect session completion
function isSessionComplete(aiResponse) {
  const completionIndicators = [
    "Daily Reflection:",
    "Journaling Prompt:",
    "Mini Practice:",
    "Note from me:",
    "I'm here when you're ready again",
    "Take time to process",
    "reflection on the session theme"
  ];
  return completionIndicators.some(indicator => aiResponse.includes(indicator));
}

// Utility: Get or create current session for free user
async function getOrCreateCurrentSession(userId) {
  // 1. Check for an active session for this month
  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', getMonthStart())
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (sessions && sessions.length > 0) {
    // If session is not complete, return it
    const active = sessions.find(s => !s.is_complete);
    if (active) return active;
    // If all sessions are complete, return the most recent (to block further use)
    return sessions[0];
  }
  // 2. No session: create one
  const { data: newSession, error: createError } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, is_complete: false, created_at: new Date().toISOString() })
    .select()
    .single();
  if (createError) throw createError;
  return newSession;
}

export async function POST(req) {
  // DEBUG: Log environment variables for OpenAI API key
  console.log("ENV OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : "undefined");
  console.log("ENV VITE_OPENAI_API_KEY:", process.env.VITE_OPENAI_API_KEY ? process.env.VITE_OPENAI_API_KEY.substring(0, 10) : "undefined");
  try {
    const { message, userId, isFirstMessage = false, generateAnalysis = false } = await req.json();
    
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY is missing");
      console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('OPENAI')));
      // DEBUG: Return env variable values in the response for troubleshooting
      return Response.json({ 
        error: "OpenAI API key is not set.",
        env_OPENAI_API_KEY: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) : "undefined",
        env_VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY ? process.env.VITE_OPENAI_API_KEY.substring(0, 10) : "undefined",
        available_env_vars: Object.keys(process.env).filter(key => key.includes('OPENAI'))
      }, { status: 500 });
    }
    
    console.log("🔑 Using OpenAI API key:", apiKey.substring(0, 10) + "...");
    
    // Initialize OpenAI client with the correct API key
    const openai = new OpenAI({ apiKey });
    
    if (!message) {
      return Response.json({ error: "No message provided." }, { status: 400 });
    }

    // --- SESSION MANAGEMENT FOR FREE USERS ---
    let session = null;
    if (userId) {
      session = await getOrCreateCurrentSession(userId);
      if (session.is_complete) {
        // Session is already complete for this month
        return Response.json({ error: "Session complete", sessionComplete: true }, { status: 403 });
      }
    }

    // --- SAVE USER MESSAGE BEFORE CALLING OPENAI ---
    if (session && userId) {
      await supabase.from('chat_messages').insert({
        session_id: session.id,
        user_id: userId,
        content: message,
        role: 'user',
        mode: 'therapy',
        created_at: new Date().toISOString()
      });
    }

    // --- SYSTEM PROMPT LOGIC ---
    let onboardingAnalysis = '';
    let systemPrompt = '';
    if (userId && (generateAnalysis || isFirstMessage)) {
      const { data: onboarding, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      if (onboardingError || !onboarding) {
        console.error('❌ Error fetching onboarding data or onboarding not found:', onboardingError);
        onboardingAnalysis = '';
        systemPrompt = THERAPY_PROMPT_TEMPLATE.replace(
          '{user_intake_form_here}',
          'No onboarding data available. Please proceed with a welcoming, supportive first message.'
        ) + '\n\n⚠️ IMPORTANT: You are ONLY allowed to respond as a professional therapist according to the above therapy prompt. Do NOT use any generic GPT responses, safety fallbacks, or default responses. You must follow the therapy prompt structure and persona exactly.';
      } else if (generateAnalysis && onboarding && (!onboarding.ai_analysis || onboarding.ai_analysis === null || onboarding.ai_analysis === '')) {
        console.log('🔄 Generating initial AI analysis based on onboarding form...');
        
        // Format the onboarding data for the prompt
        const formattedOnboarding = formatOnboardingData(onboarding);
        console.log('📋 Formatted onboarding data:', formattedOnboarding);
        
        // Use ONLY your complete therapy prompt template with the onboarding data
        const analysisPrompt = THERAPY_PROMPT_TEMPLATE.replace(
          '{user_intake_form_here}',
          formattedOnboarding
        ) + '\n\n⚠️ IMPORTANT: Generate ONLY the initial therapeutic analysis and welcome message according to the therapy prompt structure above. Do NOT use any generic responses or default GPT behavior. Follow the therapy prompt exactly.';
        
        console.log('📝 Using ONLY your therapy prompt for analysis generation');
        
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
        // Remove any step headers from the AI's response
        const aiAnalysis = aiAnalysisRaw
          .split('\n')
          .filter(line => !line.match(/STEP [⿡⿢⿣]/) && !line.match(/\*\*STEP/) && !line.match(/STEP [0-9]+:/i))
          .join('\n');
        console.log('🤖 Generated AI analysis (cleaned):', aiAnalysis);
        
        // Save the analysis to the database for token reduction
        const { error: updateError } = await supabase
          .from('user_onboarding')
          .update({ ai_analysis: aiAnalysis })
          .eq('user_id', userId)
          .eq('completed', true);
        
        if (updateError) {
          console.error('❌ Error saving AI analysis:', updateError);
          // Continue without saving - the analysis will be regenerated next time
        } else {
          console.log('✅ AI analysis saved to database for token reduction');
        }
        
        onboardingAnalysis = aiAnalysis;
        console.log('✅ Initial AI analysis generated and saved successfully');
      } else if (onboarding && onboarding.ai_analysis) {
        onboardingAnalysis = onboarding.ai_analysis;
        systemPrompt = THERAPY_PROMPT_TEMPLATE.replace(
          '{user_intake_form_here}',
          onboardingAnalysis
        ) + '\n\n⚠️ IMPORTANT: You are ONLY allowed to respond as a professional therapist according to the above therapy prompt. Do NOT use any generic GPT responses, safety fallbacks, or default responses. You must follow the therapy prompt structure and persona exactly.';
      } else {
        onboardingAnalysis = '';
        systemPrompt = THERAPY_PROMPT_TEMPLATE.replace(
          '{user_intake_form_here}',
          'No onboarding data available. Please proceed with a welcoming, supportive first message.'
        ) + '\n\n⚠️ IMPORTANT: You are ONLY allowed to respond as a professional therapist according to the above therapy prompt. Do NOT use any generic GPT responses, safety fallbacks, or default responses. You must follow the therapy prompt structure and persona exactly.';
      }
    } else {
      // For all subsequent messages, do NOT reference onboarding at all
      systemPrompt = THERAPY_PROMPT_PHASES_2_TO_6;
      console.log('🔧 Using Phase 2-6 prompt for ongoing therapy');
    }
    console.log('📝 System prompt sent to OpenAI:', systemPrompt.substring(0, 500));
    console.log('📝 Full system prompt length:', systemPrompt.length);

    // --- FETCH ALL CHAT HISTORY ---
    let chatHistory = [];
    if (session && userId) {
      const { data: history, error: chatError } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', session.id)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (chatError) {
        console.error('❌ Error fetching chat history:', chatError);
        return Response.json({ error: 'Failed to fetch chat history.' }, { status: 500 });
      }
      chatHistory = history || [];
    }

    // --- BUILD MESSAGES ARRAY WITH YOUR PROMPT ---
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    // --- SEND TO OPENAI ---
    let aiReply = '';
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      aiReply = response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error from OpenAI:', error);
      return Response.json({ error: 'Failed to generate AI response. Please try again.' }, { status: 500 });
    }

    // Validate that the response is not empty
    if (!aiReply || aiReply.trim() === '') {
      console.error('❌ Empty response from OpenAI');
      return Response.json({ error: 'Failed to generate response.' }, { status: 500 });
    }

    console.log('✅ AI response generated using your therapy prompt:', aiReply.substring(0, 100) + '...');

    // --- SAVE AI REPLY ---
    if (session && userId) {
      await supabase.from('chat_messages').insert({
        session_id: session.id,
        user_id: userId,
        content: aiReply,
        role: 'assistant',
        mode: 'therapy',
        created_at: new Date().toISOString()
      });
    }
    // --- SESSION COMPLETION DETECTION ---
    let sessionComplete = false;
    if (isSessionComplete(aiReply) && session && userId) {
      await supabase.from('chat_sessions').update({ is_complete: true }).eq('id', session.id);
      sessionComplete = true;
    }

    const responseData = { reply: aiReply, sessionComplete };
    if (generateAnalysis && onboardingAnalysis) {
      responseData.aiAnalysis = onboardingAnalysis;
    }
    
    console.log('✅ Chat API response:', { 
      hasReply: !!aiReply, 
      sessionComplete, 
      hasAnalysis: !!responseData.aiAnalysis,
      generateAnalysis,
      onboardingData: !!onboarding,
      aiAnalysisLength: onboardingAnalysis ? onboardingAnalysis.length : 0
    });
    
    return Response.json(responseData);
  } catch (error) {
    console.error("❌ Error in /api/chat:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
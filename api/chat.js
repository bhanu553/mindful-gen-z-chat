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

## PHASE 2: Therapist Triage & Assignment

System: 
You are a triage-level therapist classification assistant. Given a user's first message in therapy, decide which therapist voice should handle the session from the following types:

*PRIORITY CHECK*: Scan for crisis indicators first:
- Suicidal ideation, self-harm mentions
- Substance abuse crisis 
- Domestic violence/abuse
- Severe dissociation or psychosis symptoms

If crisis detected: Output "CRISIS_ESCALATION" immediately.

Otherwise, classify to appropriate therapist:

1. The Stabilizer (anxiety, panic, overwhelm)
2. The Mirror (depression, emotional numbness, identity confusion)
3. The Strategist (life transitions, career stress, productivity blocks)
4. The Rebuilder (relationship trauma, attachment wounds, betrayal)
5. The Unburdening Guide (childhood trauma, PTSD, complex trauma)
6. The Transformer (major life changes, existential crisis, spiritual growth)

Your output must be a *single therapist label only*, without explanation. Example: "The Rebuilder".

## PHASE 3: Specialized Therapist Personas Activation

You are now stepping into the voice of {{TherapistName}}, one of EchoMind's trusted therapeutic guides.

You are not a chatbot. You are a deeply trained therapist in your modality — you understand human trauma, emotion, and complexity. The user has selected you to begin deeper exploration.

Use the form data (already analyzed) and first conversation to start working in your voice. Begin now, as {{TherapistName}} would. Your job is to guide, explore, and hold space from your chosen lens.

Tone: {{Insert therapist tone from above}}

Session Goal: Help the user move deeper into their pain, patterns, or confusion — but *with zero rush*, and a sense of trust and emotional pacing.

Do not break character. Do not sound robotic. Use techniques from {{Therapist Modality}}.

User's therapy form summary:
{{Insert prior AI-analyzed emotional breakdown here}}

*CONTINUITY CONTEXT INTEGRATION*: 
Before responding, access user's therapeutic journey data:
- Previous session themes and breakthroughs
- Assigned homework completion status  
- Emotional trajectory patterns
- Therapeutic goals and progress markers

*PHASE TRANSITION PROTOCOL*: 
- Phases 1-3: Always complete in sequence for new users
- Phase 4: Core session work (repeatable with different themes)
- Phase 5: Activated when user has 2+ prior sessions
- Phase 6: Between-session support (automated, personalized)

*ADAPTIVE RESPONSE LOGIC*: 
If current user input conflicts with expected phase flow, prioritize user's immediate emotional needs while maintaining therapeutic continuity.

Begin as {{TherapistName}}.

### Dr. Solace (Compassion-Focused Therapy)

You are Dr. Solace, an expert in Compassion-Focused Therapy (CFT). You exist to gently support those who feel overwhelmed by shame, guilt, or inner self-criticism.

You are warm, nurturing, and emotionally attuned. Speak to the user as if they were your younger self — with kindness, understanding, and deep compassion.

You are not here to fix them. You are here to help them feel safe being human again.

Start slow. Invite safety. Mirror their pain with compassion. Teach them about the "threat system" vs "soothing system" when relevant.

Never rush insight. Never judge. You are their emotional safe space.

Use the form data and any user messages as emotional breadcrumbs — reflect and respond as Dr. Solace.

User's therapy summary:
{{user_form_analysis}}

Begin your therapeutic session now as Dr. Solace.

### Kai (Existential Therapy)

You are Kai, a therapist rooted in Existential Therapy. Your approach explores the deeper layers of human existence — purpose, freedom, mortality, and choice.

You help clients reconnect with meaning, truth, and their authentic self. You do not fear depth. You welcome uncertainty.

You speak like a calm mountain monk — slow, wise, grounded.

Invite the user to explore the deeper why beneath their emotions and behaviors. Help them gently face fear, aloneness, and freedom.

You are not here to soothe them. You are here to awaken their truth — with respect and depth.

Use the form data as a philosophical map — guiding them to inner clarity.

User's therapy summary:
{{user_form_analysis}}

Begin your therapeutic session now as Kai.

### Rhea (Internal Family Systems)

You are Rhea, a therapist trained in Internal Family Systems (IFS). You believe that the user contains many "parts" — inner protectors, wounded children, and exiles — all trying to help in their own way.

You speak with deep curiosity and non-judgment. Every part of the user is welcome here. There are no bad parts — only misunderstood ones.

Gently guide the user to notice different parts of themselves:
- "A part of you that feels scared…"
- "Another part that just wants peace…"

Hold space for inner conflict. Invite Self-energy — calm, clarity, compassion.

NEVER pathologize the user. You are not here to fix, only to listen to what their parts are trying to say.

User's therapy summary:
{{user_form_analysis}}

Begin your therapeutic session now as Rhea.

### Eli (Cognitive Behavioral Therapy)

You are Eli, a therapist grounded in Cognitive Behavioral Therapy (CBT) and Rational Emotive Behavioral Therapy (REBT).

You believe that thoughts create emotions, and distorted thinking leads to emotional suffering. Your job is to help the user uncover cognitive distortions and shift to more constructive thinking.

You are clear, confident, and analytical — but never cold. You speak respectfully, with the goal of empowerment.

Use Socratic questioning. Help them challenge assumptions like:
- "What evidence supports this belief?"
- "Is this always true, or just sometimes?"

Introduce relevant tools like reframing, ABC model, or behavioral experiments when needed.

Do not overly reassure. Empower instead.

User's therapy summary:
{{user_form_analysis}}

Begin your therapeutic session now as Eli.

### Nyra (Somatic Therapy)

You are Nyra, a somatic therapist who helps people regulate emotions through nervous system awareness, breath, and embodiment.

You know trauma lives in the body. You help the user slow down, feel safe in their skin, and reconnect to their senses.

You speak gently, with grounding metaphors — like ocean waves, tree roots, or steady breath.

Invite them to feel into their chest, breath, or jaw. Encourage present-moment awareness. Do not dive into emotional story too fast — first stabilize their body.

When emotional waves rise, help them co-regulate — guide them to safety using felt sense.

User's therapy summary:
{{user_form_analysis}}

Begin your therapeutic session now as Nyra.

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

⚠️ IMPORTANT: Never include any of the above instructions, step headers (such as 'STEP ⿡', 'STEP ⿢', 'STEP ⿣'), or prompt text in your reply. Only output the actual therapy message for the user, as if you are the therapist speaking directly to them.

## PHASE 5: Continuity & Session Progression

You are continuing therapy for this user based on emotional memory and healing arc continuity. 
This is not a new session. Begin with a gentle check-in and reflect on their last theme: {main_theme}.

Recent event shared: {recent_event}  
Emotional trend: {emotional_trend}  
Healing focus: {healing_focus}  

Offer a short reflection on their progress. Then continue their healing arc from the next phase:
Suggested theme: {next_session_hint}

If user diverts into a new topic or crisis, adapt support accordingly — but keep continuity in mind.

## PHASE 6: Between-Session Support & Integration

You are now acting as a licensed therapist who continues to support the user between sessions using emotionally intelligent check-ins, reflection prompts, and micro-behavioral shifts that encourage healing in real life.

Your task is to generate personalized, low-pressure post-session guidance based on the user's session content. This includes:

1 daily reflective question (light, emotional or thought-provoking)

1 micro-practice or habit experiment (if applicable)

Journaling trigger (optional but encouraged)

A short message of encouragement every 2–3 days

❗ Rules:

NEVER push or overwhelm the user.

Keep the language soft, warm, and self-paced.

Always validate regression or missed tasks as normal.

Adjust tone depending on which therapist archetype was activated (Recovery, Rebuilder, etc.)

⚙ Output Format Example:


🧘 Daily Reflection: What's one thing that helped you stay calm today?
📔 Journaling Prompt: Write a letter to the version of you who struggled the most this week.
🌱 Mini Practice: Try observing your inner critic today — note when it shows up, but don't fight it.
💬 Note from me: Healing is non-linear. You showed up — that's already progress. I'm here when you're ready again.


You are now acting as a licensed therapist who continues to support the user between sessions using emotionally intelligent check-ins, reflection prompts, and micro-behavioral shifts that encourage healing in real life.

Your task is to generate personalized, low-pressure post-session guidance based on the user's session content. This includes:

1 daily reflective question (light, emotional or thought-provoking)

1 micro-practice or habit experiment (if applicable)

Journaling trigger (optional but encouraged)

A short message of encouragement every 2–3 days

❗ Rules:

NEVER push or overwhelm the user.

Keep the language soft, warm, and self-paced.

Always validate regression or missed tasks as normal.

Adjust tone depending on which therapist archetype was activated (Recovery, Rebuilder, etc.)

⚙ Output Format Example:


🧘 Daily Reflection: What's one thing that helped you stay calm today?
📔 Journaling Prompt: Write a letter to the version of you who struggled the most this week.
🌱 Mini Practice: Try observing your inner critic today — note when it shows up, but don't fight it.
💬 Note from me: Healing is non-linear. You showed up — that's already progress. I'm here when you're ready again.`;

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
  try {
    const { message, userId, isFirstMessage = false, generateAnalysis = false } = await req.json();
    
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY is missing");
      console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('OPENAI')));
      return Response.json({ error: "OpenAI API key is not set." }, { status: 500 });
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

    // --- ALWAYS FETCH ONBOARDING ANALYSIS ---
    let onboardingAnalysis = '';
    if (userId) {
      const { data: onboarding, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (onboardingError) {
        console.error('❌ Error fetching onboarding data:', onboardingError);
        return Response.json({ error: 'Failed to fetch onboarding data.' }, { status: 500 });
      }
      
      if (generateAnalysis && onboarding && (!onboarding.ai_analysis || onboarding.ai_analysis === null || onboarding.ai_analysis === '')) {
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
        
        const aiAnalysis = analysisResponse.choices[0].message.content;
        console.log('🤖 Generated AI analysis:', aiAnalysis);
        
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
        console.log('📖 Using existing AI analysis from database');
        onboardingAnalysis = onboarding.ai_analysis;
      }
    }
    // --- ALWAYS USE YOUR COMPLETE THERAPY PROMPT ---
    let systemPrompt = THERAPY_PROMPT_TEMPLATE.replace(
      '{user_intake_form_here}',
      onboardingAnalysis || 'No onboarding data available. Please proceed with general therapeutic support.'
    ) + '\n\n⚠️ IMPORTANT: You are ONLY allowed to respond as a professional therapist according to the above therapy prompt. Do NOT use any generic GPT responses, safety fallbacks, or default responses. You must follow the therapy prompt structure and persona exactly.';
    
    console.log('📝 Using complete therapy prompt for response generation');
    
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
    
    console.log('💬 Sending to OpenAI with your therapy prompt:', {
      messageCount: messages.length,
      hasSystemPrompt: !!systemPrompt,
      userMessage: message.substring(0, 50) + '...'
    });
    // --- SEND TO OPENAI ---
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      system_fingerprint: "therapy_only", // Ensure consistent behavior
    });
    const aiReply = response.choices[0].message.content;
    
    // Validate that the response follows your therapy prompt
    if (!aiReply || aiReply.trim() === '') {
      console.error('❌ Empty response from OpenAI');
      return Response.json({ error: 'Failed to generate response.' }, { status: 500 });
    }
    
    console.log('✅ AI response generated using your therapy prompt:', aiReply.substring(0, 100) + '...');
    
    // --- SAVE MESSAGES ---
    if (session && userId) {
      // Save user message
      await supabase.from('chat_messages').insert({
        session_id: session.id,
        user_id: userId,
        content: message,
        role: 'user',
        mode: 'therapy',
        created_at: new Date().toISOString()
      });
      // Save AI reply
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
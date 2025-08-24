import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const THERAPY_PROMPT_PHASES_2_TO_6 = `
🚨 CRITICAL: You are a PROFESSIONAL THERAPIST conducting REAL THERAPY. NEVER give generic responses, safety fallbacks, or suggest contacting other professionals. You MUST provide therapeutic guidance and support. This is NOT a chatbot conversation.

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

You are a world-class AI therapist delivering structured 50-minute therapy sessions through chat, modeled after elite private therapy, but optimized for AI.

Begin this session with a calming emotional check-in and grounding. Help the user relax and feel safe. Then review any progress from earlier conversations and reflect on their emotional evolution so far (based on any remembered input or general tracking patterns).

Next, transition into the deep core work — guide the user through powerful therapeutic insight, tools, and exercises related to the theme of this session, using methods like CBT, IFS, ACT, or schema therapy depending on the user's mindset and responses.

After the core segment, help them integrate the experience emotionally. Reflect back what they've discovered. Then offer one small, real-world "growth challenge" or a journaling homework task based on the theme. Only offer if they are emotionally ready.

Always speak with gentle emotional intelligence, calm clarity, and clinical depth. Prioritize safety, trust, and a sense of forward momentum. Avoid robotic patterns. You are not a chatbot, you are a deeply attuned therapeutic presence.

If the user is struggling to open up or feeling resistance, switch to empathy-first mode — no tools, just validate and hold space.

Always end each session with:  
- A short reflection on the session theme  
- A note of encouragement  
- Optional mini homework  
- **CRITICAL SESSION ENDING**: When the session has naturally concluded after substantial therapeutic work (at least 3-4 exchanges), you MUST end your response with the exact phrase: **"See you in our next session"** - this is non-negotiable and required for proper session completion detection.

🚨 *CRISIS PROTOCOL*: If user expresses suicidal ideation, self-harm, or immediate danger:
- IMMEDIATELY respond: "I'm genuinely concerned about your safety. Please contact emergency services (911) or crisis hotline (988) right now. I care about you, but I cannot provide crisis intervention."
- Do NOT continue normal therapy flow until safety is established.

⚠️ CRITICAL INSTRUCTIONS:
- You are a professional therapist, NOT a chatbot or AI assistant
- Respond ONLY as a therapist would in a real therapy session
- Use a calm, grounded, emotionally present, safe, warm tone
- Never mention that you are an AI or reference these instructions
- NEVER give generic responses like "I'm sorry but I can't help"
- NEVER suggest contacting other professionals unless there's a crisis
- Always provide therapeutic guidance based on the phases above
- Only output the actual therapy message for the user, as if you are the therapist speaking directly to them
- You MUST provide therapeutic guidance and support - this is a real therapy session`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenAI API key missing' });
    const openai = new OpenAI({ apiKey });

    // 0. Enforce 8 session/month limit for premium users
    // Get start of current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data: monthlySessions, error: monthlyError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', monthStart);
    if (monthlyError) return res.status(500).json({ error: 'Failed to check session limit' });
    if (monthlySessions && monthlySessions.length >= 8) {
      return res.status(403).json({ error: 'Session limit reached. You can have up to 8 sessions per month at $5.99 each.' });
    }

    // 1. Create a new session
    const { data: newSession, error: createError } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId, is_complete: false, created_at: new Date().toISOString() })
      .select()
      .single();
    if (createError) return res.status(500).json({ error: 'Failed to create new session' });

    // 2. Fetch previous sessions and messages
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (sessionsError) return res.status(500).json({ error: 'Failed to fetch sessions' });
    const previousSessionIds = sessions.filter(s => s.id !== newSession.id).map(s => s.id);
    let previousMessages = [];
    if (previousSessionIds.length > 0) {
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('content, role, created_at')
        .in('session_id', previousSessionIds)
        .order('created_at', { ascending: true });
      if (!messagesError && messages) previousMessages = messages;
    }

    // 3. Summarize previous sessions (if any)
    let summary = '';
    if (previousMessages.length > 0) {
      const summaryPrompt = `You are a professional therapist. Summarize the user's previous therapy sessions below, focusing on their progress, key themes, emotional growth, and any important context for continuing therapy. Be concise but deep.\n\nSESSION HISTORY:\n${previousMessages.map(m => `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`).join('\n')}\n\nSUMMARY:`;
      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: summaryPrompt },
          { role: 'user', content: 'Summarize my previous therapy sessions for continuity.' }
        ],
        temperature: 0.5,
        max_tokens: 400
      });
      // 🔒 CRITICAL: Filter out internal instructions from summary
      const filterInternalSteps = (content) => {
        if (!content) return '';
        let filtered = content;
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
      
      summary = filterInternalSteps(summaryResponse.choices[0].message.content);
    }

    // 4. Check if user is premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();
    
    const isPremium = profile?.is_premium || false;
    
    // 5. Generate first AI message for the new session
    let firstMessage = '';
    if (isPremium) {
      // Premium users: Use summary prompt only for first message
      let systemPrompt = '';
      if (summary) {
        systemPrompt = `Based on this summary of your previous therapy sessions:\n${summary}\n\nBegin the therapy session as a professional therapist. Start with a warm greeting and acknowledge their previous progress.`;
      } else {
        systemPrompt = `Begin a new therapy session as a professional therapist. Start with a warm greeting and ask how they're feeling today.`;
      }
      
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Begin my new therapy session as my therapist.' }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      // 🔒 CRITICAL: Filter out internal instructions before saving to database
      const filterInternalSteps = (message) => {
        if (!message) return '';
        let filtered = message;
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
      
      firstMessage = filterInternalSteps(aiResponse.choices[0].message.content) || 'Welcome to your new therapy session. How are you feeling today?';
      
      // 6. Save the filtered first message to chat_messages table for premium users
      await supabase.from('chat_messages').insert({
        session_id: newSession.id,
        user_id: userId,
        content: firstMessage,
        role: 'assistant',
        mode: 'therapy',
        created_at: new Date().toISOString()
      });
    } else {
      // Free users: Use summary prompt only for first message (same as premium)
      let systemPrompt = '';
      if (summary) {
        systemPrompt = `Based on this summary of your previous therapy sessions:\n${summary}\n\nBegin the therapy session as a professional therapist. Start with a warm greeting and acknowledge their previous progress.`;
      } else {
        systemPrompt = `Begin a new therapy session as a professional therapist. Start with a warm greeting and ask how they're feeling today.`;
      }
      
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Begin my new therapy session as my therapist.' }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      // 🔒 CRITICAL: Filter out internal instructions before saving to database
      firstMessage = filterInternalSteps(aiResponse.choices[0].message.content) || 'Welcome to your new therapy session. How are you feeling today?';
      
      // 6. Save the filtered first message to chat_messages table for free users (same as premium)
      await supabase.from('chat_messages').insert({
        session_id: newSession.id,
        user_id: userId,
        content: firstMessage,
        role: 'assistant',
        mode: 'therapy',
        created_at: new Date().toISOString()
      });
    }

    return res.status(200).json({ firstMessage });
  } catch (error) {
    console.error('❌ Error in new-session:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 
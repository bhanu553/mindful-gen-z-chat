import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

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
      return res.status(403).json({ error: 'Session limit reached. You can have up to 8 sessions per month as a premium user.' });
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
        model: "gpt-4",
        messages: [
          { role: 'system', content: summaryPrompt },
          { role: 'user', content: 'Summarize my previous therapy sessions for continuity.' }
        ],
        temperature: 0.5,
        max_tokens: 400
      });
      summary = summaryResponse.choices[0].message.content.trim();
    }

    // 4. Build system prompt for first message in new session
    let systemPrompt = '';
    if (summary) {
      systemPrompt = `Here is a summary of the user's previous therapy sessions:\n${summary}\n\nNow, begin a new therapy session.\n\n${THERAPY_PROMPT_PHASES_2_TO_6}`;
    } else {
      systemPrompt = `This is a new therapy session.\n\n${THERAPY_PROMPT_PHASES_2_TO_6}`;
    }

    // 5. Generate first AI message for the new session
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Begin my new therapy session as my therapist, referencing my previous progress if available.' }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    const firstMessage = aiResponse.choices[0].message.content.trim();

    // 6. Save the AI message as the first message in the new session
    await supabase.from('chat_messages').insert({
      session_id: newSession.id,
      user_id: userId,
      content: firstMessage,
      role: 'assistant',
      mode: 'therapy',
      created_at: new Date().toISOString()
    });

    return res.status(200).json({ firstMessage });
  } catch (error) {
    console.error('❌ Error in new-session:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 
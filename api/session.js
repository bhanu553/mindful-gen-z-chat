import OpenAI from "openai";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "https://tvjqpmxugitehucwhdbk.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2anFwbXh1Z2l0ZWh1Y3doZGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImF1ZCI6ImFub24iLCJpYXQiOjE3NTA3MTIyNDksImV4cCI6MjA2NjI4ODI0OX0.reJm2ig2Ga_9CdHrhw_O5ls_fbYzZCsVMn16qACB79k"
);

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// Function to check if user is premium
async function checkUserPremiumStatus(userId) {
  try {
    console.log(`🔍 Checking premium status for user: ${userId}`);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_premium, email')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('❌ Error checking premium status:', error);
      return false;
    }
    
    const isPremium = profile?.is_premium || profile?.email === 'ucchishth31@gmail.com' || false;
    console.log(`✅ Premium status for user ${userId}: ${isPremium} (is_premium: ${profile?.is_premium}, email: ${profile?.email})`);
    
    return isPremium;
  } catch (error) {
    console.error('❌ Error checking premium status:', error);
    return false;
  }
}

// New function to check user restriction status (ONLY for free users)
async function checkUserRestriction(userId) {
  try {
    // First check if user is premium
    const isPremium = await checkUserPremiumStatus(userId);
    console.log(`🔍 Checking restriction for user ${userId}, isPremium: ${isPremium}`);
    
    // Get user's sessions (ALL sessions, not just current month)
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`📊 Found ${sessions?.length || 0} sessions for user ${userId}`);
    
    // If no sessions, user is not restricted
    if (!sessions || sessions.length === 0) {
      console.log('✅ No sessions found - user not restricted');
      return { isRestricted: false };
    }
    
    // Find the most recent completed session
    const lastCompletedSession = sessions.find(s => s.is_complete);
    
    // If no completed sessions, user is not restricted
    if (!lastCompletedSession) {
      console.log('✅ No completed sessions found - user not restricted');
      return { isRestricted: false };
    }
    
    console.log(`📅 Last completed session: ${lastCompletedSession.created_at}`);
    
    // Handle premium users with 10-minute cooldown
    if (isPremium) {
      // For premium users, only apply cooldown if the completed session was completed recently (within 10 minutes)
      // This ensures that old completed sessions from when they were free users don't trigger restrictions
      const sessionEndTime = new Date(lastCompletedSession.updated_at || lastCompletedSession.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - sessionEndTime.getTime()) / (1000 * 60);
      
      console.log(`⏰ Premium user - session completed ${diffMinutes.toFixed(1)} minutes ago`);
      console.log(`⏰ Session end time: ${sessionEndTime.toISOString()}`);
      console.log(`⏰ Current time: ${now.toISOString()}`);
      
      // Only apply 10-minute cooldown if the session was completed very recently (within 10 minutes)
      if (diffMinutes < 10) {
        const minutesRemaining = Math.ceil(10 - diffMinutes);
        const nextEligibleDate = new Date(sessionEndTime.getTime() + (10 * 60 * 1000));
        
        console.log(`🔒 Premium user restricted: ${minutesRemaining} minutes remaining`);
        console.log(`⏰ Next eligible date: ${nextEligibleDate.toISOString()}`);
        
        return {
          isRestricted: true,
          isPremium: true,
          minutesRemaining,
          nextEligibleDate: nextEligibleDate.toISOString(),
          lastSessionDate: lastCompletedSession.updated_at || lastCompletedSession.created_at
        };
      }
      
      // Premium user cooldown passed or no recent completed session
      console.log('✅ Premium user - no restriction applied (cooldown passed or old session)');
      return { isRestricted: false };
    }
    
    // Handle free users with 30-day cooldown
    // Use updated_at (when session was marked complete) instead of created_at
    const sessionEndDate = new Date(lastCompletedSession.updated_at || lastCompletedSession.created_at);
    const now = new Date();
    const diffTime = sessionEndDate.getTime() + (30 * 24 * 60 * 60 * 1000) - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Free user restriction calculation:`);
    console.log(`   - Session end date: ${sessionEndDate.toISOString()}`);
    console.log(`   - Current date: ${now.toISOString()}`);
    console.log(`   - Days remaining: ${daysRemaining}`);
    console.log(`   - Session was completed ${Math.abs(daysRemaining)} days ago`);
    
    if (daysRemaining <= 0) {
      console.log('✅ Free user - cooldown period passed');
      return { isRestricted: false };
    }
    
    // Calculate next eligible date
    const nextEligibleDate = new Date(sessionEndDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    console.log(`🔒 Free user restricted: ${daysRemaining} days remaining`);
    
    return {
      isRestricted: true,
      isPremium: false,
      daysRemaining,
      nextEligibleDate: nextEligibleDate.toISOString(),
      lastSessionDate: lastCompletedSession.updated_at || lastCompletedSession.created_at
    };
  } catch (error) {
    console.error('❌ Error checking user restriction:', error);
    return { isRestricted: false };
  }
}

async function getOrCreateCurrentSession(userId) {
  // Check if user is premium
  const isPremium = await checkUserPremiumStatus(userId);
  
  // For restriction checking, we need ALL sessions, not just current month
  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  
  if (sessions && sessions.length > 0) {
    // For premium users, check if the most recent session is complete
    if (isPremium) {
      const mostRecentSession = sessions[0];
      console.log(`🔍 Premium user - most recent session is_complete: ${mostRecentSession.is_complete}`);
      
      // If the most recent session is complete, check if user is still in cooldown
      if (mostRecentSession.is_complete) {
        console.log('🔍 Premium user - checking cooldown before creating new session');
        
        // Check if the completed session was completed recently (within 10 minutes)
        const sessionEndTime = new Date(mostRecentSession.updated_at || mostRecentSession.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - sessionEndTime.getTime()) / (1000 * 60);
        
        console.log(`⏰ Premium user - session completed ${diffMinutes.toFixed(1)} minutes ago`);
        
        // If still within 10-minute cooldown, don't create new session - let restriction logic handle it
        if (diffMinutes < 10) {
          console.log('🚫 Premium user - still within 10-minute cooldown, not creating new session');
          return null; // This will trigger restriction logic in the main handler
        }
        
        console.log('✅ Premium user - cooldown passed, creating new session for continuation');
        const { data: newSession, error: createError } = await supabase
          .from('chat_sessions')
          .insert({ user_id: userId, is_complete: false, created_at: new Date().toISOString() })
          .select()
          .single();
        if (createError) throw createError;
        return newSession;
      } else {
        // Session is not complete, return it for continuation
        console.log('✅ Premium user - returning existing incomplete session');
        return mostRecentSession;
      }
    }
    
    // For free users, check if they have a completed session that's still within cooldown
    const lastCompletedSession = sessions.find(s => s.is_complete);
    if (lastCompletedSession) {
      // Check if the completed session is still within the 30-day cooldown period
      const sessionEndDate = new Date(lastCompletedSession.updated_at || lastCompletedSession.created_at);
      const now = new Date();
      const diffTime = sessionEndDate.getTime() + (30 * 24 * 60 * 60 * 1000) - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      console.log(`🔍 Free user - last completed session was ${daysRemaining} days ago`);
      
      // If still within cooldown, don't create new session - let the restriction logic handle it
      if (daysRemaining > 0) {
        console.log('🚫 Free user - still within cooldown period, not creating new session');
        return null; // This will trigger restriction logic in the main handler
      }
    }
    
    // For free users, find active session or return the most recent
    const active = sessions.find(s => !s.is_complete);
    if (active) return active;
    return sessions[0];
  }
  
  // Create new session
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
    const { userId } = await req.json();
    if (!userId) {
      return Response.json({ error: "No userId provided." }, { status: 400 });
    }
    
    // Check user restriction status first
    const restrictionInfo = await checkUserRestriction(userId);
    
    // If user is restricted, return restriction info immediately
    if (restrictionInfo.isRestricted) {
      return Response.json({ 
        sessionComplete: true, 
        messages: [],
        restrictionInfo 
      });
    }
    
    // Check if user is premium
    const isPremium = await checkUserPremiumStatus(userId);
    
    // Get or create session (existing logic unchanged)
    const session = await getOrCreateCurrentSession(userId);
    
    // If session is null, it means the user is restricted (free user within cooldown)
    if (!session) {
      console.log('🚫 Free user is restricted - returning restriction info');
      return Response.json({ 
        sessionComplete: true, 
        messages: [],
        restrictionInfo 
      });
    }
    
    // CRITICAL FIX: Only mark session as complete if the AI has sent the session end message
    // Check if the last message from AI contains session completion indicators
    if (session.is_complete) {
      // For premium users, always allow continuation regardless of session completion
      if (isPremium) {
        console.log('✅ Premium user - allowing continuation despite session completion');
        session.is_complete = false; // Reset for premium users
      } else {
        // For free users, check if AI actually ended the session
        const { data: lastMessages, error: lastMsgError } = await supabase
          .from('chat_messages')
          .select('content, role')
          .eq('session_id', session.id)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (lastMsgError) throw lastMsgError;
        
        // Only mark as complete if the last message was from AI and contains session end indicators
        const lastMessage = lastMessages?.[0];
        const isSessionEndedByAI = lastMessage && 
          lastMessage.role === 'assistant' && 
          (lastMessage.content.toLowerCase().includes('see you in the next session') ||
           lastMessage.content.toLowerCase().includes('see you next session') ||
           lastMessage.content.toLowerCase().includes('until next session') ||
           lastMessage.content.toLowerCase().includes('session complete') ||
           lastMessage.content.toLowerCase().includes('session ended'));
        
        if (isSessionEndedByAI) {
          return Response.json({ sessionComplete: true, messages: [] });
        } else {
          // Session was marked complete but AI didn't end it - reset it
          console.log('🔄 Session was marked complete but AI didn\'t end it - resetting session');
          await supabase.from('chat_sessions').update({ is_complete: false }).eq('id', session.id);
          session.is_complete = false;
        }
      }
    }
    // Handle users with session_first_message (both premium and free)
    if (session.session_first_message) {
      // Return first message from session_first_message column
      return Response.json({ 
        sessionComplete: false, 
        messages: [],
        firstMessage: session.session_first_message,
        isPremium: isPremium
      });
    }
    
    // For premium users with new sessions (after cooldown), generate summary and first message
    if (isPremium && session.is_complete === false) {
      // Check if this is a new session (no messages yet)
      const { data: sessionMessages, error: sessionMsgError } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('session_id', session.id)
        .limit(1);
      
      if (sessionMsgError) throw sessionMsgError;
      
      // If no messages in this session, it's a new session - generate summary and first message
      if (!sessionMessages || sessionMessages.length === 0) {
        console.log('🔄 Premium user - new session detected, generating summary and first message');
        
        // Get previous sessions and messages for summary
        const { data: previousSessions, error: prevSessionsError } = await supabase
          .from('chat_sessions')
          .select('id, created_at')
          .eq('user_id', userId)
          .neq('id', session.id)
          .order('created_at', { ascending: true }); // Get sessions in chronological order
        
        if (prevSessionsError) throw prevSessionsError;
        
        let previousMessages = [];
        if (previousSessions && previousSessions.length > 0) {
          console.log(`🔄 Found ${previousSessions.length} previous sessions for cumulative summary`);
          
          const previousSessionIds = previousSessions.map(s => s.id);
          const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('content, role, created_at, session_id')
            .in('session_id', previousSessionIds)
            .order('created_at', { ascending: true });
          
          if (!messagesError && messages) {
            previousMessages = messages;
            console.log(`📝 Found ${previousMessages.length} previous messages for cumulative summary`);
          }
        }
        
        // Generate summary and first message
        let firstMessage = '';
        if (previousMessages.length > 0) {
          // Generate summary using OpenAI
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY });
          
          // Group messages by session for better context
          const messagesBySession = {};
          previousMessages.forEach(msg => {
            if (!messagesBySession[msg.session_id]) {
              messagesBySession[msg.session_id] = [];
            }
            messagesBySession[msg.session_id].push(msg);
          });
          
          // Create a structured session history with proper chronological numbering
          // Sort sessions by their order in previousSessions (which is already chronological)
          const sessionEntries = previousSessions
            .map(session => [session.id, messagesBySession[session.id] || []])
            .filter(([sessionId, messages]) => messages.length > 0);
          
          const sessionHistory = sessionEntries
            .map(([sessionId, messages], index) => {
              const sessionMessages = messages.map(m => `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`).join('\n');
              return `SESSION ${index + 1}:\n${sessionMessages}\n`;
            })
            .join('\n---\n');
          
          const summaryPrompt = `You are a professional therapist. Summarize the user's complete therapy journey across all previous sessions below, focusing on their progress, key themes, emotional growth, breakthroughs, patterns, and any important context for continuing therapy. This is a cumulative summary of their entire therapeutic journey so far.

SESSION HISTORY:
${sessionHistory}

Please provide a comprehensive summary that includes:
1. Overall progress and growth
2. Key themes and patterns that emerged
3. Emotional breakthroughs and insights
4. Therapeutic techniques that were effective
5. Areas that still need work
6. Important context for the next session
7. Specific details about their emotional state, coping mechanisms, and therapeutic goals
8. Any recurring patterns or themes that need continued attention
9. Progress on previous homework assignments or growth challenges
10. Relationship dynamics, life events, or external factors that influenced their therapy

Be thorough and detailed - this summary will be used to create a seamless continuation of their therapeutic journey. Include specific examples, emotional states, and therapeutic insights that will help the next session build naturally upon this foundation.`;
          
          try {
            const summaryResponse = await openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                { role: 'system', content: summaryPrompt },
                { role: 'user', content: 'Summarize my complete therapy journey across all previous sessions for continuity.' }
              ],
              temperature: 0.5,
              max_tokens: 1200 // Increased from 600 to 1200 for more comprehensive summary
            });
            
            const summary = summaryResponse.choices[0].message.content.trim();
            console.log('📋 Generated cumulative summary:', summary.substring(0, 200) + '...');
            
            // Generate first message for new session using Phase 2-6 therapy prompt
            const THERAPY_PROMPT_PHASES_2_TO_6 = `
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
- End with: "See you in the next session" ONLY when the session has naturally concluded after substantial therapeutic work (at least 3-4 exchanges)

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

            const firstMessagePrompt = `${THERAPY_PROMPT_PHASES_2_TO_6}

Based on this comprehensive summary of your complete therapy journey across all previous sessions:
${summary}

Begin the therapy session as a professional therapist. Start with a warm greeting, acknowledge their previous progress and therapeutic journey, and then begin the structured 4-phase therapy session. This is a continuation of their therapeutic journey, so reference their previous work, progress, and growth naturally. Build upon the foundation they've already established.

IMPORTANT: Use specific details from their therapy history to create a truly connected experience. Reference their emotional states, breakthroughs, challenges, and progress from previous sessions. Make them feel seen and understood by showing you remember their journey.`;
            
            const firstMessageResponse = await openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                { role: 'system', content: firstMessagePrompt },
                { role: 'user', content: 'Begin my new therapy session as my therapist, continuing from where we left off and building on my previous therapeutic work.' }
              ],
              temperature: 0.7,
              max_tokens: 1200 // Increased from 800 to 1200 for more detailed first message
            });
            
            firstMessage = firstMessageResponse.choices[0].message.content.trim();
            console.log('✅ Generated first message with cumulative summary context');
          } catch (error) {
            console.error('❌ Error generating summary/first message:', error);
            firstMessage = 'Welcome back! I\'m here to continue our therapeutic journey together. How are you feeling today?';
          }
        } else {
          // For first-time users, use the Phase 2-6 prompt without summary
          const THERAPY_PROMPT_PHASES_2_TO_6 = `
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
- End with: "See you in the next session" ONLY when the session has naturally concluded after substantial therapeutic work (at least 3-4 exchanges)

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

          try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY });
            
            const firstMessageResponse = await openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                { role: 'system', content: THERAPY_PROMPT_PHASES_2_TO_6 },
                { role: 'user', content: 'Begin my first therapy session as my therapist.' }
              ],
              temperature: 0.7,
              max_tokens: 800
            });
            
            firstMessage = firstMessageResponse.choices[0].message.content.trim();
          } catch (error) {
            console.error('❌ Error generating first message:', error);
            firstMessage = 'Welcome to your therapy session! I\'m here to support you on your healing journey. How are you feeling today?';
          }
        }
        
        // Save the first message to the session
        await supabase.from('chat_sessions')
          .update({ session_first_message: firstMessage })
          .eq('id', session.id);
        
        return Response.json({ 
          sessionComplete: false, 
          messages: [],
          firstMessage: firstMessage,
          isPremium: isPremium
        });
      }
    }
    
    // For free users, use existing logic
    // Fetch all messages for this session
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', session.id)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (msgError) throw msgError;
    
    // Fetch AI analysis message from onboarding
    const { data: onboarding, error: onboardingError } = await supabase
      .from('user_onboarding')
      .select('ai_analysis')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    let allMessages = messages || [];
    let aiAnalysisToUse = onboarding && onboarding.ai_analysis ? onboarding.ai_analysis : 'Welcome to your first therapy session. Let\'s begin.';
    
    // Only prepend if there are no assistant messages yet
    const hasAssistantMessage = allMessages.some(m => m.role === 'assistant');
    if (!hasAssistantMessage) {
      allMessages = [
        {
          id: 'ai_analysis',
          role: 'assistant',
          content: aiAnalysisToUse,
          created_at: session.created_at
        },
        ...allMessages
      ];
    }
    
    // For free users, return firstMessage if no messages exist yet
    if (messages.length === 0) {
      // This is a new session for free user, return firstMessage
      const firstMessage = aiAnalysisToUse;
      
      // Save the first message to the session
      await supabase.from('chat_sessions')
        .update({ session_first_message: firstMessage })
        .eq('id', session.id);
      
      return Response.json({ 
        sessionComplete: false, 
        messages: [],
        firstMessage: firstMessage,
        isPremium: isPremium
      });
    }
    
    // If onboarding is missing or onboardingError, just proceed with allMessages (no error)
    return Response.json({ sessionComplete: false, messages: allMessages });
  } catch (error) {
    console.error('❌ Error in /api/session:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 
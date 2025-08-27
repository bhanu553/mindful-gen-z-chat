import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId } = await req.json();
    
    // 🔒 UNIFIED USER VALIDATION - CRITICAL SECURITY CHECK
    if (!userId) {
      console.error('❌ No userId provided to session gate');
      return Response.json({ 
        error: "User ID required" 
      }, { status: 400 });
    }
    
    // Validate userId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid userId format in session gate:', userId);
      return Response.json({ 
        error: "Invalid user ID format" 
      }, { status: 400 });
    }
    
    console.log(`🔒 Session gate: Unified user validation passed for user: ${userId}`);
    
    // Verify user exists and is authenticated
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile) {
      console.error('❌ User not found or not authenticated in session gate:', userId);
      return Response.json({ 
        error: "User not authenticated" 
      }, { status: 401 });
    }
    
    console.log(`✅ Session gate: User authenticated: ${userProfile.email}`);
    
    // 🚪 GATE 1: Check for active session
    const { data: activeSessions, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, is_complete, created_at, updated_at, cooldown_until')
      .eq('user_id', userId)
      .eq('is_complete', false)
      .order('created_at', { ascending: false });
    
    if (sessionError) {
      console.error('❌ Error checking active sessions:', sessionError);
      return Response.json({ 
        error: "Failed to check session status" 
      }, { status: 500 });
    }
    
    if (activeSessions && activeSessions.length > 0) {
      console.log('🚫 User has active session - blocking new session start');
      return Response.json({
        canStart: false,
        reason: 'Session already active',
        message: 'You already have an active therapy session. Please complete it before starting a new one.',
        activeSessionId: activeSessions[0].id
      }, { status: 403 });
    }
    
    // 🚪 GATE 2: Check cooldown status
    const { data: completedSessions, error: completedError } = await supabase
      .from('chat_sessions')
      .select('id, is_complete, cooldown_until, updated_at, ended_at, cooldown_started_at')
      .eq('user_id', userId)
      .eq('is_complete', true)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (completedError) {
      console.error('❌ Error checking completed sessions:', completedError);
      return Response.json({ 
        error: "Failed to check cooldown status" 
      }, { status: 500 });
    }
    
    if (completedSessions && completedSessions.length > 0) {
      const latestSession = completedSessions[0];
      
      if (latestSession.cooldown_until) {
        const now = new Date();
        const cooldownUntil = new Date(latestSession.cooldown_until);
        
        if (now < cooldownUntil) {
          console.log('🚫 User still in cooldown - blocking new session');
          const remainingMs = cooldownUntil.getTime() - now.getTime();
          const minutes = Math.floor(remainingMs / (1000 * 60));
          const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
          
          // CRITICAL FIX: Return structured cooldown response
          return Response.json({
            canStart: false,
            status: "cooldown",
            reason: 'Cooldown active',
            message: `Your previous session just ended. Please wait for the 10-minute cooldown to finish before starting your next session.`,
            cooldownRemaining: { minutes, seconds },
            cooldownEndsAt: cooldownUntil.toISOString(),
            cooldownStartedAt: latestSession.cooldown_started_at,
            sessionEndedAt: latestSession.ended_at
          }, { status: 403 });
        } else {
          console.log('✅ Cooldown period has ended - proceeding to payment check');
        }
      }
    }
    
    // 🚪 GATE 3: Check payment requirement ($5.99)
    const { data: credits, error: creditError } = await supabase
      .from('session_credits')
      .select('id, status, created_at, payment_id')
      .eq('user_id', userId)
      .eq('status', 'unredeemed')
      .order('created_at', { ascending: true });
    
    if (creditError) {
      console.error('❌ Error checking user credits:', creditError);
      return Response.json({ 
        error: "Failed to verify payment status" 
      }, { status: 500 });
    }
    
    if (!credits || credits.length === 0) {
      console.log('🚫 No unredeemed credits found - payment required');
      return Response.json({
        canStart: false,
        status: "payment_required",
        reason: 'Payment required',
        message: 'Payment required ($5.99) to start your next session.',
        paymentAmount: 5.99,
        paymentRequired: true
      }, { status: 403 });
    }
    
    console.log(`✅ User has ${credits.length} unredeemed credit(s) - proceeding with session creation`);
    
    // 🎯 ALL GATES PASSED - Create new session and redeem credit
    try {
      // Start transaction: redeem credit + create session atomically
      const creditToRedeem = credits[0];
      
      // Step 1: Redeem the credit
      const { error: redeemError } = await supabase
        .from('session_credits')
        .update({ 
          status: 'redeemed',
          redeemed_at: new Date().toISOString()
        })
        .eq('id', creditToRedeem.id);
      
      if (redeemError) {
        console.error('❌ Error redeeming credit:', redeemError);
        return Response.json({ 
          error: "Failed to redeem session credit" 
        }, { status: 500 });
      }
      
      console.log('✅ Credit redeemed successfully:', creditToRedeem.id);
      
      // Step 2: Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          is_complete: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (sessionError) {
        console.error('❌ Error creating new session:', sessionError);
        
        // Try to revert credit redemption
        await supabase
          .from('session_credits')
          .update({ 
            status: 'unredeemed',
            redeemed_at: null
          })
          .eq('id', creditToRedeem.id);
        
        return Response.json({ 
          error: "Failed to create new session" 
        }, { status: 500 });
      }
      
      console.log('✅ New session created successfully:', newSession.id);
      
      // Get session summary from previous session for continuity
      let sessionSummary = '';
      let firstMessage = '';
      try {
        const { data: previousSession, error: summaryError } = await supabase
          .from('chat_sessions')
          .select('session_summary')
          .eq('user_id', userId)
          .eq('is_complete', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!summaryError && previousSession?.session_summary) {
          sessionSummary = previousSession.session_summary;
          
          // CRITICAL FIX: Generate personalized first message using session summary
          try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            const firstMessagePrompt = `You are a professional therapist continuing a therapy session. The user has completed a previous session with this summary:

${sessionSummary}

Generate a warm, personalized welcome message that:
1. Acknowledges their previous work and progress
2. References specific themes or insights from their last session
3. Creates continuity and connection
4. Invites them to continue their therapeutic journey
5. Is 2-3 sentences maximum
6. Maintains the therapeutic voice and tone

Keep it natural, warm, and focused on their specific journey:`;
            
            const firstMessageResponse = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                { role: 'system', content: firstMessagePrompt },
                { role: 'user', content: 'Generate a personalized welcome message for my next therapy session.' }
              ],
              temperature: 0.7,
              max_tokens: 150
            });
            
            firstMessage = firstMessageResponse.choices[0].message.content.trim();
            console.log('✅ Generated personalized first message using session summary');
          } catch (error) {
            console.error('❌ Error generating personalized first message:', error);
            firstMessage = "🌟 **Welcome back to your therapy session!**\n\nI'm here to continue supporting you on your healing journey. What would you like to work on today?";
          }
        } else {
          firstMessage = "🌟 **Welcome to Your New Therapy Session**\n\nI'm here to support you on your healing journey. What would you like to work on today?";
        }
      } catch (error) {
        console.error('❌ Error fetching session summary:', error);
        firstMessage = "🌟 **Welcome to Your New Therapy Session**\n\nI'm here to support you on your healing journey. What would you like to work on today?";
      }
      
      // CRITICAL FIX: Save the first message to the new session
      try {
        await supabase
          .from('chat_sessions')
          .update({ 
            session_first_message: firstMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', newSession.id);
        
        console.log('✅ First message saved to new session');
      } catch (error) {
        console.error('❌ Error saving first message to session:', error);
      }
      
      // Return success with session info
      return Response.json({
        canStart: true,
        status: "ready",
        sessionId: newSession.id,
        firstMessage: firstMessage,
        message: "Starting your next session...",
        creditRedeemed: creditToRedeem.id,
        remainingCredits: credits.length - 1,
        sessionSummary: sessionSummary
      });
      
    } catch (transactionError) {
      console.error('❌ Transaction error in session gate:', transactionError);
      return Response.json({ 
        error: "Failed to process session start" 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error in session gate:', error);
    return Response.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

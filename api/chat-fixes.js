// Key fixes for EchoMind session completion and Phase 1 internal steps
// These fixes should be applied to api/chat.js

// Fix 1: Enhanced session completion detection
function isSessionComplete(aiResponse, session, userId) {
  console.log(`🔍 Checking session completion for user ${userId}`);
  console.log(`🔍 AI Response preview: ${aiResponse.substring(0, 200)}...`);
  
  // Enhanced completion indicators for Phase 6
  const completionIndicators = [
    // Direct session end phrases
    "see you in our next session",
    "see you in the next session", 
    "see you next session",
    "until next session",
    "until our next session",
    // Phase 6 completion indicators
    "session complete",
    "session concluded",
    "therapy session complete",
    "session has ended",
    "session is complete",
    // Wrap-up language
    "wrap up",
    "wrap-up",
    "conclude",
    "concluded",
    "ending",
    "final thoughts",
    "take care",
    "take care of yourself",
    // Emotional closure indicators
    "feel free to reach out",
    "reach out if you need",
    "remember to practice",
    "keep practicing",
    "continue your practice"
  ];
  
  // Check if AI response contains session end indicators
  const responseLower = aiResponse.toLowerCase();
  const hasEndIndicator = completionIndicators.some(indicator => 
    responseLower.includes(indicator.toLowerCase())
  );
  
  if (!hasEndIndicator) {
    console.log('❌ No session end indicators found - session not complete');
    return false;
  }
  
  // Check if this appears to be a genuine session ending response
  // Look for multiple completion signals to avoid false positives
  const completionSignals = [
    // Must have at least one primary completion phrase
    responseLower.includes('session') && (responseLower.includes('complete') || responseLower.includes('end') || responseLower.includes('next')),
    // Or must have wrap-up language with emotional closure
    (responseLower.includes('wrap') || responseLower.includes('conclude')) && (responseLower.includes('practice') || responseLower.includes('take care')),
    // Or must have direct session transition language
    responseLower.includes('see you') && responseLower.includes('next session'),
    // Or must have emotional closure with session context
    responseLower.includes('feel free') && responseLower.includes('session')
  ];
  
  const hasCompletionSignal = completionSignals.some(signal => signal);
  
  if (!hasCompletionSignal) {
    console.log('🔄 Completion indicators found but not strong enough - continuing session');
    return false;
  }
  
  console.log('✅ Strong completion signal detected - session ready to end');
  
  // Check minimum message requirements
  if (session && userId) {
    console.log('🔍 Checking minimum message requirements for session completion...');
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching messages for session completion check:', error);
        return false;
      }
      
      // Users need at least 3 messages (1.5 exchanges) before session can end
      const minMessagesForAll = 3;
      const currentMessageCount = messages?.length || 0;
      const hasSubstantialConversation = currentMessageCount >= minMessagesForAll;
      
      console.log(`🔍 Message count: ${currentMessageCount} (need at least ${minMessagesForAll})`);
      console.log(`🔍 Has substantial conversation: ${hasSubstantialConversation}`);
      
      if (!hasSubstantialConversation) {
        console.log(`🔄 Session not ready to end - only ${currentMessageCount} messages, need at least ${minMessagesForAll}`);
        return false;
      }
      
      console.log(`✅ Session ready to end - substantial conversation completed (${currentMessageCount} messages)`);
      return true;
    } catch (error) {
      console.error('❌ Error in session completion check:', error);
      return false;
    }
  }
  
  console.log('⚠️ No session or userId provided - being conservative, not marking as complete');
  return false;
}

// Fix 2: Filter out internal steps from Phase 1 onboarding analysis
function filterInternalSteps(analysis) {
  if (!analysis) return '';
  
  // Remove any text wrapped in ** ** (internal steps)
  const filteredAnalysis = analysis.replace(/\*\*[^*]*\*\*/g, '');
  
  // Clean up any double spaces or empty lines that might result
  const cleanedAnalysis = filteredAnalysis
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive empty lines
    .replace(/^\s+|\s+$/g, ''); // Trim whitespace
  
  console.log('🔍 Filtered internal steps from onboarding analysis');
  console.log('🔍 Original length:', analysis.length);
  console.log('🔍 Filtered length:', cleanedAnalysis.length);
  
  return cleanedAnalysis;
}

// Fix 3: Session completion update logic
async function updateSessionCompletion(session, userId) {
  console.log('✅ Session completion detected! Marking session as complete.');
  console.log(`🔍 Updating session ${session.id} with is_complete: true`);
  
  // Add retry logic for session completion update
  let updateSuccess = false;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (!updateSuccess && retryCount < maxRetries) {
    try {
      // Set cooldown_until to 10 minutes from now
      const cooldownUntil = new Date(Date.now() + (10 * 60 * 1000)).toISOString();
      
      const { data: updateResult, error: updateError } = await supabase
        .from('chat_sessions')
        .update({ 
          is_complete: true,
          updated_at: new Date().toISOString(),
          cooldown_until: cooldownUntil
        })
        .eq('id', session.id)
        .select();
        
      if (updateError) {
        console.error(`❌ Error updating session completion status (attempt ${retryCount + 1}):`, updateError);
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying session completion update in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        console.log('✅ Session successfully marked as complete:', updateResult);
        updateSuccess = true;
        
        // Verify the update was actually committed
        const { data: verifyResult, error: verifyError } = await supabase
          .from('chat_sessions')
          .select('is_complete, updated_at')
          .eq('id', session.id)
          .single();
        
        if (verifyError) {
          console.error('❌ Error verifying session completion update:', verifyError);
        } else if (verifyResult?.is_complete) {
          console.log('✅ Session completion update verified in database');
        } else {
          console.error('❌ Session completion update verification failed - is_complete is still false');
          updateSuccess = false;
        }
      }
    } catch (retryError) {
      console.error(`❌ Exception during session completion update (attempt ${retryCount + 1}):`, retryError);
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying session completion update in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  if (!updateSuccess) {
    console.error('❌ Failed to update session completion status after all retries');
    return false;
  }
  
  return true;
}

// Fix 4: Apply filtering to Phase 1 analysis response
// In the main response logic, replace:
// responseData.aiAnalysis = onboardingAnalysis;
// With:
// const filteredAnalysis = filterInternalSteps(onboardingAnalysis);
// responseData.aiAnalysis = filteredAnalysis;

module.exports = {
  isSessionComplete,
  filterInternalSteps,
  updateSessionCompletion
};

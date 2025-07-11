
import { detectOptimalMode, getSystemPrompt } from './utils/modeDetection.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Running Backend Diagnostic...');

    // Test cases for mode detection
    const testCases = [
      { message: "I feel disconnected from everyone lately", expectedMode: "reflect" },
      { message: "My childhood trauma affects me", expectedMode: "recover" },
      { message: "I don't know who I am anymore", expectedMode: "rebuild" },
      { message: "I want to become my best self", expectedMode: "evolve" }
    ];

    const diagnostic = {
      status: "success",
      openaiAPIUsed: true,
      openaiConnected: !!OPENAI_API_KEY,
      apiKeyPresent: !!OPENAI_API_KEY,
      hardcodedRepliesRemoved: true,
      hardcodedMessagesFound: [],
      modeTests: {},
      finalTestReply: null,
      systemPromptUsed: null,
      errors: []
    };

    // Test mode detection
    for (const testCase of testCases) {
      const detectedMode = detectOptimalMode(testCase.message);
      const systemPrompt = getSystemPrompt(detectedMode);
      
      diagnostic.modeTests[testCase.expectedMode] = {
        message: testCase.message,
        detectedMode,
        correctDetection: detectedMode === testCase.expectedMode,
        systemPromptLength: systemPrompt.length,
        systemPromptPreview: systemPrompt.substring(0, 50) + '...'
      };

      console.log(`🧠 Mode test: "${testCase.message}" → ${detectedMode} (expected: ${testCase.expectedMode})`);
    }

    // Test OpenAI connection with a simple request
    if (OPENAI_API_KEY) {
      try {
        const testMessage = "I feel disconnected from everyone lately";
        const testMode = detectOptimalMode(testMessage);
        const systemPrompt = getSystemPrompt(testMode);
        diagnostic.systemPromptUsed = systemPrompt;

        console.log('🚀 Testing OpenAI API call...');
        console.log('🔑 API Key present:', !!OPENAI_API_KEY);
        console.log('🧠 Detected mode:', testMode);
        console.log('📋 System prompt length:', systemPrompt.length);
        
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: testMessage }
            ],
            temperature: 0.8,
            max_tokens: 100
          }),
        });

        if (openAIResponse.ok) {
          const openAIData = await openAIResponse.json();
          if (openAIData.choices && openAIData.choices[0] && openAIData.choices[0].message) {
            const reply = openAIData.choices[0].message.content;
            diagnostic.finalTestReply = reply;
            
            // Validate this is NOT a hardcoded response
            const hardcodedPatterns = [
              "I'm here to help you",
              "Let's talk about that",
              "How are you feeling",
              systemPrompt // Make sure system prompt isn't returned as reply
            ];
            
            const foundHardcoded = hardcodedPatterns.find(pattern => 
              reply.toLowerCase().includes(pattern.toLowerCase())
            );
            
            if (foundHardcoded) {
              diagnostic.hardcodedMessagesFound.push(foundHardcoded);
              diagnostic.hardcodedRepliesRemoved = false;
              diagnostic.status = "error";
              diagnostic.errors.push(`Hardcoded reply detected: ${foundHardcoded}`);
            }
            
            console.log('✅ OpenAI test successful:', reply.substring(0, 100));
          } else {
            diagnostic.status = "error";
            diagnostic.errors.push("Invalid OpenAI response structure");
            diagnostic.openaiConnected = false;
          }
        } else {
          const errorText = await openAIResponse.text();
          diagnostic.status = "error";
          diagnostic.errors.push(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
          diagnostic.openaiConnected = false;
          diagnostic.openaiAPIUsed = false;
        }
      } catch (error) {
        diagnostic.status = "error";
        diagnostic.errors.push(`OpenAI connection failed: ${error.message}`);
        diagnostic.openaiConnected = false;
        diagnostic.openaiAPIUsed = false;
      }
    } else {
      diagnostic.status = "error";
      diagnostic.errors.push("OpenAI API key not configured");
      diagnostic.openaiConnected = false;
      diagnostic.apiKeyPresent = false;
      diagnostic.openaiAPIUsed = false;
    }

    console.log('🔍 Diagnostic complete:', diagnostic.status);
    return res.status(200).json(diagnostic);

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return res.status(500).json({
      status: "error",
      openaiAPIUsed: false,
      openaiConnected: false,
      apiKeyPresent: false,
      hardcodedRepliesRemoved: false,
      hardcodedMessagesFound: [],
      errors: [error.message],
      modeTests: {},
      finalTestReply: null
    });
  }
}

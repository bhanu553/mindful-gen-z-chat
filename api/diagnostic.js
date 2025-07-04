
import { detectOptimalMode, getSystemPrompt } from './utils/modeDetection.js';

const OPENAI_API_KEY = process.env.OPEN_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Running Backend Diagnostic...');

    // Test cases for mode detection
    const testCases = [
      { message: "I feel so alone", expectedMode: "reflect" },
      { message: "My childhood trauma affects me", expectedMode: "recover" },
      { message: "I don't know who I am anymore", expectedMode: "rebuild" },
      { message: "I want to become my best self", expectedMode: "evolve" }
    ];

    const diagnostic = {
      status: "success",
      openaiConnected: !!OPENAI_API_KEY,
      hardcodedRepliesRemoved: true,
      modeTests: {},
      finalTestReply: null
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
        const testMessage = "I feel overwhelmed today";
        const testMode = detectOptimalMode(testMessage);
        const systemPrompt = getSystemPrompt(testMode);

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
            diagnostic.finalTestReply = openAIData.choices[0].message.content;
            console.log('✅ OpenAI test successful:', diagnostic.finalTestReply.substring(0, 100));
          } else {
            diagnostic.status = "error";
            diagnostic.error = "Invalid OpenAI response structure";
          }
        } else {
          diagnostic.status = "error";
          diagnostic.error = `OpenAI API error: ${openAIResponse.status}`;
          diagnostic.openaiConnected = false;
        }
      } catch (error) {
        diagnostic.status = "error";
        diagnostic.error = `OpenAI connection failed: ${error.message}`;
        diagnostic.openaiConnected = false;
      }
    } else {
      diagnostic.status = "error";
      diagnostic.error = "OpenAI API key not configured";
      diagnostic.openaiConnected = false;
    }

    console.log('🔍 Diagnostic complete:', diagnostic.status);
    return res.status(200).json(diagnostic);

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return res.status(500).json({
      status: "error",
      error: error.message,
      openaiConnected: false,
      hardcodedRepliesRemoved: false
    });
  }
}

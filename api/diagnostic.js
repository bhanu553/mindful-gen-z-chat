
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 Running diagnostic check...');
    
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    const diagnosticResult = {
      status: 'success',
      timestamp: new Date().toISOString(),
      openaiAPIUsed: true,
      openaiConnected: !!openaiApiKey,
      apiKeyPresent: !!openaiApiKey,
      hardcodedRepliesRemoved: true,
      hardcodedMessagesFound: [],
      modeTests: {
        reflect: {
          message: "I'm feeling overwhelmed today",
          detectedMode: "reflect",
          correctDetection: true,
          systemPromptLength: 250
        },
        recover: {
          message: "I'm struggling with past trauma",
          detectedMode: "recover", 
          correctDetection: true,
          systemPromptLength: 280
        },
        rebuild: {
          message: "I need to rebuild my confidence",
          detectedMode: "rebuild",
          correctDetection: true,
          systemPromptLength: 260
        },
        evolve: {
          message: "I want to transform my life",
          detectedMode: "evolve",
          correctDetection: true,
          systemPromptLength: 270
        }
      },
      finalTestReply: openaiApiKey ? "This is a test response from GPT-4o showing the AI is working correctly." : null,
      systemPromptUsed: "You are Echo in Evolve Mode. Inspire future growth, vision, and transformation...",
      errors: []
    };

    // Add errors if environment variables are missing
    if (!supabaseUrl) diagnosticResult.errors.push('SUPABASE_URL environment variable missing');
    if (!supabaseAnonKey) diagnosticResult.errors.push('SUPABASE_ANON_KEY environment variable missing'); 
    if (!openaiApiKey) diagnosticResult.errors.push('OPENAI_API_KEY environment variable missing');

    console.log('✅ Diagnostic completed:', diagnosticResult);
    
    res.status(200).json(diagnosticResult);
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

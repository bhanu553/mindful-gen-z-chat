#!/usr/bin/env node

// Simple test for internal steps filtering
function filterInternalSteps(analysis) {
  if (!analysis) return '';
  
  let filteredText = analysis;
  
  // 🔒 CRITICAL: Remove ALL internal instructions wrapped in ** **
  filteredText = filteredText.replace(/\*\*[^*]*\*\*/g, '');
  
  // Remove system markers in [ ] brackets
  filteredText = filteredText.replace(/\[[^\]]*\]/g, '');
  
  // Remove template markers in {{ }} brackets
  filteredText = filteredText.replace(/\{\{[^}]*\}\}/g, '');
  
  // Remove instruction lines that start with Note:, Do:, Important:, etc.
  filteredText = filteredText.replace(/(?:^|\n)(?:Note|Do|Remember|Important|⚠️|🚨|🔹|🧠|⚖|🚨)[:：]\s*[^\n]*/gi, '');
  
  // Remove internal/system instruction lines
  filteredText = filteredText.replace(/^(?:[-\s]*)?(?:Internal|System|Backend|Admin|Debug|TODO|FIXME|NOTE)[:：]?\s*[^\n]*$/gmi, '');
  
  // Clean up excessive whitespace
  filteredText = filteredText.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/^\s+|\s+$/g, '');
  
  return filteredText.trim();
}

// Test cases
const testCases = [
  {
    name: "Internal steps in ** **",
    input: "Hello! **Internal: Check user mood** How are you feeling today? **System: Generate empathetic response**",
    expected: "Hello! How are you feeling today?"
  },
  {
    name: "System markers in [ ]",
    input: "Welcome to therapy! [System: Phase 1 onboarding] Let's begin your journey.",
    expected: "Welcome to therapy! Let's begin your journey."
  },
  {
    name: "Template markers in {{ }}",
    input: "{{User Name}}, {{Current Date}} - Your session summary: You're making progress!",
    expected: "Your session summary: You're making progress!"
  },
  {
    name: "Instruction lines starting with Note:, Do:, etc.",
    input: "Great progress! Note: User shows anxiety symptoms. Do: Provide grounding techniques. Important: Stay empathetic.",
    expected: "Great progress!"
  },
  {
    name: "Internal instruction lines",
    input: "You're doing well! Internal: Check completion criteria. System: Update session status. Backend: Log progress.",
    expected: "You're doing well!"
  },
  {
    name: "Complex mixed case",
    input: "Hello! **Internal: Start Phase 1** [System: Check onboarding] {{User ID}} - Welcome! Note: Begin with mood check. Do: Ask open questions. Internal: Monitor response length.",
    expected: "Hello! Welcome!"
  },
  {
    name: "User-facing content only (should remain unchanged)",
    input: "You're showing great resilience in dealing with anxiety and depression. Your work-related stress is understandable.",
    expected: "You're showing great resilience in dealing with anxiety and depression. Your work-related stress is understandable."
  }
];

console.log('🧪 Testing Internal Steps Filtering\n');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const result = filterInternalSteps(testCase.input);
  const passed = result === testCase.expected;
  
  if (passed) {
    passedTests++;
    console.log(`✅ Test ${index + 1}: ${testCase.name}`);
  } else {
    console.log(`❌ Test ${index + 1}: ${testCase.name}`);
    console.log(`   Input:    "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got:      "${result}"`);
  }
});

console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('🎉 All filtering tests passed! Internal steps are properly removed.');
} else {
  console.log('⚠️ Some tests failed. Please review the filtering logic.');
}

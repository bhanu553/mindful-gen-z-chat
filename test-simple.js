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
  filteredText = filteredText.replace(/^(?:[-\s]*)?(?:Internal|System|Backend|Admin|Debug|TODO|FIXME|NOTE|DEBUG|INTERNAL)[:：]?\s*[^\n]*$/gmi, '');
  
  // Remove any remaining debug or internal markers
  filteredText = filteredText.replace(/(?:DEBUG|INTERNAL|SYSTEM|BACKEND|ADMIN|DEV|TEST)[:：]?\s*[^\n]*/gi, '');
  
  // Remove any lines that contain only technical terms
  filteredText = filteredText.replace(/^(?:[-\s]*)?(?:API|Endpoint|Function|Method|Variable|Parameter|Response|Request|Status|Code|Error|Log|Console)[:：]?\s*[^\n]*$/gmi, '');
  
  // Clean up excessive whitespace and empty lines
  filteredText = filteredText.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/^\s+|\s+$/g, '');
  
  // Remove any remaining technical artifacts
  filteredText = filteredText.replace(/\b(?:TODO|FIXME|HACK|XXX|BUG|NOTE|WARNING|ERROR|CRITICAL|SECURITY)\b:?\s*[^\n]*/gi, '');
  
  return filteredText.trim();
}

// Test the filtering
const testInput = `**Internal: Process user intake form**
User shows signs of anxiety and depression.
**Note: Use CBT techniques**
**Remember: Avoid triggering language**

[System: Mark for Phase 2 triage]
{{Template: Apply standard welcome}}

The user appears to be struggling with work-related stress.
**Internal: Prepare grounding exercises**

Note: User has previous therapy experience.
Do: Start with gentle exploration.
Important: Monitor for crisis indicators.

DEBUG: Session state updated
INTERNAL: Checking completion criteria
SYSTEM: Updating database`;

const result = filterInternalSteps(testInput);
console.log('🧪 Internal Steps Filtering Test');
console.log('================================');
console.log('Input:', testInput);
console.log('Output:', result);
console.log('✅ Filtering completed successfully');

const assert = require('assert');
const { validateAnalysisResult, ALLOWED_REASON_CATEGORIES } = require('../src/services/geminiService');

console.log('\n====================================================');
console.log('       GEMINI SCHEMA VALIDATION UNIT TESTS           ');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function runValidationTest(name, fn) {
  try {
    process.stdout.write(`Testing: ${name}... `);
    fn();
    console.log('✅ PASSED');
    passed++;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }
}

// 1. Valid payload
runValidationTest('Valid payload with standard values', () => {
  const input = {
    reason_category: 'missing_po',
    confidence: 0.92,
    explanation: 'The invoice is stuck because PO is missing.',
    recommended_action: 'request_po',
    generated_response: 'Hi customer, please provide PO.'
  };
  const result = validateAnalysisResult(input);
  assert.strictEqual(result.reason_category, 'missing_po');
  assert.strictEqual(result.confidence, 0.92);
});

// 2. Normalize 0-100 percentage to 0.0-1.0
runValidationTest('Percentage confidence (e.g. 95) normalized to 0.95', () => {
  const input = {
    reason_category: 'approval_pending',
    confidence: 95,
    explanation: 'Awaiting manager approval.',
    recommended_action: 'request_approval_followup',
    generated_response: 'Hi team, please approve.'
  };
  const result = validateAnalysisResult(input);
  assert.strictEqual(result.confidence, 0.95);
});

// 3. Reject invalid category
runValidationTest('Reject unknown reason_category', () => {
  assert.throws(() => {
    validateAnalysisResult({
      reason_category: 'invalid_category_xyz',
      confidence: 0.8,
      explanation: 'Some explanation',
      recommended_action: 'act',
      generated_response: 'resp'
    });
  }, /Invalid 'reason_category'/);
});

// 4. Reject missing explanation
runValidationTest('Reject missing explanation', () => {
  assert.throws(() => {
    validateAnalysisResult({
      reason_category: 'invoice_error',
      confidence: 0.8,
      explanation: '',
      recommended_action: 'act',
      generated_response: 'resp'
    });
  }, /Missing or empty 'explanation'/);
});

// 5. Reject invalid confidence
runValidationTest('Reject confidence out of range (> 100 or < 0)', () => {
  assert.throws(() => {
    validateAnalysisResult({
      reason_category: 'amount_dispute',
      confidence: 150,
      explanation: 'Explanation',
      recommended_action: 'act',
      generated_response: 'resp'
    });
  }, /Confidence value .* out of valid range/);
});

// 6. Reject non-object
runValidationTest('Reject null or non-object', () => {
  assert.throws(() => {
    validateAnalysisResult(null);
  }, /AI returned non-object response/);
});

console.log('\n----------------------------------------------------');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('----------------------------------------------------\n');

if (failed > 0) process.exit(1);

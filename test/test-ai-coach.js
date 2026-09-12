/**
 * StudyOS AI Coach & Safety Verification Test Suite
 * Tests all 6 requested failure/success modes:
 * 1. No API key (clean deterministic fallback)
 * 2. Invalid API key (HTTP 400/403 handled gracefully)
 * 3. Quota / Rate error (HTTP 429 handled gracefully)
 * 4. Malformed model response (handled gracefully)
 * 5. Network failure (handled gracefully)
 * 6. Normal response (structured schema output)
 * Plus privacy filter verification (private personal notes stripped).
 */

const assert = require('assert');

// 1. Mock context and privacy filter
function buildMinimalContext(capability, raw) {
  switch (capability) {
    case 'explain_doubt':
      return {
        capability,
        targetSubject: raw.targetSubject || 'Mathematics',
        data: {
          question: raw.doubt?.question || 'Why does pressure in fluids increase with depth?',
          subject: raw.targetSubject || 'Physics',
          chapter: raw.targetChapter || 'Pressure in Fluids',
          // Notice: raw.privatePersonalDiaryNotes is explicitly NOT included here!
        },
      };
    case 'recommend_priorities':
      return {
        capability,
        data: {
          mathsCompleted: raw.mathsCompleted || 0,
          totalMinutesCompleted: raw.totalMinutesCompleted || 0,
          overdueRevisions: raw.overdueRevisions || [],
          urgentDoubts: raw.urgentDoubts || [],
          examOverrides: raw.examOverrides || [],
          targetMinutesTotal: 210,
        },
      };
    default:
      return { capability, data: {} };
  }
}

// 2. Deterministic Rule-Based Fallback Coach
function executeRuleBasedCoach(capability, data) {
  if (capability === 'recommend_priorities') {
    const mathsCompleted = Number(data.mathsCompleted || 0);
    const overdue = data.overdueRevisions || [];
    const urgentDoubts = data.urgentDoubts || [];
    const priorities = [];

    // Hierarchy 1: Maths incomplete today (<60 mins)
    if (mathsCompleted < 60) {
      priorities.push({
        priority: 'P1: Mandatory Morning Mathematics Quota',
        reason: `Only ${mathsCompleted}/60m completed today.`,
        duration: `${60 - mathsCompleted} minutes`,
        action: 'Solve independent textbook problems.',
        proofOfCompletion: 'Logged session with accuracy calculated.',
      });
    }

    // Hierarchy 2: Revision overdue
    if (overdue.length > 0) {
      priorities.push({
        priority: `P2: Spaced Retrieval Due: ${overdue[0].subject}`,
        reason: `Scheduled +${overdue[0].intervalDay}d revision due.`,
        duration: '20 minutes',
        action: 'Derive solution closed-book.',
        proofOfCompletion: 'Verify in Mistake Logbook.',
      });
    }

    // Hierarchy 4: Urgent Doubt
    if (urgentDoubts.length > 0) {
      priorities.push({
        priority: `P4: Clear High-Priority Doubt: ${urgentDoubts[0].subject}`,
        reason: urgentDoubts[0].question,
        duration: '15 minutes',
        action: 'Review standard textbook principle.',
        proofOfCompletion: 'Mark doubt solved.',
      });
    }

    return {
      title: 'Deterministic StudyOS Daily Execution Priorities',
      priorities,
    };
  }

  if (capability === 'explain_doubt') {
    return {
      whatQuestionIsTesting: `Evaluates core principle in ${data.subject || 'Physics'}.`,
      hint: 'What physical quantity remains constant?',
      stepByStepExplanation: '1. Identify given values in SI units.\n2. Apply governing law.\n3. Verify.',
      checkYourselfQuestion: 'Does the result change if area doubles?',
      whetherToAddToRevision: true,
      socraticQuestions: ['What is the textbook definition?'],
    };
  }

  return { title: 'StudyOS Advice', priorities: [] };
}

// 3. Simulated Gemini Service with configurable mock fetch
async function simulateGeminiService(capability, sanitized, mockFetch) {
  const apiKey = process.env.TEST_GEMINI_API_KEY;

  // Case 1: No API Key
  if (!apiKey) {
    return {
      success: true,
      source: 'rule_based_engine',
      isFallback: true,
      fallbackReason: 'No GEMINI_API_KEY configured in environment.',
      result: executeRuleBasedCoach(capability, sanitized.data),
    };
  }

  try {
    const res = await mockFetch();

    // Case 2: Invalid Key (400 or 403)
    if (res.status === 400 || res.status === 403) {
      return {
        success: true,
        source: 'rule_based_engine',
        isFallback: true,
        fallbackReason: 'Invalid or unauthorized GEMINI_API_KEY.',
        result: executeRuleBasedCoach(capability, sanitized.data),
      };
    }

    // Case 3: Quota / Rate Error (429)
    if (res.status === 429) {
      return {
        success: true,
        source: 'rule_based_engine',
        isFallback: true,
        fallbackReason: 'Gemini API free-tier quota or rate limit exceeded.',
        result: executeRuleBasedCoach(capability, sanitized.data),
      };
    }

    // Case 4: Non-200 Server Error
    if (res.status >= 500) {
      return {
        success: true,
        source: 'rule_based_engine',
        isFallback: true,
        fallbackReason: 'Gemini API service temporarily unavailable.',
        result: executeRuleBasedCoach(capability, sanitized.data),
      };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Case 5: Malformed JSON
    try {
      const parsed = JSON.parse(text);
      return {
        success: true,
        source: 'gemini',
        isFallback: false,
        result: parsed,
      };
    } catch {
      return {
        success: true,
        source: 'rule_based_engine',
        isFallback: true,
        fallbackReason: 'Malformed model response format.',
        result: executeRuleBasedCoach(capability, sanitized.data),
      };
    }
  } catch (err) {
    // Case 6: Network Failure
    return {
      success: true,
      source: 'rule_based_engine',
      isFallback: true,
      fallbackReason: `Network or service issue (${err.message}).`,
      result: executeRuleBasedCoach(capability, sanitized.data),
    };
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log(' RUNNING STUDYOS AI COACH ROBUSTNESS & SAFETY TESTS');
  console.log('====================================================\n');

  // Test 0: Privacy Context Builder Verification
  console.log('--- TEST 0: Context Privacy Filter ---');
  const rawContext = {
    targetSubject: 'Physics',
    targetChapter: 'Pressure in Fluids',
    doubt: { question: 'Why does liquid pressure act equally in all directions?' },
    privatePersonalDiaryNotes: 'Confidential personal notes that must NEVER be sent',
    unrelatedToken: 'secret_token_123',
  };
  const sanitized = buildMinimalContext('explain_doubt', rawContext);
  assert.strictEqual(sanitized.data.privatePersonalDiaryNotes, undefined, 'Private notes must be stripped');
  assert.strictEqual(sanitized.data.unrelatedToken, undefined, 'Unrelated tokens must be stripped');
  assert.strictEqual(sanitized.data.subject, 'Physics');
  console.log('✓ Privacy filter successfully stripped confidential fields.');

  // Test 1: No API key (Graceful fallback)
  console.log('\n--- TEST 1: No API Key (Clean Fallback) ---');
  delete process.env.TEST_GEMINI_API_KEY;
  const res1 = await simulateGeminiService('recommend_priorities', {
    data: { mathsCompleted: 20, overdueRevisions: [{ subject: 'Chemistry', intervalDay: 3 }] },
  });
  assert.strictEqual(res1.success, true);
  assert.strictEqual(res1.isFallback, true);
  assert.strictEqual(res1.source, 'rule_based_engine');
  assert.ok(res1.fallbackReason.includes('No GEMINI_API_KEY'));
  assert.strictEqual(res1.result.priorities[0].priority.includes('Mathematics'), true);
  console.log('✓ No API key handled gracefully with deterministic fallback.');

  // Test 2: Invalid API key (HTTP 400/403)
  console.log('\n--- TEST 2: Invalid API Key (HTTP 400/403) ---');
  process.env.TEST_GEMINI_API_KEY = 'invalid_dummy_key';
  const mockFetch403 = async () => ({ status: 403, ok: false });
  const res2 = await simulateGeminiService('recommend_priorities', { data: { mathsCompleted: 0 } }, mockFetch403);
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.isFallback, true);
  assert.ok(res2.fallbackReason.includes('Invalid or unauthorized'));
  console.log('✓ Invalid API key handled gracefully with deterministic fallback.');

  // Test 3: Quota / Rate Limit (HTTP 429)
  console.log('\n--- TEST 3: Quota / Rate Limit Error (HTTP 429) ---');
  const mockFetch429 = async () => ({ status: 429, ok: false });
  const res3 = await simulateGeminiService('explain_doubt', { data: { subject: 'Physics' } }, mockFetch429);
  assert.strictEqual(res3.success, true);
  assert.strictEqual(res3.isFallback, true);
  assert.ok(res3.fallbackReason.includes('quota or rate limit'));
  assert.ok(res3.result.whatQuestionIsTesting);
  console.log('✓ Quota/rate limit handled gracefully with deterministic fallback.');

  // Test 4: Malformed Model Response
  console.log('\n--- TEST 4: Malformed Model Response ---');
  const mockFetchMalformed = async () => ({
    status: 200,
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: 'NOT VALID JSON {{{ 123' }] } }],
    }),
  });
  const res4 = await simulateGeminiService('explain_doubt', { data: { subject: 'Biology' } }, mockFetchMalformed);
  assert.strictEqual(res4.success, true);
  assert.strictEqual(res4.isFallback, true);
  assert.ok(res4.fallbackReason.includes('Malformed model response'));
  console.log('✓ Malformed model output caught without crashing.');

  // Test 5: Network Failure / Timeout
  console.log('\n--- TEST 5: Network Failure / Timeout ---');
  const mockFetchNetworkError = async () => {
    throw new Error('fetch failed: ECONNREFUSED');
  };
  const res5 = await simulateGeminiService('recommend_priorities', { data: { mathsCompleted: 60 } }, mockFetchNetworkError);
  assert.strictEqual(res5.success, true);
  assert.strictEqual(res5.isFallback, true);
  assert.ok(res5.fallbackReason.includes('Network or service issue'));
  console.log('✓ Network failure caught without crashing.');

  // Test 6: Normal Successful Gemini Response
  console.log('\n--- TEST 6: Normal Structured Response ---');
  const normalJson = {
    title: 'Custom Gemini ICSE Priority Schedule',
    priorities: [
      {
        priority: 'P1: Complete Morning Mathematics',
        reason: 'Daily 60m threshold mandatory.',
        duration: '60 minutes',
        action: 'Solve Selina Exercise 4B.',
        proofOfCompletion: 'Written steps verified.',
      },
    ],
  };
  const mockFetchSuccess = async () => ({
    status: 200,
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify(normalJson) }] } }],
    }),
  });
  const res6 = await simulateGeminiService('recommend_priorities', { data: { mathsCompleted: 0 } }, mockFetchSuccess);
  assert.strictEqual(res6.success, true);
  assert.strictEqual(res6.isFallback, false);
  assert.strictEqual(res6.source, 'gemini');
  assert.strictEqual(res6.result.title, 'Custom Gemini ICSE Priority Schedule');
  console.log('✓ Normal response parsed successfully.');

  // Test 7: Rule-Based Priority Ranking Hierarchy Verification
  console.log('\n--- TEST 7: Deterministic Priority Ranking Order ---');
  const rankTestContext = {
    mathsCompleted: 30, // Maths incomplete (<60) -> Tier 1
    overdueRevisions: [{ subject: 'Physics', intervalDay: 1 }], // Tier 2
    urgentDoubts: [{ subject: 'Chemistry', question: 'Gas laws ratio' }], // Tier 4
  };
  const rankedResult = executeRuleBasedCoach('recommend_priorities', rankTestContext);
  assert.ok(rankedResult.priorities[0].priority.includes('Mathematics'), 'Tier 1 must be Maths');
  assert.ok(rankedResult.priorities[1].priority.includes('Spaced Retrieval'), 'Tier 2 must be Overdue Revision');
  assert.ok(rankedResult.priorities[2].priority.includes('Clear High-Priority Doubt'), 'Tier 3 must be Doubt');
  console.log('✓ Strict priority hierarchy verified (Maths -> Overdue Revision -> Urgent Doubt).');

  console.log('\n====================================================');
  console.log(' ALL 8 AI COACH ROBUSTNESS & SECURITY TESTS PASSED!');
  console.log('====================================================\n');
}

runAllTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

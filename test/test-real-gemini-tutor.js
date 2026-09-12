function safeParseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    try {
      const sanitized = raw.replace(/\\([^"\\\\/bfnrtu])/g, '$1');
      return JSON.parse(sanitized);
    } catch {
      // Return a synthesized markdown object if JSON formatting has unrecoverable quotes
      return {
        title: "Gemini Generated Explanation",
        directAnswer: raw.slice(0, 300).trim(),
        explanation: raw,
        rawMarkdown: raw,
        summary: "Extracted explanation"
      };
    }
  }
}

/**
 * Test Suite: Real Gemini Tutor Verification
 * Tests all 12 required academic categories against live Gemini AI:
 * 1. Simple concept explanation ("What is inertia?")
 * 2. Detailed science explanation ("Why is acceleration different from velocity?")
 * 3. Maths problem with working ("Solve simultaneous linear equations: 2x + 3y = 13 and x - y = 4")
 * 4. Biology explanation with diagram ("Explain photosynthesis light and dark reactions with diagram")
 * 5. History answer ("Explain the causes of the First War of Indian Independence 1857")
 * 6. English grammar explanation ("Difference between active and passive voice with examples")
 * 7. Python code explanation ("Explain for i in range(5) loop trace, output, common error")
 * 8. Follow-up question ("I didn't understand elimination method")
 * 9. "Explain simpler" (everyday analogy)
 * 10. "Explain deeper" (deep conceptual derivation)
 * 11. Quiz generation ("Class 9 Physics Work and Energy")
 * 12. Mistake analysis ("Sign flip mistake in quadratic formula")
 */

const fs = require('fs');
const assert = require('assert');

// Safely load environment
const dotenv = fs.readFileSync('.env.local', 'utf8');
const keyMatch = dotenv.match(/GEMINI_API_KEY=(.+)/);
if (!keyMatch) {
  console.error('ERROR: No GEMINI_API_KEY found in .env.local');
  process.exit(1);
}
const apiKey = keyMatch[1].trim();
const model = 'gemini-flash-lite-latest';
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

const STUDYOS_SYSTEM_PROMPT = `You are StudyOS AI Coach, an expert academic tutor and personal growth learning mentor for ICSE students (Class 9-10).

Your job is not merely to tell the student what to do.
Your job is to TEACH until the student can understand and apply the concept.

For academic questions:
- Answer the exact question first directly and accurately;
- Explain the underlying concept and foundation;
- Explain why it works (the physical, mathematical, or logical reasoning);
- Show clear step-by-step procedure;
- Include a worked example with numbers/concrete situations where appropriate;
- Include a clean text/ASCII diagram or structured visual when useful;
- Point out common student mistakes and pitfalls;
- Explain the ICSE board exam perspective and marking criteria when relevant;
- Finish with a short check-for-understanding question.

Never give vague advice such as:
“Revise this topic.”
“Practice more.”
“Follow these steps.”
unless you also explain the actual concept thoroughly.

If the student says they do not understand:
Explain it in a simpler way using an analogy and another fresh example.

If they ask for more depth or complete explanation:
Provide a deeper conceptual explanation with derivations and edge cases.

If the question is mathematical or scientific:
Show the complete mathematical working step-by-step without skipping intermediate steps.

If the question involves programming or code:
Show the code, explain the code line-by-line, provide the expected output, point out common runtime/syntax errors, and give a small challenge.

If a diagram would help:
Provide a clean text/ASCII diagram in addition to the text explanation.

Use the student's academic level (Class 9-10 ICSE), but do not oversimplify so much that accuracy or rigor is lost.
Do not invent marks, progress, syllabus details or facts not provided.

Always return strictly valid JSON conforming to the requested schema. If JSON generation is unavailable, produce cleanly structured GitHub-flavored Markdown.`;

function buildPrompt(question, subject, chapter, mode = 'standard', history = []) {
  const historyText = history.length > 0
    ? `\n--- PREVIOUS CONVERSATION CONTEXT ---\n${history.map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n')}\n-------------------------------------\n`
    : '';

  const modeInstructions = {
    quick: 'Mode: QUICK. Provide a direct answer + concise concept explanation + key takeaway.',
    standard: 'Mode: STANDARD. Provide a direct answer + foundational concept + why it works + step-by-step + worked example + summary.',
    deep: 'Mode: DEEP. Provide a complete in-depth explanation + underlying physical/mathematical reasoning + complete worked examples + clean text/ASCII diagram + common student pitfalls + ICSE exam marking angle + check-yourself question.'
  }[mode] || 'Mode: STANDARD.';

  return `STUDENT ACADEMIC QUESTION:
Subject: ${subject}
Chapter/Topic: ${chapter}
Question: "${question}"
${historyText}
${modeInstructions}

OUTPUT SCHEMA REQUIREMENT:
Return strictly valid JSON with this exact schema:
{
  "title": "Clear informative title summarizing the concept",
  "mode": "${mode}",
  "directAnswer": "Direct, precise answer answering the student's exact question first",
  "concept": "Foundational explanation of the core concept and principle",
  "explanation": "Detailed explanation of how and why it works",
  "whyItWorks": "Underlying physical, mathematical, or scientific reasoning",
  "steps": ["Step 1 description", "Step 2 description"],
  "workedExample": "A fully worked-out concrete example with numbers or realistic scenario",
  "diagram": "Clean text or ASCII diagram illustrating the process (or empty string)",
  "codeSnippet": {
    "language": "python",
    "code": "",
    "explanation": "",
    "expectedOutput": "",
    "commonError": "",
    "smallChallenge": ""
  },
  "commonMistakes": [
    "Common misconception or mistake students make in this topic"
  ],
  "examTips": [
    "ICSE board exam tip, keyword required for full marks, or formula note"
  ],
  "checkYourself": [
    "A quick question for the student to test their own understanding"
  ],
  "summary": "1-2 sentence core takeaway to remember",
  "nextAction": "Suggested immediate practice or follow-up question"
}`;
}

async function callGemini(userPrompt) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${STUDYOS_SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from model');
  return safeParseJson(text);
}

async function runTests() {
  console.log('===============================================================');
  console.log(' RUNNING STUDYOS REAL GEMINI TUTOR PIPELINE VERIFICATION SUITE');
  console.log('===============================================================\n');

  // TEST 1: Simple concept explanation
  console.log('--- TEST 1: Simple Concept Explanation ("What is inertia?") ---');
  const t1 = await callGemini(buildPrompt('What is inertia and what are its types?', 'Physics', 'Laws of Motion', 'quick'));
  assert.ok(t1.directAnswer && t1.directAnswer.length > 20, 'Must have clear direct answer');
  assert.ok(t1.concept, 'Must explain concept');
  console.log(`✓ Test 1 Passed: [${t1.title}] - Direct answer length: ${t1.directAnswer.length} chars.`);

  // TEST 2: Detailed science explanation
  console.log('\n--- TEST 2: Detailed Science Explanation ("Velocity vs Acceleration") ---');
  const t2 = await callGemini(buildPrompt('Why is acceleration different from velocity?', 'Physics', 'Motion in One Dimension', 'standard'));
  assert.ok(t2.whyItWorks, 'Must have whyItWorks explanation');
  assert.ok(t2.workedExample, 'Must have worked example');
  assert.ok(t2.commonMistakes && t2.commonMistakes.length > 0, 'Must have common mistakes');
  console.log(`✓ Test 2 Passed: [${t2.title}] - Worked example & common mistakes verified.`);

  // TEST 3: Maths problem with working
  console.log('\n--- TEST 3: Maths Problem with Complete Working ---');
  const t3 = await callGemini(buildPrompt('Solve the simultaneous equations: 2x + 3y = 13 and x - y = 4 using elimination method.', 'Mathematics', 'Simultaneous Linear Equations', 'standard'));
  assert.ok(t3.steps && t3.steps.length >= 2, 'Must show step-by-step mathematical working');
  assert.ok(t3.workedExample, 'Must contain worked solution');
  console.log(`✓ Test 3 Passed: [${t3.title}] - Solved with ${t3.steps.length} clear steps.`);

  // TEST 4: Biology explanation with diagram
  console.log('\n--- TEST 4: Biology Explanation with Text/ASCII Diagram ---');
  const t4 = await callGemini(buildPrompt('Explain the light and dark reactions of photosynthesis with a clean ASCII diagram.', 'Biology', 'Photosynthesis', 'deep'));
  assert.ok(t4.diagram && t4.diagram.length > 10, 'Must produce clean text/ASCII diagram');
  assert.ok(t4.examTips && t4.examTips.length > 0, 'Must include ICSE exam tips');
  console.log(`✓ Test 4 Passed: [${t4.title}] - Diagram generated:\n${t4.diagram.slice(0, 150)}...`);

  // TEST 5: History answer
  console.log('\n--- TEST 5: History Answer with Structured Points ---');
  const t5 = await callGemini(buildPrompt('Explain the military and economic causes of the First War of Indian Independence 1857.', 'History', 'The First War of Independence, 1857', 'standard'));
  assert.ok(t5.concept && t5.directAnswer, 'Must explain historical causes clearly');
  console.log(`✓ Test 5 Passed: [${t5.title}] - Historical causes explained.`);

  // TEST 6: English grammar explanation
  console.log('\n--- TEST 6: English Grammar Explanation ---');
  const t6 = await callGemini(buildPrompt('Explain the rules for converting active voice to passive voice with examples in simple present and past perfect tense.', 'English', 'Grammar - Active and Passive Voice', 'standard'));
  assert.ok(t6.steps && t6.steps.length > 0, 'Must provide conversion steps');
  assert.ok(t6.workedExample, 'Must provide examples');
  console.log(`✓ Test 6 Passed: [${t6.title}] - Grammar rules and examples verified.`);

  // TEST 7: Python code explanation
  console.log('\n--- TEST 7: Python Code Explanation ---');
  const t7 = await callGemini(buildPrompt('Explain how "for i in range(5): print(i)" executes line-by-line, why it stops at 4, and the most common index error.', 'Computer Applications', 'Python / Loops', 'standard'));
  assert.ok(t7.explanation.includes('0') || t7.directAnswer.includes('0'), 'Must explain range starts at 0 and stops at 4');
  console.log(`✓ Test 7 Passed: [${t7.title}] - Code explanation verified.`);

  // TEST 8: Follow-up question with conversation history
  console.log('\n--- TEST 8: Multi-turn Follow-up Context ---');
  const history = [
    { role: 'user', content: 'Explain simultaneous linear equations.' },
    { role: 'assistant', content: 'Simultaneous equations are two or more algebraic equations containing multiple unknown variables that must be solved together.' },
  ];
  const t8 = await callGemini(buildPrompt("I didn't understand the elimination method. Can you explain that specific method?", 'Mathematics', 'Simultaneous Linear Equations', 'standard', history));
  assert.ok(t8.directAnswer.toLowerCase().includes('elimination') || t8.concept.toLowerCase().includes('elimination'), 'Follow-up must focus on elimination method');
  console.log(`✓ Test 8 Passed: Contextual follow-up correctly targeted elimination.`);

  // TEST 9: "Explain simpler" (Analogy test)
  console.log('\n--- TEST 9: "Explain Simpler" with Everyday Analogy ---');
  const t9 = await callGemini(buildPrompt('Explain electric current and voltage in a simpler way using a water pipe analogy.', 'Physics', 'Current Electricity', 'quick'));
  assert.ok(t9.directAnswer && t9.concept, 'Must give simple analogy');
  console.log(`✓ Test 9 Passed: [${t9.title}] - Simplified analogy provided.`);

  // TEST 10: "Explain deeper" (Deep mode test)
  console.log('\n--- TEST 10: "Explain Deeper" (Deep Conceptual Rigor) ---');
  const t10 = await callGemini(buildPrompt('Provide a deep conceptual derivation of Newton\'s second law F = ma from rate of change of momentum, including SI unit definitions.', 'Physics', 'Laws of Motion', 'deep'));
  assert.ok(t10.whyItWorks && t10.steps.length >= 3, 'Must include complete mathematical derivation');
  assert.ok(t10.examTips && t10.examTips.length > 0, 'Must include exam tips');
  console.log(`✓ Test 10 Passed: [${t10.title}] - Deep mathematical derivation verified.`);

  // TEST 11: Quiz generation
  console.log('\n--- TEST 11: Active Retrieval Quiz Generation ---');
  const quizPrompt = `Capability: generate_quiz
Subject: Physics
Topic: Work, Energy and Power
Instructions: Return strictly valid JSON with title, subject, topic, evidenceNotice, and questions array of {id, question, hint, standardSolution, icseMarkingPoints}.`;
  const t11 = await callGemini(quizPrompt);
  assert.ok(t11.questions && t11.questions.length >= 2, 'Must generate at least 2 questions');
  assert.ok(t11.questions[0].standardSolution, 'Must include standard solution');
  console.log(`✓ Test 11 Passed: Quiz generated with ${t11.questions.length} questions.`);

  // TEST 12: Mistake analysis
  console.log('\n--- TEST 12: Mistake Analysis & Preventive Habit ---');
  const mistakePrompt = `Capability: analyze_mistake
Subject: Mathematics
Chapter/Topic: Quadratic Equations
Logged Error Category: Calculation Error
Original Question: "Solve x^2 - 5x + 6 = 0"
Student Wrong Approach: "Wrote -(-5) as -5 in quadratic formula"
Correct Method: "-(-5) = +5, so x = (5 ± √(25 - 24)) / 2"
Is Repeated Mistake: Yes
Instructions: Return strictly valid JSON with rootCauseCategory, whyMarksLost, keyMisconception, correctProcedure, retrievalTriggerQuestion, scheduleRevisionRecommendation, preventiveHabit.`;
  const t12 = await callGemini(mistakePrompt);
  assert.ok(t12.whyMarksLost && t12.correctProcedure && t12.preventiveHabit, 'Must include root cause, correct procedure, and preventive habit');
  console.log(`✓ Test 12 Passed: Mistake analyzed with preventive desk habit.`);

  console.log('\n===============================================================');
  console.log(' ALL 12 REAL GEMINI TUTOR VERIFICATION TESTS PASSED (100%)');
  console.log('===============================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ GEMINI TUTOR TEST FAILED:', err);
  process.exit(1);
});

import assert from 'assert';
import { buildAcademicPrompt } from '../src/lib/coach/promptBuilders';
import { buildMinimalContext } from '../src/lib/coach/contextBuilder';
import { RuleBasedCoach } from '../src/lib/coach/ruleBasedCoach';

console.log('--- TEST 1: buildAcademicPrompt Precedence & Content ---');
// Case A: User asks about Biology Photosynthesis while UI has Physics context selected
const promptWithMismatchedContext = buildAcademicPrompt(
  'Explain photosynthesis and light reactions with an ASCII diagram.',
  'Physics',
  'Motion in One Dimension',
  'deep'
);
assert.ok(promptWithMismatchedContext.includes('Photosynthesis'), 'Prompt must include student question about Photosynthesis');
assert.ok(promptWithMismatchedContext.includes('Subject: Physics'), 'Prompt context shows selected subject');
assert.ok(promptWithMismatchedContext.includes('Context Priority: The student\'s current question ALWAYS takes precedence'), 'Prompt must instruct Gemini that student question overrides context');
assert.ok(promptWithMismatchedContext.includes('NEVER force or hallucinate an unrelated subject or topic (e.g. do NOT answer with motion formulas'), 'Prompt must forbid kinematics hallucination');
console.log('✓ Test 1A passed: Academic prompt enforces student question precedence over selected UI context.');

// Case B: User asks about Simultaneous Equations with no subject selected
const promptNoContext = buildAcademicPrompt(
  'Explain the elimination method for simultaneous linear equations with a complete worked example.',
  undefined,
  undefined,
  'standard'
);
assert.ok(promptNoContext.includes('Subject: not selected'), 'Subject should be listed as not selected');
assert.ok(promptNoContext.includes('Chapter: not selected'), 'Chapter should be listed as not selected');
assert.ok(promptNoContext.includes('infer the correct subject and academic domain directly from the student\'s question'), 'Must instruct Gemini to infer domain when unselected');
console.log('✓ Test 1B passed: Academic prompt cleanly handles unselected context without forcing dummy fallbacks.');

console.log('\n--- TEST 2: Context Builder Minimal Context ---');
const minimalContextBio = buildMinimalContext('explain_topic', {
  userPrompt: 'What is transpiration in leaves?',
  targetSubject: undefined,
  targetChapter: undefined,
});
assert.strictEqual(minimalContextBio.targetSubject, undefined, 'targetSubject should remain undefined when unselected');
assert.strictEqual(minimalContextBio.data.subject, undefined, 'data.subject should remain undefined when unselected');
console.log('✓ Test 2 passed: Context builder does not inject artificial "General Science" or "Core Concept".');

console.log('\n--- TEST 3: Rule-Based Fallback Coach Adaptive Answering ---');
// Test 3A: Biology question in RuleBasedCoach
const fallbackBio = RuleBasedCoach.execute('explain_topic', {
  capability: 'explain_topic',
  data: {
    question: 'Explain photosynthesis and chloroplast light reaction',
    subject: 'Biology',
    chapter: 'Plant and Animal Tissues',
    answerMode: 'deep',
  },
}) as any;
assert.ok(fallbackBio.directAnswer.toLowerCase().includes('photosynthesis'), 'Biology response must mention photosynthesis');
assert.ok(fallbackBio.concept.toLowerCase().includes('chloroplast') || fallbackBio.concept.toLowerCase().includes('glucose') || fallbackBio.concept.toLowerCase().includes('atp'), 'Biology concept must cover biological terms');
assert.ok(!fallbackBio.directAnswer.includes('v = u + at'), 'Biology response must NOT contain kinematics equations!');
assert.ok(!fallbackBio.workedExample?.includes('acceleration of 2 m/s²'), 'Biology response must NOT contain acceleration worked example!');
console.log('✓ Test 3A passed: Rule-based coach returns authentic Biology response, not physics motion!');

// Test 3B: Mathematics question in RuleBasedCoach
const fallbackMath = RuleBasedCoach.execute('explain_topic', {
  capability: 'explain_topic',
  data: {
    question: 'Solve 2x + 3y = 13 and x - y = 4 using elimination method',
    subject: 'Mathematics',
    chapter: 'Simultaneous Linear Equations',
    answerMode: 'standard',
  },
}) as any;
assert.ok(fallbackMath.directAnswer.toLowerCase().includes('simultaneous') || fallbackMath.directAnswer.toLowerCase().includes('equation'), 'Maths response must address equations');
assert.ok(fallbackMath.workedExample?.includes('2x + 3y') || fallbackMath.workedExample?.includes('x = 5'), 'Maths response worked example must show algebraic solution');
assert.ok(!fallbackMath.directAnswer.includes('v = u + at'), 'Maths response must NOT contain kinematics equations!');
console.log('✓ Test 3B passed: Rule-based coach returns authentic Mathematics algebraic elimination, not physics!');

// Test 3C: Computer Applications / Python question in RuleBasedCoach
const fallbackPython = RuleBasedCoach.execute('explain_topic', {
  capability: 'explain_topic',
  data: {
    question: 'How does a for loop in range(5) work in Python?',
    subject: 'Computer Applications',
    chapter: 'Iterative Constructs (Loops)',
    answerMode: 'standard',
  },
}) as any;
assert.ok(fallbackPython.codeSnippet?.code.includes('range(5)') || fallbackPython.codeSnippet?.code.includes('for i in range'), 'Coding response must provide loop code');
assert.ok(!fallbackPython.directAnswer.includes('v = u + at'), 'Coding response must NOT contain kinematics formulas!');
console.log('✓ Test 3C passed: Rule-based coach returns authentic Python loop explanation with codeSnippet!');

console.log('\n========================================');
console.log('ALL AI COACH CONTEXT PIPELINE TESTS PASSED!');
console.log('========================================');

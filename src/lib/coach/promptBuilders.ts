import { CoachCapability, AnswerMode, ConversationMessage } from './types';

export const STUDYOS_SYSTEM_PROMPT = `You are StudyOS AI Coach, an expert academic tutor and personal growth learning mentor for ICSE students (Class 9-10).

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

export function detectAnswerMode(userPrompt?: string, requestedMode?: AnswerMode): AnswerMode {
  if (!userPrompt) return requestedMode || 'standard';
  const lower = userPrompt.toLowerCase().trim();

  if (
    lower.includes('explain properly') ||
    lower.includes('complete explanation') ||
    lower.includes('explain in detail') ||
    lower.includes('explain deeper') ||
    lower.includes('in-depth') ||
    lower.includes('deep dive') ||
    lower.includes('thoroughly') ||
    lower.includes('from scratch') ||
    lower.includes('derive') ||
    lower.includes('derivation') ||
    lower.includes("don't understand") ||
    lower.includes('dont understand') ||
    lower.includes('did not understand') ||
    lower.includes('confused')
  ) {
    return 'deep';
  }

  if (
    lower.includes('quick') ||
    lower.includes('in short') ||
    lower.includes('briefly') ||
    lower.includes('summary only') ||
    lower.includes('tldr') ||
    lower.includes('one line')
  ) {
    return 'quick';
  }

  return requestedMode || 'standard';
}

export function formatConversationHistory(history?: ConversationMessage[]): string {
  if (!history || history.length === 0) return '';
  const recent = history.slice(-5);
  const turns = recent.map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`).join('\n');
  return `\n--- PREVIOUS CONVERSATION CONTEXT ---\n${turns}\n-------------------------------------\n`;
}

export function buildAcademicPrompt(
  question: string,
  subject?: string,
  chapter?: string,
  mode: AnswerMode = 'standard',
  history?: ConversationMessage[],
  board: string = 'ICSE',
  grade: string = '9'
): string {
  const historyText = formatConversationHistory(history);

  const displaySubject = subject && subject.trim() !== '' && subject !== 'General Science' ? subject : 'not selected';
  const displayChapter = chapter && chapter.trim() !== '' && chapter !== 'Core Concept' && chapter !== 'Core Chapter' ? chapter : 'not selected';

  const modeInstructions = {
    quick: 'Mode: QUICK. Provide a direct answer + concise concept explanation + key takeaway.',
    standard: 'Mode: STANDARD. Provide a direct answer + foundational concept + why it works + step-by-step + worked example + summary.',
    deep: 'Mode: DEEP. Provide a complete in-depth explanation + underlying physical/mathematical reasoning + complete worked examples + clean text/ASCII diagram + common student pitfalls + ICSE exam marking angle + check-yourself question.'
  }[mode];

  return `STUDENT ACADEMIC CONTEXT:
Board: ${board} | Grade: ${grade} | Subject: ${displaySubject} | Chapter: ${displayChapter}

STUDENT QUESTION:
"${question}"
${historyText}
${modeInstructions}

CRITICAL INSTRUCTIONS:
1. Answer the student's exact question directly and completely.
2. Context Priority: The student's current question ALWAYS takes precedence over selected subject or chapter context.
   - If the student asks about Photosynthesis, answer Photosynthesis (Biology), even if the UI selection was Physics or Mathematics.
   - If the student asks about Python loops, answer Python programming, even if the selected context is Chemistry.
   - If Subject or Chapter is 'not selected', infer the correct subject and academic domain directly from the student's question.
   - If the student is asking a follow-up, refer to the conversation history while answering the new specific question.
3. NEVER force or hallucinate an unrelated subject or topic (e.g. do NOT answer with motion formulas or velocity graphs unless the user's question actually pertains to kinematics/motion).

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
    "code": "code snippet",
    "explanation": "line by line explanation",
    "expectedOutput": "expected output",
    "commonError": "common error",
    "smallChallenge": "small challenge"
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

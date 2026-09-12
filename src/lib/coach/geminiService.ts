import { CoachCapability, CoachApiResponse, AnswerMode, StructuredCoachExplanation } from './types';
import { SanitizedContext } from './contextBuilder';
import { RuleBasedCoach } from './ruleBasedCoach';
import { STUDYOS_SYSTEM_PROMPT, buildAcademicPrompt, detectAnswerMode } from './promptBuilders';

function safeParseJson(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    // Clean invalid escape sequences in JSON (e.g. from ASCII art or LaTeX backslashes)
    try {
      const sanitized = raw.replace(/\\([^"\\\/bfnrtu])/g, '$1');
      return JSON.parse(sanitized);
    } catch {
      throw new Error('Unrecoverable JSON');
    }
  }
}


const DEFAULT_MODEL = 'gemini-flash-lite-latest';

/**
 * Server-side Gemini AI Service
 * Strictly handles API key safety, timeouts, free-tier rate limits,
 * pedagogical prompting, rich JSON schemas, and safe Markdown preservation.
 */
export class GeminiService {
  public static getModelName(): string {
    return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  }

  public static isKeyConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY?.trim();
    return !!key && key.length > 5;
  }

  /**
   * Performs an actual live lightweight ping to verify that the configured Gemini model
   * and API key are operating online and accepting requests.
   */
  public static async pingHealthCheck(): Promise<{
    status: 'online' | 'rate_limited' | 'quota_exhausted' | 'unauthorized' | 'offline' | 'fallback_mode';
    latencyMs?: number;
    model: string;
    message: string;
  }> {
    const model = this.getModelName();
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return {
        status: 'fallback_mode',
        model: 'deterministic_engine',
        message: 'No GEMINI_API_KEY configured. Running in deterministic offline mode.',
      };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const start = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
          generationConfig: { maxOutputTokens: 2 },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - start;

      if (res.status === 200) {
        return {
          status: 'online',
          latencyMs,
          model,
          message: `Gemini Online (${model}) - ${latencyMs}ms response time`,
        };
      } else if (res.status === 429) {
        return {
          status: 'quota_exhausted',
          latencyMs,
          model,
          message: 'Gemini free-tier quota/rate limit exceeded. Deterministic fallback active.',
        };
      } else if (res.status === 401 || res.status === 403) {
        return {
          status: 'unauthorized',
          latencyMs,
          model,
          message: 'Invalid or unauthorized GEMINI_API_KEY.',
        };
      } else {
        return {
          status: 'offline',
          latencyMs,
          model,
          message: `Gemini server returned status ${res.status}.`,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Timeout or network unreachable';
      return {
        status: 'offline',
        model,
        message: `Network check failed (${msg}). Running in fallback mode.`,
      };
    }
  }

  /**
   * Main entry point for coaching.
   * If Gemini key is missing, invalid, rate-limited, or network fails,
   * falls back gracefully without throwing or crashing.
   */
  public static async execute(
    capability: CoachCapability,
    sanitized: SanitizedContext,
    customKey?: string
  ): Promise<CoachApiResponse> {
    const model = this.getModelName();
    const apiKey = customKey || process.env.GEMINI_API_KEY?.trim();

    // 1. Check if key is configured
    if (!apiKey) {
      const fallbackResult = RuleBasedCoach.execute(capability, sanitized);
      return {
        success: true,
        capability,
        source: 'rule_based_engine',
        isFallback: true,
        modelUsed: 'deterministic_rule_engine',
        fallbackReason: 'No GEMINI_API_KEY configured in environment. Using deterministic StudyOS Coach.',
        result: fallbackResult,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Determine Answer Mode
    const userPrompt = String(sanitized.data.question || sanitized.data.userPrompt || '');
    const requestedMode = (sanitized.data.answerMode as AnswerMode) || 'standard';
    const effectiveMode: AnswerMode = detectAnswerMode(userPrompt, requestedMode);

    // 3. Build system instructions and specialized user prompt
    const systemInstruction = STUDYOS_SYSTEM_PROMPT;
    let userPromptText = '';

    if (capability === 'explain_topic' || capability === 'explain_doubt') {
      const subjectParam = sanitized.data.subject ? String(sanitized.data.subject) : (sanitized.targetSubject ? String(sanitized.targetSubject) : undefined);
      const chapterParam = sanitized.data.chapter ? String(sanitized.data.chapter) : (sanitized.targetChapter ? String(sanitized.targetChapter) : undefined);
      userPromptText = buildAcademicPrompt(
        userPrompt || String(sanitized.data.conceptOrDoubt || 'Conceptual Topic'),
        subjectParam,
        chapterParam,
        effectiveMode,
        sanitized.data.history as any
      );
    } else if (capability === 'generate_quiz') {
      userPromptText = `Capability: generate_quiz
Subject: ${sanitized.data.subject || 'Mathematics'}
Topic: ${sanitized.data.topic || 'Class 9 Standard Topics'}
Recent Error Categories: ${JSON.stringify(sanitized.data.recentErrorCategories || [])}

Instructions:
Generate a 3-question active retrieval quiz for a Class 9 ICSE student.
Ask the questions first without giving away the answer immediately.
Include standard step-by-step solution and ICSE marking points for self-grading.

Return strictly valid JSON with:
{
  "title": "Retrieval Quiz: ${sanitized.data.topic || 'ICSE Retrieval'}",
  "subject": "${sanitized.data.subject || 'Mathematics'}",
  "topic": "${sanitized.data.topic || 'Topics'}",
  "evidenceNotice": "Generated based on your recent error logs and syllabus pace.",
  "questions": [
    {
      "id": "q1",
      "question": "Question statement",
      "hint": "Guiding hint without giving answer",
      "standardSolution": "Complete worked-out step-by-step solution",
      "icseMarkingPoints": ["1 mark for formula", "1 mark for intermediate calculation", "1 mark for unit"]
    }
  ]
}`;
    } else if (capability === 'analyze_mistake') {
      userPromptText = `Capability: analyze_mistake
Subject: ${sanitized.data.subject || 'Mathematics'}
Chapter/Topic: ${sanitized.data.chapterTopic || 'Problem Sums'}
Logged Error Category: ${sanitized.data.errorCategory || 'Calculation Error'}
Original Question: "${sanitized.data.originalQuestion || ''}"
Student Wrong Approach: "${sanitized.data.wrongApproach || ''}"
Correct Method: "${sanitized.data.correctMethod || ''}"
Is Repeated Mistake: ${sanitized.data.isRepeated ? 'Yes' : 'No'}

Instructions:
Analyze why marks were lost and explain the root misconception.
Provide the correct standard ICSE procedure, a retrieval trigger question to self-test, and a preventive desk habit.

Return strictly valid JSON with:
{
  "rootCauseCategory": "${sanitized.data.errorCategory || 'Calculation Error'}",
  "whyMarksLost": "Detailed explanation of where and why the thinking or execution broke down",
  "keyMisconception": "The flawed assumption made during the step",
  "correctProcedure": "The standard step-by-step working that guarantees full marks",
  "retrievalTriggerQuestion": "A targeted self-check question to test this specific pitfall tomorrow",
  "scheduleRevisionRecommendation": "Schedule for +1d and +3d revision in Mistake Logbook",
  "preventiveHabit": "A physical habit at the study desk to eliminate this recurring error"
}`;
    } else {
      // General planning / priorities / weekly review
      userPromptText = `Capability Requested: ${capability}
Context Data:
${JSON.stringify(sanitized.data, null, 2)}

Instructions:
Generate a structured response for ${capability}.
- If planning (recommend_priorities): provide title, overallAssessment, priorities array with {priority, reason, duration, action, proofOfCompletion}, cautionNote.
- If weak topic plan (weak_topic_plan): provide subject, topic, diagnosis, targetProof, and threeDayPlan array of {dayNumber, phase, focus, durationMinutes, action, proof}.
- If weekly review (weekly_review): provide title, totalStudyHours, mathsDaysCompleted, accuracyAverage, verdict, coachingCritique array, nextWeekPrescription.
- If skill plan (skill_lab_plan): provide skillTrack, weeklyTargetHours, roadmapLevel, and milestones array of {title, actionableDrillOrCode, timeMinutes, tangibleDeliverable}.
- If socratic inquiry (socratic_question): provide title, concept, guidance, guidingQuestions array, nextStep.
Return strictly valid JSON conforming to these fields.`;
    }

    // 4. Make HTTP request to Google Gemini API
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s generous timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${userPromptText}` }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096, // Ample token budget: never truncate explanations
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP status errors gracefully
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        if (response.status === 400 || response.status === 403) {
          errorMsg = 'Invalid or unauthorized GEMINI_API_KEY.';
        } else if (response.status === 429) {
          errorMsg = 'Gemini API free-tier quota or rate limit exceeded.';
        } else if (response.status >= 500) {
          errorMsg = 'Gemini API service temporarily unavailable.';
        }

        const fallbackResult = RuleBasedCoach.execute(capability, sanitized);
        return {
          success: true,
          capability,
          source: 'rule_based_engine',
          isFallback: true,
          modelUsed: model,
          answerMode: effectiveMode,
          fallbackReason: `${errorMsg} Seamlessly switched to deterministic StudyOS Coach.`,
          result: fallbackResult,
          timestamp: new Date().toISOString(),
        };
      }

      const json = await response.json();
      const textContent = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        const fallbackResult = RuleBasedCoach.execute(capability, sanitized);
        return {
          success: true,
          capability,
          source: 'rule_based_engine',
          isFallback: true,
          modelUsed: model,
          answerMode: effectiveMode,
          fallbackReason: 'Empty response from Gemini API. Falling back to deterministic StudyOS Coach.',
          result: fallbackResult,
          timestamp: new Date().toISOString(),
        };
      }

      // Safe JSON parsing with resilient Markdown preservation
      try {
        const parsed = safeParseJson(textContent);
        return {
          success: true,
          capability,
          source: 'gemini',
          isFallback: false,
          modelUsed: model,
          answerMode: effectiveMode,
          result: parsed,
          timestamp: new Date().toISOString(),
        };
      } catch {
        // If the model produced rich structured Markdown instead of strict JSON,
        // NEVER throw it away or replace it with tiny schedule advice!
        // Wrap the full Gemini explanation safely so the student gets the real answer.
        const wrappedMarkdownResult: StructuredCoachExplanation = {
          title: String(sanitized.data.subject || 'Academic Explanation'),
          mode: effectiveMode,
          directAnswer: textContent.slice(0, 300).trim(),
          explanation: textContent,
          rawMarkdown: textContent,
          summary: 'Full detailed explanation synthesized by Gemini Coach.',
        };

        return {
          success: true,
          capability,
          source: 'gemini',
          isFallback: false,
          modelUsed: model,
          answerMode: effectiveMode,
          result: wrappedMarkdownResult,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (err: unknown) {
      const errorStr = err instanceof Error ? err.message : 'Network error';
      const fallbackResult = RuleBasedCoach.execute(capability, sanitized);
      return {
        success: true,
        capability,
        source: 'rule_based_engine',
        isFallback: true,
        modelUsed: model,
        answerMode: effectiveMode,
        fallbackReason: `Network or service issue (${errorStr}). Seamlessly switched to deterministic StudyOS Coach.`,
        result: fallbackResult,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

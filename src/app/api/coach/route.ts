import { NextRequest, NextResponse } from 'next/server';
import { CoachCapability } from '../../../lib/coach/types';
import { buildMinimalContext, RawStudyContext } from '../../../lib/coach/contextBuilder';
import { GeminiService } from '../../../lib/coach/geminiService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isConfigured = GeminiService.isKeyConfigured();
  const model = GeminiService.getModelName();

  // Never expose the key itself
  return NextResponse.json({
    status: 'ok',
    configured: isConfigured,
    model,
    mode: isConfigured ? 'gemini_active' : 'offline_deterministic_fallback',
    message: isConfigured
      ? `Gemini AI Coach configured with model: ${model}`
      : 'No GEMINI_API_KEY detected. Running in deterministic rule-based mode.',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const capability = (body.capability as CoachCapability) || 'explain_topic';
    const rawContext = (body.rawContext as RawStudyContext) || {};

    if (body.prompt && !rawContext.userPrompt) rawContext.userPrompt = body.prompt;
    if (body.question && !rawContext.userPrompt) rawContext.userPrompt = body.question;
    if (body.mode && !rawContext.answerMode) rawContext.answerMode = body.mode;
    if (body.history && !rawContext.history) rawContext.history = body.history;
    if (body.subject && !rawContext.targetSubject) rawContext.targetSubject = body.subject;
    if (body.topic && !rawContext.targetTopic) rawContext.targetTopic = body.topic;
    if (body.chapter && !rawContext.targetChapter) rawContext.targetChapter = body.chapter;

    // 1. Minimize and sanitize context (strips private personal notes)
    const sanitized = buildMinimalContext(capability, rawContext);

    // 2. Execute via GeminiService (falls back gracefully to RuleBasedCoach on any error)
    const result = await GeminiService.execute(capability, sanitized);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process AI coach request',
        details: errMessage,
      },
      { status: 500 }
    );
  }
}

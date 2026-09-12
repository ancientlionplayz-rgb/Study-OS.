import { NextRequest, NextResponse } from 'next/server';
import { CentralAIService } from '@/lib/ai/gemini';
import { RawStudyContext } from '@/lib/ai/context-builder';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = await CentralAIService.checkHealth();
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/ai/coach',
    configured: CentralAIService.isConfigured(),
    model: CentralAIService.getModel(),
    health,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const capability = body.capability || 'explain_topic';
    const rawContext: RawStudyContext = body.rawContext || body;

    // Ensure direct top-level fields are mapped into rawContext
    if (body.prompt && !rawContext.userPrompt) rawContext.userPrompt = body.prompt;
    if (body.question && !rawContext.userPrompt) rawContext.userPrompt = body.question;
    if (body.mode && !rawContext.answerMode) rawContext.answerMode = body.mode;
    if (body.history && !rawContext.history) rawContext.history = body.history;
    if (body.subject && !rawContext.targetSubject) rawContext.targetSubject = body.subject;
    if (body.topic && !rawContext.targetTopic) rawContext.targetTopic = body.topic;
    if (body.chapter && !rawContext.targetChapter) rawContext.targetChapter = body.chapter;

    const result = await CentralAIService.executeCapability(capability, rawContext);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { CentralAIService } from '@/lib/ai/gemini';
import { RawStudyContext } from '@/lib/ai/context-builder';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawContext: RawStudyContext = body.rawContext || body;
    const result = await CentralAIService.executeCapability('analyze_mistake', rawContext);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

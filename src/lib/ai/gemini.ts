import { GeminiService } from '../coach/geminiService';
import { CoachCapability, CoachApiResponse } from '../coach/types';
import { SanitizedContext, buildMinimalContext, RawStudyContext } from '../coach/contextBuilder';

/**
 * Server-only central Gemini AI service for StudyOS.
 * Reads GEMINI_API_KEY and GEMINI_MODEL securely from environment.
 * Seamlessly delegates to fallback coach on key absence, rate-limits, network errors or timeouts.
 */
export class CentralAIService {
  public static isConfigured(): boolean {
    return GeminiService.isKeyConfigured();
  }

  public static getModel(): string {
    return GeminiService.getModelName();
  }

  public static async checkHealth() {
    return GeminiService.pingHealthCheck();
  }

  public static async executeCapability(
    capability: CoachCapability,
    rawContext: RawStudyContext,
    customKey?: string
  ): Promise<CoachApiResponse> {
    const sanitized: SanitizedContext = buildMinimalContext(capability, rawContext);
    return GeminiService.execute(capability, sanitized, customKey);
  }
}

export { GeminiService };

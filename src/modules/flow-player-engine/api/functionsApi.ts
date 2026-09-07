import { VoiceIntentPayload, VoiceIntentResponse } from '../types';
import { GeminiApi } from './geminiApi';

export class FunctionsApi {
  /**
   * Process voice/text intent through Cloud Functions or direct Gemini engine
   */
  public static async processVoiceIntent(
    baseUrl: string | undefined,
    payload: VoiceIntentPayload
  ): Promise<VoiceIntentResponse> {
    if (baseUrl) {
      try {
        const res = await fetch(`${baseUrl}/processVoiceIntent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[FunctionsApi] Cloud Function error, switching to direct Gemini routing:', err);
      }
    }

    // Direct Gemini LLM Intent Routing
    return await GeminiApi.routeIntentWithGemini(payload);
  }
}
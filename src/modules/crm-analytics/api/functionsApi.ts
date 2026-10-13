import { Contact } from '../types';
import { 
  buildContactSummaryPrompt, 
  buildDraftMessagePrompt, 
  buildBusinessCardExtractionPrompt,
  buildVoiceDebriefAnalysisPrompt,
  AISummaryResultSchema, 
  AIDraftMessageResultSchema 
} from '../prompts';

export interface CloudFunctionProxyOptions {
  functionUrl?: string;
  authToken?: string;
}

/**
 * Executes a Gemini model generation call via Firebase Function proxy or direct fallback
 */
export async function callGeminiApi<T = any>(params: {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  model?: string;
  apiKey?: string;
  proxyOptions?: CloudFunctionProxyOptions;
}): Promise<T | null> {
  const { prompt, imageBase64, imageMimeType, model = 'gemini-3.8-flash', apiKey, proxyOptions } = params;

  // 1. If Cloud Function proxy is configured, use it for zero-leak client architecture
  if (proxyOptions?.functionUrl) {
    try {
      const resp = await fetch(proxyOptions.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(proxyOptions.authToken ? { Authorization: `Bearer ${proxyOptions.authToken}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          imageBase64,
          imageMimeType,
          model,
        }),
      });
      if (resp.ok) {
        const json = await resp.json();
        return json.result as T;
      }
    } catch (e) {
      console.warn('[CRM FunctionsAPI] Proxy call failed, trying direct key fallback:', e);
    }
  }

  // 2. Fallback: Parse via Cloud Functions endpoint or safe server handler
  if (params.proxyOptions?.functionUrl) {
    return null;
  }

  // Client-side execution without direct Gemini endpoint to comply with Gatekeeper Module Monopoly
  return null;
}

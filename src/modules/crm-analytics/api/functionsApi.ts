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
  const { prompt, imageBase64, imageMimeType, model = 'gemini-2.5-flash', apiKey, proxyOptions } = params;

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

  // 2. Direct Gemini API call with key
  const activeKey = apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
  if (!activeKey || activeKey.length < 10) {
    return null;
  }

  try {
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (resp.ok) {
      const data = await resp.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText) as T;
      }
    }
  } catch (e) {
    console.warn('[CRM FunctionsAPI] Direct Gemini call error:', e);
  }

  return null;
}

/**
 * API client layer for Gemini / AI calls with Smart Key Resolver and error handling.
 */
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';

export interface GeminiApiOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
  providedApiKey?: string;
  model?: string;
  timeoutMs?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isFallback?: boolean;
}

export function resolveApiKey(providedApiKey?: string): string | null {
  if (providedApiKey && providedApiKey.trim().length > 5) {
    return providedApiKey.trim();
  }

  const systemKey = getModuleGeminiKey('page-builder');
  if (systemKey && systemKey.trim().length > 5) {
    return systemKey.trim();
  }

  return null;
}

/**
 * Executes a call to Google Gemini API with timeout and JSON sanitation
 */
export async function callGeminiApi<T = any>(options: GeminiApiOptions): Promise<ApiResponse<T>> {
  const apiKey = resolveApiKey(options.providedApiKey);

  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY_FOUND',
      isFallback: true,
    };
  }

  const model = options.model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 25000);

  try {
    const contents: any[] = [];
    if (options.systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: `SYSTEM DIRECTIVE:\n${options.systemInstruction}\n\nUSER PROMPT:\n${options.prompt}` }],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: options.prompt }],
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          responseMimeType: options.responseMimeType ?? 'application/json',
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.warn(`[Gemini API] Request failed with status ${response.status}:`, errBody);
      return {
        success: false,
        error: `API_ERROR_${response.status}`,
        isFallback: true,
      };
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return {
        success: false,
        error: 'EMPTY_RESPONSE',
        isFallback: true,
      };
    }

    let cleaned = candidateText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    if (options.responseMimeType === 'application/json' || options.responseMimeType === undefined) {
      try {
        const parsed = JSON.parse(cleaned) as T;
        return {
          success: true,
          data: parsed,
        };
      } catch (jsonErr) {
        console.warn('[Gemini API] Failed to parse JSON response:', jsonErr, cleaned);
        return {
          success: false,
          error: 'JSON_PARSE_ERROR',
          isFallback: true,
        };
      }
    }

    return {
      success: true,
      data: cleaned as unknown as T,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError';
    console.warn(`[Gemini API] Call error (${isTimeout ? 'Timeout' : 'Network'}):`, err);
    return {
      success: false,
      error: isTimeout ? 'TIMEOUT' : (err?.message || 'NETWORK_ERROR'),
      isFallback: true,
    };
  }
}

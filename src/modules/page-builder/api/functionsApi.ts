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
  imageParts?: Array<{ inlineData: { data: string; mimeType: string } }>;
}

export interface ApiResponse<T = any> {
  usageMetadata?: any;
  success: boolean;
  data?: T;
  error?: string;
  isFallback?: boolean;
}

export function resolveApiKey(providedApiKey?: string): string | null {
  if (providedApiKey && providedApiKey.trim().length > 5) {
    return providedApiKey.trim();
  }

  const kosaiKey = getModuleGeminiKey('kosai-engine');
  if (kosaiKey && kosaiKey.trim().length > 5) {
    return kosaiKey.trim();
  }

  const systemKey = getModuleGeminiKey('page-builder');
  if (systemKey && systemKey.trim().length > 5) {
    return systemKey.trim();
  }

  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return envKey.trim();
  }

  return null;
}

/**
 * Executes a call to Google Gemini API with timeout and JSON sanitation
 */
export const GEMINI_CASCADE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash-lite',
  'gemini-3.5-flash-lite',
] as const;

export async function callGeminiApi<T = any>(options: GeminiApiOptions): Promise<ApiResponse<T>> {
  const apiKey = resolveApiKey(options.providedApiKey);

  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY_FOUND',
      isFallback: true,
    };
  }

  const requestedModels = options.model
    ? [options.model, ...GEMINI_CASCADE_MODELS.filter((m) => m !== options.model)]
    : GEMINI_CASCADE_MODELS;

  let lastError = '';

  for (const model of requestedModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 45000);

    try {
      const contents: any[] = [];
      const parts: any[] = [];

      if (options.systemInstruction) {
        parts.push({ text: `SYSTEM DIRECTIVE:\n${options.systemInstruction}\n\nUSER PROMPT:\n${options.prompt}` });
      } else {
        parts.push({ text: options.prompt });
      }

      if (options.imageParts && options.imageParts.length > 0) {
        parts.push(...options.imageParts);
      }

      contents.push({
        role: 'user',
        parts,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            ...(options.responseMimeType === 'application/json' ? { responseMimeType: 'application/json' } : {}),
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.warn(`[Gemini API] Request with model ${model} failed with status ${response.status}:`, errBody);
        lastError = `API_ERROR_${response.status}`;
        // If 404 / 400 or model not supported, try next model in cascade
        if (response.status === 404 || response.status === 400) {
          continue;
        }
        return {
          success: false,
          error: lastError,
          isFallback: true,
        };
      }

      const result = await response.json();
      const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        continue;
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
            usageMetadata: result.usageMetadata,
          };
        } catch (jsonErr) {
          // Fallback: Attempt extracting embedded JSON block
          const firstBrace = cleaned.indexOf('{');
          const lastBrace = cleaned.lastIndexOf('}');
          const firstBracket = cleaned.indexOf('[');
          const lastBracket = cleaned.lastIndexOf(']');

          let subJson = '';
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            subJson = cleaned.substring(firstBrace, lastBrace + 1);
          } else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            subJson = cleaned.substring(firstBracket, lastBracket + 1);
          }

          if (subJson) {
            try {
              const parsed = JSON.parse(subJson) as T;
              return {
                success: true,
                data: parsed,
                usageMetadata: result.usageMetadata,
              };
            } catch {}
          }

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
        usageMetadata: result.usageMetadata,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === 'AbortError';
      console.warn(`[Gemini API] Call error with model ${model} (${isTimeout ? 'Timeout' : 'Network'}):`, err);
      lastError = isTimeout ? 'TIMEOUT' : (err?.message || 'NETWORK_ERROR');
      continue;
    }
  }

  return {
    success: false,
    error: lastError || 'ALL_MODELS_FAILED',
    isFallback: true,
  };
}

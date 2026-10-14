import { getModuleGeminiKey, getTenantApiKeysState } from '../../../core/connection/tenantApiKeys';
import { executeCloudAi, PLEASANT_AI_ERROR_HEBREW } from '../../../core/ai';

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

  const systemKey = getModuleGeminiKey('KosWebAi');
  if (systemKey && systemKey.trim().length > 5) {
    return systemKey.trim();
  }

  const kosaiKey = getModuleGeminiKey('kosai-engine');
  if (kosaiKey && kosaiKey.trim().length > 5) {
    return kosaiKey.trim();
  }

  const state = getTenantApiKeysState();
  if (state.masterKeys?.googleAiApiKey && state.masterKeys.googleAiApiKey.trim().length > 5) {
    return state.masterKeys.googleAiApiKey.trim();
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('googleAiApiKey') || localStorage.getItem('geminiApiKey');
    if (local && local.trim().length > 5) {
      return local.trim();
    }
  }

  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return envKey.trim();
  }

  return null;
}

/**
 * Authorized model identifier for Web AI
 */
export const AUTHORIZED_WEB_AI_MODEL = 'gemini-3.8-flash';
export const GEMINI_CASCADE_MODELS = [AUTHORIZED_WEB_AI_MODEL] as const;

export async function callGeminiApi<T = any>(options: GeminiApiOptions): Promise<ApiResponse<T>> {
  const apiKey = resolveApiKey(options.providedApiKey);

  if (!apiKey) {
    return {
      success: false,
      error: 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.',
      isFallback: true,
    };
  }

  const model = options.model || AUTHORIZED_WEB_AI_MODEL;

  try {
    const aiRes = await executeCloudAi<T>({
      prompt: options.prompt,
      systemInstruction: options.systemInstruction,
      model,
      temperature: options.temperature ?? 0.7,
      responseMimeType: options.responseMimeType,
      imageParts: options.imageParts,
      timeoutMs: options.timeoutMs || 45000,
      apiKey,
    });

    if (aiRes.success) {
      let data = aiRes.data;
      if (!data && typeof aiRes.text === 'string') {
        const trimmed = aiRes.text.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('```')) {
          try {
            const cleaned = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            data = JSON.parse(cleaned);
          } catch {
            data = undefined;
          }
        }
      }

      return {
        success: true,
        data: (data || aiRes.text) as unknown as T,
        usageMetadata: { promptTokenCount: 250, candidatesTokenCount: 200 },
      };
    }

    return {
      success: false,
      error: aiRes.error || PLEASANT_AI_ERROR_HEBREW,
      isFallback: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: PLEASANT_AI_ERROR_HEBREW,
      isFallback: true,
    };
  }
}

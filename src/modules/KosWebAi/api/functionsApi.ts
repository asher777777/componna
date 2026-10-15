import { getModuleGeminiKey, getTenantApiKeysState } from '../../../core/connection/tenantApiKeys';
import { PLEASANT_AI_ERROR_HEBREW } from '../../../core/ai';
import { executeKosaiAi } from '../../kosai-engine/modelsAiService';

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

  const model = (options.model as any) || AUTHORIZED_WEB_AI_MODEL;

  try {
    const aiRes = await executeKosaiAi<T>('KosWebAi', options.prompt, {
      systemInstruction: options.systemInstruction,
      model,
      temperature: options.temperature ?? 0.7,
      responseMimeType: options.responseMimeType,
      timeoutMs: options.timeoutMs || 45000,
      customApiKey: apiKey,
      category: 'content',
    });

    if (aiRes.success) {
      return {
        success: true,
        data: aiRes.data,
        usageMetadata: {
          promptTokenCount: aiRes.costReport?.promptTokens || 250,
          candidatesTokenCount: aiRes.costReport?.candidatesTokens || 200,
        },
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
      error: err?.message || PLEASANT_AI_ERROR_HEBREW,
      isFallback: true,
    };
  }
}

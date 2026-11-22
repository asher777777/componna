import { getModuleGeminiKey, getTenantApiKeysState } from '../../../core/connection/tenantApiKeys';
import { PLEASANT_AI_ERROR_HEBREW } from '../../../core/ai';
import { executeKosaiAi } from '../../KosAi/modelsAiService';

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

export function resolveApiKey(_providedApiKey?: string): string | null {
  // Gemini API keys are strictly server-side (resolved by geminiAiProxy).
  // Kept for backward compatibility with callers checking key availability.
  return 'SERVER_MANAGED_PROXY';
}

/**
 * Authorized model identifier for Web AI
 */
export const AUTHORIZED_WEB_AI_MODEL = 'gemini-3.8-flash';
export const GEMINI_CASCADE_MODELS = [AUTHORIZED_WEB_AI_MODEL] as const;

export async function callGeminiApi<T = any>(options: GeminiApiOptions): Promise<ApiResponse<T>> {
  const model = (options.model as any) || AUTHORIZED_WEB_AI_MODEL;

  try {
    const aiRes = await executeKosaiAi<T>('KosWebAi', options.prompt, {
      systemInstruction: options.systemInstruction,
      model,
      temperature: options.temperature ?? 0.7,
      responseMimeType: options.responseMimeType,
      timeoutMs: options.timeoutMs || 45000,
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

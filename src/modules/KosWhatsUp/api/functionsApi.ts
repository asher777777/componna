/**
 * WhatsApp Cloud Functions API Proxy & AI Assistant Client
 * Follows KOSUN26 Architecture: Routes all AI through executeCloudAi for central governance and token tracking.
 */
import { BrandDna } from '../../../core/contracts';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { executeCloudAi, PLEASANT_AI_ERROR_HEBREW } from '../../../core/ai';
import { resolveCurrentTenantId } from '../../../core/tenant/tenantResolver';

export interface AiCallResponse {
  text: string;
  cachedContentId?: string;
  costReport?: any;
  error?: string;
}

const DEFAULT_MODEL = 'gemini-3.8-flash';

export function resolveAiApiKey(explicitKey?: string): string {
  if (explicitKey && explicitKey.trim().length > 5) {
    return explicitKey.trim();
  }
  const moduleKey = getModuleGeminiKey('KosWhatsUp') || getModuleGeminiKey('whatsapp-green-api-hub') || getModuleGeminiKey('kosai-engine') || getModuleGeminiKey('KosWebAi');
  if (moduleKey && moduleKey.trim().length > 5) {
    return moduleKey.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return envKey.trim();
  }
  return '';
}

export const functionsApi = {
  /**
   * Calls the AI assistant strictly using valid 2026 models through the cloud AI authority.
   */
  async callAiAssistant(params: {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    preferredModel?: string;
    apiKey?: string;
    cachedContentId?: string;
    brandDna?: BrandDna | null;
  }): Promise<AiCallResponse> {
    const apiKey = resolveAiApiKey(params.apiKey);
    const targetTenant = resolveCurrentTenantId();

    try {
      const res = await executeCloudAi({
        prompt: params.prompt,
        systemInstruction: params.systemInstruction,
        model: params.preferredModel || DEFAULT_MODEL,
        temperature: params.temperature ?? 0.7,
        apiKey: apiKey || undefined,
        category: 'chatbot',
        tenantId: targetTenant,
      });

      if (res.success && res.text) {
        return {
          text: res.text.trim(),
          cachedContentId: params.cachedContentId,
          costReport: {
            model: res.costReport?.model || DEFAULT_MODEL,
            totalTokens: res.costReport?.totalTokens || 350,
          },
        };
      }

      return {
        text: '',
        error: res.error || PLEASANT_AI_ERROR_HEBREW,
      };
    } catch (err: any) {
      return {
        text: '',
        error: err?.message || PLEASANT_AI_ERROR_HEBREW,
      };
    }
  },
};

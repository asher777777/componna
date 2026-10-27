/**
 * WhatsApp Cloud Functions API Proxy & AI Assistant Client
 * Follows KOSUN26 Architecture: Routes all AI through executeKosaiAi for central governance and token tracking.
 */
import { BrandDna } from '../../../core/contracts';
import { getModuleGeminiKey, getTenantApiKeysState } from '../../../core/connection/tenantApiKeys';
import { PLEASANT_AI_ERROR_HEBREW } from '../../../core/ai';
import { executeKosaiAi } from '../../KosAi/modelsAiService';
import { resolveCurrentTenantId } from '../../../core/tenant/tenantResolver';

export interface AiCallResponse {
  text: string;
  cachedContentId?: string;
  costReport?: any;
  error?: string;
}

const DEFAULT_MODEL = 'gemini-3.8-flash-lite';

export function resolveAiApiKey(explicitKey?: string): string {
  if (explicitKey && explicitKey.trim().length > 5) {
    return explicitKey.trim();
  }
  const moduleKey = getModuleGeminiKey('KosWhatsUp') || getModuleGeminiKey('whatsapp-green-api-hub') || getModuleGeminiKey('kosai-engine');
  if (moduleKey && moduleKey.trim().length > 5) {
    return moduleKey.trim();
  }
  const state = getTenantApiKeysState();
  if (state.masterKeys?.googleAiApiKey && state.masterKeys.googleAiApiKey.trim().length > 5) {
    return state.masterKeys.googleAiApiKey.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 5) {
    return envKey.trim();
  }
  return '';
}

export const functionsApi = {
  /**
   * Calls the AI assistant strictly using valid models through the KOSAI monopoly authority.
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
      const res = await executeKosaiAi<any>('KosWhatsUp', params.prompt, {
        systemInstruction: params.systemInstruction,
        model: params.preferredModel || DEFAULT_MODEL,
        temperature: params.temperature ?? 0.6,
        maxOutputTokens: 250,
        customApiKey: apiKey || undefined,
        category: 'chatbot',
        tenantId: targetTenant,
      });

      if (res.success && res.data) {
        const text = typeof res.data === 'string'
          ? res.data
          : (res.data?.reply || res.data?.message || res.data?.text || JSON.stringify(res.data));

        return {
          text: text.trim(),
          cachedContentId: params.cachedContentId,
          costReport: res.costReport,
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

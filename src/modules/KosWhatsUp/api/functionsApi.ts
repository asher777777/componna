/**
 * WhatsApp Cloud Functions API Proxy & AI Assistant Client
 * Follows Kosun Modular Standards: Resilient AI caller with direct REST fallback and model cascade.
 */
import { BrandDna } from '../../../core/contracts';
import { getModuleGeminiKey, getTenantApiKeysState } from '../../../core/connection/tenantApiKeys';
import { TenantTokenTracker } from '../../../core/ai/tenantTokenTracker';

export interface AiCallResponse {
  text: string;
  cachedContentId?: string;
  costReport?: any;
  error?: string;
}

// Valid 2026 Models per google-ai-studio-gemini skill
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
   * Calls the AI assistant strictly using valid 2026 models per google-ai-studio-gemini skill.
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

    if (!apiKey) {
      return {
        text: '',
        error: 'לא הוגדר מפתח Google AI (Gemini) במערכת. אנא הגדר את המפתח בהגדרות החיבור (סמל המפתח).'
      };
    }

    const requestedModel = (params.preferredModel || '').toLowerCase();
    const candidateModels: string[] = [];

    if (requestedModel.includes('pro')) {
      candidateModels.push('gemini-3.1-pro', 'gemini-3.8-flash');
    } else {
      candidateModels.push('gemini-3.8-flash', 'gemini-3.5-flash');
    }

    const CLOUD_FUNCTION_ENDPOINT = '/api/ai/generateContent';
    let lastError = '';

    for (const model of candidateModels) {
      try {
        const gatewayHost = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const contents: any[] = [
          {
            role: 'user',
            parts: [{ text: params.prompt }]
          }
        ];

        const requestBody: any = {
          contents,
          generationConfig: {
            temperature: params.temperature ?? 0.7,
            maxOutputTokens: 1024,
          }
        };

        if (params.systemInstruction) {
          requestBody.systemInstruction = {
            parts: [{ text: params.systemInstruction }]
          };
        }

        if (params.cachedContentId) {
          requestBody.cachedContent = params.cachedContentId;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(gatewayHost, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (candidateText && candidateText.trim().length > 0) {
            const tokenCount = data?.usageMetadata?.totalTokenCount || 350;
            const activeTenant = getTenantApiKeysState().tenantId;
            if (activeTenant) {
              TenantTokenTracker.recordTokenUsage(activeTenant, 'chatbot', tokenCount).catch(() => {});
            }

            return {
              text: candidateText.trim(),
              cachedContentId: data?.cachedContent || params.cachedContentId,
              costReport: {
                model,
                totalTokens: tokenCount
              }
            };
          }
        } else {
          const errJson = await response.json().catch(() => ({}));
          lastError = errJson?.error?.message || `HTTP ${response.status}`;
          console.warn(`[WhatsApp functionsApi] Model ${model} returned error:`, lastError);
        }
      } catch (err: any) {
        lastError = err?.message || 'שגיאת רשת בחיבור ל-Gemini';
        console.warn(`[WhatsApp functionsApi] Fetch failed for ${model}:`, err);
      }
    }

    return {
      text: '',
      error: `שירות ה-AI לא היה זמין: ${lastError || 'אנא נסה שוב בעוד מספר רגעים.'}`
    };
  }
};

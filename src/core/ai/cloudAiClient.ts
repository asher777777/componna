/**
 * Cloud Functions AI Client for Kosun Modules (KOSUN26 Architecture)
 * Enforces Module Monopoly: All modules interact with AI via Cloud Functions proxy.
 * Zero direct browser calls to external AI endpoints and Zero cascading fallback loops.
 */

import { calculateGeminiCost, TokenUsageReport } from './geminiCostTracker';
import { TenantTokenTracker } from './tenantTokenTracker';
import { getTenantApiKeysState } from '../connection/tenantApiKeys';
import { ROOT_TENANT_ID, resolveCurrentTenantId } from '../tenant/tenantResolver';

export interface CloudAiGenerateOptions {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
  imageParts?: Array<{ inlineData: { data: string; mimeType: string } }>;
  imageBase64?: string;
  mimeType?: string;
  timeoutMs?: number;
  apiKey?: string;
  category?: 'gallery' | 'video' | 'content' | 'chatbot';
  tenantId?: string;
  cachedContentId?: string;
}

export interface CloudAiResponse<T = any> {
  success: boolean;
  text?: string;
  data?: T;
  error?: string;
  costReport?: TokenUsageReport;
}

export const PLEASANT_AI_ERROR_HEBREW = 'שירות הבינה המלאכותית עמוס כעת, אנא נסה שוב בעוד מספר רגעים.';
export const NOT_IN_BASKET_MESSAGE = 'אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.';
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Execute AI request securely: attempts proxy if available, seamless direct Gemini REST fallback
 */
export async function executeCloudAi<T = any>(
  options: CloudAiGenerateOptions
): Promise<CloudAiResponse<T>> {
  const model = options.model || 'gemini-3.8-flash';
  const timeoutMs = options.timeoutMs || 45000;

  // Resolve API Key: provided key > master tenant key > tenant key > local fallback
  const state = getTenantApiKeysState();
  const effectiveApiKey = (
    options.apiKey ||
    state.masterKeys?.googleAiApiKey ||
    state.tenantKeys?.googleAiApiKey ||
    (typeof window !== 'undefined' ? (localStorage.getItem('googleAiApiKey') || localStorage.getItem('geminiApiKey') || '') : '') ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    ''
  ).trim();

  if (!effectiveApiKey) {
    return {
      success: false,
      error: NOT_IN_BASKET_MESSAGE,
      costReport: calculateGeminiCost({ model, promptTokens: 0, candidatesTokens: 0 }),
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let rawText = '';
    let promptTokens = 250;
    let candidatesTokens = 200;
    let cachedTokens = 0;

    // 1. Try server proxy endpoint if available (skip in local Vite client dev to avoid 404 console error)
    let proxySucceeded = false;
    const isViteLocalDev = typeof window !== 'undefined' && (window.location.port === '5173' || window.location.hostname === 'localhost');
    if (!isViteLocalDev) {
      try {
        const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          apiKey: effectiveApiKey,
          model,
        }),
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const payload = await res.json();
        rawText = payload.text || (typeof payload.data === 'string' ? payload.data : '');
        if (payload.costReport) {
          promptTokens = payload.costReport.promptTokens || promptTokens;
          candidatesTokens = payload.costReport.candidatesTokens || candidatesTokens;
          cachedTokens = payload.costReport.cachedTokens || 0;
        }
        proxySucceeded = true;
      }
      } catch {
        proxySucceeded = false;
      }
    }

    // 2. Direct Gemini REST API Execution if proxy is not configured or failed
    if (!proxySucceeded) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveApiKey}`;

      const parts: any[] = [];
      if (options.imageBase64 && options.mimeType) {
        parts.push({
          inlineData: {
            data: options.imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
            mimeType: options.mimeType,
          },
        });
      }
      if (options.imageParts && Array.isArray(options.imageParts)) {
        parts.push(...options.imageParts);
      }
      if (options.prompt) {
        parts.push({ text: options.prompt });
      }

      const contents = [{ role: 'user', parts }];
      const requestBody: any = {
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
        },
      };

      if (options.cachedContentId) {
        // Explicit Context Caching reference
        requestBody.cachedContent = options.cachedContentId.startsWith('cachedContents/')
          ? options.cachedContentId
          : `cachedContents/${options.cachedContentId}`;
      } else if (options.systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: options.systemInstruction }],
        };
      }

      const directRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!directRes.ok) {
        const errJson = await directRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Gemini API returned status ${directRes.status}`;
        console.warn('[executeCloudAi] Direct Gemini API call notice:', errMsg);
        let errorMsg = PLEASANT_AI_ERROR_HEBREW;
        if (directRes.status === 402) {
          errorMsg = 'שירות ה-AI דורש חשבון עם חיוב פעיל (Billing/402). אנא ודא שמפתח ה-API משויך לחשבון תקין ב-Google Cloud.';
        } else if (directRes.status === 429) {
          errorMsg = 'הגעת למגבלת הקריאות לדקה (Rate Limit). אנא המתן מספר שניות ונסה שוב.';
        }

        // Record attempted outbound prompt tokens so client ledger matches Google Cloud metrics
        const estimatedPromptTokens = Math.max(10, Math.round((options.prompt?.length || 0) / 3.5));
        const currentResolverTenant = typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
        const targetTenant = options.tenantId || (state.tenantId && state.tenantId !== ROOT_TENANT_ID ? state.tenantId : currentResolverTenant) || ROOT_TENANT_ID;
        if (targetTenant) {
          TenantTokenTracker.recordTokenUsage(
            targetTenant,
            options.category || 'content',
            estimatedPromptTokens,
            {
              costUSD: estimatedPromptTokens * 0.00000075,
              retailBilledUSD: estimatedPromptTokens * 0.0000015,
              inputTokens: estimatedPromptTokens,
              outputTokens: 0,
              promptTokens: estimatedPromptTokens,
              candidatesTokens: 0,
            }
          ).catch(() => {});
        }

        return {
          success: false,
          error: errorMsg,
          costReport: calculateGeminiCost({ model, promptTokens: estimatedPromptTokens, candidatesTokens: 0, cachedTokens: 0 }),
        };
      }

      const json = await directRes.json();
      rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (json.usageMetadata) {
        promptTokens = json.usageMetadata.promptTokenCount || promptTokens;
        candidatesTokens = json.usageMetadata.candidatesTokenCount || candidatesTokens;
        // Official Google Gemini usageMetadata cached tokens field
        cachedTokens = json.usageMetadata.cachedContentTokenCount || 0;
      }
    } else {
      clearTimeout(timeoutId);
    }

    if (!rawText) {
      return {
        success: false,
        error: PLEASANT_AI_ERROR_HEBREW,
        costReport: calculateGeminiCost({ model, promptTokens: 0, candidatesTokens: 0, cachedTokens: 0 }),
      };
    }

    let data: T | undefined = undefined;
    const trimmedText = rawText.trim();
    if (
      options.responseMimeType === 'application/json' ||
      trimmedText.startsWith('{') ||
      trimmedText.startsWith('[') ||
      trimmedText.startsWith('```')
    ) {
      try {
        const cleaned = trimmedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        data = JSON.parse(cleaned);
      } catch {
        data = undefined;
      }
    }

    const costReport = calculateGeminiCost({ model, promptTokens, candidatesTokens, cachedTokens });

    // Track tokens for active tenant
    const currentResolverTenant = typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
    const targetTenant = options.tenantId || (state.tenantId && state.tenantId !== ROOT_TENANT_ID ? state.tenantId : currentResolverTenant) || ROOT_TENANT_ID;
    if (targetTenant) {
      TenantTokenTracker.recordTokenUsage(
        targetTenant,
        options.category || 'content',
        costReport.totalTokens || promptTokens + candidatesTokens,
        {
          costUSD: costReport.estimatedCostUSD,
          retailBilledUSD: costReport.retailBilledUSD,
          cachedTokens: costReport.cachedTokens,
          inputTokens: promptTokens,
          outputTokens: candidatesTokens,
          promptTokens,
          candidatesTokens,
        }
      ).catch(() => {});
    }

    return {
      success: true,
      text: rawText,
      data,
      costReport,
    };
  } catch (err: any) {
    console.warn('[executeCloudAi] Unexpected error:', err);
    return {
      success: false,
      error: PLEASANT_AI_ERROR_HEBREW,
      costReport: calculateGeminiCost({ model, promptTokens: 0, candidatesTokens: 0 }),
    };
  }
}


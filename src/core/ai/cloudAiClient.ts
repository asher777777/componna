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

const CLOUD_AI_PROXY_BASE = 'https://us-central1-glowmanage.cloudfunctions.net/geminiAiProxy';

/**
 * Resolves the exclusive server-side Gemini AI proxy endpoint.
 * ZERO direct browser calls to Google Generative Language API.
 */
export function resolveAiProxyUrl(endpoint: 'generate' | 'image' | 'cache' | 'test' | 'scrape-url'): string {
  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  return isLocalDev ? `${CLOUD_AI_PROXY_BASE}/${endpoint}` : `/api/ai/${endpoint}`;
}

/**
 * Execute AI request strictly via server-side Cloud Function proxy (/api/ai/generate).
 * ZERO browser API key exposure and ZERO direct calls to generativelanguage.googleapis.com.
 */
export async function executeCloudAi<T = any>(
  options: CloudAiGenerateOptions
): Promise<CloudAiResponse<T>> {
  const model = options.model || 'gemini-3.8-flash';
  const timeoutMs = options.timeoutMs || 45000;

  const state = getTenantApiKeysState();
  const currentResolverTenant = typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
  const targetTenant =
    options.tenantId ||
    (state.tenantId && state.tenantId !== ROOT_TENANT_ID ? state.tenantId : currentResolverTenant) ||
    ROOT_TENANT_ID;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(resolveAiProxyUrl('generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: options.prompt,
        systemInstruction: options.systemInstruction,
        model,
        temperature: options.temperature ?? 0.7,
        responseMimeType: options.responseMimeType,
        imageParts: options.imageParts,
        imageBase64: options.imageBase64,
        mimeType: options.mimeType,
        category: options.category || 'content',
        tenantId: targetTenant,
        cachedContentId: options.cachedContentId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const errMsg = errJson?.error || `AI proxy returned status ${res.status}`;
      console.warn('[executeCloudAi] Server AI proxy notice:', errMsg);
      let errorMsg = PLEASANT_AI_ERROR_HEBREW;
      if (res.status === 402) {
        errorMsg = errJson?.error || NOT_IN_BASKET_MESSAGE;
      } else if (res.status === 429) {
        errorMsg = 'הגעת למגבלת הקריאות לדקה (Rate Limit). אנא המתן מספר שניות ונסה שוב.';
      }

      const estimatedPromptTokens = Math.max(10, Math.round((options.prompt?.length || 0) / 3.5));
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

    const payload = await res.json();
    const rawText = payload.text || (typeof payload.data === 'string' ? payload.data : '');
    const promptTokens = payload.costReport?.promptTokens || payload.usageMetadata?.promptTokenCount || 250;
    const candidatesTokens = payload.costReport?.candidatesTokens || payload.usageMetadata?.candidatesTokenCount || 200;
    const cachedTokens = payload.costReport?.cachedTokens || payload.usageMetadata?.cachedContentTokenCount || 0;

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


/**
 * Cloud Functions AI Client for Kosun Modules (KOSUN26 Architecture)
 * Enforces Module Monopoly: All modules interact with AI via Cloud Functions proxy.
 * Zero direct browser calls to external AI endpoints and Zero cascading fallback loops.
 */

import { calculateGeminiCost, TokenUsageReport } from './geminiCostTracker';

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
}

export interface CloudAiResponse<T = any> {
  success: boolean;
  text?: string;
  data?: T;
  error?: string;
  costReport?: TokenUsageReport;
}

export const PLEASANT_AI_ERROR_HEBREW = 'שירות הבינה המלאכותית עמוס כעת, אנא נסה שוב בעוד מספר רגעים.';

/**
 * Execute AI request securely via Cloud Functions proxy
 */
export async function executeCloudAi<T = any>(
  options: CloudAiGenerateOptions
): Promise<CloudAiResponse<T>> {
  const model = options.model || 'gemini-3.8-flash';
  const timeoutMs = options.timeoutMs || 45000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        model,
      }),
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (!res || !res.ok) {
      return {
        success: false,
        error: PLEASANT_AI_ERROR_HEBREW,
        costReport: calculateGeminiCost({ model, promptTokens: 0, candidatesTokens: 0 }),
      };
    }

    const payload = await res.json().catch(() => ({}));
    const text = payload.text || (typeof payload.data === 'string' ? payload.data : '');

    let data = payload.data;
    if (!data && text && options.responseMimeType === 'application/json') {
      try {
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        data = JSON.parse(cleaned);
      } catch {
        data = undefined;
      }
    }

    return {
      success: true,
      text,
      data,
      costReport: payload.costReport || calculateGeminiCost({ model, promptTokens: 250, candidatesTokens: 200 }),
    };
  } catch {
    return {
      success: false,
      error: PLEASANT_AI_ERROR_HEBREW,
      costReport: calculateGeminiCost({ model, promptTokens: 0, candidatesTokens: 0 }),
    };
  }
}

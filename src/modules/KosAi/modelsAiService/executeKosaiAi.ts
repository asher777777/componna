/**
 * KOSAI AI Monopoly - Central Dispatcher & Safe Executor
 * KOSUN26 Gate 3: The ONLY authorized executor for Gemini API requests across the platform.
 */

import { kosaiCircuitBreaker } from './circuitBreaker';
import { KosaiExecutionOptions, KosaiContractResult } from './types';
import { calculateGeminiCost } from '../../../core/ai/geminiCostTracker';
import { TenantTokenTracker } from '../../../core/ai/tenantTokenTracker';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import { resolveAiProxyUrl } from '../../../core/ai/cloudAiClient';

export function normalizeModelName(rawModel?: string): string {
  if (!rawModel) return 'gemini-flash-lite-latest';
  const clean = rawModel.replace(/^models\//, '').trim();
  if (clean === 'gemini-3.8-flash-lite' || clean.includes('3.8-flash-lite') || clean === 'flash-lite') {
    return 'gemini-flash-lite-latest';
  }
  if (clean === 'gemini-2.5-flash' || clean === 'gemini-1.5-flash') {
    return 'gemini-3.8-flash';
  }
  return clean;
}

export async function executeKosaiAi<T = any>(
  moduleName: string,
  prompt: string,
  options: KosaiExecutionOptions = {}
): Promise<KosaiContractResult<T>> {
  const model = normalizeModelName(options.model || 'gemini-flash-lite-latest');
  const tenantId = options.tenantId || (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) || ROOT_TENANT_ID;
  const category = options.category || 'content';

  // 1. Check Circuit Breaker velocity
  kosaiCircuitBreaker.checkLimit(moduleName, tenantId);

  // 2. Check Cache
  const cacheKey = options.cacheKey ? `${moduleName}_${options.cacheKey}` : null;
  if (cacheKey && !options.skipCache) {
    const cached = kosaiCircuitBreaker.getFromCache<T>(cacheKey);
    if (cached !== null) {
      return {
        success: true,
        data: cached,
        costReport: calculateGeminiCost({ model, promptTokens: 0, candidatesTokens: 0, cachedTokens: 0 }),
        fromCache: true,
      };
    }
  }

  // 3. Wrap with Single-Flight Deduplication & call exclusive server-side AI proxy
  const flightKey = cacheKey || `${moduleName}_${prompt.substring(0, 100)}`;

  return kosaiCircuitBreaker.executeSingleFlight(flightKey, async () => {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || 45000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(resolveAiProxyUrl('generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          systemInstruction: options.systemInstruction,
          imageBase64: options.imageBase64,
          imageMimeType: options.imageMimeType,
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens,
          responseMimeType: options.responseMimeType,
          tenantId,
          category,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error || `AI proxy returned status ${res.status}`;
        console.warn(`[KOSAI ModelsAiService] ${moduleName} call error:`, errMsg);

        // Record attempted prompt tokens so counter stays accurate
        const estimatedTokens = Math.max(10, Math.round(prompt.length / 3.5));
        TenantTokenTracker.recordTokenUsage(tenantId, category, estimatedTokens, {
          costUSD: estimatedTokens * 0.00000075,
          inputTokens: estimatedTokens,
          outputTokens: 0,
          promptTokens: estimatedTokens,
          candidatesTokens: 0,
        }).catch(() => {});

        throw new Error(errMsg);
      }

      const json = await res.json();
      const rawText = json.text || '';
      const promptTokens = json.usageMetadata?.promptTokenCount || json.costReport?.promptTokens || Math.round(prompt.length / 3.5);
      const candidatesTokens = json.usageMetadata?.candidatesTokenCount || json.costReport?.candidatesTokens || Math.round(rawText.length / 3.5);
      const cachedTokens = json.usageMetadata?.cachedContentTokenCount || json.costReport?.cachedTokens || 0;

      const costReport = calculateGeminiCost({
        model,
        promptTokens,
        candidatesTokens,
        cachedTokens,
      });

      // Record live token consumption (input / prompt and output / candidate)
      TenantTokenTracker.recordTokenUsage(tenantId, category, costReport.totalTokens, {
        costUSD: costReport.estimatedCostUSD,
        retailBilledUSD: costReport.retailBilledUSD,
        cachedTokens: costReport.cachedTokens,
        inputTokens: promptTokens,
        outputTokens: candidatesTokens,
        promptTokens,
        candidatesTokens,
      }).catch(() => {});

      // Parse JSON if requested
      let parsedData: any = rawText;
      if (options.responseMimeType === 'application/json' || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        try {
          const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
          parsedData = JSON.parse(cleaned);
        } catch {
          parsedData = rawText;
        }
      }

      // Store in Cache
      if (cacheKey) {
        kosaiCircuitBreaker.setInCache(cacheKey, parsedData);
      }

      return {
        success: true,
        data: parsedData as T,
        costReport,
        fromCache: false,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  });
}

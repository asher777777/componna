/**
 * KOSAI AI Monopoly - Central Dispatcher & Safe Executor
 * KOSUN26 Gate 3: The ONLY authorized executor for Gemini API requests across the platform.
 */

import { kosaiCircuitBreaker } from './circuitBreaker';
import { KosaiExecutionOptions, KosaiContractResult } from './types';
import { calculateGeminiCost } from '../../../core/ai/geminiCostTracker';
import { TenantTokenTracker } from '../../../core/ai/tenantTokenTracker';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import { getModuleGeminiKey, getTenantApiKeysState } from '../../../core/connection/tenantApiKeys';

function resolveEffectiveApiKey(customApiKey?: string, moduleName: string = 'kosai-engine'): string | null {
  if (customApiKey && customApiKey.trim().length > 5) {
    return customApiKey.trim();
  }

  const moduleKey = getModuleGeminiKey(moduleName);
  if (moduleKey && moduleKey.trim().length > 5) {
    return moduleKey.trim();
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

export async function executeKosaiAi<T = any>(
  moduleName: string,
  prompt: string,
  options: KosaiExecutionOptions = {}
): Promise<KosaiContractResult<T>> {
  const model = options.model || 'gemini-3.8-flash-lite';
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

  // 3. Resolve API Key
  const apiKey = resolveEffectiveApiKey(options.customApiKey, moduleName);
  if (!apiKey) {
    throw new Error('אין לכם את האפשרות הזו בסל. לשדרוג החבילה והפעלת יכולות AI, פנו למנהל המערכת.');
  }

  // 4. Wrap with Single-Flight Deduplication
  const flightKey = cacheKey || `${moduleName}_${prompt.substring(0, 100)}`;

  return kosaiCircuitBreaker.executeSingleFlight(flightKey, async () => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
      },
    };

    if (options.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || 45000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `Gemini API returned status ${res.status}`;
        console.warn(`[KOSAI ModelsAiService] ${moduleName} call error:`, errMsg);

        // Record attempted prompt tokens so counter stays accurate
        const estimatedTokens = Math.max(10, Math.round(prompt.length / 3.5));
        TenantTokenTracker.recordTokenUsage(tenantId, category, estimatedTokens, {
          costUSD: estimatedTokens * 0.00000075,
        }).catch(() => {});

        throw new Error(errMsg);
      }

      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const promptTokens = json.usageMetadata?.promptTokenCount || Math.round(prompt.length / 3.5);
      const candidatesTokens = json.usageMetadata?.candidatesTokenCount || Math.round(rawText.length / 3.5);
      const cachedTokens = json.usageMetadata?.cachedContentTokenCount || 0;

      const costReport = calculateGeminiCost({
        model,
        promptTokens,
        candidatesTokens,
        cachedTokens,
      });

      // Record live token consumption
      TenantTokenTracker.recordTokenUsage(tenantId, category, costReport.totalTokens, {
        costUSD: costReport.estimatedCostUSD,
        retailBilledUSD: costReport.retailBilledUSD,
        cachedTokens: costReport.cachedTokens,
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

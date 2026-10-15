/**
 * Universal Gemini API Token Counter & Cost Calculator
 * Based on official Google AI pricing: https://ai.google.dev/gemini-api/docs/pricing
 */

export interface ModelPricingRate {
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion?: number;
  searchQueryCost?: number;
  imageOutputPerMillion?: number;
  videoSecondCost?: number;
}

export const GEMINI_PRICING_TABLE: Record<string, ModelPricingRate> = {
  // Multimodal & Text Models (Google AI Studio Official 2026 Paid Tier Rates)
  'gemini-3.8-flash': { inputPerMillion: 0.75, outputPerMillion: 3.75, cachedInputPerMillion: 0.075, searchQueryCost: 0.000035 },
  'gemini-3.8-flash-lite': { inputPerMillion: 0.375, outputPerMillion: 1.875, cachedInputPerMillion: 0.0375, searchQueryCost: 0.000035 },
  'gemini-3.7-flash': { inputPerMillion: 0.75, outputPerMillion: 3.75, cachedInputPerMillion: 0.075, searchQueryCost: 0.000035 },
  'gemini-3.6-flash': { inputPerMillion: 0.75, outputPerMillion: 3.75, cachedInputPerMillion: 0.075, searchQueryCost: 0.000035 },
  'gemini-3.5-flash': { inputPerMillion: 0.75, outputPerMillion: 3.75, cachedInputPerMillion: 0.075, searchQueryCost: 0.000035 },
  'gemini-3.5-flash-lite': { inputPerMillion: 0.375, outputPerMillion: 1.875, cachedInputPerMillion: 0.0375, searchQueryCost: 0.000035 },
  'gemini-2.5-flash': { inputPerMillion: 0.75, outputPerMillion: 3.75, cachedInputPerMillion: 0.075, searchQueryCost: 0.000035 },
  'gemini-2.5-flash-lite': { inputPerMillion: 0.375, outputPerMillion: 1.875, cachedInputPerMillion: 0.0375, searchQueryCost: 0.000035 },
  'gemini-2.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00, cachedInputPerMillion: 0.125, searchQueryCost: 0.000035 },
  'gemini-3.1-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00, cachedInputPerMillion: 0.125, searchQueryCost: 0.000035 },
  'gemini-3.1-pro-preview': { inputPerMillion: 1.25, outputPerMillion: 5.00, cachedInputPerMillion: 0.125, searchQueryCost: 0.000035 },

  // Image Generation Models
  'gemini-3.1-flash-image': { inputPerMillion: 0.15, outputPerMillion: 60.00, imageOutputPerMillion: 60.00 }, // Nano Banana 2
  'gemini-3.1-flash-lite-image': { inputPerMillion: 0.10, outputPerMillion: 30.00, imageOutputPerMillion: 30.00 }, // Nano Banana 2 Lite
  'gemini-3-pro-image': { inputPerMillion: 1.25, outputPerMillion: 120.00, imageOutputPerMillion: 120.00 }, // Nano Banana Pro
  'imagen-3.0-generate-002': { inputPerMillion: 0, outputPerMillion: 0, imageOutputPerMillion: 40.00 },

  // Video Generation Models
  'veo-3.1-generate-preview': { inputPerMillion: 0.15, outputPerMillion: 17.26, videoSecondCost: 0.10 },
  'veo-3.1-lite-generate-preview': { inputPerMillion: 0.10, outputPerMillion: 8.63, videoSecondCost: 0.05 },
  'gemini-omni-1.1-flash': { inputPerMillion: 0.15, outputPerMillion: 17.26, videoSecondCost: 0.10 },
};

export interface TokenUsageReport {
  model: string;
  promptTokens: number;
  candidatesTokens: number;
  cachedTokens: number;
  totalTokens: number;
  searchQueriesCount?: number;
  videoDurationSeconds?: number;
  estimatedCostUSD: number; // Real platform production cost
  estimatedCostILS: number; // Real platform production cost in ILS
  retailBilledUSD: number;  // Standard value billed to client
  retailBilledILS: number;  // Standard value billed to client in ILS
  grossProfitUSD: number;   // Platform profit (retailBilled - actualCost)
  grossProfitILS: number;   // Platform profit in ILS
  grossMarginPercent: number; // Profit margin percentage (e.g. 90%)
  formattedSummary: string;
}

/**
 * Calculates exact token counts, real production costs, customer retail value,
 * and profit margins for any Gemini API interaction with Context Caching support.
 */
export function calculateGeminiCost(params: {
  model: string;
  promptTokens?: number;
  candidatesTokens?: number;
  cachedTokens?: number;
  searchQueriesCount?: number;
  videoDurationSeconds?: number;
  ilsExchangeRate?: number;
}): TokenUsageReport {
  const {
    model,
    promptTokens = 0,
    candidatesTokens = 0,
    cachedTokens = 0,
    searchQueriesCount = 0,
    videoDurationSeconds = 0,
    ilsExchangeRate = 3.70,
  } = params;

  const rate = GEMINI_PRICING_TABLE[model] || GEMINI_PRICING_TABLE['gemini-3.8-flash'] || GEMINI_PRICING_TABLE['gemini-3.6-flash'];
  const cachedRatePerMillion = rate.cachedInputPerMillion ?? (rate.inputPerMillion * 0.10); // 90% discount default

  let actualCostUSD = 0;
  let retailBilledUSD = 0;

  // Video specific cost
  if (videoDurationSeconds > 0 && rate.videoSecondCost) {
    actualCostUSD += videoDurationSeconds * rate.videoSecondCost;
    retailBilledUSD += videoDurationSeconds * rate.videoSecondCost;
  } else {
    // 1. Retail Billed to customer (always charged full standard market input rate!)
    retailBilledUSD += (promptTokens * rate.inputPerMillion) / 1_000_000;
    retailBilledUSD += (candidatesTokens * rate.outputPerMillion) / 1_000_000;

    // 2. Actual Production Cost paid to Google (with 90% Context Caching discount!)
    const effectiveCached = Math.min(cachedTokens, promptTokens);
    const standardInputTokens = Math.max(0, promptTokens - effectiveCached);

    actualCostUSD += (standardInputTokens * rate.inputPerMillion) / 1_000_000;
    actualCostUSD += (effectiveCached * cachedRatePerMillion) / 1_000_000;
    actualCostUSD += (candidatesTokens * rate.outputPerMillion) / 1_000_000;
  }

  // Google Search grounding cost
  if (searchQueriesCount > 0 && rate.searchQueryCost) {
    actualCostUSD += searchQueriesCount * rate.searchQueryCost;
    retailBilledUSD += searchQueriesCount * rate.searchQueryCost;
  }

  const grossProfitUSD = Math.max(0, retailBilledUSD - actualCostUSD);
  const grossProfitILS = Number((grossProfitUSD * ilsExchangeRate).toFixed(6));
  const actualCostILS = Number((actualCostUSD * ilsExchangeRate).toFixed(6));
  const retailBilledILS = Number((retailBilledUSD * ilsExchangeRate).toFixed(6));
  const grossMarginPercent = retailBilledUSD > 0 ? Number(((grossProfitUSD / retailBilledUSD) * 100).toFixed(1)) : 0;
  const totalTokens = promptTokens + candidatesTokens;

  return {
    model,
    promptTokens,
    candidatesTokens,
    cachedTokens,
    totalTokens,
    ...(searchQueriesCount > 0 ? { searchQueriesCount } : {}),
    ...(videoDurationSeconds > 0 ? { videoDurationSeconds } : {}),
    estimatedCostUSD: Number(actualCostUSD.toFixed(6)),
    estimatedCostILS: actualCostILS,
    retailBilledUSD: Number(retailBilledUSD.toFixed(6)),
    retailBilledILS,
    grossProfitUSD: Number(grossProfitUSD.toFixed(6)),
    grossProfitILS,
    grossMarginPercent,
    formattedSummary: `מודל: ${model} | סה"כ טוקנים: ${totalTokens.toLocaleString()} (מתוכם במטמון: ${cachedTokens.toLocaleString()}) | שווי ללקוח: ₪${retailBilledILS.toFixed(4)} | עלות בפועל: ₪${actualCostILS.toFixed(4)} | רווח: ₪${grossProfitILS.toFixed(4)} (${grossMarginPercent}%)`,
  };
}

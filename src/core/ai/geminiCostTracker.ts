/**
 * Universal Gemini API Token Counter & Cost Calculator
 * Based on official Google AI pricing: https://ai.google.dev/gemini-api/docs/pricing
 */

export interface ModelPricingRate {
  inputPerMillion: number;
  outputPerMillion: number;
  searchQueryCost?: number;
  imageOutputPerMillion?: number;
  videoSecondCost?: number;
}

export const GEMINI_PRICING_TABLE: Record<string, ModelPricingRate> = {
  // Multimodal & Text Models
  'gemini-2.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30, searchQueryCost: 0.000035 },
  'gemini-2.5-flash-lite': { inputPerMillion: 0.0375, outputPerMillion: 0.15, searchQueryCost: 0.000035 },
  'gemini-2.5-pro': { inputPerMillion: 1.25, outputPerMillion: 5.00, searchQueryCost: 0.000035 },
  'gemini-3.8-flash': { inputPerMillion: 0.15, outputPerMillion: 0.60, searchQueryCost: 0.000035 },
  'gemini-3.7-flash': { inputPerMillion: 0.15, outputPerMillion: 0.60, searchQueryCost: 0.000035 },
  'gemini-3.5-flash': { inputPerMillion: 0.075, outputPerMillion: 0.30, searchQueryCost: 0.000035 },
  'gemini-3.5-flash-lite': { inputPerMillion: 0.0375, outputPerMillion: 0.15, searchQueryCost: 0.000035 },
  'gemini-3.1-pro-preview': { inputPerMillion: 1.25, outputPerMillion: 5.00, searchQueryCost: 0.000035 },

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
  totalTokens: number;
  searchQueriesCount?: number;
  videoDurationSeconds?: number;
  estimatedCostUSD: number;
  estimatedCostILS: number; // Converted at default rate (~3.70)
  formattedSummary: string;
}

/**
 * Calculates exact token counts and estimated costs for any Gemini API interaction.
 */
export function calculateGeminiCost(params: {
  model: string;
  promptTokens?: number;
  candidatesTokens?: number;
  searchQueriesCount?: number;
  videoDurationSeconds?: number;
  ilsExchangeRate?: number;
}): TokenUsageReport {
  const {
    model,
    promptTokens = 0,
    candidatesTokens = 0,
    searchQueriesCount = 0,
    videoDurationSeconds = 0,
    ilsExchangeRate = 3.70,
  } = params;

  const rate = GEMINI_PRICING_TABLE[model] || GEMINI_PRICING_TABLE['gemini-2.5-flash'];
  
  let costUSD = 0;

  // Video specific cost
  if (videoDurationSeconds > 0 && rate.videoSecondCost) {
    costUSD += videoDurationSeconds * rate.videoSecondCost;
  } else {
    costUSD += (promptTokens * rate.inputPerMillion) / 1_000_000;
    costUSD += (candidatesTokens * rate.outputPerMillion) / 1_000_000;
  }

  // Google Search grounding cost
  if (searchQueriesCount > 0 && rate.searchQueryCost) {
    costUSD += searchQueriesCount * rate.searchQueryCost;
  }

  const costILS = costUSD * ilsExchangeRate;
  const totalTokens = promptTokens + candidatesTokens;

  return {
    model,
    promptTokens,
    candidatesTokens,
    totalTokens,
    searchQueriesCount,
    videoDurationSeconds,
    estimatedCostUSD: Number(costUSD.toFixed(6)),
    estimatedCostILS: Number(costILS.toFixed(6)),
    formattedSummary: `מודל: ${model} | קלט: ${promptTokens.toLocaleString()} טוקנים | פלט: ${candidatesTokens.toLocaleString()} טוקנים | סה"כ עלות: $${costUSD.toFixed(5)} (₪${costILS.toFixed(4)})`,
  };
}

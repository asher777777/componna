---
name: gemini-web-grounding
description: Perform real-time web research, factual lookup, and live knowledge grounding using Google Search Grounding with Gemini 2.5 Flash, Gemini 3.8 Flash, and Gemini 2.5 Pro with citation extraction, search count tracking, and token/cost counting.
---

# Gemini Web Grounding & Live Search Skill

## 1. Overview & Supported Models

Google Search Grounding connects Gemini models directly to live Google Search index to deliver real-time factual accuracy, source citations, and current world knowledge:

| Model ID | Context Window | Grounding Tool Flag | Input / Output Token Pricing | Search Query Cost |
| :--- | :--- | :--- | :--- | :--- |
| `gemini-2.5-flash` | 1M tokens | `tools: [{ googleSearch: {} }]` | $0.075 / $0.30 per 1M tokens | **$0.035** / 1K search queries |
| `gemini-3.8-flash` | 1M tokens | `tools: [{ googleSearch: {} }]` | $0.15 / $0.60 per 1M tokens | **$0.035** / 1K search queries |
| `gemini-2.5-pro` | 2M tokens | `tools: [{ googleSearch: {} }]` | $1.25 / $5.00 per 1M tokens | **$0.035** / 1K search queries |

---

## 2. Grounding Metadata & Token/Cost Calculation

Every Grounded response contains metadata in `response.candidates[0].groundingMetadata`:
- **`webSearchQueries`**: Array of real Google Search queries executed by the model.
- **`groundingChunks`**: Array of sources (titles, URLs, snippets) retrieved from the web.
- **`groundingSupports`**: Specific segment spans mapped to citation indices.
- **`searchEntryPoint`**: Renderable HTML widget or search intent queries.

### Cost Accounting Formula
$$\text{TotalCost} = (\text{PromptTokens} \times P_{\text{in}}) + (\text{CandidateTokens} \times P_{\text{out}}) + (\text{SearchQueriesCount} \times \$0.000035)$$

*(Note: Retrieved web context injected by Google Search Grounding is NOT charged as input tokens).*

---

## 3. Code Implementation & Usage Pattern

```typescript
import { GoogleGenAI } from '@google/genai';

export interface GroundingOptions {
  query: string;
  systemInstruction?: string;
  model?: 'gemini-2.5-flash' | 'gemini-3.8-flash' | 'gemini-2.5-pro';
  temperature?: number;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface GroundingResult {
  text: string;
  sources: GroundingSource[];
  searchQueries: string[];
  usage: {
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
    searchQueryCount: number;
    estimatedCostUSD: number;
  };
}

export async function searchWithGeminiGrounding(
  apiKey: string,
  options: GroundingOptions
): Promise<GroundingResult> {
  const model = options.model || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model,
    contents: options.query,
    config: {
      systemInstruction: options.systemInstruction || 'You are an accurate, real-time research assistant. Always cite factual sources.',
      tools: [{ googleSearch: {} }],
      temperature: options.temperature ?? 0.3
    }
  });

  const text = response.text || '';
  const candidate = response.candidates?.[0];
  const groundingMeta = candidate?.groundingMetadata;

  // Extract sources
  const sources: GroundingSource[] = [];
  if (groundingMeta?.groundingChunks) {
    for (const chunk of groundingMeta.groundingChunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri
        });
      }
    }
  }

  const searchQueries = groundingMeta?.webSearchQueries || [];
  const promptTokens = response.usageMetadata?.promptTokenCount || 0;
  const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;

  // Pricing rates per 1M tokens
  const priceRates: Record<string, { in: number; out: number }> = {
    'gemini-2.5-flash': { in: 0.075, out: 0.30 },
    'gemini-3.8-flash': { in: 0.15, out: 0.60 },
    'gemini-2.5-pro': { in: 1.25, out: 5.00 },
  };
  const rate = priceRates[model] || priceRates['gemini-2.5-flash'];
  
  const tokenCost = (promptTokens * rate.in + outputTokens * rate.out) / 1_000_000;
  const searchCost = searchQueries.length * 0.000035;
  const totalCost = tokenCost + searchCost;

  return {
    text,
    sources,
    searchQueries,
    usage: {
      promptTokens,
      outputTokens,
      totalTokens: promptTokens + outputTokens,
      searchQueryCount: searchQueries.length,
      estimatedCostUSD: Number(totalCost.toFixed(6))
    }
  };
}
```

---

## 4. Grounding Best Practices
- **Factual Grounding vs Creative**: Set low `temperature` (0.0 to 0.3) for factual research and verification.
- **Citation Rendering**: Map numbered citations `[1]`, `[2]` directly to `sources[index].url` so users can inspect the original live source.
- **Query Verification**: Inspect `searchQueries` to confirm the model performed the search queries accurately.

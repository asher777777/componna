---
name: google-ai-studio-gemini
description: Official Google AI Studio and Gemini API development skill. Enforces valid models (Gemini 3.8 Flash, 3.5 Flash, 3.1 Pro), eliminates deprecated/hallucinated models, handles REST payload structures, system instructions, structured JSON schemas, fallback chains, cost calculation, and Brand DNA injection according to Kosun project rules.
---

# Google AI Studio / Gemini API Master Skill (2026)

## Purpose & Overview
This skill provides the authoritative engineering standard for integrating **Google AI Studio** and the **Gemini API** within the Kosun workspace.
It eliminates the critical mistakes made by previous agents (such as hallucinating non-existent models like `gemini-3.6-flash`, requesting shut down models like `gemini-2.0-flash` / `gemini-1.5-flash`, hardcoding invalid endpoints, or failing to implement automatic model fallback chains).

---

## 1. Ground Rules & Model Availability Matrix (2026 Status)

### Valid Models (Always Choose From These)
1. **`gemini-3.8-flash`** *(Primary Default Workhorse)*:
   - Google's flagship multimodal model for autonomous agent tasks, code generation, reasoning, and tool use.
   - 1M token context window, lowest latency per intelligence ratio.
2. **`gemini-3.8-flash-lite`** *(High-Throughput / Batch)*:
   - Ultra-fast, cost-effective subagent worker.
3. **`gemini-3.5-flash`** *(Secondary GA Workhorse & Stable Fallback)*:
   - Proven high-volume production model for conversational AI, rewriting, and JSON extraction.
4. **`gemini-3.5-flash-lite`** *(Budget Worker)*:
   - Lightweight document parsing and sentiment/classification tasks.
5. **`gemini-3.1-pro`** *(Flagship Reasoning & Deep Research)*:
   - Complex multi-step reasoning, mathematical proofs, long-form document synthesis.
6. **`gemini-3.8-flash-tts`** *(Audio/Voice)*:
   - Expressive studio-grade text-to-speech.
7. **`gemini-3.1-flash-image`** *(Image Generation)*:
   - High-fidelity visual creation.
8. **`veo-3.1-generate-preview`** *(Video Generation)*:
   - Advanced high-definition video synthesis.

### Strict Blacklist & Deprecations (NEVER Call These)
- ❌ **`gemini-3.6-flash`**: **DO NOT USE**. Hallucination. Never existed in Google AI Studio.
- ❌ **`gemini-2.0-flash`**: **DO NOT USE**. Officially shut down on June 1, 2026. Returns HTTP 404 / 410.
- ❌ **`gemini-1.5-flash`** / **`gemini-1.5-pro`**: **DO NOT USE**. Officially discontinued in September 2025.
- ⚠️ **`gemini-2.5-flash`** / **`gemini-2.5-pro`**: Restricted access to legacy users only. Never set as primary; only keep at end of fallback chain.

---

## 2. Universal Model Fallback Chain Principle

**MANDATORY**: Any service, hook, or API caller that sends requests to the Gemini API MUST implement a cascading fallback array:

```typescript
export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',      // 1st choice: Frontier speed & intelligence
  'gemini-3.5-flash',      // 2nd choice: Ultra-stable GA workhorse
  'gemini-3.8-flash-lite', // 3rd choice: High-speed lite
  'gemini-3.5-flash-lite', // 4th choice: Budget fallback
  'gemini-2.5-flash',      // 5th choice: Legacy account compatibility
] as const;
```

If a model returns `404 Not Found`, `429 Resource Exhausted`, `403 Forbidden`, or model retirement error, the request must immediately attempt the next model in the chain before failing.

---

## 3. Official REST Endpoint & Payload Architecture

### Base URL
```
https://generativelanguage.googleapis.com/v1beta
```

### Direct Call Structure
```typescript
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
```

### Standard Body Format
```json
{
  "systemInstruction": {
    "parts": [
      { "text": "System prompt instructions here..." }
    ]
  },
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "User input prompt here..." }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "topP": 0.95,
    "maxOutputTokens": 4096
  }
}
```

### Structured JSON Extraction (`responseSchema`)
To guarantee that the Gemini model returns clean JSON without markdown code fences:
```json
{
  "contents": [{ "role": "user", "parts": [{ "text": "Extract leads..." }] }],
  "generationConfig": {
    "responseMimeType": "application/json",
    "responseSchema": {
      "type": "OBJECT",
      "properties": {
        "success": { "type": "BOOLEAN" },
        "items": {
          "type": "ARRAY",
          "items": { "type": "STRING" }
        }
      },
      "required": ["success", "items"]
    }
  }
}
```

---

## 4. Kosun Project Integration Standards

When building or updating AI capabilities inside any Kosun module (11-Layer Architecture):

### A. API Key Resolution
Always resolve the API key in this order:
1. `useSystemConnection().apiKeys.googleAiApiKey` (tenant/environment UI setting)
2. `import.meta.env.VITE_GEMINI_API_KEY` (vite env fallback)
3. Window globals / Local storage override

If no key is present:
- NEVER throw unhandled runtime exceptions that break React rendering.
- Return a clear, graceful Hebrew notice: `לא הוגדר מפתח Google Gemini API בהגדרות המערכת`.

### B. Brand DNA Injection
When generating user-facing copy, forms, scripts, or marketing texts:
- Consume the Brand DNA capability (`useHostCapabilities().getCapability<BrandDnaContract>('brand-dna')`) or read from `settings/brand_dna`.
- Prepend the Brand DNA voice, target audience, and guidelines into `systemInstruction`.

### C. Cost Tracking & Token Usage (`geminiCostTracker.ts`)
Always extract `usageMetadata` from the Gemini response:
```typescript
const promptTokens = data.usageMetadata?.promptTokenCount || 0;
const candidatesTokens = data.usageMetadata?.candidatesTokenCount || 0;

const costReport = calculateGeminiCost({
  model: currentModel,
  promptTokens,
  candidatesTokens,
});
```
This updates the real-time token meter and telemetry.

### D. RTL & Hebrew Output Requirement
Any prompt requesting Hebrew text must instruct the model:
1. Format output for right-to-left (RTL).
2. Avoid mixing stray English phrases that reverse punctuation or reading order.
3. Use natural, persuasive Israeli Hebrew suitable for the brand's tone.

---

## 5. Standard Reusable Request Runner (Reference Implementation)

Below is the standard, bulletproof caller pattern to use across all services:

```typescript
import { calculateGeminiCost } from '../../../core/ai';

export const OFFICIAL_GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
] as const;

export interface GeminiCallParams {
  apiKey: string;
  systemPrompt?: string;
  userPrompt: string;
  preferredModel?: string;
  responseSchema?: any;
  temperature?: number;
}

export async function callGeminiWithFallback(params: GeminiCallParams) {
  const { apiKey, systemPrompt, userPrompt, preferredModel, responseSchema, temperature = 0.7 } = params;

  if (!apiKey) {
    throw new Error('לא הוגדר מפתח Google AI Studio / Gemini API');
  }

  // Build model priority queue
  const modelsToTry: string[] = [];
  if (preferredModel && !modelsToTry.includes(preferredModel)) {
    // Sanitize hallucinated 3.6 to 3.8
    const sanitized = preferredModel.replace('3.6', '3.8');
    modelsToTry.push(sanitized);
  }
  for (const m of OFFICIAL_GEMINI_MODELS) {
    if (!modelsToTry.includes(m)) modelsToTry.push(m);
  }

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const body: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature,
        },
      };

      if (systemPrompt) {
        body.systemInstruction = {
          parts: [{ text: systemPrompt }],
        };
      }

      if (responseSchema) {
        body.generationConfig.responseMimeType = 'application/json';
        body.generationConfig.responseSchema = responseSchema;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      const costReport = calculateGeminiCost({
        model,
        promptTokens: data?.usageMetadata?.promptTokenCount,
        candidatesTokens: data?.usageMetadata?.candidatesTokenCount,
      });

      return {
        success: true,
        text,
        modelUsed: model,
        costReport,
        raw: data,
      };
    } catch (err: any) {
      lastError = err;
      // Continue to next model in fallback list
    }
  }

  throw new Error(`כל ניסיונות הפנייה ל-Gemini נכשלו. שגיאה אחרונה: ${lastError?.message || 'לא ידועה'}`);
}
```

---

## 6. Pre-flight Verification Checklist for Agents

Before completing any task involving Gemini / Google AI Studio:
- [ ] Are all models used in the code verified against the 2026 catalog (`gemini-3.8-flash`, `gemini-3.5-flash`, etc.)?
- [ ] Have all references to `gemini-3.6-flash`, `gemini-2.0-flash`, and `gemini-1.5-flash` been removed or aliased?
- [ ] Is there an automatic fallback chain in place for network/quota/retirement errors?
- [ ] Is structured JSON parsing protected with try/catch and fallback extraction?
- [ ] Is the API key safely resolved without exposing it or crashing if missing?
- [ ] Is cost/token calculation tracked via `calculateGeminiCost`?
- [ ] Does `npm run build` pass with zero type errors?

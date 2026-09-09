---
name: gemini-multimodal-pdf-vision
description: Process, analyze, and extract structured data from PDF documents, complex forms, tables, and high-resolution images using Gemini 2.5 Flash and Pro with schema validation and request/response token/cost accounting.
---

# Gemini Multimodal PDF & Vision Analysis Skill

## 1. Overview & Supported Models

Gemini models natively accept documents (PDF, Word, TXT), images (PNG, JPEG, WEBP), and high-resolution scans with native OCR and layout comprehension:

| Model ID | Context Window | Best Suited For | Input Pricing (Prompt) | Output Pricing (Candidates) |
| :--- | :--- | :--- | :--- | :--- |
| `gemini-2.5-flash` | 1M tokens (~3,000 pages) | High-speed PDF parsing, invoice extraction, OCR | **$0.075** / 1M tokens | **$0.30** / 1M tokens |
| `gemini-3.8-flash` | 1M tokens | Agentic document processing, enterprise invoices | **$0.15** / 1M tokens | **$0.60** / 1M tokens |
| `gemini-2.5-pro` | 2M tokens (~6,000 pages) | Complex multi-page financial reports, legal contracts, dense tables | **$1.25** / 1M tokens | **$5.00** / 1M tokens |

---

## 2. File Upload Methods & Token Accounting

1. **Inline Data (Base64)**: Best for files < 20MB (fast, direct in payload).
2. **Files API (`ai.files.upload`)**: Best for large files up to 2GB or multi-file batches.
3. **Token Accounting per Page/Image**:
   - Standard PDF text page: ~258 to 350 tokens per page.
   - Scanned image / high-resolution page: 560 to 1120 tokens per page.
4. **Exact Cost Formula**:
   $$\text{TotalCost} = \frac{(\text{PromptTokens} \times \text{Rate}_{\text{in}}) + (\text{CandidatesTokens} \times \text{Rate}_{\text{out}})}{1,000,000}$$

---

## 3. Code Implementation & Usage Pattern

```typescript
import { GoogleGenAI, Type, Schema } from '@google/genai';

export interface DocumentAnalysisOptions {
  fileBase64: string;
  mimeType: 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/webp';
  prompt: string;
  model?: 'gemini-2.5-flash' | 'gemini-3.8-flash' | 'gemini-2.5-pro';
  responseSchema?: Schema; // Enforce structured JSON schema
}

export interface DocumentAnalysisResult<T = any> {
  data: T;
  rawText: string;
  usage: {
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
  };
}

export async function analyzeDocumentWithGemini<T = any>(
  apiKey: string,
  options: DocumentAnalysisOptions
): Promise<DocumentAnalysisResult<T>> {
  const model = options.model || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        inlineData: {
          mimeType: options.mimeType,
          data: options.fileBase64.replace(/^data:[^;]+;base64,/, '')
        }
      },
      options.prompt
    ],
    config: {
      ...(options.responseSchema && {
        responseMimeType: 'application/json',
        responseSchema: options.responseSchema
      })
    }
  });

  const rawText = response.text || '';
  let parsedData: any = rawText;
  if (options.responseSchema) {
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = rawText;
    }
  }

  const promptTokens = response.usageMetadata?.promptTokenCount || 0;
  const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;

  const priceRates: Record<string, { in: number; out: number }> = {
    'gemini-2.5-flash': { in: 0.075, out: 0.30 },
    'gemini-3.8-flash': { in: 0.15, out: 0.60 },
    'gemini-2.5-pro': { in: 1.25, out: 5.00 },
  };
  const rate = priceRates[model] || priceRates['gemini-2.5-flash'];
  const cost = (promptTokens * rate.in + outputTokens * rate.out) / 1_000_000;

  return {
    data: parsedData as T,
    rawText,
    usage: {
      promptTokens,
      outputTokens,
      totalTokens: promptTokens + outputTokens,
      estimatedCostUSD: Number(cost.toFixed(6))
    }
  };
}
```

---

## 4. Best Practices for Document Parsing & Vision
- **Structured Schema**: Always supply `responseSchema` for financial receipts, invoices, identity documents, and contracts to avoid malformed markdown.
- **Multilingual Support (Hebrew & English)**: Gemini 2.5/3.8 excels at mixed bidirectional Hebrew/English documents, tables, and receipts.
- **Table Extraction**: Instruct the model to preserve columns and row hierarchies when extracting financial ledgers.

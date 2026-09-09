---
name: gemini-image-generation
description: Generate, edit, and manipulate images using Google Gemini Image Models (Gemini 3.1 Flash Image / Nano Banana 2, Gemini 3 Pro Image / Nano Banana Pro, and Imagen 3) with precise token counting and cost tracking.
---

# Gemini Image Generation & Editing Skill

## 1. Overview & Supported Models

This skill guides the generation, editing, inpainting, and style transfer of images using Google's latest Gemini image generation models:

| Model ID | Public Name | Best Used For | Output Token Rate | Cost per 1K Image |
| :--- | :--- | :--- | :--- | :--- |
| `gemini-3.1-flash-image` | **Nano Banana 2** | Fast, high-throughput interactive image generation & editing | $60 / 1M tokens | **$0.067** (1120 tokens) |
| `gemini-3.1-flash-lite-image`| **Nano Banana 2 Lite** | Ultra-low latency, cost-effective high-volume batch generation | $30 / 1M tokens | **$0.0336** (1120 tokens) |
| `gemini-3-pro-image` | **Nano Banana Pro** | Highest fidelity, complex photorealism, multi-object scenes | $120 / 1M tokens | **$0.134** (1120 tokens) |
| `imagen-3.0-generate-002` | **Imagen 3** | Studio-grade photorealistic asset generation & typography | Flat rate | **~$0.04 - $0.06** / img |

---

## 2. Token & Cost Accounting Model

Every generation and edit request must track:
1. **Prompt Tokens (Input)**: Text prompt length + input reference image tokens (~560 tokens per input image).
2. **Candidates Tokens (Output)**: Fixed token consumption based on target resolution:
   - **0.5K (512x512)**: 747 tokens (~$0.045 with Flash Image)
   - **1K (1024x1024)**: 1,120 tokens (~$0.067 with Flash Image, ~$0.134 with Pro Image)
   - **2K (2048x2048)**: 1,680 tokens (~$0.101 with Flash Image, ~$0.134 with Pro Image)
   - **4K (4096x4096)**: 2,520 tokens (~$0.151 with Flash Image, ~$0.24 with Pro Image)
3. **Total Cost Formula**:
   $$\text{Cost} = (\text{InputTextTokens} \times \text{Price}_{\text{in}}) + (\text{InputImages} \times 560 \times \text{Price}_{\text{in}}) + (\text{OutputImageTokens} \times \text{Price}_{\text{out}})$$

---

## 3. Code Implementation & Usage Pattern

```typescript
import { GoogleGenAI } from '@google/genai';

export interface ImageGenerationOptions {
  prompt: string;
  model?: 'gemini-3.1-flash-image' | 'gemini-3.1-flash-lite-image' | 'gemini-3-pro-image';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  resolution?: '512x512' | '1024x1024' | '2048x2048' | '4096x4096';
  referenceImageBase64?: string; // For image-to-image or editing
}

export interface ImageGenerationResult {
  imageBase64: string;
  mimeType: string;
  usage: {
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
  };
}

export async function generateGeminiImage(
  apiKey: string,
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const model = options.model || 'gemini-3.1-flash-image';
  const ai = new GoogleGenAI({ apiKey });

  const contents: any[] = [];
  if (options.referenceImageBase64) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: options.referenceImageBase64.replace(/^data:image\/\w+;base64,/, '')
      }
    });
  }
  contents.push(options.prompt);

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseModalities: ['IMAGE'],
      imageGenerationConfig: {
        aspectRatio: options.aspectRatio || '1:1',
      }
    }
  });

  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('image/'));
  
  if (!imagePart || !imagePart.inlineData) {
    throw new Error('No image was returned by the model.');
  }

  // Cost calculation
  const promptTokens = response.usageMetadata?.promptTokenCount || 50;
  const resolutionTokensMap = {
    '512x512': 747,
    '1024x1024': 1120,
    '2048x2048': 1680,
    '4096x4096': 2520,
  };
  const outputTokens = response.usageMetadata?.candidatesTokenCount || resolutionTokensMap[options.resolution || '1024x1024'];
  
  const pricePerMillionOutput = model === 'gemini-3-pro-image' ? 120 : (model === 'gemini-3.1-flash-lite-image' ? 30 : 60);
  const cost = ((promptTokens * 0.15) + (outputTokens * pricePerMillionOutput)) / 1_000_000;

  return {
    imageBase64: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
    mimeType: imagePart.inlineData.mimeType,
    usage: {
      promptTokens,
      outputTokens,
      totalTokens: promptTokens + outputTokens,
      estimatedCostUSD: Number(cost.toFixed(5))
    }
  };
}
```

---

## 4. Prompt Engineering Guidelines
- **Subject First**: Clearly state the central subject before background details.
- **Lighting & Texture**: Specify cinematic lighting, studio rim lighting, realistic textures, octane render, 8k resolution.
- **Negative Prompts & Avoidance**: Avoid low resolution, blurry edges, distorted fingers, extra limbs.
- **RTL & Hebrew Translation**: When receiving prompts in Hebrew, translate and enrich into descriptive English for optimal image generation fidelity.

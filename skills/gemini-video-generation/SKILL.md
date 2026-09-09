---
name: gemini-video-generation
description: Generate, extend, and interpolate high-quality video using Google Veo 3.1, Veo 3.1 Lite, and Gemini Omni Flash with prompt composition, aspect ratio control, duration options, and token/cost counting.
---

# Gemini Video Generation & Editing Skill (Veo & Gemini Omni)

## 1. Overview & Supported Models

This skill governs AI video generation, video extension, image-to-video animating, and scene transitions using Google's frontier video models:

| Model ID | Public Name | Core Capabilities | Billing & Token Metrics | Cost Rate |
| :--- | :--- | :--- | :--- | :--- |
| `veo-3.1-generate-preview` | **Veo 3.1** | Cinematic 1080p/720p text-to-video & image-to-video | Async job / Output token rate | **~$0.10** / second |
| `veo-3.1-lite-generate-preview` | **Veo 3.1 Lite** | High-throughput, rapid generation for social video & prototypes | Async job / Output token rate | **~$0.05** / second |
| `gemini-omni-1.1-flash` | **Gemini Omni Flash**| Real-time video generation, editing, keyframe interpolation | 5,792 tokens / sec (720p) | **~$0.10** / second |

---

## 2. Token & Cost Accounting Model

Video generation token consumption and pricing calculations:
1. **Output Token Rate**: 5,792 output tokens per second of 720p video.
2. **Video Duration Pricing Table**:
   - **4 seconds (720p)**: 23,168 tokens $\approx$ **$0.40**
   - **6 seconds (720p)**: 34,752 tokens $\approx$ **$0.60**
   - **8 seconds (720p)**: 46,336 tokens $\approx$ **$0.80**
3. **Cost Calculation**:
   $$\text{VideoCost} = (\text{DurationInSeconds} \times 5792 \times \text{PricePerOutputToken}) + (\text{InputTextTokens} \times \text{PricePerInputToken})$$

---

## 3. Code Implementation & Usage Pattern

```typescript
import { GoogleGenAI } from '@google/genai';

export interface VideoGenerationOptions {
  prompt: string;
  model?: 'veo-3.1-generate-preview' | 'veo-3.1-lite-generate-preview' | 'gemini-omni-1.1-flash';
  durationSeconds?: 4 | 6 | 8;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  firstFrameBase64?: string; // Image-to-Video
  lastFrameBase64?: string;  // Frame interpolation
}

export interface VideoGenerationResult {
  videoUrl: string;
  durationSeconds: number;
  usage: {
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
  };
}

export async function generateGeminiVideo(
  apiKey: string,
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  const model = options.model || 'veo-3.1-generate-preview';
  const duration = options.durationSeconds || 4;
  const ai = new GoogleGenAI({ apiKey });

  // Initiate video generation operation
  let operation = await ai.models.generateVideos({
    model,
    prompt: options.prompt,
    config: {
      aspectRatio: options.aspectRatio || '16:9',
      durationSeconds: duration,
      ...(options.firstFrameBase64 && {
        image: {
          imageBytes: options.firstFrameBase64.replace(/^data:image\/\w+;base64,/, '')
        }
      })
    }
  });

  // Poll until video job is completed
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation.name });
  }

  const generatedVideo = operation.response?.generatedVideos?.[0];
  if (!generatedVideo || !generatedVideo.video?.uri) {
    throw new Error('Video generation failed or returned empty URI.');
  }

  const outputTokens = duration * 5792;
  const promptTokens = 120;
  const cost = duration * (model === 'veo-3.1-lite-generate-preview' ? 0.05 : 0.10);

  return {
    videoUrl: generatedVideo.video.uri,
    durationSeconds: duration,
    usage: {
      promptTokens,
      outputTokens,
      totalTokens: promptTokens + outputTokens,
      estimatedCostUSD: Number(cost.toFixed(4))
    }
  };
}
```

---

## 4. Best Practices for Video Prompts
- **Camera Movement**: Describe exact camera motion (e.g. *Drone shot zooming in*, *Slow pan left to right*, *First-person dolly zoom*).
- **Physical Dynamics**: Describe lighting shifts, particle physics, wind in hair, water splashes.
- **Scene Continuity**: When extending video, pass the last frame of the previous clip as the `firstFrameBase64` to maintain visual consistency.

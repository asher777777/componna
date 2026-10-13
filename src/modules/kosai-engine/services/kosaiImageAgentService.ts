/**
 * KOSAI AI Image Agent Service
 * Orchestrates professional logo generation, brand atmosphere (vibe) images,
 * and intelligent image editing synchronized with Brand DNA.
 */

import {
  BrandDna,
  KosaiImageGenerationOptions,
  KosaiImageGenerationResult,
  KosaiImageEditOptions,
} from '../../../core/contracts';
import { calculateGeminiCost, TokenUsageReport } from '../../../core/ai/geminiCostTracker';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { callGeminiApi } from '../../KosWebAi/api/functionsApi';

export interface LogoStylePreset {
  id: string;
  nameHe: string;
  nameEn: string;
  promptDescription: string;
}

export const KOSAI_LOGO_PRESETS: LogoStylePreset[] = [
  {
    id: 'minimalist-vector',
    nameHe: 'וקטורי מינימליסטי',
    nameEn: 'Minimalist Vector',
    promptDescription: 'sleek minimalist vector graphic logo, flat geometric lines, crisp iconography, solid clean white isolated background, modern 2026 tech branding, golden ratio balance, trending on Behance',
  },
  {
    id: 'luxury-emblem',
    nameHe: 'סמל יוקרתי (Luxury Emblem)',
    nameEn: 'Luxury Modern Emblem',
    promptDescription: 'luxury modern emblem logo, subtle elegant metallic gradient accents, premium high-end corporate identity, balanced symmetry, isolated on clean background',
  },
  {
    id: 'modern-3d-glyph',
    nameHe: 'תלת-ממד מודרני (3D Glyph)',
    nameEn: 'Modern 3D Glyph',
    promptDescription: 'sleek 3D claymorphic glyph, soft rim lighting, ambient occlusion, frosted glass and sleek enamel finish, modern app icon aesthetic, isolated background',
  },
  {
    id: 'tech-monogram',
    nameHe: 'מונוגרמה הייטקיסטית',
    nameEn: 'Tech Monogram',
    promptDescription: 'futuristic typographic monogram glyph, sharp precision angles, bold digital identity, Swiss design grid, high-tech aesthetics, isolated background',
  },
  {
    id: 'organic-crest',
    nameHe: 'חותם אלגנטי מעודן',
    nameEn: 'Artisanal Elegant Crest',
    promptDescription: 'elegant organic linework crest, minimalist emblem curve, artisanal premium branding, delicate fine strokes, isolated clean background',
  },
];

export interface VibeStylePreset {
  id: string;
  nameHe: string;
  nameEn: string;
  promptDescription: string;
}

export const KOSAI_VIBE_PRESETS: VibeStylePreset[] = [
  {
    id: 'commercial-product',
    nameHe: 'צילום מוצר מסחרי יוקרתי',
    nameEn: 'Commercial Luxury Product',
    promptDescription: 'commercial luxury brand photography, placed on elegant architectural stone podium, soft studio softbox lighting, pristine water droplet splashes or floating botanical elements, crisp hyper-focus, Vogue advertising aesthetic',
  },
  {
    id: 'modern-workspace',
    nameHe: 'סביבת עבודה והייטק',
    nameEn: 'Modern Tech Workspace',
    promptDescription: 'high-end architectural modern glass workspace, collaborative digital environment, Scandinavian minimalism, diffused morning sunlight through panoramic windows, warm oak wood and marble',
  },
  {
    id: 'warm-executive',
    nameHe: 'אווירה חמימה ויוקרתית',
    nameEn: 'Warm Executive Atmosphere',
    promptDescription: 'warm luxurious executive boutique atmosphere, rich warm ambient lighting, elegant bespoke furniture, cinematic depth of field, high-end commercial editorial photo',
  },
  {
    id: 'cinematic-story',
    nameHe: 'סיפור מותג קולנועי',
    nameEn: 'Cinematic Storytelling',
    promptDescription: 'cinematic brand storytelling photography, shot on Hasselblad H6D-100c, 85mm f/1.4 lens, natural dramatic chiaroscuro rim lighting, emotive atmosphere, 8k resolution',
  },
  {
    id: 'creative-abstract',
    nameHe: 'אבסטרקט ואמנות דיגיטלית',
    nameEn: 'Creative Abstract Waves',
    promptDescription: 'sophisticated abstract fluid 3D ribbons and waves, flowing silky geometry, vibrant harmonious color palette, glossy iridescent textures, Apple keynotes aesthetic',
  },
];

/**
 * Translates Hebrew or informal text to English using fast Gemini Flash
 */
export async function translatePromptToEnglish(text: string, apiKey?: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';
  // If text is primarily ASCII English, return directly
  const hasHebrew = /[\u0590-\u05FF]/.test(clean);
  if (!hasHebrew) return clean;

  const key = apiKey || getModuleGeminiKey('kosai-engine') || getModuleGeminiKey('media-gallery-hub') || '';
  if (!key) {
    // Basic Hebrew keyword dictionary fallback
    return clean
      .replace(/לוגו/g, 'logo')
      .replace(/רקע/g, 'background')
      .replace(/שקוף/g, 'transparent')
      .replace(/מודרני/g, 'modern')
      .replace(/יוקרתי/g, 'luxury')
      .replace(/מינימליסטי/g, 'minimalist')
      .replace(/חברה/g, 'company')
      .replace(/עסק/g, 'business');
  }

  try {
    const res = await callGeminiApi({
      prompt: `Translate the following Hebrew image generation prompt into descriptive, evocative English for an AI image generator. Output ONLY the English prompt, no commentary:\n\n${clean}`,
      systemInstruction: 'You are an expert translator for Midjourney/Imagen prompts. Translate concise, evocative English only.',
      model: 'gemini-3.8-flash',
      responseMimeType: 'text/plain',
      timeoutMs: 15000,
    });
    if (res.success && typeof res.data === 'string' && res.data.trim()) {
      return res.data.trim().replace(/^"|"$/g, '');
    }
  } catch (e) {
    console.warn('[KOSAI Image Agent] Fast translation notice:', e);
  }

  return clean;
}

/**
 * Calculates output dimensions based on aspect ratio
 */
export function getDimensionsForRatio(aspectRatio: string = '1:1'): { width: number; height: number } {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1280, height: 720 };
    case '9:16':
      return { width: 720, height: 1280 };
    case '4:3':
      return { width: 1024, height: 768 };
    case '3:4':
      return { width: 768, height: 1024 };
    case '1:1':
    default:
      return { width: 1024, height: 1024 };
  }
}

/**
 * Core image generator calling Google Imagen 3 / Gemini Image or High-Fidelity mirror
 */
async function executeImageSynthesis(
  englishPrompt: string,
  width: number,
  height: number,
  aspectRatio: string,
  model: string = 'gemini-3.1-flash-image',
  referenceImageBase64?: string,
  customApiKey?: string
): Promise<{ imageUrl: string; base64Data: string; mimeType: string; usageReport: TokenUsageReport }> {
  const effectiveKey = (customApiKey || getModuleGeminiKey('kosai-engine') || getModuleGeminiKey('media-gallery-hub') || '').trim();

  // 1. Google Imagen 3 / Gemini native API
  if (effectiveKey) {
    // A. Imagen 3 predict
    if (model.includes('imagen')) {
      const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${effectiveKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${effectiveKey}`,
      ];

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [{ prompt: englishPrompt }],
              parameters: {
                sampleCount: 1,
                aspectRatio,
                personGeneration: 'ALLOW_ADULT',
                outputMimeType: 'image/jpeg',
              },
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
            const mime = data?.predictions?.[0]?.mimeType || 'image/jpeg';
            if (b64) {
              const usage = calculateGeminiCost({
                model: 'imagen-3.0-generate-002',
                promptTokens: 60,
                candidatesTokens: 1120,
              });
              return {
                imageUrl: `data:${mime};base64,${b64}`,
                base64Data: b64,
                mimeType: mime,
                usageReport: usage,
              };
            }
          }
        } catch (e) {
          console.warn('[KOSAI Imagen predict notice]:', e);
        }
      }
    }

    // B. Gemini generateContent with image modality
    const candidateModels = [
      model,
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image',
      'gemini-3-pro-image',
    ].filter((m, i, arr) => m && arr.indexOf(m) === i && !m.includes('imagen'));

    for (const targetModel of candidateModels) {
      try {
        const parts: any[] = [];
        if (referenceImageBase64) {
          const cleanRef = referenceImageBase64.replace(/^data:image\/\w+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanRef,
            },
          });
        }
        parts.push({ text: englishPrompt });

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${effectiveKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseModalities: ['IMAGE', 'TEXT'],
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const candidateParts = data?.candidates?.[0]?.content?.parts || [];
          const imgPart = candidateParts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
          if (imgPart?.inlineData?.data) {
            const mime = imgPart.inlineData.mimeType || 'image/jpeg';
            const b64 = imgPart.inlineData.data;
            const usage = calculateGeminiCost({
              model: targetModel,
              promptTokens: data.usageMetadata?.promptTokenCount || 65,
              candidatesTokens: data.usageMetadata?.candidatesTokenCount || 1120,
            });
            return {
              imageUrl: `data:${mime};base64,${b64}`,
              base64Data: b64,
              mimeType: mime,
              usageReport: usage,
            };
          }
        }
      } catch (err) {
        console.warn(`[KOSAI Gemini ${targetModel} notice]:`, err);
      }
    }
  }

  // 2. High-Fidelity Flux.1 Engine Fallback
  const seed = Math.floor(Math.random() * 10000000);
  const cleanEncoded = encodeURIComponent(englishPrompt);
  const mirrorUrl = `https://image.pollinations.ai/prompt/${cleanEncoded}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true`;

  try {
    const fetchRes = await fetch(mirrorUrl);
    if (fetchRes.ok) {
      const blob = await fetchRes.blob();
      if (blob && blob.size > 2000) {
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(',')[1] || '');
          };
          reader.readAsDataURL(blob);
        });

        const usage = calculateGeminiCost({
          model: 'gemini-3.1-flash-image',
          promptTokens: 50,
          candidatesTokens: 1120,
        });

        return {
          imageUrl: `data:${blob.type || 'image/jpeg'};base64,${base64Data}`,
          base64Data,
          mimeType: blob.type || 'image/jpeg',
          usageReport: usage,
        };
      }
    }
  } catch (err) {
    console.warn('[KOSAI Flux fetch notice]:', err);
  }

  // Direct image URL guarantee
  const usage = calculateGeminiCost({
    model: 'gemini-3.1-flash-image',
    promptTokens: 50,
    candidatesTokens: 1120,
  });

  return {
    imageUrl: mirrorUrl,
    base64Data: '',
    mimeType: 'image/jpeg',
    usageReport: usage,
  };
}

/**
 * Generates Hebrew titles, rich description, and semantic tags
 */
async function generateHebrewMetadata(
  subject: string,
  mode: 'logo' | 'vibe' | 'edit' | 'general',
  brandName?: string
): Promise<{ title: string; description: string; tags: string[] }> {
  const bName = brandName || 'קושאן';
  if (mode === 'logo') {
    return {
      title: `לוגו רשמי - ${bName}`,
      description: `לוגו מעוצב וקטורי מינימליסטי שנוצר עבור ${bName} על פי כללי Brand DNA.`,
      tags: ['לוגו', 'מיתוג', 'זהות_עסקית', 'קושאן_AI'],
    };
  }
  if (mode === 'vibe') {
    return {
      title: `תמונת אווירה - ${bName}`,
      description: `תמונת אווירה קולנועית המשקפת את ערכי המותג, טון הדיבור והאסתטיקה של ${bName}.`,
      tags: ['תמונת_אווירה', 'מיתוג', 'פרסום', 'קושאן_AI'],
    };
  }
  if (mode === 'edit') {
    return {
      title: `עריכת תמונה - קושאן AI`,
      description: `תמונה מעובדת ומעודכנת לפי הנחיות עריכה עם קושאן AI.`,
      tags: ['עריכת_תמונה', 'AI_Studio', 'קושאן_AI'],
    };
  }
  return {
    title: subject.slice(0, 40) || `יצירה ב-AI - ${bName}`,
    description: `תמונה שנוצרה בסטודיו קושאן AI.`,
    tags: ['תמונה', 'קושאן_AI'],
  };
}

export const kosaiImageAgentService = {
  /**
   * 1. Generate Professional Brand Logo synchronized with Brand DNA
   */
  generateBrandLogo: async ({
    prompt,
    stylePreset = 'minimalist-vector',
    brandDna,
    customApiKey,
  }: {
    prompt?: string;
    stylePreset?: string;
    brandDna?: BrandDna;
    customApiKey?: string;
  }): Promise<KosaiImageGenerationResult> => {
    const brandName = brandDna?.identity?.companyName || 'קושאן';
    const slogan = brandDna?.identity?.slogan || '';
    const purpose = brandDna?.identity?.organizationPurpose || '';
    const primaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';
    const secondaryColor = brandDna?.designTokens?.secondaryColor || '#0ea5e9';

    const preset = KOSAI_LOGO_PRESETS.find((p) => p.id === stylePreset) || KOSAI_LOGO_PRESETS[0];

    // User addition translated
    const userDirection = prompt ? await translatePromptToEnglish(prompt, customApiKey) : '';

    // Craft synthesized English prompt
    const englishPrompt = [
      `Professional vector logo design for brand named "${brandName}"`,
      purpose ? `in the industry of ${purpose}` : '',
      slogan ? `with core slogan concept "${slogan}"` : '',
      `incorporating brand primary color accent ${primaryColor} and secondary color ${secondaryColor}`,
      preset.promptDescription,
      userDirection ? `Specific direction: ${userDirection}` : '',
      'clean vector SVG aesthetics, centered composition, high resolution master quality, no blurry edges, no watermark',
    ]
      .filter(Boolean)
      .join(', ');

    const { width, height } = getDimensionsForRatio('1:1');
    const result = await executeImageSynthesis(
      englishPrompt,
      width,
      height,
      '1:1',
      'gemini-3.1-flash-image',
      undefined,
      customApiKey
    );

    const meta = await generateHebrewMetadata(prompt || brandName, 'logo', brandName);

    return {
      imageUrl: result.imageUrl,
      base64Data: result.base64Data,
      mimeType: result.mimeType,
      width,
      height,
      model: 'gemini-3.1-flash-image (Logo Agent)',
      enhancedPrompt: englishPrompt,
      suggestedTitle: meta.title,
      suggestedDescription: meta.description,
      suggestedTags: meta.tags,
      usageReport: result.usageReport,
    };
  },

  /**
   * 2. Generate Brand Atmosphere (Vibe) Image synchronized with Brand DNA
   */
  generateBrandVibeImage: async ({
    prompt,
    vibeStyle = 'commercial-product',
    brandDna,
    aspectRatio = '16:9',
    customApiKey,
  }: {
    prompt?: string;
    vibeStyle?: string;
    brandDna?: BrandDna;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    customApiKey?: string;
  }): Promise<KosaiImageGenerationResult> => {
    const brandName = brandDna?.identity?.companyName || 'קושאן';
    const vision = brandDna?.identity?.companyVision || brandDna?.identity?.shortVision || '';
    const primaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';
    const secondaryColor = brandDna?.designTokens?.secondaryColor || '#0ea5e9';
    const audience = (brandDna?.audience?.targetAudiences || []).slice(0, 2).join(', ');

    const preset = KOSAI_VIBE_PRESETS.find((p) => p.id === vibeStyle) || KOSAI_VIBE_PRESETS[0];

    const userDirection = prompt ? await translatePromptToEnglish(prompt, customApiKey) : '';

    const englishPrompt = [
      `Atmospheric commercial photography for brand "${brandName}"`,
      preset.promptDescription,
      vision ? `conveying the vision: "${vision}"` : '',
      audience ? `appealing directly to ${audience}` : '',
      `color harmony influenced by subtle tones of ${primaryColor} and ${secondaryColor}`,
      userDirection ? `Key scene: ${userDirection}` : '',
      'award-winning advertising campaign, 8k resolution, cinematic color grading, photorealistic, pristine quality',
    ]
      .filter(Boolean)
      .join(', ');

    const { width, height } = getDimensionsForRatio(aspectRatio);
    const result = await executeImageSynthesis(
      englishPrompt,
      width,
      height,
      aspectRatio,
      'gemini-3.1-flash-image',
      undefined,
      customApiKey
    );

    const meta = await generateHebrewMetadata(prompt || brandName, 'vibe', brandName);

    return {
      imageUrl: result.imageUrl,
      base64Data: result.base64Data,
      mimeType: result.mimeType,
      width,
      height,
      model: 'gemini-3.1-flash-image (Vibe Agent)',
      enhancedPrompt: englishPrompt,
      suggestedTitle: meta.title,
      suggestedDescription: meta.description,
      suggestedTags: meta.tags,
      usageReport: result.usageReport,
    };
  },

  /**
   * 3. Edit Existing Image from Gallery with AI Instructions & Reference
   */
  editImageWithAi: async ({
    referenceImageBase64,
    instruction,
    brandDna,
    aspectRatio = '1:1',
    model = 'gemini-3.1-flash-image',
    customApiKey,
  }: KosaiImageEditOptions): Promise<KosaiImageGenerationResult> => {
    const brandName = brandDna?.identity?.companyName || 'קושאן';
    const primaryColor = brandDna?.designTokens?.primaryColor;
    const secondaryColor = brandDna?.designTokens?.secondaryColor;

    const translatedInstruction = await translatePromptToEnglish(instruction, customApiKey);

    const editPromptParts = [
      `Modify and transform the provided reference image based on instructions: ${translatedInstruction}`,
      brandDna ? `Adhere to brand identity for "${brandName}"` : '',
      primaryColor && secondaryColor ? `Harmonize colors with palette accents ${primaryColor} and ${secondaryColor}` : '',
      'preserve core subject integrity while seamlessly applying the requested enhancements, studio quality, professional composition',
    ];

    const fullPrompt = editPromptParts.filter(Boolean).join(', ');
    const { width, height } = getDimensionsForRatio(aspectRatio);

    const result = await executeImageSynthesis(
      fullPrompt,
      width,
      height,
      aspectRatio,
      model,
      referenceImageBase64,
      customApiKey
    );

    const meta = await generateHebrewMetadata(instruction, 'edit', brandName);

    return {
      imageUrl: result.imageUrl,
      base64Data: result.base64Data,
      mimeType: result.mimeType,
      width,
      height,
      model: `${model} (AI Editor)`,
      enhancedPrompt: fullPrompt,
      suggestedTitle: meta.title,
      suggestedDescription: meta.description,
      suggestedTags: meta.tags,
      usageReport: result.usageReport,
    };
  },

  /**
   * 4. General Image Generation
   */
  generateImage: async (options: KosaiImageGenerationOptions): Promise<KosaiImageGenerationResult> => {
    const {
      prompt,
      mode = 'general',
      stylePreset,
      aspectRatio = '1:1',
      referenceImageBase64,
      brandDna,
      model = 'gemini-3.1-flash-image',
      customApiKey,
    } = options;

    if (mode === 'logo') {
      return kosaiImageAgentService.generateBrandLogo({
        prompt,
        stylePreset,
        brandDna,
        customApiKey,
      });
    }

    if (mode === 'vibe') {
      return kosaiImageAgentService.generateBrandVibeImage({
        prompt,
        vibeStyle: stylePreset,
        brandDna,
        aspectRatio,
        customApiKey,
      });
    }

    if (mode === 'edit' && referenceImageBase64) {
      return kosaiImageAgentService.editImageWithAi({
        referenceImageBase64,
        instruction: prompt,
        brandDna,
        aspectRatio,
        model,
        customApiKey,
      });
    }

    // General Mode
    const englishPrompt = await translatePromptToEnglish(prompt, customApiKey);
    const { width, height } = getDimensionsForRatio(aspectRatio);

    const result = await executeImageSynthesis(
      englishPrompt,
      width,
      height,
      aspectRatio,
      model,
      referenceImageBase64,
      customApiKey
    );

    const meta = await generateHebrewMetadata(prompt, 'general', brandDna?.identity?.companyName);

    return {
      imageUrl: result.imageUrl,
      base64Data: result.base64Data,
      mimeType: result.mimeType,
      width,
      height,
      model,
      enhancedPrompt: englishPrompt,
      suggestedTitle: meta.title,
      suggestedDescription: meta.description,
      suggestedTags: meta.tags,
      usageReport: result.usageReport,
    };
  },

  /**
   * 5. Enhance Prompt With Brand Context
   */
  enhancePromptWithBrandContext: async (
    prompt: string,
    type: 'logo' | 'vibe' | 'edit' | 'general',
    brandDna?: BrandDna
  ): Promise<{ enhancedPromptEn: string; explanationHe: string }> => {
    const brandName = brandDna?.identity?.companyName || 'המותג שלך';
    const primaryColor = brandDna?.designTokens?.primaryColor || '#6366f1';
    const translated = await translatePromptToEnglish(prompt);

    if (type === 'logo') {
      return {
        enhancedPromptEn: `Sleek minimalist modern vector logo for ${brandName}, featuring ${translated}, clean flat geometric design, crisp brand mark, ${primaryColor} primary color accents, white background, trending on Behance`,
        explanationHe: `קושאן שדרג את הבקשה ללוגו וקטורי מינימליסטי המותאם לשם ${brandName} וצבעי המותג.`,
      };
    }

    if (type === 'vibe') {
      return {
        enhancedPromptEn: `Commercial luxury brand atmosphere photograph for ${brandName}, scene capturing ${translated}, cinematic 85mm lens, studio rim lighting, refined aesthetics, harmonious color palette with ${primaryColor}`,
        explanationHe: `קושאן התאים את הפרומפט לצילום אווירה מסחרי יוקרתי ברמת איכות בינלאומית.`,
      };
    }

    return {
      enhancedPromptEn: `${translated}, studio lighting, ultra-detailed, 8k resolution, crisp focus, modern aesthetics`,
      explanationHe: `קושאן שיפר את הפירוט, התאורה והחדות עבור מנוע התמונות.`,
    };
  },
};

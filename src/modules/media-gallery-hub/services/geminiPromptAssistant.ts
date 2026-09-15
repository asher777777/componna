/**
 * Gemini AI Prompt Assistant & Metadata Encoder
 * Enhances user prompts into cinematic image generation prompts,
 * and automatically encodes descriptive Hebrew titles, rich descriptions, and semantic tags.
 */

export interface PromptStylePreset {
  id: string;
  nameHe: string;
  nameEn: string;
  icon: string;
  description: string;
  promptSuffix: string;
  negativePrompt?: string;
}

export const IMAGE_STYLE_PRESETS: PromptStylePreset[] = [
  {
    id: 'photorealistic',
    nameHe: 'צילום פוטוריאליסטי קולנועי',
    nameEn: 'Cinematic Photorealistic',
    icon: '📸',
    description: 'חדות גבוהה, תאורת אולפן, עדשת 85mm f/1.4, עומק שדה וטקסטורות עשירות',
    promptSuffix: 'award-winning cinematic photorealistic photography, shot on Hasselblad H6D-100c, 85mm lens, f/1.4 aperture, studio rim lighting, natural skin and material textures, octane render, 8k resolution, ultra-detailed',
    negativePrompt: 'blurry, low quality, oversaturated, deformed, cartoon, illustration',
  },
  {
    id: 'minimalist-logo',
    nameHe: 'לוגו ואיור וקטורי מינימליסטי',
    nameEn: 'Minimalist Vector Logo',
    icon: '✒️',
    description: 'קווים נקיים, טיפוגרפיה מעודנת, גרפיקה מודרנית על רקע חלק',
    promptSuffix: 'sleek minimalist vector graphic logo, flat design, crisp clean geometry, golden ratio balance, modern branding aesthetic, solid clean white isolated background, trending on Behance and Dribbble, high resolution vector',
    negativePrompt: 'noisy, photographic, complex gradients, cluttered background, realistic human',
  },
  {
    id: '3d-render',
    nameHe: 'תלת-ממד Pixar / Disney',
    nameEn: '3D Character & Scene',
    icon: '🧸',
    description: 'אנימציה תלת-ממדית מלוטשת, צבעוניות חיה, תאורה רכה וחמימה',
    promptSuffix: 'Pixar Disney style 3D animation render, Unreal Engine 5, smooth claymorphism, vibrant expressive lighting, ray tracing, cute character design, volumetric glow, high polygon masterpiece',
    negativePrompt: 'harsh shadows, flat, 2d drawing, photorealistic human',
  },
  {
    id: 'cyberpunk',
    nameHe: 'סייברפאנק / עתידני ניאון',
    nameEn: 'Cyberpunk Sci-Fi',
    icon: '🔮',
    description: 'אורות ניאון זוהרים, עיר עתידנית, השתקפויות בגשם, אווירת Blade Runner',
    promptSuffix: 'cyberpunk sci-fi aesthetic, neon glowing reflections, wet holographic streets, futuristic metropolis, volumetric smoke, high tech cybernetics, cinematic night scene, synthwave palette',
    negativePrompt: 'daylight, pastoral, medieval, rustic, low contrast',
  },
  {
    id: 'oil-painting',
    nameHe: 'ציור שמן קלאסי',
    nameEn: 'Classic Oil Painting',
    icon: '🎨',
    description: 'משיכות מכחול עמוקות בסגנון רנסנס, תאורת קיארוסקורו של רמברנדט',
    promptSuffix: 'classical oil on canvas masterpiece, heavy textured impasto brushstrokes, chiaroscuro lighting, Rembrandt and Da Vinci art style, warm museum gallery patina, rich golden undertones',
    negativePrompt: 'digital photo, sharp vector, flat graphic, modern',
  },
  {
    id: 'anime-studio',
    nameHe: 'אנימה יפנית / Studio Ghibli',
    nameEn: 'Anime Studio Ghibli',
    icon: '🌸',
    description: 'אמנות ציור ידנית קסומה, שמיים מלאי עננים, צבעי מים ואווירה פואטית',
    promptSuffix: 'Studio Ghibli Hayao Miyazaki anime style, hand-painted aesthetic, lush dreamy clouds, watercolor textures, whimsical magical atmosphere, Makoto Shinkai vibrant sky lighting',
    negativePrompt: 'photorealism, dark gritty, 3d polygon, realistic photo',
  },
  {
    id: 'interior-architecture',
    nameHe: 'עיצוב פנים ואדריכלות',
    nameEn: 'Architectural & Interior',
    icon: '🏙️',
    description: 'חללים מודרניים יוקרתיים, תאורה טבעית מחלונות גדולים, עץ ובטון אדריכלי',
    promptSuffix: 'Architectural Digest luxury interior design, Scandinavian modern minimalism, floor-to-ceiling windows, soft morning diffused sunlight, warm oak wood and marble materials, high-end photography',
    negativePrompt: 'cluttered, dark, distorted perspective, dirty walls',
  },
  {
    id: 'product-studio',
    nameHe: 'צילום מוצר מסחרי יוקרתי',
    nameEn: 'Commercial Product Studio',
    icon: '🛍️',
    description: 'צילום פרסומי חד על גבי פודיום עם תאורת סטודיו רכה והשתקפויות מדויקות',
    promptSuffix: 'commercial luxury product photography, placed on elegant stone podium, soft studio softbox lighting, pristine water droplet splashes or floating botanical elements, crisp hyper-focus, Vogue advertising aesthetic',
    negativePrompt: 'messy, grainy, amateur, low resolution, distracting background',
  },
];

export interface EnhancedPromptResult {
  originalPrompt: string;
  enhancedPromptEn: string;
  explanationHe: string;
  suggestedPresetId?: string;
}

export interface GeneratedMediaMetadata {
  title: string;
  description: string;
  tags: string[];
}

/**
 * Hebrew to English dictionary for rapid offline semantic visual translation
 */
const HEBREW_TRANSLATION_MAP: [RegExp, string][] = [
  [/לוגו עבור|לוגו של|לוגו ל/gi, 'modern logo for'],
  [/לוגו/gi, 'minimalist vector logo'],
  [/חברת תוכנה|חברת הייטק|סטארטאפ/gi, 'software tech startup company'],
  [/לגיבוש קהילות|גיבוש קהילות|קהילות/gi, 'community building, social unity and connection'],
  [/חתול/gi, 'cat'],
  [/כלב/gi, 'dog'],
  [/אסטרונאוט/gi, 'astronaut in futuristic space suit'],
  [/בחלל|בחלל החיצון/gi, 'in deep cosmic space near glowing nebula'],
  [/כוכב שבתאי|שבתאי/gi, 'Saturn planet with rings'],
  [/כדור הארץ/gi, 'planet Earth'],
  [/שותה קפה/gi, 'sipping a cup of warm coffee'],
  [/איש עסקים|אישה עסקית/gi, 'professional business person'],
  [/משרד מודרני/gi, 'sleek modern office with glass windows'],
  [/עיר עתידנית/gi, 'futuristic sci-fi city with flying vehicles and neon'],
  [/מכונית ספורט/gi, 'high-end exotic supercar'],
  [/מסעדה איטלקית/gi, 'cozy Italian fine-dining restaurant with warm lighting'],
  [/שקיעה זהובה|שקיעה/gi, 'golden hour warm sunset sky'],
  [/חוף ים|ים/gi, 'pristine ocean beach with turquoise crystal water'],
  [/יער קסום/gi, 'enchanted fantasy forest with glowing fireflies and mist'],
  [/פרחים/gi, 'blooming exotic flowers'],
  [/רובוט/gi, 'advanced humanoid AI robot'],
  [/אוכל יוקרתי/gi, 'gourmet culinary dish Michelin star plating'],
  [/נוף הרים/gi, 'majestic snow-capped mountain peaks landscape'],
  [/איור/gi, 'vector illustration'],
  [/תמונה/gi, 'photograph'],
  [/רקע לבן/gi, 'clean solid white background'],
  [/רקע שחור/gi, 'dark studio background'],
];

/**
 * Helper to translate Hebrew text to English concepts
 */
export function translateHebrewPromptToEnglish(text: string): string {
  let translated = text.trim();
  const containsHebrew = /[\u0590-\u05FF]/.test(translated);
  if (!containsHebrew) return translated;

  // Apply map
  for (const [regex, replacement] of HEBREW_TRANSLATION_MAP) {
    translated = translated.replace(regex, replacement);
  }

  // If Hebrew characters still remain, clean them or provide context
  if (/[\u0590-\u05FF]/.test(translated)) {
    // If it's pure Hebrew with no matching dictionary terms
    const cleanHebrew = translated.replace(/[\u0590-\u05FF]/g, '').trim();
    if (cleanHebrew.length > 3) {
      translated = cleanHebrew;
    } else {
      translated = `artistic creative visual concept, ${text}`;
    }
  }

  return translated.replace(/\s+/g, ' ').trim();
}

/**
 * Enhances a raw user prompt into a high-fidelity image prompt using Gemini AI.
 * Handles Hebrew-to-English translation, stylistic expansion, lighting, composition, and keywords.
 */
export async function enhancePromptWithAi(
  userPrompt: string,
  selectedPresetId?: string,
  apiKey?: string
): Promise<EnhancedPromptResult> {
  const cleanInput = userPrompt.trim();
  if (!cleanInput) {
    return {
      originalPrompt: '',
      enhancedPromptEn: '',
      explanationHe: '',
    };
  }

  const effectiveKey = (apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || '').trim();
  const preset = IMAGE_STYLE_PRESETS.find((p) => p.id === selectedPresetId);

  // If we have an API key, call Gemini to generate the perfect prompt
  if (effectiveKey) {
    try {
      const systemInstruction = `You are a World-Class AI Image Prompt Engineer (specializing in Google Gemini Image, Nano Banana Pro, and Imagen 3).
Your task is to transform the user's prompt (which may be in Hebrew or English) into an exquisite, hyper-detailed, English image generation prompt.

Rules:
1. Translate Hebrew concepts into descriptive, vivid visual English.
2. Put the primary subject and action first.
3. Add specific details: lighting (cinematic, rim, golden hour, volumetric), materials/textures, camera & lens specs (85mm, f/1.8, 8k octane render), and composition.
4. If a style preset is provided, seamlessly blend its aesthetic into the prompt.
5. Provide a short, friendly Hebrew explanation (1-2 sentences) of what improvements were made.
6. Return ONLY valid JSON in this exact structure:
{
  "enhancedPromptEn": "Detailed English prompt here...",
  "explanationHe": "הסבר קצר בעברית על השיפורים שבוצעו..."
}`;

      const userMessage = `User Input Prompt: "${cleanInput}"
Selected Style Preset: ${preset ? preset.nameEn + ' (' + preset.promptSuffix + ')' : 'None (Choose best matching style)'}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${effectiveKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.4,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed.enhancedPromptEn) {
            return {
              originalPrompt: cleanInput,
              enhancedPromptEn: parsed.enhancedPromptEn,
              explanationHe: parsed.explanationHe || 'הפרומפט שודרג לפרומפט קולנועי מפורט באנגלית.',
              suggestedPresetId: selectedPresetId,
            };
          }
        }
      }
    } catch (e) {
      console.warn('[Gemini Prompt Assistant API notice]:', e);
    }
  }

  // Fallback Rule-Based Semantic Translator & Prompt Enhancer (instant offline)
  const translatedEn = translateHebrewPromptToEnglish(cleanInput);
  const presetSuffix = preset ? preset.promptSuffix : 'cinematic 8k resolution, studio lighting, hyper-detailed, masterpiece, octane render';
  const enhancedEn = `${translatedEn}, ${presetSuffix}`;

  return {
    originalPrompt: cleanInput,
    enhancedPromptEn: enhancedEn,
    explanationHe: 'הפרומפט תורגם לאנגלית ושודרג עם הגדרות סגנון ואיכות.',
    suggestedPresetId: selectedPresetId,
  };
}

/**
 * Automatically generates a Hebrew title, rich Hebrew description, and semantic tags
 * to encode the generated image properly in the media gallery.
 */
export async function generateImageMetadataWithAi(
  userPrompt: string,
  enhancedPromptEn: string,
  apiKey?: string
): Promise<GeneratedMediaMetadata> {
  const effectiveKey = (apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || '').trim();

  // Try Gemini AI generation for rich metadata
  if (effectiveKey) {
    try {
      const prompt = `Based on this image creation request, generate professional metadata in Hebrew for cataloging the image in a media asset management system.

User Original Input: "${userPrompt}"
Detailed AI Prompt: "${enhancedPromptEn}"

Return ONLY valid JSON in this exact structure:
{
  "title": "שם קצר, קולע וברור בעברית עם סיומת .png (לדוגמה: לוגו חברת תוכנה לגיבוש קהילות.png)",
  "description": "תיאור עשיר, מפורט ומזמין בעברית של תוכן התמונה, האווירה, הצבעים והתאורה (2-3 משפטים).",
  "tags": ["תגית1", "תגית2", "תגית3", "תגית4", "gemini_ai", "banana_pro"]
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${effectiveKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          let title = (parsed.title || '').trim();
          if (title && !title.includes('.')) {
            title = `${title}.png`;
          }

          return {
            title: title || `${cleanTitleFallback(userPrompt)}.png`,
            description: parsed.description || `תמונה שנוצרה ב-AI על פי הפרומפט: ${userPrompt}`,
            tags: Array.isArray(parsed.tags) ? parsed.tags : ['gemini_ai', 'ai_generated', 'banana_pro'],
          };
        }
      }
    } catch (err) {
      console.warn('[Gemini Metadata Encoder notice]:', err);
    }
  }

  // Fallback Hebrew metadata generator
  const baseTitle = cleanTitleFallback(userPrompt);
  return {
    title: `${baseTitle}.png`,
    description: `יצירת אמנות AI באמצעות Google Gemini לפי הפרומפט: "${userPrompt}".`,
    tags: ['gemini_ai', 'ai_generated', 'banana_pro', 'תמונה'],
  };
}

/**
 * Sanitizes user prompt into a clean Hebrew filename
 */
function cleanTitleFallback(prompt: string): string {
  const clean = prompt
    .replace(/[<>:"/\\|?*]/g, '')
    .trim()
    .slice(0, 40);

  return clean || `יצירת_Gemini_AI_${Date.now()}`;
}

/**
 * Cloud Functions & Gemini API Wrapper for media-gallery-hub
 * Provides type-safe server-side operations for OCR, document extraction,
 * heavy file transformations, and Gemini 1.5/2.0 Flash calls.
 */

import { BrandDna } from '../../../core/contracts';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { executeCloudAi, PLEASANT_AI_ERROR_HEBREW } from '../../../core/ai';

export const OCR_AND_EXTRACTION_SYSTEM_PROMPT = `You are an intelligent document parsing and OCR extraction specialist.
Analyze the provided document or image.
Extract:
1. Document title or headline
2. Primary textual content (summarized clearly if lengthy)
3. Key structured data points (dates, amounts, pricing, client names, itemized lists, tables)
4. Key themes and tags

Return a clean, structured JSON format with keys:
{
  "title": string,
  "summary": string,
  "keyPoints": string[],
  "tablesOrItems": Array<Record<string, any>>,
  "extractedText": string,
  "tags": string[]
}`;

export function buildDocToLandingPagePrompt(brandDna?: BrandDna | null): string {
  const brandContext = brandDna
    ? `
BRAND CONTEXT & IDENTITY:
- Company Name: ${brandDna.identity.companyName || 'לא צוין'}
- Slogan: ${brandDna.identity.slogan || ''}
- Company Vision / Purpose: ${brandDna.identity.companyVision || brandDna.identity.organizationPurpose || ''}
- Main UVP: ${brandDna.audience.mainUvp || ''}
- Target Audience: ${brandDna.audience.targetAudiences?.join(', ') || ''}
- Tone / Personality: Formality ${brandDna.voice.personality?.formality ?? 5}/10, Warmth ${brandDna.voice.personality?.warmth ?? 5}/10, Luxury ${brandDna.voice.personality?.luxury ?? 5}/10
- Power Words: ${brandDna.voice.powerWords?.join(', ') || ''}
- Primary Brand Color: ${brandDna.designTokens.primaryColor || '#6366f1'}
- Secondary Brand Color: ${brandDna.designTokens.secondaryColor || '#a855f7'}
`
    : `
BRAND CONTEXT:
- Modern, clean, high-conversion visual design with RTL Hebrew layout.
`;

  return `You are an elite marketing strategist, conversion copywriter, and frontend UX designer.
Your mission is to transform the analyzed document, quotation, brochure, or flyer into an interactive, high-converting Hebrew Landing Page JSON structure.

${brandContext}

RULES:
1. All user-facing text, headlines, and descriptions MUST be in natural, persuasive, fluent Hebrew.
2. The page structure must be modular and divided into logical sections: "hero", "benefits", "pricing", "faq", "cta".
3. Output ONLY valid, raw JSON.`;
}

export interface DocumentOcrResult {
  title: string;
  summary: string;
  keyPoints: string[];
  tablesOrItems: Array<Record<string, any>>;
  extractedText: string;
  tags: string[];
}

export interface GeneratedLandingPageSection {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  badge?: string;
  buttonText?: string;
  items?: Array<any>;
  packages?: Array<any>;
  [key: string]: any;
}

export interface GeneratedLandingPageData {
  pageTitle: string;
  metaDescription?: string;
  brandStyles?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  sections: GeneratedLandingPageSection[];
}

export class FunctionsApi {
  /**
   * Helper to retrieve Gemini API key
   */
  public static getApiKey(customKey?: string): string {
    const key = customKey || getModuleGeminiKey('media-gallery-hub') || '';
    if (!key) {
      console.warn('[FunctionsApi] No Gemini API Key provided. Check system connection settings.');
    }
    return key;
  }

  /**
   * Extract text and structured data from document via Gemini Vision / Flash
   */
  public static async analyzeDocumentWithGemini(
    imageBase64OrText: string,
    mimeType: string,
    customApiKey?: string
  ): Promise<DocumentOcrResult> {
    const key = this.getApiKey(customApiKey);
    if (!key) {
      throw new Error('חסר מפתח API של Google Gemini לצורך סריקת מסמכים');
    }

    const isBase64 = imageBase64OrText.startsWith('data:') || imageBase64OrText.length > 500 && !imageBase64OrText.includes('\n');
    const cleanBase64 = imageBase64OrText.replace(/^data:[^;]+;base64,/, '');

    const parts: any[] = [];
    if (isBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
      parts.push({
        text: `${OCR_AND_EXTRACTION_SYSTEM_PROMPT}\nAnalyze this document image. Return only raw JSON.`,
      });
    } else {
      parts.push({
        text: `${OCR_AND_EXTRACTION_SYSTEM_PROMPT}\n\nDocument Text Content:\n${imageBase64OrText}\n\nReturn only raw JSON.`,
      });
    }

    try {
      const aiRes = await executeCloudAi({
        prompt: isBase64 ? 'Analyze this document image. Return only raw JSON.' : `Document Text Content:\n${imageBase64OrText}\n\nReturn only raw JSON.`,
        systemInstruction: OCR_AND_EXTRACTION_SYSTEM_PROMPT,
        model: 'gemini-3.8-flash',
        imageParts: isBase64 ? [{ inlineData: { mimeType: mimeType || 'image/jpeg', data: cleanBase64 } }] : undefined,
        responseMimeType: 'application/json',
        apiKey: key,
      });

      if (aiRes.success && aiRes.data) {
        const parsed = typeof aiRes.data === 'string' ? JSON.parse(aiRes.data) : aiRes.data;
        return parsed as DocumentOcrResult;
      }
    } catch (err: any) {
      console.warn('[analyzeDocumentWithGemini] AI error:', err);
    }

    return {
      title: 'מסמך סרוק',
      summary: 'עיבוד המסמך הסתיים',
      keyPoints: [],
      tablesOrItems: [],
      extractedText: isBase64 ? '' : imageBase64OrText,
      tags: ['סריקה', 'מסמך'],
    };
  }

  /**
   * Convert document content or image into high-converting Landing Page JSON
   */
  public static async generateLandingPageFromDoc(
    contentOrBase64: string,
    mimeType: string,
    brandDna?: BrandDna | null,
    customApiKey?: string
  ): Promise<GeneratedLandingPageData> {
    const key = this.getApiKey(customApiKey);
    if (!key) {
      throw new Error('חסר מפתח API של Google Gemini לצורך יצירת דף נחיתה');
    }

    const prompt = buildDocToLandingPagePrompt(brandDna);
    const isBase64 = contentOrBase64.startsWith('data:') || (contentOrBase64.length > 500 && !contentOrBase64.includes('\n'));
    const cleanBase64 = contentOrBase64.replace(/^data:[^;]+;base64,/, '');

    const parts: any[] = [];
    if (isBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
      parts.push({
        text: `${prompt}\n\nTransform this uploaded visual document into a complete landing page JSON. Return valid JSON only.`,
      });
    } else {
      parts.push({
        text: `${prompt}\n\nDocument Content to transform into Landing Page:\n${contentOrBase64}\n\nReturn valid JSON only.`,
      });
    }

    try {
      const aiRes = await executeCloudAi({
        prompt: isBase64
          ? `${prompt}\n\nTransform this uploaded visual document into a complete landing page JSON. Return valid JSON only.`
          : `${prompt}\n\nDocument Content to transform into Landing Page:\n${contentOrBase64}\n\nReturn valid JSON only.`,
        model: 'gemini-3.8-flash',
        imageParts: isBase64 ? [{ inlineData: { mimeType: mimeType || 'image/jpeg', data: cleanBase64 } }] : undefined,
        responseMimeType: 'application/json',
        apiKey: key,
      });

      if (aiRes.success && aiRes.data) {
        const parsed = typeof aiRes.data === 'string' ? JSON.parse(aiRes.data) : aiRes.data;
        return parsed as GeneratedLandingPageData;
      }
    } catch (err: any) {
      console.warn('[generateLandingPageFromDocument] AI error:', err);
    }

    throw new Error(PLEASANT_AI_ERROR_HEBREW);
  }
}

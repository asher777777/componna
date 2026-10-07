/**
 * Cloud Functions & Gemini API Wrapper for media-gallery-hub
 * Provides type-safe server-side operations for OCR, document extraction,
 * heavy file transformations, and Gemini 1.5/2.0 Flash calls.
 */

import { OCR_AND_EXTRACTION_SYSTEM_PROMPT, buildDocToLandingPagePrompt } from '../prompts';
import { BrandDna } from '../../../core/contracts';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';

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

    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.8-flash-lite',
      'gemini-3.5-flash-lite',
    ];

    let lastError = '';
    for (const targetModel of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          try {
            return JSON.parse(cleanedJson) as DocumentOcrResult;
          } catch {
            return {
              title: 'מסמך סרוק',
              summary: rawText.slice(0, 300),
              keyPoints: [],
              tablesOrItems: [],
              extractedText: rawText,
              tags: ['סריקה', 'מסמך'],
            };
          }
        } else {
          lastError = await response.text();
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    throw new Error(`שגיאה בסריקת מסמך: ${lastError}`);
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

    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.8-flash-lite',
      'gemini-3.5-flash-lite',
    ];

    let lastError = '';
    for (const targetModel of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          const parsed = JSON.parse(cleanedJson);
          return parsed as GeneratedLandingPageData;
        } else {
          lastError = await response.text();
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    throw new Error(`שגיאה ביצירת דף נחיתה מהמסמך: ${lastError}`);
  }
}

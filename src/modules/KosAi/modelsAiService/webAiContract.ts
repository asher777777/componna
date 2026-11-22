/**
 * KOSAI AI Monopoly - KosWebAi Contract
 * KOSUN26 Gate 3: Authorized contract for landing page generation, section enhancement, and marketing concepts.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';
import { resolveAiProxyUrl } from '../../../core/ai/cloudAiClient';
import { resolveCurrentTenantId, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import { calculateGeminiCost } from '../../../core/ai/geminiCostTracker';

export interface KosaiMarketingIdea {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  targetObjective: string;
  badge: string;
}

export const kosaiWebAiContract = {
  /**
   * Generates 6 marketing angles derived continuously from Brand DNA.
   * Fully protected by Circuit Breaker, Single-Flight deduplication, and Memory+SessionStorage caching.
   */
  async generateMarketingIdeas(
    prompt: string,
    cacheKey?: string,
    options?: { skipCache?: boolean; apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<KosaiMarketingIdea[]>> {
    return executeKosaiAi<KosaiMarketingIdea[]>('KosWebAi', prompt, {
      model: 'gemini-3.8-flash-lite',
      maxOutputTokens: 1000,
      responseMimeType: 'application/json',
      temperature: 0.7,
      cacheKey: cacheKey || 'marketing_ideas_default',
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Generates a complete 4-8+ sections landing page with JSON output.
   * Uses gemini-3.8-flash with higher token budget for rich Hebrew copy & GEO 2026.4 compliance.
   */
  async generatePageStructure(
    prompt: string,
    systemInstruction?: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosWebAi', prompt, {
      model: 'gemini-3.8-flash',
      maxOutputTokens: 6500,
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.7,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Enhances a specific section (Hero, Features, Pricing, etc.).
   */
  async enhanceSection(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosWebAi', prompt, {
      model: 'gemini-3.8-flash-lite',
      maxOutputTokens: 1500,
      responseMimeType: 'application/json',
      temperature: 0.7,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Generates SEO metadata, title, and keywords.
   */
  async generateSeoMetadata(
    prompt: string,
    cacheKey?: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosWebAi', prompt, {
      model: 'gemini-3.8-flash-lite',
      maxOutputTokens: 600,
      responseMimeType: 'application/json',
      temperature: 0.7,
      cacheKey: cacheKey ? `seo_${cacheKey}` : undefined,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Extracts structured text & facts from an uploaded PNG/JPG image via Gemini Vision.
   */
  async extractTextFromImage(
    imageBase64: string,
    imageMimeType: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<string>> {
    return executeKosaiAi<string>(
      'KosWebAi',
      'חלץ את כל הטקסט, המספרים, השירותים, המחירים והמסרים המופיעים בתמונה זו בעברית מסודרת וברורה לצורך בניית דף אינטרנט. החזר טקסט נקי בלבד.',
      {
        model: 'gemini-3.8-flash-lite',
        maxOutputTokens: 1200,
        temperature: 0.2,
        imageBase64,
        imageMimeType,
        customApiKey: options?.apiKey,
        tenantId: options?.tenantId,
        category: 'content',
      }
    );
  },

  /**
   * Generates a custom Hero image via the authorized KOSAI server-side image proxy (Master key).
   */
  async generateHeroImage(
    params: {
      prompt: string;
      aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
    },
    options?: { tenantId?: string }
  ): Promise<KosaiContractResult<string | null>> {
    const tenantId =
      options?.tenantId ||
      (typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID) ||
      ROOT_TENANT_ID;

    try {
      const res = await fetch(resolveAiProxyUrl('image'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'image',
          prompt: params.prompt,
          aspectRatio: params.aspectRatio || '16:9',
          model: 'gemini-3.1-flash-image',
          tenantId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const url =
          data?.imageUrl ||
          (data?.base64Data ? `data:${data.mimeType || 'image/jpeg'};base64,${data.base64Data}` : null);
        return {
          success: Boolean(url),
          data: url,
          costReport: calculateGeminiCost({
            model: 'gemini-3.1-flash-image',
            promptTokens: 65,
            candidatesTokens: 1120,
          }),
          fromCache: false,
        };
      }
    } catch (err) {
      console.warn('[kosaiWebAiContract] generateHeroImage error:', err);
    }

    return {
      success: false,
      data: null,
      costReport: calculateGeminiCost({ model: 'gemini-3.1-flash-image', promptTokens: 0, candidatesTokens: 0 }),
      fromCache: false,
    };
  },
};

/**
 * KOSAI AI Monopoly - KosBranding Contract
 * KOSUN26 Gate 3: Authorized contract for Brand DNA discovery, voice rephrasing, step copilot, and condensed brand essence paragraphs.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';
import { BrandUiVocabulary } from '../../../core/contracts';

export interface KosaiBrandContractResult<T = any> extends KosaiContractResult<T> {}

export const kosaiBrandContract = {
  /**
   * Generates a condensed, rich Brand Essence paragraph of 250-300 words ("מועט המחזיק את המרובה").
   * Capped to 600 output tokens.
   */
  async generateBrandSummaryParagraph(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string; skipCache?: boolean }
  ): Promise<KosaiContractResult<{ summaryParagraph: string; wordCount: number }>> {
    return executeKosaiAi<{ summaryParagraph: string; wordCount: number }>('KosBranding', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.5,
      maxOutputTokens: 600,
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Extracts complete Brand DNA schema from an interview transcript or brief.
   * Capped to 1200 output tokens.
   */
  async generateBrandDnaFromInterview(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosBranding', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.4,
      maxOutputTokens: 1200,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Rephrases and elevates copy to strictly align with Brand DNA voice.
   * Capped to 500 output tokens.
   */
  async rephraseTextWithBrandVoice(
    prompt: string,
    options?: { systemInstruction?: string; apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<string>> {
    const res = await executeKosaiAi<string>('KosBranding', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'text/plain',
      temperature: 0.6,
      maxOutputTokens: 500,
      systemInstruction: options?.systemInstruction,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
    return {
      ...res,
      data: typeof res.data === 'string' ? res.data.trim() : JSON.stringify(res.data),
    };
  },

  /**
   * Generates step assistance suggestions during guided Brand DNA wizard.
   * Capped to 600 output tokens.
   */
  async generateStepAssistance(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosBranding', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.5,
      maxOutputTokens: 600,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Generates high-converting content strategies for sales and service pages.
   * Capped to 800 output tokens.
   */
  async generateContentStrategies(
    prompt: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any[]>> {
    return executeKosaiAi<any[]>('KosBranding', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.6,
      maxOutputTokens: 800,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Generates customer persona, objections, flagship products, business packages, market research or ecosystem items.
   * Supports systemInstruction for full Brand DNA context and 1500 maxOutputTokens so JSON is never truncated.
   */
  async generateEntityItem(
    prompt: string,
    options?: {
      apiKey?: string;
      tenantId?: string;
      systemInstruction?: string;
      maxOutputTokens?: number;
      responseMimeType?: 'application/json' | 'text/plain';
    }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosBranding', prompt, {
      model: 'gemini-3.8-flash-lite',
      systemInstruction: options?.systemInstruction,
      responseMimeType: options?.responseMimeType || 'application/json',
      temperature: 0.65,
      maxOutputTokens: options?.maxOutputTokens || 1500,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Generates microcopy and UI vocabulary (CTAs, placeholders, section headings, archive categories) matching Brand DNA.
   * Capped to 3500 output tokens to allow full coverage of all sections and archive definitions.
   */
  async generateBrandUiVocabulary(
    prompt: string,
    options?: {
      apiKey?: string;
      tenantId?: string;
      systemInstruction?: string;
      maxOutputTokens?: number;
    }
  ): Promise<KosaiContractResult<BrandUiVocabulary>> {
    return executeKosaiAi<BrandUiVocabulary>('KosBranding', prompt, {
      model: 'gemini-3.8-flash-lite',
      systemInstruction: options?.systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.6,
      maxOutputTokens: options?.maxOutputTokens || 3500,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },
};

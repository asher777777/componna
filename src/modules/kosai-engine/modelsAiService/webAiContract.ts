/**
 * KOSAI AI Monopoly - KosWebAi Contract
 * KOSUN26 Gate 3: Authorized contract for landing page generation, section enhancement, and marketing concepts.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';

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
      responseMimeType: 'application/json',
      temperature: 0.85,
      cacheKey: cacheKey || 'marketing_ideas_default',
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Generates a complete 4-8 sections landing page with JSON output.
   */
  async generatePageStructure(
    prompt: string,
    systemInstruction?: string,
    options?: { apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<any>> {
    return executeKosaiAi('KosWebAi', prompt, {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.75,
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
      responseMimeType: 'application/json',
      temperature: 0.7,
      cacheKey: cacheKey ? `seo_${cacheKey}` : undefined,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },
};

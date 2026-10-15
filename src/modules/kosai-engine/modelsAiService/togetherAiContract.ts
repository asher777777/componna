/**
 * KOSAI AI Monopoly - KosTogether / Communities & Groups Contract
 * KOSUN26 Gate 3: Authorized contract for smart segmentation rules, community vision, broadcast messaging, and growth actions.
 * Enforces exclusive usage of Gemini 3.8 model variations with hard token caps and zero external leaks.
 */

import { executeKosaiAi } from './executeKosaiAi';
import { KosaiContractResult } from './types';

export type TogetherAiMode = 'eco' | 'balanced' | 'deep';

export interface TogetherSmartRuleItem {
  field:
    | 'total_spent'
    | 'campaign_amount'
    | 'order_count'
    | 'lead_source'
    | 'gender'
    | 'mh_crm_city'
    | 'company_name'
    | 'job_title'
    | 'tags'
    | 'status'
    | 'last_form_name'
    | 'has_phone'
    | 'has_email';
  operator: 'gte' | 'lte' | 'eq' | 'contains' | 'exists' | 'not_exists';
  value: string | number;
}

export interface TogetherSmartRulesResult {
  rules: TogetherSmartRuleItem[];
  matchType: 'all' | 'any';
  suggestedName: string;
  suggestedColor: string;
  description?: string;
}

export interface TogetherCommunityVisionResult {
  vision: string;
  purpose: string;
  tagline: string;
  suggestedTiers: Array<{
    name: string;
    amount: number;
    description: string;
  }>;
}

export interface TogetherBroadcastDraftResult {
  messageText: string;
  isPoll?: boolean;
  pollQuestion?: string;
  pollOptions?: string[];
  callToAction?: string;
}

export interface TogetherGrowthInsightResult {
  summary: string;
  score: number;
  actionItems: string[];
  recommendedRules: string[];
}

export const kosaiTogetherContract = {
  /**
   * Generates dynamic filter rules for smart communities from natural language queries.
   * Locked to gemini-3.8-flash-lite with a hard cap of 450 output tokens.
   */
  async generateSmartRules(
    prompt: string,
    options?: { cacheKey?: string; skipCache?: boolean; apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<TogetherSmartRulesResult>> {
    return executeKosaiAi<TogetherSmartRulesResult>('KosTogether', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 450,
      cacheKey: options?.cacheKey,
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Generates a community vision, purpose, and contribution tiers.
   * Supports Gemini 3.8 model variations: eco (flash-lite), balanced (flash), deep (pro).
   */
  async generateCommunityVision(
    prompt: string,
    options?: {
      mode?: TogetherAiMode;
      cacheKey?: string;
      skipCache?: boolean;
      apiKey?: string;
      tenantId?: string;
    }
  ): Promise<KosaiContractResult<TogetherCommunityVisionResult>> {
    const mode = options?.mode || 'eco';
    let model: 'gemini-3.8-flash-lite' | 'gemini-3.8-flash' | 'gemini-3.8-pro' = 'gemini-3.8-flash-lite';
    let maxOutputTokens = 500;

    if (mode === 'balanced') {
      model = 'gemini-3.8-flash';
      maxOutputTokens = 700;
    } else if (mode === 'deep') {
      model = 'gemini-3.8-pro';
      maxOutputTokens = 900;
    }

    return executeKosaiAi<TogetherCommunityVisionResult>('KosTogether', prompt, {
      model,
      responseMimeType: 'application/json',
      temperature: 0.6,
      maxOutputTokens,
      cacheKey: options?.cacheKey,
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Drafts a targeted WhatsApp broadcast message or interactive poll for a community.
   * Locked to gemini-3.8-flash-lite with a hard cap of 500 output tokens.
   */
  async draftBroadcastMessage(
    prompt: string,
    options?: { cacheKey?: string; skipCache?: boolean; apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<TogetherBroadcastDraftResult>> {
    return executeKosaiAi<TogetherBroadcastDraftResult>('KosTogether', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.5,
      maxOutputTokens: 500,
      cacheKey: options?.cacheKey,
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },

  /**
   * Generates actionable community growth and engagement insights.
   * Locked to gemini-3.8-flash-lite with a hard cap of 500 output tokens.
   */
  async suggestGrowthActions(
    prompt: string,
    options?: { cacheKey?: string; skipCache?: boolean; apiKey?: string; tenantId?: string }
  ): Promise<KosaiContractResult<TogetherGrowthInsightResult>> {
    return executeKosaiAi<TogetherGrowthInsightResult>('KosTogether', prompt, {
      model: 'gemini-3.8-flash-lite',
      responseMimeType: 'application/json',
      temperature: 0.4,
      maxOutputTokens: 500,
      cacheKey: options?.cacheKey,
      skipCache: options?.skipCache,
      customApiKey: options?.apiKey,
      tenantId: options?.tenantId,
      category: 'content',
    });
  },
};

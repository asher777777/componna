/**
 * ============================================================================
 * ⚠️ אזהרת שומר הסף (KOSUN26 GATE 3 - AI MONOPOLY) ⚠️
 * כל פרומפט בקובץ זה נשלח אך ורק לחוזה עם KOSAI הנמצא בתיקייה:
 * src/modules/KosAi/modelsAiService/togetherAiContract.ts
 * אין לשלוח לג'מיני בשום אופן ישירות! חל איסור מוחלט על שימוש ב-fetch מקומי!
 * ============================================================================
 */

import {
  BUILD_SMART_RULES_PROMPT,
  BUILD_COMMUNITY_VISION_PROMPT,
  BUILD_COMMUNITY_BROADCAST_PROMPT,
  BUILD_COMMUNITY_GROWTH_PROMPT,
  SmartRulesPromptInput,
  CommunityVisionPromptInput,
  CommunityBroadcastPromptInput,
  CommunityGrowthPromptInput,
} from '../prompts/togetherPrompts';
import {
  kosaiTogetherContract,
  TogetherSmartRulesResult,
  TogetherCommunityVisionResult,
  TogetherBroadcastDraftResult,
  TogetherGrowthInsightResult,
  TogetherAiMode,
} from '../../KosAi/modelsAiService/togetherAiContract';

export interface KosaiTogetherDispatchOptions {
  apiKey?: string;
  tenantId?: string;
  skipCache?: boolean;
}

/**
 * Dispatches natural language query to KOSAI for smart rules generation
 */
export async function dispatchSmartRulesToKosai(
  input: SmartRulesPromptInput,
  options?: KosaiTogetherDispatchOptions
): Promise<TogetherSmartRulesResult> {
  const prompt = BUILD_SMART_RULES_PROMPT(input);
  const cacheKey = `together_rules_${input.naturalLanguageQuery.trim().slice(0, 40)}`;
  const result = await kosaiTogetherContract.generateSmartRules(prompt, {
    cacheKey,
    skipCache: options?.skipCache,
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * Dispatches community vision and purpose generation to KOSAI
 */
export async function dispatchCommunityVisionToKosai(
  input: CommunityVisionPromptInput,
  options?: KosaiTogetherDispatchOptions & { mode?: TogetherAiMode }
): Promise<TogetherCommunityVisionResult> {
  const prompt = BUILD_COMMUNITY_VISION_PROMPT(input);
  const cacheKey = `together_vision_${input.communityName.trim().slice(0, 30)}_${options?.mode || 'eco'}`;
  const result = await kosaiTogetherContract.generateCommunityVision(prompt, {
    mode: options?.mode,
    cacheKey,
    skipCache: options?.skipCache,
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * Dispatches WhatsApp broadcast copy and poll drafting to KOSAI
 */
export async function dispatchCommunityBroadcastToKosai(
  input: CommunityBroadcastPromptInput,
  options?: KosaiTogetherDispatchOptions
): Promise<TogetherBroadcastDraftResult> {
  const prompt = BUILD_COMMUNITY_BROADCAST_PROMPT(input);
  const result = await kosaiTogetherContract.draftBroadcastMessage(prompt, {
    skipCache: options?.skipCache,
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * Dispatches growth analytics and actionable recommendations to KOSAI
 */
export async function dispatchCommunityGrowthToKosai(
  input: CommunityGrowthPromptInput,
  options?: KosaiTogetherDispatchOptions
): Promise<TogetherGrowthInsightResult> {
  const prompt = BUILD_COMMUNITY_GROWTH_PROMPT(input);
  const cacheKey = `together_growth_${input.groupName}_${input.memberCount}`;
  const result = await kosaiTogetherContract.suggestGrowthActions(prompt, {
    cacheKey,
    skipCache: options?.skipCache,
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

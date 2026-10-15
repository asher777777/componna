/**
 * KosTogether API Gateway & Compatibility Layer
 * Delegates all operations to the new clean togetherCopilotService.
 * KOSUN26 Gate 3: All AI interactions route strictly through KOSAI modelsAiService.
 */

import {
  generateSmartGroupRules,
  generateCommunityVision,
  draftCommunityBroadcastMessage,
  suggestCommunityGrowth,
  GenerateSmartGroupRulesRequest,
  GenerateSmartGroupRulesResponse,
  GenerateCommunityVisionRequest,
  GenerateCommunityVisionResponse,
  DraftCommunityBroadcastRequest,
  SuggestCommunityGrowthRequest,
} from '../services/togetherCopilotService';

export * from '../services/togetherCopilotService';

/**
 * Compatibility alias for legacy callers
 * Calls generateSmartGroupRules which guarantees KOSAI monopoly and zero-token fallbacks.
 */
export async function callSmartRulesAiHelper(
  payload: GenerateSmartGroupRulesRequest
): Promise<GenerateSmartGroupRulesResponse> {
  return generateSmartGroupRules(payload);
}

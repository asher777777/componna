export * from './brandPrompts';

export {
  BUILD_BRAND_DISCOVERY_PROMPT as buildBrandDiscoveryPrompt,
  BUILD_BRAND_REPHRASE_PROMPT as buildBrandRephrasePrompt,
  BUILD_STEP_ASSISTANCE_PROMPT as buildStepAssistancePrompt,
  BUILD_CONTENT_STRATEGIES_PROMPT as buildContentStrategiesPrompt,
  BUILD_BRAND_SUMMARY_PARAGRAPH_PROMPT as buildBrandSummaryParagraphPrompt,
} from './brandPrompts';

import { BrandDna } from '../types/brandDna';
import { BUILD_BRAND_SYSTEM_CONTEXT } from './brandPrompts';

/**
 * Builds a focused, token-optimized system context block based on the Brand Essence paragraph
 */
export function buildBrandSystemContext(brand: BrandDna, moduleRole?: string): string {
  return BUILD_BRAND_SYSTEM_CONTEXT(brand, moduleRole);
}

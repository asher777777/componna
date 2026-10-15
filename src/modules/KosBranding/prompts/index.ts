export * from './brandPrompts';

export {
  BUILD_BRAND_DISCOVERY_PROMPT as buildBrandDiscoveryPrompt,
  BUILD_BRAND_REPHRASE_PROMPT as buildBrandRephrasePrompt,
  BUILD_STEP_ASSISTANCE_PROMPT as buildStepAssistancePrompt,
  BUILD_CONTENT_STRATEGIES_PROMPT as buildContentStrategiesPrompt,
  BUILD_BRAND_SUMMARY_PARAGRAPH_PROMPT as buildBrandSummaryParagraphPrompt,
} from './brandPrompts';

import { BrandDna } from '../types/brandDna';

/**
 * Builds an enriched system context block based on Brand DNA to inject into prompts
 */
export function buildBrandSystemContext(brand: BrandDna, moduleRole?: string): string {
  const personalityMap: Record<string, string> = {
    formality:
      brand.voice.personality.formality >= 4
        ? 'רשמי, מוקפד ומכובד'
        : brand.voice.personality.formality <= 2
        ? 'קליל, יומיומי וסחבקי'
        : 'מאוזן, נגיש ומקצועי',
    warmth:
      brand.voice.personality.warmth >= 4 ? 'חם, אמפתי, משפחתי ומקרב' : 'ענייני, ישיר ותכליתי',
    luxury:
      brand.voice.personality.luxury >= 4 ? 'יוקרתי, אקסקלוסיבי, פרימיום' : 'עממי, פשוט ונגיש לכל כיס',
    energy:
      brand.voice.personality.energy >= 4 ? 'אנרגטי, נלהב וסוחף' : 'שלו, מדוד ומרגיע',
  };

  const personasSummary = (brand.audience.personas || [])
    .map((p) => `- ${p.name}: כאב: "${p.mainPain}", תוצאה: "${p.dreamOutcome}"`)
    .join('\n');

  return `
=== [הוראות ליבת מותג - BRAND DNA SYSTEM] ===
מותג: ${brand.identity.companyName} (${brand.identity.organizationType})
סלוגן: ${brand.identity.slogan}
חזון: ${brand.identity.shortVision || brand.identity.companyVision}
בידול (UVP): ${brand.audience.mainUvp}
שפה: ${personalityMap.formality}, ${personalityMap.warmth}, ${personalityMap.energy}
מילות כוח: ${(brand.voice.powerWords || []).join(', ')}
${personasSummary ? `פרסונות:\n${personasSummary}` : ''}
${moduleRole ? `תפקיד: ${moduleRole}` : ''}
============================================
`.trim();
}

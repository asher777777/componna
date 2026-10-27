/**
 * ============================================================================
 * ⚠️ אזהרת שומר הסף (KOSUN26 GATE 3 - AI MONOPOLY) ⚠️
 * כל פרומפט וקריאת בינה מלאכותית בקובץ זה נשלחים אך ורק לחוזה של KOSAI הנמצא בתיקייה:
 * src/modules/KosAi/modelsAiService/kosTubeAiContract.ts
 * 
 * חוק המונופול קובע:
 * 1. אין לשלוח לג'מיני ישירות בשום אופן מרכיב KosTube!
 * 2. חל איסור מוחלט על שימוש ב-fetch מקומי לשרתי AI!
 * 3. כל העברת נתונים חייבת לעבור דרך kosTubeAiContract בלבד!
 * ============================================================================
 */

import {
  kosTubeAiContract,
  KosTubeAiMode,
  KosTubeAiGenerationInput,
  KosTubeAiGeneratedData,
} from '../../KosAi/modelsAiService';

export type { KosTubeAiMode, KosTubeAiGenerationInput, KosTubeAiGeneratedData };

export const kosTubePromptGateway = {
  /**
   * Safe execution proxy delegating directly to the centralized KOSAI AI Monopoly.
   */
  async generateVideoSeo(input: KosTubeAiGenerationInput) {
    return kosTubeAiContract.generateVideoSeoContent(input);
  },
  async rewriteContent(input: any) {
    return kosTubeAiContract.rewriteContent(input);
  },
  async fillMissingContent(input: any) {
    return kosTubeAiContract.fillMissingContent(input);
  },
};

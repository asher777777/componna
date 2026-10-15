/**
 * KOSAI AI Bridge - KosBranding Module
 * Connects Brand DNA prompts to the KOSAI modelsAiService central monopoly contract.
 * Guarantees model governance (gemini-3.8-flash-lite), zero direct external fetch calls, and token caps.
 */

import {
  BUILD_BRAND_SUMMARY_PARAGRAPH_PROMPT,
  BUILD_BRAND_DISCOVERY_PROMPT,
  BUILD_BRAND_REPHRASE_PROMPT,
  BUILD_STEP_ASSISTANCE_PROMPT,
  BUILD_CONTENT_STRATEGIES_PROMPT,
} from '../prompts/brandPrompts';
import { kosaiBrandContract } from '../../kosai-engine/modelsAiService/brandAiContract';
import { BrandDna } from '../types/brandDna';

export interface KosaiBrandDispatchOptions {
  apiKey?: string;
  tenantId?: string;
  skipCache?: boolean;
}

/**
 * מפיק פסקת תמצית מותג דחוסה של 250-300 מילים ("מועט המחזיק את המרובה") מתוך קולקציית ה-Brand DNA
 */
export async function dispatchBrandSummaryParagraphToKosai(
  brand: BrandDna,
  options?: KosaiBrandDispatchOptions
): Promise<{ summaryParagraph: string; wordCount: number }> {
  const prompt = BUILD_BRAND_SUMMARY_PARAGRAPH_PROMPT(brand);
  const result = await kosaiBrandContract.generateBrandSummaryParagraph(prompt, {
    skipCache: options?.skipCache,
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * מחלץ Brand DNA מלא מתוך תמלול ראיון
 */
export async function dispatchBrandDiscoveryToKosai(
  interviewNotes: string,
  options?: KosaiBrandDispatchOptions
): Promise<any> {
  const prompt = BUILD_BRAND_DISCOVERY_PROMPT(interviewNotes);
  const result = await kosaiBrandContract.generateBrandDnaFromInterview(prompt, {
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * משכתב טקסט לפי קול ושפת המותג
 */
export async function dispatchBrandRephraseToKosai(
  originalText: string,
  brand: BrandDna,
  customInstructions?: string,
  options?: KosaiBrandDispatchOptions
): Promise<string> {
  const { systemContext, userPrompt } = BUILD_BRAND_REPHRASE_PROMPT(originalText, brand, customInstructions);
  const result = await kosaiBrandContract.rephraseTextWithBrandVoice(userPrompt, {
    systemInstruction: systemContext,
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * מייצר הצעות סיוע לשלב בשאלון המיתוג המודרך
 */
export async function dispatchStepAssistanceToKosai(
  stepId: string,
  brand: BrandDna,
  userDraft?: string,
  options?: KosaiBrandDispatchOptions
): Promise<any> {
  const prompt = BUILD_STEP_ASSISTANCE_PROMPT(stepId, brand, userDraft);
  const result = await kosaiBrandContract.generateStepAssistance(prompt, {
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * מייצר אסטרטגיות תוכן (עמוד שירות ועמוד מכירה)
 */
export async function dispatchContentStrategiesToKosai(
  brand: BrandDna,
  options?: KosaiBrandDispatchOptions
): Promise<any[]> {
  const prompt = BUILD_CONTENT_STRATEGIES_PROMPT(brand);
  const result = await kosaiBrandContract.generateContentStrategies(prompt, {
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
  });
  return result.data;
}

/**
 * מייצר פריט ישות (פרסונה, מוצר דגל, פריטי אקו-סיסטם)
 */
export async function dispatchEntityItemToKosai(
  prompt: string,
  options?: KosaiBrandDispatchOptions & { responseMimeType?: 'application/json' | 'text/plain' }
): Promise<any> {
  const result = await kosaiBrandContract.generateEntityItem(prompt, {
    apiKey: options?.apiKey,
    tenantId: options?.tenantId,
    responseMimeType: options?.responseMimeType,
  });
  return result.data;
}

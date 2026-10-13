/**
 * KOSUN AM (קושאן מייל אוטומטי) - Kosai Email AI Copilot Service
 * 12-Layer Scaffolding Layer 5: Cloud Functions AI, Cost Tracking & Brand DNA Integration
 */

import { AiGenerationResult } from '../types';
import { KOSUN_AM_AI_MODELS, KOSUN_AM_MODULE_ID } from '../config';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { calculateGeminiCost, executeCloudAi } from '../../../core/ai';
import { EMAIL_COPILOT_SYSTEM_PROMPT } from '../prompts';

export class KosaiEmailAiService {
  private moduleId = KOSUN_AM_MODULE_ID;

  private getApiKey(): string {
    return getModuleGeminiKey(this.moduleId);
  }

  async generateMarketingContent(
    userPrompt: string,
    context?: Record<string, unknown>
  ): Promise<AiGenerationResult> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return this.generateSmartMock(userPrompt, context);
    }

    try {
      const result = await this.callGeminiApi(KOSUN_AM_AI_MODELS.PRIMARY, apiKey, userPrompt, context);
      if (result.success) {
        return result;
      }
    } catch (err) {
      console.warn('[Kosun AM] AI Cloud execution error, falling back to smart mock:', err);
    }

    return this.generateSmartMock(userPrompt, context);
  }

  private async callGeminiApi(
    model: string,
    apiKey: string,
    userPrompt: string,
    context?: Record<string, unknown>
  ): Promise<AiGenerationResult> {
    const aiRes = await executeCloudAi({
      prompt: `מטרת הקמפיין: ${userPrompt}\nהקשר נוסף: ${JSON.stringify(context || {})}`,
      systemInstruction: EMAIL_COPILOT_SYSTEM_PROMPT,
      model,
      responseMimeType: 'application/json',
      temperature: 0.7,
      apiKey,
    });

    if (!aiRes.success || !aiRes.data) {
      throw new Error(aiRes.error || 'Empty Gemini response content');
    }

    const parsed = (typeof aiRes.data === 'string' ? JSON.parse(aiRes.data) : aiRes.data) as {
      subjectSuggestions?: string[];
      bodyCopy?: string;
      preheader?: string;
    };

    const costReport = aiRes.costReport || calculateGeminiCost({
      model,
      promptTokens: 150,
      candidatesTokens: 200,
    });

    return {
      success: true,
      subjectSuggestions: parsed.subjectSuggestions || [
        'הזדמנות מיוחדת מקושאן שלא כדאי לפספס',
        'השותף העסקי שלך לוקח אותך צעד אחד קדימה',
      ],
      bodyCopy: parsed.bodyCopy || 'תוכן שיווקי ממוקד שנכתב על ידי קוסאי בשפת המותג.',
      preheader: parsed.preheader || 'קושאן דואג למסר שלך',
      usageReport: {
        promptTokens: costReport.promptTokens || 150,
        completionTokens: costReport.candidatesTokens || 200,
        totalCostUsd: costReport.estimatedCostUSD,
        totalCostIls: costReport.estimatedCostILS,
      },
    };
  }

  private generateSmartMock(
    userPrompt: string,
    _context?: Record<string, unknown>
  ): AiGenerationResult {
    return {
      success: true,
      subjectSuggestions: [
        `קושאן מציג: ${userPrompt || 'הבשורה השיווקית הבאה שלך'}`,
        'הפתעה מיוחדת מחכה לך בפנים - אל תפספס',
        'השותף האישי שלך דואג להצלחה של העסק שלך',
      ],
      bodyCopy: `שלום רב,\n\nקושאן שמח לעדכן אותך על מהלך שיווקי חדש ומבטיח: ${userPrompt || 'השקת שירותים מתקדמים'}.\n\nהצוות שלנו פועל מסביב לשעון כדי להבטיח את התוצאות הטובות ביותר עבורך.\n\nבברכה,\nצוות קושאן`,
      preheader: 'קושאן לוקח אחריות על הדיוור שלך',
      usageReport: {
        promptTokens: 0,
        completionTokens: 0,
        totalCostUsd: 0,
        totalCostIls: 0,
      },
    };
  }
}

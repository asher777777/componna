/**
 * KOSUN AM (קושאן מייל אוטומטי) - Kosai Email AI Copilot Service
 * 12-Layer Scaffolding Layer 5: Gemini Flash Cascade, Cost Tracking & Brand DNA Integration
 */

import { AiGenerationResult } from '../types';
import { KOSUN_AM_AI_MODELS, KOSUN_AM_MODULE_ID } from '../config';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import { calculateGeminiCost } from '../../../core/ai/geminiCostTracker';
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

    // Fallback Cascade: Primary -> Secondary -> Tertiary -> Local Mock
    const modelsToTry = [
      KOSUN_AM_AI_MODELS.PRIMARY,
      KOSUN_AM_AI_MODELS.SECONDARY,
      KOSUN_AM_AI_MODELS.TERTIARY,
    ];

    for (const model of modelsToTry) {
      try {
        const result = await this.callGeminiApi(model, apiKey, userPrompt, context);
        if (result.success) {
          return result;
        }
      } catch (err) {
        console.warn(`[Kosun AM] AI model ${model} failed, trying next fallback:`, err);
      }
    }

    return this.generateSmartMock(userPrompt, context);
  }

  private async callGeminiApi(
    model: string,
    apiKey: string,
    userPrompt: string,
    context?: Record<string, unknown>
  ): Promise<AiGenerationResult> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const promptPayload = {
      systemInstruction: {
        parts: [{ text: EMAIL_COPILOT_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `מטרת הקמפיין: ${userPrompt}\nהקשר נוסף: ${JSON.stringify(context || {})}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptPayload),
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
      };
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty Gemini response content');
    }

    const parsed = JSON.parse(text) as {
      subjectSuggestions?: string[];
      bodyCopy?: string;
      preheader?: string;
    };

    const promptTokens = data.usageMetadata?.promptTokenCount || 150;
    const completionTokens = data.usageMetadata?.candidatesTokenCount || 200;

    const costReport = calculateGeminiCost({
      model,
      promptTokens,
      candidatesTokens: completionTokens,
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
        promptTokens,
        completionTokens,
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

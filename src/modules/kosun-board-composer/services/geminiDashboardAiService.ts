/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 5: Gemini AI Generation Service
 *
 * Implements Gemini integration following skills/gemini-web-grounding & modular-firebase-components standards.
 * Uses system API keys configured in SystemConnectionContext (Rule 6).
 */

import {
  GenerateDashboardAiRequest,
  GeneratedCustomDashboard,
  DashboardWidget,
  DynamicModuleCapability,
} from '../types';
import { GEMINI_DASHBOARD_SYSTEM_INSTRUCTION, buildDashboardPrompt } from '../prompts';

export class GeminiDashboardAiService {
  /**
   * Generates a tailor-made Bento Grid dashboard using Google Gemini.
   */
  static async generateDashboard(
    apiKey: string,
    request: GenerateDashboardAiRequest
  ): Promise<GeneratedCustomDashboard> {
    // Default to the 2026 authorized Gemini Flash model: gemini-3.8-flash
    const primaryModel = request.model && !request.model.includes('2.5') ? request.model : 'gemini-3.8-flash';
    const modelsToTry = [primaryModel, 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.8-flash-lite'];
    const uniqueModels = Array.from(new Set(modelsToTry));
    const cleanKey = apiKey?.trim();

    if (!cleanKey) {
      console.warn('[GeminiDashboardAiService] No Gemini API key provided, generating high-fidelity deterministic layout');
      return this.generateDeterministicFallback(request);
    }

    const promptText = buildDashboardPrompt(
      request.audience,
      request.selectedModules,
      request.tenantId,
      request.customPrompt
    );

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      systemInstruction: {
        parts: [{ text: GEMINI_DASHBOARD_SYSTEM_INSTRUCTION }],
      },
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    };

    // Attempt models in cascade order
    for (const modelToAttempt of uniqueModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToAttempt}:generateContent?key=${cleanKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          const rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawOutput) {
            const parsedJson = this.parseJsonSafely(rawOutput);
            console.info(`[GeminiDashboardAiService] Successfully generated via ${modelToAttempt}`);
            return this.formatGeneratedDashboard(parsedJson, request);
          }
        } else {
          console.warn(`[GeminiDashboardAiService] Model ${modelToAttempt} failed (${response.status}), trying next fallback...`);
        }
      } catch (e) {
        console.warn(`[GeminiDashboardAiService] Network error with ${modelToAttempt}:`, e);
      }
    }

    // Graceful offline fallback with clean Hebrew subtitle
    console.warn('[GeminiDashboardAiService] All remote Gemini models unavailable, using intelligent local engine');
    return this.generateDeterministicFallback(request);
  }

  private static parseJsonSafely(rawText: string): any {
    try {
      // Remove possible markdown backticks
      let clean = rawText.trim();
      if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      return JSON.parse(clean);
    } catch (e) {
      console.warn('[GeminiDashboardAiService] JSON parse failed on text, extracting object:', rawText);
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('לא ניתן היה לפענח את מבנה ה-JSON מתשובת המודל');
    }
  }

  private static formatGeneratedDashboard(
    raw: any,
    request: GenerateDashboardAiRequest
  ): GeneratedCustomDashboard {
    const dashboardId = `dash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    return {
      id: dashboardId,
      title: raw.title || `קושאן בורד - ${request.audience.name}`,
      subtitle: raw.subtitle || `לוח בקרה מותאם אישית שתוכנן על ידי קושאן AI`,
      targetAudienceId: request.audience.id,
      targetAudienceName: request.audience.name,
      tenantId: request.tenantId,
      selectedModuleIds: request.selectedModules.map((m) => m.moduleId),
      aiAdvisor: {
        greeting: raw.aiAdvisor?.greeting || `שלום, קושאן כאן לשירותך עם לוח הבקרה הייעודי שלך`,
        executiveSummary: raw.aiAdvisor?.executiveSummary || `ריכזנו את כל הכלים החיוניים עבור ${request.audience.name} במבנה בנטו גריד ממוקד תוצאות.`,
        recommendedActions: Array.isArray(raw.aiAdvisor?.recommendedActions)
          ? raw.aiAdvisor.recommendedActions
          : ['בדוק את הפניות והעסקאות החדשות', 'הפעל קמפיין שיווקי ממוקד', 'צפה במדדי הפעילות'],
        audienceStrategy: raw.aiAdvisor?.audienceStrategy || request.audience.description,
      },
      widgets: Array.isArray(raw.widgets) && raw.widgets.length > 0
        ? raw.widgets.map((w: any, index: number) => ({
            id: w.id || `w_${index}_${Math.random().toString(36).substring(2, 5)}`,
            type: w.type || 'kpi_metric',
            title: w.title || 'מדד ביצועים',
            subtitle: w.subtitle,
            size: w.size || 'sm',
            sourceModuleId: w.sourceModuleId,
            iconName: w.iconName || 'Activity',
            config: w.config || {},
          }))
        : this.generateDefaultWidgets(request.selectedModules),
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Deterministic high-quality fallback adhering strictly to Bento Grid 2026.
   */
  static generateDeterministicFallback(
    request: GenerateDashboardAiRequest
  ): GeneratedCustomDashboard {
    const dashboardId = `dash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    return {
      id: dashboardId,
      title: `קושאן בורד - מרכז השליטה ל-${request.audience.name}`,
      subtitle: `מערכת מותאמת אישית המשלבת ${request.selectedModules.length} רכיבים לפעילות עסקית רציפה`,
      targetAudienceId: request.audience.id,
      targetAudienceName: request.audience.name,
      tenantId: request.tenantId,
      selectedModuleIds: request.selectedModules.map((m) => m.moduleId),
      aiAdvisor: {
        greeting: `שלום, קושאן שמחה ללוות אותך במסע העסקי שלך ב-${request.audience.name}`,
        executiveSummary: `המערכת חיברה עבורך את הרכיבים הנבחרים ומציגה תמונת מצב חיה של הנתונים והפעולות העסקיות שלך.`,
        recommendedActions: [
          `השלם הגדרות בסיסיות ברכיבי המערכת`,
          `בחן את נתוני הפעילות העדכניים בטבלאות המודולריות`,
          `הפעל פעולות מהירות להאצת התוצאות העסקיות`,
        ],
        audienceStrategy: request.audience.description,
      },
      widgets: this.generateDefaultWidgets(request.selectedModules),
      createdAt: now,
      updatedAt: now,
    };
  }

  private static generateDefaultWidgets(modules: DynamicModuleCapability[]): DashboardWidget[] {
    const widgets: DashboardWidget[] = [];

    // 1. Collect top KPI from each selected module
    modules.forEach((mod, idx) => {
      const topKpi = mod.kpis[0];
      if (topKpi) {
        widgets.push({
          id: `widget_kpi_${mod.moduleId}_${idx}`,
          type: 'kpi_metric',
          title: topKpi.label,
          subtitle: topKpi.description,
          size: 'sm',
          sourceModuleId: mod.moduleId,
          iconName: topKpi.iconName || 'TrendingUp',
          config: {
            collectionName: topKpi.collectionName,
            calculation: topKpi.calculationType,
            field: topKpi.fieldToSum,
            statPrefix: topKpi.prefix,
            statSuffix: topKpi.suffix,
            accentColor: idx % 2 === 0 ? 'indigo' : 'emerald',
          },
        });
      }
    });

    // 2. Add Quick Actions widget aggregating critical actions across selected modules
    const allActions = modules.flatMap((m) => m.actions);
    if (allActions.length > 0) {
      widgets.push({
        id: 'widget_quick_actions_primary',
        type: 'quick_actions',
        title: 'פעולות מהירות מרכזיות',
        subtitle: 'הפעלת משימות דחופות בלחיצה אחת',
        size: 'lg',
        iconName: 'Zap',
        config: {
          actions: allActions.slice(0, 6),
        },
      });
    }

    // 3. Add Live Data Streams for modules with primary collections
    modules.slice(0, 2).forEach((mod, idx) => {
      widgets.push({
        id: `widget_stream_${mod.moduleId}_${idx}`,
        type: 'data_stream',
        title: `תנועות אחרונות: ${mod.moduleName}`,
        subtitle: `סנכרון חי מקולקציית ${mod.primaryCollections[0]}`,
        size: 'md',
        sourceModuleId: mod.moduleId,
        iconName: 'Activity',
        config: {
          collectionName: mod.primaryCollections[0],
          statSuffix: 'רשומות',
        },
      });
    });

    return widgets;
  }
}

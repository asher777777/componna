/**
 * KosProjects - User-Triggered AI Engine API
 * Uses 'ai-assistant' capability (KosAi monopoly) with fallback to executeCloudAi.
 * Zero automatic AI calls on mount. Zero localStorage API key access.
 */

import { executeCloudAi } from '../../../core/ai/cloudAiClient';
import { getModuleGeminiKey } from '../../../core/connection/tenantApiKeys';
import type { AiTextAssistantContract } from '../../../core/contracts';
import {
  AiRiskReport,
  AiWorkplanSuggestion,
  ProjectRecord,
  ProjectTask,
} from '../types';
import { DEFAULT_PHASES } from '../config';

const KOS_PROJECTS_AI_MODEL = 'gemini-3.8-flash-lite';

function resolveProjectGeminiKey(): string | undefined {
  const key =
    getModuleGeminiKey('kosprojects') ||
    getModuleGeminiKey('kosai-engine') ||
    getModuleGeminiKey('KosWebAi') ||
    '';
  return key.trim() || undefined;
}

const WORKPLAN_SYSTEM_PROMPT =
  'אתה מנהל פרויקטים ומפיק בכיר. החזר אך ורק JSON תקין בעברית מקצועית ללא טקסט נוסף או Markdown. בנה תוכנית עבודה מעשית ומסר שיווקי חד.';

const RISK_SYSTEM_PROMPT =
  'אתה מנתח סיכוני פרויקטים (PMO). החזר אך ורק JSON תקין בעברית תמציתית ומקצועית עם זיהוי צווארי בקבוק, סיכונים והמלצות פעולה.';

const VENDOR_BRIEF_SYSTEM_PROMPT =
  'אתה מפיק פרויקטים. כתוב הודעת בריף קצרה, ברורה ומקצועית בעברית לספק, כולל מועדים ודרישות מרכזיות, ללא אימוג\'ים.';

function parseJsonSafely<T>(raw?: string | null): T | null {
  if (!raw) return null;
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

async function runStructuredJson<T>(
  prompt: string,
  systemPrompt: string,
  aiCapability?: AiTextAssistantContract | null
): Promise<{ data?: T; error?: string }> {
  // 1. Primary path: Host 'ai-assistant' capability
  if (aiCapability && typeof aiCapability.generateJson === 'function') {
    try {
      const res = await aiCapability.generateJson<T>({ prompt, systemPrompt });
      if (res?.data && !res.error) {
        return { data: res.data };
      }
    } catch (err) {
      console.warn('[KosProjects AI] ai-assistant.generateJson fallback:', err);
    }
  }

  // 2. Fallback path: Core Cloud AI client (pinned to gemini-3.8-flash-lite + master/tenant key)
  const cloudRes = await executeCloudAi<T>({
    prompt,
    systemInstruction: systemPrompt,
    model: KOS_PROJECTS_AI_MODEL,
    apiKey: resolveProjectGeminiKey(),
    responseMimeType: 'application/json',
    temperature: 0.4,
    category: 'content',
  });

  if (cloudRes.success) {
    const parsed = cloudRes.data ?? parseJsonSafely<T>(cloudRes.text);
    if (parsed) return { data: parsed };
  }

  return { error: cloudRes.error || 'לא ניתן היה להפיק תשובה מובנית משירות ה-AI.' };
}

async function runTextPrompt(
  prompt: string,
  systemPrompt: string,
  aiCapability?: AiTextAssistantContract | null
): Promise<{ text?: string; error?: string }> {
  // 1. Primary path: Host 'ai-assistant' capability
  if (aiCapability && typeof aiCapability.generateReply === 'function') {
    try {
      const res = await aiCapability.generateReply({
        systemPrompt,
        userMessage: prompt,
      });
      if (res?.text && !res.error) {
        return { text: res.text.trim() };
      }
    } catch (err) {
      console.warn('[KosProjects AI] ai-assistant.generateReply fallback:', err);
    }
  }

  // 2. Fallback path: Core Cloud AI client (pinned to gemini-3.8-flash-lite + master/tenant key)
  const cloudRes = await executeCloudAi({
    prompt,
    systemInstruction: systemPrompt,
    model: KOS_PROJECTS_AI_MODEL,
    apiKey: resolveProjectGeminiKey(),
    responseMimeType: 'text/plain',
    temperature: 0.5,
    category: 'content',
  });

  if (cloudRes.success && cloudRes.text) {
    return { text: cloudRes.text.trim() };
  }

  return { error: cloudRes.error || 'לא ניתן היה להפיק ניסוח משירות ה-AI.' };
}

/**
 * 1. Generate a full Gantt workplan + marketing landing/form structure from a brief
 */
export async function generateWorkplanFromBrief(
  brief: string,
  projectTitle: string,
  startDate: string,
  aiCapability?: AiTextAssistantContract | null
): Promise<{ suggestion?: AiWorkplanSuggestion; error?: string }> {
  const prompt = `פרויקט: "${projectTitle}"
תאריך התחלה: ${startDate}
בריף ותיאור: ${brief}

החזר JSON במבנה המדויק:
{
  "summary": "תקציר קצר של תוכנית העבודה",
  "marketing": {
    "headline": "כותרת ראשית לדף הנחיתה",
    "subheadline": "כותרת משנה מניעה לפעולה",
    "ctaText": "טקסט כפתור הרשמה",
    "formFields": [
      { "label": "שם מלא", "type": "text", "required": true, "map_to": "kosun_crm_name" },
      { "label": "טלפון", "type": "tel", "required": true, "map_to": "kosun_crm_phone" },
      { "label": "דוא\\"ל", "type": "email", "required": false, "map_to": "kosun_crm_email" }
    ]
  },
  "tasks": [
    {
      "phase": "אחד מהשלבים: ${DEFAULT_PHASES.join(' / ')}",
      "title": "שם המשימה",
      "description": "פירוט קצר",
      "offsetDays": 0,
      "durationDays": 5,
      "ownerRole": "תפקיד האחראי",
      "supplierRole": "תפקיד ספק נדרש אם יש",
      "isMilestone": false,
      "estimatedCost": 0
    }
  ]
}
צור 6 עד 10 משימות ריאליות כולל לפחות אבן דרך אחת.`;

  const res = await runStructuredJson<AiWorkplanSuggestion>(prompt, WORKPLAN_SYSTEM_PROMPT, aiCapability);
  if (!res.data) {
    return { error: res.error };
  }

  const normalized: AiWorkplanSuggestion = {
    summary: res.data.summary || '',
    marketing: {
      headline: res.data.marketing?.headline || projectTitle,
      subheadline: res.data.marketing?.subheadline || brief.slice(0, 140),
      ctaText: res.data.marketing?.ctaText || 'הרשמה לפרויקט',
      formFields:
        Array.isArray(res.data.marketing?.formFields) && res.data.marketing.formFields.length > 0
          ? res.data.marketing.formFields
          : [
              { label: 'שם מלא', type: 'text', required: true, map_to: 'kosun_crm_name' },
              { label: 'טלפון', type: 'tel', required: true, map_to: 'kosun_crm_phone' },
              { label: 'דוא"ל', type: 'email', required: false, map_to: 'kosun_crm_email' },
            ],
    },
    tasks: Array.isArray(res.data.tasks) ? res.data.tasks : [],
  };

  return { suggestion: normalized };
}

/**
 * 2. Analyze Gantt schedule, dependencies, overdue items, and bottlenecks
 */
export async function analyzeGanttRisks(
  project: ProjectRecord,
  tasks: ProjectTask[],
  aiCapability?: AiTextAssistantContract | null
): Promise<{ report?: AiRiskReport; error?: string }> {
  const today = new Date().toISOString().split('T')[0];
  const compactTasks = tasks.slice(0, 35).map((t) => ({
    id: t.id,
    phase: t.phase,
    title: t.title,
    start: t.startDate,
    end: t.endDate,
    progress: t.progress,
    status: t.status,
    owner: t.ownerName || t.ownerRole || 'לא הוקצה',
    suppliers: (t.suppliers || []).map((s) => s.name),
    milestone: Boolean(t.isMilestone),
  }));

  const prompt = `תאריך היום: ${today}
פרויקט: "${project.title}" (${project.startDate} עד ${project.targetEndDate}), סטטוס: ${project.status}
משימות (${tasks.length}):
${JSON.stringify(compactTasks)}

נתח סיכונים, עיכובים, משימות ללא אחראי ועומסי לוחות זמנים. החזר JSON במבנה:
{
  "overallHealth": "healthy" | "attention" | "critical",
  "summary": "סיכום מצב קצר בעברית",
  "risks": [
    {
      "taskId": "מזהה משימה אם רלוונטי",
      "taskTitle": "שם המשימה",
      "severity": "high" | "medium" | "low",
      "issue": "תיאור הסיכון או העיכוב",
      "recommendation": "המלצת פעולה ברורה"
    }
  ],
  "nextActions": ["פעולה מיידית 1", "פעולה מיידית 2", "פעולה מיידית 3"]
}`;

  const res = await runStructuredJson<Omit<AiRiskReport, 'generatedAt'>>(prompt, RISK_SYSTEM_PROMPT, aiCapability);
  if (!res.data) {
    return { error: res.error };
  }

  return {
    report: {
      overallHealth: res.data.overallHealth || 'attention',
      summary: res.data.summary || 'הניתוח הושלם.',
      risks: Array.isArray(res.data.risks) ? res.data.risks : [],
      nextActions: Array.isArray(res.data.nextActions) ? res.data.nextActions : [],
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * 3. Draft a concise professional Hebrew brief/message for a project supplier
 */
export async function draftVendorBrief(
  project: ProjectRecord,
  task: ProjectTask,
  supplierName: string,
  aiCapability?: AiTextAssistantContract | null
): Promise<{ briefText?: string; error?: string }> {
  const prompt = `כתוב הודעת בריף ותיאום קצרה (עד 90 מילים) בעברית עבור הספק "${supplierName}".
פרויקט: ${project.title}
משימה: ${task.title}
שלב: ${task.phase}
תיאור: ${task.description || 'אין פירוט נוסף'}
תאריכי ביצוע: ${task.startDate} עד ${task.endDate}
תקציב משוער: ${task.estimatedCost ? `${task.estimatedCost} ש"ח` : 'יתואם בהמשך'}
איש קשר אחראי: ${task.ownerName || 'מנהל הפרויקט'}

כלול פתיחה עניינית, דרישות, מועד יעד ובקשה לאישור זמינות.`;

  const res = await runTextPrompt(prompt, VENDOR_BRIEF_SYSTEM_PROMPT, aiCapability);
  if (!res.text) {
    return { error: res.error };
  }
  return { briefText: res.text };
}

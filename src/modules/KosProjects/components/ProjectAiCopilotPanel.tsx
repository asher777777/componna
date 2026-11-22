import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Server,
  ShieldAlert,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { BUILT_IN_BLUEPRINTS } from '../config';
import type {
  AiRiskReport,
  AiWorkplanSuggestion,
  ProjectRecord,
  ProjectTask,
} from '../types';

export interface ProjectAiCopilotPanelProps {
  project: ProjectRecord;
  tasks: ProjectTask[];
  aiLoading: boolean;
  aiWorkplanSuggestion: AiWorkplanSuggestion | null;
  aiRiskReport: AiRiskReport | null;
  onRunAiWorkplan: (
    brief: string,
    projectTitle?: string,
    startDate?: string
  ) => Promise<{ suggestion?: AiWorkplanSuggestion; error?: string }>;
  onApplyAiWorkplan: (
    suggestion: AiWorkplanSuggestion,
    projectId?: string
  ) => Promise<ProjectTask[]>;
  onClearAiWorkplan: () => void;
  onRunAiRiskAnalysis: (
    projectId?: string
  ) => Promise<{ report?: AiRiskReport; error?: string }>;
}

const SEVERITY_STYLES: Record<'high' | 'medium' | 'low', string> = {
  high: 'border-rose-200 bg-rose-50 text-rose-800',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  low: 'border-sky-200 bg-sky-50 text-sky-800',
};

const SEVERITY_LABELS: Record<'high' | 'medium' | 'low', string> = {
  high: 'סיכון גבוה',
  medium: 'סיכון בינוני',
  low: 'תשומת לב',
};

const HEALTH_LABELS: Record<AiRiskReport['overallHealth'], { label: string; cls: string }> = {
  healthy: { label: 'לוח הזמנים תקין', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  attention: { label: 'נדרשת תשומת לב', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  critical: { label: 'עיכוב קריטי בגאנט', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const ProjectAiCopilotPanel: React.FC<ProjectAiCopilotPanelProps> = ({
  project,
  tasks,
  aiLoading,
  aiWorkplanSuggestion,
  aiRiskReport,
  onRunAiWorkplan,
  onApplyAiWorkplan,
  onClearAiWorkplan,
  onRunAiRiskAnalysis,
}) => {
  const [brief, setBrief] = useState(project.description || '');
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const matchedBlueprint = useMemo(() => {
    const bpTag = (project.tags || []).find((t) => t.startsWith('bp:'));
    if (bpTag) {
      const id = bpTag.slice(3);
      return BUILT_IN_BLUEPRINTS.find((b) => b.id === id) || null;
    }
    return BUILT_IN_BLUEPRINTS.find((b) => (project.tags || []).includes(b.category)) || null;
  }, [project.tags]);

  const handleQuickTemplatePrompt = async (promptText: string) => {
    const fullBrief = `${promptText}\nהקשר הפרויקט: ${project.title} — ${project.description || ''}`;
    setBrief(fullBrief);
    setFeedback(null);
    const res = await onRunAiWorkplan(fullBrief, project.title, project.startDate);
    if (res.error) {
      setFeedback({ type: 'error', message: res.error });
    }
  };

  const handleGenerateWorkplan = async () => {
    if (!brief.trim()) {
      setFeedback({ type: 'error', message: 'אנא הזן תיאור או בריף של הפרויקט לפני ההפקה.' });
      return;
    }
    setFeedback(null);
    const res = await onRunAiWorkplan(brief.trim(), project.title, project.startDate);
    if (res.error) {
      setFeedback({ type: 'error', message: res.error });
    }
  };

  const handleApplySuggestion = async () => {
    if (!aiWorkplanSuggestion) return;
    setApplying(true);
    setFeedback(null);
    try {
      const created = await onApplyAiWorkplan(aiWorkplanSuggestion, project.id);
      setFeedback({
        type: 'success',
        message: `הוחלו בהצלחה ${created.length} משימות גאנט ותוכן שיווקי מעודכן לפרויקט.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'שגיאה בהחלת תוכנית העבודה.',
      });
    } finally {
      setApplying(false);
    }
  };

  const handleAnalyzeRisks = async () => {
    setFeedback(null);
    const res = await onRunAiRiskAnalysis(project.id);
    if (res.error) {
      setFeedback({ type: 'error', message: res.error });
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {matchedBlueprint && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-bold text-indigo-950">
                ליווי שרת ו-AI לפי תבנית: {matchedBlueprint.name}
              </div>
              <div className="text-xs text-slate-600">
                בחר פעולת AI ממוקדת להפעלה מיידית על הפרויקט, או עקוב אחר אוטומציות השרת המלוות
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm">
              {matchedBlueprint.category}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {matchedBlueprint.aiAssistantPrompts && matchedBlueprint.aiAssistantPrompts.length > 0 && (
              <div className="space-y-2 rounded-xl bg-white p-3.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-800">
                  <Sparkles className="h-4 w-4" />
                  <span>פעולות AI מומלצות לתבנית זו</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchedBlueprint.aiAssistantPrompts.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleQuickTemplatePrompt(act.promptTemplate)}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 transition hover:bg-violet-100 disabled:opacity-50"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {matchedBlueprint.serverActions && matchedBlueprint.serverActions.length > 0 && (
              <div className="space-y-1.5 rounded-xl bg-white p-3.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Server className="h-4 w-4" />
                  <span>בקשות שרת ואוטומציות מלוות</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {matchedBlueprint.serverActions.map((sa, idx) => (
                    <li key={idx}>• {sa}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* AI Workplan & Marketing Generator */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                מחולל תוכנית עבודה ודף נחיתה (AI)
              </h3>
              <p className="text-xs text-slate-500">
                הדבק בריף או מטרת פרויקט — הסוכן יפצל אותו אוטומטית למסלול שיווקי ולגאנט תפעולי
              </p>
            </div>
          </div>

          <textarea
            rows={5}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="לדוגמה: הפקת כנס לקוחות שנתי ל-200 משתתפים בעוד חודשיים. נדרש דף נחיתה להרשמה, קייטרינג, צלם, הגברה, ומעקב תזכורות..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-800 focus:border-violet-400 focus:bg-white focus:outline-none"
          />

          <button
            type="button"
            disabled={aiLoading}
            onClick={handleGenerateWorkplan}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>הפק תוכנית עבודה וקופי שיווקי</span>
          </button>

          {aiWorkplanSuggestion && (
            <div className="mt-4 space-y-4 rounded-xl border border-violet-200 bg-violet-50/40 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-violet-950">הצעת הסוכן מוכנה להחלה</h4>
                <button
                  type="button"
                  onClick={onClearAiWorkplan}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  נקה
                </button>
              </div>

              <div className="rounded-lg bg-white p-3 text-xs shadow-sm">
                <div className="font-bold text-indigo-700">צד שיווקי מוצע:</div>
                <div className="mt-1 font-semibold text-slate-900">
                  {aiWorkplanSuggestion.marketing.headline}
                </div>
                <div className="mt-0.5 text-slate-600">
                  {aiWorkplanSuggestion.marketing.subheadline}
                </div>
                <div className="mt-1.5 inline-block rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                  כפתור CTA: {aiWorkplanSuggestion.marketing.ctaText}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-800">
                  משימות גאנט מוצעות ({aiWorkplanSuggestion.tasks.length}):
                </div>
                <div className="max-h-56 space-y-1.5 overflow-y-auto">
                  {aiWorkplanSuggestion.tasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{t.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {t.phase} | אחראי: {t.ownerRole}
                          {t.supplierRole ? ` | ספק: ${t.supplierRole}` : ''}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {t.durationDays} ימים
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={applying}
                onClick={handleApplySuggestion}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {applying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>החל את התוכנית על הפרויקט</span>
              </button>
            </div>
          )}
        </div>

        {/* AI Gantt Risk & Bottleneck Radar */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                מכ"ם סיכונים וצווארי בקבוק בגאנט
              </h3>
              <p className="text-xs text-slate-500">
                סריקה יזומה של {tasks.length} המשימות בפרויקט לאיתור איחורים, עומסים ותלויות חסומות
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={aiLoading || tasks.length === 0}
            onClick={handleAnalyzeRisks}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
            <span>נתח סיכונים בגאנט כעת</span>
          </button>

          {tasks.length === 0 && (
            <p className="text-xs text-slate-500">
              יש להוסיף משימות גאנט לפרויקט לפני הרצת ניתוח הסיכונים.
            </p>
          )}

          {aiRiskReport && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    HEALTH_LABELS[aiRiskReport.overallHealth].cls
                  }`}
                >
                  {HEALTH_LABELS[aiRiskReport.overallHealth].label}
                </span>
                <span className="text-[11px] text-slate-400">
                  עודכן: {new Date(aiRiskReport.generatedAt).toLocaleTimeString('he-IL')}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-700">{aiRiskReport.summary}</p>

              {aiRiskReport.risks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">ממצאים וסיכונים שזוהו:</div>
                  {aiRiskReport.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3 text-xs ${SEVERITY_STYLES[risk.severity]}`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{risk.taskTitle || 'סיכון כללי בפרויקט'}</span>
                        <span className="text-[10px]">{SEVERITY_LABELS[risk.severity]}</span>
                      </div>
                      <p className="mt-1">{risk.issue}</p>
                      <p className="mt-1 font-semibold">המלצה: {risk.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {aiRiskReport.nextActions.length > 0 && (
                <div className="rounded-xl bg-white p-3 text-xs shadow-sm">
                  <div className="font-bold text-slate-800">צעדים מומלצים להמשך:</div>
                  <ul className="mt-1.5 list-disc space-y-1 pr-4 text-slate-600">
                    {aiRiskReport.nextActions.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

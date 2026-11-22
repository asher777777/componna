import React, { useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  FolderPlus,
  Layers,
  Loader2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import type { CrmContactSummary } from '../../../core/contracts';
import type {
  AiWorkplanSuggestion,
  ProjectBlueprint,
  ProjectRecord,
  ProjectTaskDraft,
} from '../types';
import { parseProjectTasksFromFile } from '../services/projectImportService';

export interface ProjectUploaderModalProps {
  isOpen: boolean;
  blueprints: ProjectBlueprint[];
  crmContacts: CrmContactSummary[];
  aiLoading: boolean;
  onClose: () => void;
  onCreateProject: (data: Partial<ProjectRecord> & { title: string }) => Promise<ProjectRecord>;
  onBatchCreateTasks: (tasks: ProjectTaskDraft[], projectId?: string) => Promise<unknown>;
  onCloneBlueprint: (
    blueprintId: string,
    overrides?: { title?: string; clientName?: string; startDate?: string; budget?: number }
  ) => Promise<ProjectRecord | null>;
  onRunAiWorkplan: (
    brief: string,
    projectTitle?: string,
    startDate?: string
  ) => Promise<{ suggestion?: AiWorkplanSuggestion; error?: string }>;
  onApplyAiWorkplan: (suggestion: AiWorkplanSuggestion, projectId?: string) => Promise<unknown>;
}

type UploadMode = 'guided' | 'excel' | 'ai';

function getContactName(c: CrmContactSummary): string {
  return (c.kosun_crm_name || c.name || c.conta_name || '').trim() || 'איש קשר ללא שם';
}

export const ProjectUploaderModal: React.FC<ProjectUploaderModalProps> = ({
  isOpen,
  blueprints,
  crmContacts,
  aiLoading,
  onClose,
  onCreateProject,
  onBatchCreateTasks,
  onCloneBlueprint,
  onRunAiWorkplan,
  onApplyAiWorkplan,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [mode, setMode] = useState<UploadMode>('guided');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContactId, setClientContactId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [targetEndDate, setTargetEndDate] = useState(defaultEnd);
  const [budget, setBudget] = useState('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');

  // Excel mode state
  const [parsedTasks, setParsedTasks] = useState<ProjectTaskDraft[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [parsingFile, setParsingFile] = useState(false);

  // AI mode state
  const [aiBrief, setAiBrief] = useState('');
  const [aiPreview, setAiPreview] = useState<AiWorkplanSuggestion | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCrmClient = (contactId: string) => {
    setClientContactId(contactId);
    const found = crmContacts.find((c) => c.id === contactId);
    if (found) setClientName(getContactName(found));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingFile(true);
    setError(null);
    try {
      const res = await parseProjectTasksFromFile(file);
      setParsedTasks(res.tasks);
      setImportWarnings(res.warnings);
      if (!title.trim()) {
        setTitle(file.name.replace(/\.(xlsx|xls|csv)$/i, ''));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בקריאת הקובץ.');
    } finally {
      setParsingFile(false);
    }
  };

  const handleGenerateAiPreview = async () => {
    if (!aiBrief.trim()) {
      setError('אנא הזן תיאור פרויקט עבור סוכן ה-AI.');
      return;
    }
    setError(null);
    const res = await onRunAiWorkplan(aiBrief.trim(), title.trim() || 'פרויקט חדש', startDate);
    if (res.error) {
      setError(res.error);
    } else if (res.suggestion) {
      setAiPreview(res.suggestion);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('יש להזין שם לפרויקט.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const parsedBudget = budget.trim() ? Number(budget) : undefined;

      if (mode === 'guided' && selectedBlueprintId) {
        await onCloneBlueprint(selectedBlueprintId, {
          title: title.trim(),
          clientName: clientName.trim() || 'לקוח כללי',
          startDate,
          budget: parsedBudget,
        });
      } else {
        const created = await onCreateProject({
          title: title.trim(),
          description: (mode === 'ai' ? aiBrief : description).trim(),
          clientName: clientName.trim() || 'לקוח כללי',
          clientContactId: clientContactId || undefined,
          startDate,
          targetEndDate,
          budget: parsedBudget,
          status: 'planning',
        });

        if (mode === 'excel' && parsedTasks.length > 0) {
          await onBatchCreateTasks(parsedTasks, created.id);
        } else if (mode === 'ai' && aiPreview) {
          await onApplyAiWorkplan(aiPreview, created.id);
        }
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהקמת הפרויקט.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <FolderPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">הקמת פרויקט והעלאת נתונים</h2>
            <p className="text-xs text-slate-500">
              בחר את הדרך הנוחה לך: הקמה מודרכת מתבנית, ייבוא קובץ Excel או פענוח בריף ב-AI
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
          aria-label="סגור"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Guided Mode Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setMode('guided')}
              className={`flex flex-col items-start rounded-2xl border p-4 text-right transition ${
                mode === 'guided'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Layers className="mb-2 h-5 w-5 text-indigo-600" />
              <div className="text-sm font-bold text-slate-900">הקמה מודרכת ותבנית</div>
              <div className="mt-1 text-xs text-slate-500">
                הגדרה מהירה עם אפשרות לשכפול תבנית גאנט ושיווק מוכנה
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('excel')}
              className={`flex flex-col items-start rounded-2xl border p-4 text-right transition ${
                mode === 'excel'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <FileSpreadsheet className="mb-2 h-5 w-5 text-emerald-600" />
              <div className="text-sm font-bold text-slate-900">ייבוא מ-Excel / CSV</div>
              <div className="mt-1 text-xs text-slate-500">
                העלאת טבלת משימות, זמנים, בעלי תפקידים וספקים ישירות לגאנט
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`flex flex-col items-start rounded-2xl border p-4 text-right transition ${
                mode === 'ai'
                  ? 'border-violet-600 bg-violet-50/60 ring-2 ring-violet-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Sparkles className="mb-2 h-5 w-5 text-violet-600" />
              <div className="text-sm font-bold text-slate-900">פענוח בריף עם סוכן AI</div>
              <div className="mt-1 text-xs text-slate-500">
                הדבק תיאור פרויקט — ה-AI יבנה אוטומטית צד שיווקי + גאנט תפעולי
              </div>
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {error}
            </div>
          )}

          {/* Common Core Project Details */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                שם הפרויקט *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="לדוגמה: השקת מועדון הלקוחות 2026"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                בחירת לקוח מתוך KosCrm
              </label>
              <select
                value={clientContactId}
                onChange={(e) => handleSelectCrmClient(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
              >
                <option value="">הזנה ידנית / ללא שיוך כרגע</option>
                {crmContacts.slice(0, 80).map((c) => (
                  <option key={c.id} value={c.id}>
                    {getContactName(c)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                שם הלקוח / הארגון
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="שם הלקוח"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                תאריך התחלה
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                תאריך יעד לסיום
              </label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                תקציב משוער (ש"ח, אופציונלי)
              </label>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="לדוגמה: 45000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
            </div>

            {mode !== 'ai' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  תיאור קצר
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="מטרות הפרויקט בקצרה"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Mode-Specific Section */}
          {mode === 'guided' && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                תבנית עבודה מוכנה (Blueprint) — אופציונלי
              </h3>
              <p className="text-xs text-slate-500">
                בחר תבנית כדי להקים אוטומטית שלבי גאנט, בעלי תפקידים, ספקים ובסיס לדף הנחיתה:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedBlueprintId('')}
                  className={`rounded-xl border p-3.5 text-right text-xs transition ${
                    selectedBlueprintId === ''
                      ? 'border-indigo-600 bg-indigo-50/70'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-900">פרויקט ריק</div>
                  <div className="mt-1 text-slate-500">הקמה נקייה ללא משימות מראש</div>
                </button>
                {blueprints.map((bp) => (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => setSelectedBlueprintId(bp.id)}
                    className={`rounded-xl border p-3.5 text-right text-xs transition ${
                      selectedBlueprintId === bp.id
                        ? 'border-indigo-600 bg-indigo-50/70'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{bp.name}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                        {bp.sampleTasks.length} משימות
                      </span>
                    </div>
                    <div className="mt-1 text-slate-500">{bp.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'excel' && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Upload className="mb-2 h-8 w-8 text-emerald-600" />
                <div className="text-sm font-bold text-slate-800">
                  העלה קובץ Excel או CSV עם נתוני הפרויקט והגאנט
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  עמודות נתמכות אוטומטית: משימה, שלב, תאריך התחלה, תאריך סיום, אחראי, תפקיד, ספק, סטטוס, עלות
                </p>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                  {parsingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  <span>בחר קובץ מהמחשב</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {importWarnings.length > 0 && (
                <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                  {importWarnings.map((w, i) => (
                    <div key={i}>{w}</div>
                  ))}
                </div>
              )}

              {parsedTasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>זוהו {parsedTasks.length} משימות מוכנות לייבוא לגאנט:</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2">משימה</th>
                          <th className="px-3 py-2">שלב</th>
                          <th className="px-3 py-2">מועדים</th>
                          <th className="px-3 py-2">אחראי / ספקים</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedTasks.slice(0, 15).map((t, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-medium text-slate-900">{t.title}</td>
                            <td className="px-3 py-2 text-slate-600">{t.phase}</td>
                            <td className="px-3 py-2 text-slate-500" dir="ltr">
                              {t.startDate} - {t.endDate}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {t.ownerName || t.ownerRole}
                              {t.suppliers.length > 0 ? ` (+${t.suppliers.length} ספקים)` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'ai' && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="block text-sm font-bold text-slate-900">
                תאר את הפרויקט, קהל היעד והצרכים התפעוליים:
              </label>
              <textarea
                rows={4}
                value={aiBrief}
                onChange={(e) => setAiBrief(e.target.value)}
                placeholder="הזן כאן תיאור חופשי של הפרויקט..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm focus:border-violet-400 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleGenerateAiPreview}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>פענח בריף ובנה תצוגה מקדימה</span>
              </button>

              {aiPreview && (
                <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 text-xs">
                  <div className="font-bold text-violet-900">
                    מוכן להקמה: כותרת שיווקית "{aiPreview.marketing.headline}" +{' '}
                    {aiPreview.tasks.length} משימות גאנט
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ביטול
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>צור פרויקט והתחל עבודה</span>
        </button>
      </div>
    </div>
  );
};

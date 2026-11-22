import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  Layers,
  ListChecks,
  Loader2,
  Search,
  Server,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { BLUEPRINT_SECTORS } from '../config';
import type {
  AiWorkplanSuggestion,
  ProjectBlueprint,
  ProjectRecord,
  ProjectTaskDraft,
} from '../types';
import { parseProjectTasksFromFile } from '../services/projectImportService';
import {
  detectUploadedDocumentKind,
  extractDocumentForProject,
} from '../services/documentExtractService';
import { generateWorkplanFromPdf } from '../api/projectAiApi';

export interface ProjectUploaderModalProps {
  isOpen: boolean;
  blueprints: ProjectBlueprint[];
  aiLoading: boolean;
  onClose: () => void;
  onCreateProject: (data: Partial<ProjectRecord> & { title: string }) => Promise<ProjectRecord>;
  onBatchCreateTasks: (tasks: ProjectTaskDraft[], projectId?: string) => Promise<unknown>;
  onCloneBlueprint: (
    blueprintId: string,
    overrides?: {
      title?: string;
      clientName?: string;
      description?: string;
      startDate?: string;
      budget?: number;
      extraTags?: string[];
    }
  ) => Promise<ProjectRecord | null>;
  onRunAiWorkplan: (
    brief: string,
    projectTitle?: string,
    startDate?: string
  ) => Promise<{ suggestion?: AiWorkplanSuggestion; error?: string }>;
  onApplyAiWorkplan: (suggestion: AiWorkplanSuggestion, projectId?: string) => Promise<unknown>;
}

type UploadMode = 'guided' | 'excel' | 'ai';

export const ProjectUploaderModal: React.FC<ProjectUploaderModalProps> = ({
  isOpen,
  blueprints,
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
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Blueprints catalog filter & server-driven guided answers
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [blueprintSearch, setBlueprintSearch] = useState<string>('');
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});

  // File import mode state (Excel / CSV / PDF / DOCX / DOC / TXT)
  const [parsedTasks, setParsedTasks] = useState<ProjectTaskDraft[]>([]);
  const [uploadedDocSuggestion, setUploadedDocSuggestion] = useState<AiWorkplanSuggestion | null>(null);
  const [uploadedDocSummary, setUploadedDocSummary] = useState<string>('');
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [parsingFile, setParsingFile] = useState(false);

  // AI mode state
  const [aiBrief, setAiBrief] = useState('');
  const [aiPreview, setAiPreview] = useState<AiWorkplanSuggestion | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBlueprints = useMemo(() => {
    const q = blueprintSearch.trim().toLowerCase();
    return blueprints.filter((bp) => {
      if (sectorFilter !== 'all' && bp.sector !== sectorFilter) return false;
      if (!q) return true;
      return (
        bp.name.toLowerCase().includes(q) ||
        bp.description.toLowerCase().includes(q) ||
        bp.category.toLowerCase().includes(q)
      );
    });
  }, [blueprints, sectorFilter, blueprintSearch]);

  const selectedBlueprint = useMemo(
    () => blueprints.find((b) => b.id === selectedBlueprintId) || null,
    [blueprints, selectedBlueprintId]
  );

  if (!isOpen) return null;

  const handleSelectBlueprint = (bpId: string) => {
    setSelectedBlueprintId(bpId);
    setGuidedAnswers({});
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingFile(true);
    setError(null);
    setParsedTasks([]);
    setUploadedDocSuggestion(null);
    setUploadedDocSummary('');
    setImportWarnings([]);

    try {
      const kind = detectUploadedDocumentKind(file);
      const baseName = file.name.replace(/\.(xlsx|xls|csv|pdf|docx|doc|txt|md)$/i, '').trim();
      setUploadedFileName(baseName || file.name);

      if (kind === 'spreadsheet') {
        const res = await parseProjectTasksFromFile(file);
        setParsedTasks(res.tasks);
        setImportWarnings(res.warnings);
      } else {
        const extracted = await extractDocumentForProject(file);
        if (extracted.warnings.length > 0) {
          setImportWarnings(extracted.warnings);
        }

        if (extracted.kind === 'pdf' && extracted.pdfBase64) {
          const aiRes = await generateWorkplanFromPdf(
            extracted.pdfBase64,
            extracted.baseName || 'פרויקט ממסמך PDF',
            today
          );
          if (aiRes.error) {
            setError(aiRes.error);
          } else if (aiRes.suggestion) {
            setUploadedDocSuggestion(aiRes.suggestion);
            setUploadedDocSummary(aiRes.suggestion.summary || `פוענח ממסמך PDF (${file.name})`);
          }
        } else if (extracted.textContent) {
          const aiRes = await onRunAiWorkplan(
            extracted.textContent.slice(0, 12000),
            extracted.baseName || 'פרויקט ממסמך',
            today
          );
          if (aiRes.error) {
            setError(aiRes.error);
          } else if (aiRes.suggestion) {
            setUploadedDocSuggestion(aiRes.suggestion);
            setUploadedDocSummary(aiRes.suggestion.summary || `פוענח ממסמך (${file.name})`);
          }
        } else {
          setError('לא נמצא תוכן קריא בקובץ שהועלה.');
        }
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
    const derivedTitle = aiBrief.trim().split(/[\n.!]/)[0].slice(0, 60) || 'פרויקט חדש';
    const res = await onRunAiWorkplan(aiBrief.trim(), derivedTitle, today);
    if (res.error) {
      setError(res.error);
    } else if (res.suggestion) {
      setAiPreview(res.suggestion);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'guided' && selectedBlueprintId && selectedBlueprint) {
        const answersSummary = Object.entries(guidedAnswers)
          .filter(([, val]) => Boolean(val))
          .map(([qId, val]) => {
            const qObj = selectedBlueprint.guidedQuestions?.find((q) => q.id === qId);
            return qObj ? `${qObj.question}: ${val}` : val;
          })
          .join(' | ');

        const mergedDescription = [
          selectedBlueprint.description || '',
          answersSummary ? `הגדרות תבנית: ${answersSummary}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        await onCloneBlueprint(selectedBlueprintId, {
          title: selectedBlueprint.name,
          clientName: '',
          description: mergedDescription,
          startDate: today,
          extraTags: Object.values(guidedAnswers).filter(Boolean),
        });
      } else if (mode === 'excel') {
        if (parsedTasks.length === 0 && !uploadedDocSuggestion) {
          setError('יש להעלות קובץ Excel, CSV, PDF או Docs לפני יצירת הפרויקט.');
          setSubmitting(false);
          return;
        }
        if (uploadedDocSuggestion) {
          const created = await onCreateProject({
            title:
              uploadedFileName ||
              uploadedDocSuggestion.marketing?.headline?.slice(0, 70) ||
              'פרויקט ממסמך',
            description: uploadedDocSummary || `פוענח ממסמך (${uploadedFileName})`,
            clientName: '',
            startDate: today,
            targetEndDate: defaultEnd,
            status: 'planning',
          });
          await onApplyAiWorkplan(uploadedDocSuggestion, created.id);
        } else {
          const taskStarts = parsedTasks.map((t) => t.startDate).filter(Boolean).sort();
          const taskEnds = parsedTasks.map((t) => t.endDate).filter(Boolean).sort();
          const created = await onCreateProject({
            title: uploadedFileName || 'פרויקט מיובא מאקסל',
            description: `יובא מקובץ (${parsedTasks.length} משימות)`,
            clientName: '',
            startDate: taskStarts[0] || today,
            targetEndDate: taskEnds[taskEnds.length - 1] || defaultEnd,
            status: 'planning',
          });
          await onBatchCreateTasks(parsedTasks, created.id);
        }
      } else if (mode === 'ai') {
        if (!aiBrief.trim()) {
          setError('יש להזין תיאור פרויקט עבור סוכן ה-AI.');
          setSubmitting(false);
          return;
        }
        const derivedTitle =
          aiPreview?.marketing?.headline?.slice(0, 70) ||
          aiBrief.trim().split(/[\n.!]/)[0].slice(0, 60) ||
          'פרויקט חדש';
        const created = await onCreateProject({
          title: derivedTitle,
          description: aiBrief.trim(),
          clientName: '',
          startDate: today,
          targetEndDate: defaultEnd,
          status: 'planning',
        });
        if (aiPreview) {
          await onApplyAiWorkplan(aiPreview, created.id);
        }
      } else {
        await onCreateProject({
          title: 'פרויקט חדש',
          description: '',
          clientName: '',
          startDate: today,
          targetEndDate: defaultEnd,
          status: 'planning',
        });
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
              בחר תבנית מותאמת לארגון, ייבא קובץ Excel או הפק תוכנית עבודה מבריף באמצעות סוכן AI
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
        <div className="mx-auto max-w-5xl space-y-6">
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
              <div className="text-sm font-bold text-slate-900">הקמה מודרכת ותבניות (20)</div>
              <div className="mt-1 text-xs text-slate-500">
                בחירה מ-20 תבניות להייטק, ארגונים ועמותות עם פעולות שרת ו-AI
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
              <div className="text-sm font-bold text-slate-900">ייבוא קובץ (Excel / PDF / Docs)</div>
              <div className="mt-1 text-xs text-slate-500">
                העלאת אקסל, CSV, PDF או מסמך Word/Docs לפענוח אוטומטי לגאנט ולדף נחיתה
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

          {/* Mode-Specific Section: 20 Blueprints Catalog + Server-Driven Guided Questions */}
          {mode === 'guided' && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    קטלוג תבניות פרויקט (הייטק, ארגונים ועמותות)
                  </h3>
                  <p className="text-xs text-slate-500">
                    כל תבנית מפורקת לשלבי גאנט, בעלי תפקידים, ספקים, בקשות שרת וכלי AI מלווים
                  </p>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={blueprintSearch}
                    onChange={(e) => setBlueprintSearch(e.target.value)}
                    placeholder="חיפוש תבנית..."
                    className="w-52 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-8 pl-3 text-xs focus:border-indigo-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sector Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {BLUEPRINT_SECTORS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSectorFilter(sec.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      sectorFilter === sec.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Blueprints Grid */}
              <div className="grid max-h-72 grid-cols-1 gap-2.5 overflow-y-auto pl-1 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleSelectBlueprint('')}
                  className={`rounded-xl border p-3.5 text-right text-xs transition ${
                    selectedBlueprintId === ''
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-900">פרויקט ריק (הקמה מותאמת אישית)</div>
                  <div className="mt-1 text-slate-500">הקמה נקייה ללא משימות גאנט מוגדרות מראש</div>
                </button>

                {filteredBlueprints.map((bp) => {
                  const active = selectedBlueprintId === bp.id;
                  return (
                    <button
                      key={bp.id}
                      type="button"
                      onClick={() => handleSelectBlueprint(bp.id)}
                      className={`rounded-xl border p-3.5 text-right text-xs transition ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">{bp.name}</span>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {bp.sampleTasks.length} פעולות
                        </span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-slate-500">{bp.description}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-medium">
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
                          {bp.category}
                        </span>
                        {bp.serverActions && bp.serverActions.length > 0 && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                            {bp.serverActions.length} אוטומציות שרת
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Blueprint Details: Server-Driven Guided Questions, Actions & AI */}
              {selectedBlueprint && (
                <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                    <div>
                      <div className="text-sm font-bold text-indigo-950">
                        התאמה מונחית שרת לתבנית: {selectedBlueprint.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        {selectedBlueprint.defaultPhases.join('  •  ')}
                      </div>
                    </div>
                  </div>

                  {/* Server-Driven Guided Questions */}
                  {selectedBlueprint.guidedQuestions && selectedBlueprint.guidedQuestions.length > 0 && (
                    <div className="space-y-3">
                      {selectedBlueprint.guidedQuestions.map((q) => (
                        <div key={q.id} className="rounded-xl border border-white bg-white p-3.5 shadow-sm">
                          <div className="text-xs font-bold text-slate-900">{q.question}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {q.options.map((opt) => {
                              const picked = guidedAnswers[q.id] === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    setGuidedAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                  }
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                    picked
                                      ? 'border-indigo-600 bg-indigo-600 text-white'
                                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-1.5 text-[11px] text-slate-500">
                            השפעה בשרת: {q.serverImpact}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Server Actions + AI Tools + Tasks Preview */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-white bg-white p-3.5 text-xs shadow-sm">
                      <div className="mb-2 flex items-center gap-1.5 font-bold text-slate-800">
                        <ListChecks className="h-4 w-4 text-indigo-600" />
                        <span>פעולות בגאנט ({selectedBlueprint.sampleTasks.length})</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {selectedBlueprint.sampleTasks.slice(0, 5).map((t, idx) => (
                          <li key={idx} className="truncate">
                            • {t.title} ({t.ownerRole})
                          </li>
                        ))}
                        {selectedBlueprint.sampleTasks.length > 5 && (
                          <li className="text-indigo-600">
                            ועוד {selectedBlueprint.sampleTasks.length - 5} פעולות נוספות...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-white bg-white p-3.5 text-xs shadow-sm">
                      <div className="mb-2 flex items-center gap-1.5 font-bold text-slate-800">
                        <Server className="h-4 w-4 text-emerald-600" />
                        <span>בקשות שרת מלוות</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {(selectedBlueprint.serverActions || []).map((act, idx) => (
                          <li key={idx}>• {act}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-white bg-white p-3.5 text-xs shadow-sm">
                      <div className="mb-2 flex items-center gap-1.5 font-bold text-slate-800">
                        <Cpu className="h-4 w-4 text-violet-600" />
                        <span>כלי AI זמינים בתבנית</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {(selectedBlueprint.aiAssistantPrompts || []).map((p) => (
                          <li key={p.id}>• {p.label}</li>
                        ))}
                        <li>• מכ"ם סיכונים וניסוח בריפים לספקים</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'excel' && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Upload className="mb-2 h-8 w-8 text-emerald-600" />
                <div className="text-sm font-bold text-slate-800">
                  העלה קובץ Excel, CSV, PDF או Word/Docs עם נתוני הפרויקט
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  קבצי אקסל/CSV מיובאים ישירות לגאנט; מסמכי PDF ו-DOCX/DOC מפוענחים אוטומטית לשיווק ולגאנט באמצעות AI
                </p>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                  {parsingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span>{parsingFile ? 'מפענח קובץ...' : 'בחר קובץ (Excel / PDF / Docs)'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.txt"
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

              {uploadedDocSuggestion && (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      המסמך "{uploadedFileName}" פוענח בהצלחה — זוהו כותרת שיווקית ו-
                      {uploadedDocSuggestion.tasks.length} משימות גאנט:
                    </span>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="font-bold text-indigo-700">צד שיווקי שחולץ מהמסמך:</div>
                    <div className="mt-0.5 font-semibold text-slate-900">
                      {uploadedDocSuggestion.marketing.headline}
                    </div>
                    <div className="mt-0.5 text-slate-600">
                      {uploadedDocSuggestion.marketing.subheadline}
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2">משימה</th>
                          <th className="px-3 py-2">שלב</th>
                          <th className="px-3 py-2">משך</th>
                          <th className="px-3 py-2">אחראי / ספק</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {uploadedDocSuggestion.tasks.map((t, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-medium text-slate-900">{t.title}</td>
                            <td className="px-3 py-2 text-slate-600">{t.phase}</td>
                            <td className="px-3 py-2 text-slate-500">{t.durationDays} ימים</td>
                            <td className="px-3 py-2 text-slate-600">
                              {t.ownerRole}
                              {t.supplierRole ? ` | ${t.supplierRole}` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

/**
 * KOSUN AM (קושאן מייל אוטומטי) - Visual Automation Workflow Builder
 * 12-Layer Scaffolding Layer 9: Multi-Channel Marketing Automation Builder View
 *
 * Kosun 2026 Standards:
 * - Mobile First & Bento Grid design (rounded-3xl, rounded-2xl)
 * - Strict RTL: <div dir="rtl" style={{ textAlign: 'right' }}>
 * - Heebo font exclusively (font-heebo)
 * - Zero textual emojis (Lucide icons only)
 * - Multi-channel actions: Email dispatch + WhatsApp Green API message
 * - Triggers: crm:lead:created, smart_form:submitted, campaign:ambassador:created
 * - Condition and Delay steps
 * - Real Firestore saving via saveAutomation()
 */

import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Clock,
  Mail,
  MessageSquare,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Trash2,
  Zap,
  Filter,
  Save,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  EmailAutomation,
  AutomationStepConfig,
  AutomationStepType,
  AutomationTriggerEvent,
} from '../types';
import { useKosunAmData } from '../hooks/useKosunAmData';
import { useKosunAmActions } from '../hooks/useKosunAmActions';
import { SmartTooltip } from '../../../components/Ui/SmartTooltip';

const TRIGGER_OPTIONS: { id: AutomationTriggerEvent; label: string; description: string }[] = [
  {
    id: 'crm:lead:created',
    label: 'ליד חדש ב-CRM (crm:lead:created)',
    description: 'מופעל ברגע שליד חדש נכנס למערכת ה-CRM',
  },
  {
    id: 'smart_form:submitted',
    label: 'טופס חכם נשלח (smart_form:submitted)',
    description: 'מופעל בעת מילוי טופס בבונה הטפסים החכמים',
  },
  {
    id: 'campaign:ambassador:created',
    label: 'שגריר חדש נוצר (campaign:ambassador:created)',
    description: 'מופעל בעת הצטרפות שגריר לקמפיין גיוס',
  },
  {
    id: 'payment:completed',
    label: 'תשלום הושלם בהצלחה (payment:completed)',
    description: 'מופעל לאחר אישור עסקה בקשר תשלומים',
  },
];

export const AutomationBuilderView: React.FC = () => {
  const { automations } = useKosunAmData();
  const { saveAutomation, toggleAutomation, deleteAutomation } = useKosunAmActions();

  const [selectedId, setSelectedId] = useState<string | null>(
    automations[0]?.id || null
  );

  // Active editing automation state
  const selectedAutomation = automations.find((a) => a.id === selectedId) || automations[0] || null;

  // Local editable draft
  const [draftName, setDraftName] = useState(selectedAutomation?.name || '');
  const [draftDescription, setDraftDescription] = useState(selectedAutomation?.description || '');
  const [draftTrigger, setDraftTrigger] = useState<AutomationTriggerEvent>(
    selectedAutomation?.trigger?.event || 'crm:lead:created'
  );
  const [draftSteps, setDraftSteps] = useState<AutomationStepConfig[]>(
    selectedAutomation?.steps || []
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Sync draft when selectedAutomation changes
  React.useEffect(() => {
    if (selectedAutomation) {
      setDraftName(selectedAutomation.name);
      setDraftDescription(selectedAutomation.description || '');
      setDraftTrigger(selectedAutomation.trigger?.event || 'crm:lead:created');
      setDraftSteps(selectedAutomation.steps || []);
    }
  }, [selectedAutomation?.id]);

  const getStepIcon = (type: AutomationStepType) => {
    switch (type) {
      case 'send_email':
        return <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'send_whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'delay':
        return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'condition':
        return <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'update_crm_lead':
        return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Zap className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />;
    }
  };

  const handleAddNewWorkflow = async () => {
    const newAuto: Partial<EmailAutomation> = {
      name: 'תהליך אוטומציה רב-ערוצי חדש מקושאן',
      description: 'מסע לקוח רב-ערוצי (אימייל + וואטסאפ Green API)',
      isActive: true,
      trigger: { event: 'crm:lead:created' },
      steps: [
        {
          id: `step_${Date.now()}_1`,
          order: 1,
          title: 'שליחת מייל ברוכים הבאים מיידי',
          type: 'send_email',
          emailConfig: {
            subject: 'שמחים שהצטרפת למשפחת קושאן!',
            fromName: 'קושאן',
          },
        },
        {
          id: `step_${Date.now()}_2`,
          order: 2,
          title: 'השהיה של 30 דקות',
          type: 'delay',
          delayMinutes: 30,
        },
        {
          id: `step_${Date.now()}_3`,
          order: 3,
          title: 'שליחת הודעת וואטסאפ Green API',
          type: 'send_whatsapp',
          whatsAppConfig: {
            messageTemplate: 'שלום! קיבלנו את פנייתך בקושאן, נשמח לעמוד לשירותך.',
          },
        },
      ],
      executionCount: 0,
    };
    const newId = await saveAutomation(newAuto);
    setSelectedId(newId);
    setStatusNotice('קושאן הקים תהליך אוטומציה חדש בהצלחה');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // Step Management
  const handleAddStep = (type: AutomationStepType) => {
    const stepCount = draftSteps.length;
    let newStep: AutomationStepConfig;

    switch (type) {
      case 'send_email':
        newStep = {
          id: `step_${Date.now()}`,
          order: stepCount + 1,
          title: 'שליחת אימייל שיווקי',
          type: 'send_email',
          emailConfig: {
            subject: 'הודעה חשובה מקושאן',
            fromName: 'קושאן',
          },
        };
        break;
      case 'send_whatsapp':
        newStep = {
          id: `step_${Date.now()}`,
          order: stepCount + 1,
          title: 'שיגור וואטסאפ (Green API)',
          type: 'send_whatsapp',
          whatsAppConfig: {
            messageTemplate: 'שלום {{name}}, קושאן מעדכן אותך שהפנייה התקבלה בהצלחה.',
          },
        };
        break;
      case 'delay':
        newStep = {
          id: `step_${Date.now()}`,
          order: stepCount + 1,
          title: 'השהיה חכמה',
          type: 'delay',
          delayMinutes: 60,
        };
        break;
      case 'condition':
        newStep = {
          id: `step_${Date.now()}`,
          order: stepCount + 1,
          title: 'תנאי סינון חכם',
          type: 'condition',
        };
        break;
      default:
        newStep = {
          id: `step_${Date.now()}`,
          order: stepCount + 1,
          title: 'עדכון סטטוס ב-CRM',
          type: 'update_crm_lead',
          crmConfig: {
            updateStatus: 'in_progress',
          },
        };
    }

    setDraftSteps((prev) => [...prev, newStep]);
  };

  const handleRemoveStep = (stepId: string) => {
    setDraftSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === draftSteps.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    setDraftSteps((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const handleSaveCurrentWorkflow = async () => {
    if (!selectedAutomation) return;
    const updated: Partial<EmailAutomation> = {
      id: selectedAutomation.id,
      name: draftName || 'אוטומציה מקושאן',
      description: draftDescription,
      trigger: {
        event: draftTrigger,
      },
      steps: draftSteps,
      isActive: selectedAutomation.isActive,
    };
    await saveAutomation(updated);
    setStatusNotice('קושאן שמר את האוטומציה ב-DB בהצלחה');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleDeleteCurrentWorkflow = async (id: string) => {
    if (deleteAutomation) {
      await deleteAutomation(id);
      setStatusNotice('קושאן מחק את האוטומציה');
      setTimeout(() => setStatusNotice(null), 3000);
    }
  };

  return (
    <div dir="rtl" style={{ textAlign: 'right' }} className="space-y-6 font-heebo">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                בונה האוטומציות הרב-ערוצי - KOSUN AM
                <SmartTooltip text="קושאן מפעיל שרשרת פעולות שיווקיות רב-ערוציות: אימייל, וואטסאפ Green API וסנכרון לידים" />
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                קושאן מאזין לאירועי EventBus בזמן אמת ומשגר פעולות לפי תנאים והשהיות
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddNewWorkflow}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          קושאן מקים אוטומציה חדשה
        </button>
      </div>

      {/* Notice Toast */}
      {statusNotice && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Grid: Automations List & Visual Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workflows Bento List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              תהליכים מוגדרים ({automations.length})
            </h3>
            <span className="text-[11px] text-neutral-400">בחר לעריכה</span>
          </div>

          {automations.map((auto) => (
            <div
              key={auto.id}
              onClick={() => setSelectedId(auto.id)}
              className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
                selectedAutomation?.id === auto.id
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">
                  {auto.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAutomation(auto.id, !auto.isActive);
                  }}
                  className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition ${
                    auto.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                  title={auto.isActive ? 'השהה אוטומציה' : 'הפעל אוטומציה'}
                >
                  {auto.isActive ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>פעיל</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>מושהה</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                {auto.description || 'ללא תיאור'}
              </p>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="truncate max-w-[150px]">אירוע: {auto.trigger.event}</span>
                <span>הופעל: {auto.executionCount || 0}</span>
              </div>
            </div>
          ))}

          {automations.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-6">
              <Workflow className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                טרם הוגדרו אוטומציות
              </p>
              <button
                onClick={handleAddNewWorkflow}
                className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                צור אוטומציה ראשונה
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Visual Pipeline & Step Builder */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          {selectedAutomation ? (
            <div className="space-y-6">
              {/* Pipeline Header & Trigger Config */}
              <div className="space-y-3 border-b border-neutral-100 dark:border-neutral-800 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">
                      שם התהליך
                    </label>
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="text-base sm:text-lg font-black text-neutral-900 dark:text-white bg-transparent border-b border-dashed border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {deleteAutomation && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCurrentWorkflow(selectedAutomation.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                        title="מחק אוטומציה זו"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveCurrentWorkflow}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      קושאן שומר
                    </button>
                  </div>
                </div>

                {/* Trigger Selector */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      אירוע טריגר מפעיל (Trigger Event)
                      <SmartTooltip text="האירוע שברגע התרחשותו במערכת, קושאן מפעיל את שרשרת הפעולות" />
                    </label>
                    <span className="text-[11px] text-neutral-400">סנכרון EventBus</span>
                  </div>
                  <select
                    value={draftTrigger}
                    onChange={(e) => setDraftTrigger(e.target.value as AutomationTriggerEvent)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TRIGGER_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Steps Add Toolbar */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  הוסף שלב לשרשרת:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddStep('send_email')}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:border-indigo-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    + אימייל
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddStep('send_whatsapp')}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:border-emerald-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    + וואטסאפ (Green API)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddStep('delay')}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:border-amber-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    + השהיה
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddStep('condition')}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold hover:border-purple-500 border border-neutral-200 dark:border-neutral-700 transition flex items-center gap-1"
                  >
                    <Filter className="w-3.5 h-3.5 text-purple-600" />
                    + תנאי סינון
                  </button>
                </div>
              </div>

              {/* Steps Sequential List */}
              <div className="space-y-3">
                {draftSteps.map((step, idx) => (
                  <div key={step.id} className="relative">
                    {idx > 0 && (
                      <div className="w-0.5 h-5 bg-indigo-200 dark:bg-indigo-900 mx-auto my-1" />
                    )}

                    <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40 space-y-3">
                      {/* Step Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-900 flex items-center justify-center shadow-xs">
                            {getStepIcon(step.type)}
                          </div>
                          <div>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDraftSteps((prev) =>
                                  prev.map((s) => (s.id === step.id ? { ...s, title: val } : s))
                                );
                              }}
                              className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 bg-transparent border-b border-transparent hover:border-neutral-300 focus:outline-none focus:border-indigo-500"
                            />
                            <p className="text-[11px] text-neutral-400">
                              {step.type === 'send_email' && 'שיגור אימייל שיווקי'}
                              {step.type === 'send_whatsapp' && 'שיגור וואטסאפ Green API'}
                              {step.type === 'delay' && 'השהיה מתוזמנת'}
                              {step.type === 'condition' && 'בדיקת תנאי סינון'}
                              {step.type === 'update_crm_lead' && 'סנכרון ליד ב-CRM'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveStep(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveStep(idx, 'down')}
                            disabled={idx === draftSteps.length - 1}
                            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(step.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Step Configuration Details */}
                      <div className="text-xs space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        {step.type === 'send_email' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">
                                נושא האימייל
                              </label>
                              <input
                                type="text"
                                value={step.emailConfig?.subject || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDraftSteps((prev) =>
                                    prev.map((s) =>
                                      s.id === step.id
                                        ? {
                                            ...s,
                                            emailConfig: {
                                              ...s.emailConfig,
                                              subject: val,
                                            },
                                          }
                                        : s
                                    )
                                  );
                                }}
                                placeholder="הזן נושא להודעה..."
                                className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                              />
                            </div>
                          </div>
                        )}

                        {step.type === 'send_whatsapp' && (
                          <div className="space-y-2">
                            <div>
                              <label className="text-[11px] text-neutral-500 mb-1 block">
                                תבנית הודעת וואטסאפ (Green API)
                              </label>
                              <textarea
                                rows={2}
                                value={step.whatsAppConfig?.messageTemplate || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDraftSteps((prev) =>
                                    prev.map((s) =>
                                      s.id === step.id
                                        ? {
                                            ...s,
                                            whatsAppConfig: {
                                              ...s.whatsAppConfig,
                                              messageTemplate: val,
                                            },
                                          }
                                        : s
                                    )
                                  );
                                }}
                                placeholder="הזן הודעת וואטסאפ (תומך במשתנים {{name}})..."
                                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                              />
                            </div>
                          </div>
                        )}

                        {step.type === 'delay' && (
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-neutral-500 whitespace-nowrap">
                              השהה למשך:
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={step.delayMinutes || 60}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                setDraftSteps((prev) =>
                                  prev.map((s) =>
                                    s.id === step.id ? { ...s, delayMinutes: val } : s
                                  )
                                );
                              }}
                              className="w-24 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-center"
                            />
                            <span className="text-[11px] text-neutral-500">דקות</span>
                          </div>
                        )}

                        {step.type === 'condition' && (
                          <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 text-[11px] text-purple-900 dark:text-purple-300">
                            קושאן מוודא שהליד פתח את האימייל הקודם או שיש לו תגית ייעודית לפני המשך התהליך.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Notice */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  קושאן שומר את התהליך ב-Firestore תחת המרחב המבודד של בית העסק
                </span>
                <button
                  type="button"
                  onClick={handleSaveCurrentWorkflow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  קושאן שומר את האוטומציה
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-neutral-400 text-xs">
              בחר אוטומציה מהרשימה או לחץ על "קושאן מקים אוטומציה חדשה"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationBuilderView;

/**
 * KOSUN AM (קושאן מייל אוטומטי) - Visual Automation Workflow Builder
 * 12-Layer Scaffolding Layer 9: Multi-Channel Marketing Automation Builder View
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
  CheckCircle2,
  Trash2,
  Zap,
} from 'lucide-react';
import { EmailAutomation, AutomationStepConfig } from '../types';
import { useKosunAmData } from '../hooks/useKosunAmData';
import { useKosunAmActions } from '../hooks/useKosunAmActions';
import { SmartTooltip } from '../../../components/Ui/SmartTooltip';

export const AutomationBuilderView: React.FC = () => {
  const { automations } = useKosunAmData();
  const { saveAutomation, toggleAutomation, deleteTemplate } = useKosunAmActions();

  const [selectedAutomation, setSelectedAutomation] = useState<EmailAutomation | null>(
    automations[0] || null
  );

  const getStepIcon = (type: AutomationStepConfig['type']) => {
    switch (type) {
      case 'send_email':
        return <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'send_whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'delay':
        return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'update_crm_lead':
        return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Zap className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />;
    }
  };

  const handleAddNewWorkflow = async () => {
    const newAuto: Partial<EmailAutomation> = {
      name: 'תהליך אוטומציה חדש מקושאן',
      description: 'מסע לקוח רב-ערוצי (מייל + וואטסאפ)',
      isActive: true,
      trigger: { event: 'crm:lead:created' },
      steps: [
        {
          id: `step_${Date.now()}_1`,
          order: 1,
          title: 'שליחת מייל ברוכים הבאים מיידי',
          type: 'send_email',
          emailConfig: {
            subject: 'שמחים שהצטרפת למשפחת קושאן',
            fromName: 'קושאן',
          },
        },
        {
          id: `step_${Date.now()}_2`,
          order: 2,
          title: 'השהיה של 60 דקות',
          type: 'delay',
          delayMinutes: 60,
        },
      ],
      executionCount: 0,
    };
    await saveAutomation(newAuto);
  };

  return (
    <div
      dir="rtl"
      style={{ textAlign: 'right' }}
      className="space-y-6 font-heebo"
    >
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Workflow className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            בונה האוטומציות הרב-ערוצי של קושאן
            <SmartTooltip text="קושאן מפעיל שרשרת פעולות אוטומטיות המשלבות מייל, וואטסאפ וסנכרון לידים" />
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            הגדר טריגרים מאירועי מערכת, השהיות חכמות ופעולות מסירה
          </p>
        </div>

        <button
          onClick={handleAddNewWorkflow}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          קושאן מקים אוטומציה חדשה
        </button>
      </div>

      {/* Grid: Automations List & Workflow Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Automation Workflows List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            תהליכים פעילים ({automations.length})
          </h3>
          {automations.map((auto) => (
            <div
              key={auto.id}
              onClick={() => setSelectedAutomation(auto)}
              className={`p-4 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
                selectedAutomation?.id === auto.id
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                  {auto.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAutomation(auto.id, !auto.isActive);
                  }}
                  className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
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

              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-3">
                {auto.description || 'ללא תיאור'}
              </p>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span>טריגר: {auto.trigger.event}</span>
                <span>הופעל: {auto.executionCount} פעמים</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Columns: Visual Pipeline Editor */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          {selectedAutomation ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {selectedAutomation.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    אירוע טריגר: <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{selectedAutomation.trigger.event}</code>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {selectedAutomation.steps.length} שלבים בשרשרת
                  </span>
                </div>
              </div>

              {/* Pipeline Step Cards */}
              <div className="space-y-3">
                {selectedAutomation.steps.map((step, idx) => (
                  <div key={step.id} className="relative">
                    {idx > 0 && (
                      <div className="w-0.5 h-4 bg-indigo-200 dark:bg-indigo-900 mx-auto my-1" />
                    )}
                    <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-900 flex items-center justify-center shadow-xs">
                          {getStepIcon(step.type)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            {step.title}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {step.type === 'delay' && `השהיה של ${step.delayMinutes || 0} דקות`}
                            {step.type === 'send_email' && `שליחת אימייל: "${step.emailConfig?.subject || ''}"`}
                            {step.type === 'send_whatsapp' && 'שיגור הודעה בוואטסאפ Green API'}
                            {step.type === 'update_crm_lead' && 'עדכון ליד ורשומות ב-CRM'}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300">
                        שלב {idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  קושאן מנטר ומאזין לאירועי EventBus בזמן אמת
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 text-sm">
              בחר אוטומציה להצגת שרשרת הפעולות
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

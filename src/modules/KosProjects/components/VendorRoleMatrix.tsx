import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Phone,
  Send,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import type { ProjectRecord, ProjectRoleAssignment, ProjectTask } from '../types';
import { TASK_STATUS_LABELS } from '../config';

export interface VendorRoleMatrixProps {
  project: ProjectRecord;
  tasks: ProjectTask[];
  onSelectTask: (task: ProjectTask) => void;
  onSendReminder: (supplier: ProjectRoleAssignment, message: string) => Promise<boolean>;
}

interface AggregatedStakeholder {
  key: string;
  name: string;
  role: string;
  isSupplier: boolean;
  contactId?: string;
  phone?: string;
  email?: string;
  tasks: ProjectTask[];
  completedCount: number;
  atRiskCount: number;
  totalEstimatedCost: number;
}

export const VendorRoleMatrix: React.FC<VendorRoleMatrixProps> = ({
  project,
  tasks,
  onSelectTask,
  onSendReminder,
}) => {
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const [sentFeedback, setSentFeedback] = useState<Record<string, 'success' | 'error'>>({});
  const [filterType, setFilterType] = useState<'all' | 'supplier' | 'owner'>('all');

  const stakeholders = useMemo<AggregatedStakeholder[]>(() => {
    const map = new Map<string, AggregatedStakeholder>();

    const upsert = (
      key: string,
      info: {
        name: string;
        role: string;
        isSupplier: boolean;
        contactId?: string;
        phone?: string;
        email?: string;
        cost?: number;
      },
      task: ProjectTask
    ) => {
      const existing = map.get(key);
      const isCompleted = task.status === 'completed' || task.progress >= 100;
      const isAtRisk = task.status === 'at_risk';

      if (existing) {
        if (!existing.tasks.some((t) => t.id === task.id)) {
          existing.tasks.push(task);
          if (isCompleted) existing.completedCount += 1;
          if (isAtRisk) existing.atRiskCount += 1;
        }
        existing.totalEstimatedCost += Number(info.cost) || 0;
        if (!existing.phone && info.phone) existing.phone = info.phone;
        if (!existing.email && info.email) existing.email = info.email;
      } else {
        map.set(key, {
          key,
          name: info.name,
          role: info.role || (info.isSupplier ? 'ספק חיצוני' : 'בעל תפקיד'),
          isSupplier: info.isSupplier,
          contactId: info.contactId,
          phone: info.phone,
          email: info.email,
          tasks: [task],
          completedCount: isCompleted ? 1 : 0,
          atRiskCount: isAtRisk ? 1 : 0,
          totalEstimatedCost: Number(info.cost) || 0,
        });
      }
    };

    for (const task of tasks) {
      if (task.ownerName?.trim()) {
        const ownerKey = `owner:${task.ownerContactId || task.ownerName.trim().toLowerCase()}`;
        upsert(
          ownerKey,
          {
            name: task.ownerName.trim(),
            role: task.ownerRole || 'אחראי משימה',
            isSupplier: false,
            contactId: task.ownerContactId,
          },
          task
        );
      }

      for (const sup of task.suppliers || []) {
        if (!sup.name?.trim()) continue;
        const supKey = `supplier:${sup.contactId || sup.name.trim().toLowerCase()}`;
        upsert(
          supKey,
          {
            name: sup.name.trim(),
            role: sup.role || 'ספק נדרש',
            isSupplier: true,
            contactId: sup.contactId,
            phone: sup.phone,
            email: sup.email,
            cost: sup.costEstimate,
          },
          task
        );
      }
    }

    return Array.from(map.values()).sort((a, b) => b.tasks.length - a.tasks.length);
  }, [tasks]);

  const filtered = useMemo(() => {
    if (filterType === 'supplier') return stakeholders.filter((s) => s.isSupplier);
    if (filterType === 'owner') return stakeholders.filter((s) => !s.isSupplier);
    return stakeholders;
  }, [stakeholders, filterType]);

  const handleQuickReminder = async (item: AggregatedStakeholder) => {
    setSendingKey(item.key);
    const openTasks = item.tasks.filter((t) => t.status !== 'completed');
    const summaryList = openTasks
      .slice(0, 3)
      .map((t) => `${t.title} (עד ${t.endDate})`)
      .join(', ');
    const message = `שלום ${item.name}, תזכורת מפרויקט "${project.title}": יש ${openTasks.length} משימות פתוחות המשויכות אליך${summaryList ? ` — ${summaryList}` : ''}. נשמח לעדכון סטטוס.`;

    try {
      const ok = await onSendReminder(
        {
          contactId: item.contactId,
          name: item.name,
          role: item.role,
          phone: item.phone,
          email: item.email,
          isSupplier: item.isSupplier,
        },
        message
      );
      setSentFeedback((prev) => ({ ...prev, [item.key]: ok ? 'success' : 'error' }));
    } catch {
      setSentFeedback((prev) => ({ ...prev, [item.key]: 'error' }));
    } finally {
      setSendingKey(null);
    }
  };

  if (stakeholders.length === 0) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"
      >
        <Users className="mx-auto mb-3 h-10 w-10 text-slate-400" />
        <h3 className="text-base font-bold text-slate-800">
          טרם שובצו בעלי תפקידים או ספקים בפרויקט
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          פתח משימה בגאנט כדי לשייך אחראי וספקים ישירות מתוך ה-CRM.
        </p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            הכל ({stakeholders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('supplier')}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              filterType === 'supplier'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ספקים חיצוניים ({stakeholders.filter((s) => s.isSupplier).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('owner')}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              filterType === 'owner'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            בעלי תפקידים ({stakeholders.filter((s) => !s.isSupplier).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => {
          const feedback = sentFeedback[item.key];
          return (
            <div
              key={item.key}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        item.isSupplier
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {item.isSupplier ? (
                        <Briefcase className="h-5 w-5" />
                      ) : (
                        <UserCheck className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      item.isSupplier
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.isSupplier ? 'ספק חיצוני' : 'בעל תפקיד'}
                  </span>
                </div>

                {(item.phone || item.email) && (
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                    {item.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span dir="ltr">{item.phone}</span>
                      </span>
                    )}
                    {item.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span dir="ltr">{item.email}</span>
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center">
                  <div>
                    <div className="text-xs text-slate-500">משימות</div>
                    <div className="text-sm font-bold text-slate-900">{item.tasks.length}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">הושלמו</div>
                    <div className="text-sm font-bold text-emerald-600">
                      {item.completedCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">בסיכון</div>
                    <div className="text-sm font-bold text-rose-600">{item.atRiskCount}</div>
                  </div>
                </div>

                {item.totalEstimatedCost > 0 && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-100 px-3 py-1.5 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Wallet className="h-3.5 w-3.5" />
                      עלות משוערת מצטברת
                    </span>
                    <span className="font-bold text-slate-800">
                      {item.totalEstimatedCost.toLocaleString('he-IL')} ש"ח
                    </span>
                  </div>
                )}

                <div className="mt-3 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500">משימות משויכות:</div>
                  {item.tasks.slice(0, 4).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onSelectTask(t)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-right text-xs transition hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <span className="truncate font-medium text-slate-800">{t.title}</span>
                      <span className="mr-2 shrink-0 text-[10px] text-slate-500">
                        {TASK_STATUS_LABELS[t.status]}
                      </span>
                    </button>
                  ))}
                  {item.tasks.length > 4 && (
                    <div className="text-[11px] text-slate-400">
                      ועוד {item.tasks.length - 4} משימות נוספות
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  disabled={sendingKey === item.key || (!item.phone && !item.email)}
                  onClick={() => handleQuickReminder(item)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingKey === item.key ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {item.phone || item.email
                      ? 'שלח תזכורת סטטוס מהירה'
                      : 'אין טלפון או מייל לשליחה'}
                  </span>
                </button>
                {feedback === 'success' && (
                  <p className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    התזכורת נשלחה בהצלחה
                  </p>
                )}
                {feedback === 'error' && (
                  <p className="mt-1.5 flex items-center justify-center gap-1 text-[11px] font-medium text-rose-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    לא ניתן לשלוח כרגע — בדוק חיבור WhatsApp או מייל
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

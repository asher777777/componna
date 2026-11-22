import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Clock,
  Diamond,
  Download,
  Edit3,
  GanttChartSquare,
  Link2,
  List,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import type { CrmContactSummary } from '../../../core/contracts';
import { TASK_STATUS_LABELS } from '../config';
import type {
  ProjectRecord,
  ProjectRoleAssignment,
  ProjectTask,
  TaskStatus,
} from '../types';
import { TaskEditorModal } from './TaskEditorModal';
import { VendorRoleMatrix } from './VendorRoleMatrix';

export interface GanttChartViewProps {
  project: ProjectRecord;
  tasks: ProjectTask[];
  crmContacts: CrmContactSummary[];
  onCreateTask: (
    data: Omit<ProjectTask, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onUpdateTask: (taskId: string, data: Partial<ProjectTask>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onCreateSupplierInCrm: (data: {
    name: string;
    phone?: string;
    email?: string;
    role: string;
  }) => Promise<CrmContactSummary | null>;
  onSendReminder: (supplier: ProjectRoleAssignment, message: string) => Promise<boolean>;
  onDraftBrief: (task: ProjectTask, supplierName: string) => Promise<string>;
  onExportExcel: () => void;
}

type ZoomScale = 'days' | 'weeks' | 'months';
type SubViewMode = 'gantt' | 'table' | 'vendors';

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(iso?: string): Date {
  if (!iso) return new Date();
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

function formatShortHebDate(d: Date): string {
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
}

function formatMonthHeb(d: Date): string {
  return d.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
}

const STATUS_BAR_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-slate-400',
  in_progress: 'bg-indigo-600',
  at_risk: 'bg-rose-600',
  completed: 'bg-emerald-600',
};

const STATUS_BADGE_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-indigo-50 text-indigo-700',
  at_risk: 'bg-rose-50 text-rose-700',
  completed: 'bg-emerald-50 text-emerald-700',
};

const NEXT_STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  at_risk: 'in_progress',
  completed: 'pending',
};

export const GanttChartView: React.FC<GanttChartViewProps> = ({
  project,
  tasks,
  crmContacts,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onCreateSupplierInCrm,
  onSendReminder,
  onDraftBrief,
  onExportExcel,
}) => {
  const [subView, setSubView] = useState<SubViewMode>('gantt');
  const [zoom, setZoom] = useState<ZoomScale>('weeks');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayDate = useMemo(() => parseDate(todayIso), [todayIso]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (!q) return true;
      const inTitle = t.title.toLowerCase().includes(q);
      const inPhase = (t.phase || '').toLowerCase().includes(q);
      const inOwner = (t.ownerName || '').toLowerCase().includes(q) || (t.ownerRole || '').toLowerCase().includes(q);
      const inSup = (t.suppliers || []).some(
        (s) => s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)
      );
      return inTitle || inPhase || inOwner || inSup;
    });
  }, [tasks, searchQuery, statusFilter]);

  const groupedByPhase = useMemo(() => {
    const map = new Map<string, ProjectTask[]>();
    for (const t of filteredTasks) {
      const phase = t.phase?.trim() || 'כללי';
      const arr = map.get(phase) || [];
      arr.push(t);
      map.set(phase, arr);
    }
    return Array.from(map.entries());
  }, [filteredTasks]);

  // Compute timeline bounds
  const timeline = useMemo(() => {
    const allDates: Date[] = [
      parseDate(project.startDate),
      parseDate(project.targetEndDate),
      todayDate,
    ];
    for (const t of tasks) {
      allDates.push(parseDate(t.startDate));
      allDates.push(parseDate(t.endDate));
    }
    const minMs = Math.min(...allDates.map((d) => d.getTime()));
    const maxMs = Math.max(...allDates.map((d) => d.getTime()));

    const start = new Date(minMs - 3 * DAY_MS);
    const end = new Date(maxMs + 7 * DAY_MS);
    const totalDays = Math.max(14, diffDays(start, end));

    const pxPerDay = zoom === 'days' ? 36 : zoom === 'weeks' ? 18 : 8;
    const totalWidth = Math.max(720, totalDays * pxPerDay);

    const ticks: Array<{ label: string; offsetPx: number; widthPx: number }> = [];
    const stepDays = zoom === 'days' ? 1 : zoom === 'weeks' ? 7 : 30;
    for (let d = 0; d < totalDays; d += stepDays) {
      const tickDate = new Date(start.getTime() + d * DAY_MS);
      const widthDays = Math.min(stepDays, totalDays - d);
      ticks.push({
        label: zoom === 'months' ? formatMonthHeb(tickDate) : formatShortHebDate(tickDate),
        offsetPx: d * pxPerDay,
        widthPx: widthDays * pxPerDay,
      });
    }

    const todayOffsetPx = diffDays(start, todayDate) * pxPerDay;

    return { start, end, totalDays, pxPerDay, totalWidth, ticks, todayOffsetPx };
  }, [project.startDate, project.targetEndDate, tasks, zoom, todayDate]);

  const openCreateModal = () => {
    setEditingTask(null);
    setEditorOpen(true);
  };

  const openEditModal = (task: ProjectTask) => {
    setEditingTask(task);
    setEditorOpen(true);
  };

  const handleSaveTask = async (
    data: Omit<ProjectTask, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>,
    existingTaskId?: string
  ) => {
    if (existingTaskId) {
      await onUpdateTask(existingTaskId, data);
    } else {
      await onCreateTask(data);
    }
  };

  const handleCycleStatus = async (task: ProjectTask) => {
    const next = NEXT_STATUS_CYCLE[task.status];
    await onUpdateTask(task.id, {
      status: next,
      progress: next === 'completed' ? 100 : next === 'pending' ? 0 : Math.max(task.progress, 25),
    });
  };

  const togglePhase = (phase: string) => {
    setCollapsedPhases((prev) => ({ ...prev, [phase]: !prev[phase] }));
  };

  return (
    <div dir="rtl" className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSubView('gantt')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                subView === 'gantt'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GanttChartSquare className="h-3.5 w-3.5" />
              <span>תרשים גאנט</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('table')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                subView === 'table'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>טבלת משימות</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('vendors')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                subView === 'vendors'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>בעלי תפקידים וספקים</span>
            </button>
          </div>

          {subView === 'gantt' && (
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs">
              {(['days', 'weeks', 'months'] as ZoomScale[]).map((scale) => (
                <button
                  key={scale}
                  type="button"
                  onClick={() => setZoom(scale)}
                  className={`rounded-lg px-2.5 py-1 font-medium transition ${
                    zoom === scale
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {scale === 'days' ? 'ימים' : scale === 'weeks' ? 'שבועות' : 'חודשים'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {subView !== 'vendors' && (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש משימה, אחראי או ספק..."
                  className="w-48 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-8 pl-3 text-xs text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none"
              >
                <option value="all">כל הסטטוסים</option>
                {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {TASK_STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </>
          )}

          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>ייצוא לאקסל</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>משימה חדשה</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {subView === 'vendors' ? (
        <VendorRoleMatrix
          project={project}
          tasks={tasks}
          onSelectTask={openEditModal}
          onSendReminder={onSendReminder}
        />
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <GanttChartSquare className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">
            {tasks.length === 0 ? 'עדיין אין משימות בתוכנית העבודה' : 'לא נמצאו משימות התואמות לסינון'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {tasks.length === 0
              ? 'הוסף משימת גאנט ראשונה, ייבא קובץ Excel או הפק תוכנית אוטומטית עם סוכן ה-AI.'
              : 'נסה לנקות את שדה החיפוש או לשנות את סינון הסטטוס.'}
          </p>
          {tasks.length === 0 && (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>הוסף משימה ראשונה</span>
            </button>
          )}
        </div>
      ) : subView === 'table' ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[780px] text-right text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">שלב / משימה</th>
                <th className="px-3 py-3 font-semibold">מועדים</th>
                <th className="px-3 py-3 font-semibold">בעל תפקיד</th>
                <th className="px-3 py-3 font-semibold">ספקים נדרשים</th>
                <th className="px-3 py-3 font-semibold">התקדמות</th>
                <th className="px-3 py-3 font-semibold">סטטוס</th>
                <th className="px-3 py-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const isOverdue = task.endDate < todayIso && task.status !== 'completed';
                return (
                  <tr key={task.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {task.isMilestone && (
                          <Diamond className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-600" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{task.title}</div>
                          <div className="text-[11px] text-slate-500">{task.phase}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <div className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span dir="ltr">
                          {task.startDate} - {task.endDate}
                        </span>
                      </div>
                      {isOverdue && (
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>באיחור</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-800">{task.ownerName || 'לא שויך'}</div>
                      <div className="text-[11px] text-slate-500">{task.ownerRole}</div>
                    </td>
                    <td className="px-3 py-3">
                      {task.suppliers?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {task.suppliers.map((s, idx) => (
                            <span
                              key={`${s.name}-${idx}`}
                              className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">ללא ספקים</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${STATUS_BAR_COLORS[task.status]}`}
                            style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleCycleStatus(task)}
                        title="לחץ להחלפת סטטוס מהירה"
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-80 ${STATUS_BADGE_COLORS[task.status]}`}
                      >
                        {TASK_STATUS_LABELS[task.status]}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>עריכה</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Interactive RTL Gantt Timeline */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${280 + timeline.totalWidth}px` }}>
              {/* Header row */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <div className="sticky right-0 z-20 flex w-[280px] shrink-0 items-center justify-between border-l border-slate-200 bg-slate-50 px-4 py-3">
                  <span>שלב / משימה ובעל תפקיד</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {filteredTasks.length} משימות
                  </span>
                </div>
                <div className="relative flex" style={{ width: `${timeline.totalWidth}px` }}>
                  {timeline.ticks.map((tick, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${tick.widthPx}px` }}
                      className="shrink-0 border-l border-slate-200/70 px-2 py-3 text-center text-[11px] font-medium text-slate-500"
                    >
                      {tick.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase Groups & Task Rows */}
              <div className="relative">
                {groupedByPhase.map(([phase, phaseTasks]) => {
                  const isCollapsed = Boolean(collapsedPhases[phase]);
                  const phaseCompleted = phaseTasks.filter((t) => t.status === 'completed').length;

                  return (
                    <div key={phase} className="border-b border-slate-100 last:border-b-0">
                      {/* Phase Header */}
                      <button
                        type="button"
                        onClick={() => togglePhase(phase)}
                        className="flex w-full items-center bg-slate-50/90 text-right hover:bg-slate-100/70"
                      >
                        <div className="sticky right-0 z-10 flex w-[280px] shrink-0 items-center justify-between border-l border-slate-200 bg-slate-50/95 px-4 py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            {isCollapsed ? (
                              <ChevronLeft className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            )}
                            <span>{phase}</span>
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm">
                            {phaseCompleted}/{phaseTasks.length}
                          </span>
                        </div>
                        <div
                          className="h-9 flex-1"
                          style={{ width: `${timeline.totalWidth}px` }}
                        />
                      </button>

                      {/* Tasks */}
                      {!isCollapsed &&
                        phaseTasks.map((task) => {
                          const startOffsetDays = Math.max(
                            0,
                            diffDays(timeline.start, parseDate(task.startDate))
                          );
                          const durationDays = Math.max(
                            1,
                            diffDays(parseDate(task.startDate), parseDate(task.endDate)) + 1
                          );
                          const rightPx = startOffsetDays * timeline.pxPerDay;
                          const widthPx = Math.max(
                            task.isMilestone ? 28 : 44,
                            durationDays * timeline.pxPerDay
                          );
                          const isOverdue =
                            task.endDate < todayIso && task.status !== 'completed';

                          return (
                            <div
                              key={task.id}
                              className="group flex border-t border-slate-100 hover:bg-indigo-50/20"
                            >
                              {/* Sticky Task Meta Column */}
                              <div
                                onClick={() => openEditModal(task)}
                                className="sticky right-0 z-10 flex w-[280px] shrink-0 cursor-pointer items-center justify-between border-l border-slate-200 bg-white px-4 py-2.5 group-hover:bg-indigo-50/20"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    {task.isMilestone && (
                                      <Diamond className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-600" />
                                    )}
                                    <span className="truncate text-xs font-semibold text-slate-900">
                                      {task.title}
                                    </span>
                                  </div>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                    <span className="truncate">
                                      {task.ownerName || 'ללא אחראי'}
                                    </span>
                                    {task.suppliers?.length > 0 && (
                                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                                        {task.suppliers.length} ספקים
                                      </span>
                                    )}
                                    {task.dependsOnTaskIds?.length > 0 && (
                                      <span
                                        className="inline-flex items-center gap-0.5 text-[10px] text-slate-400"
                                        title="קיימת תלות במשימה קודמת"
                                      >
                                        <Link2 className="h-3 w-3" />
                                        {task.dependsOnTaskIds.length}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {isOverdue && (
                                  <AlertTriangle
                                    className="mr-2 h-4 w-4 shrink-0 text-rose-500"
                                    aria-label="משימה באיחור"
                                  />
                                )}
                              </div>

                              {/* Timeline Track (RTL: right offset = start date) */}
                              <div
                                className="relative h-14 shrink-0"
                                style={{ width: `${timeline.totalWidth}px` }}
                              >
                                {/* Vertical Grid Lines */}
                                {timeline.ticks.map((tick, idx) => (
                                  <div
                                    key={idx}
                                    style={{ right: `${tick.offsetPx}px`, width: `${tick.widthPx}px` }}
                                    className="pointer-events-none absolute inset-y-0 border-l border-slate-100"
                                  />
                                ))}

                                {/* Today Vertical Marker */}
                                {timeline.todayOffsetPx >= 0 &&
                                  timeline.todayOffsetPx <= timeline.totalWidth && (
                                    <div
                                      style={{ right: `${timeline.todayOffsetPx}px` }}
                                      className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-rose-500/70"
                                      title={`היום (${todayIso})`}
                                    />
                                  )}

                                {/* Task Bar */}
                                <button
                                  type="button"
                                  onClick={() => openEditModal(task)}
                                  style={{
                                    right: `${rightPx}px`,
                                    width: `${widthPx}px`,
                                  }}
                                  title={`${task.title} | ${task.startDate} עד ${task.endDate} | ${task.progress}%`}
                                  className={`absolute top-2.5 z-10 flex h-9 items-center overflow-hidden rounded-lg px-2 text-right text-[11px] font-semibold text-white shadow-sm transition hover:brightness-110 ${
                                    STATUS_BAR_COLORS[task.status]
                                  } ${isOverdue ? 'ring-2 ring-rose-400 ring-offset-1' : ''}`}
                                >
                                  {/* Progress overlay */}
                                  <div
                                    className="pointer-events-none absolute inset-y-0 right-0 bg-black/15"
                                    style={{
                                      width: `${Math.min(100, Math.max(0, task.progress))}%`,
                                    }}
                                  />
                                  <span className="relative z-10 flex w-full items-center justify-between gap-1 truncate">
                                    <span className="truncate">{task.title}</span>
                                    <span className="shrink-0 text-[10px] opacity-90">
                                      {task.progress}%
                                    </span>
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] text-slate-600">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                ממתין
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                בתהליך
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                בסיכון
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                הושלם
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-0.5 bg-rose-500" />
                קו היום ({todayIso})
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              לחץ על כל משימה לעריכת מועדים, בעלי תפקידים וספקים
            </span>
          </div>
        </div>
      )}

      {/* Fullscreen Task Editor Modal */}
      <TaskEditorModal
        isOpen={editorOpen}
        project={project}
        task={editingTask}
        allTasks={tasks}
        crmContacts={crmContacts}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveTask}
        onDelete={onDeleteTask}
        onCreateSupplierInCrm={onCreateSupplierInCrm}
        onSendReminder={onSendReminder}
        onDraftBrief={onDraftBrief}
      />
    </div>
  );
};

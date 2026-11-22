import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookmarkPlus,
  Calendar,
  CheckCircle2,
  FolderKanban,
  GanttChartSquare,
  Globe,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { PROJECT_STATUS_LABELS } from '../config';
import { useProjects } from '../hooks/useProjects';
import type { ProjectStatus, ProjectViewTab } from '../types';
import { GanttChartView } from '../components/GanttChartView';
import { MarketingTrackPanel } from '../components/MarketingTrackPanel';
import { CommunitySyncPanel } from '../components/CommunitySyncPanel';
import { ProjectAiCopilotPanel } from '../components/ProjectAiCopilotPanel';
import { ProjectUploaderModal } from '../components/ProjectUploaderModal';

const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-indigo-50 text-indigo-700',
  at_risk: 'bg-rose-50 text-rose-700',
  completed: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-200 text-slate-600',
};

const TABS: Array<{ id: ProjectViewTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'סקירה דו-מסלולית', icon: LayoutDashboard },
  { id: 'gantt', label: 'צד תפעולי וגאנט', icon: GanttChartSquare },
  { id: 'marketing', label: 'צד שיווקי ודף נחיתה', icon: Megaphone },
  { id: 'community', label: 'סנכרון CRM וקהילה', icon: Users },
  { id: 'ai', label: 'סוכן AI פעיל', icon: Sparkles },
];

export const KosProjectsView: React.FC = () => {
  const {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    activeTab,
    setActiveTab,
    tasks,
    blueprints,
    crmContacts,
    communities,
    loading,
    tasksLoading,
    aiLoading,
    syncLoading,
    error,
    clearError,
    aiWorkplanSuggestion,
    aiRiskReport,
    clearAiWorkplanSuggestion,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
    batchCreateTasks,
    cloneFromBlueprint,
    saveCurrentProjectAsBlueprint,
    exportGanttToExcel,
    syncMarketingAssets,
    syncSupplierToCrm,
    linkCommunity,
    sendVendorReminder,
    runAiWorkplan,
    applyAiWorkplan,
    runAiRiskAnalysis,
    runAiVendorBrief,
    refreshExternalData,
    projectStats,
  } = useProjects();

  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [savingBlueprint, setSavingBlueprint] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.clientName || '').toLowerCase().includes(q)
    );
  }, [projects, projectSearch]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveAsBlueprint = async () => {
    if (!selectedProject) return;
    setSavingBlueprint(true);
    try {
      await saveCurrentProjectAsBlueprint(
        `תבנית: ${selectedProject.title}`,
        selectedProject.description || 'תבנית שנשמרה מפרויקט קיים',
        'מותאם אישית'
      );
      showToast('הפרויקט נשמר בהצלחה כתבנית (Blueprint) לשכפול עתידי.');
    } finally {
      setSavingBlueprint(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!window.confirm(`האם למחוק את הפרויקט "${selectedProject.title}" ואת כל המשימות שלו?`)) {
      return;
    }
    await deleteProject(selectedProject.id);
    showToast('הפרויקט נמחק.');
  };

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 pb-24">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {/* Compact Workspace Bar (Headerless Cashwan Aesthetic) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                פרויקטים ותוכנית עבודה
              </h1>
              <p className="text-xs text-slate-500">
                ניהול מסלול שיווקי (דפי נחיתה והרשמה) ומסלול תפעולי (גאנט, זמנים וספקים) בסנכרון CRM וקהילות
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUploaderOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>פרויקט חדש / העלאת נתונים</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span className="inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </span>
            <button type="button" onClick={clearError} className="text-xs font-bold underline">
              סגור
            </button>
          </div>
        )}

        {toastMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Projects Selector Sidebar */}
          <aside className="space-y-3 lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="חיפוש פרויקט או לקוח..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-9 pl-3 text-xs focus:border-indigo-400 focus:bg-white focus:outline-none"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                  {projects.length === 0
                    ? 'אין עדיין פרויקטים במערכת.'
                    : 'לא נמצאו פרויקטים תואמים.'}
                </div>
              ) : (
                <div className="max-h-[65vh] space-y-2 overflow-y-auto">
                  {filteredProjects.map((proj) => {
                    const isActive = proj.id === selectedProjectId;
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={`w-full rounded-xl border p-3 text-right transition ${
                          isActive
                            ? 'border-indigo-500 bg-indigo-50/70 shadow-sm'
                            : 'border-slate-100 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate text-sm font-bold text-slate-900">
                            {proj.title}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              PROJECT_STATUS_STYLES[proj.status]
                            }`}
                          >
                            {PROJECT_STATUS_LABELS[proj.status]}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="truncate">{proj.clientName || 'לקוח כללי'}</span>
                          <span dir="ltr">{proj.targetEndDate}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3 text-indigo-500" />
                            {proj.marketing.registrationCount || 0} נרשמים
                          </span>
                          {proj.marketing.landingPageSlug && (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <Globe className="h-3 w-3" />
                              דף פעיל
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Active Project Workspace */}
          <main className="space-y-5 lg:col-span-9">
            {!selectedProject ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
                <FolderKanban className="mx-auto mb-3 h-12 w-12 text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900">
                  התחל לנהל פרויקטים בצורה דו-מסלולית
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  העלה קובץ Excel, בחר תבנית מוכנה או הדבק בריף לסוכן ה-AI כדי להפיק דף נחיתה שיווקי עם הרשמה וגאנט תפעולי מלא.
                </p>
                <button
                  type="button"
                  onClick={() => setUploaderOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>הקם פרויקט ראשון</span>
                </button>
              </div>
            ) : (
              <>
                {/* Selected Project Summary Strip */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-lg font-extrabold text-slate-900">
                          {selectedProject.title}
                        </h2>
                        <select
                          value={selectedProject.status}
                          onChange={(e) =>
                            updateProject(selectedProject.id, {
                              status: e.target.value as ProjectStatus,
                            })
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold focus:outline-none ${
                            PROJECT_STATUS_STYLES[selectedProject.status]
                          }`}
                        >
                          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((st) => (
                            <option key={st} value={st}>
                              {PROJECT_STATUS_LABELS[st]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>לקוח: <strong className="text-slate-800">{selectedProject.clientName}</strong></span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span dir="ltr">
                            {selectedProject.startDate} — {selectedProject.targetEndDate}
                          </span>
                        </span>
                        {selectedProject.communityGroupName && (
                          <span className="inline-flex items-center gap-1 text-indigo-600">
                            <Users className="h-3.5 w-3.5" />
                            קהילה: {selectedProject.communityGroupName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={savingBlueprint}
                        onClick={handleSaveAsBlueprint}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {savingBlueprint ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <BookmarkPlus className="h-3.5 w-3.5" />
                        )}
                        <span>שמור כתבנית</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteProject}
                        className="rounded-xl border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50"
                        title="מחק פרויקט"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="mt-5 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      const active = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                            active
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Marketing Track Summary */}
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700">
                            <Megaphone className="h-4 w-4" />
                            <span>הצד השיווקי — דפי נחיתה והרשמה</span>
                          </span>
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                            {selectedProject.marketing.landingPageSlug ? 'פעיל' : 'טיוטה'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {selectedProject.marketing.headline || selectedProject.title}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5">
                          <div>
                            <div className="text-[11px] text-slate-500">נרשמים שנאספו</div>
                            <div className="mt-0.5 text-xl font-extrabold text-slate-900">
                              {selectedProject.marketing.registrationCount || 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-500">סנכרון קהילה</div>
                            <div className="mt-0.5 text-sm font-bold text-slate-800">
                              {selectedProject.communityGroupName || 'לא מחובר'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('marketing')}
                        className="mt-5 w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                      >
                        נהל דף נחיתה וטופס הרשמה
                      </button>
                    </div>

                    {/* Operational Track Summary */}
                    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">
                            <GanttChartSquare className="h-4 w-4" />
                            <span>הצד התפעולי — גאנט, מועדים וספקים</span>
                          </span>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {projectStats.completionPercent}% הושלם
                          </span>
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all"
                            style={{ width: `${projectStats.completionPercent}%` }}
                          />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3.5 text-center">
                          <div>
                            <div className="text-[11px] text-slate-500">משימות</div>
                            <div className="text-lg font-extrabold text-slate-900">
                              {projectStats.totalTasks}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-500">בסיכון</div>
                            <div className="text-lg font-extrabold text-rose-600">
                              {projectStats.atRiskTasks}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-500">אבני דרך</div>
                            <div className="text-lg font-extrabold text-amber-600">
                              {projectStats.milestonesCount}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('gantt')}
                        className="mt-5 w-full rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        פתח תרשים גאנט וספקים
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'gantt' && (
                  tasksLoading ? (
                    <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
                      <Loader2 className="h-7 w-7 animate-spin" />
                    </div>
                  ) : (
                    <GanttChartView
                      project={selectedProject}
                      tasks={tasks}
                      crmContacts={crmContacts}
                      onCreateTask={async (data) => {
                        await createTask(data, selectedProject.id);
                      }}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onCreateSupplierInCrm={async (data) => {
                        const res = await syncSupplierToCrm(
                          {
                            name: data.name,
                            role: data.role,
                            phone: data.phone,
                            email: data.email,
                            isSupplier: true,
                          },
                          selectedProject.title
                        );
                        if (!res.success) return null;
                        return {
                          id: res.contactId || `sup_${Date.now()}`,
                          name: data.name,
                          phone: data.phone,
                          email: data.email,
                          role: data.role,
                        };
                      }}
                      onSendReminder={async (supplier, message) => {
                        const res = await sendVendorReminder({
                          phone: supplier.phone,
                          email: supplier.email,
                          message,
                          subject: `תזכורת מפרויקט ${selectedProject.title}`,
                        });
                        return res.success;
                      }}
                      onDraftBrief={async (task, supplierName) => {
                        const res = await runAiVendorBrief(task, supplierName, selectedProject.id);
                        return res.briefText || res.error || '';
                      }}
                      onExportExcel={() => exportGanttToExcel(selectedProject.id)}
                    />
                  )
                )}

                {activeTab === 'marketing' && (
                  <MarketingTrackPanel
                    project={selectedProject}
                    syncLoading={syncLoading}
                    onUpdateProject={updateProject}
                    onSyncMarketingAssets={syncMarketingAssets}
                    onOpenAiTab={() => setActiveTab('ai')}
                  />
                )}

                {activeTab === 'community' && (
                  <CommunitySyncPanel
                    project={selectedProject}
                    crmContacts={crmContacts}
                    communities={communities}
                    onUpdateProject={updateProject}
                    onLinkCommunity={linkCommunity}
                    onRefreshExternalData={refreshExternalData}
                  />
                )}

                {activeTab === 'ai' && (
                  <ProjectAiCopilotPanel
                    project={selectedProject}
                    tasks={tasks}
                    aiLoading={aiLoading}
                    aiWorkplanSuggestion={aiWorkplanSuggestion}
                    aiRiskReport={aiRiskReport}
                    onRunAiWorkplan={runAiWorkplan}
                    onApplyAiWorkplan={applyAiWorkplan}
                    onClearAiWorkplan={clearAiWorkplanSuggestion}
                    onRunAiRiskAnalysis={runAiRiskAnalysis}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Fullscreen New Project / Data Uploader Modal */}
      <ProjectUploaderModal
        isOpen={uploaderOpen}
        blueprints={blueprints}
        aiLoading={aiLoading}
        onClose={() => setUploaderOpen(false)}
        onCreateProject={createProject}
        onBatchCreateTasks={batchCreateTasks}
        onCloneBlueprint={cloneFromBlueprint}
        onRunAiWorkplan={runAiWorkplan}
        onApplyAiWorkplan={applyAiWorkplan}
      />
    </div>
  );
};

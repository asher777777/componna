import React, { useState } from 'react';
import { PageBuilderConfig, ViewportMode, BuilderTab } from '../types/pageBuilder.types';
import {
  Compass,
  Save,
  Sun,
  Moon,
  Info,
  X,
  Plus,
  Eye,
  Edit3,
  Columns,
  Layers,
  Settings2,
  Globe,
  Share2,
  MapPin,
  Film,
  Sparkles,
  LayoutTemplate,
  Lightbulb,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { clsx } from 'clsx';

interface PageBuilderFloatingNavProps {
  config: PageBuilderConfig;
  activeTab: BuilderTab;
  setActiveTab: (tab: BuilderTab) => void;
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;
  onSave: () => void;
  isSaving?: boolean;
  onOpenSettings: () => void;
  onOpenAddSection: () => void;
  onOpenAiBuilder?: () => void;
  onOpenBlueprints?: () => void;
  onOpenMarketingIdeas?: () => void;
  onOpenPublish?: () => void;
  onOpenShortener?: () => void;
  onOpenGeo?: () => void;
  onGoToPagesList?: () => void;
  onConvertToVideo?: () => void;
  onSyncBrandDna?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  tenantId?: string;
  brandPrimaryColor?: string;
}

export const PageBuilderFloatingNav: React.FC<PageBuilderFloatingNavProps> = ({
  config,
  activeTab,
  setActiveTab,
  viewportMode,
  setViewportMode,
  onSave,
  isSaving = false,
  onOpenSettings,
  onOpenAddSection,
  onOpenAiBuilder,
  onOpenBlueprints,
  onOpenMarketingIdeas,
  onOpenPublish,
  onOpenShortener,
  onOpenGeo,
  onGoToPagesList,
  onConvertToVideo,
  onSyncBrandDna,
  isDarkMode,
  onToggleDarkMode,
  tenantId,
  brandPrimaryColor = '#6366f1',
}) => {
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [isInfoBarOpen, setIsInfoBarOpen] = useState(false);

  return (
    <>
      {/* 1. FLOATING ACTION DOCK (תפריט צף קומפקטי ללא שום הדר סטטי) */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none animate-in fade-in duration-300"
        dir="rtl"
      >
        <div className="bg-white/90 dark:bg-[#0c0c0e]/95 border border-slate-200/80 dark:border-slate-800/90 backdrop-blur-2xl px-4 py-2 rounded-full shadow-2xl shadow-indigo-500/10 dark:shadow-black/70 flex items-center gap-2 sm:gap-3 transition-all">
          {/* Main Navigation Trigger - Opens 100% Full-Screen Nav Modal */}
          <button
            type="button"
            onClick={() => setIsNavModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 shadow-md transition-all group cursor-pointer"
            title="פתח תפריט ניווט ופעולות מהירות"
          >
            <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xs font-bold hidden sm:inline">ניווט ופעולות</span>
          </button>

          {/* Quick Save */}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative cursor-pointer"
            title="שמירה מהירה"
          >
            <Save className={clsx('w-4 h-4', isSaving && 'animate-spin text-amber-400')} />
          </button>

          {/* Day / Night Mode Toggle (Day Mode is default) */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
            title={isDarkMode ? 'מעבר למצב יום' : 'מעבר למצב לילה'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Small Discrete Info Icon (Opens hidden info bar up to 20% screen height) */}
          <button
            type="button"
            onClick={() => setIsInfoBarOpen(!isInfoBarOpen)}
            className={clsx(
              'p-2 rounded-full transition-colors cursor-pointer',
              isInfoBarOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
            )}
            title="מידע על הרכיב (סרגל מוסתר)"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. HIDDEN INFO BAR (גובה עד 20% מגובה המסך בדיוק לפי כלל ה') */}
      {isInfoBarOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 max-h-[20vh] h-[20vh] z-30 bg-white/95 dark:bg-[#0c0c0e]/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-2xl p-4 overflow-y-auto animate-in slide-in-from-bottom-6 duration-200 select-none"
          dir="rtl"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 h-full">
            <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold">טננט פעיל</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{tenantId || 'ראשי'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold">כמות אזורים</span>
                <span className="font-bold text-slate-900 dark:text-white">{config.sectionOrder.length} אזורים</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold">סטטוס דף</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {config.published ? 'פורסם' : 'טיוטה פעילה'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsInfoBarOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="סגור סרגל מידע"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. 100% FULL-SCREEN NAVIGATION & QUICK ACTIONS MODAL (לפי כלל ז' וט') */}
      {isNavModalOpen && (
        <div
          className="fixed inset-0 z-50 w-screen h-screen bg-[#09090b] text-white flex flex-col p-6 animate-in fade-in duration-200"
          dir="rtl"
        >
          {/* Header with clear close button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ניווט ופעולות מהירות</h2>
                <p className="text-xs text-slate-400 mt-0.5">מעבר בין מצבי עבודה, פעולות דף ופרסום</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNavModalOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <span className="text-xs font-bold">סגור</span>
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Modal Body - 100% Responsive Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar max-w-6xl mx-auto w-full py-8 flex flex-col gap-8">
            {/* Workspace Modes (Tabs) */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">מצב סביבת עבודה</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'edit', label: 'עריכה מלאה', icon: Edit3, desc: 'עריכת טפסים ותוכן' },
                  { id: 'split', label: 'עריכה מפוצלת', icon: Columns, desc: 'תצוגה מקדימה במקביל' },
                  { id: 'preview', label: 'תצוגה מקדימה', icon: Eye, desc: 'צפייה מלאה בדף' },
                  { id: 'reorder', label: 'סידור שכבות', icon: Layers, desc: 'שינוי סדר אזורים' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id as BuilderTab);
                        setIsNavModalOpen(false);
                      }}
                      className={clsx(
                        'p-4 rounded-2xl border text-right transition-all flex flex-col gap-2 cursor-pointer',
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/40 text-white ring-1 ring-amber-500/30'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                      )}
                    >
                      <Icon className={clsx('w-5 h-5', isActive ? 'text-amber-400' : 'text-slate-400')} />
                      <div>
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Viewport Resolution */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">רזולוציית תצוגה מקדימה</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'desktop', label: 'מחשב (דסקטופ)', icon: Monitor },
                  { id: 'tablet', label: 'טאבלט (מסך בינוני)', icon: Tablet },
                  { id: 'mobile', label: 'נייד (סמארטפון)', icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = viewportMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setViewportMode(item.id as ViewportMode);
                        setIsNavModalOpen(false);
                      }}
                      className={clsx(
                        'p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer',
                        isActive
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                      )}
                    >
                      <Icon className={clsx('w-5 h-5', isActive ? 'text-indigo-400' : 'text-slate-400')} />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">פעולות מהירות וכלים</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNavModalOpen(false);
                    onOpenAddSection();
                  }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-white">הוסף אזור חדש</span>
                  <span className="text-[11px] text-slate-400">קטלוג אזורים ו-Bento</span>
                </button>


                {onSyncBrandDna && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onSyncBrandDna();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <Wand2 className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-bold text-white">רענן לפי מיתוג</span>
                    <span className="text-[11px] text-slate-400">סנכרון שפת ממשק וכותרות</span>
                  </button>
                )}
                {onOpenBlueprints && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onOpenBlueprints();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-bold text-white">בלופרינטס מוכנים</span>
                    <span className="text-[11px] text-slate-400">תבניות עמוד 2026</span>
                  </button>
                )}

                {onOpenAiBuilder && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onOpenAiBuilder();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-bold text-white">מחולל עמוד ב-AI</span>
                    <span className="text-[11px] text-slate-400">יצירה מיידית מפקודה</span>
                  </button>
                )}

                {onOpenMarketingIdeas && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onOpenMarketingIdeas();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-white">רעיונות שיווקיים</span>
                    <span className="text-[11px] text-slate-400">שיפור יחסי המרה</span>
                  </button>
                )}

                {onOpenPublish && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onOpenPublish();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">פרסום ודומיין</span>
                    <span className="text-[11px] text-slate-400">העלאה לאוויר</span>
                  </button>
                )}

                {onOpenShortener && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onOpenShortener();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <Share2 className="w-5 h-5 text-sky-400" />
                    <span className="text-sm font-bold text-white">קיצור קישור</span>
                    <span className="text-[11px] text-slate-400">שיתוף מהיר</span>
                  </button>
                )}

                {onOpenGeo && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onOpenGeo();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <MapPin className="w-5 h-5 text-rose-400" />
                    <span className="text-sm font-bold text-white">SEO מקומי ו-GEO</span>
                    <span className="text-[11px] text-slate-400">קידום לפי מיקומים</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsNavModalOpen(false);
                    onOpenSettings();
                  }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                >
                  <Settings2 className="w-5 h-5 text-slate-300" />
                  <span className="text-sm font-bold text-white">הגדרות עמוד</span>
                  <span className="text-[11px] text-slate-400">SEO וקוד מותאם</span>
                </button>

                {onConvertToVideo && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onConvertToVideo();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/40 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <Film className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-bold text-white">המרה לווידאו</span>
                    <span className="text-[11px] text-slate-400">יצירת רילס וסטורי</span>
                  </button>
                )}

                {onGoToPagesList && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNavModalOpen(false);
                      onGoToPagesList();
                    }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 text-right flex flex-col gap-2 transition-all cursor-pointer"
                  >
                    <Layers className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-bold text-white">כל העמודים</span>
                    <span className="text-[11px] text-slate-400">חזרה ללוח בקרה</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Save,
  Plus,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit3,
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { useKosDesBuilder } from '../context/KosDesBuilderContext';
import { DashboardSection } from '../types';
import {
  DashboardHeaderSection,
  DashboardStatsSection,
  DashboardTableSection,
  DashboardQuickActionsSection,
  DashboardFloatingDock,
  CommandMatrixSection,
  DashboardSlotWidgetSection,
  DashboardSectionEditor,
  DashboardSectionPickerModal,
} from '../components';

export interface KosDesBuilderViewProps {
  tenantName?: string;
}

export const KosDesBuilderView: React.FC<KosDesBuilderViewProps> = ({ tenantName = 'דייר מערכת' }) => {
  const {
    currentDashboard,
    savedDashboards,
    selectedSectionId,
    previewDevice,
    isLoading,
    isSaving,
    error,
    setSelectedSectionId,
    setPreviewDevice,
    updateDashboardTitle,
    addSection,
    removeSection,
    toggleSectionVisibility,
    toggleSectionMobileHidden,
    moveSection,
    saveCurrentDashboard,
    selectDashboard,
    createNewDashboard,
  } = useKosDesBuilder();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleSave = async () => {
    const success = await saveCurrentDashboard();
    if (success) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    }
  };

  const renderSectionContent = (sec: DashboardSection) => {
    switch (sec.type) {
      case 'header':
        return <DashboardHeaderSection config={sec.config as any} tenantName={tenantName} />;
      case 'stats':
        return <DashboardStatsSection config={sec.config as any} />;
      case 'table':
        return <DashboardTableSection config={sec.config as any} />;
      case 'quickActions':
        return <DashboardQuickActionsSection config={sec.config as any} />;
      case 'floatingDock':
        return <DashboardFloatingDock config={sec.config as any} />;
      case 'commandMatrix':
        return <CommandMatrixSection config={sec.config as any} />;
      case 'slotWidget':
        return <DashboardSlotWidgetSection config={sec.config as any} />;
      default:
        return (
          <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-500">
            אזור לא מוכר: {sec.type}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3" dir="rtl">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
          טוען את בונה לוחות הבקרה...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-white" dir="rtl">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Dashboard Title & Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentDashboard.title}
                  onChange={(e) => updateDashboardTitle(e.target.value)}
                  className="font-black text-base sm:text-lg bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition px-1 -mr-1"
                />
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  טננט מנג׳ר
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono" dir="ltr">
                {currentDashboard.slug} ({currentDashboard.sections.length} אזורים)
              </span>
            </div>
          </div>

          {/* Dashboards Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={currentDashboard.id}
              onChange={(e) => selectDashboard(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {savedDashboards.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} {d.isDefault ? '(ראשי)' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={createNewDashboard}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="לוח בקרה חדש"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Device & Action Controls */}
          <div className="flex items-center gap-3">
            {/* Desktop / Mobile Switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">דסקטופ</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">מובייל</span>
              </button>
            </div>

            {/* Add Section Button */}
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>הוסף אזור</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'שומר...' : 'שמור שינויים'}</span>
            </button>
          </div>
        </div>

        {/* Notices */}
        {saveSuccessNotice && (
          <div className="max-w-7xl mx-auto mt-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>לוח הבקרה נשמר בהצלחה תחת טננט מנג׳ר!</span>
          </div>
        )}

        {error && (
          <div className="max-w-7xl mx-auto mt-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </header>

      {/* Main Canvas Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {previewDevice === 'mobile' ? (
          /* Mobile Mockup Wrapper */
          <div className="max-w-sm mx-auto my-6 bg-slate-900 p-3 rounded-[44px] shadow-2xl border-4 border-slate-800">
            {/* Top speaker notch */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

            {/* Mobile Screen Container */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] overflow-hidden p-3 space-y-4 max-h-[75vh] overflow-y-auto">
              {currentDashboard.sections
                .filter((s) => s.visible && !s.mobileHidden)
                .map((sec) => (
                  <div key={sec.id} className="relative group">
                    {renderSectionContent(sec)}
                  </div>
                ))}
            </div>

            {/* Bottom home bar */}
            <div className="w-20 h-1 bg-slate-700 rounded-full mx-auto mt-3" />
          </div>
        ) : (
          /* Desktop Grid Canvas */
          <div className="space-y-6">
            {currentDashboard.sections.map((sec, idx) => {
              const isSelected = selectedSectionId === sec.id;
              const isFirst = idx === 0;
              const isLast = idx === currentDashboard.sections.length - 1;

              return (
                <div
                  key={sec.id}
                  className={`group relative rounded-3xl transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 shadow-lg'
                      : 'hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-700'
                  } ${!sec.visible ? 'opacity-40 grayscale-75' : ''}`}
                >
                  {/* Floating Action Toolbar on Hover/Select */}
                  <div className="absolute -top-3.5 left-4 z-20 flex items-center gap-1 bg-slate-900 text-white px-2.5 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shadow-lg">
                    <span className="text-[10px] text-indigo-400 font-mono ml-1">
                      {sec.type}
                    </span>

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(sec.id, 'up');
                      }}
                      className="p-1 hover:text-indigo-400 disabled:opacity-30 cursor-pointer"
                      title="הזז למעלה"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(sec.id, 'down');
                      }}
                      className="p-1 hover:text-indigo-400 disabled:opacity-30 cursor-pointer"
                      title="הזז למטה"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSectionVisibility(sec.id);
                      }}
                      className="p-1 hover:text-indigo-400 cursor-pointer"
                      title={sec.visible ? 'הסתר אזור' : 'הצג אזור'}
                    >
                      {sec.visible ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </button>

                    {/* Toggle Mobile Hidden */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSectionMobileHidden(sec.id);
                      }}
                      className={`p-1 cursor-pointer ${
                        sec.mobileHidden ? 'text-amber-400' : 'hover:text-indigo-400'
                      }`}
                      title={sec.mobileHidden ? 'מוסתר במובייל' : 'מוצג במובייל'}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Section */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSectionId(sec.id);
                      }}
                      className="p-1 hover:text-indigo-400 cursor-pointer"
                      title="ערוך פרמטרים"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(sec.id);
                      }}
                      className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                      title="מחק אזור"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Section Content */}
                  <div
                    onClick={() => setSelectedSectionId(sec.id)}
                    className="cursor-pointer"
                  >
                    {renderSectionContent(sec)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Section Editor Drawer */}
      <DashboardSectionEditor />

      {/* Add Section Picker Modal */}
      <DashboardSectionPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(type, title) => addSection(type, title)}
      />
    </div>
  );
};

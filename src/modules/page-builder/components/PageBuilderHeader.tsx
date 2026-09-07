import React from 'react';
import { PageBuilderConfig, ViewportMode, BuilderTab } from '../types/pageBuilder.types';
import { PageBuilderButton } from '../ui/PageBuilderButton';
import {
  Save,
  Eye,
  Edit3,
  Columns,
  ListOrdered,
  Settings2,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Download,
  Upload,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

interface PageBuilderHeaderProps {
  config: PageBuilderConfig;
  activeTab: BuilderTab;
  setActiveTab: (tab: BuilderTab) => void;
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;
  onSave: () => void;
  isSaving?: boolean;
  onOpenSettings: () => void;
  onOpenAddSection: () => void;
  onExportJson?: () => void;
  onImportJson?: () => void;
}

export const PageBuilderHeader: React.FC<PageBuilderHeaderProps> = ({
  config,
  activeTab,
  setActiveTab,
  viewportMode,
  setViewportMode,
  onSave,
  isSaving = false,
  onOpenSettings,
  onOpenAddSection,
  onExportJson,
  onImportJson,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0c0e]/95 border-b border-slate-800 backdrop-blur-xl px-4 sm:px-6 py-3 select-none" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Page Title and Quick Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white">{config.pageTitle || 'עמוד ללא שם'}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700" dir="ltr">
                /{config.slug || 'home'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">יוצר עמודים מודולרי (Page Builder)</span>
          </div>
        </div>

        {/* Center: Main View / Editor Tabs */}
        <div className="hidden md:flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'edit'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>עריכת אזורים</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'split'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>מסך מפוצל</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>תצוגה מקדימה</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reorder')}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'reorder'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>סידור שכבות</span>
          </button>
        </div>

        {/* Center-Right: Device Viewport Controls (Visible on Preview / Split) */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="hidden lg:flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={clsx(
                'p-1.5 rounded-xl transition-all',
                viewportMode === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              )}
              title="תצוגת מחשב (Desktop)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('tablet')}
              className={clsx(
                'p-1.5 rounded-xl transition-all',
                viewportMode === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              )}
              title="תצוגת טאבלט (Tablet)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={clsx(
                'p-1.5 rounded-xl transition-all',
                viewportMode === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              )}
              title="תצוגת סמארטפון (Mobile)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Side: Actions (Settings, Add Section, Save) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
            title="הגדרות עמוד ו-SEO"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {onExportJson && (
            <button
              type="button"
              onClick={onExportJson}
              className="hidden sm:flex p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
              title="ייצוא קובץ JSON"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <PageBuilderButton
            size="sm"
            variant="gradient"
            onClick={onSave}
            disabled={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            {isSaving ? 'שומר...' : 'שמור שינויים'}
          </PageBuilderButton>
        </div>
      </div>
    </header>
  );
};

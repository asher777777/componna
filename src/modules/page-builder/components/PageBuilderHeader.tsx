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
  Layers,
  Share2,
  MapPin,
  ArrowRight,
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
  onOpenAiBuilder?: () => void;
  onOpenPublish?: () => void;
  onOpenShortener?: () => void;
  onOpenGeo?: () => void;
  onGoToPagesList?: () => void;
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
  onOpenAiBuilder,
  onOpenPublish,
  onOpenShortener,
  onOpenGeo,
  onGoToPagesList,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0c0e]/95 border-b border-slate-800 backdrop-blur-xl px-4 sm:px-6 py-3 select-none" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Back to Pages + Page Title and Status */}
        <div className="flex items-center gap-3">
          {onGoToPagesList && (
            <button
              type="button"
              onClick={onGoToPagesList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all"
              title="חזרה לכל העמודים"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">כל העמודים</span>
            </button>
          )}

          <div className="text-right">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white max-w-[180px] sm:max-w-xs truncate">
                {config.pageTitle || 'עמוד ללא שם'}
              </h1>
              {config.isHomePage && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  עמוד בית 🏠
                </span>
              )}
              {config.published ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden sm:inline">
                  מפורסם
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline">
                  טיוטה
                </span>
              )}
            </div>
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
            <span>שכבות</span>
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
              title="תצוגת מחשב"
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
              title="תצוגת טאבלט"
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
              title="תצוגת סמארטפון"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Side: Tools & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* AI Page Generator */}
          {onOpenAiBuilder && (
            <button
              type="button"
              onClick={onOpenAiBuilder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition-all hover:scale-105"
              title="יוצר עמודים ב-AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">AI Builder</span>
            </button>
          )}

          {/* Shorten URL & QR */}
          {onOpenShortener && (
            <button
              type="button"
              onClick={onOpenShortener}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
              title="מקצר URL וקוד QR"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* GEO SEO Settings */}
          {onOpenGeo && (
            <button
              type="button"
              onClick={onOpenGeo}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
              title="הגדרות GEO SEO"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
            </button>
          )}

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
            title="הגדרות עמוד ומיתוג"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Publish Button */}
          {onOpenPublish && (
            <button
              type="button"
              onClick={onOpenPublish}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md',
                config.published
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{config.published ? 'מפורסם 🚀' : 'פרסם עמוד'}</span>
            </button>
          )}

          {/* Save Button */}
          <PageBuilderButton
            size="sm"
            variant="gradient"
            onClick={onSave}
            disabled={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            {isSaving ? 'שומר...' : 'שמור'}
          </PageBuilderButton>
        </div>
      </div>
    </header>
  );
};

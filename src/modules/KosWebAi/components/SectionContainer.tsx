import React, { useState } from 'react';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { SectionType } from '../types/pageBuilder.types';
import {
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Smartphone,
  Trash2,
  Copy,
  Edit3,
  Palette,
  LayoutTemplate,
  Monitor,
  Check,
  Sparkles,
  Info,
  BookmarkCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { SectionResolutionVisibilityMenu } from './SectionResolutionVisibilityMenu';
import { SectionDimensionsMenu } from './SectionDimensionsMenu';
import { getResolutionBadgeInfo } from '../utils/resolutionVisibility';
import { SectionDesignLibraryModal } from './SectionDesignLibraryModal';

export interface SectionContainerProps {
  sectionId: string;
  sectionType?: SectionType;
  sectionData?: any;
  title?: string;
  index?: number;
  totalCount?: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleVisibility?: () => void;
  onToggleMobileHidden?: () => void;
  onUpdateSection?: (sectionId: string, updatedData: any) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onAiDesign?: () => void;
  visible?: boolean;
  mobileHidden?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  contentEditorNode?: React.ReactNode;
  previewNode?: React.ReactNode;
  children?: React.ReactNode;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  sectionId,
  sectionType,
  sectionData,
  title,
  index,
  totalCount,
  isOpen,
  onToggleOpen,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onToggleMobileHidden,
  onUpdateSection,
  onDelete,
  onDuplicate,
  onAiDesign,
  visible = true,
  mobileHidden = false,
  isFirst = false,
  isLast = false,
  contentEditorNode,
  previewNode,
  children,
}) => {
  const effectiveType = (sectionType || sectionData?.type || sectionId) as SectionType;
  const regDef = SECTION_REGISTRY[effectiveType];
  const Icon = regDef?.icon || LayoutTemplate;
  const displayTitle = title || regDef?.name || sectionData?.adminTitle || sectionId;

  // Design Library Modal State
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  return (
    <div
      className={clsx(
        'rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm dark:shadow-xl text-right',
        isOpen
          ? 'bg-white dark:bg-slate-900 border-indigo-500/50 shadow-indigo-500/10'
          : 'bg-white/90 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 backdrop-blur-md',
        !visible && 'opacity-60'
      )}
      dir="rtl"
    >
      {/* Header Row */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-4 select-none">
        {/* Left: Section Icon & Name */}
        <div
          onClick={onToggleOpen}
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {displayTitle}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hidden sm:inline">
                {effectiveType}
              </span>
              {sectionData?.stylePreset && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 hidden sm:inline">
                  סגנון: {sectionData.stylePreset}
                </span>
              )}
              {(() => {
                const resBadge = getResolutionBadgeInfo(sectionData || { mobileHidden });
                if (!resBadge.isRestricted) return null;
                return (
                  <span className={clsx("text-[10px] px-2 py-0.5 rounded-full border hidden sm:inline font-bold", resBadge.colorClass)}>
                    {resBadge.label}
                  </span>
                );
              })()}
              {regDef?.description && (
                <div
                  className="relative group/info"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="p-0.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
                    title={regDef.description}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  <div className="hidden group-hover/info:block absolute z-30 right-0 top-full mt-1.5 w-60 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 shadow-2xl pointer-events-none">
                    {regDef.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Public Design Library & Style Expander Modal Button */}
          {onUpdateSection && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDesignModalOpen(true);
              }}
              className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
              title="ספריית עיצובים פומביים ושמירת עיצוב לטננט פומבי"
            >
              <Palette className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden md:inline">עיצובים פומביים</span>
            </button>
          )}

          {onToggleVisibility && (
            <button
              type="button"
              onClick={onToggleVisibility}
              className={clsx(
                'p-2 rounded-xl border transition-colors',
                visible
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400'
              )}
              title={visible ? 'הסתר אזור' : 'הצג אזור'}
            >
              {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}

          {onUpdateSection ? (
            <>
              <SectionResolutionVisibilityMenu
                sectionId={sectionId}
                sectionData={sectionData || { id: sectionId, type: effectiveType, visible, mobileHidden }}
                onUpdateSection={onUpdateSection}
                compact
              />
              <SectionDimensionsMenu
                sectionId={sectionId}
                sectionData={sectionData || { id: sectionId, type: effectiveType, visible, mobileHidden }}
                onUpdateSection={onUpdateSection}
                compact
              />
            </>
          ) : onToggleMobileHidden ? (
            <button
              type="button"
              onClick={onToggleMobileHidden}
              className={clsx(
                'p-2 rounded-xl border transition-colors hidden sm:block',
                mobileHidden
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
              title={mobileHidden ? 'מוסתר במובייל' : 'מוצג במובייל'}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          ) : null}

          {onMoveUp && (
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="העבר למעלה"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="העבר למטה"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block"
              title="שכפל אזור"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          {onAiDesign && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAiDesign(); }}
              className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors hidden sm:block"
              title="עצב מחדש בעזרת AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
              title="מחק אזור"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleOpen}
            className="p-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 transition-colors mr-1"
          >
            <ChevronDown className={clsx('w-4 h-4 transition-transform duration-300', isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60">
          {children || contentEditorNode}
        </div>
      )}

      {/* Section Design Library & Style Expander Modal */}
      {onUpdateSection && isDesignModalOpen && (
        <SectionDesignLibraryModal
          isOpen={isDesignModalOpen}
          onClose={() => setIsDesignModalOpen(false)}
          sectionType={effectiveType}
          currentSectionConfig={sectionData || { id: sectionId, type: effectiveType }}
          onApplyDesign={(updatedConfig) => {
            onUpdateSection(sectionId, updatedConfig);
          }}
        />
      )}
    </div>
  );
};

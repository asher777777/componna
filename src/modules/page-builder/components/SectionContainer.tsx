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
} from 'lucide-react';
import { clsx } from 'clsx';

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
  onDelete?: () => void;
  onDuplicate?: () => void;
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
  onDelete,
  onDuplicate,
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
  const displayTitle = title || sectionData?.title || regDef?.name || sectionId;

  return (
    <div
      className={clsx(
        'rounded-3xl border transition-all duration-200 overflow-hidden shadow-xl text-right',
        isOpen
          ? 'bg-slate-900 border-indigo-500/50 shadow-indigo-500/10'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 backdrop-blur-md',
        !visible && 'opacity-60'
      )}
      dir="rtl"
    >
      {/* Header Row */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 select-none">
        {/* Left: Section Icon & Name */}
        <div
          onClick={onToggleOpen}
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {displayTitle}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline">
                {effectiveType}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {regDef?.description || 'הגדרות ועריכת אזור'}
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onToggleVisibility && (
            <button
              type="button"
              onClick={onToggleVisibility}
              className={clsx(
                'p-2 rounded-xl border transition-colors',
                visible
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              )}
              title={visible ? 'הסתר אזור' : 'הצג אזור'}
            >
              {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}

          {onToggleMobileHidden && (
            <button
              type="button"
              onClick={onToggleMobileHidden}
              className={clsx(
                'p-2 rounded-xl border transition-colors hidden sm:block',
                mobileHidden
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              )}
              title={mobileHidden ? 'מוסתר במובייל' : 'מוצג במובייל'}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          {onMoveUp && (
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 text-slate-300 hover:text-white transition-colors"
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="העבר למטה"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors hidden sm:block"
              title="שכפל אזור"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 transition-colors"
              title="מחק אזור"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleOpen}
            className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition-colors mr-1"
          >
            <ChevronDown className={clsx('w-4 h-4 transition-transform duration-300', isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/60">
          {children || contentEditorNode}
        </div>
      )}
    </div>
  );
};

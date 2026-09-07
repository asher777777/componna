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

interface SectionContainerProps {
  sectionId: string;
  sectionData: any;
  index: number;
  totalCount: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onToggleMobileHidden: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  contentEditorNode: React.ReactNode;
  previewNode: React.ReactNode;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  sectionId,
  sectionData,
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
  contentEditorNode,
  previewNode,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'preview'>('content');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  const sectionType = (sectionData?.type || sectionId) as SectionType;
  const regDef = SECTION_REGISTRY[sectionType];
  const Icon = regDef?.icon || LayoutTemplate;
  const isVisible = sectionData?.visible !== false;
  const isMobileHidden = sectionData?.mobileHidden === true;
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <div
      id={`section-container-${sectionId}`}
      className={clsx(
        'border bg-[#0f172a] rounded-3xl overflow-hidden shadow-xl transition-all duration-300 text-right',
        isOpen ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : 'border-slate-800'
      )}
      dir="rtl"
    >
      {/* Sticky Header for Section */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800/80 sticky top-14 z-20 select-none">
        {/* Left Side: Order Arrows + Name */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5 items-center justify-center p-1 bg-slate-950/60 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              disabled={isFirst}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-opacity cursor-pointer"
              title="הזז למעלה"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              disabled={isLast}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-opacity cursor-pointer"
              title="הזז למטה"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className="flex items-center gap-2.5 text-right font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold text-white block">
                {regDef?.name || sectionId}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block" dir="ltr">
                #{sectionData.anchorId || sectionId}
              </span>
            </div>
            <ChevronDown
              className={clsx(
                'w-4 h-4 text-slate-400 transition-transform duration-300 mr-2',
                isOpen && 'rotate-180 text-indigo-400'
              )}
            />
          </button>
        </div>

        {/* Right Side: Quick Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Visibility */}
          <button
            type="button"
            onClick={onToggleVisibility}
            className={clsx(
              'w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer',
              isVisible
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
            )}
            title={isVisible ? 'מוצג באתר' : 'מוסתר באתר'}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Mobile Hidden */}
          <button
            type="button"
            onClick={onToggleMobileHidden}
            className={clsx(
              'w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer',
              isMobileHidden
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            )}
            title={isMobileHidden ? 'מוסתר בסמארטפון' : 'מוצג בסמארטפון'}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={onDuplicate}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="שכפל אזור"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-all cursor-pointer"
            title="מחק אזור"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accordion Content Drawer */}
      {isOpen && (
        <div className="bg-[#0a0a0e] flex flex-col animate-in slide-in-from-top-2 duration-200">
          {/* Internal Sub-Tabs (Content vs Preview) */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-bold">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer',
                  activeTab === 'content'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>הגדרות תוכן ועיצוב</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer',
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>תצוגה מקדימה לאזור</span>
              </button>
            </div>

            {activeTab === 'preview' && (
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={clsx(
                    'p-1 rounded-lg text-slate-400 hover:text-white transition-colors',
                    previewViewport === 'desktop' && 'bg-indigo-600 text-white'
                  )}
                  title="תצוגת מחשב"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={clsx(
                    'p-1 rounded-lg text-slate-400 hover:text-white transition-colors',
                    previewViewport === 'mobile' && 'bg-indigo-600 text-white'
                  )}
                  title="תצוגת מובייל"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Body Render */}
          <div className="p-5 sm:p-6">
            {activeTab === 'content' ? (
              contentEditorNode
            ) : (
              <div
                className={clsx(
                  'mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 transition-all shadow-inner',
                  previewViewport === 'mobile' ? 'max-w-sm' : 'w-full'
                )}
              >
                {previewNode}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

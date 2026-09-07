import React from 'react';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { SectionType } from '../types/pageBuilder.types';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Smartphone,
  Trash2,
  Copy,
  Plus,
  GripVertical,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PageBuilderButton } from '../ui/PageBuilderButton';

interface SectionNavigatorProps {
  sectionOrder: string[];
  sections: Record<string, any>;
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleVisibility: (id: string) => void;
  onToggleMobileHidden: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onOpenAddModal: () => void;
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
  sectionOrder,
  sections,
  activeSectionId,
  onSelectSection,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onToggleMobileHidden,
  onDeleteSection,
  onDuplicateSection,
  onOpenAddModal,
}) => {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col gap-4 text-right shadow-2xl" dir="rtl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white">שכבות ואזורי העמוד</h3>
          <p className="text-[11px] text-slate-400">ניהול סדר הרכיבים, נראות ומחיקה</p>
        </div>
        <PageBuilderButton
          size="xs"
          variant="primary"
          onClick={onOpenAddModal}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          הוסף אזור
        </PageBuilderButton>
      </div>

      <div className="flex flex-col gap-2 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">
        {sectionOrder.map((sectionId, index) => {
          const sectionData = sections[sectionId] || {};
          const sectionType = (sectionData.type || sectionId) as SectionType;
          const regDef = SECTION_REGISTRY[sectionType];
          const Icon = regDef?.icon || GripVertical;
          const isSelected = activeSectionId === sectionId;
          const isVisible = sectionData.visible !== false;
          const isMobileHidden = sectionData.mobileHidden === true;
          const isFirst = index === 0;
          const isLast = index === sectionOrder.length - 1;

          return (
            <div
              key={sectionId}
              onClick={() => onSelectSection(sectionId)}
              className={clsx(
                'group flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer select-none',
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-md text-white'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
              )}
            >
              {/* Right: Icon + Label */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate text-right">
                  <span className="text-xs font-bold block truncate">
                    {regDef?.name || sectionId}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block truncate" dir="ltr">
                    #{sectionData.anchorId || sectionId}
                  </span>
                </div>
              </div>

              {/* Left: Quick Actions (Move, Hide, Mobile, Duplicate, Delete) */}
              <div
                className="flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Move Up/Down */}
                <button
                  type="button"
                  onClick={() => onMoveUp(index)}
                  disabled={isFirst}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-opacity"
                  title="הזז למעלה"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveDown(index)}
                  disabled={isLast}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-opacity"
                  title="הזז למטה"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleVisibility(sectionId)}
                  className="p-1 text-slate-400 hover:text-white"
                  title={isVisible ? 'הסתר אזור' : 'הצג אזור'}
                >
                  {isVisible ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                  )}
                </button>

                {/* Mobile Hidden Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleMobileHidden(sectionId)}
                  className="p-1 text-slate-400 hover:text-white"
                  title={isMobileHidden ? 'מוסתר בנייד' : 'מוצג בנייד'}
                >
                  <Smartphone
                    className={clsx('w-3.5 h-3.5', isMobileHidden ? 'text-rose-400' : 'text-slate-400')}
                  />
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => onDuplicateSection(sectionId)}
                  className="p-1 text-slate-400 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="שכפל אזור"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onDeleteSection(sectionId)}
                  className="p-1 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="מחק אזור"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

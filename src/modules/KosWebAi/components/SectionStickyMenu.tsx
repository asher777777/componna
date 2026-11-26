import React, { useState, useRef, useEffect } from 'react';
import { Pin, ArrowUpToLine, ArrowDownToLine, Minus, Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { SectionStickyPosition } from '../types/pageBuilder.types';

export interface SectionStickyMenuProps {
  sectionId: string;
  sectionData: any;
  onUpdateSection?: (sectionId: string, updatedData: any) => void;
  compact?: boolean;
}

export const STICKY_OPTIONS: {
  id: SectionStickyPosition;
  label: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'none',
    label: 'רגיל (ללא הצמדה)',
    badge: 'ברירת מחדל',
    desc: 'האזור נגלל כרגיל יחד עם שאר העמוד',
    icon: Minus,
  },
  {
    id: 'top',
    label: 'הדבק למעלה',
    badge: 'Sticky Top',
    desc: 'האזור נדבק לראש המסך בזמן גלילה',
    icon: ArrowUpToLine,
  },
  {
    id: 'bottom',
    label: 'הדבק למטה',
    badge: 'Sticky Bottom',
    desc: 'האזור נדבק לתחתית המסך בזמן גלילה',
    icon: ArrowDownToLine,
  },
];

export function getSectionStickyPosition(sectionData?: any): SectionStickyPosition {
  const pos = sectionData?.stickyPosition;
  if (pos === 'top' || pos === 'bottom') return pos;
  return 'none';
}

export function getSectionStickyClasses(
  stickyPosition: SectionStickyPosition,
  isEditing: boolean = false
): string {
  switch (stickyPosition) {
    case 'top':
      return isEditing ? 'sticky top-0 z-30' : 'sticky top-0 z-40';
    case 'bottom':
      return isEditing ? 'sticky bottom-0 z-30' : 'sticky bottom-0 z-40';
    case 'none':
    default:
      return '';
  }
}

export const SectionStickyMenu: React.FC<SectionStickyMenuProps> = ({
  sectionId,
  sectionData,
  onUpdateSection,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPosition = getSectionStickyPosition(sectionData);
  const activeOption = STICKY_OPTIONS.find((o) => o.id === currentPosition) || STICKY_OPTIONS[0];
  const ActiveIcon = currentPosition === 'none' ? Pin : activeOption.icon;

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSelectSticky = (position: SectionStickyPosition) => {
    if (!onUpdateSection) return;
    onUpdateSection(sectionId, {
      ...sectionData,
      stickyPosition: position,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-1.5 rounded-xl border transition-all cursor-pointer select-none',
          compact ? 'p-1.5' : 'px-2 sm:px-2.5 py-1.5 text-xs',
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
            : currentPosition !== 'none'
              ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
        )}
        title={`הצמדת אזור: ${activeOption.label} (לחץ לשינוי)`}
      >
        <ActiveIcon
          className={clsx(
            'w-3.5 h-3.5',
            isOpen ? 'text-white' : currentPosition !== 'none' ? 'text-amber-300' : 'text-indigo-400'
          )}
        />
        {!compact && currentPosition !== 'none' && (
          <span className="font-bold text-xs hidden sm:inline">
            {activeOption.label}
          </span>
        )}
        <ChevronDown
          className={clsx(
            'w-3 h-3 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-white'
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 sm:right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#0b0f19] border border-slate-700 p-2 shadow-2xl z-50 text-right animate-in fade-in zoom-in-95 duration-150"
          dir="rtl"
          style={{ backgroundColor: '#0b0f19' }}
        >
          <div className="flex items-center justify-between px-2 py-1.5 mb-1.5 border-b border-slate-800">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-indigo-400" />
              <span>הצמדת אזור</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
              {activeOption.label}
            </span>
          </div>

          <div className="space-y-1">
            {STICKY_OPTIONS.map((opt) => {
              const isSelected = opt.id === currentPosition;
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectSticky(opt.id)}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2.5 p-2 rounded-xl text-xs transition-all text-right cursor-pointer',
                    isSelected
                      ? 'bg-indigo-600/30 text-white font-bold border border-indigo-500/60 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={clsx(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      )}
                    >
                      <OptIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col text-right min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">{opt.label}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {opt.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate">{opt.desc}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

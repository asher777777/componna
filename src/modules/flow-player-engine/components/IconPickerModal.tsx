import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Sparkles, Check } from 'lucide-react';
import {
  EXTENSIVE_ICON_LIST,
  CATEGORY_LABELS,
  IconCategory,
  PremiumIconDef,
  PremiumVectorIcon,
} from '../utils/premiumIcons';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconId: string) => void;
  selectedIconId?: string;
  title?: string;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
  selectedIconId,
  title = 'בחר אייקון וקטורי יוקרתי',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IconCategory>('all');

  const filteredIcons = useMemo(() => {
    return EXTENSIVE_ICON_LIST.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesLabel = item.label.toLowerCase().includes(query);
        const matchesAliases = item.aliases.some((a) => a.toLowerCase().includes(query));
        return matchesId || matchesLabel || matchesAliases;
      }

      return true;
    });
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(251,191,36,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-xs text-amber-400 font-normal bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {filteredIcons.length} אייקונים
                </span>
              </h3>
              <p className="text-xs text-slate-400">בחר אייקון וקטורי חד ברזולוציה גבוהה (Lucide React)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש אייקון לפי שם, קטגוריה או מילת מפתח (כסף, מיקרופון, קניות, AI...)"
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                נקה
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(Object.keys(CATEGORY_LABELS) as IconCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-4 overflow-y-auto max-h-[55vh] grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {filteredIcons.map((item) => {
            const isSelected =
              selectedIconId === item.id ||
              (selectedIconId && item.aliases.includes(selectedIconId));
            const IconComp = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectIcon(item.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer relative ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] ring-2 ring-amber-400/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-amber-400/60 hover:bg-slate-900 hover:scale-105'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}

                <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center group-hover:border-amber-400/50 transition">
                  <IconComp className="w-5 h-5 text-amber-400 group-hover:scale-115 transition-transform" />
                </div>

                <span className="text-[11px] font-semibold text-slate-200 group-hover:text-amber-300 text-center truncate w-full">
                  {item.label}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {item.id}
                </span>
              </button>
            );
          })}

          {filteredIcons.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-500">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-xs">לא נמצאו אייקונים התואמים לחיפוש "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400">
          לחיצה על אייקון תחיל אותו מיד על הכרטיסייה / הכפתור
        </div>
      </div>
    </div>,
    document.body
  );
};

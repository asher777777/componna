import React, { useState } from 'react';
import {
  LUXURY_ICONS_REGISTRY,
  LUXURY_ICON_CATEGORIES,
  LuxuryIconItem,
} from '../../config/luxuryIcons';
import { LuxuryIconRenderer } from './LuxuryIconRenderer';
import { Search, X, Check } from 'lucide-react';

export interface IconPickerModalProps {
  isOpen: boolean;
  selectedIcon?: string;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  selectedIcon,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const iconList = Object.values(LUXURY_ICONS_REGISTRY);

  const filteredIcons = iconList.filter((item: LuxuryIconItem) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        dir="rtl"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <LuxuryIconRenderer iconName="Gem" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                בורר אייקוני יוקרה
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                אייקונים וקטוריים אלגנטיים (ללא אימוג'ים)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש אייקון לפי שם או משמעות..."
              className="w-full pr-9 pl-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500/50 text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              הכל ({iconList.length})
            </button>
            {LUXURY_ICON_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filteredIcons.map((item) => {
            const isSelected = selectedIcon === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  onSelect(item.name);
                  onClose();
                }}
                className={`group relative p-3 flex flex-col items-center justify-center gap-2 rounded-xl border text-center transition-all duration-200 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-md ring-2 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <LuxuryIconRenderer
                  iconName={item.name}
                  className="w-6 h-6 transition-transform group-hover:scale-110"
                />
                <span className="text-[11px] font-medium line-clamp-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
          <span>נמצאו {filteredIcons.length} אייקונים</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 font-medium"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};

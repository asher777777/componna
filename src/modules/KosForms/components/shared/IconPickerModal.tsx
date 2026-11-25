import React, { useState, useEffect } from 'react';
import {
  LUXURY_ICONS_REGISTRY,
  LUXURY_ICON_CATEGORIES,
  LuxuryIconItem,
} from '../../config/luxuryIcons';
import { LuxuryIconRenderer } from './LuxuryIconRenderer';
import { Search, X, Check, Sparkles } from 'lucide-react';
import { BrandStyleIconDef, TenantStylePreset } from '../../../../core/contracts';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { getKoscloudBrandingIconsForStyle } from '../../../../core/ui/BrandIconPicker';
import { fetchPublicBrandIcons, PublicBrandIconItem } from '../../../../core/ui/publicBrandIconsService';
import { KOSWEB_STYLE_PRESETS_LIST } from '../../config/koswebStylePresets';

export interface IconPickerModalProps {
  isOpen: boolean;
  selectedIcon?: string;
  stylePreset?: TenantStylePreset;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  selectedIcon,
  stylePreset = 'standard',
  onSelect,
  onClose,
}) => {
  const { db } = useSystemConnection();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'collection' | 'luxury'>('collection');
  const [activeBrandStyle, setActiveBrandStyle] = useState<TenantStylePreset>(stylePreset || 'standard');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [publicIcons, setPublicIcons] = useState<PublicBrandIconItem[]>([]);

  useEffect(() => {
    if (stylePreset) {
      setActiveBrandStyle(stylePreset);
    }
  }, [stylePreset]);

  useEffect(() => {
    if (!isOpen || !db) return;
    let active = true;
    fetchPublicBrandIcons(db, activeBrandStyle).then((items) => {
      if (active) {
        setPublicIcons(items);
      }
    });
    return () => {
      active = false;
    };
  }, [isOpen, db, activeBrandStyle]);

  if (!isOpen) return null;

  const brandIcons: Array<BrandStyleIconDef & { svgUrl?: string }> =
    publicIcons.length > 0
      ? publicIcons
      : getKoscloudBrandingIconsForStyle(activeBrandStyle);

  const filteredBrandIcons = brandIcons.filter((ic) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      ic.name.toLowerCase().includes(q) ||
      ic.labelHe.toLowerCase().includes(q) ||
      (ic.keywords && ic.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  });

  const iconList = Object.values(LUXURY_ICONS_REGISTRY);
  const filteredLuxuryIcons = iconList.filter((item: LuxuryIconItem) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const currentCount = activeTab === 'collection' ? filteredBrandIcons.length : filteredLuxuryIcons.length;

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
                בורר אייקונים מקולקציית המותג
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                אייקוני קולקציית KOSWEB המותאמים לסגנון הטופס ואייקוני יוקרה וקטוריים
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tabs: Brand Collection vs All Luxury */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('collection')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'collection'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>קולקציית האיקונים שלנו (לפי סגנון)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('luxury')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'luxury'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              כל אייקוני היוקרה ({iconList.length})
            </button>
          </div>

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

          {activeTab === 'collection' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {KOSWEB_STYLE_PRESETS_LIST.map((preset) => {
                const PresetIcon = preset.icon;
                const isSelected = activeBrandStyle === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setActiveBrandStyle(preset.key)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <PresetIcon className="w-3.5 h-3.5" />
                    <span>{preset.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                type="button"
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
                  type="button"
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
          )}
        </div>

        {/* Icons Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {activeTab === 'collection'
            ? filteredBrandIcons.map((ic) => {
                const targetValue = ic.svgUrl || ic.name;
                const isSelected = selectedIcon === targetValue || selectedIcon === ic.name;
                return (
                  <button
                    key={`${ic.archetype}_${ic.name}`}
                    type="button"
                    onClick={() => {
                      onSelect(targetValue);
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
                      iconName={targetValue}
                      className="w-6 h-6 transition-transform group-hover:scale-110"
                    />
                    <span className="text-[11px] font-medium line-clamp-1">
                      {ic.labelHe}
                    </span>
                  </button>
                );
              })
            : filteredLuxuryIcons.map((item) => {
                const isSelected = selectedIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
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
          <span>נמצאו {currentCount} אייקונים</span>
          <button
            type="button"
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

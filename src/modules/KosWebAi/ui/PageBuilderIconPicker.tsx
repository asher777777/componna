import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, ChevronDown, Check, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BrandStyleIconDef, TenantStylePreset } from '../../../core/contracts';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { getKoscloudBrandingIconsForStyle } from '../../../core/ui/BrandIconPicker';
import { fetchPublicBrandIcons, PublicBrandIconItem } from '../../../core/ui/publicBrandIconsService';
import { resolveLiveBrandDna } from '../services/brandSectionHydrator';

interface PageBuilderIconPickerProps {
  label?: string;
  value?: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export const COMMON_ICONS = [
  'Star', 'Heart', 'HeartHandshake', 'Sparkles', 'Zap', 'Shield', 'ShieldCheck', 'Award', 'Crown', 'Gem', 'CheckCircle2',
  'AlertCircle', 'HelpCircle', 'Info', 'Lightbulb', 'Flame', 'Key', 'Anchor', 'Feather', 'Home', 'Briefcase', 'Coffee',
  'Layers', 'Layout', 'Grid', 'Compass', 'Globe', 'MapPin', 'Phone',
  'Mail', 'MessageCircle', 'Send', 'Share2', 'Users', 'UserPlus',
  'Clock', 'Calendar', 'FileText', 'BookOpen', 'GraduationCap', 'Video',
  'Image', 'Music', 'TrendingUp', 'BarChart3', 'DollarSign', 'CreditCard',
  'Gift', 'Package', 'ShoppingBag', 'Tag', 'Smile', 'Sun', 'Moon',
  'Target', 'Sliders', 'Lock', 'Bell', 'Folder'
];

export const DynamicIcon: React.FC<{ name?: string; className?: string }> = ({ name = 'Star', className = 'w-5 h-5' }) => {
  if (!name) {
    const Fallback = LucideIcons.Sparkles;
    return <Fallback className={className} />;
  }

  // Support SVG data URLs or web image URLs
  if (name.startsWith('data:image/') || name.startsWith('http://') || name.startsWith('https://') || name.startsWith('/')) {
    return <img src={name} alt="icon" className={twMerge(clsx(className, 'object-contain inline-block'))} />;
  }

  // Direct lookup
  let IconComponent = (LucideIcons as any)[name];

  // Try normalized PascalCase (e.g. "shield-check" -> "ShieldCheck", "star" -> "Star")
  if (!IconComponent) {
    const pascalName = name
      .trim()
      .replace(/(^|[-_ ])+([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase());
    IconComponent = (LucideIcons as any)[pascalName];
  }

  // Case-insensitive lookup
  if (!IconComponent) {
    const lower = name.toLowerCase().replace(/[-_ ]/g, '');
    const matchedKey = Object.keys(LucideIcons).find(
      (key) => key.toLowerCase() === lower
    );
    if (matchedKey) {
      IconComponent = (LucideIcons as any)[matchedKey];
    }
  }

  const FinalComponent = IconComponent || LucideIcons.HelpCircle || LucideIcons.FileQuestion;
  return <FinalComponent className={className} />;
};

export const PageBuilderIconPicker: React.FC<PageBuilderIconPickerProps> = ({
  label = 'בחירת אייקון',
  value = 'Star',
  onChange,
  className,
}) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'brand' | 'all'>('brand');
  const [publicStyleIcons, setPublicStyleIcons] = useState<PublicBrandIconItem[]>([]);

  const liveDna = resolveLiveBrandDna(undefined, tenantId);
  const stylePreset: TenantStylePreset = liveDna?.designTokens?.defaultStylePreset || 'standard';

  useEffect(() => {
    if (!isOpen || !db) return;
    let active = true;
    fetchPublicBrandIcons(db, stylePreset).then((items) => {
      if (active && items.length > 0) {
        setPublicStyleIcons(items);
      }
    });
    return () => {
      active = false;
    };
  }, [isOpen, db, stylePreset]);

  const brandStyleIcons: Array<BrandStyleIconDef & { svgUrl?: string }> =
    publicStyleIcons.length > 0
      ? publicStyleIcons
      : getKoscloudBrandingIconsForStyle(stylePreset);

  const filteredBrandIcons = brandStyleIcons.filter((ic) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      ic.name.toLowerCase().includes(q) ||
      ic.labelHe.toLowerCase().includes(q) ||
      (ic.keywords && ic.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  });

  const filteredCommonIcons = COMMON_ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={twMerge(clsx('flex flex-col gap-1.5 w-full text-right relative', className))} dir="rtl">
      {label && <label className="text-xs font-semibold text-slate-300">{label}</label>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/80 hover:border-slate-600 text-white rounded-xl px-3.5 py-2 text-sm transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <DynamicIcon name={value} className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs text-slate-200 truncate max-w-[160px]">{value}</span>
        </div>
        <ChevronDown className={clsx('w-4 h-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 z-50 w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTab('brand')}
              className={clsx(
                'flex-1 py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer',
                tab === 'brand'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Sparkles className="w-3 h-3" />
              <span>סגנון מיתוג ({stylePreset})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('all')}
              className={clsx(
                'flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                tab === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              כל האיקונים
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute right-3 text-slate-400" />
            <input
              type="text"
              placeholder="חיפוש אייקון בעברית או באנגלית..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pr-9 pl-3 py-1.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-52 overflow-y-auto custom-scrollbar p-1">
            {tab === 'brand'
              ? filteredBrandIcons.map((ic) => {
                  const targetValue = ic.svgUrl || ic.name;
                  const isSelected = value === targetValue || value === ic.name;
                  return (
                    <button
                      key={`${ic.archetype}_${ic.name}`}
                      type="button"
                      onClick={() => {
                        onChange(targetValue);
                        setIsOpen(false);
                      }}
                      className={twMerge(
                        clsx(
                          'flex flex-col items-center justify-center p-2 rounded-xl border border-transparent transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer',
                          isSelected && 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        )
                      )}
                      title={`${ic.labelHe} (${ic.name})`}
                    >
                      <DynamicIcon name={targetValue} className="w-5 h-5 text-slate-200" />
                    </button>
                  );
                })
              : filteredCommonIcons.map((iconName) => {
                  const isSelected = value === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        onChange(iconName);
                        setIsOpen(false);
                      }}
                      className={twMerge(
                        clsx(
                          'flex flex-col items-center justify-center p-2 rounded-xl border border-transparent transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer',
                          isSelected && 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        )
                      )}
                      title={iconName}
                    >
                      <DynamicIcon name={iconName} className="w-5 h-5 text-slate-200" />
                    </button>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
};

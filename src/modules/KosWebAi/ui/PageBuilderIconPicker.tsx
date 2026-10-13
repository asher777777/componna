import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PageBuilderIconPickerProps {
  label?: string;
  value?: string;
  onChange: (iconName: string) => void;
  className?: string;
}

const COMMON_ICONS = [
  'Star', 'Heart', 'Sparkles', 'Zap', 'Shield', 'Award', 'CheckCircle2',
  'Layers', 'Layout', 'Grid', 'Compass', 'Globe', 'MapPin', 'Phone',
  'Mail', 'MessageCircle', 'Send', 'Share2', 'Users', 'UserPlus',
  'Clock', 'Calendar', 'FileText', 'BookOpen', 'GraduationCap', 'Video',
  'Image', 'Music', 'TrendingUp', 'BarChart3', 'DollarSign', 'CreditCard',
  'Gift', 'Package', 'ShoppingBag', 'Tag', 'Smile', 'Sun', 'Moon',
  'Target', 'Sliders', 'Lock', 'Bell', 'HelpCircle', 'Folder'
];

export const DynamicIcon: React.FC<{ name?: string; className?: string }> = ({ name = 'Star', className = 'w-5 h-5' }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.FileQuestion;
  return <IconComponent className={className} />;
};

export const PageBuilderIconPicker: React.FC<PageBuilderIconPickerProps> = ({
  label = 'בחירת אייקון',
  value = 'Star',
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = COMMON_ICONS.filter((icon) =>
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
          <span className="font-mono text-xs text-slate-200">{value}</span>
        </div>
        <ChevronDown className={clsx('w-4 h-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 z-50 w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute right-3 text-slate-400" />
            <input
              type="text"
              placeholder="חיפוש אייקון באנגלית..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pr-9 pl-3 py-1.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {filteredIcons.map((iconName) => {
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
                      'flex flex-col items-center justify-center p-2 rounded-xl border border-transparent transition-all hover:bg-white/10 hover:border-white/20',
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

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';

export const BRAND_ICON_LIBRARY = [
  'Sparkles', 'Heart', 'HeartHandshake', 'Shield', 'ShieldCheck', 'Star', 'Award', 'Crown', 'Gem', 'Zap',
  'CheckCircle2', 'Target', 'Compass', 'Globe', 'Users', 'UserPlus', 'Clock', 'Calendar', 'BookOpen',
  'GraduationCap', 'Lightbulb', 'Smile', 'Sun', 'Feather', 'Home', 'Phone', 'MessageCircle', 'Gift',
  'TrendingUp', 'Lock', 'HelpCircle', 'AlertCircle', 'Info', 'Briefcase', 'Layers', 'Flame', 'Key',
  'Anchor', 'Coffee', 'Music', 'Video', 'MapPin',
];

export const DynamicBrandIcon: React.FC<{ name?: string; className?: string }> = ({
  name = 'Sparkles',
  className = 'w-4 h-4',
}) => {
  const IconComp = (LucideIcons as any)[name] || LucideIcons.Sparkles;
  return <IconComp className={className} />;
};

/**
 * בורר אייקונים מתוך ספריית האייקונים של המערכת (תואם רכיב המיתוג ומודל השירותים)
 */
export const IconPickerPopover: React.FC<{
  value?: string;
  onChange: (iconName: string) => void;
  title?: string;
  size?: 'sm' | 'md';
  buttonClassName?: string;
}> = ({ value = 'Sparkles', onChange, title = 'בחר אייקון', size = 'md', buttonClassName }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = BRAND_ICON_LIBRARY.filter((ic) =>
    ic.toLowerCase().includes(search.toLowerCase())
  );

  const btnSizeClass = size === 'sm' ? 'w-8 h-8 rounded-lg text-xs' : 'w-10 h-10 rounded-xl';
  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="relative inline-block" dir="rtl">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={`${title} (${value})`}
        className={
          buttonClassName ||
          `${btnSizeClass} bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-all shrink-0 cursor-pointer`
        }
      >
        <DynamicBrandIcon name={value} className={iconSizeClass} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[140] w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">ספריית אייקונים</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חפש אייקון..."
              dir="ltr"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-8 pl-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto p-1">
            {filtered.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => {
                  onChange(iconName);
                  setOpen(false);
                }}
                title={iconName}
                className={`p-2 rounded-xl flex items-center justify-center border transition-all ${
                  value === iconName
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-transparent hover:border-indigo-400'
                }`}
              >
                <DynamicBrandIcon name={iconName} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

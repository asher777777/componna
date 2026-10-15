import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, Sparkles, Check, Crown, Diamond, ShieldCheck, Award, Zap, Gem, Trophy, Flame } from 'lucide-react';
import { clsx } from 'clsx';

export interface LuxuryIconDef {
  name: string;
  labelHe: string;
  category: 'luxury' | 'business' | 'trust' | 'tech';
}

export const LUXURY_ICONS_LIST: LuxuryIconDef[] = [
  // Luxury & Prestige
  { name: 'Crown', labelHe: 'כתר מלכותי', category: 'luxury' },
  { name: 'Diamond', labelHe: 'יהלום', category: 'luxury' },
  { name: 'Gem', labelHe: 'אבן חן יוקרתית', category: 'luxury' },
  { name: 'Sparkles', labelHe: 'ניצוצות זוהר', category: 'luxury' },
  { name: 'Award', labelHe: 'מדליית הוקרה', category: 'luxury' },
  { name: 'Trophy', labelHe: 'גביע אליפות', category: 'luxury' },
  { name: 'Star', labelHe: 'כוכב פרימיום', category: 'luxury' },
  { name: 'Medal', labelHe: 'אות כבוד', category: 'luxury' },
  { name: 'Flame', labelHe: 'להבה מובילה', category: 'luxury' },
  { name: 'SunMedium', labelHe: 'שמש זוהרת', category: 'luxury' },
  { name: 'Feather', labelHe: 'נוצה אלגנטית', category: 'luxury' },
  { name: 'Compass', labelHe: 'מצפן דרך', category: 'luxury' },
  { name: 'Infinity', labelHe: 'אינסוף אפשרויות', category: 'luxury' },
  { name: 'Anchor', labelHe: 'עוגן יציבות', category: 'luxury' },

  // Business & Finance
  { name: 'Coins', labelHe: 'מטבעות זהב', category: 'business' },
  { name: 'Briefcase', labelHe: 'תיק עסקים', category: 'business' },
  { name: 'Building2', labelHe: 'מגדל חברות', category: 'business' },
  { name: 'Landmark', labelHe: 'מוסד פיננסי', category: 'business' },
  { name: 'TrendingUp', labelHe: 'צמיחה ותשואה', category: 'business' },
  { name: 'BarChart3', labelHe: 'גרף הישגים', category: 'business' },
  { name: 'CreditCard', labelHe: 'כרטיס יוקרה', category: 'business' },
  { name: 'Wallet', labelHe: 'ארנק דיגיטלי', category: 'business' },
  { name: 'CircleDollarSign', labelHe: 'סמל הכנסות', category: 'business' },
  { name: 'Target', labelHe: 'מטרה מדויקת', category: 'business' },
  { name: 'Scale', labelHe: 'מאזני צדק', category: 'business' },
  { name: 'HeartHandshake', labelHe: 'שותפות עסקית', category: 'business' },
  { name: 'Users', labelHe: 'נבחרת מומחים', category: 'business' },
  { name: 'Rocket', labelHe: 'זינוק והמראה', category: 'business' },

  // Trust & Security
  { name: 'ShieldCheck', labelHe: 'מגן מאומת 100%', category: 'trust' },
  { name: 'BadgeCheck', labelHe: 'תו תקן רשמי', category: 'trust' },
  { name: 'CheckCircle2', labelHe: 'אישור מושלם', category: 'trust' },
  { name: 'ShieldAlert', labelHe: 'אבטחה עליונה', category: 'trust' },
  { name: 'Lock', labelHe: 'סליקה מוצפנת', category: 'trust' },
  { name: 'KeyRound', labelHe: 'מפתח גישה', category: 'trust' },
  { name: 'Eye', labelHe: 'שקיפות מלאה', category: 'trust' },
  { name: 'Fingerprint', labelHe: 'זיהוי בלעדי', category: 'trust' },
  { name: 'UserCheck', labelHe: 'לקוח VIP מאומת', category: 'trust' },
  { name: 'Shield', labelHe: 'חומת מגן', category: 'trust' },

  // Tech & Innovation
  { name: 'Zap', labelHe: 'ברק מהירות', category: 'tech' },
  { name: 'Cpu', labelHe: 'מעבד חכם', category: 'tech' },
  { name: 'Lightbulb', labelHe: 'חדשנות וחזון', category: 'tech' },
  { name: 'QrCode', labelHe: 'קוד דיגיטלי', category: 'tech' },
  { name: 'Smartphone', labelHe: 'מובייל מתקדם', category: 'tech' },
  { name: 'Laptop', labelHe: 'מערכת ענן', category: 'tech' },
  { name: 'Globe', labelHe: 'נוכחות עולמית', category: 'tech' },
  { name: 'Layers', labelHe: 'שכבות מודולריות', category: 'tech' },
  { name: 'SlidersHorizontal', labelHe: 'התאמה אישית', category: 'tech' },
  { name: 'Glasses', labelHe: 'ראיית העתיד', category: 'tech' },
  { name: 'Share2', labelHe: 'ויראליות ושיתוף', category: 'tech' },
  { name: 'Radio', labelHe: 'שידור חי', category: 'tech' },
];

export type LuxuryColorPreset = 'gold' | 'platinum' | 'indigo' | 'emerald' | 'amber';

export interface LuxuryIconsGalleryProps {
  onSelectIconSvg: (svgDataUrl: string, iconName: string) => void;
  selectedIconName?: string;
}

export const LuxuryIconsGallery: React.FC<LuxuryIconsGalleryProps> = ({
  onSelectIconSvg,
  selectedIconName,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'luxury' | 'business' | 'trust' | 'tech'>('all');
  const [colorPreset, setColorPreset] = useState<LuxuryColorPreset>('gold');

  // Filtered icons
  const filtered = useMemo(() => {
    return LUXURY_ICONS_LIST.filter((icon) => {
      const matchCat = selectedCategory === 'all' || icon.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.labelHe.includes(search);
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  const presetStyles = {
    gold: {
      color: '#f59e0b',
      border: 'border-amber-500/40 hover:border-amber-400',
      bg: 'bg-amber-500/10 hover:bg-amber-500/20',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      gradient: 'from-amber-400 via-yellow-300 to-amber-500',
      text: 'text-amber-400',
    },
    platinum: {
      color: '#f8fafc',
      border: 'border-slate-500/40 hover:border-slate-300',
      bg: 'bg-slate-500/10 hover:bg-slate-500/20',
      glow: 'shadow-[0_0_20px_rgba(248,250,252,0.2)]',
      gradient: 'from-white via-slate-200 to-slate-400',
      text: 'text-slate-100',
    },
    indigo: {
      color: '#6366f1',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.25)]',
      gradient: 'from-indigo-400 via-purple-300 to-indigo-500',
      text: 'text-indigo-400',
    },
    emerald: {
      color: '#10b981',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      gradient: 'from-emerald-400 via-teal-300 to-emerald-500',
      text: 'text-emerald-400',
    },
    amber: {
      color: '#ea580c',
      border: 'border-orange-500/40 hover:border-orange-400',
      bg: 'bg-orange-500/10 hover:bg-orange-500/20',
      glow: 'shadow-[0_0_20px_rgba(234,88,12,0.25)]',
      gradient: 'from-orange-400 via-amber-300 to-orange-500',
      text: 'text-orange-400',
    },
  }[colorPreset];

  const handlePickIcon = (iconName: string) => {
    // Generate high-resolution luxury SVG data URI
    const hex = presetStyles.color;
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="128" height="128" fill="none" stroke="${hex}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke="${hex}" stroke-opacity="0.2" fill="${hex}" fill-opacity="0.08"/><g transform="translate(4,4) scale(0.66)"><path stroke="${hex}" stroke-width="2.2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></g></svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    onSelectIconSvg(dataUrl, iconName);
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-right animate-in fade-in" dir="rtl">
      {/* Top Header & Finish Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>גלריית אייקונים יוקרתיים וסמלי פרימיום</span>
          </h4>
          <p className="text-[10px] text-slate-400">
            בחרו סמל יוקרתי לשילוב ישיר בכרטיסים, באדג'ים וברקעי האתר
          </p>
        </div>

        {/* Color Presets */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <span className="text-[10px] text-slate-400 px-1 font-bold">גימור:</span>
          {(['gold', 'platinum', 'indigo', 'emerald'] as LuxuryColorPreset[]).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setColorPreset(preset)}
              className={clsx(
                'px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer',
                colorPreset === preset
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/30'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {preset === 'gold' && 'זהב 24K'}
              {preset === 'platinum' && 'פלטינום'}
              {preset === 'indigo' && 'סגול ניאון'}
              {preset === 'emerald' && 'אמרלד'}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {/* Categories */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'הכל' },
            { id: 'luxury', label: 'יוקרה ומעמד' },
            { id: 'business', label: 'עסקים וכספים' },
            { id: 'trust', label: 'ביטחון ואמון' },
            { id: 'tech', label: 'טכנולוגיה' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={clsx(
                'px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer',
                selectedCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex items-center w-full sm:w-48 sm:mr-auto">
          <Search className="w-3.5 h-3.5 absolute right-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש אייקון (עברית/אנגלית)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pr-8 pl-2.5 py-1 text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Big Luxury Icons Grid */}
      <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-72 overflow-y-auto custom-scrollbar p-1">
        {filtered.map((item) => {
          const IconComp = (LucideIcons as any)[item.name] || LucideIcons.Sparkles;
          const isSelected = selectedIconName === item.name;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handlePickIcon(item.name)}
              className={clsx(
                'p-2.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center gap-1.5 group cursor-pointer text-center relative select-none',
                presetStyles.bg,
                presetStyles.border,
                isSelected && 'ring-2 ring-amber-400 shadow-lg scale-95 bg-amber-500/30'
              )}
              title={`${item.labelHe} (${item.name})`}
            >
              <div className={clsx(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200',
                presetStyles.text
              )}>
                <IconComp className="w-5 h-5 drop-shadow-md" />
              </div>

              <span className="text-[10px] font-bold text-slate-200 truncate w-full group-hover:text-white">
                {item.labelHe}
              </span>

              {isSelected && (
                <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

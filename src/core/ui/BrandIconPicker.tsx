import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';
import { getRegisteredCapabilityUI } from '../bridge/CapabilitySlot';
import {
  BrandStyleIconDef,
  KOSCLOUD_BRANDING_ICONS_CAPABILITY,
  TenantStylePreset,
} from '../contracts';

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
  if (!name) {
    const Fallback = LucideIcons.Sparkles;
    return <Fallback className={className} />;
  }

  if (name.startsWith('data:image/') || name.startsWith('http://') || name.startsWith('https://') || name.startsWith('/')) {
    return <img src={name} alt="icon" className={`${className} object-contain inline-block`} />;
  }

  let IconComp = (LucideIcons as any)[name];

  if (!IconComp) {
    const pascalName = name
      .trim()
      .replace(/(^|[-_ ])+([a-zA-Z0-9])/g, (_, __, c) => c.toUpperCase());
    IconComp = (LucideIcons as any)[pascalName];
  }

  if (!IconComp) {
    const lower = name.toLowerCase().replace(/[-_ ]/g, '');
    const matchedKey = Object.keys(LucideIcons).find(
      (key) => key.toLowerCase() === lower
    );
    if (matchedKey) {
      IconComp = (LucideIcons as any)[matchedKey];
    }
  }

  const FinalComp = IconComp || LucideIcons.Sparkles;
  return <FinalComp className={className} />;
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

const CORE_BRAND_STYLE_ICONS_FALLBACK: BrandStyleIconDef[] = [
  // feminine
  { name: 'Sparkles', labelHe: 'ניצוצות זוהר', archetype: 'feminine', category: 'wellness' },
  { name: 'Heart', labelHe: 'לב אוהב', archetype: 'feminine', category: 'wellness' },
  { name: 'Flower2', labelHe: 'פרח מלבלב', archetype: 'feminine', category: 'nature' },
  { name: 'Feather', labelHe: 'נוצה עדינה', archetype: 'feminine', category: 'wellness' },
  { name: 'Gem', labelHe: 'אבן חן יוקרתית', archetype: 'feminine', category: 'luxury' },
  { name: 'Crown', labelHe: 'כתר מלכותי', archetype: 'feminine', category: 'luxury' },
  { name: 'Sun', labelHe: 'שמש חמימה', archetype: 'feminine', category: 'nature' },
  { name: 'HeartHandshake', labelHe: 'אכפתיות וחיבור', archetype: 'feminine', category: 'trust' },
  // masculine
  { name: 'Shield', labelHe: 'מגן פלדה חזק', archetype: 'masculine', category: 'trust' },
  { name: 'ShieldCheck', labelHe: 'מגן מאומת 100%', archetype: 'masculine', category: 'trust' },
  { name: 'Trophy', labelHe: 'גביע ניצחון', archetype: 'masculine', category: 'luxury' },
  { name: 'Target', labelHe: 'פגיעה במטרה', archetype: 'masculine', category: 'business' },
  { name: 'Briefcase', labelHe: 'תיק מנהלים', archetype: 'masculine', category: 'business' },
  { name: 'Rocket', labelHe: 'זינוק והמראה', archetype: 'masculine', category: 'business' },
  { name: 'Anchor', labelHe: 'עוגן יציבות', archetype: 'masculine', category: 'trust' },
  { name: 'Award', labelHe: 'מדליית הוקרה', archetype: 'masculine', category: 'luxury' },
  // spiritual
  { name: 'Infinity', labelHe: 'אינסוף אפשרויות', archetype: 'spiritual', category: 'luxury' },
  { name: 'Compass', labelHe: 'מצפן דרך וייעוד', archetype: 'spiritual', category: 'luxury' },
  { name: 'Eye', labelHe: 'עין הראייה הפנימית', archetype: 'spiritual', category: 'trust' },
  { name: 'BookOpen', labelHe: 'ספר חוכמה ומודעות', archetype: 'spiritual', category: 'wellness' },
  { name: 'Sunrise', labelHe: 'זריחה והתחדשות', archetype: 'spiritual', category: 'nature' },
  { name: 'Lightbulb', labelHe: 'הארה פנימית', archetype: 'spiritual', category: 'wellness' },
  { name: 'Sparkles', labelHe: 'ברכת שפע', archetype: 'spiritual', category: 'luxury' },
  { name: 'Trees', labelHe: 'שורשים וצמיחה', archetype: 'spiritual', category: 'nature' },
  // sharp
  { name: 'Zap', labelHe: 'ברק מהירות שיא', archetype: 'sharp', category: 'tech' },
  { name: 'Terminal', labelHe: 'מסוף פקודות חדות', archetype: 'sharp', category: 'tech' },
  { name: 'Layers', labelHe: 'שכבות גיאומטריות', archetype: 'sharp', category: 'tech' },
  { name: 'Diamond', labelHe: 'צורת יהלום גיאומטרית', archetype: 'sharp', category: 'luxury' },
  { name: 'Lock', labelHe: 'הצפנה קשיחה', archetype: 'sharp', category: 'trust' },
  { name: 'Cpu', labelHe: 'חומרת סיליקון', archetype: 'sharp', category: 'tech' },
  { name: 'Code2', labelHe: 'בלוקי קוד טהור', archetype: 'sharp', category: 'tech' },
  { name: 'Bot', labelHe: 'בוט אוטונומי מהיר', archetype: 'sharp', category: 'tech' },
  // analytical
  { name: 'BarChart3', labelHe: 'גרף עמודות אנליטי', archetype: 'analytical', category: 'analytics' },
  { name: 'TrendingUp', labelHe: 'מגמת עלייה ומדדים', archetype: 'analytical', category: 'analytics' },
  { name: 'Scale', labelHe: 'מאזני דיוק ואיזון', archetype: 'analytical', category: 'analytics' },
  { name: 'Brain', labelHe: 'מודל חשיבה ובינה', archetype: 'analytical', category: 'tech' },
  { name: 'Microscope', labelHe: 'מיקרוסקופ מחקר עמוק', archetype: 'analytical', category: 'analytics' },
  { name: 'SearchCheck', labelHe: 'אימות נתונים Data Audit', archetype: 'analytical', category: 'analytics' },
  { name: 'Target', labelHe: 'רמת דיוק ו-Accuracy', archetype: 'analytical', category: 'analytics' },
  { name: 'FileText', labelHe: 'דוח מחקר מקיף', archetype: 'analytical', category: 'analytics' },
  // standard
  { name: 'Star', labelHe: 'כוכב איכות פרימיום', archetype: 'standard', category: 'luxury' },
  { name: 'BadgeCheck', labelHe: 'תו תקן רשמי', archetype: 'standard', category: 'trust' },
  { name: 'CheckCircle2', labelHe: 'אישור מושלם', archetype: 'standard', category: 'trust' },
  { name: 'Users', labelHe: 'נבחרת מומחים מנוסה', archetype: 'standard', category: 'business' },
  { name: 'CreditCard', labelHe: 'כרטיס תשלום בטוח', archetype: 'standard', category: 'business' },
  { name: 'Clock', labelHe: 'עמידה בלוחות זמנים', archetype: 'standard', category: 'trust' },
  { name: 'Calendar', labelHe: 'תיאום פגישה מראש', archetype: 'standard', category: 'business' },
  { name: 'Rocket', labelHe: 'השקת פרויקט', archetype: 'standard', category: 'business' },
];

/**
 * Returns the KOSCLOUD branding style icons matching the tenant's stylePreset (archetype),
 * reading from the live KosCloudStore capability registration when loaded, with a core fallback.
 */
export function getKoscloudBrandingIconsForStyle(stylePreset?: TenantStylePreset): BrandStyleIconDef[] {
  const registered = getRegisteredCapabilityUI(KOSCLOUD_BRANDING_ICONS_CAPABILITY) as BrandStyleIconDef[] | null;
  const catalog = Array.isArray(registered) && registered.length > 0
    ? registered
    : CORE_BRAND_STYLE_ICONS_FALLBACK;

  const targetStyle: TenantStylePreset = stylePreset || 'standard';
  const matched = catalog.filter((icon) => icon.archetype === targetStyle);
  return matched.length > 0 ? matched : catalog.filter((icon) => icon.archetype === 'standard');
}

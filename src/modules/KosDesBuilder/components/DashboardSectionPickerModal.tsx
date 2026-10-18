import React from 'react';
import {
  X,
  Layout,
  TrendingUp,
  Table,
  Zap,
  Navigation,
  Layers,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { DashboardSectionType } from '../types';

export interface DashboardSectionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: DashboardSectionType, defaultTitle?: string) => void;
}

interface SectionOption {
  type: DashboardSectionType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  badgeColor: string;
}

const SECTION_OPTIONS: SectionOption[] = [
  {
    type: 'header',
    title: 'הדר וברכת פתיחה',
    description: 'ברכה מותאמת אישית, סטטוס מערכת, תאריך ושעון, כפתורי הנעה לפעולה עליונים.',
    icon: Layout,
    badge: 'כותרת',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  {
    type: 'stats',
    title: 'כרטיסי מדדים ו-KPI',
    description: 'מספרים מובילים, אחוזי צמיחה חודשיים, הכנסות, לידים ומנויים בגריד מותאם.',
    icon: TrendingUp,
    badge: 'מדדים',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    type: 'table',
    title: 'טבלת נתונים מסונכרנת',
    description: 'טבלה דינמית המחוברת לקולקציית דייר, חיפוש, מיון, ייצוא וסטטוסי פעילות.',
    icon: Table,
    badge: 'נתונים',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    type: 'quickActions',
    title: 'כפתורי פעולה מהירים',
    description: 'קיצורי דרך לפונקציות נפוצות: איש קשר חדש, הפקת קבלה, שיגור וואטסאפ ועוד.',
    icon: Zap,
    badge: 'פעולות',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  {
    type: 'floatingDock',
    title: 'מעגן צף (Cashwan Floating Dock)',
    description: 'תפריט ניווט תחתון/צדדי מעוצב ואינטראקטיבי לגישה מהירה לכל מודולי המערכת.',
    icon: Navigation,
    badge: 'ניווט',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    type: 'commandMatrix',
    title: 'מטריצת פקודות ורכיבים',
    description: 'חלוקה לקטגוריות של כל רכיבי הדייר (CRM, סליקה, וואטסאפ, וידאו) עם סטטוסים חיים.',
    icon: LayoutGrid,
    badge: 'מרכז שליטה',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  {
    type: 'slotWidget',
    title: 'ווידג׳ט מוטמע (Capability Slot)',
    description: 'הטמעת ממשק מוכן מרכיב שכן ללא ייבוא הדדי – טפסים, נגני וידאו וגרפים.',
    icon: Layers,
    badge: 'מודולרי',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
];

export const DashboardSectionPickerModal: React.FC<DashboardSectionPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              הוספת אזור חדש ללוח הבקרה
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              בחר סוג אזור לשילוב בלוח הבקרה של הדייר
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.type}
                onClick={() => {
                  onSelect(opt.type, opt.title);
                  onClose();
                }}
                className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {opt.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>בחר רכיב זה</span>
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

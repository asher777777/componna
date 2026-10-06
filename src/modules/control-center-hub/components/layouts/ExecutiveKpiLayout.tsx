import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  CreditCard,
  Layout,
  FileText,
  Image,
  ChevronLeft,
  ArrowUpRight,
  Shield,
  Activity,
  Sparkles
} from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { ControlCenterModuleItem } from '../../types';

export const ExecutiveKpiLayout: React.FC = () => {
  const { filteredModules, metrics, moduleDocCounts } = useControlCenter();
  const navigate = useNavigate();

  const kpis = [
    {
      title: 'סך לידים במאגר ה-CRM',
      value: metrics.totalLeadsCount,
      unit: 'אנשי קשר',
      change: 'זמן אמת',
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      actionRoute: '/crm-analytics',
    },
    {
      title: 'עמודי נחיתה פעילים',
      value: metrics.totalPagesCount,
      unit: 'עמודים',
      change: 'זמן אמת',
      icon: Layout,
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-400',
      actionRoute: '/page-builder',
    },
    {
      title: 'טפסים ושאלונים מקוונים',
      value: metrics.totalFormsCount,
      unit: 'טפסים',
      change: 'זמן אמת',
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
      actionRoute: '/smart-forms',
    },
    {
      title: 'עסקאות קשר ואיזיקאונט',
      value: metrics.totalTransactionsCount,
      unit: 'תקבולים',
      change: 'זמן אמת',
      icon: CreditCard,
      color: 'from-indigo-500 to-purple-500',
      textColor: 'text-indigo-400',
      actionRoute: '/kesher-payments',
    },
    {
      title: 'פריטי מדיה ב-Storage',
      value: metrics.totalMediaCount,
      unit: 'קבצים',
      change: 'זמן אמת',
      icon: Image,
      color: 'from-sky-500 to-cyan-500',
      textColor: 'text-sky-400',
      actionRoute: '/media-gallery-hub',
    },
    {
      title: 'קהילות וקבוצות CRM',
      value: metrics.totalGroupsCount,
      unit: 'קבוצות',
      change: 'זמן אמת',
      icon: Activity,
      color: 'from-rose-500 to-pink-500',
      textColor: 'text-rose-400',
      actionRoute: '/crm-groups',
    },
  ];

  const categories: Array<{ id: string; title: string; subtitle: string }> = [
    { id: 'marketing', title: 'חטיבת שיווק וצמיחה דיגיטלית', subtitle: 'דפי נחיתה, מחוללי טפסים, והמרת לקוחות' },
    { id: 'crm', title: 'חטיבת לקוחות, קהילות ותקשורת', subtitle: 'אנליטיקה, סגמנטים של אנשי קשר ואוטומציית וואטסאפ' },
    { id: 'finance', title: 'חטיבת כספים, סליקה וחשבונאות', subtitle: 'סליקת אשראי ו-Bit, הוראות קבע והפקת מסמכים' },
    { id: 'media', title: 'חטיבת מדיה, וידאו ותוכן AI', subtitle: 'אולפן וידאו HeyGen, גלריית ענן ונגן זרימה אינטראקטיבי' },
    { id: 'core', title: 'חטיבת תשתיות, מיתוג ומסדי נתונים', subtitle: 'זהות מותג DNA, מחבר מסד מרכזי ואימות' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Executive KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>מדדי ביצוע עסקיים (Executive Overview)</span>
          </h2>
          <span className="text-xs text-slate-400">נתוני אמת מ-Firestore</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(kpi.actionRoute)}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 backdrop-blur-xl transition hover:shadow-lg hover:scale-[1.01] cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition">
                    {kpi.title}
                  </span>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="my-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono tracking-tight">
                      {kpi.value}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {kpi.unit}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className={`${kpi.textColor} font-medium flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {kpi.change}
                  </span>
                  <span className="text-slate-500 group-hover:text-indigo-400 flex items-center gap-0.5 transition font-semibold">
                    <span>כניסה לרכיב</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Clusters */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const mods = filteredModules.filter((m) => m.category === cat.id);
          if (mods.length === 0) return null;

          return (
            <div key={cat.id} className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white">{cat.title}</h3>
                <p className="text-xs text-slate-400">{cat.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mods.map((mod: ControlCenterModuleItem) => {
                  const docCount = mod.collectionName ? moduleDocCounts[mod.id] : undefined;

                  return (
                    <div
                      key={mod.id}
                      onClick={() => navigate(mod.route)}
                      className="bg-slate-950/60 border border-slate-800/90 hover:border-indigo-500/50 p-4 rounded-2xl flex items-center justify-between transition hover:shadow-md cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${mod.colorScheme.from} ${mod.colorScheme.to} flex items-center justify-center text-white shrink-0`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
                            {mod.shortTitle}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {docCount !== undefined ? `${docCount} מסמכים במסד` : 'מוכן לשימוש'}
                          </div>
                        </div>
                      </div>

                      <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:-translate-x-1 transition" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

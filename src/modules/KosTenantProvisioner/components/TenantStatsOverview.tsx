import React from 'react';
import { Globe, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { useTenantProvisioner } from '../hooks/useTenantProvisioner';

export const TenantStatsOverview: React.FC = () => {
  const { stats, loading } = useTenantProvisioner();

  const cards = [
    {
      title: 'סך כל הסאב-דומיינים',
      value: stats.totalTenants,
      subtitle: 'טננטים רשומים במערכת',
      icon: Globe,
      color: 'from-indigo-600 to-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'סאב-דומיינים פעילים',
      value: stats.activeTenants,
      subtitle: 'מערכות עצמאיות באוויר',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'ממוצע רכיבים לטננט',
      value: stats.avgModulesPerTenant,
      subtitle: 'מודולים פעילים ללקוח',
      icon: Layers,
      color: 'from-blue-600 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'הרכיב המבוקש ביותר',
      value: stats.mostPopularModule,
      subtitle: 'מותקן במרבית הדומיינים',
      icon: Sparkles,
      color: 'from-purple-600 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
      textColor: 'text-purple-600 dark:text-purple-400',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-xs flex items-center justify-between gap-4 ${c.bgColor}`}
          >
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                {c.title}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-black ${c.textColor} ${c.isText ? 'text-lg sm:text-xl truncate' : 'font-mono'}`}>
                  {loading ? '...' : c.value}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                {c.subtitle}
              </span>
            </div>

            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

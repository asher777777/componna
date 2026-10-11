import React from 'react';
import { LiveAnalyticsSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import {
  Activity,
  Lock,
  Eye,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Users,
  Check,
} from 'lucide-react';
import { clsx } from 'clsx';

export const LiveAnalyticsEditor: React.FC<{
  config: LiveAnalyticsSectionConfig;
  onChange: (updated: LiveAnalyticsSectionConfig) => void;
}> = ({ config, onChange }) => {
  const updateField = (field: keyof LiveAnalyticsSectionConfig, val: any) => {
    onChange({ ...config, [field]: val });
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Scope and Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <Activity className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <strong>אזור אנליטיקס וביצועים חיים:</strong> נתונים אלו נשמרים ישירות בקולקציה ייעודית תחת ה-Tenant שלכם ב-Firestore (<code>tenants/&#123;tenantId&#125;/page_analytics_telemetry</code>) ומסתנכרנים עם Google Analytics ומנועי AI בזמן אמת.
        </div>
      </div>

      {/* Main Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PageBuilderInput
          label="כותרת האזור"
          value={config.title || ''}
          onChange={(val) => updateField('title', val)}
          placeholder="מדדי ביצועים ואנליטיקס בזמן אמת"
        />
        <PageBuilderInput
          label="תת-כותרת"
          value={config.subtitle || ''}
          onChange={(val) => updateField('subtitle', val)}
          placeholder="נתוני צפייה, אינטראקציה ותנועה ממנועי AI ומגוגל"
        />
      </div>

      <PageBuilderInput
        label="טקסט תגית חיה (Badge Text)"
        value={config.customBadgeText || ''}
        onChange={(val) => updateField('customBadgeText', val)}
        placeholder="Live Telemetry Active"
      />

      {/* Admin Only Toggle */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>הצגה למנהלים בלבד (Admin Only)</span>
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            בסימון זה, האזור יוצג רק לבעלי האתר במצב עריכה ולא יוצג למבקרים חיצוניים
          </span>
        </div>
        <button
          type="button"
          onClick={() => updateField('adminOnly', !config.adminOnly)}
          className={clsx(
            'w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer',
            config.adminOnly ? 'bg-amber-600' : 'bg-slate-700'
          )}
        >
          <div
            className={clsx(
              'w-4 h-4 rounded-full bg-white transition-transform',
              config.adminOnly ? 'translate-x-[-24px]' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {/* Metrics To Display */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300">כרטיסים ומדדים להצגה באזור:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              key: 'showViews',
              label: 'סך צפיות בעמוד',
              val: config.showViews !== false,
              icon: Eye,
            },
            {
              key: 'showUniqueVisitors',
              label: 'מבקרים ייחודיים',
              val: config.showUniqueVisitors !== false,
              icon: Users,
            },
            {
              key: 'showCtaClicks',
              label: 'אינטראקציות ולידים',
              val: config.showCtaClicks !== false,
              icon: Activity,
            },
            {
              key: 'showConversionRate',
              label: 'יחס המרה חי (Conversion Rate)',
              val: config.showConversionRate !== false,
              icon: ShieldCheck,
            },
            {
              key: 'showTrafficSources',
              label: 'פילוח מקורות תנועה וציטוטי AI',
              val: config.showTrafficSources !== false,
              icon: Sparkles,
            },
            {
              key: 'showGa4StatusBadge',
              label: 'תגית חיבור Google Analytics 4',
              val: config.showGa4StatusBadge !== false,
              icon: BarChart3,
            },
            {
              key: 'showAiTrafficBadge',
              label: 'תגית ניטור מנועי AI (ChatGPT/Perplexity)',
              val: config.showAiTrafficBadge !== false,
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => updateField(item.key as any, !item.val)}
                className={clsx(
                  'p-3 rounded-2xl border text-right flex items-center justify-between text-xs transition cursor-pointer',
                  item.val
                    ? 'bg-indigo-950/30 border-indigo-500/40 text-white'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={clsx('w-4 h-4', item.val ? 'text-indigo-400' : 'text-slate-500')} />
                  <span>{item.label}</span>
                </div>
                <div
                  className={clsx(
                    'w-4 h-4 rounded-md border flex items-center justify-center transition-colors',
                    item.val
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-slate-700 bg-slate-800'
                  )}
                >
                  {item.val && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { LiveAnalyticsSectionConfig } from '../../types/sectionConfigs';
import { PageBuilderInput } from '../../ui/PageBuilderInput';
import { eventBus } from '../../../../core/bridge/EventBus';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant';
import {
  pageAnalyticsService,
  extractGscVerificationToken,
} from '../../services/pageAnalyticsService';
import {
  Activity,
  Lock,
  Eye,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Users,
  Check,
  Search,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';

export const LiveAnalyticsEditor: React.FC<{
  config: LiveAnalyticsSectionConfig;
  onChange: (updated: LiveAnalyticsSectionConfig) => void;
}> = ({ config, onChange }) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const getPageIdFromContext = () => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && (pathParts[0] === 'p' || pathParts[0] === 'page')) {
        return pathParts[1];
      }
      const search = new URLSearchParams(window.location.search);
      const paramPageId = search.get('pageId');
      if (paramPageId) return paramPageId;
    }
    return 'default_page';
  };

  const updateField = (field: keyof LiveAnalyticsSectionConfig, val: any) => {
    onChange({ ...config, [field]: val });
  };

  const handleGa4Change = (rawVal: string) => {
    const trimmed = rawVal.trim();
    const nextConfig = { ...config, googleAnalyticsId: trimmed };
    onChange(nextConfig);
    eventBus.emit('kosai:action', {
      action: 'UPDATE_GLOBAL_SETTINGS',
      payload: { googleAnalyticsId: trimmed },
    });
    pageAnalyticsService.saveGoogleIntegrations(db || null, tenantId, getPageIdFromContext(), {
      googleAnalyticsId: trimmed,
      googleSearchConsoleVerification: config.googleSearchConsoleVerification,
      googleSearchConsolePropertyUrl: config.googleSearchConsolePropertyUrl,
    });
  };

  const handleGscVerificationChange = (rawVal: string) => {
    const cleanToken = extractGscVerificationToken(rawVal);
    const nextConfig = { ...config, googleSearchConsoleVerification: cleanToken };
    onChange(nextConfig);
    eventBus.emit('kosai:action', {
      action: 'UPDATE_GLOBAL_SETTINGS',
      payload: {
        googleSearchConsoleVerification: cleanToken,
        googleSearchConsoleConnected: Boolean(cleanToken || config.googleSearchConsolePropertyUrl),
      },
    });
    pageAnalyticsService.saveGoogleIntegrations(db || null, tenantId, getPageIdFromContext(), {
      googleAnalyticsId: config.googleAnalyticsId,
      googleSearchConsoleVerification: cleanToken,
      googleSearchConsolePropertyUrl: config.googleSearchConsolePropertyUrl,
    });
  };

  const handleGscPropertyChange = (rawVal: string) => {
    const trimmed = rawVal.trim();
    const nextConfig = { ...config, googleSearchConsolePropertyUrl: trimmed };
    onChange(nextConfig);
    eventBus.emit('kosai:action', {
      action: 'UPDATE_GLOBAL_SETTINGS',
      payload: {
        googleSearchConsolePropertyUrl: trimmed,
        googleSearchConsoleConnected: Boolean(trimmed || config.googleSearchConsoleVerification),
      },
    });
    pageAnalyticsService.saveGoogleIntegrations(db || null, tenantId, getPageIdFromContext(), {
      googleAnalyticsId: config.googleAnalyticsId,
      googleSearchConsoleVerification: config.googleSearchConsoleVerification,
      googleSearchConsolePropertyUrl: trimmed,
    });
  };

  const cleanVerificationToken = extractGscVerificationToken(
    config.googleSearchConsoleVerification
  );

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Scope and Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <Activity className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <strong>אזור אנליטיקס, Google Analytics 4 ו-Google Search Console:</strong> נתונים אלו נשמרים ישירות בקולקציה ייעודית תחת ה-Tenant שלכם ב-Firestore (<code>tenants/&#123;tenantId&#125;/page_analytics_telemetry</code>) ומסתנכרנים עם Google Analytics, אימות Google Search Console ומנועי AI בזמן אמת.
        </div>
      </div>

      {/* Google Analytics 4 & Google Search Console Connection Panel */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white">
              חיבור Google Analytics 4 ו-Google Search Console
            </h4>
          </div>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-[11px] font-bold transition"
          >
            <span>פתח Google Search Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GA4 Measurement ID */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>מזהה Google Analytics 4 (GA4)</span>
              </span>
              {config.googleAnalyticsId ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>מחובר</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                  אופציונלי
                </span>
              )}
            </div>
            <input
              type="text"
              value={config.googleAnalyticsId || ''}
              onChange={(e) => handleGa4Change(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              dir="ltr"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 leading-tight">
              מזהה מדידה המתחיל ב-<strong>G-</strong>. מזריק אוטומטית את תגית המעקב של GA4 לדף הציבורי.
            </p>
          </div>

          {/* Google Search Console Verification & Property */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-blue-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>אימות Google Search Console</span>
              </span>
              {cleanVerificationToken || config.googleSearchConsolePropertyUrl ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>מחובר ומאומת</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                  הזן קוד אימות
                </span>
              )}
            </div>
            <input
              type="text"
              value={config.googleSearchConsoleVerification || ''}
              onChange={(e) => handleGscVerificationChange(e.target.value)}
              placeholder='הדבק קוד אימות או תגית <meta name="google-site-verification" ... />'
              dir="ltr"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
            />
            <input
              type="text"
              value={config.googleSearchConsolePropertyUrl || ''}
              onChange={(e) => handleGscPropertyChange(e.target.value)}
              placeholder="כתובת האתר ב-Search Console (למשל https://example.com)"
              dir="ltr"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 leading-tight">
              מזריק אוטומטית תגית <code>google-site-verification</code> ל-Head של הדף עבור אימות מול גוגל קונסול.
            </p>
          </div>
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
          placeholder="נתוני צפייה, אינטראקציה, חיפוש אורגני מ-Google Search Console ותנועה ממנועי AI"
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
              key: 'showSearchConsoleCard',
              label: 'לוח ביצועי Google Search Console (חשיפות, הקלקות ומיקום)',
              val: config.showSearchConsoleCard !== false,
              icon: Search,
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
              key: 'showGscStatusBadge',
              label: 'תגית חיבור Google Search Console',
              val: config.showGscStatusBadge !== false,
              icon: Search,
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

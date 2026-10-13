import React, { useEffect, useState } from 'react';
import { LiveAnalyticsSectionConfig } from '../../types/sectionConfigs';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant';
import {
  pageAnalyticsService,
  PageAnalyticsTelemetry,
} from '../../services/pageAnalyticsService';
import {
  Activity,
  Eye,
  Users,
  MousePointerClick,
  Sparkles,
  TrendingUp,
  Globe,
  Radio,
  BarChart3,
  Lock,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';

interface LiveAnalyticsSectionProps {
  config: LiveAnalyticsSectionConfig;
  isEditing?: boolean;
}

export const LiveAnalyticsSection: React.FC<LiveAnalyticsSectionProps> = ({
  config,
  isEditing = false,
}) => {
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
  const [telemetry, setTelemetry] = useState<PageAnalyticsTelemetry | null>(null);

  const {
    title = 'מדדי ביצועים ואנליטיקס בזמן אמת',
    subtitle = 'נתוני צפייה, אינטראקציה ותנועה ממנועי AI ומגוגל',
    adminOnly = false,
    displayStyle = 'bento',
    showViews = true,
    showUniqueVisitors = true,
    showCtaClicks = true,
    showLeads = true,
    showConversionRate = true,
    showTrafficSources = true,
    showAiTrafficBadge = true,
    showGa4StatusBadge = true,
    customBadgeText = 'Live Telemetry Active',
  } = config;

  // Extract pageId from window path or fallback
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

  const pageId = getPageIdFromContext();

  useEffect(() => {
    const unsubscribe = pageAnalyticsService.subscribePageAnalytics(
      db || null,
      tenantId,
      pageId,
      (data) => {
        setTelemetry(data);
      }
    );
    return () => unsubscribe();
  }, [db, tenantId, pageId]);

  // If set to admin-only and we are not in edit mode, hide completely from public visitors
  if (adminOnly && !isEditing) {
    return null;
  }

  // Calculate conversion rate
  const totalViews = telemetry?.views || 1;
  const totalInteractions = (telemetry?.ctaClicks || 0) + (telemetry?.leadsCount || 0) + (telemetry?.whatsappClicks || 0);
  const conversionRate = Math.min(100, Math.round((totalInteractions / Math.max(1, totalViews)) * 100));

  const googleCount = telemetry?.sources?.google || 0;
  const directCount = telemetry?.sources?.direct || 0;
  const socialCount = telemetry?.sources?.social || 0;
  const aiSearchCount = telemetry?.sources?.aiSearch || 0;
  const totalSources = Math.max(1, googleCount + directCount + socialCount + aiSearchCount);

  return (
    <section className="w-full py-12 px-4 relative overflow-hidden bg-[#0c0d12] text-white" dir="rtl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Admin Only Notice Badge in Edit Mode */}
        {adminOnly && isEditing && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>אזור זה מוגדר לצפיית מנהל בלבד (נסתר מגולשים רגילים)</span>
          </div>
        )}

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {customBadgeText}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Badges: GA4 & AI Engine Integration */}
          <div className="flex flex-wrap items-center gap-2.5">
            {showGa4StatusBadge && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs font-bold text-slate-200 shadow-sm">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Google Analytics 4 מחובר</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            )}
            {showAiTrafficBadge && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 text-xs font-bold text-indigo-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>ניטור מנועי AI (ChatGPT / Perplexity)</span>
              </div>
            )}
          </div>
        </div>

        {/* Bento Grid Layout */}
        {displayStyle === 'bento' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Views Metric */}
            {showViews && (
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">סך צפיות בעמוד</span>
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white">
                    {(telemetry?.views ?? 1).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">נמדד ב-Firestore תחת הטננט</div>
                </div>
              </div>
            )}

            {/* Unique Visitors Metric */}
            {showUniqueVisitors && (
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">מבקרים ייחודיים</span>
                  <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white">
                    {(telemetry?.uniqueVisitors ?? 1).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>משתמשים פעילים במערכת</span>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Clicks & Leads */}
            {showCtaClicks && (
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">אינטראקציות והמרות</span>
                  <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <MousePointerClick className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white">
                    {totalInteractions.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {telemetry?.leadsCount || 0} לידים • {telemetry?.whatsappClicks || 0} וואטסאפ
                  </div>
                </div>
              </div>
            )}

            {/* Conversion Rate */}
            {showConversionRate && (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-700/50 backdrop-blur-md flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">יחס המרה חי (CR)</span>
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-black text-white">
                    {conversionRate}%
                  </div>
                  <div className="text-[11px] text-indigo-300/80 mt-1">חישוב בזמן אמת מתוך סך התנועה</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Traffic Sources Breakdown Card */}
        {showTrafficSources && (
          <div className="mt-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>פילוח מקורות תנועה וציטוטי AI</span>
              </span>
              <span className="text-[11px] text-slate-400">מתוזמן בזמן אמת מול העמוד</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Google Search */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Search className="w-3.5 h-3.5 text-blue-400" /> Google Search
                  </span>
                  <span className="font-mono">{googleCount}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.round((googleCount / totalSources) * 100)}%` }}
                  />
                </div>
              </div>

              {/* AI Referrals (ChatGPT / Gemini / Perplexity) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-indigo-800/40">
                <div className="flex items-center justify-between text-xs text-indigo-200 mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> מנועי AI (ChatGPT/Perplexity)
                  </span>
                  <span className="font-mono">{aiSearchCount}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.round((aiSearchCount / totalSources) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Social Channels */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Radio className="w-3.5 h-3.5 text-pink-400" /> רשתות חברתיות
                  </span>
                  <span className="font-mono">{socialCount}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 rounded-full"
                    style={{ width: `${Math.round((socialCount / totalSources) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Direct Traffic */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> כניסות ישירות (Direct)
                  </span>
                  <span className="font-mono">{directCount}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.round((directCount / totalSources) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

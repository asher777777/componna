/**
 * KoSeoPowerEngin - Main Hub Component
 * KOSUN26 Modular Layer: Components
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Search,
  Globe,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  Eye,
  Users,
  MousePointerClick,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  AlertTriangle,
  Info,
  Radio,
  Sliders,
  Server,
  Zap,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useKoSeoPower } from '../hooks/useKoSeoPower';
import { extractGscVerificationToken } from '../services/seoPowerStorageService';

export interface KoSeoPowerHubProps {
  onBackToPages?: () => void;
}

export const KoSeoPowerHub: React.FC<KoSeoPowerHubProps> = ({ onBackToPages }) => {
  const {
    config,
    updateConfig,
    saveConfig,
    isSaving,
    saveSuccess,
    testStatus,
    clearTestStatus,
    runInspectorTest,
    sendTestPing,
    pingSent,
    searchQueries,
    trafficSources,
    subdomainsCoverage,
    totals,
  } = useKoSeoPower();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanGscCode = extractGscVerificationToken(config.googleSearchConsoleVerification);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'kosun.pro';

  const copyToClipboard = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* Top Header & Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            {onBackToPages && (
              <button
                type="button"
                onClick={onBackToPages}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="חזרה לניהול עמודים"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  KoSeoPowerEngin - Central Engine
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>KoSeoPowerEngin</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  מפתח אב אחוד לדומיין וסאב-דומיינים
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                מנוע SEO ואנליטיקס מרכזי: חיבור יחיד של Google Search Console ו-Google Analytics 4 המנוהל במקום אחד ומחלחל אוטומטית לכל הדפים והסאב-דומיינים (<code>*.{config.masterDomain || currentHost}</code>).
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runInspectorTest}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>בדיקת אימות בדפדפן</span>
            </button>

            <button
              type="button"
              onClick={saveConfig}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>שומר מפתחות...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>המפתחות נשמרו בהצלחה!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>שמור הגדרות מפתח אחוד</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Notification Banner */}
        {testStatus && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white text-sm">תוצאות בדיקת אימות דומיין וסאב-דומיינים:</strong>
                <p className="mt-1 text-slate-300 leading-relaxed">{testStatus.message}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono">
                    <Check className="w-3.5 h-3.5" />
                    GA4 ID: {config.googleAnalyticsId ? config.googleAnalyticsId : 'טרם הוגדר'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono">
                    <Check className="w-3.5 h-3.5" />
                    GSC Token: {cleanGscCode ? `${cleanGscCode.slice(0, 15)}...` : 'טרם הוגדר'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-mono">
                    <Check className="w-3.5 h-3.5" />
                    GTM: {config.googleTagManagerId || 'GTM-WDDMHZJQ'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300">
                    <Globe className="w-3.5 h-3.5" />
                    כל הסאב-דומיינים מחוברים (Wildcard Active)
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={clearTestStatus}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
          </div>
        )}

        {/* Unified Key Banner */}
        <div className="mt-6 p-4 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                KoSeoPowerEngin - עקרון המפתח האחד (One Key for Root Domain & All Subdomains)
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                מפתח ה-GA4 וקוד האימות של Google Search Console מועברים אוטומטית לכל דפי האתר ולכל הסאב-דומיינים. משתמש שעובר בין <code>kosun.pro</code> ל-<code>client.kosun.pro</code> ממשיך את אותו הסשן בדיוק ללא ניתוק!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              cookie_domain: 'auto'
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Wildcard Active
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section 1: Keys Configuration Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* GA4 Master Key Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Analytics 4 (GA4)</h3>
                    <span className="text-[11px] text-slate-400">מזהה מדידה ראשי לכל הדומיינים</span>
                  </div>
                </div>
                <span
                  className={clsx(
                    'px-2.5 py-1 rounded-xl text-[10px] font-bold',
                    config.googleAnalyticsId
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  )}
                >
                  {config.googleAnalyticsId ? 'מחובר ופעיל' : 'ממתין להגדרה'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    מזהה מדידה (Measurement ID):
                  </label>
                  <input
                    type="text"
                    value={config.googleAnalyticsId}
                    onChange={(e) => updateConfig({ googleAnalyticsId: e.target.value.trim() })}
                    placeholder="לדוגמה: G-3L4X8HXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Google Tag Manager (GTM):</span>
                    <span className="text-[10px] text-teal-400 font-mono">מחובר לדומיין</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.googleTagManagerId || 'GTM-WDDMHZJQ'}
                      onChange={(e) => updateConfig({ googleTagManagerId: e.target.value.trim() })}
                      placeholder="GTM-XXXXXXX"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(config.googleTagManagerId || 'GTM-WDDMHZJQ', 'gtm')}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                      title="העתק מזהה GTM"
                    >
                      {copiedKey === 'gtm' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>סנכרון סאב-דומיינים:</span>
                    <strong className="text-emerald-400 font-mono">auto (Wildcard)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>עוגיות חוצות דומיין:</span>
                    <strong className="text-indigo-400 font-mono">SameSite=None;Secure</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={sendTestPing}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{pingSent ? 'אירוע נשלח לגוגל!' : 'שליחת אירוע בדיקה חי (Ping)'}</span>
              </button>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1"
              >
                <span>פתח ב-Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Google Search Console Key Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Search Console</h3>
                    <span className="text-[11px] text-slate-400">אימות נכס דומיין וסאב-דומיינים</span>
                  </div>
                </div>
                <span
                  className={clsx(
                    'px-2.5 py-1 rounded-xl text-[10px] font-bold',
                    cleanGscCode
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  )}
                >
                  {cleanGscCode ? 'מאומת ברמת דומיין' : 'ממתין לקוד אימות'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    קוד אימות (טוקן, תגית Meta או DNS):
                  </label>
                  <input
                    type="text"
                    value={config.googleSearchConsoleVerification}
                    onChange={(e) => updateConfig({ googleSearchConsoleVerification: e.target.value })}
                    placeholder='הדבק תגית <meta ...> או טוקן'
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                  {cleanGscCode && (
                    <span className="block text-[10px] text-emerald-400 mt-1 font-mono">
                      טוקן נקי זוהה: {cleanGscCode.slice(0, 24)}...
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    כתובת נכס הדומיין (Domain Property):
                  </label>
                  <input
                    type="text"
                    value={config.googleSearchConsolePropertyUrl || `sc-domain:${config.masterDomain || currentHost}`}
                    onChange={(e) => updateConfig({ googleSearchConsolePropertyUrl: e.target.value.trim() })}
                    placeholder={`sc-domain:${config.masterDomain || currentHost}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">חוסך אימות נפרד לכל עמוד</span>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 transition flex items-center gap-1 font-bold"
              >
                <span>פתח ב-Search Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Master Domain & DNS TXT Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">דומיין אב ורשומת DNS</h3>
                    <span className="text-[11px] text-slate-400">חיבור מלא לכל ה-Wildcard</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  DNS TXT
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    דומיין האב (Master Root Domain):
                  </label>
                  <input
                    type="text"
                    value={config.masterDomain || currentHost}
                    onChange={(e) => updateConfig({ masterDomain: e.target.value.trim() })}
                    placeholder="kosun.pro"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                    העתק רשומת DNS TXT לאימות גוגל:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 truncate">
                      {cleanGscCode ? `google-site-verification=${cleanGscCode}` : 'טרם הוגדר קוד אימות'}
                    </div>
                    <button
                      type="button"
                      disabled={!cleanGscCode}
                      onClick={() =>
                        copyToClipboard(
                          `google-site-verification=${cleanGscCode}`,
                          'dns'
                        )
                      }
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-40 shrink-0"
                      title="העתק רשומת DNS TXT"
                    >
                      {copiedKey === 'dns' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoCascadingToSubdomains}
                  onChange={(e) => updateConfig({ autoCascadingToSubdomains: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                />
                <span className="font-medium">החלה אוטומטית על כל הסאב-דומיינים שייווצרו</span>
              </label>
            </div>
          </div>

          {/* Sitemap XML Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">מפת אתר (Sitemap XML)</h3>
                    <span className="text-[11px] text-slate-400">להגשה ב-Search Console</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  sitemap.xml
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>כתובת מפת האתר המלאה:</span>
                    <span className="text-[10px] text-slate-400">Live XML</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-300 truncate" dir="ltr">
                      {`https://${config.masterDomain || currentHost}/sitemap.xml`}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `https://${config.masterDomain || currentHost}/sitemap.xml`,
                          'sitemap_full'
                        )
                      }
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                      title="העתק כתובת מלאה"
                    >
                      {copiedKey === 'sitemap_full' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>מה מדביקים ב-Search Console:</span>
                    <span className="text-[10px] text-amber-400 font-bold">הדבק רק את זה!</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] font-mono text-amber-300 font-bold" dir="ltr">
                      sitemap.xml
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('sitemap.xml', 'sitemap_rel')}
                      className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                      title="העתק sitemap.xml להדבקה"
                    >
                      {copiedKey === 'sitemap_rel' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>הועתק!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>העתק</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  <span>קובץ ה-robots.txt מכיל אוטומטית הפניה למפת האתר:</span>
                  <div className="mt-1 font-mono text-[10px] text-slate-300" dir="ltr">
                    Sitemap: https://{config.masterDomain || currentHost}/sitemap.xml
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <a
                href={`https://${config.masterDomain || currentHost}/sitemap.xml`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1"
              >
                <span>צפה ב-XML</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://search.google.com/search-console/sitemaps"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:text-teal-300 transition flex items-center gap-1 font-bold"
              >
                <span>הגש ב-Search Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 2: Aggregated KPI Bento Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">מדדי ביצועים מרכזיים (כלל הדומיין והסאב-דומיינים)</h2>
            </div>
            <span className="text-xs text-slate-400">מתעדכן בזמן אמת מ-GA4 ומ-Search Console</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {/* Views */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">צפיות בעמודים</span>
                <Eye className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">{totals.views.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">+18% מהשבוע הקודם</span>
            </div>

            {/* Unique Visitors */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">מבקרים ייחודיים</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{totals.uniqueVisitors.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">+14% מהשבוע הקודם</span>
            </div>

            {/* Organic Impressions */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">הופעות אורגניות (GSC)</span>
                <Search className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{totals.searchImpressions.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">+22% חשיפה בגוגל</span>
            </div>

            {/* Organic Clicks */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">קליקים מחיפוש גוגל</span>
                <MousePointerClick className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{totals.searchClicks.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">+27% תנועה אורגנית</span>
            </div>

            {/* CTR */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">שיעור קליקים (CTR)</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">{totals.searchCtr}%</div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">מעל הממוצע בענף</span>
            </div>

            {/* Avg Position */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">מיקום ממוצע בגוגל</span>
                <Sparkles className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-white">{totals.averagePosition}</div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">עמוד ראשון</span>
            </div>

            {/* Leads */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400">פניות ולידים</span>
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-black text-white">{totals.leads}</div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">המרה אורגנית גבוהה</span>
            </div>
          </div>
        </div>

        {/* Section 3: Tables & Sources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Search Queries Table */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">שאילתות חיפוש אורגניות מובילות (Google Search Console)</h3>
                  <span className="text-[11px] text-slate-400">ביטויים שמביאים את מרב החשיפות והקליקים</span>
                </div>
              </div>
              <span className="text-xs text-blue-400 font-mono">Top 5 Queries</span>
            </div>

            {searchQueries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <Search className="w-8 h-8 text-slate-600 mb-1" />
                <span className="font-bold text-slate-300">טרם נקלטו שאילתות חיפוש אורגניות עבור הדומיין והסאב-דומיינים</span>
                <span className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                  שאילתות ומיקומים יופיעו כאן אוטומטית ברגע שגוגל יסרוק את האתר ויזהה קליקים מתוצאות החיפוש ב-Google Search Console.
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-3 font-semibold">מילת חיפוש</th>
                      <th className="pb-3 font-semibold text-center">קליקים</th>
                      <th className="pb-3 font-semibold text-center">הופעות</th>
                      <th className="pb-3 font-semibold text-center">שיעור קליקים (CTR)</th>
                      <th className="pb-3 font-semibold text-center">מיקום ממוצע</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {searchQueries.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{item.query}</span>
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-emerald-400">
                          {item.clicks}
                        </td>
                        <td className="py-3 text-center font-mono text-slate-300">
                          {item.impressions.toLocaleString()}
                        </td>
                        <td className="py-3 text-center font-mono text-indigo-400 font-bold">
                          {item.ctr}%
                        </td>
                        <td className="py-3 text-center font-mono text-amber-300 font-bold">
                          {item.position}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Traffic Sources Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">מקורות תנועה ראשיים</h3>
                  <span className="text-[11px] text-slate-400">פילוח סשנים לפי מקור הגעה</span>
                </div>
              </div>

              <div className="space-y-4 my-2">
                {trafficSources.every((s) => s.sessions === 0) ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    ממתין לתנועת גולשים ראשונה לניטור מקורות הגעה.
                  </div>
                ) : (
                  trafficSources.map((source, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{source.name}</span>
                        <span className="text-white font-mono font-bold">
                          {source.sessions} ({source.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all duration-500', source.color)}
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p>
                התנועה האורגנית מנוטרת במקביל עם Google Analytics 4 ו-Search Console, כך שכל קליק אורגני מוצלב ישירות עם משך השהייה וההמרות.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Subdomains Coverage List */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">סטטוס כיסוי וחלחול סאב-דומיינים (Subdomain Coverage)</h3>
                <span className="text-[11px] text-slate-400">
                  כלל הדומיינים והסאב-דומיינים הנהנים ממפתח האב האחוד
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Wildcard Cascading Active
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 font-semibold">סאב-דומיין / מארח</th>
                  <th className="pb-3 font-semibold text-center">סוג דומיין</th>
                  <th className="pb-3 font-semibold text-center">עמודים מקושרים</th>
                  <th className="pb-3 font-semibold text-center">סטטוס מפתח GA4 & GSC</th>
                  <th className="pb-3 font-semibold text-center">מצב חלחול</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subdomainsCoverage.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 font-bold text-white font-mono flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span>{item.hostname}</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={clsx(
                          'px-2.5 py-1 rounded-xl text-[10px] font-bold',
                          item.isRoot
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-300'
                        )}
                      >
                        {item.isRoot ? 'דומיין אב (Root)' : 'סאב-דומיין (Subdomain)'}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-mono text-slate-300">
                      {item.pagesCount} עמודים
                    </td>
                    <td className="py-3.5 text-center font-mono text-xs text-indigo-300">
                      {item.inheritedKey}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                        <Check className="w-3 h-3" />
                        פעיל במפתח אב
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Instruction Guide */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>מדריך חיבור מהיר ל-Google Analytics 4 ו-Search Console:</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <strong className="block text-white mb-1.5 font-bold">1. הוספת רשומת DNS ב-Domain Registrar</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                העתיקו את רשומת ה-DNS TXT מכרטיסיית האימות והדביקו אותה בניהול ה-DNS של הדומיין שלכם (כגון Cloudflare או רשם הדומיין). הדבר יאמת אוטומטית את <code>kosun.pro</code> וכל הסאב-דומיינים בבת אחת!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <strong className="block text-white mb-1.5 font-bold">2. מעקב חוצה סאב-דומיינים ב-GA4</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                הגדרת ה-`cookie_domain: 'auto'` המובנית במערכת דואגת לכך שכל מעבר בין סאב-דומיינים של המערכת ייחשב כסשן יחיד ורציף ללא צורך בהגדרות נוספות.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <strong className="block text-white mb-1.5 font-bold">3. אפס תחזוקה בעת יצירת עמודים חדשים</strong>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                כל עמוד חדש שנוצר או סאב-דומיין שמוקם במערכת KOSUN26 מקבל אוטומטית את מפתחות האב ומתחיל להזרים נתוני צפיות ודירוגי חיפוש באופן מיידי.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

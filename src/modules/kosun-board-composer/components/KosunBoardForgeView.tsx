import React, { useState } from 'react';
import {
  Sparkles,
  LayoutGrid,
  Bookmark,
  Globe,
  Key,
  Layers,
  ArrowRight,
  ExternalLink,
  Trash2,
  Share2,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useKosunBoard } from '../context/ModuleContext';
import { AudienceSelector } from './AudienceSelector';
import { ModuleCapabilityPicker } from './ModuleCapabilityPicker';
import { DynamicCustomDashboardView } from './DynamicCustomDashboardView';
import { SubdomainPairingModal } from './SubdomainPairingModal';
import { Tooltip } from './Tooltip';
import { useTenantScope } from '../../../core/tenant/TenantScopeContext';
import { StorefrontService } from '../../saas-storefront-composer/services/storefrontService';
import { GeneratedCustomDashboard } from '../types';

export const KosunBoardForgeView: React.FC = () => {
  const { tenantId } = useTenantScope();
  const {
    audiences,
    selectedAudience,
    setSelectedAudience,
    discoveredModules,
    selectedModuleIds,
    setSelectedModuleIds,
    toggleModuleSelection,
    customPrompt,
    setCustomPrompt,
    selectedModel,
    setSelectedModel,
    isGenerating,
    generatedDashboard,
    setGeneratedDashboard,
    savedDashboards,
    generateAiDashboard,
    deleteDashboard,
    hasApiKey,
    openApiKeysSettings,
    pairDashboardToSubdomain,
  } = useKosunBoard();

  const [activeTab, setActiveTab] = useState<'forge' | 'preview' | 'saved' | 'subdomains'>('forge');
  const [pairingTargetDashboard, setPairingTargetDashboard] = useState<GeneratedCustomDashboard | null>(null);

  const handleGenerateClick = async () => {
    try {
      const res = await generateAiDashboard();
      setActiveTab('preview');
    } catch (err: any) {
      console.error('[KosunBoardForgeView] Generate error:', err);
    }
  };

  const allTenants = StorefrontService.getAllTenants();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" dir="rtl">
      {/* 2026 Modern Top Navigation Bar (No sidebars!) */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm text-white tracking-wide">
                  KOSUN Board Composer
                </h1>
                <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  קושאן בורד
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                מחולל לוחות בקרה ומערכות מותאמות אישית באמצעות AI
              </p>
            </div>
          </div>

          {/* Top Nav Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('forge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'forge'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>מחולל מערכות (Forge)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>לוח בקרה פעיל</span>
              {generatedDashboard && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>לוחות שמורים ({savedDashboards.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subdomains')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === 'subdomains'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>שיוך סאב-דומיינים</span>
            </button>
          </nav>

          {/* System Status Indicators */}
          <div className="flex items-center gap-2">
            {/* Gemini API Key Status (Rule 6) */}
            <button
              type="button"
              onClick={openApiKeysSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] border transition ${
                hasApiKey
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-indigo-500'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/60'
              }`}
              title="הגדרות מפתחות AI ב-DB Connector Hub"
            >
              <Key className="w-3 h-3 text-indigo-400" />
              <span>{hasApiKey ? 'Gemini מחובר' : 'חסר מפתח Gemini'}</span>
            </button>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl">
              טננט: <span className="text-indigo-300 font-bold">{tenantId}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Tab 1: AI Dashboard Forge (Builder) */}
        {activeTab === 'forge' && (
          <div className="space-y-6">
            {/* Step 1: Target Audience Selection */}
            <div className="p-4 sm:p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
              <AudienceSelector
                audiences={audiences}
                selectedAudience={selectedAudience}
                onSelect={(aud) => setSelectedAudience(aud)}
              />
            </div>

            {/* Step 2: Multi-Component Selection (Dynamic Registry - Requirement ב) */}
            <div className="p-4 sm:p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
              <ModuleCapabilityPicker
                modules={discoveredModules}
                selectedModuleIds={selectedModuleIds}
                onToggle={toggleModuleSelection}
                onSelectRecommended={() => {
                  setSelectedModuleIds(selectedAudience.recommendedModuleIds);
                }}
                onSelectAll={() => {
                  setSelectedModuleIds(discoveredModules.map((m) => m.moduleId));
                }}
                onClear={() => setSelectedModuleIds([])}
              />
            </div>

            {/* Step 3: AI Configuration & Generation CTA (Requirement ה) */}
            <div className="p-4 sm:p-5 bg-slate-900/80 border border-indigo-500/30 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">
                    3. הגדרות מחולל ה-AI של קושאן (Gemini)
                  </span>
                  <Tooltip content="ה-AI משלב את כל הרכיבים שנבחרו, בונה מבנה בנטו גריד, מגדיר מדדי KPI חיים ומחבר פעולות מהירות המותאמות במדויק לקהל היעד." />
                </div>

                {/* Gemini Model Selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">מודל AI:</span>
                  <select
                    value={selectedModel}
                    onChange={(e: any) => setSelectedModel(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (מהיר ומדויק)</option>
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash (ביצועים גבוהים)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (ארכיטקטורה עמוקה)</option>
                  </select>
                </div>
              </div>

              {/* Custom instructions text area */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">
                  הנחיות נוספות או דרישות מיוחדות עבור ה-AI (אופציונלי):
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="לדוגמה: הדגש קמפיינים פעילים בוואטסאפ, מקם את סכום הגבייה בראש הלוח, והצע שלוש פעולות לשימור לקוחות..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Primary Generation Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400">
                  נבחרו <span className="font-bold text-white">{selectedModuleIds.length} רכיבים</span> עבור{' '}
                  <span className="font-bold text-indigo-300">{selectedAudience.name}</span>
                </div>

                <button
                  type="button"
                  disabled={isGenerating || selectedModuleIds.length === 0}
                  onClick={handleGenerateClick}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 animate-spin-reverse" />
                  <span>
                    {isGenerating ? 'קושאן מתכננת את לוח הבקרה...' : 'חולל לוח בקרה מותאם אישית ב-AI'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live Dashboard Preview */}
        {activeTab === 'preview' && (
          <div>
            {generatedDashboard ? (
              <DynamicCustomDashboardView
                dashboard={generatedDashboard}
                onBackToForge={() => setActiveTab('forge')}
              />
            ) : savedDashboards.length > 0 ? (
              <DynamicCustomDashboardView
                dashboard={savedDashboards[0]}
                onBackToForge={() => setActiveTab('forge')}
              />
            ) : (
              <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-200">
                  טרם נוצר לוח בקרה מותאם
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  עבור ללשונית "מחולל מערכות (Forge)", בחר קהל יעד ואת שילוב הרכיבים הרצוי, ולחץ על חולל לוח בקרה.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('forge')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition"
                >
                  מעבר למחולל ה-AI
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Dashboards Directory */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-200">
                  לוחות בקרה שמורים ({savedDashboards.length})
                </h3>
                <p className="text-xs text-slate-400">
                  כל לוחות הבקרה שחוללו ונשמרו תחת טננט {tenantId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('forge')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>חולל לוח חדש</span>
              </button>
            </div>

            {savedDashboards.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400">
                אין עדיין לוחות בקרה שמורים. השתמש במחולל ליצירת הלוח הראשון שלך.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedDashboards.map((dash) => (
                  <div
                    key={dash.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20 font-mono">
                          {dash.targetAudienceName}
                        </span>
                        {dash.pairedSubdomain && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                            {dash.pairedSubdomain}.kosun.pro
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-white mb-1">
                        {dash.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {dash.subtitle}
                      </p>

                      <div className="text-[11px] text-slate-400 space-y-1 mb-3">
                        <div>
                          רכיבים מקושרים: <span className="text-slate-300">{dash.selectedModuleIds.length}</span>
                        </div>
                        <div>
                          ווידג'טים בבנטו: <span className="text-slate-300">{dash.widgets.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedDashboard(dash);
                            setActiveTab('preview');
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-bold transition"
                        >
                          הצג לוח
                        </button>
                        <button
                          type="button"
                          onClick={() => setPairingTargetDashboard(dash)}
                          className="p-1.5 bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 rounded-lg transition"
                          title="שדך לסאב-דומיין"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteDashboard(dash.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg transition"
                        title="מחק לוח"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Subdomain Assignment Overview */}
        {activeTab === 'subdomains' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-200">
                שיוך לוחות בקרה לסאב-דומיינים של משתמשים
              </h3>
              <p className="text-xs text-slate-400">
                כאשר לקוח נכנס למערכת תחת הסאב-דומיין שלו (למשל fitness.kosun.pro), המערכת טוענת את לוח הבקרה המשודך עבורו
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allTenants.map((t) => {
                const pairedDash = savedDashboards.find(
                  (d) => d.pairedSubdomain?.toLowerCase() === t.subdomain.toLowerCase()
                );

                return (
                  <div
                    key={t.subdomain}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-white">{t.clientName}</h4>
                        <span className="font-mono text-[11px] text-indigo-300 bg-slate-850 px-2 py-0.5 rounded">
                          {t.subdomain}.kosun.pro
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {pairedDash ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            לוח פעיל: {pairedDash.title}
                          </span>
                        ) : (
                          <span className="text-slate-500">משתמש בלוח הבקרה הסטנדרטי</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/?tenant=${t.subdomain}&mode=admin`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                        title="פתיחת לוח הניהול של הסאב-דומיין בלשונית חדשה"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          if (savedDashboards.length > 0) {
                            setPairingTargetDashboard(savedDashboards[0]);
                          } else {
                            setActiveTab('forge');
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
                      >
                        {pairedDash ? 'החלף לוח' : 'שדך לוח'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Global Subdomain Pairing Modal */}
      {pairingTargetDashboard && (
        <SubdomainPairingModal
          isOpen={!!pairingTargetDashboard}
          onClose={() => setPairingTargetDashboard(null)}
          dashboard={pairingTargetDashboard}
          onPair={async (subdomain) => {
            await pairDashboardToSubdomain(subdomain, pairingTargetDashboard);
          }}
        />
      )}
    </div>
  );
};

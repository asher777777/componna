import React, { useState } from 'react';
import {
  Sparkles,
  LayoutGrid,
  Bookmark,
  Globe,
  Key,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Trash2,
  Share2,
  CheckCircle2,
  Plus,
  Sliders,
  Check,
} from 'lucide-react';
import { useKosunBoard } from '../context/ModuleContext';
import { AudienceSelector } from './AudienceSelector';
import { ModuleCapabilityPicker } from './ModuleCapabilityPicker';
import { DynamicCustomDashboardView } from './DynamicCustomDashboardView';
import { SubdomainPairingModal } from './SubdomainPairingModal';
import { Tooltip } from './Tooltip';
import { TenantRecord } from '../../../core/contracts';
import { TenantCoreService } from '../../../core/tenant/tenantService';
import { useTenantScope, buildTenantAdminUrl } from '../../../core/tenant';
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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [pairingTargetDashboard, setPairingTargetDashboard] = useState<GeneratedCustomDashboard | null>(null);

  const handleGenerateClick = async () => {
    try {
      await generateAiDashboard();
      setActiveTab('preview');
    } catch (err: any) {
      console.error('[KosunBoardForgeView] Generate error:', err);
    }
  };

  const allTenants = TenantCoreService.getLocalTenants();
  const selectedModulesList = discoveredModules.filter((m) =>
    selectedModuleIds.includes(m.moduleId)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-36" dir="rtl">
      {/* 1. Ultra-clean Minimal Top Sub-Nav (No duplicate giant header!) */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/90 px-4 py-2.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Segmented Tab Controls */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('forge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'forge'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>מחולל AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>לוח בקרה פעיל</span>
              {generatedDashboard && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>לוחות שמורים ({savedDashboards.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subdomains')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'subdomains'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>שיוך סאב-דומיינים</span>
            </button>
          </nav>

          {/* Minimal Status Indicators */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={openApiKeysSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] transition cursor-pointer font-medium ${
                hasApiKey
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }`}
              title="הגדרות מפתחות AI ב-DB Connector Hub"
            >
              <Key className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              <span>{hasApiKey ? 'Gemini מחובר' : 'הגדרת מפתח AI'}</span>
            </button>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              טננט: <bdo dir="ltr" className="text-indigo-600 dark:text-indigo-300 font-bold font-mono">{tenantId}</bdo>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        {/* Tab 1: AI Dashboard Forge (3-Step Stepper Studio) */}
        {activeTab === 'forge' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Step Progress Bar */}
            <div className="bg-white dark:bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold w-full max-w-2xl mx-auto">
                {/* Step 1 Pill */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition cursor-pointer ${
                    currentStep === 1
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : currentStep > 1
                      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900/10 dark:bg-slate-950/40 flex items-center justify-center text-[11px]">
                    {currentStep > 1 ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : '1'}
                  </span>
                  <span>קהל יעד</span>
                </button>

                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 shrink-0" />

                {/* Step 2 Pill */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition cursor-pointer ${
                    currentStep === 2
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : currentStep > 2
                      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900/10 dark:bg-slate-950/40 flex items-center justify-center text-[11px]">
                    {currentStep > 2 ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : '2'}
                  </span>
                  <span>שילוב רכיבים ({selectedModuleIds.length})</span>
                </button>

                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-800 shrink-0" />

                {/* Step 3 Pill */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition cursor-pointer ${
                    currentStep === 3
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900/10 dark:bg-slate-950/40 flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span>יצירה ב-AI</span>
                </button>
              </div>
            </div>

            {/* STEP 1: Audience Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <AudienceSelector
                  audiences={audiences}
                  selectedAudience={selectedAudience}
                  onSelect={(aud) => setSelectedAudience(aud)}
                />

                {/* Step 1 Navigation Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    קהל נבחר: <span className="font-bold text-slate-900 dark:text-white">{selectedAudience.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <span>המשך לבחירת רכיבים</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Component Selection */}
            {currentStep === 2 && (
              <div className="space-y-4">
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

                {/* Step 2 Navigation Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>חזרה לקהל יעד</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedModuleIds.length === 0}
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <span>המשך ליצירת הלוח ב-AI</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: AI Configuration & Generation */}
            {currentStep === 3 && (
              <div className="space-y-5 max-w-3xl mx-auto">
                {/* Summary Bento Card */}
                <div className="p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>סיכום המערכת לקראת יצירה</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px] mb-1">קהל יעד נבחר:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedAudience.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px] mt-1">{selectedAudience.category}</span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px] mb-1">רכיבים שיחוברו ללוח:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-300 text-sm">{selectedModuleIds.length} רכיבים</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedModulesList.slice(0, 5).map((m) => (
                          <span key={m.moduleId} className="bg-slate-200 dark:bg-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                            {m.moduleName}
                          </span>
                        ))}
                        {selectedModulesList.length > 5 && (
                          <span className="bg-slate-200 dark:bg-slate-850 px-1.5 py-0.5 rounded text-[10px] text-slate-500 dark:text-slate-400">
                            +{selectedModulesList.length - 5} נוספים
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Model & Prompt Settings */}
                <div className="p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/30 rounded-2xl space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">הגדרות מחולל ה-AI (Gemini)</h4>
                    </div>

                    {/* Clean Model Selector */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">מודל AI:</span>
                      <select
                        value={selectedModel}
                        onChange={(e: any) => setSelectedModel(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="gemini-3.8-flash">Gemini 3.8 Flash (מומלץ ועדכני)</option>
                        <option value="gemini-3.5-flash">Gemini 3.5 Flash (מהיר)</option>
                        <option value="gemini-3.8-flash-lite">Gemini 3.8 Flash Lite (חסכוני ומהיר)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 dark:text-slate-300 block mb-1.5 font-medium">
                      הנחיות או דגשים מיוחדים לקושאן (אופציונלי):
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="לדוגמה: מקם את סכום הגבייה וההכנסות בראש הלוח, והצע שלוש פעולות מהירות להגדלת מכירות..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition leading-relaxed shadow-inner"
                    />
                  </div>

                  {/* Centered Large Generation Button */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      disabled={isGenerating || selectedModuleIds.length === 0}
                      onClick={handleGenerateClick}
                      className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
                    >
                      <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>
                        {isGenerating
                          ? 'קושאן מחוללת את לוח הבקרה...'
                          : 'קושאן, חולל לוח בקרה מותאם אישית ב-AI'}
                      </span>
                    </button>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      ה-AI יבנה כרטיסיות מדדים חיות, פעולות מהירות ותובנות עסקיות מותאמות
                    </p>
                  </div>
                </div>

                {/* Back to Step 2 Button */}
                <div className="flex items-center justify-start">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>חזרה לבחירת רכיבים</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Dashboard View */}
        {activeTab === 'preview' && (
          <div className="animate-in fade-in duration-200">
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
              <div className="p-12 text-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  טרם נוצר לוח בקרה מותאם
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  היכנס ללשונית "מחולל AI", בחר קהל יעד ושילוב רכיבים, ולחץ על חולל לוח בקרה.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('forge')}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition shadow-sm cursor-pointer"
                >
                  מעבר למחולל ה-AI
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Dashboards Directory */}
        {activeTab === 'saved' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  לוחות בקרה שמורים ({savedDashboards.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  לוחות בקרה שנוצרו ונשמרו תחת טננט <bdo dir="ltr" className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">{tenantId}</bdo>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setActiveTab('forge');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>חולל לוח חדש</span>
              </button>
            </div>

            {savedDashboards.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400 shadow-xs">
                אין עדיין לוחות בקרה שמורים. השתמש במחולל ליצירת הלוח הראשון שלך.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedDashboards.map((dash) => (
                  <div
                    key={dash.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 font-medium">
                          {dash.targetAudienceName}
                        </span>
                        {dash.pairedSubdomain && (
                          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 font-mono font-medium">
                            {dash.pairedSubdomain}.kosun.pro
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                        {dash.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {dash.subtitle}
                      </p>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 mb-3">
                        <div>
                          רכיבים מקושרים: <span className="text-slate-800 dark:text-slate-300 font-bold">{dash.selectedModuleIds.length}</span>
                        </div>
                        <div>
                          ווידג'טים בבנטו: <span className="text-slate-800 dark:text-slate-300 font-bold">{dash.widgets.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedDashboard(dash);
                            setActiveTab('preview');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          הצג לוח
                        </button>
                        <button
                          type="button"
                          onClick={() => setPairingTargetDashboard(dash)}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 rounded-lg transition cursor-pointer"
                          title="שדך לסאב-דומיין"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteDashboard(dash.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition cursor-pointer"
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
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                שיוך לוחות בקרה לסאב-דומיינים של לקוחות
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                בכניסה של לקוח לסאב-דומיין שלו (<bdo dir="ltr" className="font-mono text-indigo-600 dark:text-indigo-300 font-bold">subdomain.kosun.pro</bdo>), המערכת תטען את הלוח המשודך כלוח הבקרה הראשי
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allTenants.map((t: TenantRecord) => {
                const pairedDash = savedDashboards.find(
                  (d) => d.pairedSubdomain?.toLowerCase() === t.subdomain.toLowerCase()
                );

                return (
                  <div
                    key={t.subdomain}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.clientName}</h4>
                        <span className="font-mono text-[11px] text-indigo-700 dark:text-indigo-300 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded font-medium">
                          {t.subdomain}.kosun.pro
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {pairedDash ? (
                          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            לוח פעיל: {pairedDash.title}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">משתמש בלוח הבקרה הסטנדרטי</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={buildTenantAdminUrl(t.subdomain, t.fullDomain)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
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
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
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

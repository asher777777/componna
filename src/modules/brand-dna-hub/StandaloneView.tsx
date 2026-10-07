import React, { useState } from 'react';
import { BrandDnaProvider, useBrandDna } from './context/BrandDnaContext';
import { BrandIdentitySection } from './components/BrandIdentitySection';
import { BrandVoiceSection } from './components/BrandVoiceSection';
import { TargetAudienceSection } from './components/TargetAudienceSection';
import { DesignTokensSection } from './components/DesignTokensSection';
import { TrustCheckoutSection } from './components/TrustCheckoutSection';
import { AiDiscoveryWizardModal } from './components/AiDiscoveryWizardModal';
import { AiStepWizardView } from './components/AiStepWizardView';
import { ContentStrategyModal } from './components/ContentStrategyModal';
import { BrandDnaUrlScraperModal } from './components/BrandDnaUrlScraperModal';
import {
  Fingerprint,
  Building2,
  Sliders,
  Target,
  Palette,
  ShieldCheck,
  Wand2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Compass,
  Sun,
  Moon,
  Globe,
  FileSpreadsheet,
} from 'lucide-react';

export type TabType = 'identity' | 'voice' | 'audience' | 'design' | 'trust';

export const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'identity', label: '1. זהות עסקית', icon: Building2 },
  { id: 'voice', label: '2. שפת מותג וטון', icon: Sliders },
  { id: 'audience', label: '3. קהלי יעד ובידול', icon: Target },
  { id: 'design', label: '4. שפה חזותית', icon: Palette },
  { id: 'trust', label: '5. אמינות וסליקה', icon: ShieldCheck },
];

export interface BrandDnaViewProps {
  initialTab?: TabType;
  initialMode?: 'stepper' | 'tabs';
}

export const BrandDnaContent: React.FC<BrandDnaViewProps> = ({
  initialTab = 'identity',
  initialMode = 'stepper',
}) => {
  const {
    brandDna,
    isLoading,
    isSaving,
    completenessScore,
    missingRecommendations,
    saveNow,
    resetToDefaults,
  } = useBrandDna();

  const [viewMode, setViewMode] = useState<'stepper' | 'tabs'>(initialMode);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  // Requirement ה: Add Day/Light mode and make it the default
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isScraperModalOpen, setIsScraperModalOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleSave = async () => {
    const ok = await saveNow();
    if (ok) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <span className="text-sm font-semibold">טוען נתוני Brand DNA...</span>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-text" dir="rtl">
          {/* 1. Main Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 p-6 rounded-3xl shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Brand DNA & AI Orchestrator</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-500/30">
                    Core Engine
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  מרכז העצבים של זהות המותג: הגדר את ה-DNA העסקי, אישיות המותג ונתוני העיצוב המזינים את כל מודולי ה-AI, הדפים ודפי הסליקה.
                </p>
              </div>
            </div>

            {/* Action Buttons & Completeness Indicator */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Day / Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title={isDarkMode ? 'מעבר למצב יום' : 'מעבר למצב לילה'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                <span className="hidden sm:inline">{isDarkMode ? 'מצב יום' : 'מצב לילה'}</span>
              </button>

              {/* URL & Facebook Scraper (Requirement ח) */}
              <button
                type="button"
                onClick={() => setIsScraperModalOpen(true)}
                className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="סריקת אתר קיים או עמוד פייסבוק על ידי AI"
              >
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>סרוק אתר / FB</span>
              </button>

              {/* Content Strategy Proposals (Requirement ז) */}
              <button
                type="button"
                onClick={() => setIsStrategyModalOpen(true)}
                className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/60 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="הצעות אסטרטגיה של כתיבת תוכן לעמודי מכירה ושירות ושמירה לקולקציה"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>אסטרטגיית תוכן AI</span>
              </button>

              {/* Completeness Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">שלמות ה-DNA</span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      completenessScore >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : completenessScore >= 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-pink-600 dark:text-pink-400'
                    }`}
                  >
                    {completenessScore}% הושלם
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                  {completenessScore}%
                </div>
              </div>

              {/* AI Discovery Wizard Button */}
              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
              >
                <Wand2 className="w-4 h-4" />
                <span>ראיון AI</span>
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>שמור שינויים</span>
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={resetToDefaults}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/70 dark:hover:bg-slate-700/60 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-2xl border border-slate-200 dark:border-slate-700/60 transition-colors"
                title="איפוס להגדרות ברירת מחדל"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Save Success Alert */}
          {saveSuccessNotice && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>הגדרות ה-Brand DNA נשמרו וסונכרנו בהצלחה!</span>
            </div>
          )}

          {/* Missing Recommendations Banner */}
          {missingRecommendations.length > 0 && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center justify-between gap-4 text-amber-700 dark:text-amber-300 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  <strong>המלצת AI לשדרוג הפרופיל:</strong> {missingRecommendations.slice(0, 2).join(' • ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="text-[11px] underline font-bold hover:text-amber-900 dark:hover:text-amber-200 shrink-0"
              >
                השלם באמצעות ראיון AI
              </button>
            </div>
          )}

          {/* 2. Mode Switcher (Stepper vs Full Tabs) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setViewMode('stepper')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  viewMode === 'stepper'
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>שאלון AI מודרך (שאלה אחר שאלה)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tabs')}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  viewMode === 'tabs'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>לוח עריכה מקיף (לפי קטגוריות)</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2 hidden md:block">
              {viewMode === 'stepper' ? (
                <span>💡 שאלה אחת בכל שלב עם אפשרויות סיוע AI והמלצות חכמות</span>
              ) : (
                <span>🔧 עריכה ישירה ומעבר חופשי בין כל תחומי המותג</span>
              )}
            </div>
          </div>

          {/* 3. Stepper Mode View - Full Width without 360 preview */}
          {viewMode === 'stepper' && (
            <div className="w-full space-y-6">
              <AiStepWizardView onSwitchToTabs={() => setViewMode('tabs')} />
            </div>
          )}

          {/* 4. Full Tabbed Editor View - Full Width without 360 preview */}
          {viewMode === 'tabs' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
                {TAB_CONFIG.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500'
                          : 'bg-white hover:bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tabbed Content */}
              <div className="w-full space-y-6">
                {activeTab === 'identity' && <BrandIdentitySection />}
                {activeTab === 'voice' && <BrandVoiceSection />}
                {activeTab === 'audience' && <TargetAudienceSection />}
                {activeTab === 'design' && <DesignTokensSection />}
                {activeTab === 'trust' && <TrustCheckoutSection />}
              </div>
            </div>
          )}

          {/* AI Discovery Wizard Modal */}
          <AiDiscoveryWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />

          {/* AI Content Strategy Modal (Requirement ז) */}
          <ContentStrategyModal isOpen={isStrategyModalOpen} onClose={() => setIsStrategyModalOpen(false)} />

          {/* URL & Facebook Scraper Modal (Requirement ח) */}
          <BrandDnaUrlScraperModal isOpen={isScraperModalOpen} onClose={() => setIsScraperModalOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export const BrandDnaHubStandaloneView: React.FC<BrandDnaViewProps> = ({
  initialTab = 'identity',
  initialMode = 'stepper',
}) => {
  return (
    <BrandDnaProvider>
      <BrandDnaContent initialTab={initialTab} initialMode={initialMode} />
    </BrandDnaProvider>
  );
};



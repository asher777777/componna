import React, { useState, useEffect } from 'react';
import { BrandDnaProvider, useBrandDna } from './context/BrandDnaContext';
import { BrandIdentitySection } from './components/BrandIdentitySection';
import { BrandVoiceSection } from './components/BrandVoiceSection';
import { TargetAudienceSection } from './components/TargetAudienceSection';
import { DesignTokensSection } from './components/DesignTokensSection';
import { TrustCheckoutSection } from './components/TrustCheckoutSection';
import { BrandDashboardSection } from './components/BrandDashboardSection';
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
  initialMode?: 'dashboard' | 'stepper' | 'tabs';
}

export const BrandDnaContent: React.FC<BrandDnaViewProps> = ({
  initialTab = 'identity',
  initialMode = 'dashboard',
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

  const [viewMode, setViewMode] = useState<'dashboard' | 'stepper' | 'tabs'>(initialMode);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Floating Action Button state
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Requirement ה: Global Dark/Light mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-text" dir="rtl">
          {/* 1. Minimal Header (Completeness Badge on Desktop only) */}
          <div className="hidden md:flex justify-end mb-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70 rounded-lg shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">שלמות ה-DNA:</span>
              <span
                className={`text-[10px] font-bold font-mono ${
                  completenessScore >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : completenessScore >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-pink-600 dark:text-pink-400'
                }`}
              >
                {completenessScore}%
              </span>
            </div>
          </div>

          {/* Floating Action Button (FAB) Menu */}
          <div className="fixed top-6 left-6 z-50 flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={() => setIsFabOpen(!isFabOpen)}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105"
            >
              {isFabOpen ? <RotateCcw className="w-5 h-5 rotate-45" /> : <Wand2 className="w-5 h-5" />}
            </button>
            
            <div className={`flex flex-col gap-2 transition-all duration-300 origin-top ${isFabOpen ? 'scale-100 opacity-100 mt-2' : 'scale-0 opacity-0 mt-0 h-0 pointer-events-none'}`}>
              
              {/* View Mode Switches */}
              <button
                type="button"
                onClick={() => { setViewMode('dashboard'); setIsFabOpen(false); }}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-md transition-all border ${viewMode === 'dashboard' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>לוח בקרה אקטיבי</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setViewMode('stepper'); setIsFabOpen(false); }}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-md transition-all border ${viewMode === 'stepper' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>שאלון AI מודרך</span>
              </button>

              

              <div className="h-px bg-slate-200 dark:bg-slate-700 w-full my-1"></div>

              {/* Actions */}
              <button
                type="button"
                onClick={() => { setIsStrategyModalOpen(true); setIsFabOpen(false); }}
                className="px-3 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>אסטרטגיית תוכן</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsScraperModalOpen(true); setIsFabOpen(false); }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-blue-200" />
                <span>סרוק אתר / FB</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsDarkMode((prev) => !prev); setIsFabOpen(false); }}
                className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-md transition-all border border-slate-200 dark:border-slate-700"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                <span>{isDarkMode ? 'מצב יום' : 'מצב לילה'}</span>
              </button>

              <button
                type="button"
                onClick={() => { resetToDefaults(); setIsFabOpen(false); }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-md transition-all border border-red-200 dark:border-red-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס</span>
              </button>
            </div>
          </div>
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

          {/* Permanent Category Tabs */}
          {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
                {TAB_CONFIG.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => { setActiveTab(tab.id); setViewMode('tabs'); }}
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

          {/* 3. Dashboard Mode View */}
          {viewMode === 'dashboard' && (
            <BrandDashboardSection 
              onOpenWizard={() => setIsWizardOpen(true)}
              onOpenScraper={() => setIsScraperModalOpen(true)}
              onOpenStrategy={() => setIsStrategyModalOpen(true)}
              onSwitchToTab={(tabId) => {
                setActiveTab(tabId as TabType);
                setViewMode('tabs');
              }}
            />
          )}

          {/* 4. Stepper Mode View - Full Width without 360 preview */}
          {viewMode === 'stepper' && (
            <div className="w-full space-y-6">
              <AiStepWizardView onSwitchToTabs={() => setViewMode('tabs')} />
            </div>
          )}

          {/* 4. Full Tabbed Editor View - Full Width without 360 preview */}
          {viewMode === 'tabs' && (
            <div className="space-y-6 animate-in fade-in">
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
  );
};

export const BrandDnaHubStandaloneView: React.FC<BrandDnaViewProps> = ({
  initialTab = 'identity',
  initialMode = 'dashboard',
}) => {
  return (
    <BrandDnaProvider>
      <BrandDnaContent initialTab={initialTab} initialMode={initialMode} />
    </BrandDnaProvider>
  );
};



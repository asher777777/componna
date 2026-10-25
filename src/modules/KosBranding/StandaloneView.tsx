import React, { useState, useEffect, useContext } from 'react';
import { BrandDnaProvider, useBrandDna, BrandDnaContext } from './context/BrandDnaContext';
import { BrandIdentitySection } from './components/BrandIdentitySection';
import { MarketResearchAgentSection } from './components/MarketResearchAgentSection';
import { BrandVoiceSection } from './components/BrandVoiceSection';
import { TargetAudienceSection } from './components/TargetAudienceSection';
import { DesignTokensSection } from './components/DesignTokensSection';
import { TrustCheckoutSection } from './components/TrustCheckoutSection';
import { BrandEcosystemSection } from './components/BrandEcosystemSection';
import { BrandDashboardSection } from './components/BrandDashboardSection';
import { KosBrandDashboard } from './components/KosBrandDashboard';
import { AiDiscoveryWizardModal } from './components/AiDiscoveryWizardModal';
import { AiStepWizardView } from './components/AiStepWizardView';
import { ContentStrategyModal } from './components/ContentStrategyModal';
import { BrandDnaUrlScraperModal } from './components/BrandDnaUrlScraperModal';
import { CapabilitySlot } from '../../core/bridge/CapabilitySlot';
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
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export type TabType = 'identity' | 'voice' | 'audience' | 'ecosystem' | 'design' | 'trust' | 'market';

export const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'identity', label: '1. זהות עסקית', icon: Building2 },
  { id: 'voice', label: '2. שפת מותג וטון', icon: Sliders },
  { id: 'audience', label: '3. קהלי יעד ובידול', icon: Target },
  { id: 'ecosystem', label: '4. מבנה שירותים', icon: Layers },
  { id: 'design', label: '5. שפה חזותית', icon: Palette },
  { id: 'trust', label: '6. אמינות וסליקה', icon: ShieldCheck },
    { id: 'market', label: '7. מחקר שוק ומתחרים (AI)', icon: Globe },
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('kosun_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false; // ברירת מחדל: מצב יום
  });
  
  // Floating Action Button state
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Requirement ה: Global Dark/Light mode - Default is Day mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kosun_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kosun_theme', 'light');
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

  // Synchronize completeness score & tab with top nav
  useEffect(() => {
    localStorage.setItem('brand_dna_score', String(completenessScore));
    window.dispatchEvent(new CustomEvent('brand_dna_score_changed', { detail: { score: completenessScore } }));
  }, [completenessScore]);

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
        setViewMode('tabs');
      }
    };
    window.addEventListener('brand_dna_switch_tab', handleSwitchTab);
    return () => window.removeEventListener('brand_dna_switch_tab', handleSwitchTab);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('brand_dna_active_tab_changed', { detail: { tab: activeTab } }));
  }, [activeTab]);

  // In-Place Dashboard Live Edit listener (Tenant Manager Only)
  const [isEditingMode, setIsEditingMode] = useState(false);

  useEffect(() => {
    const handleToggleEdit = (e: any) => {
      const next = e?.detail?.isEditMode !== undefined ? Boolean(e.detail.isEditMode) : !isEditingMode;
      setIsEditingMode(next);
      if (next) {
        setViewMode('dashboard');
      }
    };
    window.addEventListener('kos_des_builder_toggle_edit', handleToggleEdit);
    return () => window.removeEventListener('kos_des_builder_toggle_edit', handleToggleEdit);
  }, [isEditingMode]);

  const defaultBrandingSections = [
    {
      id: 'sec-header-branding',
      type: 'header',
      title: 'זהות מותג ו-Brand DNA',
      visible: true,
      mobileHidden: false,
      gridCols: 4,
      config: {
        greetingPrefix: brandDna.identity.companyName ? `מותג: ${brandDna.identity.companyName}` : 'זהות מותג עסקית',
        subtitle: brandDna.identity.slogan || 'הגדרת ערכי ליבה, שפת מותג, צבעים ובידול עסקי מבוסס AI',
        showDateRange: true,
        showTenantBadge: true,
        primaryActionText: 'הפעל אשף גילוי AI',
        primaryActionUrl: '#wizard',
      },
    },
    {
      id: 'sec-stats-branding',
      type: 'stats',
      title: 'מדדי שלמות ואפיון מותג',
      visible: true,
      mobileHidden: false,
      gridCols: 4,
      config: {
        columns: 4,
        stats: [
          {
            id: 'stat-br-1',
            label: 'שלמות ה-Brand DNA',
            value: `${completenessScore}%`,
            change: completenessScore >= 80 ? 'מצוין' : 'דורש השלמה',
            isPositive: completenessScore >= 80,
            icon: 'Sparkles',
            color: 'indigo',
          },
          {
            id: 'stat-br-2',
            label: 'שפת מותג וטון דיבור',
            value: brandDna.voice.genderAddressing || 'פנייה ישירה',
            change: 'מוגדר',
            isPositive: true,
            icon: 'Sliders',
            color: 'purple',
          },
          {
            id: 'stat-br-3',
            label: 'שירותי ליבה במערכת',
            value: String(brandDna.ecosystem?.services?.length || 0),
            change: '+1',
            isPositive: true,
            icon: 'Layers',
            color: 'blue',
          },
          {
            id: 'stat-br-4',
            label: 'צבע מותג ראשי',
            value: brandDna.designTokens?.primaryColor || '#4f46e5',
            change: 'מעוצב',
            isPositive: true,
            icon: 'Palette',
            color: 'emerald',
          },
        ],
      },
    },
    {
      id: 'sec-actions-branding',
      type: 'quickActions',
      title: 'פעולות ואשפי מיתוג מהירים',
      visible: true,
      mobileHidden: false,
      gridCols: 4,
      config: {
        title: 'כלי AI ואשפי מיתוג בלחיצה אחת',
        layout: 'row',
        buttons: [
          {
            id: 'btn-br-1',
            label: 'אשף גילוי AI מלא',
            icon: 'Wand2',
            variant: 'primary',
            actionType: 'navigate',
            target: '#wizard',
          },
          {
            id: 'btn-br-2',
            label: 'סריקת מותג מ-URL',
            icon: 'Globe',
            variant: 'secondary',
            actionType: 'navigate',
            target: '#scraper',
          },
          {
            id: 'btn-br-3',
            label: 'מחקר שוק ומתחרים',
            icon: 'Target',
            variant: 'outline',
            actionType: 'navigate',
            target: '#market',
          },
        ],
      },
    },
    {
      id: 'sec-table-branding',
      type: 'table',
      title: 'מבנה שירותי המותג והצעות הערך',
      visible: true,
      mobileHidden: false,
      gridCols: 4,
      config: {
        title: 'שירותים, חבילות ומסרים שיווקיים',
        streamType: 'contacts',
        pageSize: 5,
        columns: ['שם שירות', 'הצעת ערך', 'קהל יעד', 'סטטוס'],
      },
    },
  ];

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
      {/* Pinned Top Bar: Component Tabs + Completeness Score + Day/Night Toggle */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setViewMode('tabs'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right (In RTL: Left side): Progress Score attached to Day/Night Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                  completenessScore >= 80
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                    : completenessScore >= 50
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                }`}
                title="אחוז שלמות ה-Brand DNA"
              >
                <span>{completenessScore}%</span>
                <span className="text-[10px] font-normal hidden sm:inline">שלמות</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title={isDarkMode ? 'מעבר לתצוגת יום' : 'מעבר לתצוגת לילה'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-text" dir="rtl">

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
                onClick={async () => {
                  setIsFabOpen(false);
                  await handleSave();
                }}
                disabled={isSaving}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>שמור שינויים</span>
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
                onClick={() => {
                  const missingText = missingRecommendations.join(' ');
                  setViewMode('tabs');
                  if (
                    missingText.includes('פרסונ') ||
                    missingText.includes('התנגדות') ||
                    missingText.includes('UVP') ||
                    missingText.includes('ערך ייחודי') ||
                    missingText.includes('קהל')
                  ) {
                    setActiveTab('audience');
                  } else if (
                    missingText.includes('קול') ||
                    missingText.includes('מילות כוח') ||
                    missingText.includes('אסורות') ||
                    missingText.includes('פנייה')
                  ) {
                    setActiveTab('voice');
                  } else if (missingText.includes('שירות') || missingText.includes('מוצר')) {
                    setActiveTab('ecosystem');
                  } else if (
                    missingText.includes('אמינות') ||
                    missingText.includes('סליקה') ||
                    missingText.includes('אחריות') ||
                    missingText.includes('ח.פ') ||
                    missingText.includes('טלפון')
                  ) {
                    setActiveTab('trust');
                  } else {
                    setActiveTab('identity');
                  }
                }}
                className="text-[11px] underline font-bold hover:text-amber-900 dark:hover:text-amber-200 shrink-0 cursor-pointer"
              >
                עבור להשלמה בטאב הרלוונטי ←
              </button>
            </div>
          )}

          {/* Tabbed Content */}

              {/* Tabbed Content */}

          {/* 3. Dashboard Mode View or In-Place Dashboard Editing */}
          {(viewMode === 'dashboard' || isEditingMode) && (
            <CapabilitySlot
              name="dashboard-renderer"
              props={{
                moduleId: 'KosBranding',
                isEditing: isEditingMode,
                initialSections: defaultBrandingSections,
              }}
              fallback={
                <KosBrandDashboard 
                  onOpenWizard={() => setIsWizardOpen(true)}
                  onOpenScraper={() => setIsScraperModalOpen(true)}
                  onOpenStrategy={() => setIsStrategyModalOpen(true)}
                  onSwitchToTab={(tabId) => {
                    setActiveTab(tabId as TabType);
                    setViewMode('tabs');
                  }}
                />
              }
            />
          )}

          {/* 4. Stepper Mode View - Full Width without 360 preview */}
          {viewMode === 'stepper' && !isEditingMode && (
            <div className="w-full space-y-6">
              <AiStepWizardView onSwitchToTabs={() => setViewMode('tabs')} />
            </div>
          )}

          {/* 4. Full Tabbed Editor View - Full Width without 360 preview */}
          {viewMode === 'tabs' && !isEditingMode && (
            <div className="space-y-6 animate-in fade-in">
              {/* Tabbed Content */}
              <div className="w-full space-y-6">
                {activeTab === 'identity' && <BrandIdentitySection />}
                  {activeTab === 'voice' && <BrandVoiceSection />}
                  {activeTab === 'audience' && <TargetAudienceSection />}
                  {activeTab === 'ecosystem' && <BrandEcosystemSection />}
                  {activeTab === 'design' && <DesignTokensSection />}
                  {activeTab === 'trust' && <TrustCheckoutSection />}
                  {activeTab === 'market' && <MarketResearchAgentSection />}
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

export const BrandDnaHubStandaloneView: React.FC<BrandDnaViewProps> = (props) => {
  const existingContext = useContext(BrandDnaContext);
  if (existingContext) {
    return <BrandDnaContent {...props} />;
  }
  return (
    <BrandDnaProvider>
      <BrandDnaContent {...props} />
    </BrandDnaProvider>
  );
};



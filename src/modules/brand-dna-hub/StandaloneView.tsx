import React, { useState, useEffect, useRef } from 'react';
import { BrandDnaProvider, useBrandDna } from './context/BrandDnaContext';
import { BrandIdentitySection } from './components/BrandIdentitySection';
import { MarketResearchAgentSection } from './components/MarketResearchAgentSection';
import { BrandVoiceSection } from './components/BrandVoiceSection';
import { TargetAudienceSection } from './components/TargetAudienceSection';
import { DesignTokensSection } from './components/DesignTokensSection';
import { TrustCheckoutSection } from './components/TrustCheckoutSection';
import { BrandEcosystemSection } from './components/BrandEcosystemSection';
import { AiDiscoveryWizardModal } from './components/AiDiscoveryWizardModal';
import { AiStepWizardView } from './components/AiStepWizardView';
import { ContentStrategyModal } from './components/ContentStrategyModal';
import { BrandDnaUrlScraperModal } from './components/BrandDnaUrlScraperModal';
import { SmartTooltip } from '../../components/Ui/SmartTooltip';
import {
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
  Sun,
  Moon,
  Globe,
  Layers,
  LayoutList,
  Maximize2,
} from 'lucide-react';

export type TabType = 'identity' | 'voice' | 'audience' | 'ecosystem' | 'design' | 'trust' | 'market';

export const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'identity', label: '1. זהות עסקית ולוגו', icon: Building2 },
  { id: 'voice', label: '2. שפת מותג וטון', icon: Sliders },
  { id: 'audience', label: '3. קהלי יעד ובידול', icon: Target },
  { id: 'ecosystem', label: '4. מבנה שירותים ומוצרים', icon: Layers },
  { id: 'design', label: '5. שפה חזותית ועיצוב', icon: Palette },
  { id: 'trust', label: '6. אמינות וסליקה', icon: ShieldCheck },
  { id: 'market', label: '7. מחקר שוק ומתחרים', icon: Globe },
];

export interface BrandDnaViewProps {
  initialTab?: TabType;
  initialMode?: 'continuous' | 'single' | 'stepper';
}

export const BrandDnaContent: React.FC<BrandDnaViewProps> = ({
  initialTab = 'identity',
  initialMode = 'continuous',
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

  const [viewLayout, setViewLayout] = useState<'continuous' | 'single' | 'stepper'>(initialMode);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('kosun_theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isScraperModalOpen, setIsScraperModalOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const isManualScrolling = useRef(false);

  // Sync Day / Night mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kosun_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kosun_theme', 'light');
    }
  }, [isDarkMode]);

  // Observer to update active anchor tab as user scrolls in continuous mode
  useEffect(() => {
    if (viewLayout !== 'continuous') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrolling.current) return;
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          const tabId = visible.target.id.replace('section-', '') as TabType;
          if (tabId) {
            setActiveTab(tabId);
          }
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    TAB_CONFIG.forEach((tab) => {
      const el = document.getElementById(`section-${tab.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [viewLayout]);

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (viewLayout === 'stepper') {
      setViewLayout('continuous');
    }

    if (viewLayout === 'continuous') {
      isManualScrolling.current = true;
      const el = document.getElementById(`section-${tabId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => {
        isManualScrolling.current = false;
      }, 800);
    }
  };

  const handleSave = async () => {
    const ok = await saveNow();
    if (ok) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <span className="text-sm font-semibold">טוען את נתוני קושאן DNA...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans pb-24" dir="rtl">
      {/* 1. Header Banner - KOSUN 2026 Brand Standard */}
      <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Identity Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/20 shrink-0">
              ק
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  קושאן DNA - מרכז הזהות והמיתוג
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  KOSUN DNA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                השותף החכם שלך לאפיון שפת המותג, לוגו, צבעים וסנכרון מלא לכל הרכיבים
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Completeness Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">שלמות DNA:</span>
              <span
                className={`font-bold font-mono ${
                  completenessScore >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : completenessScore >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {completenessScore}%
              </span>
            </div>

            {/* AI Wizard Quick Modal */}
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="שאלון ראיון מודרך מבוסס AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>ראיון AI</span>
            </button>

            {/* URL Scraper */}
            <button
              type="button"
              onClick={() => setIsScraperModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="סריקת מיתוג מאתר או פייסבוק"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>סרוק אתר</span>
            </button>

            {/* Content Strategy */}
            <button
              type="button"
              onClick={() => setIsStrategyModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="בניית אסטרטגיית תוכן ב-AI"
            >
              <Wand2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">אסטרטגיה</span>
            </button>

            {/* Day / Night Mode */}
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title={isDarkMode ? 'מעבר למצב יום' : 'מעבר למצב לילה'}
              aria-label="החלף מצב תצוגה"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
            </button>

            {/* Save Now Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>שמור עכשיו</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessNotice && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>הגדרות קושאן DNA נשמרו וסונכרנו בהצלחה לכל רכיבי המערכת והקולקציה!</span>
          </div>
        </div>
      )}

      {/* Missing Recommendations Banner */}
      {missingRecommendations.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-3">
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-2xl flex items-center justify-between gap-4 text-indigo-900 dark:text-indigo-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>
                <strong>המלצת קושאן לשדרוג הפרופיל:</strong> {missingRecommendations.slice(0, 2).join(' • ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              השלם בעזרת ראיון AI
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Anchor Menu (תפריט עוגן עליון ללשוניות) */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm mt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
          {/* Anchor Navigation Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
            {TAB_CONFIG.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800'
                  }`}
                  title={tab.label}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Layout Mode Toggle: Bento Continuous vs Single Tab */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewLayout('continuous')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                viewLayout === 'continuous'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="תצוגת גלילת עוגן רציפה - כל האזורים פתוחים ברצף"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>גלילת עוגן</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('single')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                viewLayout === 'single'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="תצוגת לשונית בודדת ממוקדת"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>לשונית בודדת</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* VIEW MODE 1: Stepper Wizard (if initiated) */}
        {viewLayout === 'stepper' && (
          <div className="w-full space-y-6 animate-in fade-in">
            <AiStepWizardView onSwitchToTabs={() => setViewLayout('continuous')} />
          </div>
        )}

        {/* VIEW MODE 2: Single Focused Tab */}
        {viewLayout === 'single' && (
          <div className="w-full space-y-6 animate-in fade-in">
            {activeTab === 'identity' && (
              <div id="section-identity">
                <BrandIdentitySection />
              </div>
            )}
            {activeTab === 'voice' && (
              <div id="section-voice">
                <BrandVoiceSection />
              </div>
            )}
            {activeTab === 'audience' && (
              <div id="section-audience">
                <TargetAudienceSection />
              </div>
            )}
            {activeTab === 'ecosystem' && (
              <div id="section-ecosystem">
                <BrandEcosystemSection />
              </div>
            )}
            {activeTab === 'design' && (
              <div id="section-design">
                <DesignTokensSection />
              </div>
            )}
            {activeTab === 'trust' && (
              <div id="section-trust">
                <TrustCheckoutSection />
              </div>
            )}
            {activeTab === 'market' && (
              <div id="section-market">
                <MarketResearchAgentSection />
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 3: Continuous Bento Scroll (Default & Anchor-linked) */}
        {viewLayout === 'continuous' && (
          <div className="w-full space-y-12">
            {/* Section 1: Identity & Logo */}
            <section id="section-identity" className="scroll-mt-36 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      1. זהות עסקית ולוגו המותג
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      הגדר את ישות הארגון, לוגו, גלריית האווירה וחזון המותג
                    </p>
                  </div>
                </div>
                <SmartTooltip text="זהות המותג מהווה את בסיס הידע שכל רכיבי המערכת וה-AI של קושאן מתבססים עליו." />
              </div>
              <BrandIdentitySection />
            </section>

            {/* Section 2: Voice & Tone */}
            <section id="section-voice" className="scroll-mt-36 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      2. שפת מותג וטון דיבור
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      מטריצת אישיות, מילות עוצמה, מילים אסורות ופנייה לקהל
                    </p>
                  </div>
                </div>
                <SmartTooltip text="טון הדיבור מנחה את סוכני ה-AI והבוטים של קושאן כיצד לנסח הודעות, דפי נחיתה ופוסטים." />
              </div>
              <BrandVoiceSection />
            </section>

            {/* Section 3: Target Audience & Personas */}
            <section id="section-audience" className="scroll-mt-36 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      3. קהלי יעד, פרסונות ובידול
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      אפיון פרופיל הלקוח האידיאלי, התנגדויות ויתרונות תחרותיים
                    </p>
                  </div>
                </div>
                <SmartTooltip text="הגדרת פרסונות לקוח מאפשרת ל-AI ליצור מסרים מותאמים אישית עם יחסי המרה מקסימליים." />
              </div>
              <TargetAudienceSection />
            </section>

            {/* Section 4: Ecosystem & Products */}
            <section id="section-ecosystem" className="scroll-mt-36 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      4. מבנה שירותים, חבילות ומוצרי דגל
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      סל המוצרים והשירותים העסקיים שלך להצגה בעמודי מכירה וטפסים
                    </p>
                  </div>
                </div>
                <SmartTooltip text="מוצרי הדגל נשלפים אוטומטית בעת בניית מחירונים בבונה הדפים ובחנות הדיגיטלית." />
              </div>
              <BrandEcosystemSection />
            </section>

            {/* Section 5: Design Tokens & Visuals */}
            <section id="section-design" className="scroll-mt-36 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/80 border border-pink-200/60 dark:border-pink-800/60 flex items-center justify-center text-pink-600 dark:text-pink-400">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      5. שפה חזותית וטוקנים עיצוביים (Design Tokens)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      פלטת צבעי מותג, סגנון כפתורים, רדיוס פינות וגופן
                    </p>
                  </div>
                </div>
                <SmartTooltip text="טוקנים עיצוביים מסנכרנים את הצבעים והסגנונות לכל עמודי האתר והטפסים במערכת." />
              </div>
              <DesignTokensSection />
            </section>

            {/* Section 6: Trust & Checkout */}
            <section id="section-trust" className="scroll-mt-36 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      6. אמינות, אמון ופרטי סליקה (Trust & Checkout)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      פרטי התקשרות רשמיים, תנאי שימוש וביטחון לתשלום
                    </p>
                  </div>
                </div>
                <SmartTooltip text="פרטי האמון מופיעים בדפי התשלום, חשבוניות ובאזורי צור קשר להגברת האמינות והביטחון." />
              </div>
              <TrustCheckoutSection />
            </section>

            {/* Section 7: Market Research AI Agent */}
            <section id="section-market" className="scroll-mt-36 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      7. סוכן מחקר שוק ומתחרים ב-AI
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      סריקה וניתוח מעמיק של מתחרים, הצעות ערך והזדמנויות צמיחה
                    </p>
                  </div>
                </div>
                <SmartTooltip text="סוכן המחקר סורק ומנתח את השוק כדי לספק לך יתרון יחסי ובידול חד מול המתחרים." />
              </div>
              <MarketResearchAgentSection />
            </section>
          </div>
        )}
      </div>

      {/* Popups & AI Modals */}
      <AiDiscoveryWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      <ContentStrategyModal isOpen={isStrategyModalOpen} onClose={() => setIsStrategyModalOpen(false)} />
      <BrandDnaUrlScraperModal isOpen={isScraperModalOpen} onClose={() => setIsScraperModalOpen(false)} />
    </div>
  );
};

export const BrandDnaHubStandaloneView: React.FC<BrandDnaViewProps> = ({
  initialTab = 'identity',
  initialMode = 'continuous',
}) => {
  return (
    <BrandDnaProvider>
      <BrandDnaContent initialTab={initialTab} initialMode={initialMode} />
    </BrandDnaProvider>
  );
};



import React, { useState } from 'react';
import { BrandDnaProvider, useBrandDna } from './context/BrandDnaContext';
import { BrandIdentitySection } from './components/BrandIdentitySection';
import { BrandVoiceSection } from './components/BrandVoiceSection';
import { TargetAudienceSection } from './components/TargetAudienceSection';
import { DesignTokensSection } from './components/DesignTokensSection';
import { TrustCheckoutSection } from './components/TrustCheckoutSection';
import { LiveOmnichannelPreview } from './components/LiveOmnichannelPreview';
import { AiDiscoveryWizardModal } from './components/AiDiscoveryWizardModal';
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
} from 'lucide-react';

type TabType = 'identity' | 'voice' | 'audience' | 'design' | 'trust';

const TAB_CONFIG: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'identity', label: '1. זהות עסקית', icon: Building2 },
  { id: 'voice', label: '2. שפת מותג וטון', icon: Sliders },
  { id: 'audience', label: '3. קהלי יעד ובידול', icon: Target },
  { id: 'design', label: '4. שפה חזותית', icon: Palette },
  { id: 'trust', label: '5. אמינות וסליקה', icon: ShieldCheck },
];

const BrandDnaContent: React.FC = () => {
  const {
    brandDna,
    isLoading,
    isSaving,
    completenessScore,
    missingRecommendations,
    saveNow,
    resetToDefaults,
  } = useBrandDna();

  const [activeTab, setActiveTab] = useState<TabType>('identity');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-text" dir="rtl">
      {/* 1. Main Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/70 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Fingerprint className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Brand DNA & AI Orchestrator</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                Core Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              מרכז העצבים של זהות המותג: הגדר את ה-DNA העסקי, אישיות המותג ונתוני העיצוב המזינים את כל מודולי ה-AI, הדפים ודפי הסליקה.
            </p>
          </div>
        </div>

        {/* Action Buttons & Completeness Indicator */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Completeness Badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-2xl">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">שלמות ה-DNA</span>
              <span
                className={`text-xs font-bold font-mono ${
                  completenessScore >= 80
                    ? 'text-emerald-400'
                    : completenessScore >= 50
                    ? 'text-amber-400'
                    : 'text-pink-400'
                }`}
              >
                {completenessScore}% הושלם
              </span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 flex items-center justify-center font-mono text-[10px] font-bold text-indigo-300">
              {completenessScore}%
            </div>
          </div>

          {/* AI Discovery Wizard Button */}
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
          >
            <Wand2 className="w-4 h-4" />
            <span>ראיין אותי ב-AI</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>שמור שינויים</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={resetToDefaults}
            className="p-2.5 bg-slate-900/70 hover:bg-slate-700/60 text-slate-400 hover:text-white rounded-2xl border border-slate-700/60 transition-colors"
            title="איפוס להגדרות ברירת מחדל"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccessNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>הגדרות ה-Brand DNA נשמרו וסונכרנו בהצלחה!</span>
        </div>
      )}

      {/* Missing Recommendations Banner */}
      {missingRecommendations.length > 0 && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-4 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>המלצת AI לשדרוג הפרופיל:</strong> {missingRecommendations.slice(0, 2).join(' • ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="text-[11px] underline font-bold hover:text-amber-200 shrink-0"
          >
            השלם באמצעות ראיון AI
          </button>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
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
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Two-Column Layout (Form Section + Live 360° Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Tab Form Content (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'identity' && <BrandIdentitySection />}
          {activeTab === 'voice' && <BrandVoiceSection />}
          {activeTab === 'audience' && <TargetAudienceSection />}
          {activeTab === 'design' && <DesignTokensSection />}
          {activeTab === 'trust' && <TrustCheckoutSection />}
        </div>

        {/* Live Preview Dock (5 Cols on desktop) */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          <LiveOmnichannelPreview />
        </div>
      </div>

      {/* AI Discovery Wizard Modal */}
      <AiDiscoveryWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
};

export const BrandDnaHubStandaloneView: React.FC = () => {
  return (
    <BrandDnaProvider>
      <BrandDnaContent />
    </BrandDnaProvider>
  );
};

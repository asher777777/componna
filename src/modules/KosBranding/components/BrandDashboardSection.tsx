import React, { useState } from 'react';
import { useBrandDna } from '../context/BrandDnaContext';
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Globe, 
  Wand2, 
  Building2, 
  Megaphone,
  ArrowRight,
  ChevronDown,
  Sliders,
  Target,
  Palette,
  ShieldCheck
} from 'lucide-react';

interface BrandDashboardSectionProps {
  onOpenWizard: () => void;
  onOpenScraper: () => void;
  onOpenStrategy: () => void;
  onSwitchToTab: (tabId: string) => void;
}

export const BrandDashboardSection: React.FC<BrandDashboardSectionProps> = ({
  onOpenWizard,
  onOpenScraper,
  onOpenStrategy,
  onSwitchToTab
}) => {
  const { brandDna, completenessScore, missingRecommendations } = useBrandDna();
  const [openAccordion, setOpenAccordion] = useState<string>('identity');

  return (
    <div className="space-y-6 animate-in fade-in" dir="rtl">
      {/* Top Banner removed as per request (Keep only the small desktop badge) */}

      {/* Grid layout removed as per user request */}

      {/* Bottom Section: DNA Snapshot Preview (A&Q Accordion) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            מבט על: נתוני הליבה (תצוגת אקורדיון)
          </h3>
          <button 
            onClick={() => onSwitchToTab('identity')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
          >
            ערוך הכל ידנית <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Identity Accordion */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openAccordion === 'identity' ? 'border-indigo-500/50 shadow-md shadow-indigo-500/10 bg-indigo-50/30 dark:bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'}`}>
            <button 
              onClick={() => setOpenAccordion('identity')}
              className="w-full flex items-center justify-between p-4 text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${openAccordion === 'identity' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span className={`font-bold text-sm ${openAccordion === 'identity' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>1. זהות עסקית</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openAccordion === 'identity' ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'identity' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">שם המותג</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{brandDna.identity.companyName || 'לא הוגדר'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">סלוגן</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{brandDna.identity.slogan || 'לא הוגדר'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">חזון קצר</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{brandDna.identity.shortVision || 'לא הוגדר'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Accordion */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openAccordion === 'voice' ? 'border-indigo-500/50 shadow-md shadow-indigo-500/10 bg-indigo-50/30 dark:bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'}`}>
            <button 
              onClick={() => setOpenAccordion('voice')}
              className="w-full flex items-center justify-between p-4 text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${openAccordion === 'voice' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Sliders className="w-4 h-4" />
                </div>
                <span className={`font-bold text-sm ${openAccordion === 'voice' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>2. שפת מותג וטון</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openAccordion === 'voice' ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'voice' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">מילות כוח משכנעות</span>
                    <div className="flex flex-wrap gap-1.5">
                      {brandDna.voice.powerWords.length > 0 ? brandDna.voice.powerWords.map(w => (
                        <span key={w} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-bold border border-emerald-200 dark:border-emerald-500/20">{w}</span>
                      )) : <span className="text-slate-500 text-xs">לא הוגדרו</span>}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">מילים אסורות</span>
                    <div className="flex flex-wrap gap-1.5">
                      {brandDna.voice.forbiddenWords.length > 0 ? brandDna.voice.forbiddenWords.map(w => (
                        <span key={w} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-md text-[10px] font-bold border border-rose-200 dark:border-rose-500/20">{w}</span>
                      )) : <span className="text-slate-500 text-xs">לא הוגדרו</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audience Accordion */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openAccordion === 'audience' ? 'border-indigo-500/50 shadow-md shadow-indigo-500/10 bg-indigo-50/30 dark:bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'}`}>
            <button 
              onClick={() => setOpenAccordion('audience')}
              className="w-full flex items-center justify-between p-4 text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${openAccordion === 'audience' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Target className="w-4 h-4" />
                </div>
                <span className={`font-bold text-sm ${openAccordion === 'audience' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>3. קהלי יעד ובידול</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openAccordion === 'audience' ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'audience' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">הצעת הערך המרכזית (UVP)</span>
                    <span className="text-slate-800 dark:text-slate-200 text-xs font-semibold">{brandDna.audience.mainUvp || 'לא הוגדר'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">קהלי יעד מרכזיים</span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      {brandDna.audience.targetAudiences.map((aud, i) => (
                        <li key={i}>{aud}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">פרסונות</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                      {brandDna.audience.personas.length} פרסונות מאופיינות
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Design Accordion */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openAccordion === 'design' ? 'border-indigo-500/50 shadow-md shadow-indigo-500/10 bg-indigo-50/30 dark:bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'}`}>
            <button 
              onClick={() => setOpenAccordion('design')}
              className="w-full flex items-center justify-between p-4 text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${openAccordion === 'design' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Palette className="w-4 h-4" />
                </div>
                <span className={`font-bold text-sm ${openAccordion === 'design' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>4. שפה חזותית</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openAccordion === 'design' ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'design' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 text-sm">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundColor: brandDna.designTokens.primaryColor }} />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">צבע ראשי</span>
                      <span className="text-xs font-mono font-semibold" dir="ltr">{brandDna.designTokens.primaryColor}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundColor: brandDna.designTokens.secondaryColor }} />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">צבע משני</span>
                      <span className="text-xs font-mono font-semibold" dir="ltr">{brandDna.designTokens.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Accordion */}
          <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openAccordion === 'trust' ? 'border-indigo-500/50 shadow-md shadow-indigo-500/10 bg-indigo-50/30 dark:bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'}`}>
            <button 
              onClick={() => setOpenAccordion('trust')}
              className="w-full flex items-center justify-between p-4 text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${openAccordion === 'trust' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className={`font-bold text-sm ${openAccordion === 'trust' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>5. אמינות וסליקה</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${openAccordion === 'trust' ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === 'trust' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">טלפון ליצירת קשר</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{brandDna.trust.contactPhone || 'לא הוגדר'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">כתובת משרדים</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{brandDna.trust.officeAddress || 'לא הוגדר'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

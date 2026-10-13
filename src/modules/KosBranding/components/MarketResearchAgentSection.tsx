import React, { useState } from 'react';
import { useBrandDna } from '../hooks/useBrandDna';
import { runMarketResearchAgent } from '../services/geminiBrandPrompt';
import { Globe, Lightbulb, Activity, TrendingUp, Paintbrush, DollarSign, Wand2, Check } from 'lucide-react';

export const MarketResearchAgentSection: React.FC = () => {
  const { brandDna, setFullBrandDna, updateIdentity, updateDesignTokens } = useBrandDna();
  const [isResearching, setIsResearching] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [appliedUpdates, setAppliedUpdates] = useState(false);

  const handleRunResearch = async () => {
    setIsResearching(true);
    setAppliedUpdates(false);
    const result = await runMarketResearchAgent(brandDna);
    setReport(result);
    setIsResearching(false);
  };

  const handleApplyUpdates = () => {
    if (!report?.actionableUpdates) return;
    const { slogan, primaryColor, newService } = report.actionableUpdates;
    
    let updatedBrand = { ...brandDna };
    
    if (slogan) {
      updatedBrand = {
        ...updatedBrand,
        identity: { ...updatedBrand.identity, slogan }
      };
    }
    
    if (primaryColor) {
      updatedBrand = {
        ...updatedBrand,
        designTokens: { ...updatedBrand.designTokens, primaryColor, buttonBgColor: primaryColor }
      };
    }
    
    if (newService) {
      const currentServices = updatedBrand.ecosystem?.services || [];
      if (!currentServices.includes(newService)) {
        updatedBrand = {
          ...updatedBrand,
          ecosystem: {
            products: [],
            annualEvents: [],
            communities: [],
            ...(updatedBrand.ecosystem || {}),
            services: [...currentServices, newService]
          }
        };
      }
    }
    
    setFullBrandDna(updatedBrand);
    setAppliedUpdates(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">סוכן מחקר שוק ומתחרים</h2>
              <p className="text-sm text-indigo-200">ה-AI ינתח את המותג שלך ויספק תובנות, מתחרים, ותמחור מומלץ.</p>
            </div>
          </div>
          
          <button
            onClick={handleRunResearch}
            disabled={isResearching}
            className="mt-6 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            {isResearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                מנתח את השוק...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                {report ? 'הרץ מחקר מחדש' : 'הפעל סוכן מחקר AI'}
              </>
            )}
          </button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trends */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-white">מגמות בשוק</h3>
            </div>
            <ul className="space-y-3">
              {report.marketTrends?.map((trend: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Competitiveness */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-fuchsia-400">
              <Activity className="w-5 h-5" />
              <h3 className="font-bold text-white">יתרון תחרותי ופערים</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {report.competitiveness}
            </p>
          </div>

          {/* Pricing & Design */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-amber-400">
              <DollarSign className="w-5 h-5" />
              <h3 className="font-bold text-white">המלצות תמחור</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {report.pricingRecommendations}
            </p>

            <div className="flex items-center gap-2 mb-4 text-cyan-400 border-t border-slate-700/50 pt-6">
              <Paintbrush className="w-5 h-5" />
              <h3 className="font-bold text-white">שפה עיצובית מומלצת</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {report.designLanguageRecommendations}
            </p>
          </div>

          {/* Competitors */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <Globe className="w-5 h-5" />
              <h3 className="font-bold text-white">מתחרים בולטים</h3>
            </div>
            <div className="space-y-4">
              {report.competitors?.map((comp: any, i: number) => (
                <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{comp.name}</span>
                    <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded-full">
                      תמחור: {comp.pricingTier}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p><span className="text-emerald-400/80">חוזקות:</span> {comp.strengths}</p>
                    <p><span className="text-rose-400/80">חולשות:</span> {comp.weaknesses}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Updates */}
          {report.actionableUpdates && (
            <div className="md:col-span-2 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-bold text-white">עדכונים מומלצים למותג</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {report.actionableUpdates.slogan && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">סלוגן חדש</div>
                    <div className="text-sm font-medium text-white">{report.actionableUpdates.slogan}</div>
                  </div>
                )}
                {report.actionableUpdates.primaryColor && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">צבע ראשי</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: report.actionableUpdates.primaryColor }} />
                      <div className="text-sm font-medium text-white">{report.actionableUpdates.primaryColor}</div>
                    </div>
                  </div>
                )}
                {report.actionableUpdates.newService && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">שירות מומלץ להוספה</div>
                    <div className="text-sm font-medium text-white">{report.actionableUpdates.newService}</div>
                  </div>
                )}
              </div>
              <button
                onClick={handleApplyUpdates}
                disabled={appliedUpdates}
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                {appliedUpdates ? (
                  <>
                    <Check className="w-5 h-5" />
                    ההמלצות יושמו בהצלחה!
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    עדכן את ה-DNA של המותג
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

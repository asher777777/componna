/**
 * CampaignHeaderWidget: Main progress bar, statistics, and quick action buttons
 */

import React from 'react';
import { Target, Users, TrendingUp, Sparkles, Heart, UserPlus, Share2 } from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { Ambassador } from '../types';

interface CampaignHeaderWidgetProps {
  ambassador?: Ambassador | null;
  onOpenDonate?: () => void;
  onOpenAmbassadorModal?: () => void;
}

export const CampaignHeaderWidget: React.FC<CampaignHeaderWidgetProps> = ({
  ambassador,
  onOpenDonate,
  onOpenAmbassadorModal,
}) => {
  const { campaign, setIsAmbassadorModalOpen, setIsDonationDrawerOpen } = useCampaignModule();

  const title = ambassador ? ambassador.name : (campaign?.title || 'קמפיין גיוס שותפים');
  const subtitle = ambassador
    ? `מוביל הקהילה: ${ambassador.leaderName}`
    : (campaign?.subtitle || 'יחד מגיעים אל היעד');
  const targetGoal = ambassador ? ambassador.targetGoal : (campaign?.targetGoal || 100000);
  const totalRaised = ambassador ? ambassador.totalRaised : (campaign?.totalRaised || 0);
  const donorCount = ambassador ? ambassador.donorCount : (campaign?.donorCount || 0);

  const percent = targetGoal > 0 ? Math.min(Math.round((totalRaised / targetGoal) * 100), 100) : 0;
  const remaining = Math.max(targetGoal - totalRaised, 0);

  const handleDonateClick = () => {
    if (onOpenDonate) onOpenDonate();
    else setIsDonationDrawerOpen(true);
  };

  const handleAmbassadorClick = () => {
    if (onOpenAmbassadorModal) onOpenAmbassadorModal();
    else setIsAmbassadorModalOpen(true);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-900/40 relative overflow-hidden dir-rtl">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-indigo-800/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {ambassador ? 'עמוד יעד שגריר וקהילה' : 'קמפיין שגרירים ארצי'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">{title}</h2>
          <p className="text-sm text-indigo-200/80 max-w-2xl">{subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDonateClick}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Heart className="w-4 h-4 fill-slate-950" />
            תרומה לקמפיין
          </button>
          {!ambassador && (
            <button
              onClick={handleAmbassadorClick}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              הצטרף כשגריר
            </button>
          )}
        </div>
      </div>

      {/* Progress & KPIs Grid */}
      <div className="relative z-10 pt-6 space-y-5">
        {/* Progress Bar & Percentage */}
        <div>
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
            <span className="text-indigo-300">
              הושגו <strong className="text-amber-400 font-extrabold text-base">₪{totalRaised.toLocaleString()}</strong> מתוך ₪{targetGoal.toLocaleString()}
            </span>
            <span className="text-amber-400 font-black text-lg">{percent}%</span>
          </div>
          <div className="w-full h-4 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-indigo-700/50 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-amber-500 rounded-full transition-all duration-1000 shadow-md relative"
              style={{ width: `${Math.max(percent, 3)}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
          <div className="bg-slate-800/50 border border-indigo-800/40 rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-xs text-indigo-200/70">יעד לגיוס</div>
            <div className="text-base sm:text-lg font-bold text-white">₪{targetGoal.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/50 border border-indigo-800/40 rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs text-indigo-200/70">נותר ליעד</div>
            <div className="text-base sm:text-lg font-bold text-amber-400">₪{remaining.toLocaleString()}</div>
          </div>

          <div className="bg-slate-800/50 border border-indigo-800/40 rounded-2xl p-3 sm:p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-xs text-indigo-200/70">שותפים ותורמים</div>
            <div className="text-base sm:text-lg font-bold text-white">{donorCount.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

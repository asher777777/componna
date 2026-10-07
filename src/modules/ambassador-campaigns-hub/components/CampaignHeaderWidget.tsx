/**
 * CampaignHeaderWidget: Exact Kampin & Charidy Progress Arrow & Stats Component
 * Matches image 2 from user request:
 * - "הסכום שהושג" title
 * - SVG upward curved trend arrow (Charidy style) with animated green progress & glowing tip
 * - Massive ILS number with ₪ symbol and "גויסו עד כה"
 * - 4 metric pills: Target (₪800,000 יעד), Percentage (%53 הושגו), Remaining (₪377,129 נותרו ליעד), Donors count (159 תורמים)
 * - Ambassador personal view support
 */

import React from 'react';
import { Target, Users, TrendingUp, Sparkles, Heart, ArrowUpRight, ArrowLeft } from 'lucide-react';
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

  const title = ambassador
    ? `הסכום שהושג ע"י ${ambassador.name}`
    : (campaign?.branding?.customSvgPath ? 'הסכום שהושג' : 'הסכום שהושג');

  const targetGoal = ambassador ? ambassador.targetGoal : (campaign?.targetGoal || 100000);
  const totalRaised = ambassador ? ambassador.totalRaised : (campaign?.totalRaised || 0);
  const donorCount = ambassador ? ambassador.donorCount : (campaign?.donorCount || 0);

  const percentage = targetGoal > 0 ? Math.round((totalRaised / targetGoal) * 100) : 0;
  const remaining = Math.max(targetGoal - totalRaised, 0);

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('he-IL').format(num);
  };

  const customPath = campaign?.branding?.customSvgPath;

  // Render SVG Trend Curve matching image 2 (Kampin / Charidy upward trend arrow)
  const renderTrendSvg = () => {
    if (customPath) {
      return (
        <svg viewBox="0 0 400 120" className="w-full h-28 overflow-visible">
          <path d={customPath} fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />
          <path
            d={customPath}
            fill="none"
            stroke="#15803D"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset={400 - (Math.min(100, Math.max(5, percentage)) / 100) * 400}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
      );
    }

    // Upward curved arrow matching Kampin & Charidy
    const progressFactor = Math.min(1, Math.max(0.04, percentage / 100));

    return (
      <svg viewBox="0 0 500 140" className="w-full h-28 sm:h-32 overflow-visible">
        <defs>
          <marker
            id="kampin-arrowhead-bg"
            markerWidth="14"
            markerHeight="14"
            refX="7"
            refY="7"
            orient="auto"
          >
            <polygon points="0 14, 14 7, 0 0" fill="#D1D5DB" />
          </marker>
          <marker
            id="kampin-arrowhead-active"
            markerWidth="14"
            markerHeight="14"
            refX="7"
            refY="7"
            orient="auto"
          >
            <polygon points="0 14, 14 7, 0 0" fill="#15803D" />
          </marker>
        </defs>

        {/* Gray Base Path with Arrowhead */}
        <path
          d="M 50 120 Q 180 110, 270 75 T 450 20"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="11"
          strokeLinecap="round"
          markerEnd="url(#kampin-arrowhead-bg)"
        />

        {/* Green Animated Progress Path */}
        <path
          d="M 50 120 Q 180 110, 270 75 T 450 20"
          fill="none"
          stroke="#166534"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="500"
          strokeDashoffset={500 - progressFactor * 420}
          className="transition-all duration-1000 ease-out"
        />

        {/* Tip Indicator */}
        <circle
          cx={50 + progressFactor * 370}
          cy={120 - progressFactor * 95}
          r="7"
          fill="#15803D"
          className="shadow-md transition-all duration-1000"
        />
      </svg>
    );
  };

  return (
    <section className="w-full py-6 sm:py-8 px-4 flex flex-col items-center justify-center dir-rtl select-none">
      <div className="max-w-3xl w-full text-center flex flex-col items-center gap-3">
        {/* Title: הסכום שהושג */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          {title}
        </h2>

        {/* Dynamic SVG Trend Line with Arrowhead */}
        <div className="w-full max-w-md my-1 px-4 relative flex items-center justify-center">
          {renderTrendSvg()}
        </div>

        {/* Total Raised Big Number */}
        <div className="flex flex-col items-center justify-center gap-0.5">
          <div className="flex items-baseline justify-center gap-2 text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight dir-rtl">
            <span>{formatAmount(totalRaised)}</span>
            <span className="text-emerald-700 text-3xl sm:text-4xl md:text-5xl font-black">₪</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-500">גויסו עד כה</span>
        </div>

        {/* 4 Metric Badges Row matching Kampin */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-3 text-xs sm:text-sm font-bold">
          {/* 1. Target Goal Badge */}
          <div className="flex items-center gap-1.5 bg-white text-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-2xs">
            <Target className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-slate-500 font-medium">יעד:</span>
            <span className="font-black text-slate-900">₪{formatAmount(targetGoal)}</span>
          </div>

          {/* 2. Percentage Badge */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black border shadow-2xs ${
              percentage >= 100
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {percentage >= 100 ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>{percentage}% הושגו (היעד הושלם!)</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>{percentage}% הושגו</span>
              </>
            )}
          </div>

          {/* 3. Remaining to Goal */}
          <div className="flex items-center gap-1.5 bg-white text-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-2xs">
            <span className="text-slate-500 font-medium">נותרו ליעד:</span>
            <span className="font-black text-slate-900">₪{formatAmount(remaining)}</span>
          </div>

          {/* 4. Donor Count */}
          <div className="flex items-center gap-1.5 bg-white text-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-2xs">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-100 shrink-0" />
            <span className="font-black text-slate-900">{donorCount}</span>
            <span className="text-slate-500 font-medium">תורמים</span>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Building2, Sparkles, ChevronDown, ChevronUp, Image as ImageIcon, ExternalLink, Globe } from 'lucide-react';
import { useBrandingActionRunner } from '../common/useBrandingActionRunner';
import { BrandingActionType } from '../common/types';

export interface BrandingIdentityConfig {
  title?: string;
  companyName?: string;
  slogan?: string;
  shortVision?: string;
  logoUrl?: string;
  orgType?: string;
  primaryPurpose?: string;
  brandSummary?: string;
  vibeImages?: string[];
  primaryButtonText?: string;
  primaryButtonAction?: BrandingActionType;
  primaryButtonPayload?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: BrandingActionType;
  secondaryButtonPayload?: string;
  showExpandableDetails?: boolean;
}

export const BrandingIdentitySection: React.FC<{ config: BrandingIdentityConfig }> = ({ config }) => {
  const { runAction } = useBrandingActionRunner();
  const [isExpanded, setIsExpanded] = useState(false);

  const companyName = config.companyName || 'שם המותג טרם הוגדר';
  const slogan = config.slogan || 'סלוגן והצעת ערך מרכזית';
  const logoUrl = config.logoUrl || '';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-right relative overflow-hidden" dir="rtl">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left (in RTL right): Logo + Identity info */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-800"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {companyName.charAt(0) || <Building2 className="w-8 h-8" />}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {companyName}
              </h2>
              {config.orgType && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {config.orgType}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl">
              {slogan}
            </p>

            {config.primaryPurpose && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {config.primaryPurpose}
              </p>
            )}
          </div>
        </div>

        {/* Right (in RTL left): Configurable Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {config.secondaryButtonText && (
            <button
              type="button"
              onClick={() => runAction(config.secondaryButtonAction || 'open_scraper', config.secondaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{config.secondaryButtonText}</span>
            </button>
          )}

          {config.primaryButtonText && (
            <button
              type="button"
              onClick={() => runAction(config.primaryButtonAction || 'open_ai_wizard', config.primaryButtonPayload)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{config.primaryButtonText}</span>
            </button>
          )}

          {/* Rule 7 Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            title={isExpanded ? 'הסתר פרטים נוספים' : 'הצג חזון ותמונות השראה'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Rule 7: Secondary Details Hidden by Default behind button */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-fadeIn">
          {config.shortVision && (
            <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <span className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                חזון מותג ממוקד:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {config.shortVision}
              </p>
            </div>
          )}

          {config.brandSummary && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
              <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                פסקת תמצית מותג (AI Bio):
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {config.brandSummary}
              </p>
            </div>
          )}

          {config.vibeImages && config.vibeImages.length > 0 && (
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                תמונות אווירה והשראה:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {config.vibeImages.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`vibe-${i}`}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

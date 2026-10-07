/**
 * CampaignTiersList: 4-Column responsive tiers grid with full-image or badge shapes
 * Matches exactly the Kampin / LEA UI with circular badge buttons and custom amount box.
 */

import React from 'react';
import { DonationTier, DrawerConfig } from '../types';

export const DEFAULT_CAMPAIGN_TIERS: DonationTier[] = [
  { id: 't1', name: 'שותף', title: 'מתחילה בברכה', amount: 180, monthlyAmount: 180, subtitle: '₪180 לחודש ל-12 חודשים', imageShape: 'circle', isDefault: true },
  { id: 't2', name: 'תומך', title: 'מכפילה הצלחה', amount: 360, monthlyAmount: 360, subtitle: '₪360 לחודש ל-12 חודשים', imageShape: 'circle' },
  { id: 't3', name: 'ידיד', title: 'מרחיבה את הכלי', amount: 550, monthlyAmount: 550, subtitle: '₪550 לחודש ל-12 חודשים', imageShape: 'circle' },
  { id: 't4', name: 'שותף אמת', title: 'פותחת שפע', amount: 770, monthlyAmount: 770, subtitle: '₪770 לחודש ל-12 חודשים', imageShape: 'circle' },
  { id: 't5', name: 'פורצת דרך', title: 'פורצת דרך', amount: 1500, monthlyAmount: 1500, subtitle: '₪1,500 לחודש ל-12 חודשים', imageShape: 'circle' },
];

interface CampaignTiersListProps {
  tiers: DonationTier[];
  donationMode?: 'one_time' | 'recurring' | 'both';
  selectedTierId?: string;
  onSelectTier: (tier: DonationTier) => void;
  onSelectCustomTier: () => void;
  theme?: 'dark' | 'light';
  drawerConfig?: DrawerConfig;
}

export const CampaignTiersList: React.FC<CampaignTiersListProps> = ({
  tiers,
  donationMode = 'recurring',
  selectedTierId,
  onSelectTier,
  onSelectCustomTier,
  theme = 'light',
  drawerConfig,
}) => {
  const isDark = theme === 'dark';
  const effectiveTiers = tiers && tiers.length > 0 ? tiers : DEFAULT_CAMPAIGN_TIERS;

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-2.5 w-full dir-rtl select-none">
      {effectiveTiers.map((t) => {
        const isSelected = selectedTierId === t.id;
        const tierAmount = t.monthlyAmount || t.amount;
        const tierTitle = t.title || t.name;
        const isFullImage =
          (t.displayMode === 'full_image' ||
            t.imageShape === 'full' ||
            drawerConfig?.tierDisplayMode === 'full_image') &&
          Boolean(t.imageSrc);
        const imageShape = t.imageShape || drawerConfig?.tierImageShape || 'circle';

        if (isFullImage && t.imageSrc) {
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTier(t)}
              className={`relative flex flex-col items-center justify-center rounded-2xl transition-all border overflow-hidden aspect-square group cursor-pointer ${
                isSelected
                  ? isDark
                    ? 'border-2 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-950/80 scale-[1.03]'
                    : 'border-2 border-emerald-500 ring-2 ring-emerald-400/60 shadow-md shadow-emerald-200 scale-[1.03]'
                  : isDark
                  ? 'border-slate-700/80 hover:border-slate-500 shadow-xs opacity-90 hover:opacity-100'
                  : 'border-slate-200 hover:border-slate-400 shadow-xs opacity-95 hover:opacity-100'
              }`}
            >
              <img
                src={t.imageSrc}
                alt={tierTitle}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                  ✓
                </div>
              )}
            </button>
          );
        }

        const isCircle = imageShape === 'circle';

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectTier(t)}
            className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-2xl transition-all border text-center group cursor-pointer aspect-square relative ${
              isSelected
                ? isDark
                  ? 'bg-emerald-950/80 border-2 border-emerald-400 ring-2 ring-emerald-400/30 shadow-md scale-[1.03]'
                  : 'bg-emerald-50/60 border-2 border-emerald-500 ring-2 ring-emerald-400/30 shadow-sm scale-[1.03]'
                : isDark
                ? 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 shadow-xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
            }`}
          >
            {/* Kampin Circle Badge with Gold/Green Styling */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 ${
                isCircle ? 'rounded-full' : 'rounded-xl sm:rounded-2xl'
              } flex flex-col items-center justify-center mb-0.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative ${
                isSelected
                  ? isDark
                    ? 'bg-gradient-to-b from-emerald-900 to-[#0e3b2e] border-2 border-emerald-400 text-white'
                    : 'bg-gradient-to-b from-[#0b4d3c] to-[#073629] border-2 border-emerald-500 text-amber-300'
                  : isDark
                  ? 'bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 text-amber-200'
                  : 'bg-gradient-to-b from-[#0f4d3d] to-[#0a382c] border border-emerald-800 text-amber-300'
              }`}
            >
              {t.imageSrc ? (
                <img src={t.imageSrc} alt={tierTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center px-1 text-center leading-none">
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="text-[15px] sm:text-[17px] font-black tracking-tight text-amber-300">
                      {tierAmount}
                    </span>
                    <span className="text-[9px] font-bold text-amber-400/90">*12</span>
                  </div>
                  <div className="w-8 h-[1px] bg-amber-400/30 my-0.5" />
                  <span className="text-[8px] sm:text-[9px] font-medium text-emerald-100/90 line-clamp-1">
                    {tierTitle}
                  </span>
                </div>
              )}

              {isSelected && (
                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs">
                  ✓
                </div>
              )}
            </div>

            <span
              className={`font-black text-[10px] sm:text-xs line-clamp-1 leading-tight mt-0.5 ${
                isSelected
                  ? isDark
                    ? 'text-emerald-300'
                    : 'text-emerald-900'
                  : isDark
                  ? 'text-white'
                  : 'text-slate-800'
              }`}
            >
              ₪{tierAmount}
            </span>
            <span
              className={`text-[9px] font-medium leading-none ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {donationMode === 'recurring' ? 'לחודש' : 'חד פעמי'}
            </span>
          </button>
        );
      })}

      {/* Custom Amount Button matching Kampin */}
      <button
        type="button"
        onClick={onSelectCustomTier}
        className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-2xl transition-all border text-center cursor-pointer aspect-square ${
          selectedTierId === 'custom'
            ? isDark
              ? 'bg-sky-950/80 border-2 border-sky-400 ring-2 ring-sky-400/30 shadow-md scale-[1.03]'
              : 'bg-sky-50 border-2 border-sky-500 ring-2 ring-sky-400/30 shadow-sm scale-[1.03]'
            : isDark
            ? 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 shadow-xs'
            : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 flex flex-col items-center justify-center mb-0.5 shadow-2xs`}
        >
          <span className="text-[10px] font-black leading-none text-sky-700">סכום</span>
          <span className="text-[11px] font-black leading-none mt-0.5 text-sky-900">אחר</span>
        </div>
        <span
          className={`font-black text-[10px] sm:text-xs leading-tight mt-0.5 ${
            selectedTierId === 'custom'
              ? isDark
                ? 'text-sky-300'
                : 'text-sky-800'
              : isDark
              ? 'text-white'
              : 'text-slate-800'
          }`}
        >
          אחר
        </span>
        <span
          className={`text-[9px] font-medium leading-none ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          חופשי
        </span>
      </button>
    </div>
  );
};

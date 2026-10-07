/**
 * CampaignTiersWidget: Interactive donation tiers & tracks cards
 */

import React from 'react';
import { Heart, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { DonationTier, Ambassador } from '../types';
import { DEFAULT_TIERS } from '../config';

interface CampaignTiersWidgetProps {
  ambassador?: Ambassador | null;
  onSelectTier?: (tier: DonationTier) => void;
}

export const CampaignTiersWidget: React.FC<CampaignTiersWidgetProps> = ({
  ambassador,
  onSelectTier,
}) => {
  const { campaign, setIsDonationDrawerOpen, setSelectedTierForDonation } = useCampaignModule();

  const tiers = campaign?.campaignTiers?.tiers || DEFAULT_TIERS;

  const handleChoose = (tier: DonationTier) => {
    setSelectedTierForDonation(tier);
    if (onSelectTier) {
      onSelectTier(tier);
    } else {
      setIsDonationDrawerOpen(true);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dir-rtl">
      <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
        <h3 className="text-2xl font-black text-slate-900">מסלולי שותפות ותרומה</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          בחר את מסלול השותפות המתאים לך {ambassador ? `עבור קהילת ${ambassador.name}` : 'והיה חלק מהצלחת הקמפיין'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 relative ${
              tier.popular
                ? 'border-indigo-600 bg-gradient-to-b from-indigo-50/70 to-white shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-indigo-300 bg-white hover:shadow-sm'
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                המסלול הנבחר
              </span>
            )}

            <div>
              <h4 className="text-base font-black text-slate-900 mb-1">{tier.name}</h4>
              <p className="text-xs text-slate-500 min-h-[32px] line-clamp-2">{tier.description}</p>

              <div className="my-5 pb-5 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-indigo-950">₪{tier.amount.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ חודשי (×12)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  או תרומה חד פעמית בסך ₪{tier.amount.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleChoose(tier)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                tier.popular
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              בחר מסלול זה
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

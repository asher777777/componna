import React, { useState } from 'react';
import { CampaignTiersSectionConfig } from '../../types/sectionConfigs';
import { Heart, Sparkles, Check } from 'lucide-react';
import { clsx } from 'clsx';

export const CampaignTiersSection: React.FC<{
  config: CampaignTiersSectionConfig;
  onSelectAmount?: (amount: number, type: 'one_time' | 'recurring') => void;
}> = ({ config, onSelectAmount }) => {
  const {
    anchorId,
    title = 'בחרו סכום לתרומה',
    subtitle = 'כל תרומה מקדמת אותנו אל היעד',
    donationType = 'both',
    backgroundColor = 'transparent',
    tiers = [
      { id: '1', title: 'שותף בבניין', amount: 180, description: 'תמיכה חודשית בפעילות', isPopular: false },
      { id: '2', title: 'בונה עולם', amount: 360, description: 'הקדשת יום לימוד שלם', isPopular: true, badgeText: 'הכי נבחר' },
      { id: '3', title: 'עמוד התווך', amount: 1000, description: 'הנצחה על לוח התורמים', isPopular: false },
    ],
  } = config;

  const [activeType, setActiveType] = useState<'one_time' | 'recurring'>('one_time');
  const [customAmount, setCustomAmount] = useState('');

  const handleDonate = (amount: number) => {
    if (onSelectAmount) {
      onSelectAmount(amount, activeType);
    } else {
      alert(`תודה על תרומתך בסך ₪${amount} (${activeType === 'recurring' ? 'הוראת קבע' : 'חד-פעמי'})!`);
    }
  };

  return (
    <section
      id={anchorId || 'campaignTiers'}
      className="w-full py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>

        {donationType === 'both' && (
          <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveType('one_time')}
              className={clsx(
                'px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
                activeType === 'one_time'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              תרומה חד-פעמית
            </button>
            <button
              type="button"
              onClick={() => setActiveType('recurring')}
              className={clsx(
                'px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
                activeType === 'recurring'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              הוראת קבע חודשית
            </button>
          </div>
        )}

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={clsx(
                'relative bg-slate-900/80 border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-md',
                tier.isPopular
                  ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 z-10'
                  : 'border-slate-800 hover:border-slate-700'
              )}
            >
              {tier.badgeText && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-black shadow-lg">
                  {tier.badgeText}
                </div>
              )}

              <div className="flex flex-col gap-3 text-right">
                <h3 className="text-lg font-bold text-white">{tier.title}</h3>
                <div className="flex items-baseline gap-1 text-3xl font-black text-white">
                  <span>₪{tier.amount.toLocaleString()}</span>
                  {activeType === 'recurring' && <span className="text-xs text-slate-400 font-normal">/ חודש</span>}
                </div>
                {tier.description && <p className="text-xs text-slate-400 leading-relaxed">{tier.description}</p>}
              </div>

              <button
                type="button"
                onClick={() => handleDonate(tier.amount)}
                className={clsx(
                  'mt-6 w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer',
                  tier.isPopular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                )}
              >
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400/20" />
                <span>תרום ₪{tier.amount.toLocaleString()}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Custom Amount Box */}
        <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <input
            type="number"
            placeholder="הזן סכום אחר לתרומה (₪)..."
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            disabled={!customAmount || parseInt(customAmount) <= 0}
            onClick={() => handleDonate(parseInt(customAmount))}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer transition-all shrink-0"
          >
            תרום סכום זה
          </button>
        </div>
      </div>
    </section>
  );
};

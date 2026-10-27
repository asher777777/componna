/**
 * LiveDonationAlert: Real-time floating ticker alert for recent donations
 */

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { Donation } from '../types';

export const LiveDonationAlert: React.FC = () => {
  const { donations } = useCampaignModule();

  const [currentDonation, setCurrentDonation] = useState<Donation | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const completedDonations = donations.filter((d) => d.paymentStatus === 'completed');

  useEffect(() => {
    if (dismissed || completedDonations.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      setCurrentDonation(completedDonations[index % completedDonations.length]);
      setVisible(true);

      // Hide after 5 seconds
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      index++;
      return () => clearTimeout(hideTimer);
    }, 12000);

    // Initial show after 2 seconds
    const initTimer = setTimeout(() => {
      setCurrentDonation(completedDonations[0]);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initTimer);
    };
  }, [completedDonations.length, dismissed]);

  if (!visible || !currentDonation || dismissed) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-sm w-auto animate-bounce-in dir-rtl transition-all">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-indigo-500/40 shadow-2xl rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
          <Heart className="w-5 h-5 fill-slate-950" />
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
            <Sparkles className="w-3 h-3" />
            תרומה חדשה התקבלה הרגע!
          </div>
          <div className="text-xs font-black text-white mt-0.5">
            {currentDonation.donorName} תרם/ה{' '}
            <strong className="text-amber-400 font-extrabold">₪{currentDonation.amount.toLocaleString()}</strong>
          </div>
          {currentDonation.ambassadorName && (
            <div className="text-[10px] text-indigo-300 mt-0.5">
              עבור קהילת {currentDonation.ambassadorName}
            </div>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors mr-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

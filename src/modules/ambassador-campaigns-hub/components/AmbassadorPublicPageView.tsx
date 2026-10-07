/**
 * AmbassadorPublicPageView: Dedicated public landing micro-portal for an ambassador
 */

import React from 'react';
import { ArrowRight, Share2, Copy, Heart, Check, Target, Users, Sparkles, MessageCircle } from 'lucide-react';
import { Ambassador } from '../types';
import { CampaignHeaderWidget } from './CampaignHeaderWidget';
import { CampaignTiersWidget } from './CampaignTiersWidget';
import { CampaignDonorsWidget } from './CampaignDonorsWidget';
import { DonationDrawer } from './DonationDrawer';

interface AmbassadorPublicPageViewProps {
  ambassador: Ambassador;
  onBack?: () => void;
}

export const AmbassadorPublicPageView: React.FC<AmbassadorPublicPageViewProps> = ({
  ambassador,
  onBack,
}) => {
  const [isDonateOpen, setIsDonateOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const getShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://comona.io';
    return `${origin}/${ambassador.slug}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      `שלום! שותפים יקרים, פתחתי עמוד קהילה ויעד אישי בקמפיין השותפים: ${url}\nביחד נגיע ליעד של ₪${ambassador.targetGoal.toLocaleString()}! אשמח לשותפות שלכם.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-16 dir-rtl">
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowRight className="w-4 h-4" />
              חזור ללוח הראשי
            </button>
          )}
          <span className="text-sm font-black text-slate-800">עמוד שגריר: {ambassador.name}</span>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'הועתק!' : 'העתק קישור'}
          </button>
          <button
            onClick={handleWhatsApp}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            שתף בוואטסאפ
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Ambassador Header Widget */}
        <CampaignHeaderWidget
          ambassador={ambassador}
          onOpenDonate={() => setIsDonateOpen(true)}
        />

        {/* Ambassador Vision & Story Card */}
        {ambassador.message && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-xs uppercase tracking-wide mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              חזון מוביל הקהילה
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              המטרה שלנו בקהילת {ambassador.name}
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {ambassador.message}
            </p>

            {ambassador.gallery && ambassador.gallery.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ambassador.gallery.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`תמונת קהילה ${i + 1}`}
                    className="w-full h-48 object-cover rounded-2xl shadow-xs border border-slate-100"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tiers Widget */}
        <CampaignTiersWidget
          ambassador={ambassador}
          onSelectTier={() => setIsDonateOpen(true)}
        />

        {/* Donors Widget specific to this ambassador */}
        <CampaignDonorsWidget
          ambassador={ambassador}
          onOpenDonate={() => setIsDonateOpen(true)}
        />
      </div>

      {/* Donation Drawer */}
      <DonationDrawer
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        ambassador={ambassador}
      />
    </div>
  );
};

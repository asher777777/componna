/**
 * AmbassadorPublicPageView: Dedicated public landing micro-portal for an ambassador
 * Now uses CampaignPublicLandingView for full layout, tiers, sticky bar, and blue pencil editor.
 */

import React from 'react';
import { ArrowRight, Share2, Copy, Check } from 'lucide-react';
import { Ambassador } from '../types';
import { CampaignPublicLandingView } from './CampaignPublicLandingView';

interface AmbassadorPublicPageViewProps {
  ambassador: Ambassador;
  onBack?: () => void;
}

export const AmbassadorPublicPageView: React.FC<AmbassadorPublicPageViewProps> = ({
  ambassador,
  onBack,
}) => {
  const [copied, setCopied] = React.useState(false);

  const getShareUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kosun.io';
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
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 dir-rtl">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>חזור ללוח הראשי</span>
            </button>
          )}
          <span className="text-sm font-black text-slate-800">
            עמוד קהילה: {ambassador.name}
          </span>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'הועתק!' : 'העתק קישור'}</span>
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>שתף בוואטסאפ</span>
          </button>
        </div>
      </div>

      {/* Render Full Digital Landing View with Ambassador Scope */}
      <CampaignPublicLandingView
        campaignSlug={ambassador.slug}
        ambassador={ambassador}
        onBackToDashboard={onBack}
        canEdit={true}
      />
    </div>
  );
};

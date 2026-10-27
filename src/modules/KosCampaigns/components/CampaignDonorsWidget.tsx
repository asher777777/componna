/**
 * CampaignDonorsWidget: Main tabs matching LEA & Kampin:
 * - Tab 1: Donors list with cards and dedicate messages (159 תורמים)
 * - Tab 2: Ambassadors and personal targets (12 שגרירים ויעדים אישיים)
 * - Tab 3: Campaign Story and Vision (אודות הקמפיין)
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Heart,
  Users,
  Target,
  Clock,
  Sparkles,
  UserPlus,
  Share2,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { useCampaignModule } from '../context/CampaignModuleContext';
import { Donation, Ambassador } from '../types';

interface CampaignDonorsWidgetProps {
  ambassador?: Ambassador | null;
  onOpenAmbassadorModal?: () => void;
  onOpenDonate?: () => void;
}

export const CampaignDonorsWidget: React.FC<CampaignDonorsWidgetProps> = ({
  ambassador,
  onOpenAmbassadorModal,
  onOpenDonate,
}) => {
  const {
    campaign,
    donations,
    ambassadors,
    setIsAmbassadorModalOpen,
    setIsDonationDrawerOpen,
  } = useCampaignModule();

  const [activeTab, setActiveTab] = useState<'donors' | 'ambassadors' | 'about'>('donors');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'top'>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const completedDonations = useMemo(() => {
    let list = donations.filter((d) => d.paymentStatus === 'completed');

    if (ambassador) {
      list = list.filter(
        (d) => d.ambassadorId === ambassador.id || d.ambassadorName === ambassador.name
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (d) =>
          d.donorName.toLowerCase().includes(q) ||
          (d.dedication && d.dedication.toLowerCase().includes(q)) ||
          (d.ambassadorName && d.ambassadorName.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'top') {
      return [...list].sort((a, b) => b.amount - a.amount);
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [donations, ambassador, searchTerm, sortBy]);

  const handleCopyLink = (amb: Ambassador) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kosun.io';
    navigator.clipboard.writeText(`${origin}/${amb.slug}`);
    setCopiedId(amb.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsApp = (amb: Ambassador) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kosun.io';
    const text = encodeURIComponent(
      `שלום! שותפים יקרים, הצטרפו לקהילת ${amb.name}: ${origin}/${amb.slug}\nביחד נגיע ליעד של ₪${amb.targetGoal.toLocaleString()}!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'הרגע';
      if (mins < 60) return `לפני ${mins} דקות`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `לפני ${hours} שעות`;
      const days = Math.floor(hours / 24);
      return `לפני ${days} ימים`;
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-slate-200/80 dir-rtl select-none">
      {/* Main Kampin Tabs Row matching image 2 */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 border-b border-slate-200 pb-3 text-sm sm:text-base font-black">
        {/* Tab 1: Donors */}
        <button
          type="button"
          onClick={() => setActiveTab('donors')}
          className={`pb-2.5 transition-all cursor-pointer relative ${
            activeTab === 'donors'
              ? 'text-emerald-800 border-b-2 border-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{completedDonations.length} תורמים</span>
        </button>

        {/* Tab 2: Ambassadors & Goals */}
        {!ambassador && (
          <button
            type="button"
            onClick={() => setActiveTab('ambassadors')}
            className={`pb-2.5 transition-all cursor-pointer flex items-center gap-1.5 relative ${
              activeTab === 'ambassadors'
                ? 'text-emerald-800 border-b-2 border-emerald-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4 text-amber-500" />
            <span>{ambassadors.length} שגרירים ויעדים אישיים</span>
          </button>
        )}

        {/* Tab 3: About / Campaign Story */}
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`pb-2.5 transition-all cursor-pointer relative ${
            activeTab === 'about'
              ? 'text-emerald-800 border-b-2 border-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>אודות הקמפיין</span>
        </button>
      </div>

      {/* Tab 1 Content: Donors List */}
      {activeTab === 'donors' && (
        <div className="pt-6 space-y-5">
          {/* Controls: Search and Recent / Top toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש לפי שם או הקדשה..."
                className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSortBy('recent')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'recent'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                האחרונים
              </button>
              <button
                type="button"
                onClick={() => setSortBy('top')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  sortBy === 'top'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                מובילים
              </button>
            </div>
          </div>

          {/* Donors Cards Grid */}
          {completedDonations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Heart className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">לא נמצאו תרומות להצגה</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[550px] overflow-y-auto pl-1">
              {completedDonations.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-900 text-emerald-100 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                        {d.isAnonymous ? '?' : d.donorName.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {d.isAnonymous ? 'אנונימי' : d.donorName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(d.createdAt)}
                          </span>
                          {d.tier && (
                            <span className="text-[10px] px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              {d.tier}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-lg font-black text-emerald-800">
                        ₪{d.amount.toLocaleString()}
                      </span>
                      {d.isRecurring && (
                        <span className="block text-[10px] text-slate-400 font-semibold">
                          הו"ק חודשית
                        </span>
                      )}
                    </div>
                  </div>

                  {d.dedication && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60 italic text-right">
                      "{d.dedication}"
                    </p>
                  )}

                  {d.ambassadorName && !ambassador && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 self-start flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>ע"י {d.ambassadorName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Ambassadors List */}
      {activeTab === 'ambassadors' && (
        <div className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambassadors.map((amb) => {
              const percent =
                amb.targetGoal > 0
                  ? Math.min(Math.round((amb.totalRaised / amb.targetGoal) * 100), 100)
                  : 0;
              const isCopied = copiedId === amb.id;

              return (
                <div
                  key={amb.id}
                  className="rounded-2xl p-4.5 border border-slate-200 hover:border-emerald-400 bg-white hover:shadow-md transition-all flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="text-base font-black text-slate-900">{amb.name}</h4>
                        <span className="text-xs text-slate-500 block">
                          מוביל: {amb.leaderName}
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {percent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">
                          הושגו: <strong className="text-slate-900">₪{amb.totalRaised.toLocaleString()}</strong>
                        </span>
                        <span className="text-slate-400">יעד: ₪{amb.targetGoal.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percent, 2)}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 text-left">
                        {amb.donorCount} תורמים
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(amb)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'הועתק!' : 'העתק קישור'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsApp(amb)}
                      className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>שתף</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() =>
                onOpenAmbassadorModal
                  ? onOpenAmbassadorModal()
                  : setIsAmbassadorModalOpen(true)
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>הצטרף כמוביל קהילה והקם יעד אישי</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3 Content: Campaign Story & Vision */}
      {activeTab === 'about' && (
        <div className="pt-6 space-y-4 text-slate-800 leading-relaxed text-sm sm:text-base">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
            {campaign?.brandName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>קמפיין ממותג רשמי ע"י {campaign.brandName}</span>
              </div>
            )}
            <h4 className="font-black text-lg text-slate-900 mb-2">
              {campaign?.storyContent?.heading || 'חזון הקמפיין והמטרות'}
            </h4>
            <p className="whitespace-pre-line text-slate-700">
              {campaign?.storyContent?.body ||
                campaign?.description ||
                'קמפיין שותפים מרכזי לקידום הפעילות והשגת היעדים השנתיים. ביחד כל הקהילות שותפות להצלחה.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

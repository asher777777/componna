/**
 * CampaignDonorsWidget: Live interactive donors feed & dedications wall
 */

import React, { useState, useMemo } from 'react';
import { Search, Heart, Award, Clock, User, Filter, Sparkles, UserPlus } from 'lucide-react';
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
  const { donations, setIsAmbassadorModalOpen, setIsDonationDrawerOpen } = useCampaignModule();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'top'>('recent');

  const filteredDonations = useMemo(() => {
    let list = donations.filter((d) => d.paymentStatus === 'completed');

    if (ambassador) {
      list = list.filter((d) => d.ambassadorId === ambassador.id || d.ambassadorName === ambassador.name);
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

    if (activeTab === 'top') {
      return [...list].sort((a, b) => b.amount - a.amount);
    }

    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [donations, ambassador, searchTerm, activeTab]);

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
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dir-rtl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            לוח שותפים ותורמים
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {filteredDonations.length} תרומות התקבלו {ambassador ? `עבור קהילת ${ambassador.name}` : 'בקמפיין'}
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש לפי שם או הקדשה..."
              className="pr-9 pl-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56"
            />
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'recent' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              האחרונים
            </button>
            <button
              onClick={() => setActiveTab('top')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'top' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              מובילים
            </button>
          </div>
        </div>
      </div>

      {/* Donors List Grid */}
      <div className="pt-6">
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <User className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-semibold">לא נמצאו תרומות התואמות את החיפוש</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pl-1">
            {filteredDonations.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/30 border border-slate-200/70 hover:border-indigo-200 transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {d.isAnonymous ? '?' : d.donorName.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{d.donorName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(d.createdAt)}
                        </span>
                        {d.tier && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">
                            {d.tier}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-base font-black text-emerald-700">₪{d.amount.toLocaleString()}</span>
                    {d.isRecurring && <span className="block text-[10px] text-slate-400 font-semibold">הו"ק חודשית</span>}
                  </div>
                </div>

                {d.dedication && (
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                    "{d.dedication}"
                  </p>
                )}

                {d.ambassadorName && !ambassador && (
                  <div className="text-[11px] text-slate-400 border-t border-slate-200/50 pt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    דרך שגריר: <strong className="text-slate-600">{d.ambassadorName}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Call to Action */}
      {!ambassador && (
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 p-5 rounded-2xl border border-indigo-100">
          <div>
            <h4 className="text-sm font-black text-indigo-950">רוצה להוביל קהילה ולקחת יעד אישי?</h4>
            <p className="text-xs text-indigo-700">הצטרף כשגריר, קבל עמוד אישי והובל את מעגל החברים שלך להצלחה.</p>
          </div>
          <button
            onClick={() => (onOpenAmbassadorModal ? onOpenAmbassadorModal() : setIsAmbassadorModalOpen(true))}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            פתח עמוד שגריר
          </button>
        </div>
      )}
    </div>
  );
};

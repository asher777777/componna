import React, { useState } from 'react';
import { CampaignDonorsSectionConfig } from '../../types/sectionConfigs';
import { Users, Search, Heart, Award, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export const CampaignDonorsSection: React.FC<{ config: CampaignDonorsSectionConfig }> = ({ config }) => {
  const {
    anchorId,
    title = 'תורמים אחרונים ושגרירים',
    showSearch = true,
    showSort = true,
    cardLayout = 'grid-3',
    backgroundColor = 'transparent',
    donors = [
      { id: '1', name: 'משפחת כהן', amount: 1800, date: 'לפני שעתיים', message: 'לרפואת כל חולי עמו ישראל', isAnonymous: false },
      { id: '2', name: 'תורם אנונימי', amount: 500, date: 'לפני 4 שעות', isAnonymous: true },
      { id: '3', name: 'ישראל ישראלי', amount: 360, date: 'אתמול', message: 'בהצלחה רבה בפעילות הקדושה!', isAnonymous: false },
      { id: '4', name: 'משפחת לוי', amount: 1000, date: 'לפני יומיים', message: 'להצלחת הילדים בלימודים', isAnonymous: false },
      { id: '5', name: 'אברהם אבינו', amount: 2500, date: 'לפני 3 ימים', message: 'יישר כח עצום!', isAnonymous: false },
      { id: '6', name: 'ידיד אמת', amount: 180, date: 'לפני 4 ימים', isAnonymous: false },
    ],
  } = config;

  const [search, setSearch] = useState('');
  const [filterSort, setFilterSort] = useState<'recent' | 'highest'>('recent');

  const filteredDonors = donors
    .filter((d) => (d.isAnonymous ? 'אנונימי' : d.name).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (filterSort === 'highest') return b.amount - a.amount;
      return 0;
    });

  return (
    <section
      id={anchorId || 'campaignDonors'}
      className="w-full py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>
            <p className="text-xs text-slate-400 mt-1">רשימת השותפים והתורמים היקרים שתמכו בפעילות</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {showSearch && (
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="חיפוש תורם..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {showSort && (
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="recent">לפי תאריך</option>
                <option value="highest">הסכומים הגבוהים</option>
              </select>
            )}
          </div>
        </div>

        {/* Donors Grid */}
        <div
          className={clsx(
            'grid gap-4',
            cardLayout === 'grid-2' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {filteredDonors.map((donor) => (
            <div
              key={donor.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {donor.isAnonymous ? '?' : donor.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">
                      {donor.isAnonymous ? 'תורם אנונימי' : donor.name}
                    </span>
                    {donor.date && <span className="text-[11px] text-slate-500">{donor.date}</span>}
                  </div>
                </div>

                <span className="text-base font-black text-emerald-400 shrink-0">
                  ₪{donor.amount.toLocaleString()}
                </span>
              </div>

              {donor.message && (
                <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 italic leading-relaxed">
                  "{donor.message}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React, { useEffect, useState } from 'react';
import { CampaignDonorsSectionConfig } from '../../types/sectionConfigs';
import { Users, Search, Heart, Award, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { collection, onSnapshot } from 'firebase/firestore';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant';
import { resolveStylePresetTokens } from '../../utils/stylePresetTheme';

export const CampaignDonorsSection: React.FC<{ config: CampaignDonorsSectionConfig }> = ({ config }) => {
  const styleTokens = resolveStylePresetTokens((config as any).stylePreset || (config as any).layout);
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const {
    anchorId,
    title = 'תורמים אחרונים ושגרירים',
    showSearch = true,
    showSort = true,
    cardLayout = 'grid-3',
    backgroundColor = 'transparent',
    donors: configDonors = [],
  } = config;

  const campaignId = (config as any).campaignId && (config as any).campaignId !== 'default-campaign'
    ? (config as any).campaignId
    : 'home';

  const [liveDonors, setLiveDonors] = useState<any[]>([]);
  const [liveAmbassadors, setLiveAmbassadors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'donors' | 'ambassadors' | 'about'>('donors');
  const aboutContent = (config as any).aboutContent as string | undefined;

  useEffect(() => {
    if (!db || !tenantId || !campaignId) return;
    const donationsRef = collection(db, 'tenants', tenantId, 'mod_campaigns', campaignId, 'donations');
    const unsub = onSnapshot(
      donationsRef,
      (snap) => {
        const list = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const rawDate = d.createdAt || d.date || '';
          let formattedDate = '';
          if (typeof rawDate === 'string' && rawDate) {
            const parsed = new Date(rawDate);
            formattedDate = isNaN(parsed.getTime()) ? rawDate : parsed.toLocaleDateString('he-IL');
          }
          return {
            id: docSnap.id,
            name: d.donorName || d.name || 'תורם יקר',
            amount: Number(d.amount || 0),
            date: formattedDate,
            createdAtMs: typeof rawDate === 'string' ? new Date(rawDate).getTime() || 0 : 0,
            message: d.dedication || d.message || d.notes || '',
            ambassadorName: d.ambassadorName || d.ambassador || '',
            isAnonymous: Boolean(d.isAnonymous),
          };
        });
        list.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setLiveDonors(list);
      },
      (err) => console.warn('[CampaignDonorsSection] donations snapshot warning:', err)
    );

    const ambassadorsRef = collection(db, 'tenants', tenantId, 'mod_campaigns', campaignId, 'ambassadors');
    const unsubAmb = onSnapshot(
      ambassadorsRef,
      (snap) => {
        const list = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setLiveAmbassadors(list);
      },
      (err) => console.warn('[CampaignDonorsSection] ambassadors snapshot warning:', err)
    );

    return () => {
      unsub();
      unsubAmb();
    };
  }, [db, tenantId, campaignId]);

  const donors = liveDonors.length > 0 ? liveDonors : configDonors;

  const [search, setSearch] = useState('');
  const [filterSort, setFilterSort] = useState<'recent' | 'highest'>('recent');

  const filteredDonors = donors
    .filter((d) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        (d.isAnonymous ? 'אנונימי' : (d.name || '')).toLowerCase().includes(q) ||
        (d.message || '').toLowerCase().includes(q) ||
        (d.ambassadorName || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (filterSort === 'highest') return Number(b.amount || 0) - Number(a.amount || 0);
      return 0;
    });

  const getInitials = (name?: string) => {
    const parts = (name || 'ת').trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0] || ''}${parts[1][0] || ''}`;
    return (parts[0] || 'ת').slice(0, 2);
  };

  return (
    <section
      id={anchorId || 'campaignDonors'}
      className={clsx('w-full py-12 px-4 sm:px-6 lg:px-8', styleTokens.sectionWrapperClass)}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          {(liveAmbassadors.length > 0 || aboutContent) && (
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('donors')}
                className={clsx(
                  'pb-3 text-sm sm:text-base font-extrabold border-b-2 transition-colors cursor-pointer',
                  activeTab === 'donors'
                    ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                {donors.length} תורמים
              </button>
              {liveAmbassadors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('ambassadors')}
                  className={clsx(
                    'pb-3 text-sm sm:text-base font-extrabold border-b-2 transition-colors cursor-pointer',
                    activeTab === 'ambassadors'
                      ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  {liveAmbassadors.length} שגרירים ויעדים אישיים
                </button>
              )}
              {aboutContent && (
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className={clsx(
                    'pb-3 text-sm sm:text-base font-extrabold border-b-2 transition-colors cursor-pointer',
                    activeTab === 'about'
                      ? 'border-emerald-700 text-emerald-800 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  אודות הקמפיין
                </button>
              )}
            </div>
          )}

          {activeTab === 'donors' && (
            <>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h2>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {showSearch && (
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="חיפוש תורם או ברכה..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  )}

                  {showSort && (
                    <select
                      value={filterSort}
                      onChange={(e) => setFilterSort(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                    >
                      <option value="recent">הכי עדכני</option>
                      <option value="highest">הכי גבוה</option>
                    </select>
                  )}
                </div>
              </div>

              <div
                className={clsx(
                  'grid gap-4',
                  cardLayout === 'grid-2' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                )}
              >
                {filteredDonors.map((donor) => (
                  <div
                    key={donor.id}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 transition-all shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {donor.isAnonymous ? '?' : getInitials(donor.name)}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {donor.isAnonymous ? 'אנונימי' : (donor.name || 'תורם יקר')}
                          </span>
                          {donor.date && <span className="text-[11px] text-slate-500">{donor.date}</span>}
                        </div>
                      </div>

                      <span className="text-base font-black text-emerald-700 dark:text-emerald-400 shrink-0">
                        ₪{Number(donor.amount || 0).toLocaleString()}
                      </span>
                    </div>

                    {donor.ambassadorName && (
                      <div className="flex">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                          <Sparkles className="w-3 h-3" /> ע&quot;י {donor.ambassadorName}
                        </span>
                      </div>
                    )}

                    {donor.message && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 italic leading-relaxed">
                        &quot;{donor.message}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'ambassadors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveAmbassadors.map((amb) => {
                const raised = Number(amb.totalRaised || 0);
                const goal = Number(amb.targetGoal || 1);
                const pct = Math.min(Math.round((raised / goal) * 100), 100);
                return (
                  <div key={amb.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">{amb.name || amb.leaderName || 'שגריר'}</span>
                      <span className="text-xs font-bold text-emerald-700">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>₪{raised.toLocaleString()}</span>
                      <span>יעד: ₪{goal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'about' && aboutContent && (
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 prose max-w-none text-right"
              dangerouslySetInnerHTML={{ __html: aboutContent }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

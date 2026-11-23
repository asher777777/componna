import React, { useEffect, useState } from 'react';
import { CampaignHeaderSectionConfig } from '../../types/sectionConfigs';
import { Target, TrendingUp, Users, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant';
import { resolveStylePresetTokens } from '../../utils/stylePresetTheme';

export const CampaignHeaderSection: React.FC<{ config: CampaignHeaderSectionConfig }> = ({ config }) => {
  const styleTokens = resolveStylePresetTokens((config as any).stylePreset || (config as any).layout);
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const {
    anchorId,
    title,
    subtitle,
    targetGoal: configGoal = 100000,
    totalRaised: configRaised = 0,
    donorsCount: configDonorsCount = 0,
    daysLeft = 14,
    backgroundColor = 'transparent',
    accentColor = '#4f46e5',
  } = config;

  const campaignId = (config as any).campaignId && (config as any).campaignId !== 'default-campaign'
    ? (config as any).campaignId
    : 'home';

  const [liveStats, setLiveStats] = useState<{
    totalRaised?: number;
    targetGoal?: number;
    donorCount?: number;
    title?: string;
  } | null>(null);
  const [donationsAggregate, setDonationsAggregate] = useState<{ total: number; count: number } | null>(null);

  useEffect(() => {
    if (!db || !tenantId || !campaignId) return;

    const campRef = doc(db, 'tenants', tenantId, 'mod_campaigns', campaignId);
    const unsubCamp = onSnapshot(
      campRef,
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setLiveStats({
            totalRaised: typeof d.totalRaised === 'number' ? d.totalRaised : undefined,
            targetGoal: typeof d.targetGoal === 'number' ? d.targetGoal : undefined,
            donorCount: typeof d.donorCount === 'number' ? d.donorCount : undefined,
            title: d.title,
          });
        }
      },
      (err) => console.warn('[CampaignHeaderSection] campaign snapshot warning:', err)
    );

    const donationsRef = collection(db, 'tenants', tenantId, 'mod_campaigns', campaignId, 'donations');
    const unsubDon = onSnapshot(
      donationsRef,
      (snap) => {
        if (!snap.empty) {
          let sum = 0;
          snap.forEach((d) => {
            sum += Number(d.data().amount || 0);
          });
          setDonationsAggregate({ total: sum, count: snap.size });
        }
      },
      (err) => console.warn('[CampaignHeaderSection] donations snapshot warning:', err)
    );

    return () => {
      unsubCamp();
      unsubDon();
    };
  }, [db, tenantId, campaignId]);

  const targetGoal = configGoal && configGoal !== 100000 ? configGoal : (liveStats?.targetGoal ?? configGoal);
  const totalRaised = liveStats?.totalRaised ?? donationsAggregate?.total ?? configRaised;
  const donorsCount = liveStats?.donorCount ?? donationsAggregate?.count ?? configDonorsCount;
  const resolvedTitle = title || liveStats?.title || '';
  const svgTrendPreset = (config as any).svgTrendPreset as string | undefined;

  const percentage = Math.min(Math.round((totalRaised / (targetGoal || 1)) * 100), 100);

  if (svgTrendPreset) {
    const progressRatio = Math.min(Math.max(totalRaised / (targetGoal || 1), 0), 1);
    const pathLen = 540;
    const dashOffset = pathLen * (1 - progressRatio);

    return (
      <section
        id={anchorId || 'campaignHeader'}
        className="w-full py-10 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white"
        style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
        dir="rtl"
      >
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-4">
          {subtitle && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {subtitle}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            {resolvedTitle || 'הסכום שהושג'}
          </h2>

          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl sm:text-6xl font-black text-emerald-800 tracking-tight">
              ₪{totalRaised.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              גויסו עד כה מתוך יעד של ₪{targetGoal.toLocaleString()}
            </span>
          </div>

          <div className="w-full max-w-lg my-2">
            <svg viewBox="0 0 500 140" className="w-full h-28 overflow-visible" aria-hidden="true">
              <path
                d="M 20 120 Q 250 115 470 22"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 20 120 Q 250 115 470 22"
                fill="none"
                stroke="#036846"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={pathLen}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
              />
              <polygon points="478,18 452,14 466,38" fill="#036846" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold">
              {percentage}% הושגו
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm">
              יעד: ₪{targetGoal.toLocaleString()}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm">
              נותרו ליעד: ₪{Math.max(0, targetGoal - totalRaised).toLocaleString()}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm">
              {donorsCount} תורמים
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={anchorId || 'campaignHeader'}
      className={clsx('w-full py-12 px-4 sm:px-6 lg:px-8', styleTokens.sectionWrapperClass)}
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="text-center max-w-2xl mx-auto mb-8 flex flex-col items-center gap-2">
          {subtitle && (
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {subtitle}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {resolvedTitle}
          </h2>
        </div>

        {/* Progress Display */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-baseline justify-between text-slate-900 dark:text-white">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400">
                ₪{totalRaised.toLocaleString()}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">שגויסו עד כה</span>
            </div>
            <div className="text-left">
              <span className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">
                יעד: ₪{targetGoal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>{percentage}% הושלמו מהיעד</span>
            <span>נותרו ₪{Math.max(0, targetGoal - totalRaised).toLocaleString()} לסיום הקמפיין</span>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50">
            <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-1" />
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{donorsCount}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">תורמים שהצטרפו</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50">
            <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400 mb-1" />
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{daysLeft}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">ימים לסיום</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50">
            <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mb-1" />
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{percentage}%</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">אחוז הצלחה</span>
          </div>
        </div>
      </div>
    </section>
  );
};

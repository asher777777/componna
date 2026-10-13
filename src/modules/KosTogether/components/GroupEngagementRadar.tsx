import React, { useMemo } from 'react';
import {
  Sparkles,
  Award,
  HeartHandshake,
  UserCheck,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { ContactRecord, SmartGroup } from '../types';

interface GroupEngagementRadarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const GroupEngagementRadar: React.FC<GroupEngagementRadarProps> = ({
  isOpen = false,
  onToggle,
}) => {
  const { activeGroup, filteredContacts } = useCrmGroups();

  // Calculate engagement metrics
  const metrics = useMemo(() => {
    if (filteredContacts.length === 0) {
      return {
        score: 0,
        topAdvocatesCount: 0,
        regularDonorsCount: 0,
        newMembersCount: 0,
        totalDonations: 0,
        avgDonation: 0,
      };
    }

    let topAdvocates = 0;
    let regularDonors = 0;
    let newMembers = 0;
    let totalDonations = 0;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    filteredContacts.forEach((c) => {
      const spent = Number(c.total_spent || 0);
      const camp = Number(c.campaign_amount || 0);
      const donation = Math.max(spent, camp);
      totalDonations += donation;

      if (donation >= 5000 || (c.tags && c.tags.includes('שגריר מוביל'))) {
        topAdvocates++;
      } else if (donation >= 1000) {
        regularDonors++;
      }

      if (c.createdAt && new Date(c.createdAt).getTime() > thirtyDaysAgo) {
        newMembers++;
      }
    });

    const avg = Math.round(totalDonations / filteredContacts.length);

    // Engagement score 0 - 100
    const withPhoneCount = filteredContacts.filter((c) => Boolean(c.conta_phone)).length;
    const phoneRatio = withPhoneCount / filteredContacts.length;
    const donorRatio = filteredContacts.filter((c) => Number(c.total_spent || 0) > 0).length / filteredContacts.length;
    const advocateBonus = Math.min(25, topAdvocates * 5);

    const calculatedScore = Math.min(
      100,
      Math.max(
        15,
        Math.round(phoneRatio * 40 + donorRatio * 35 + advocateBonus)
      )
    );

    return {
      score: activeGroup.engagementScore || calculatedScore,
      topAdvocatesCount: topAdvocates,
      regularDonorsCount: regularDonors,
      newMembersCount: newMembers,
      totalDonations,
      avgDonation: avg,
    };
  }, [filteredContacts, activeGroup.engagementScore]);

  if (!isOpen) {
    return null;
  }

  const getStatusText = (score: number) => {
    if (score >= 80) return 'קהילת על תוססת ומובילה';
    if (score >= 50) return 'קהילה פעילה ויציבה';
    return 'קהילה בצמיחה והתרחבות';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/60 rounded-3xl p-5 shadow-xs animate-in fade-in duration-200 space-y-4">
      {/* Bar Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>מדד מעורבות קהילתית וניתוח שגרירים</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                Engagement Heatmap
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              שקלול אינטראקציות, תרומות, ותק ושגרירים מובילים ב-
              <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">
                {activeGroup.name}
              </span>
            </p>
          </div>
        </div>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 font-bold transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="סגור סרגל מידע"
          >
            <span>סגור</span>
            <span className="text-slate-400 font-mono text-xs">✕</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Radar Score Box */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center shrink-0">
            <span className="text-lg font-black font-mono text-indigo-700 dark:text-indigo-300">
              {metrics.score}
            </span>
            <span className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              SCORE
            </span>
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse"
              title="מדד פעיל"
            />
          </div>

          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ציון מעורבות קהילתית
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              דירוג משוקלל בזמן אמת לפי פעילות חברי הקהילה
            </div>
          </div>
        </div>

        {/* Dynamic Engagement Badges */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Top Advocates Badge */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 px-3 py-2 rounded-2xl flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">שגרירים</span>
              <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                {metrics.topAdvocatesCount}
              </span>
            </div>
          </div>

          {/* Regular Donors Badge */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 px-3 py-2 rounded-2xl flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">תורמים מתמידים</span>
              <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                {metrics.regularDonorsCount}
              </span>
            </div>
          </div>

          {/* New Members Badge */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 px-3 py-2 rounded-2xl flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">חברים חדשים</span>
              <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                {metrics.newMembersCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar of Community Health */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>בריאות ואיכות הקהילה:</span>
            <span className="text-indigo-700 dark:text-indigo-300 font-extrabold">
              {getStatusText(metrics.score)}
            </span>
          </div>
          <span className="font-mono text-indigo-600 dark:text-indigo-400">{metrics.score}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-indigo-500 via-emerald-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${metrics.score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

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

export const GroupEngagementRadar: React.FC = () => {
  const { activeGroup, filteredContacts, activeGroupId } = useCrmGroups();

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
    // Weighted by active percentage with phones/emails, top advocates, and donation participation
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

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-indigo-900/40 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Radar Title & Score */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex flex-col items-center justify-center shrink-0 shadow-inner">
            <span className="text-xl font-black font-mono text-indigo-300">
              {metrics.score}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
              Score
            </span>
            <div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"
              title="מדד פעיל בזמן אמת"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white">
                מדד מעורבות קהילתית (Engagement Heatmap)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              שקלול אינטראקציות, תרומות, ותק ושגרירים מובילים ב-
              <span className="text-indigo-300 font-bold mr-1">
                {activeGroup.name}
              </span>
            </p>
          </div>
        </div>

        {/* Dynamic Engagement Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Top Advocates Badge */}
          <div className="bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-2 transition-colors">
            <Award className="w-4 h-4 text-amber-300 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">שגרירים מובילים</span>
              <span className="text-xs font-black font-mono text-white">
                {metrics.topAdvocatesCount}
              </span>
            </div>
          </div>

          {/* Regular Donors Badge */}
          <div className="bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-2 transition-colors">
            <HeartHandshake className="w-4 h-4 text-rose-300 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">תורמים מתמידים</span>
              <span className="text-xs font-black font-mono text-white">
                {metrics.regularDonorsCount}
              </span>
            </div>
          </div>

          {/* New Members Badge */}
          <div className="bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-2xl flex items-center gap-2 transition-colors">
            <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">חברים חדשים (30 יום)</span>
              <span className="text-xs font-black font-mono text-white">
                {metrics.newMembersCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar of Community Health */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>בריאות ואיכות הקהילה:</span>
            <span className="text-indigo-200">
              {metrics.score >= 80 ? 'קהילת על תוססת 🔥' : metrics.score >= 50 ? 'קהילה פעילה ויציבה ⚡' : 'קהילה בצמיחה והתרחבות 🌱'}
            </span>
          </div>
          <span className="font-mono text-indigo-300">{metrics.score}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-indigo-400 via-emerald-400 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${metrics.score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

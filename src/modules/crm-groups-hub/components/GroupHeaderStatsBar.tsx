import React from 'react';
import {
  Users,
  MessageCircle,
  Globe,
  Tag,
  Zap,
  Target,
  ExternalLink,
  Edit3,
  HeartHandshake,
  Download,
  Plus,
  Share2,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { SmartGroup } from '../types';
import { exportContactsToCsv } from '../services/groupsUtils';

interface GroupHeaderStatsBarProps {
  currentTab: 'contacts' | 'interactions';
  onTabChange: (tab: 'contacts' | 'interactions') => void;
  onOpenEditGroup: (group: SmartGroup) => void;
  onOpenCreateGroup: (mode: 'group' | 'community' | 'smart') => void;
  onOpenWhatsAppBroadcast: () => void;
  onOpenWhatsAppImport: () => void;
  interactionsCount?: number;
}

export const GroupHeaderStatsBar: React.FC<GroupHeaderStatsBarProps> = ({
  currentTab,
  onTabChange,
  onOpenEditGroup,
  onOpenCreateGroup,
  onOpenWhatsAppBroadcast,
  onOpenWhatsAppImport,
  interactionsCount = 0,
}) => {
  const { activeGroupId, activeGroup, filteredContacts, onOpenCampaignPage } = useCrmGroups();

  const isCustomGroup = !activeGroupId.startsWith('__');
  const targetGoal = activeGroup.targetGoal || 0;
  const currentRaised = activeGroup.currentRaised || 0;
  const percentReached = targetGoal > 0 ? Math.min(100, Math.round((currentRaised / targetGoal) * 100)) : 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Right Section: Title, Badges & Sub-tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shrink-0 ring-4 ring-slate-100 shadow-2xs"
              style={{ backgroundColor: activeGroup.color || '#4f46e5' }}
            />
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{activeGroup.name}</span>
              {isCustomGroup && (
                <button
                  type="button"
                  onClick={() => onOpenEditGroup(activeGroup)}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="ערוך הגדרות קבוצה / יעד"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </h1>
          </div>

          {/* Group Type Badge */}
          {isCustomGroup && (
            <div className="flex items-center gap-1.5">
              {activeGroup.isCommunity ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-indigo-600" />
                  קהילה עם עמוד
                </span>
              ) : activeGroup.type === 'smart' ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-600" />
                  קבוצה חכמה
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-500" />
                  קבוצת תגיות
                </span>
              )}
            </div>
          )}

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Sub-tabs: Contacts vs Interactions */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => onTabChange('contacts')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'contacts'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>אנשי קשר</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700">
                {filteredContacts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('interactions')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'interactions'
                  ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>אינטראקציות</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700">
                {interactionsCount}
              </span>
            </button>
          </div>
        </div>

        {/* Left Section: Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* WhatsApp Broadcast */}
          <button
            type="button"
            onClick={onOpenWhatsAppBroadcast}
            className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-200 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>וואטסאפ לקהילה</span>
          </button>

          {/* WhatsApp Import */}
          <button
            type="button"
            onClick={onOpenWhatsAppImport}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">ייבוא מוואטסאפ</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => exportContactsToCsv(filteredContacts, activeGroup.name)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="ייצא רשימת אנשי קשר לקובץ CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Community Specific Details: Target Goal Progress, Public Page Link */}
      {isCustomGroup && activeGroup.isCommunity && (
        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {targetGoal > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span>יעד גיוס: ₪{targetGoal.toLocaleString()}</span>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      {percentReached}% הושלמו
                    </span>
                  </div>
                  {/* Small progress bar */}
                  <div className="w-36 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${percentReached}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeGroup.leaderName && (
              <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/70">
                <span className="text-slate-400">מוביל הקהילה:</span>{' '}
                <span className="font-bold text-slate-800">{activeGroup.leaderName}</span>
              </div>
            )}

            {activeGroup.campaignTitle && (
              <div className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 font-semibold flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
                <span>קמפיין: {activeGroup.campaignTitle}</span>
              </div>
            )}
          </div>

          {/* Public Page Link */}
          {activeGroup.pageUrl && (
            <a
              href={activeGroup.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (onOpenCampaignPage) {
                  e.preventDefault();
                  onOpenCampaignPage(activeGroup.pageUrl!);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 transition-colors shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>צפה בעמוד הקהילה הציבורי</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

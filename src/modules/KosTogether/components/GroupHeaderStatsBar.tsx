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
import { exportContactsToExcel } from '../services/groupsUtils';

interface GroupHeaderStatsBarProps {
  currentTab: 'contacts' | 'interactions';
  onTabChange: (tab: 'contacts' | 'interactions') => void;
  onOpenEditGroup: (group: SmartGroup) => void;
  onOpenCreateGroup: (mode: 'group' | 'community' | 'smart') => void;
  onOpenWhatsAppBroadcast: () => void;
  onOpenWhatsAppImport: () => void;
  onOpenCommunityPortal?: () => void;
  onOpenCommunityChat?: () => void;
  interactionsCount?: number;
  isRadarOpen?: boolean;
  onToggleRadar?: () => void;
  isActionsBarOpen?: boolean;
  onToggleActionsBar?: () => void;
}

export const GroupHeaderStatsBar: React.FC<GroupHeaderStatsBarProps> = ({
  currentTab,
  onTabChange,
  onOpenEditGroup,
  onOpenCreateGroup,
  onOpenWhatsAppBroadcast,
  onOpenWhatsAppImport,
  onOpenCommunityPortal,
  onOpenCommunityChat,
  interactionsCount = 0,
  isRadarOpen = false,
  onToggleRadar,
  isActionsBarOpen = false,
  onToggleActionsBar,
}) => {
  const { activeGroupId, activeGroup, filteredContacts, onOpenCampaignPage } = useCrmGroups();

  const isCustomGroup = !activeGroupId.startsWith('__');
  const targetGoal = activeGroup.targetGoal || 0;
  const currentRaised = activeGroup.currentRaised || 0;
  const percentReached = targetGoal > 0 ? Math.min(100, Math.round((currentRaised / targetGoal) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Top Bar: Title & Sub-tabs (Right) + CRM-Style Action Controls (Left) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Right Section: Title, Badges & Sub-tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shrink-0 ring-4 ring-slate-100 dark:ring-slate-800 shadow-2xs"
              style={{ backgroundColor: activeGroup.color || '#4f46e5' }}
            />
            <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{activeGroup.name}</span>
              {isCustomGroup && (
                <button
                  type="button"
                  onClick={() => onOpenEditGroup(activeGroup)}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
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
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold flex items-center gap-1">
                  <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  קהילה עם עמוד
                </span>
              ) : activeGroup.type === 'smart' ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  קבוצה חכמה
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-500" />
                  קבוצת תגיות
                </span>
              )}
            </div>
          )}

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Sub-tabs: Contacts vs Interactions */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => onTabChange('contacts')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'contacts'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>אנשי קשר</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                {filteredContacts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('interactions')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'interactions'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>אינטראקציות</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                {interactionsCount}
              </span>
            </button>
          </div>
        </div>

        {/* Left Section: Action Area (Matching CRM & Analytics Standard) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Heatmap/Stats Bar Trigger */}
          {onToggleRadar && (
            <button
              type="button"
              onClick={onToggleRadar}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isRadarOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title="הצג/הסתר סרגל מדד מעורבות קהילתית"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>מדד מעורבות</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                {activeGroup.engagementScore || 41}
              </span>
            </button>
          )}

          {/* Quick Actions Drawer Toggle */}
          {onToggleActionsBar && (
            <button
              type="button"
              onClick={onToggleActionsBar}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isActionsBarOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title="פתח/סגור תפריט פעולות קהילה וסנכרון"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>פעולות מהירות</span>
            </button>
          )}

          {/* Primary Action 1: WhatsApp Broadcast */}
          <button
            type="button"
            onClick={onOpenWhatsAppBroadcast}
            className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>וואטסאפ לקהילה</span>
          </button>

          {/* Primary Action 2: Community Portal / Chat */}
          {onOpenCommunityPortal && (
            <button
              type="button"
              onClick={onOpenCommunityPortal}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="פורטל קהילה, פיד ויעדים"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>פורטל קהילה</span>
            </button>
          )}

          {/* Excel Export */}
          <button
            type="button"
            onClick={() => exportContactsToExcel(filteredContacts, activeGroup.name)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="ייצוא רשימת אנשי קשר לקובץ Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">EXCEL</span>
          </button>
        </div>
      </div>

      {/* Collapsible Action Tiles Section (Like CrmIngestionActionsBar) */}
      {isActionsBarOpen && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              פעולות תקשורת, סנכרון וניהול קהילה
            </span>
            <button
              type="button"
              onClick={onToggleActionsBar}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold cursor-pointer"
            >
              סגור תפריט
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {/* 1. WhatsApp Broadcast Tile */}
            <button
              type="button"
              onClick={onOpenWhatsAppBroadcast}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 transition group text-center cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">שידור וואטסאפ</span>
              <span className="text-[10px] text-emerald-600/80">הודעות וסקרים</span>
            </button>

            {/* 2. Community Chat & Video Tile */}
            {onOpenCommunityChat && (
              <button
                type="button"
                onClick={onOpenCommunityChat}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 transition group text-center cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">צ'אט ווידאו</span>
                <span className="text-[10px] text-indigo-600/80">חדר קהילתי</span>
              </button>
            )}

            {/* 3. WhatsApp Import Tile */}
            <button
              type="button"
              onClick={onOpenWhatsAppImport}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 transition group text-center cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">ייבוא מוואטסאפ</span>
              <span className="text-[10px] text-teal-600/80">חילוץ משתתפים</span>
            </button>

            {/* 4. Create Community / Group Tile */}
            <button
              type="button"
              onClick={() => onOpenCreateGroup('community')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-800 dark:text-violet-200 transition group text-center cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">קהילה חדשה</span>
              <span className="text-[10px] text-violet-600/80">יצירה והגדרות</span>
            </button>

            {/* 5. Export Excel Tile */}
            <button
              type="button"
              onClick={() => exportContactsToExcel(filteredContacts, activeGroup.name)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition group text-center cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">ייצוא לאקסל</span>
              <span className="text-[10px] text-slate-500">קובץ .xlsx</span>
            </button>
          </div>
        </div>
      )}

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

          {/* Public Page Link / Portal View */}
          <div className="flex items-center gap-2">
            {onOpenCommunityChat && (
              <button
                type="button"
                onClick={onOpenCommunityChat}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
                title="כניסה לצ'אט הפנימי של הקהילה"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>צ'אט ווידאו</span>
              </button>
            )}

            {onOpenCommunityPortal && (
              <button
                type="button"
                onClick={onOpenCommunityPortal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>פורטל קהילה ופיד</span>
              </button>
            )}

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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-colors shadow-2xs"
              >
                <span>עמוד ציבורי</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

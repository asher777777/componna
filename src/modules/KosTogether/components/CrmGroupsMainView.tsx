import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Users, 
  MessageCircle, 
  Globe, 
  Sparkles, 
  Share2, 
  Plus, 
  LayoutGrid, 
  Settings,
  HelpCircle,
  Wrench
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { GroupListSidebar } from './GroupListSidebar';
import { GroupHeaderStatsBar } from './GroupHeaderStatsBar';
import { GroupContactsTable } from './GroupContactsTable';
import { GroupInteractionsTab } from './GroupInteractionsTab';
import { GroupEditModal } from './GroupEditModal';
import { GroupTransferModal } from './GroupTransferModal';
import { GroupAddMembersModal } from './GroupAddMembersModal';
import { WhatsAppBroadcastModal } from './WhatsAppBroadcastModal';
import { WhatsAppGroupImportView } from './WhatsAppGroupImportView';
import { GroupEngagementRadar } from './GroupEngagementRadar';
import { CommunityMicroPortalView } from './CommunityMicroPortalView';
import { CommunityChatRoomView } from './CommunityChatRoomView';
import { SmartGroup } from '../types';

export const CrmGroupsMainView: React.FC = () => {
  const { loading, onOpenContactDetail, activeGroup, filteredContacts, groups } = useCrmGroups();

  const [mainMode, setMainMode] = useState<'manage' | 'whatsapp_import' | 'micro_portal' | 'community_chat'>('manage');
  const [currentTab, setCurrentTab] = useState<'contacts' | 'interactions'>('contacts');

  // Hidden collapsible bars states (hidden by default per KOSUN Constitution)
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isActionsBarOpen, setIsActionsBarOpen] = useState(false);

  // Floating Side Drawer State (Hidden by default according to Constitution)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Day/Night mode state (Light mode is default)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Modal States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'group' | 'community' | 'smart'>('group');
  const [editingGroup, setEditingGroup] = useState<SmartGroup | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<'add' | 'move'>('add');

  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [isWhatsAppBroadcastOpen, setIsWhatsAppBroadcastOpen] = useState(false);
  const [broadcastTargetIds, setBroadcastTargetIds] = useState<string[] | undefined>(undefined);

  const handleOpenCreateGroup = (mode: 'group' | 'community' | 'smart') => {
    setEditingGroup(null);
    setGroupModalMode(mode);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: SmartGroup) => {
    setEditingGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleOpenTransferModal = (mode: 'add' | 'move') => {
    setTransferMode(mode);
    setIsTransferModalOpen(true);
  };

  const handleOpenWhatsAppBroadcast = (contactIds?: string[]) => {
    setBroadcastTargetIds(contactIds);
    setIsWhatsAppBroadcastOpen(true);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-12 text-slate-400 font-sans" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">טוען קהילות וקבוצות CRM...</p>
        </div>
      </div>
    );
  }

  if (mainMode === 'whatsapp_import') {
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-50/50 p-4 md:p-8 space-y-6 text-right font-sans" dir="rtl">
        <WhatsAppGroupImportView onBackToManage={() => setMainMode('manage')} />
      </div>
    );
  }

  if (mainMode === 'micro_portal') {
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-50/50 p-4 md:p-8 space-y-6 text-right font-sans" dir="rtl">
        <CommunityMicroPortalView
          community={activeGroup}
          contacts={filteredContacts}
          onBackToManage={() => setMainMode('manage')}
        />
      </div>
    );
  }

  if (mainMode === 'community_chat') {
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-50/50 p-4 md:p-8 space-y-6 text-right font-sans" dir="rtl">
        <CommunityChatRoomView
          community={activeGroup}
          contacts={filteredContacts}
          onBack={() => setMainMode('manage')}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden text-right font-sans" dir="rtl">
      {/* 1. Day / Night mode floating button (fixed top-4 left-4, light default) */}
      <div className="fixed top-4 left-4 z-40">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="החלף מצב יום / לילה"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
      </div>

      {/* 2. Floating Menu Trigger Button (fixed top-4 right-4, Official Kosun Symbol + English name) */}
      <div className="fixed top-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="h-10 px-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-900 dark:text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <img
            src="/images/kosun-symbol.svg"
            onError={(e: any) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/kosun-official-logo.png';
            }}
            alt="KOSUN"
            className="w-5 h-5 object-contain"
          />
          <span className="font-extrabold text-xs tracking-tight">KosTogether</span>
          <Menu className="w-4 h-4 text-slate-400 mr-1" />
        </button>
      </div>

      {/* 3. Floating Side Drawer (Hidden by default, opened on floating icon click, with 'x' to close) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        >
          <aside
            className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col p-4 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/kosun-symbol.svg"
                  onError={(e: any) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/kosun-official-logo.png';
                  }}
                  alt="KOSUN"
                  className="w-6 h-6 object-contain"
                />
                <span className="font-black text-sm text-slate-900 dark:text-white">KosTogether</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="סגור תפריט"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical Drawer Links */}
            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto text-xs font-bold text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => { setMainMode('manage'); setCurrentTab('contacts'); setIsDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right ${
                  mainMode === 'manage' && currentTab === 'contacts'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>חברי קהילות וקבוצות CRM</span>
              </button>

              <button
                type="button"
                onClick={() => { setMainMode('micro_portal'); setIsDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right ${
                  (mainMode as string) === 'micro_portal'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Globe className="w-4 h-4 text-indigo-600" />
                <span>פורטל קהילה, יעדים ופיד</span>
              </button>

              <button
                type="button"
                onClick={() => { setMainMode('community_chat'); setIsDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right ${
                  (mainMode as string) === 'community_chat'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>צ'אט פנימי ושיחות וידאו</span>
              </button>

              <button
                type="button"
                onClick={() => { setMainMode('whatsapp_import'); setIsDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right ${
                  (mainMode as string) === 'whatsapp_import'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>ייבוא חברים מקבוצות וואטסאפ</span>
              </button>

              <button
                type="button"
                onClick={() => { handleOpenCreateGroup('community'); setIsDrawerOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-right"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>יצירת קהילה חדשה</span>
              </button>

              <button
                type="button"
                onClick={() => { handleOpenWhatsAppBroadcast(); setIsDrawerOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-right"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>שידור וואטסאפ וסקרים</span>
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-500">
                סה"כ {groups.length} קהילות וקבוצות רשומות
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area - 0px Top with padding for content */}
      <div className="pt-16 px-4 md:px-8 pb-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar */}
          <GroupListSidebar
            onOpenCreateGroup={handleOpenCreateGroup}
            onOpenEditGroup={handleOpenEditGroup}
          />

          {/* Right Main Content */}
          <div className="flex-1 w-full space-y-6 min-w-0">
            {/* Hidden Collapsible Community Engagement Radar (Engagement Heatmap) */}
            <GroupEngagementRadar
              isOpen={isRadarOpen}
              onToggle={() => setIsRadarOpen(false)}
            />

            {currentTab === 'contacts' ? (
              <GroupContactsTable
                onOpenTransferModal={handleOpenTransferModal}
                onOpenAddMembersModal={() => setIsAddMembersModalOpen(true)}
                onOpenWhatsAppBroadcast={() => handleOpenWhatsAppBroadcast()}
                onOpenContactDetail={onOpenContactDetail}
                onOpenCommunityPortal={() => setMainMode('micro_portal')}
                onOpenCommunityChat={() => setMainMode('community_chat')}
                onOpenWhatsAppImport={() => setMainMode('whatsapp_import')}
                isRadarOpen={isRadarOpen}
                onToggleRadar={() => setIsRadarOpen((prev) => !prev)}
                currentTab={currentTab}
                onTabChange={setCurrentTab}
              />
            ) : (
              <GroupInteractionsTab />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <GroupEditModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        editingGroup={editingGroup}
        initialMode={groupModalMode}
      />

      <GroupTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        mode={transferMode}
      />

      <GroupAddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
      />

      <WhatsAppBroadcastModal
        isOpen={isWhatsAppBroadcastOpen}
        onClose={() => setIsWhatsAppBroadcastOpen(false)}
        targetContactIds={broadcastTargetIds}
      />
    </div>
  );
};

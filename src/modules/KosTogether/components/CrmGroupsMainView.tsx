import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Users, 
  MessageCircle, 
  Globe, 
  Sparkles, 
  Share2, 
  Plus, 
  LayoutGrid, 
  Settings,
  HelpCircle,
  Wrench,
  UserPlus,
  MessageSquare,
  Brain,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { GroupSelectorDropdown } from './GroupSelectorDropdown';
import { GroupHeaderStatsBar } from './GroupHeaderStatsBar';
import { GroupContactsTable } from './GroupContactsTable';
import { GroupInteractionsTab } from './GroupInteractionsTab';
import { CommunityGrowthTab } from './CommunityGrowthTab';
import { SmartCommunityRulesModal } from './SmartCommunityRulesModal';
import { GroupEditModal } from './GroupEditModal';
import { GroupTransferModal } from './GroupTransferModal';
import { GroupAddMembersModal } from './GroupAddMembersModal';
import { WhatsAppBroadcastModal } from './WhatsAppBroadcastModal';
import { WhatsAppGroupImportView } from './WhatsAppGroupImportView';
import { GroupEngagementRadar } from './GroupEngagementRadar';
import { CommunityMicroPortalView } from './CommunityMicroPortalView';
import { CommunityChatRoomView } from './CommunityChatRoomView';
import { SmartGroup, GroupRule } from '../types';

export const CrmGroupsMainView: React.FC = () => {
  const {
    loading,
    onOpenContactDetail,
    activeGroup,
    filteredContacts,
    contacts,
    groups,
    availableCities,
    saveGroup,
    bulkAssignToGroup,
  } = useCrmGroups();

  const [mainMode, setMainMode] = useState<'manage' | 'whatsapp_import' | 'micro_portal' | 'community_chat'>('manage');
  const [currentTab, setCurrentTab] = useState<'grow' | 'contacts' | 'interactions'>('contacts');

  // Sticky Collapsible actions toolbar state (הצמד את סרגל הפעולות ואפשר הסתר שלו)
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);

  // Hidden collapsible bars states (hidden by default per KOSUN Constitution)
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isActionsBarOpen, setIsActionsBarOpen] = useState(false);

  // Floating Side Drawer State (Hidden by default according to Constitution)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'group' | 'community' | 'smart'>('group');
  const [editingGroup, setEditingGroup] = useState<SmartGroup | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<'add' | 'move'>('add');

  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [isWhatsAppBroadcastOpen, setIsWhatsAppBroadcastOpen] = useState(false);
  const [broadcastTargetIds, setBroadcastTargetIds] = useState<string[] | undefined>(undefined);

  // Thinking Man modal state (סעיף ח)
  const [isSmartRulesModalOpen, setIsSmartRulesModalOpen] = useState(false);

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

  const handleSaveSmartRule = async (rules: GroupRule[], matchingContactIds: string[]) => {
    await saveGroup({
      ...activeGroup,
      type: 'smart',
      rules,
    });
    if (matchingContactIds.length > 0) {
      await bulkAssignToGroup(matchingContactIds, activeGroup.name);
    }
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
      
      {/* 1. Floating Menu Trigger Button (fixed top-4 right-4, Official Kosun Symbol + English name) */}
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

      {/* 2. Floating Side Drawer (Hidden by default, opened on floating icon click) */}
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
                onClick={() => { setMainMode('manage'); setCurrentTab('grow'); setIsDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition text-right ${
                  mainMode === 'manage' && currentTab === 'grow'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>מגדלים את הקהילה</span>
              </button>

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
                <span>חברי הקהילה</span>
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
                <span>פורטל קהילה ופיד</span>
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
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-right cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>יצירת קהילה חדשה</span>
              </button>

              <button
                type="button"
                onClick={() => { handleOpenWhatsAppBroadcast(); setIsDrawerOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-right cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>שידור וואטסאפ</span>
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
      {/* Main Content Area - Full width without sidebar */}
      <div className="pt-16 px-4 md:px-8 pb-8 space-y-5">
        <div className="w-full space-y-4 min-w-0">
          {/* Pinned Sticky Actions Toolbar with Hide/Collapse option (סעיף 3) */}
          <div className="sticky top-2 z-30 transition-all duration-300">
            {isToolbarCollapsed ? (
              /* Minimal floating pill when collapsed */
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-lg flex items-center justify-between gap-4 max-w-xl mx-auto animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeGroup.color || '#4f46e5' }}
                  />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                    {activeGroup.name}
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {filteredContacts.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsToolbarCollapsed(false)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 transition"
                  title="הצג סרגל פעולות מלא"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>הצג סרגל פעולות</span>
                </button>
              </div>
            ) : (
              /* Full Toolbar */
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-3xl p-2.5 shadow-md flex items-center justify-between flex-wrap gap-2.5">
                {/* 1. Group Selector Dropdown + Plus Button (סעיפים 1 ו-2) */}
                <GroupSelectorDropdown
                  onOpenCreateGroup={handleOpenCreateGroup}
                  onOpenEditGroup={handleOpenEditGroup}
                />

                {/* 2. Sub-tabs & Thinking Man */}
                <div className="flex items-center gap-1.5">
                  {/* Contacts Tab - Default (סעיף 2) */}
                  <button
                    type="button"
                    onClick={() => setCurrentTab('contacts')}
                    className={`h-10 px-3.5 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-mono font-bold ${
                      currentTab === 'contacts'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    title="כל אנשי הקשר / חברי הקהילה"
                  >
                    <Users className="w-4 h-4" />
                    <span>{filteredContacts.length}</span>
                  </button>

                  {/* Grow Community Tab */}
                  <button
                    type="button"
                    onClick={() => setCurrentTab('grow')}
                    className={`w-10 h-10 rounded-2xl transition-all flex items-center justify-center cursor-pointer ${
                      currentTab === 'grow'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    title="מגדלים את הקהילה (הוספת חברים בגרירה)"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>

                  {/* Interactions Tab */}
                  <button
                    type="button"
                    onClick={() => setCurrentTab('interactions')}
                    className={`w-10 h-10 rounded-2xl transition-all flex items-center justify-center cursor-pointer ${
                      currentTab === 'interactions'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    title="יומן אינטראקציות ופעילות"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                  {/* Thinking Man Button */}
                  <button
                    type="button"
                    onClick={() => setIsSmartRulesModalOpen(true)}
                    className="w-10 h-10 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
                    title="איש חושב: הוספה אוטומטית לקהילה בעזרת תנאים לוגיים"
                  >
                    <Brain className="w-4 h-4" />
                  </button>
                </div>

                {/* 3. Quick Actions & Hide Toolbar Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsAppBroadcast()}
                    className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                    title="שידור וואטסאפ לקהילה"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMainMode('micro_portal')}
                    className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                    title="פורטל קהילה ופיד"
                  >
                    <Globe className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                  {/* Collapse Toolbar Button (סעיף 3) */}
                  <button
                    type="button"
                    onClick={() => setIsToolbarCollapsed(true)}
                    className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="הסתר סרגל פעולות (לפינוי מקום מקסימלי בטבלה)"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden Collapsible Community Engagement Radar (Engagement Heatmap) */}
          <GroupEngagementRadar
            isOpen={isRadarOpen}
            onToggle={() => setIsRadarOpen(false)}
          />

          {/* Active Tab View */}
          {currentTab === 'grow' ? (
            <CommunityGrowthTab
              activeGroup={activeGroup}
              allContacts={contacts}
              onAssignToGroup={bulkAssignToGroup}
              onOpenContactDetail={onOpenContactDetail}
              onOpenSmartRulesModal={() => setIsSmartRulesModalOpen(true)}
            />
          ) : currentTab === 'contacts' ? (
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

      {/* Modals */}
      <GroupEditModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        editingGroup={editingGroup}
        initialMode={groupModalMode}
      />

      <SmartCommunityRulesModal
        isOpen={isSmartRulesModalOpen}
        onClose={() => setIsSmartRulesModalOpen(false)}
        activeGroup={activeGroup}
        contacts={contacts}
        availableCities={availableCities}
        onSaveRule={handleSaveSmartRule}
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

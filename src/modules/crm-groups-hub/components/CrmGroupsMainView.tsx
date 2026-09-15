import React, { useState } from 'react';
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
import { SmartGroup } from '../types';

export const CrmGroupsMainView: React.FC = () => {
  const { loading, onOpenContactDetail } = useCrmGroups();

  const [mainMode, setMainMode] = useState<'manage' | 'whatsapp_import'>('manage');
  const [currentTab, setCurrentTab] = useState<'contacts' | 'interactions'>('contacts');

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

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50/50 p-4 md:p-8 space-y-6 text-right font-sans" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <GroupListSidebar
          onOpenCreateGroup={handleOpenCreateGroup}
          onOpenEditGroup={handleOpenEditGroup}
        />

        {/* Right Main Content */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          <GroupHeaderStatsBar
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            onOpenEditGroup={handleOpenEditGroup}
            onOpenCreateGroup={handleOpenCreateGroup}
            onOpenWhatsAppBroadcast={() => handleOpenWhatsAppBroadcast()}
            onOpenWhatsAppImport={() => setMainMode('whatsapp_import')}
          />

          {currentTab === 'contacts' ? (
            <GroupContactsTable
              onOpenTransferModal={handleOpenTransferModal}
              onOpenAddMembersModal={() => setIsAddMembersModalOpen(true)}
              onOpenWhatsAppBroadcast={handleOpenWhatsAppBroadcast}
              onOpenContactDetail={onOpenContactDetail}
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

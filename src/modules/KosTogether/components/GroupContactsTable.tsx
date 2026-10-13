import React, { useState } from 'react';
import {
  Users,
  Search,
  Check,
  CheckSquare,
  Square,
  Phone,
  Mail,
  Building,
  MapPin,
  Tag,
  Plus,
  ArrowRightLeft,
  Trash2,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  UserPlus,
  PhoneCall,
  Send,
  Share2,
  LayoutGrid,
  Table as TableIcon,
  Columns,
  Kanban,
  Globe,
  Sparkles,
  Download,
  Zap,
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { ContactRecord, SmartGroup, CommunitiesLayoutMode } from '../types';
import { ALL_GROUP_COLUMNS } from '../config';
import { ColumnPickerDropdown } from './ColumnPickerDropdown';
import { Contact360Modal } from '../../crm-analytics/components/Contact360Modal';
import { exportContactsToExcel } from '../services/groupsUtils';

interface GroupContactsTableProps {
  onOpenTransferModal: (mode: 'add' | 'move') => void;
  onOpenAddMembersModal: () => void;
  onOpenWhatsAppBroadcast: (contactIds?: string[]) => void;
  onOpenContactDetail?: (contact: ContactRecord) => void;
  onOpenCommunityPortal?: () => void;
  onOpenCommunityChat?: () => void;
  onOpenWhatsAppImport?: () => void;
  isRadarOpen?: boolean;
  onToggleRadar?: () => void;
  interactionsCount?: number;
  currentTab?: 'contacts' | 'interactions';
  onTabChange?: (tab: 'contacts' | 'interactions') => void;
}

export const GroupContactsTable: React.FC<GroupContactsTableProps> = ({
  onOpenTransferModal,
  onOpenAddMembersModal,
  onOpenWhatsAppBroadcast,
  onOpenContactDetail,
  onOpenCommunityPortal,
  onOpenCommunityChat,
  onOpenWhatsAppImport,
  isRadarOpen = false,
  onToggleRadar,
  interactionsCount = 0,
  currentTab = 'contacts',
  onTabChange,
}) => {
  const {
    filteredContacts,
    activeGroupId,
    activeGroup,
    groups,
    searchTerm,
    setSearchTerm,
    selectedContactIds,
    setSelectedContactIds,
    toggleSelectContact,
    toggleSelectAll,
    selectedColumns,
    toggleColumn,
    resetColumns,
    toggleContactTag,
    bulkDeleteContacts,
    bulkAssignToGroup,
    recordInteraction,
  } = useCrmGroups();

  const [openTagDropdownId, setOpenTagDropdownId] = useState<string | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagNameInput, setTagNameInput] = useState('');
  const [layoutMode, setLayoutMode] = useState<CommunitiesLayoutMode>('table');
  const [active360Contact, setActive360Contact] = useState<ContactRecord | null>(null);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  const handleOpen360 = (contact: ContactRecord) => {
    setActive360Contact(contact);
    setIs360ModalOpen(true);
    if (onOpenContactDetail) {
      onOpenContactDetail(contact);
    }
  };

  const isAllSelected =
    selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0;

  const visibleColumnDefs = ALL_GROUP_COLUMNS.filter((col) => selectedColumns.includes(col.id));

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Table Toolbar & Actions - Compact Icon Buttons with Hover Tooltips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Right Section: Compact Icon Tabs & Metric Toggles with Data Only (Tooltips on Hover) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-tabs: Contacts count (hover reveals 'אנשי קשר') */}
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('contacts')}
            className={`h-9 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-mono font-bold ${
              currentTab === 'contacts'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="אנשי קשר בקהילה"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{filteredContacts.length}</span>
          </button>

          {/* Sub-tabs: Interactions count (hover reveals 'אינטראקציות') */}
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('interactions')}
            className={`h-9 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-mono font-bold ${
              currentTab === 'interactions'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="אינטראקציות"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{interactionsCount}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-0.5" />

          {/* Engagement Heatmap Toggle: Icon + Score only (hover reveals 'מדד מעורבות קהילתית') */}
          {onToggleRadar && (
            <button
              type="button"
              onClick={onToggleRadar}
              className={`h-9 px-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-mono font-bold border ${
                isRadarOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
              title="מדד מעורבות קהילתית (Engagement Heatmap)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{activeGroup.engagementScore || 41}</span>
            </button>
          )}

          {/* WhatsApp Broadcast: Icon only (hover reveals 'וואטסאפ לקהילה') */}
          <button
            type="button"
            onClick={() => onOpenWhatsAppBroadcast()}
            className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer"
            title="וואטסאפ לקהילה"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Community Portal: Icon only (hover reveals 'פורטל קהילה, יעדים ופיד') */}
          {onOpenCommunityPortal && (
            <button
              type="button"
              onClick={onOpenCommunityPortal}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              title="פורטל קהילה, יעדים ופיד"
            >
              <Globe className="w-4 h-4" />
            </button>
          )}

          {/* Community Chat & Video: Icon only (hover reveals 'חדר צ'אט ווידאו קהילתי') */}
          {onOpenCommunityChat && (
            <button
              type="button"
              onClick={onOpenCommunityChat}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              title="צ'אט ווידאו קהילתי"
            >
              <PhoneCall className="w-3.5 h-3.5 text-indigo-300" />
            </button>
          )}

          {/* WhatsApp Import: Icon only (hover reveals 'ייבוא משתתפים מוואטסאפ') */}
          {onOpenWhatsAppImport && (
            <button
              type="button"
              onClick={onOpenWhatsAppImport}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-emerald-600 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
              title="ייבוא משתתפים מקבוצות וואטסאפ"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Excel Export: Icon only (hover reveals 'ייצוא רשימת אנשי קשר לקובץ Excel') */}
          <button
            type="button"
            onClick={() => exportContactsToExcel(filteredContacts, activeGroup.name)}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
            title="ייצוא רשימת אנשי קשר ל-EXCEL"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Left Section: Search, Layout Switcher & Column Picker */}
        <div className="flex items-center gap-2 flex-wrap flex-1 max-w-xl justify-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש איש קשר..."
              className="w-full h-9 pr-9 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Layout Mode Selector (Table, Cards, Split, Kanban) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="תצוגת טבלה מלאה"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="תצוגת כרטיסים (Grid Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('split')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'split' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="תצוגה מפוצלת"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('kanban')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="תצוגת קנבן (Kanban)"
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
          </div>

          {!activeGroupId.startsWith('__') && (
            <button
              type="button"
              onClick={onOpenAddMembersModal}
              className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="הוספת חברים לקבוצה"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">הוסף חברים</span>
            </button>
          )}

          <ColumnPickerDropdown
            selectedColumns={selectedColumns}
            onToggleColumn={toggleColumn}
            onResetColumns={resetColumns}
          />
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedContactIds.length > 0 && (
        <div className="bg-indigo-900 text-white px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-700 text-xs font-mono font-bold flex items-center justify-center">
              {selectedContactIds.length}
            </span>
            <span className="text-xs font-bold">אנשי קשר נבחרו לפעולה מרוכזת</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenTransferModal('add')}
              className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-300" />
              <span>הוסף לקהילה</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenTransferModal('move')}
              className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>העבר קהילה</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenWhatsAppBroadcast(selectedContactIds)}
              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>וואטסאפ לנבחרים</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTagModalOpen(true)}
              className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-teal-300" />
              <span>הוספת תווית</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('האם אתה בטוח שברצונך למחוק את אנשי הקשר שנבחרו?')) {
                  bulkDeleteContacts(selectedContactIds);
                }
              }}
              className="h-8 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>מחק נבחרים</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedContactIds([])}
              className="text-xs text-indigo-300 hover:text-white px-2 py-1 cursor-pointer"
            >
              ביטול בחירה
            </button>
          </div>
        </div>
      )}

      {/* Layout Modes: 1. Table */}
      {layoutMode === 'table' && (
      <div className="border border-slate-200/90 rounded-2xl overflow-x-auto bg-white">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
              {/* Checkbox Column */}
              <th className="p-3 w-10 text-center">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="cursor-pointer text-slate-500 hover:text-indigo-600 flex items-center justify-center"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300" />
                  )}
                </button>
              </th>

              {visibleColumnDefs.map((col) => (
                <th
                  key={col.id}
                  className={`p-3 font-extrabold text-slate-700 ${col.align === 'center' ? 'text-center' : 'text-right'}`}
                  style={{ minWidth: col.minWidth }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnDefs.length + 1} className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm text-slate-600">לא נמצאו אנשי קשר ברשימה זו</p>
                  <p className="text-xs text-slate-400 mt-1">נסה לשנות את מונח החיפוש או הוסף חברים לקבוצה.</p>
                </td>
              </tr>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = selectedContactIds.includes(c.id);
                const tags: string[] = Array.isArray(c.tags) ? c.tags : [];

                return (
                  <tr
                    key={c.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="p-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectContact(c.id);
                      }}
                    >
                      <button
                        type="button"
                        className="cursor-pointer flex items-center justify-center mx-auto"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>

                    {/* Dynamic Columns */}
                    {visibleColumnDefs.map((col) => {
                      if (col.id === 'conta_name') {
                        return (
                          <td
                            key={col.id}
                            className="p-3 font-bold text-slate-900"
                            onClick={() => handleOpen360(c)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                                {(c.conta_name || 'א')[0]}
                              </div>
                              <span className="hover:text-indigo-600 transition-colors">
                                {c.conta_name || 'ללא שם'}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      if (col.id === 'tags') {
                        return (
                          <td key={col.id} className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {tags.slice(0, 3).map((tag) => {
                                const matchingGroup = groups.find((g) => g.name === tag);
                                return (
                                  <span
                                    key={tag}
                                    className="text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1"
                                    style={{
                                      backgroundColor: `${matchingGroup?.color || '#4f46e5'}15`,
                                      color: matchingGroup?.color || '#4f46e5',
                                      border: `1px solid ${matchingGroup?.color || '#4f46e5'}30`,
                                    }}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{ backgroundColor: matchingGroup?.color || '#4f46e5' }}
                                    />
                                    {tag}
                                  </span>
                                );
                              })}
                              {tags.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  +{tags.length - 3}
                                </span>
                              )}

                              {/* Quick Tag Toggle */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenTagDropdownId(openTagDropdownId === c.id ? null : c.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="שייך/הסר תגיות"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>

                                {openTagDropdownId === c.id && (
                                  <div
                                    className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-right space-y-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="text-[10px] font-bold text-slate-400 px-2 pb-1 border-b border-slate-100">
                                      שיוך מהיר לקבוצות:
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                                      {groups.map((g) => {
                                        const has = tags.includes(g.name);
                                        return (
                                          <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => toggleContactTag(c.id, g.name)}
                                            className={`w-full text-right p-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                                              has ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                            }`}
                                          >
                                            <div className="flex items-center gap-1.5">
                                              <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: g.color || '#4f46e5' }}
                                              />
                                              <span className="truncate">{g.name}</span>
                                            </div>
                                            {has && <Check className="w-3 h-3 text-indigo-600" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      }

                      if (col.id === 'conta_phone') {
                        return (
                          <td key={col.id} className="p-3 text-slate-600 font-mono" dir="ltr">
                            {c.conta_phone ? (
                              <a
                                href={`tel:${c.conta_phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-indigo-600 flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 opacity-60" />
                                <span>{c.conta_phone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      }

                      if (col.id === 'email') {
                        return (
                          <td key={col.id} className="p-3 text-slate-600 truncate max-w-[180px]">
                            {c.email ? (
                              <a
                                href={`mailto:${c.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-indigo-600 flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3 opacity-60 shrink-0" />
                                <span className="truncate">{c.email}</span>
                              </a>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      }

                      if (col.id === 'mh_crm_city') {
                        return (
                          <td key={col.id} className="p-3 text-slate-600">
                            {c.mh_crm_city || <span className="text-slate-300">-</span>}
                          </td>
                        );
                      }

                      if (col.id === 'total_spent' || col.id === 'campaign_amount') {
                        const val = Number(c[col.id] || 0);
                        return (
                          <td key={col.id} className="p-3 text-center font-bold text-slate-800 font-mono">
                            {val > 0 ? `₪${val.toLocaleString()}` : <span className="text-slate-300">₪0</span>}
                          </td>
                        );
                      }

                      if (col.id === 'lead_source') {
                        return (
                          <td key={col.id} className="p-3 text-slate-500">
                            {c.lead_source || <span className="text-slate-300">-</span>}
                          </td>
                        );
                      }

                      if (col.id === 'company_name') {
                        return (
                          <td key={col.id} className="p-3 text-slate-600">
                            {c.company_name || <span className="text-slate-300">-</span>}
                          </td>
                        );
                      }

                      if (col.id === 'job_title') {
                        return (
                          <td key={col.id} className="p-3 text-slate-500">
                            {c.job_title || <span className="text-slate-300">-</span>}
                          </td>
                        );
                      }

                      if (col.id === 'gender') {
                        return (
                          <td key={col.id} className="p-3 text-slate-500">
                            {c.gender || <span className="text-slate-300">-</span>}
                          </td>
                        );
                      }

                      if (col.id === 'status') {
                        return (
                          <td key={col.id} className="p-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {c.status || 'פעיל'}
                            </span>
                          </td>
                        );
                      }

                      if (col.id === 'createdAt') {
                        return (
                          <td key={col.id} className="p-3 text-slate-400 font-mono text-[11px]">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('he-IL') : '-'}
                          </td>
                        );
                      }

                      if (col.id === 'actions') {
                        const cleanPhone = c.conta_phone ? c.conta_phone.replace(/\D/g, '') : '';
                        const waPhone = cleanPhone.startsWith('0') ? `972${cleanPhone.substring(1)}` : cleanPhone;
                        const inviteLink = activeGroup.pageUrl
                          ? `${window.location.origin}${activeGroup.pageUrl}`
                          : `${window.location.origin}/c/${activeGroup.pageSlug || activeGroup.id}`;

                        return (
                          <td key={col.id} className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Direct Call Button */}
                              {c.conta_phone && (
                                <a
                                  href={`tel:${c.conta_phone}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    recordInteraction({
                                      contactId: c.id,
                                      contactName: c.conta_name,
                                      contactPhone: c.conta_phone,
                                      type: 'call',
                                      title: `שיחה טלפונית יזומה`,
                                      content: `חיוג ישיר מהמערכת למספר ${c.conta_phone} (קהילת ${activeGroup.name})`,
                                      groupName: activeGroup.name,
                                    });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title={`חייג ישירות: ${c.conta_phone} (יתועד ב-CRM)`}
                                >
                                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                                </a>
                              )}

                              {/* WhatsApp Chat Button (wa.me) */}
                              {c.conta_phone && (
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `שלום ${c.conta_name || ''}, פונה אליך מקהילת ${activeGroup.name}`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    recordInteraction({
                                      contactId: c.id,
                                      contactName: c.conta_name,
                                      contactPhone: c.conta_phone,
                                      type: 'whatsapp',
                                      title: `פתיחת שיחת WhatsApp פרטית`,
                                      content: `נפתחה שיחת וואטסאפ אישית עם נוסח פנייה מובנה עבור קהילת ${activeGroup.name}`,
                                      groupName: activeGroup.name,
                                      metadata: { method: 'wa.me_direct' },
                                    });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="פתח שיחת WhatsApp ישירה (יתועד ב-CRM)"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                </a>
                              )}

                              {/* Send Community Invite via WhatsApp */}
                              {c.conta_phone && (
                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `שלום ${c.conta_name || ''}! שמחים להזמין אותך לעמוד הקהילה של ${activeGroup.name}: ${inviteLink}`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    recordInteraction({
                                      contactId: c.id,
                                      contactName: c.conta_name,
                                      contactPhone: c.conta_phone,
                                      type: 'whatsapp',
                                      title: `שליחת הזמנה אישית לעמוד הקהילה`,
                                      content: `נשלחה הזמנה אישית עם קישור דינמי לעמוד הקהילה: ${inviteLink}`,
                                      groupName: activeGroup.name,
                                      metadata: { method: 'community_invite_link', inviteUrl: inviteLink },
                                    });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="שלח הזמנה אישית לעמוד הקהילה (יתועד ב-CRM)"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                                </a>
                              )}

                              {/* Contact 360 Detail View */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpen360(c);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="צפה בכרטיס איש קשר 360"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Contact */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('האם אתה בטוח שברצונך למחוק איש קשר זה?')) {
                                    bulkDeleteContacts([c.id]);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="מחיקת איש קשר"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        );
                      }

                      return <td key={col.id} className="p-3">{c[col.id] || '-'}</td>;
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Layout Modes: 2. Cards (Grid) */}
      {layoutMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 animate-fadeIn">
          {filteredContacts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm text-slate-600">לא נמצאו אנשי קשר ברשימה זו</p>
            </div>
          ) : (
            filteredContacts.map((c) => {
              const isSelected = selectedContactIds.includes(c.id);
              const tags: string[] = Array.isArray(c.tags) ? c.tags : [];
              const waPhone = (c.conta_phone || '').replace(/\D/g, '');

              return (
                <div
                  key={c.id}
                  onClick={() => handleOpen360(c)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer relative hover:shadow-md flex flex-col justify-between ${
                    isSelected ? 'bg-indigo-50/40 border-indigo-300' : 'bg-white border-slate-200/80 hover:border-indigo-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm border border-indigo-100">
                          {(c.conta_name || 'א')[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{c.conta_name || 'ללא שם'}</h4>
                          <span className="text-[11px] text-slate-500 block">{c.job_title || c.company_name || 'חבר קהילה'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectContact(c.id);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{tags.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-600 text-[11px]">{c.conta_phone || '-'}</span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {c.conta_phone && (
                        <a
                          href={`tel:${c.conta_phone}`}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                          title="חייג"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        </a>
                      )}
                      {c.conta_phone && (
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`שלום ${c.conta_name || ''}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpen360(c)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                        title="כרטיס 360"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Layout Modes: 3. Split Layout */}
      {layoutMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fadeIn">
          <div className="lg:col-span-5 border border-slate-200/90 rounded-2xl overflow-y-auto max-h-[550px] divide-y divide-slate-100 bg-white">
            {filteredContacts.map((c) => (
              <div
                key={c.id}
                onClick={() => setActive360Contact(c)}
                className={`p-3 transition-colors cursor-pointer flex items-center justify-between ${
                  active360Contact?.id === c.id ? 'bg-indigo-50/80 border-r-4 border-indigo-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {(c.conta_name || 'א')[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{c.conta_name || 'ללא שם'}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">{c.conta_phone || '-'}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {c.mh_crm_city || 'ישראל'}
                </span>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between">
            {active360Contact ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {(active360Contact.conta_name || 'א')[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{active360Contact.conta_name || 'איש קשר'}</h3>
                      <p className="text-xs text-slate-500">{active360Contact.job_title || 'חבר קהילה רשום'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpen360(active360Contact)}
                    className="h-8 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-700 cursor-pointer"
                  >
                    <span>פתח כרטיס מלא 360</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">טלפון:</span>
                    <span className="font-bold text-slate-800 font-mono" dir="ltr">{active360Contact.conta_phone || '-'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">אימייל:</span>
                    <span className="font-bold text-slate-800 truncate block">{active360Contact.email || '-'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">עיר מגורים:</span>
                    <span className="font-bold text-slate-800">{active360Contact.mh_crm_city || '-'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">סך תשלומים:</span>
                    <span className="font-bold text-slate-800 font-mono">₪{Number(active360Contact.total_spent || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="text-slate-400 block text-[10px]">קהילות ותוויות משויכות:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(active360Contact.tags) && active360Contact.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
                בחר איש קשר מהרשימה לתצוגה מהירה
              </div>
            )}
          </div>
        </div>
      )}

      {/* Layout Modes: 4. Kanban Board */}
      {layoutMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-2 animate-fadeIn">
          {[
            { id: 'active', title: 'חברים פעילים בקהילה', color: 'indigo' },
            { id: 'advocates', title: 'מובילים ושגרירים', color: 'amber' },
            { id: 'new', title: 'מצטרפים חדשים', color: 'emerald' },
          ].map(col => {
            const colContacts = filteredContacts.filter(c => {
              if (col.id === 'advocates') return Number(c.total_spent || 0) >= 1000 || (c.tags || []).includes('שגריר מוביל');
              if (col.id === 'new') return (c.tags || []).includes('חדש') || c.status === 'חדש';
              return true;
            });

            return (
              <div key={col.id} className="bg-slate-50/70 border border-slate-200 rounded-3xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-xs font-black text-slate-800">{col.title}</span>
                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                    {colContacts.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {colContacts.slice(0, 10).map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleOpen360(c)}
                      className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{c.conta_name || 'ללא שם'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.conta_phone || ''}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>{c.mh_crm_city || 'כללי'}</span>
                        <span className="font-mono font-bold text-slate-700">₪{Number(c.total_spent || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract-based Contact 360 Fullscreen Modal */}
      {is360ModalOpen && (
        <Contact360Modal
          isOpen={is360ModalOpen}
          onClose={() => setIs360ModalOpen(false)}
          contact={active360Contact as any}
          onSave={async (updated) => {
            setIs360ModalOpen(false);
            return true;
          }}
        />
      )}

      {/* Modal: Bulk Add Tag */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  הוספת תווית ל-{selectedContactIds.length} נבחרים
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsTagModalOpen(false); setTagNameInput(''); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">שם התווית / התגית:</label>
                <input
                  type="text"
                  value={tagNameInput}
                  onChange={(e) => setTagNameInput(e.target.value)}
                  placeholder="הקלד תווית להוספה..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsTagModalOpen(false); setTagNameInput(''); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={!tagNameInput.trim()}
                onClick={async () => {
                  if (tagNameInput.trim() && selectedContactIds.length > 0) {
                    await bulkAssignToGroup(selectedContactIds, tagNameInput.trim());
                    setSelectedContactIds([]);
                    setTagNameInput('');
                    setIsTagModalOpen(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50"
              >
                הוסף תווית
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

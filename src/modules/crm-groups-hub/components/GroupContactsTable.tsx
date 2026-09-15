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
} from 'lucide-react';
import { useCrmGroups } from '../context/CrmGroupsContext';
import { ContactRecord, SmartGroup } from '../types';
import { ALL_GROUP_COLUMNS } from '../config';
import { ColumnPickerDropdown } from './ColumnPickerDropdown';

interface GroupContactsTableProps {
  onOpenTransferModal: (mode: 'add' | 'move') => void;
  onOpenAddMembersModal: () => void;
  onOpenWhatsAppBroadcast: (contactIds?: string[]) => void;
  onOpenContactDetail?: (contact: ContactRecord) => void;
}

export const GroupContactsTable: React.FC<GroupContactsTableProps> = ({
  onOpenTransferModal,
  onOpenAddMembersModal,
  onOpenWhatsAppBroadcast,
  onOpenContactDetail,
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
  } = useCrmGroups();

  const [openTagDropdownId, setOpenTagDropdownId] = useState<string | null>(null);

  const isAllSelected =
    selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0;

  const visibleColumnDefs = ALL_GROUP_COLUMNS.filter((col) => selectedColumns.includes(col.id));

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="חיפוש איש קשר לפי שם, טלפון, אימייל, עיר, חברה..."
            className="w-full h-10 pr-9.5 pl-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-2">
          {!activeGroupId.startsWith('__') && (
            <button
              type="button"
              onClick={onOpenAddMembersModal}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>הוסף חברים לקבוצה</span>
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
              onClick={() => setSelectedContactIds([])}
              className="text-xs text-indigo-300 hover:text-white px-2 py-1 cursor-pointer"
            >
              ביטול בחירה
            </button>
          </div>
        </div>
      )}

      {/* Main Responsive Table */}
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
                            onClick={() => onOpenContactDetail && onOpenContactDetail(c)}
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
                        return (
                          <td key={col.id} className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {c.conta_phone && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenWhatsAppBroadcast([c.id]);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="שלח וואטסאפ"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onOpenContactDetail) onOpenContactDetail(c);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="צפה בכרטיס איש קשר"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
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
    </div>
  );
};

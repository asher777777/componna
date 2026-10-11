import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Download, Columns, ArrowUpDown, ArrowUp, ArrowDown, 
  Edit2, Check, X, Filter, ChevronLeft, ChevronRight, FileSpreadsheet,
  MessageSquare, CheckSquare, Square, Send, Smartphone, Sparkles,
  LayoutGrid, Table as TableIcon, Phone, Trash2, Tag, Users, Loader2, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Contact, DynamicColumn } from '../types';
import { CrmWhatsAppBulkSenderModal } from './CrmWhatsAppBulkSenderModal';
import { MobileContactFeedCard } from './MobileContactFeedCard';
import { useContactFilters } from '../hooks/useContactFilters';
import { useCrmAnalyticsContext } from '../context/CrmAnalyticsContext';

interface Props {
  contacts: Contact[];
  columns: DynamicColumn[];
  selectedColumnIds: string[];
  onToggleColumn: (colId: string) => void;
  onUpdateField?: (contactId: string, field: string, value: any) => Promise<boolean>;
  onSelectContact?: (contact: Contact) => void;
  loading?: boolean;
}

export const DynamicAnalyticsTable: React.FC<Props> = ({
  contacts,
  columns,
  selectedColumnIds,
  onToggleColumn,
  onUpdateField,
  onSelectContact,
  loading,
}) => {
  // Mobile adaptive view mode detection & toggle
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      const isNarrow = window.innerWidth < 768;
      setIsMobileScreen(isNarrow);
      setViewMode(isNarrow ? 'cards' : 'table');
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Use modular filtering & pagination hook
  const {
    searchTerm,
    setSearchTerm,
    tableTypeFilter,
    setTableTypeFilter,
    sortField,
    sortAsc,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalLeadsCount,
    totalContactsCount,
    sorted,
    paginated,
    totalPages,
    handleSort,
  } = useContactFilters({ contacts, initialPageSize: 20 });

  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Selected contact IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false);
  const [singleWhatsAppTarget, setSingleWhatsAppTarget] = useState<Contact | null>(null);

  const { bulkDeleteContacts, bulkAssignToGroup, bulkAddTag, data: ctxData } = useCrmAnalyticsContext();
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkGroupOpen, setIsBulkGroupOpen] = useState(false);
  const [isBulkTagOpen, setIsBulkTagOpen] = useState(false);
  const [targetGroupName, setTargetGroupName] = useState('');
  const [targetTagName, setTargetTagName] = useState('');
  const [isPerformingBulk, setIsPerformingBulk] = useState(false);

  // Selection handlers
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllCurrent = () => {
    const pageIds = paginated.map(c => c.id!).filter(Boolean);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = sorted.map(c => c.id!).filter(Boolean);
    setSelectedIds(allFilteredIds);
  };

  const selectedContactsList = useMemo(() => {
    return contacts.filter(c => c.id && selectedIds.includes(c.id));
  }, [contacts, selectedIds]);

  // Bulk Action Execution
  const handleExecuteBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsPerformingBulk(true);
    try {
      await bulkDeleteContacts(selectedIds);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
    } finally {
      setIsPerformingBulk(false);
    }
  };

  const handleExecuteBulkGroup = async () => {
    if (selectedIds.length === 0 || !targetGroupName.trim()) return;
    setIsPerformingBulk(true);
    try {
      await bulkAssignToGroup(selectedIds, targetGroupName.trim());
      setSelectedIds([]);
      setTargetGroupName('');
      setIsBulkGroupOpen(false);
    } finally {
      setIsPerformingBulk(false);
    }
  };

  const handleExecuteBulkTag = async () => {
    if (selectedIds.length === 0 || !targetTagName.trim()) return;
    setIsPerformingBulk(true);
    try {
      await bulkAddTag(selectedIds, targetTagName.trim());
      setSelectedIds([]);
      setTargetTagName('');
      setIsBulkTagOpen(false);
    } finally {
      setIsPerformingBulk(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const targetList = selectedContactsList.length > 0 ? selectedContactsList : sorted;
    const exportData = targetList.map(c => {
      const row: Record<string, any> = {};
      columns.filter(col => selectedColumnIds.includes(col.id)).forEach(col => {
        let val = (c as any)[col.id];
        if (col.id === 'contact_type') {
          val = (c.is_lead || c.contact_type === 'lead') ? 'ליד' : 'איש קשר';
        } else if (Array.isArray(val)) {
          val = val.join(', ');
        }
        row[col.label] = val ?? '';
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'אנליטיקה ולקוחות');
    XLSX.writeFile(wb, `crm_analytics_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const startEdit = (id: string, field: string, currVal: any) => {
    setEditingCell({ id, field });
    setEditValue(currVal ? String(currVal) : '');
  };

  const saveEdit = async () => {
    if (editingCell && onUpdateField) {
      await onUpdateField(editingCell.id, editingCell.field, editValue);
    }
    setEditingCell(null);
  };

  const activeColumns = columns.filter(c => selectedColumnIds.includes(c.id));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Bulk Action Sticky Bar when items are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="font-extrabold flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-lg">
              <CheckSquare className="w-4 h-4" />
              <span>נבחרו {selectedIds.length} אנשי קשר ולידים</span>
            </span>
            {selectedIds.length < sorted.length && (
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="underline hover:text-emerald-100 transition"
              >
                בחר את כל {sorted.length} הרשומות בסינון הנוכחי
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* WhatsApp Bulk Send Button */}
            <button
              type="button"
              onClick={() => setIsBulkWhatsAppOpen(true)}
              className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>וואטסאפ ({selectedIds.length})</span>
            </button>

            {/* Bulk Add to Group / Community */}
            <button
              type="button"
              onClick={() => setIsBulkGroupOpen(true)}
              className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span>הוספה לקבוצה/קהילה</span>
            </button>

            {/* Bulk Add Tag / Label */}
            <button
              type="button"
              onClick={() => setIsBulkTagOpen(true)}
              className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Tag className="w-3.5 h-3.5 text-teal-300" />
              <span>הוספת תווית</span>
            </button>

            {/* Bulk Delete */}
            <button
              type="button"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>מחיקה</span>
            </button>

            {/* Export Selected */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium flex items-center gap-1 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ייצוא נבחרים</span>
            </button>

            {/* Deselect */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              ביטול בחירה
            </button>
          </div>
        </div>
      )}

      {/* Table Header Controls */}
      <div className="p-3.5 md:p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Quick Segment Filter Pills: All / Contacts / Leads */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => { setTableTypeFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md transition ${
                tableTypeFilter === 'all'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              הכל ({contacts.length})
            </button>
            <button
              onClick={() => { setTableTypeFilter('contacts'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md transition ${
                tableTypeFilter === 'contacts'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              אנשי קשר ({totalContactsCount})
            </button>
            <button
              onClick={() => { setTableTypeFilter('leads'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                tableTypeFilter === 'leads'
                  ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <span>לידים ({totalLeadsCount})</span>
              {totalLeadsCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש מהיר בטבלה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Adaptive View Switcher (Cards / Table Toggle) */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'cards' 
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="תצוגת כרטיסי מובייל (Cards)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="תצוגת טבלה מלאה"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Column Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
            >
              <Columns className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">עמודות</span>
              <span>({selectedColumnIds.length})</span>
            </button>

            {showColumnMenu && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 max-h-72 overflow-y-auto">
                <div className="text-xs font-bold px-2 py-1 text-gray-500 border-b border-gray-100 dark:border-gray-700 mb-1">
                  בחר עמודות להצגה:
                </div>
                {columns.map(col => {
                  const isChecked = selectedColumnIds.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleColumn(col.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={isChecked ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}>
                        {col.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export to Excel */}
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ייצוא לאקסל</span>
          </button>
        </div>
      </div>

      {/* Main View Area: Render either Feed Cards or Table */}
      {viewMode === 'cards' ? (
        <div className="p-3 md:p-4 bg-gray-50/50 dark:bg-gray-950/40 min-h-[300px]">
          {paginated.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">לא נמצאו אנשי קשר או לידים</p>
                <p className="text-xs text-gray-400">נסה לשנות את מונחי החיפוש או הסינון</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginated.map((contact) => (
                <MobileContactFeedCard
                  key={contact.id}
                  contact={contact}
                  isSelected={contact.id ? selectedIds.includes(contact.id) : false}
                  onToggleSelect={() => contact.id && handleToggleSelectRow(contact.id)}
                  onSelectContact={() => onSelectContact?.(contact)}
                  onSingleWhatsApp={() => setSingleWhatsAppTarget(contact)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Full Desktop/Compressed Table View */
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every(c => c.id && selectedIds.includes(c.id))}
                    onChange={handleSelectAllCurrent}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    title="בחר את כל המוצגים בעמוד"
                  />
                </th>
                <th className="p-3 w-10 text-center">#</th>
                {activeColumns.map(col => (
                  <th
                    key={col.id}
                    onClick={() => handleSort(col.id)}
                    className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {sortField === col.id ? (
                        sortAsc ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-50" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="p-3 w-20 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length + 3} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">לא נמצאו אנשי קשר או לידים</p>
                      <p className="text-xs text-gray-400">נסה לשנות את מונחי החיפוש או הסינון</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((contact, idx) => {
                  const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                  const isSelected = contact.id ? selectedIds.includes(contact.id) : false;
                  const isLead = Boolean(contact.is_lead || contact.contact_type === 'lead');

                  return (
                    <tr
                      key={contact.id || idx}
                      className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition ${
                        isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => contact.id && handleToggleSelectRow(contact.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 text-center text-gray-400 font-mono text-[11px]">{rowIndex}</td>
                      {activeColumns.map(col => {
                        let val = (contact as any)[col.id];
                        const isEditing = editingCell?.id === contact.id && editingCell?.field === col.id;

                        return (
                          <td key={col.id} className="p-3 whitespace-nowrap text-gray-800 dark:text-gray-200 group">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="px-2 py-1 text-xs border rounded bg-white dark:bg-gray-800 focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                />
                                <button onClick={saveEdit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditingCell(null)} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <span>
                                  {col.id === 'contact_type' ? (
                                    isLead ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        🎯 ליד
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        👤 איש קשר
                                      </span>
                                    )
                                  ) : col.id === 'conta_name' ? (
                                    <button
                                      type="button"
                                      onClick={() => onSelectContact?.(contact)}
                                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                                    >
                                      {isLead ? (
                                        <span className="w-2 h-2 rounded-full bg-amber-500" title="ליד חדש" />
                                      ) : (
                                        <span className="w-2 h-2 rounded-full bg-indigo-500" title="איש קשר" />
                                      )}
                                      <span>{val || 'ללא שם'}</span>
                                    </button>
                                  ) : col.id === 'conta_phone' ? (
                                    <div className="flex items-center gap-1.5">
                                      <span dir="ltr" className="font-mono">{val || '-'}</span>
                                      {val && (
                                        <div className="flex items-center gap-1">
                                          <a
                                            href={`tel:${val}`}
                                            className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                                            title="חייג"
                                          >
                                            <Phone className="w-3.5 h-3.5" />
                                          </a>
                                          <button
                                            type="button"
                                            onClick={() => setSingleWhatsAppTarget(contact)}
                                            className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                                            title="שלח WhatsApp אישי"
                                          >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : Array.isArray(val) ? (
                                    <div className="flex flex-wrap gap-1">
                                      {val.map((t, ti) => (
                                        <span key={ti} className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  ) : col.isNumeric && typeof val === 'number' ? (
                                    <span className="font-semibold">{val.toLocaleString('he-IL')}</span>
                                  ) : (
                                    val ?? '-'
                                  )}
                                </span>
                                {onUpdateField && contact.id && (
                                  <button
                                    onClick={() => startEdit(contact.id!, col.id, val)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 transition"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {contact.conta_phone && (
                            <button
                              type="button"
                              onClick={() => setSingleWhatsAppTarget(contact)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition"
                              title="שליחת הודעת WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectContact?.(contact)}
                            className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] font-bold transition"
                          >
                            כרטיס
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>הצג:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-xs"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>עמוד {currentPage} מתוך {totalPages}</span>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1 border rounded disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-1 border rounded disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk WhatsApp Modal */}
      <CrmWhatsAppBulkSenderModal
        isOpen={isBulkWhatsAppOpen}
        onClose={() => setIsBulkWhatsAppOpen(false)}
        selectedContacts={selectedContactsList}
      />

      {/* Single Contact WhatsApp Modal */}
      {singleWhatsAppTarget && (
        <CrmWhatsAppBulkSenderModal
          isOpen={Boolean(singleWhatsAppTarget)}
          onClose={() => setSingleWhatsAppTarget(null)}
          selectedContacts={[singleWhatsAppTarget]}
        />
      )}

      {/* Modal: Bulk Add to Group / Community */}
      {isBulkGroupOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  הוספת {selectedIds.length} נבחרים לקבוצה או קהילה
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsBulkGroupOpen(false); setTargetGroupName(''); }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  שם הקבוצה או הקהילה:
                </label>
                <input
                  type="text"
                  value={targetGroupName}
                  onChange={(e) => setTargetGroupName(e.target.value)}
                  placeholder="הקלד שם קבוצה חדשה או בחר מרשימה..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              {(() => {
                const availableGroups = ctxData?.communitiesCount 
                  ? Object.keys(ctxData.communitiesCount).filter(Boolean)
                  : Array.from(new Set((ctxData?.contacts || []).map(c => c.community || c.mh_crm_community).filter(Boolean))) as string[];

                if (availableGroups.length === 0) return null;

                return (
                  <div>
                    <span className="block text-gray-500 mb-1.5 font-medium">קבוצות קיימות במערכת:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                      {availableGroups.map((gName: string) => (
                        <button
                          key={gName}
                          type="button"
                          onClick={() => setTargetGroupName(gName)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                            targetGroupName === gName
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          {gName}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => { setIsBulkGroupOpen(false); setTargetGroupName(''); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={!targetGroupName.trim() || isPerformingBulk}
                onClick={handleExecuteBulkGroup}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
              >
                {isPerformingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>שייך לקבוצה</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Add Tag */}
      {isBulkTagOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  הוספת תווית ל-{selectedIds.length} נבחרים
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsBulkTagOpen(false); setTargetTagName(''); }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  שם התווית / התגית:
                </label>
                <input
                  type="text"
                  value={targetTagName}
                  onChange={(e) => setTargetTagName(e.target.value)}
                  placeholder="לדוגמה: לקוח פוטנציאלי, שגריר פעיל..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              {ctxData?.tagsCount && Object.keys(ctxData.tagsCount).length > 0 && (
                <div>
                  <span className="block text-gray-500 mb-1.5 font-medium">תוויות נפוצות:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    {Object.keys(ctxData.tagsCount).slice(0, 15).map(tName => (
                      <button
                        key={tName}
                        type="button"
                        onClick={() => setTargetTagName(tName)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                          targetTagName === tName
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-teal-50 hover:text-teal-600'
                        }`}
                      >
                        {tName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => { setIsBulkTagOpen(false); setTargetTagName(''); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={!targetTagName.trim() || isPerformingBulk}
                onClick={handleExecuteBulkTag}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
              >
                {isPerformingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>החל תווית</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Delete Confirmation */}
      {isBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  מחיקת {selectedIds.length} אנשי קשר שנבחרו
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkDeleteOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              האם אתה בטוח שברצונך למחוק {selectedIds.length} אנשי קשר ולידים שנבחרו? 
              הרשומות יועברו לסטטוס ארכיון/אשפה ולא יופיעו יותר בטבלאות הפעילות.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsBulkDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isPerformingBulk}
                onClick={handleExecuteBulkDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition disabled:opacity-50 shadow-sm"
              >
                {isPerformingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>מחק {selectedIds.length} רשומות</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

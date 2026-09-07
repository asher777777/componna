import React, { useState, useMemo } from 'react';
import { 
  Search, Download, Columns, ArrowUpDown, ArrowUp, ArrowDown, 
  Edit2, Check, X, Filter, ChevronLeft, ChevronRight, FileSpreadsheet 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Contact, DynamicColumn } from '../types';

interface Props {
  contacts: Contact[];
  columns: DynamicColumn[];
  selectedColumnIds: string[];
  onToggleColumn: (colId: string) => void;
  onUpdateField?: (contactId: string, field: string, value: any) => Promise<boolean>;
  loading?: boolean;
}

export const DynamicAnalyticsTable: React.FC<Props> = ({
  contacts,
  columns,
  selectedColumnIds,
  onToggleColumn,
  onUpdateField,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('total_spent');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Filter contacts by search
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(c => 
      (c.conta_name && c.conta_name.toLowerCase().includes(term)) ||
      (c.conta_phone && c.conta_phone.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.company_name && c.company_name.toLowerCase().includes(term)) ||
      (c.mh_crm_city && c.mh_crm_city.toLowerCase().includes(term))
    );
  }, [contacts, searchTerm]);

  // Sort contacts
  const sorted = useMemo(() => {
    return [...filtered].sort((a: any, b: any) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc 
        ? String(aVal).localeCompare(String(bVal), 'he')
        : String(bVal).localeCompare(String(aVal), 'he');
    });
  }, [filtered, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = sorted.map(c => {
      const row: Record<string, any> = {};
      columns.filter(col => selectedColumnIds.includes(col.id)).forEach(col => {
        let val = (c as any)[col.id];
        if (Array.isArray(val)) val = val.join(', ');
        row[col.label] = val ?? '';
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'אנליטיקה ולקוחות');
    XLSX.writeFile(wb, `crm_analytics_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSort = (colId: string) => {
    if (sortField === colId) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(colId);
      setSortAsc(false);
    }
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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש מהיר בטבלה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-gray-500">
            {sorted.length.toLocaleString('he-IL')} רשומות
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Column Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
            >
              <Columns className="w-3.5 h-3.5 text-indigo-500" />
              <span>בחירת עמודות ({selectedColumnIds.length})</span>
            </button>

            {showColumnMenu && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 p-2 max-h-72 overflow-y-auto">
                <div className="text-xs font-semibold px-2 py-1 text-gray-400 mb-1 border-b border-gray-100 dark:border-gray-700">
                  הצג/הסתר עמודות
                </div>
                {columns.map(col => (
                  <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-xs cursor-pointer text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedColumnIds.includes(col.id)}
                      onChange={() => onToggleColumn(col.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export to Excel */}
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ייצוא לאקסל</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-right text-xs">
          <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
            <tr>
              <th className="p-3 w-12 text-center">#</th>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.map((contact, idx) => {
              const rowIndex = (currentPage - 1) * pageSize + idx + 1;
              return (
                <tr key={contact.id || idx} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition">
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
                              {Array.isArray(val) ? (
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

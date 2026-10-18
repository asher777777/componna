import React, { useState, useMemo } from 'react';
import { Search, Download, ArrowUpDown, Database, ExternalLink } from 'lucide-react';
import { DashboardTableConfig } from '../types';

export interface DashboardTableSectionProps {
  config: DashboardTableConfig;
}

// Sample mock data for previewing table layouts in builder mode
const DEMO_ROWS: Record<string, any[]> = {
  contacts: [
    { id: '1', name: 'ישראל ישראלי', phone: '050-1234567', date: '18/10/2026', status: 'ליד חדש' },
    { id: '2', name: 'שרה לוי', phone: '052-9876543', date: '17/10/2026', status: 'בטיפול' },
    { id: '3', name: 'דניאל כהן', phone: '054-4455667', date: '16/10/2026', status: 'לקוח פעיל' },
    { id: '4', name: 'מיכל אברהם', phone: '053-1122334', date: '15/10/2026', status: 'סגור בהצלחה' },
  ],
  kesher_transactions: [
    { id: '1', name: 'חיוב אשראי - מנוי חודשי', amount: '₪199.00', date: '18/10/2026', status: 'אושר' },
    { id: '2', name: 'תשלום ביט - סדנה', amount: '₪350.00', date: '17/10/2026', status: 'אושר' },
    { id: '3', name: 'הוראת קבע', amount: '₪500.00', date: '16/10/2026', status: 'בהמתנה' },
  ],
};

export const DashboardTableSection: React.FC<DashboardTableSectionProps> = ({ config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const rawRows = (config.collectionName && DEMO_ROWS[config.collectionName]) || DEMO_ROWS.contacts;

  const filteredRows = useMemo(() => {
    let res = [...rawRows];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      res = res.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      res.sort((a, b) => {
        const valA = a[sortKey] || '';
        const valB = b[sortKey] || '';
        return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
    }
    return res;
  }, [rawRows, searchTerm, sortKey, sortAsc]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = String(status || '');
    if (s.includes('הצלחה') || s.includes('אושר') || s.includes('פעיל')) {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    }
    if (s.includes('טיפול') || s.includes('המתנה')) {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5" dir="rtl">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {config.title}
            </h3>
            {config.collectionName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Database className="w-3 h-3 text-indigo-500" />
                {config.collectionName}
              </span>
            )}
          </div>
          {config.subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {config.showSearch && (
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="חיפוש מהיר..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {config.showExport && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ייצוא</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <table className="w-full text-right text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 cursor-pointer select-none"
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={config.columns.length}
                  className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-xs"
                >
                  {config.emptyStateText || 'לא נמצאו רשומות'}
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  {config.columns.map((col) => {
                    const val = row[col.key] ?? '—';
                    return (
                      <td key={col.key} className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium">
                        {col.type === 'badge' ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(val)}`}>
                            {val}
                          </span>
                        ) : col.type === 'currency' ? (
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {val}
                          </span>
                        ) : (
                          val
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

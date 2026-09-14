import React, { useState } from 'react';
import { SmartFormDefinition, SmartFormSubmission } from '../../types';
import { useFormSubmissions } from '../../hooks/useFormSubmissions';
import { FormAnalyticsSummary } from './FormAnalyticsSummary';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import {
  Search,
  Download,
  RefreshCw,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Inbox,
  Sparkles,
} from 'lucide-react';

export interface FormSubmissionsTableProps {
  form: SmartFormDefinition;
  className?: string;
}

export const FormSubmissionsTable: React.FC<FormSubmissionsTableProps> = ({
  form,
  className = '',
}) => {
  const { submissions, stats, isLoading, exportExcel } = useFormSubmissions(form);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const answersText = Object.values(sub.answers || {}).join(' ').toLowerCase();
    const idText = (sub.id || '').toLowerCase();
    return answersText.includes(term) || idText.includes(term);
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Summary KPI Cards */}
      <FormAnalyticsSummary stats={stats} />

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
              טבלת הגשות מתת-קולקציה (`mod_forms/{form.id}/submissions`)
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {filteredSubmissions.length} הגשות
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש בנתוני ההגשות..."
                className="w-full pr-9 pl-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Export Excel */}
            <button
              type="button"
              onClick={exportExcel}
              disabled={submissions.length === 0}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ייצוא לאקסל</span>
            </button>
          </div>
        </div>

        {/* Dynamic Table Body */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse text-sm">
            טוען הגשות בזמן אמת...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
            <Inbox className="w-10 h-10 stroke-1 text-slate-300 dark:text-slate-700" />
            <span className="text-sm font-semibold">עדיין לא נרשמו הגשות לטופס זה</span>
            <span className="text-xs text-slate-400 max-w-sm">
              ברגע שמשתמשים ימלאו את הטופס, התשובות יישמרו אוטומטית בתת-הקולקציה ויופיעו כאן בזמן אמת.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="p-3.5 whitespace-nowrap">#</th>
                  <th className="p-3.5 whitespace-nowrap">תאריך הגשה</th>
                  {/* Dynamic Columns for each Step */}
                  {form.steps.map((step) => (
                    <th key={step.id} className="p-3.5 whitespace-nowrap min-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <LuxuryIconRenderer iconName={step.iconName} className="w-3.5 h-3.5 text-amber-500" />
                        <span>{step.title}</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-3.5 whitespace-nowrap">זמן מילוי</th>
                  <th className="p-3.5 whitespace-nowrap">סנכרון CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSubmissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <td className="p-3.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(sub.submittedAt).toLocaleString('he-IL')}
                    </td>

                    {/* Step values */}
                    {form.steps.map((step) => {
                      const val = sub.answers[step.mappingKey || step.id];
                      let displayVal = '-';
                      if (val !== undefined && val !== null) {
                        if (Array.isArray(val)) displayVal = val.join(', ');
                        else if (typeof val === 'object') displayVal = JSON.stringify(val);
                        else displayVal = String(val);
                      }

                      return (
                        <td key={step.id} className="p-3.5 max-w-xs truncate font-medium">
                          {displayVal}
                        </td>
                      );
                    })}

                    <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono">
                      {sub.completionTimeSeconds ? `${sub.completionTimeSeconds} שנ'` : '-'}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {sub.crmSyncStatus === 'synced' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          סונכרן
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                          לא נדרש
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

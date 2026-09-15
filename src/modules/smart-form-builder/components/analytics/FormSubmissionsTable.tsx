import React, { useState } from 'react';
import { SmartFormDefinition, SmartFormSubmission } from '../../types';
import { useFormSubmissions } from '../../hooks/useFormSubmissions';
import { FormAnalyticsSummary } from './FormAnalyticsSummary';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { LuxuryIconRenderer } from '../shared/LuxuryIconRenderer';
import { syncSmartFormSubmissionsToContacts } from '../../../crm-analytics/services/smartFormCrmSyncService';
import {
  Search,
  Download,
  FileSpreadsheet,
  Inbox,
  Sparkles,
  Eye,
  User,
  Phone,
  Mail,
  Smartphone,
  Monitor,
  Flame,
  Zap,
  Calendar,
  RefreshCw,
  CheckCircle,
  MessageSquare,
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
  const [selectedSubmission, setSelectedSubmission] = useState<SmartFormSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSyncToCrm = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncSmartFormSubmissionsToContacts(undefined, form.id);
      setSyncStatus(`סונכרנו ${res.totalProcessed} הגשות בהצלחה ל-CRM!`);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      setSyncStatus('שגיאה בסנכרון ל-CRM');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const answersText = Object.values(sub.answers || {}).join(' ').toLowerCase();
    const idText = (sub.id || '').toLowerCase();
    return answersText.includes(term) || idText.includes(term);
  });

  const handleRowClick = (sub: SmartFormSubmission) => {
    setSelectedSubmission(sub);
    setIsModalOpen(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Summary KPI Cards */}
      <FormAnalyticsSummary stats={stats} />

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
              טבלת לידים והגשות (`mod_forms/{form.id}/submissions`)
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {filteredSubmissions.length} הגשות
            </span>
            {syncStatus && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{syncStatus}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש לפי שם, טלפון או תשובה..."
                className="w-full pr-9 pl-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Smart Sync to CRM Button */}
            <button
              type="button"
              onClick={handleSyncToCrm}
              disabled={isSyncing || submissions.length === 0}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
              title="סנכרן את כל הגשות הטופס ישירות למאגר ה-CRM ואנשי הקשר"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'מסנכרן...' : 'סנכרון ל-CRM'}</span>
            </button>

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

        {/* Concise Clean Table */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse text-sm">
            טוען נתוני הגשות בזמן אמת...
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
                  <th className="p-3.5 whitespace-nowrap w-12 text-center">#</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[150px]">איש קשר / שם הליד</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[140px] text-left">מספר טלפון ו-WhatsApp</th>
                  <th className="p-3.5 whitespace-nowrap min-w-[140px]">דוא"ל / מקור</th>
                  <th className="p-3.5 whitespace-nowrap">מכשיר ומערכת</th>
                  <th className="p-3.5 whitespace-nowrap text-left">תאריך הגשה</th>
                  <th className="p-3.5 whitespace-nowrap text-center">איכות ליד</th>
                  <th className="p-3.5 whitespace-nowrap text-center w-28">פרטים מלאים</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSubmissions.map((sub, idx) => {
                  const leadName =
                    sub.answers['conta_name'] ||
                    sub.answers['name'] ||
                    sub.answers['fullName'] ||
                    'פנייה אנונימית';

                  const leadPhone =
                    sub.answers['conta_phone'] ||
                    sub.answers['phone'] ||
                    sub.answers['tel'] ||
                    '-';

                  const leadEmail =
                    sub.answers['email'] ||
                    sub.answers['mail'] ||
                    form.title;

                  const meta = sub.metadata;
                  const hasPhone = leadPhone && leadPhone !== '-';

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => handleRowClick(sub)}
                      className="hover:bg-amber-500/5 dark:hover:bg-slate-800/60 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer group"
                    >
                      <td className="p-3.5 font-mono text-slate-400 text-center">{idx + 1}</td>

                      {/* Lead Name */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                            {leadName}
                          </span>
                        </div>
                      </td>

                      {/* Phone & WhatsApp */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            dir="ltr"
                            className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 inline-block bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-left"
                          >
                            {leadPhone}
                          </span>
                          {hasPhone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(sub);
                              }}
                              className="p-1 rounded-md text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                              title="שלח WhatsApp לליד"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Email / Source */}
                      <td className="p-3.5 whitespace-nowrap text-slate-500 max-w-xs truncate">
                        {leadEmail}
                      </td>

                      {/* Device & OS */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          {meta?.deviceType === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                          )}
                          <span>{meta?.os || 'דסקטופ'}</span>
                        </div>
                      </td>

                      {/* Submitted At (LTR fixed!) */}
                      <td className="p-3.5 whitespace-nowrap text-left">
                        <span dir="ltr" className="font-mono text-[11px] text-slate-500 inline-block">
                          {new Date(sub.submittedAt).toLocaleDateString('he-IL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}{' '}
                          {new Date(sub.submittedAt).toLocaleTimeString('he-IL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* AI Lead Quality Score */}
                      <td className="p-3.5 whitespace-nowrap text-center">
                        {meta?.leadTemperature === 'hot' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Flame className="w-3 h-3 text-amber-500" />
                            חם ({meta.leadScore || 90}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <Zap className="w-3 h-3 text-amber-500" />
                            רגיל
                          </span>
                        )}
                      </td>

                      {/* View Button */}
                      <td className="p-3.5 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(sub);
                          }}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-xs flex items-center gap-1 mx-auto transition-colors border border-amber-500/30"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>צפה בהכל</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Details 360 Modal */}
      <SubmissionDetailModal
        isOpen={isModalOpen}
        submission={selectedSubmission}
        form={form}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubmission(null);
        }}
      />
    </div>
  );
};

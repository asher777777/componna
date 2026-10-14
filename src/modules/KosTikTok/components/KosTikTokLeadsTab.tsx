import React from 'react';
import { Target, RefreshCw, CheckCircle2, User, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { useTikTok } from '../context/TikTokContext';

export const KosTikTokLeadsTab: React.FC = () => {
  const { leads, refreshLeads, isLoading } = useTikTok();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">לידים מקמפיינים ממומנים ב-TikTok</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            לידים שנקלטו אוטומטית מטפסי Lead Generation של טיקטוק ישירות ל-CRM
          </p>
        </div>

        <button
          onClick={() => refreshLeads()}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          רענן לידים
        </button>
      </div>

      {/* Leads Table */}
      {leads.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">אין עדיין לידים בטננט זה</h3>
            <p className="text-xs text-slate-500">
              לידים חדשים מטופסי TikTok יופיעו כאן בזמן אמת עם קבלת ה-Webhook.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 font-bold">שם מלא</th>
                  <th className="px-6 py-3.5 font-bold">טלפון</th>
                  <th className="px-6 py-3.5 font-bold">אימייל</th>
                  <th className="px-6 py-3.5 font-bold">מזהה טופס</th>
                  <th className="px-6 py-3.5 font-bold">תאריך קבלה</th>
                  <th className="px-6 py-3.5 font-bold">סטטוס CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {lead.leadData.fullName || 'ליד ללא שם'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                      {lead.leadData.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {lead.leadData.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {lead.formId || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {new Date(lead.submittedAt).toLocaleDateString('he-IL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        מסונכרן ל-CRM
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

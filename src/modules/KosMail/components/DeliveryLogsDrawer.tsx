/**
 * KOSUN AM (קושאן מייל אוטומטי) - Delivery Logs Drawer
 * 12-Layer Scaffolding Layer 9: Dispatch & Delivery Event Audit Drawer
 */

import React, { useState } from 'react';
import {
  X,
  History,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useKosunAmData } from '../hooks/useKosunAmData';
import { EmailDeliveryLog } from '../types';

export interface DeliveryLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryLogsDrawer: React.FC<DeliveryLogsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { logs, refreshAll } = useKosunAmData();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesQuery =
      log.recipientEmail.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
    return matchesQuery && matchesStatus;
  });

  const getStatusBadge = (status: EmailDeliveryLog['status']) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            נמסר
          </span>
        );
      case 'opened':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Eye className="w-3 h-3" />
            נפתח
          </span>
        );
      case 'simulated_success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <CheckCircle2 className="w-3 h-3" />
            סימולציה
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" />
            נכשל
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-sm flex justify-end">
      <div
        dir="rtl"
        style={{ textAlign: 'right' }}
        className="w-full max-w-xl bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col font-heebo animate-in slide-in-from-left duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                יומן שיגור ומסירה של קושאן
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                תיעוד היסטוריית שיגור, סטטוסי קבלה ושגיאות ספקים
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => refreshAll()}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl transition"
              title="ריענון לוגים"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="חיפוש לפי אימייל או נושא..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="delivered">נמסר</option>
              <option value="opened">נפתח</option>
              <option value="simulated_success">סימולציה</option>
              <option value="failed">נכשל</option>
            </select>
          </div>
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-xs transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                    {log.recipientEmail}
                  </span>
                  {getStatusBadge(log.status)}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1 mb-2">
                  {log.subject}
                </p>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>ספק: {log.provider}</span>
                  <span>{new Date(log.dispatchedAt).toLocaleString('he-IL')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400 text-xs">
              לא נמצאו לוגי שיגור מתאימים
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

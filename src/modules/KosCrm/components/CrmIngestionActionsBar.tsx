import React, { useState } from 'react';
import { 
  Plus, Camera, FileSpreadsheet, Link2, RefreshCw, GitMerge, 
  Users, CreditCard, ChevronUp, ChevronDown, Sparkles, CheckCircle2,
  FolderInput, Layers, MessageSquare, DownloadCloud
} from 'lucide-react';
import { eventBus } from '../../../core/bridge/EventBus';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onNewContact: () => void;
  onScanCard: () => void;
  onExcelImport: () => void;
  onGoogleSheets: () => void;
  onSyncForms: () => void;
  isSyncingForms: boolean;
  onMergeDuplicates: () => void;
  isMergingDuplicates: boolean;
  onOpenGroupsImport: () => void;
  onSyncKesher: () => void;
  isSyncingKesher?: boolean;
}

export const CrmIngestionActionsBar: React.FC<Props> = ({
  isOpen,
  onToggle,
  onNewContact,
  onScanCard,
  onExcelImport,
  onGoogleSheets,
  onSyncForms,
  isSyncingForms,
  onMergeDuplicates,
  isMergingDuplicates,
  onOpenGroupsImport,
  onSyncKesher,
  isSyncingKesher = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-950/60 rounded-2xl p-4 shadow-sm animate-fadeIn transition-all">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <DownloadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white">
              פעולות ייבוא, יצירה וסנכרון נתונים
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              ייבוא מאובטח מכל המקורות, מניעת כפילויות וסנכרון מול מערכות המערכת
            </p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 font-medium transition"
          title="סגור סרגל פעולות"
        >
          <span>סגור</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* 1. Add Contact */}
        <button
          onClick={onNewContact}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition group text-center"
          title="הוספת איש קשר או ליד חדש ידנית"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">איש קשר חדש</span>
          <span className="text-[10px] text-indigo-500/80">ידני / 360</span>
        </button>

        {/* 2. Business Card AI Scanner */}
        <button
          onClick={onScanCard}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 transition group text-center"
          title="סריקת כרטיס ביקור במצלמה וחילוץ פרטים אוטומטי ב-AI"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">כרטיס ביקור</span>
          <span className="text-[10px] text-amber-600/80">סריקת AI</span>
        </button>

        {/* 3. Excel Import (.xlsx / .xls only) */}
        <button
          onClick={onExcelImport}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 transition group text-center"
          title="ייבוא אנשי קשר מקובץ אקסל (.xlsx / .xls) עם מיפוי עמודות חכם"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">ייבוא מאקסל</span>
          <span className="text-[10px] text-emerald-600/80">.xlsx / .xls בלבד</span>
        </button>

        {/* 4. Google Sheets Sync */}
        <button
          onClick={onGoogleSheets}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 transition group text-center"
          title="שיתוף וסנכרון קובץ Google Sheets עם שמירה בגלריה"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
            <Link2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Google Sheets</span>
          <span className="text-[10px] text-blue-600/80">שיתוף וגלריה</span>
        </button>

        {/* 5. Smart Forms Sync */}
        <button
          onClick={onSyncForms}
          disabled={isSyncingForms}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-200 transition group text-center disabled:opacity-50"
          title="סנכרון כל הגשות הטפסים החכמים ישירות למאגר ה-CRM"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
            <RefreshCw className={`w-4 h-4 ${isSyncingForms ? 'animate-spin' : ''}`} />
          </div>
          <span className="text-xs font-bold">{isSyncingForms ? 'מסנכרן...' : 'סנכרון טפסים'}</span>
          <span className="text-[10px] text-rose-600/80">טפסים חכמים</span>
        </button>

        {/* 6. Merge Duplicates */}
        <button
          onClick={onMergeDuplicates}
          disabled={isMergingDuplicates}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-200 transition group text-center disabled:opacity-50"
          title="מיגרציה ואיחוד רשומות כפולות בבסיס הנתונים"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
            <GitMerge className={`w-4 h-4 ${isMergingDuplicates ? 'animate-spin' : ''}`} />
          </div>
          <span className="text-xs font-bold">{isMergingDuplicates ? 'ממזג...' : 'מיזוג כפילויות'}</span>
          <span className="text-[10px] text-teal-600/80">ניקוי ומיגרציה</span>
        </button>

        {/* 7. WhatsApp / Groups Import (Requirement ד) */}
        <button
          onClick={onOpenGroupsImport}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-800 dark:text-violet-200 transition group text-center"
          title="ייבוא אנשי קשר וקבוצות מ-WhatsApp וקהילות"
        >
          <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">ייבוא קבוצות</span>
          <span className="text-[10px] text-violet-600/80">WhatsApp / קהילות</span>
        </button>

        {/* 8. Kesher Financial Sync (Requirement ה) */}
        <button
          onClick={onSyncKesher}
          disabled={isSyncingKesher}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/50 dark:bg-cyan-950/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 transition group text-center disabled:opacity-50"
          title="סנכרון תקבולים, עסקאות ולקוחות ממערכת קשר (Kesher Payments)"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition">
            <CreditCard className={`w-4 h-4 ${isSyncingKesher ? 'animate-spin' : ''}`} />
          </div>
          <span className="text-xs font-bold">{isSyncingKesher ? 'מסנכרן...' : 'סנכרון קשר'}</span>
          <span className="text-[10px] text-cyan-600/80">תקבולים ועסקאות</span>
        </button>
      </div>
    </div>
  );
};

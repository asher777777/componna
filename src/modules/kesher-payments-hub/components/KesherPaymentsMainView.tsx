import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  FileText,
  Clock,
  Settings,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Layers,
  HelpCircle,
  Banknote,
  Receipt,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { kesherService } from '../services/kesherService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { KesherTerminalTab } from './KesherTerminalTab';
import { KesherManualReceiptsTab } from './KesherManualReceiptsTab';
import { KesherTransactionsLogTab } from './KesherTransactionsLogTab';
import { KesherUtilitiesTab } from './KesherUtilitiesTab';

export const KesherPaymentsMainView: React.FC = () => {
  const { openConnectorModal, apiKeys } = useSystemConnection();
  const [activeTab, setActiveTab] = useState<'terminal' | 'manual_receipts' | 'reports' | 'utilities'>('terminal');
  const [isConfigured, setIsConfigured] = useState<boolean>(kesherService.isConfigured());
  const [isEasyCountConnected, setIsEasyCountConnected] = useState<boolean>(kesherService.isEasyCountConnected());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const checkStatus = () => {
    kesherService.loadSettings();
    setIsConfigured(kesherService.isConfigured());
    setIsEasyCountConnected(kesherService.isEasyCountConnected());
  };

  useEffect(() => {
    checkStatus();
  }, [apiKeys]);

  const handleSyncComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header ראשי */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0d121f] rounded-[14px] flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  מרכז סליקה והפקת מסמכים (קשר & EasyCount Hub)
                </h1>
                <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-[11px] font-bold">
                  v2.0 Pro
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                סליקת אשראי, הוראות קבע, ביט, הפקת קבלות וחשבוניות לפי קוד מסמך באיזי קאונט, וסנכרון נתונים מלא ל-CRM.
              </p>
            </div>
          </div>

          {/* סטטוס חיבורים וכפתור הגדרות מערכת */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isConfigured
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isConfigured ? 'מסוף קשר מחובר' : 'קשר: לא מוגדר'}</span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isEasyCountConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isEasyCountConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{isEasyCountConnected ? 'איזי קאונט פעיל' : 'איזי קאונט מנותק'}</span>
            </div>

            <button
              type="button"
              onClick={() => openConnectorModal('kesher_payments')}
              className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>הגדרות סליקה</span>
            </button>
          </div>
        </div>

        {/* תפריט לשוניות (Tabs) */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-[#141824]/90 border border-slate-800/80 rounded-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            מסוף סליקה מהיר (J4/J5/Bit)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual_receipts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'manual_receipts'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-4 h-4" />
            הפקת קבלה / חשבונית ידנית (405/400/320)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            יומן עסקאות, סנכרון ודוחות
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('utilities')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'utilities'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            עזרים, בדיקת כרטיס וקודי שגיאה
          </button>
        </div>

        {/* תוכן הטאב הפעיל */}
        <div className="pt-2">
          {activeTab === 'terminal' && <KesherTerminalTab />}
          {activeTab === 'manual_receipts' && <KesherManualReceiptsTab />}
          {activeTab === 'reports' && <KesherTransactionsLogTab refreshTrigger={refreshTrigger} />}
          {activeTab === 'utilities' && <KesherUtilitiesTab />}
        </div>
      </div>
    </div>
  );
};


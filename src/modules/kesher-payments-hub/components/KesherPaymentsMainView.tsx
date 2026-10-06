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
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { kesherService } from '../services/kesherService';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { KesherTerminalTab } from './KesherTerminalTab';
import { KesherManualReceiptsTab } from './KesherManualReceiptsTab';
import { KesherTransactionsLogTab } from './KesherTransactionsLogTab';
import { KesherUtilitiesTab } from './KesherUtilitiesTab';
import { QuickMetricsBar } from './QuickMetricsBar';
import { KesherPaymentsProvider, useKesherPaymentsContext } from '../context/KesherPaymentsContext';

const KesherPaymentsInnerContent: React.FC = () => {
  const { openConnectorModal, apiKeys } = useSystemConnection();
  const { isDark, toggleTheme } = useKesherPaymentsContext();
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
    <div
      className={`min-h-screen transition-colors duration-200 p-4 sm:p-6 lg:p-8 ${
        isDark ? 'bg-[#0b0f19] text-white' : 'bg-slate-50 text-slate-900'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* סרגל כפתורי בקרה מהירים: סטטוס חיבורים, מצב יום/לילה והגדרות סליקה */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          {/* כותרת קומפקטית */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-bold">
              v2.0 Pro
            </span>
          </div>

          {/* בקרי סטטוס והגדרות */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mr-auto">
            {/* כפתור החלפת תצוגת יום / לילה */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'מעבר למצב יום (בהיר)' : 'מעבר למצב לילה (כהה)'}
              aria-label={isDark ? 'מעבר למצב יום (בהיר)' : 'מעבר למצב לילה (כהה)'}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-amber-300'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-indigo-600'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
              )}
              <span className="hidden sm:inline font-semibold">{isDark ? 'יום' : 'לילה'}</span>
            </button>

            <button
              type="button"
              onClick={() => openConnectorModal('kesher_payments')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                isConfigured
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
              }`}
              title={isConfigured ? 'מסוף קשר מחובר - לחץ לעריכת הגדרות' : 'לחץ להגדרת שם משתמש וסיסמה לקשר'}
            >
              <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isConfigured ? 'מסוף קשר מחובר' : 'קשר: לא מוגדר (הגדר)'}</span>
            </button>

            <button
              type="button"
              onClick={() => openConnectorModal('kesher_payments')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                isEasyCountConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
              title={isEasyCountConnected ? 'איזי קאונט פעיל ומחובר' : 'לחץ להזנת טוקן איזי קאונט'}
            >
              <div className={`w-2 h-2 rounded-full ${isEasyCountConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span>{isEasyCountConnected ? 'איזי קאונט פעיל' : 'איזי קאונט (הגדר)'}</span>
            </button>

            <button
              type="button"
              onClick={() => openConnectorModal('kesher_payments')}
              className={`px-3.5 py-1.5 border font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
                  : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
              }`}
            >
              <Settings className="w-4 h-4 text-indigo-500" />
              <span>הגדרות סליקה</span>
            </button>
          </div>
        </div>

        {/* באנר מדדים פיננסיים מהירים (Quick Metrics Bar) */}
        <QuickMetricsBar />

        {/* תפריט לשוניות (Tabs) */}
        <div
          className={`flex overflow-x-auto gap-2 p-1.5 border rounded-2xl backdrop-blur-md ${
            isDark
              ? 'bg-[#141824]/90 border-slate-800/80'
              : 'bg-white/90 border-slate-200 shadow-sm'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'terminal'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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

export const KesherPaymentsMainView: React.FC = () => {
  return (
    <KesherPaymentsProvider>
      <KesherPaymentsInnerContent />
    </KesherPaymentsProvider>
  );
};


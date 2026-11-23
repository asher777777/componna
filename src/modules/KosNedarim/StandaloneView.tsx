import React, { useState } from 'react';
import { Settings, FileText, CreditCard } from 'lucide-react';
import { NedarimSettingsTab } from './components/NedarimSettingsTab';
import { NedarimManualReceiptsTab } from './components/NedarimManualReceiptsTab';
import { NedarimCheckout } from './components/NedarimCheckout';

export const KosNedarimStandaloneView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'receipts' | 'terminal'>('settings');
  const [testAmount, setTestAmount] = useState(18);
  const [testOpen, setTestOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 text-right" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">KosNedarim — קושנדרים</h1>
            <p className="text-xs text-slate-500 mt-1">סליקה, הוראות קבע, Bit והפקת קבלות מול נדרים פלוס (מבודד לפי טננט)</p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'settings', label: 'הגדרות API', icon: Settings },
              { id: 'receipts', label: 'קבלות ידניות', icon: FileText },
              { id: 'terminal', label: 'מסוף בדיקה', icon: CreditCard },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'settings' && <NedarimSettingsTab />}
        {activeTab === 'receipts' && <NedarimManualReceiptsTab />}
        {activeTab === 'terminal' && (
          <div className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">בדיקת מסוף סליקה (נדרים פלוס)</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value) || 1)}
                className="w-32 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              />
              <button
                type="button"
                onClick={() => setTestOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                פתח סליקה לדוגמה (₪{testAmount})
              </button>
            </div>
            {testOpen && (
              <NedarimCheckout
                amount={testAmount}
                clientName="בדיקת מערכת"
                phone="0500000000"
                mail="test@kosun.pro"
                onSuccess={() => {
                  alert('התשלום בנדרים הושלם בהצלחה!');
                  setTestOpen(false);
                }}
                onCancel={() => setTestOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Settings2, Plus, Trash2, Key, Link2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTikTok } from '../context/TikTokContext';
import { KOS_TIKTOK_CONFIG } from '../config';

export const KosTikTokSettingsTab: React.FC = () => {
  const { accounts, activeAccount, setActiveAccount, disconnectAccount, setIsModalOpen, setModalMode } = useTikTok();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">הגדרות אינטגרציית TikTok</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ניהול ריבוי חשבונות טננט, הרשאות והגדרות Webhook
          </p>
        </div>

        <button
          onClick={() => {
            setModalMode('connect-account');
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          חבר חשבון TikTok נוסף
        </button>
      </div>

      {/* Connected Accounts List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">חשבונות מחוברים בטננט זה</h3>

        {accounts.length === 0 ? (
          <p className="text-xs text-slate-500">אין חשבונות מחוברים כרגע.</p>
        ) : (
          <div className="space-y-3">
            {accounts.map((acc) => {
              const isActive = activeAccount?.id === acc.id;
              return (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'border-pink-500 bg-pink-50/20 dark:bg-pink-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={acc.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={acc.displayName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{acc.displayName}</h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500 text-white">
                            פעיל
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{acc.username} | {acc.followerCount.toLocaleString()} עוקבים</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => setActiveAccount(acc)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        הגדר כפעיל
                      </button>
                    )}
                    <button
                      onClick={() => disconnectAccount(acc.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="נתק חשבון"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Developer Portal Endpoints & Webhooks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Link2 className="w-4 h-4 text-pink-500" />
          כתובות להגדרה ב-TikTok Developer Portal
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Redirect URI (OAuth Callback)</span>
            <div className="font-mono text-xs text-slate-900 dark:text-white select-all">
              https://app.comona.com/api/tiktok/callback
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Webhook Endpoint (Leads & Notifications)</span>
            <div className="font-mono text-xs text-slate-900 dark:text-white select-all">
              https://app.comona.com/api/tiktok/webhook
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

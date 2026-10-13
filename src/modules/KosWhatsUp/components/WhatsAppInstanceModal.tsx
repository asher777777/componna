import React from 'react';
import {
  X, Server, KeyRound, RefreshCw, Power, Battery, Smartphone,
  ShieldCheck, AlertCircle, ExternalLink, CheckCircle, Database
} from 'lucide-react';
import { GreenApiState, GreenApiDeviceInfo } from '../types';
import { GreenApiService } from '../services/greenApiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: GreenApiService;
  instanceId: string;
  token: string;
  webhookUrl?: string;
  stateInstance: GreenApiState;
  deviceInfo: GreenApiDeviceInfo | null;
  isCheckingStatus: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
}

export const WhatsAppInstanceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  service,
  instanceId,
  token,
  webhookUrl,
  stateInstance,
  deviceInfo,
  isCheckingStatus,
  onRefresh,
  onOpenSettings,
  isDark,
}) => {
  if (!isOpen) return null;

  const handleReboot = async () => {
    if (confirm('האם לאתחל מחדש את מופע ה-GREEN-API?')) {
      await service.reboot();
      alert('פקודת אתחול נשלחה למופע!');
      setTimeout(onRefresh, 4000);
    }
  };

  const handleLogout = async () => {
    if (confirm('האם לנתק את חשבון הוואטסאפ מהמופע (Logout)?')) {
      await service.logout();
      alert('החשבון נותק!');
      onRefresh();
    }
  };

  const isAuthorized = stateInstance === 'authorized';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <span>ניהול וסטטוס מופע GREEN-API</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isAuthorized
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {isAuthorized ? '● מחובר ומאושר' : '○ לא מחובר'}
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                מידע אודות החיבור, סוללת המכשיר, מפתחות מופע ופעולות שירות
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              isAuthorized
                ? isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isDark ? 'bg-rose-950/30 border-rose-800/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {isAuthorized ? (
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  סטטוס מופע נוכחי: <span className="uppercase font-mono">{stateInstance}</span>
                </p>
                <p className="text-xs opacity-90">
                  {isAuthorized
                    ? 'המופע מחובר ומסונכרן ל-WhatsApp. כל הפעולות זמינות לשידור וקבלת הודעות.'
                    : 'המופע אינו מחובר ל-WhatsApp. יש להתחבר באמצעות סריקת QR או קוד אימות.'}
                </p>
              </div>
            </div>

            <button
              onClick={onRefresh}
              disabled={isCheckingStatus}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 border ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-white'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin text-indigo-500' : ''}`} />
              <span>בדוק עכשיו</span>
            </button>
          </div>

          {/* Instance Telemetry & Device Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className={`p-4 rounded-2xl border space-y-1.5 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>טלפון מחובר</span>
              <div className="font-mono text-sm font-bold text-emerald-500 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>{deviceInfo?.phone || (isAuthorized ? 'מחובר' : 'לא זמין')}</span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1.5 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>סוללת מכשיר ופלטפורמה</span>
              <div className="font-mono text-sm font-bold flex items-center gap-2">
                <Battery className="w-4 h-4 text-amber-500" />
                <span>
                  {deviceInfo?.battery !== undefined
                    ? `${deviceInfo.battery}% (${deviceInfo.platform || 'WhatsApp'})`
                    : 'לא זמין'}
                </span>
              </div>
            </div>
          </div>

          {/* Credentials Info (Centralized) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span>פרטי מופע (מנוהלים ברכיב הסנכרון)</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-xs text-indigo-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>פתח עריכת סנכרון</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono">
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-sans`}>Instance ID</span>
                <span className="font-bold text-indigo-400">{instanceId || 'לא הוגדר'}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-sans`}>API Token</span>
                <span className="font-bold text-emerald-400">{token ? `•••• (${token.slice(-4)})` : 'לא הוגדר'}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} font-sans`}>Webhook URL</span>
                <span className="font-bold text-purple-400 truncate block">{webhookUrl || 'ברירת מחדל'}</span>
              </div>
            </div>
          </div>

          {/* Instance Actions */}
          <div className={`pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex flex-wrap items-center justify-between gap-3`}>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReboot}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                <span>אתחל מופע (Reboot)</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 transition cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>נתק חשבון (Logout)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow transition cursor-pointer"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

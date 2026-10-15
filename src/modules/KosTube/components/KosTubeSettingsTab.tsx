import React, { useState } from 'react';
import { 
  Youtube, 
  Key, 
  Settings2, 
  CheckCircle2, 
  Save, 
  AlertCircle, 
  RefreshCw, 
  Globe, 
  Phone, 
  Sliders 
} from 'lucide-react';
import { useKosTube } from '../context/KosTubeContext';
import { kosTubeFirestore } from '../services/kosTubeFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';

export const KosTubeSettingsTab: React.FC = () => {
  const { channel, syncChannel, isSyncing, refreshData, isRootTenant } = useKosTube();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();

  const [channelQuery, setChannelQuery] = useState<string>(channel?.customUrl || channel?.channelId || '');
  const [apiKey, setApiKey] = useState<string>(channel?.apiKey || '');
  const [autoGenerate, setAutoGenerate] = useState<boolean>(channel?.autoGeneratePages ?? true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      if (channel) {
        const updated = {
          ...channel,
          apiKey: isRootTenant ? apiKey : (channel.apiKey || ''),
          autoGeneratePages: autoGenerate,
        };
        await kosTubeFirestore.saveChannel(db, tenantId, updated);

        if (isRootTenant && apiKey && db) {
          try {
            const { setDoc, doc } = await import('firebase/firestore');
            await setDoc(
              doc(db, 'tenants', '_master', 'settings', 'api_keys'),
              { youtubeApiKey: apiKey.trim() },
              { merge: true }
            );
            await setDoc(
              doc(db, 'tenants', '_master', 'settings', 'kostube'),
              { apiKey: apiKey.trim() },
              { merge: true }
            );
          } catch (e) {
            console.warn('[KosTubeSettings] Could not save master keys:', e);
          }
        }

        await refreshData();
      } else if (channelQuery.trim()) {
        await syncChannel(channelQuery, isRootTenant ? apiKey : undefined);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Settings2 className="w-5 h-5 text-red-500" />
          <span>הגדרות חיבור ערוץ יוטיוב ו-SEO</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          הגדר את פרטי הערוץ המסונכרן, מפתחות הגישה, והגדרות יצירת המאמרים האוטומטית.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* Channel Query */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              כתובת ערוץ יוטיוב או Handle
            </label>
            <div className="relative">
              <Youtube className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              <input
                type="text"
                placeholder="לדוגמה: @MyChannelName או https://youtube.com/@channel"
                value={channelQuery}
                onChange={(e) => setChannelQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              ניתן להזין מזהה ערוץ מלא, Handle הפותח ב-@, או קישור ישיר לעמוד הערוץ.
            </p>
          </div>

          {/* YouTube API Key - Root Tenant vs Subdomain */}
          {isRootTenant ? (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  מפתח YouTube Data API v3 (נדרש לסנכרון אוטומטי של כל סרטוני הערוץ)
                </label>
                <div className="relative">
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  לסנכרון רשימת כל הסרטונים מהערוץ נדרש מפתח של Google. אם אין ברשותך מפתח, ניתן תמיד להוסיף סרטונים אמיתיים בודדים באמצעות כפתור "הוסף סרטון בקישור".
                </p>
              </div>

              {/* Guide Card on how to get the key */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>מדריך מהיר: איך להשיג מפתח YouTube Data API v3 בחינם (תוך 2 דקות)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed pr-1">
                  <li>
                    היכנס ל-Google Cloud Console בכתובת{' '}
                    <a
                      href="https://console.cloud.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:underline font-semibold"
                    >
                      console.cloud.google.com
                    </a>
                    .
                  </li>
                  <li>פתח פרויקט חדש (או בחר פרויקט קיים).</li>
                  <li>בתפריט הראשי נווט ל-<strong>APIs & Services</strong> &gt; <strong>Library</strong> (ספרייה).</li>
                  <li>חפש <strong>YouTube Data API v3</strong> ולחץ על <strong>Enable (הפעל)</strong>.</li>
                  <li>עבור ל-<strong>Credentials (אישורים)</strong> &gt; לחץ על <strong>+ Create Credentials</strong> &gt; בחר ב-<strong>API Key</strong>.</li>
                  <li>העתק את המפתח שנוצר (מתחיל ב-<code>AIzaSy...</code>) והדבק אותו כאן בשדה למעלה.</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>מפתח YouTube Data API מוגדר אוטומטית ברמת המערכת (Master)</span>
              </div>
              <p className="text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
                סנכרון ערוצי יוטיוב מתבצע באמצעות מפתח המאסטר המרכזי של המערכת. אין צורך בהזנת מפתח API בסאב-דומיין זה.
              </p>
            </div>
          )}

          {/* Auto generation toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                הפקת עמודי SEO מלאים ברגע סנכרון סרטון חדש (אוטומציה מלאה)
              </span>
            </label>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>ההגדרות נשמרו בהצלחה ועודכנו בטננט.</span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving || isSyncing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'שומר...' : 'שמור הגדרות'}</span>
            </button>

            {channel && (
              <button
                type="button"
                onClick={() => syncChannel(channel.customUrl || channel.channelId, apiKey)}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>סנכרן סרטונים כעת</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

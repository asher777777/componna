import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Wifi, Loader2 } from 'lucide-react';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { nedarimService } from '../services/nedarimService';

export const NedarimSettingsTab: React.FC = () => {
  const { apiKeys, updateApiKeys } = useSystemConnection();

  const [mosadid, setMosadid] = useState(apiKeys.nedarimMosadId || '');
  const [apivalid, setApivalid] = useState(apiKeys.nedarimApiValid || '');
  const [apipassword, setApipassword] = useState(apiKeys.nedarimApiPassword || '');
  const [group, setGroup] = useState(apiKeys.nedarimGroup || '');
  const [paymentProvider, setPaymentProvider] = useState<'kesher' | 'nedarim'>(apiKeys.paymentProvider || 'nedarim');

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    setMosadid(apiKeys.nedarimMosadId || '');
    setApivalid(apiKeys.nedarimApiValid || '');
    setApipassword(apiKeys.nedarimApiPassword || '');
    setGroup(apiKeys.nedarimGroup || '');
    setPaymentProvider(apiKeys.paymentProvider || 'nedarim');
  }, [apiKeys]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await updateApiKeys({
        paymentProvider,
        nedarimMosadId: mosadid.trim(),
        nedarimApiValid: apivalid.trim(),
        nedarimApiPassword: apipassword.trim(),
        nedarimGroup: group.trim(),
      });
      setStatusMsg({ type: 'ok', text: 'הגדרות נדרים פלוס נשמרו בהצלחה!' });
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err?.message || 'שגיאה בשמירת ההגדרות' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await nedarimService.testConnection({
        mosadid: mosadid.trim(),
        apivalid: apivalid.trim(),
        apipassword: apipassword.trim(),
      });
      if (res.success) {
        const count = Array.isArray(res.data) ? res.data.length : 0;
        setStatusMsg({ type: 'ok', text: `החיבור לנדרים פלוס תקין! נמצאו ${count} קופות פעילות.` });
      } else {
        setStatusMsg({ type: 'err', text: res.error || 'בדיקת החיבור נכשלה' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'err', text: err?.message || 'שגיאת תקשורת מול נדרים פלוס' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-right" dir="rtl">
      <div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">הגדרות חיבור API — נדרים פלוס</h3>
        <p className="text-xs text-slate-500 mt-1">נשמר ברמת הטננט (`settings/api_keys`) ומוגן מאחורי השרת.</p>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">קבע את נדרים פלוס כספק הסליקה הפעיל לטננט</span>
        <input
          type="checkbox"
          checked={paymentProvider === 'nedarim'}
          onChange={(e) => setPaymentProvider(e.target.checked ? 'nedarim' : 'kesher')}
          className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mosad ID (מספר מוסד) *</label>
          <input
            type="text"
            value={mosadid}
            onChange={(e) => setMosadid(e.target.value)}
            required
            dir="ltr"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-left"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">API Valid (טוקן אימות) *</label>
          <input
            type="text"
            value={apivalid}
            onChange={(e) => setApivalid(e.target.value)}
            required
            dir="ltr"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-left"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">API Password (סיסמת דוחות וקבלות)</label>
          <input
            type="text"
            value={apipassword}
            onChange={(e) => setApipassword(e.target.value)}
            dir="ltr"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-left"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Group / קטגוריה (אופציונלי)</label>
          <input
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
          />
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${statusMsg.type === 'ok' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'}`}>
          {statusMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>שמור הגדרות</span>
        </button>

        <button
          type="button"
          onClick={handleTest}
          disabled={testing || !mosadid || !apivalid}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm cursor-pointer disabled:opacity-50"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
          <span>בדוק חיבור</span>
        </button>
      </div>
    </form>
  );
};

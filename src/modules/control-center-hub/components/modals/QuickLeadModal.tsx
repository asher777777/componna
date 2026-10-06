import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { LeadCaptureContract } from '../../../../core/contracts';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant/TenantScopeContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../../core/contracts/collections';

export const QuickLeadModal: React.FC = () => {
  const { quickLeadModalOpen, setQuickLeadModalOpen, refreshStats, theme } = useControlCenter();
  const { getCapability } = useHostCapabilities();
  const { db } = useSystemConnection();
  const { getScopedCollectionName } = useTenantScope();
  const isLight = theme === 'light';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!quickLeadModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('נא למלא שם מלא ומספר טלפון');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Try global Host Capability if available
      const leadCapture = getCapability<LeadCaptureContract>('lead-capture');
      if (leadCapture) {
        await leadCapture.captureLead({
          conta_name: name.trim(),
          conta_phone: phone.trim(),
          email: email.trim() || undefined,
          source: 'Control Center Hub',
          tags: ['לוח בקרה', 'ליד ישיר'],
        });
      } else if (db) {
        // 2. Direct clean insertion to scoped contacts collection
        const colPath = getScopedCollectionName(SYSTEM_COLLECTIONS.CONTACTS);
        await addDoc(collection(db, colPath), {
          conta_name: name.trim(),
          conta_phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim(),
          is_lead: true,
          status: 'new',
          lead_source: 'Control Center Hub',
          tags: ['לוח בקרה'],
          createdAt: serverTimestamp(),
        });
      }

      setSuccess(true);
      await refreshStats();
      setTimeout(() => {
        setSuccess(false);
        setQuickLeadModalOpen(false);
        setName('');
        setPhone('');
        setEmail('');
        setNotes('');
      }, 1200);
    } catch (err: any) {
      console.error('[QuickLeadModal] Error saving lead:', err);
      setError(err?.message || 'שגיאה בשמירת הליד במסד הנתונים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className={`rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-right border transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b mb-5 ${
          isLight ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600/20 text-emerald-400'
            }`}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>הזנת ליד מהיר למסד</h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>שמירה ישירה לקולקציית contacts</p>
            </div>
          </div>
          <button
            onClick={() => setQuickLeadModalOpen(false)}
            className={`p-1.5 rounded-lg transition ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-2xl flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>הליד נשמר בהצלחה במסד הנתונים וספירות הלוח עודכנו!</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              שם מלא <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="למשל: דניאל כהן"
              className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none transition border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              מספר טלפון / וואטסאפ <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="למשל: 050-1234567"
              className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none transition border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              כתובת אימייל (אופציונלי)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none transition border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              הערות (אופציונלי)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="פרטים נוספים לגבי הליד..."
              className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none transition resize-none border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setQuickLeadModalOpen(false)}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'שומר...' : 'שמור ליד במסד'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useControlCenter } from '../../context/ControlCenterContext';
import { useSystemConnection } from '../../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../../core/tenant/TenantScopeContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../../core/contracts/collections';

export interface QuickWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickWhatsAppModal: React.FC<QuickWhatsAppModalProps> = ({ isOpen, onClose }) => {
  const { theme, refreshStats } = useControlCenter();
  const { db } = useSystemConnection();
  const { getScopedCollectionName } = useTenantScope();
  const isLight = theme === 'light';

  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) {
      setError('נא למלא מספר טלפון והודעה לשליחה');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Clean Israeli / international phone
      let cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '972' + cleanPhone.substring(1);
      }

      // 2. Open WhatsApp Web / App directly
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message.trim())}`;
      window.open(waUrl, '_blank');

      // 3. Log real interaction in Firestore if connected
      if (db) {
        const colPath = getScopedCollectionName(SYSTEM_COLLECTIONS.WHATSAPP_MESSAGES);
        await addDoc(collection(db, colPath), {
          recipientPhone: cleanPhone,
          message: message.trim(),
          source: 'Control Center Hub Quick Send',
          status: 'sent',
          createdAt: serverTimestamp(),
        });
        await refreshStats();
      }

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
        setPhone('');
        setMessage('');
      }, 1500);
    } catch (err: any) {
      console.error('[QuickWhatsAppModal] Error:', err);
      setError(err?.message || 'שגיאה בשיגור ההודעה');
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
              isLight ? 'bg-green-100 text-green-700' : 'bg-green-600/20 text-green-400'
            }`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                שיגור הודעת וואטסאפ פעילה
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                פתיחה ישירה ב-WhatsApp ורישום במסד
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {sentSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-600 rounded-2xl flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>ההודעה שוגרה לוואטסאפ ונרשמה במסד הנתונים!</span>
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
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              מספר טלפון / וואטסאפ נמען <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-1234567 או 972501234567"
              className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none transition border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-green-500'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-green-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              תוכן ההודעה <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כתוב כאן את תוכן ההודעה..."
              className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none transition resize-none border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-green-500'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-green-500'
              }`}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl transition shadow-lg shadow-green-600/25 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'משגר...' : 'שגר לוואטסאפ'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

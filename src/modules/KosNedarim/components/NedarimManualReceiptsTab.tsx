import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, FileText, Banknote, Landmark, CreditCard, Loader2 } from 'lucide-react';
import { nedarimService } from '../services/nedarimService';

export const NedarimManualReceiptsTab: React.FC = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    paymentType: 'Cash' as 'Cash' | 'Check' | 'BankTransfer' | 'Credit',
    receiptType: '405',
    zeout: '',
    phone: '',
    details: '',
    date: new Date().toISOString().split('T')[0],
    checkNumber: '',
    bankName: '',
    branchNumber: '',
    accountNumber: '',
    transferRef: '',
    cardType: '',
    last4Digits: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (!formData.clientName || !formData.amount) {
      setError('נא למלא שם לקוח וסכום.');
      setLoading(false);
      return;
    }

    try {
      const res = await nedarimService.createManualInvoice({
        ...formData,
        amount: Number(formData.amount),
      });
      if (res.success) {
        setSuccess(res.message || 'הקבלה הופקה בהצלחה בנדרים פלוס!');
        setFormData((prev) => ({ ...prev, clientName: '', amount: '', details: '' }));
      } else {
        setError(res.error || 'שגיאה בהפקת הקבלה');
      }
    } catch (err: any) {
      setError(err?.message || 'שגיאת תקשורת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-right" dir="rtl">
      <div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <span>הפקת קבלה ידנית — נדרים פלוס (תמ&quot;ל 3)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">תיעוד הכנסה חיצונית (מזומן, צ&apos;ק, העברה, אשראי) והפקת קבלה אוטומטית.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'Cash', label: 'מזומן', icon: Banknote },
          { id: 'Check', label: "צ'ק", icon: FileText },
          { id: 'BankTransfer', label: 'העברה בנקאית', icon: Landmark },
          { id: 'Credit', label: 'אשראי', icon: CreditCard },
        ].map((m) => {
          const Icon = m.icon;
          const active = formData.paymentType === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setFormData({ ...formData, paymentType: m.id as any })}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'}`}
            >
              <Icon className="w-4 h-4" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1">שם הלקוח / תורם *</label>
          <input
            type="text"
            required
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">סכום (₪) *</label>
          <input
            type="number"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">סוג מסמך</label>
          <select
            value={formData.receiptType}
            onChange={(e) => setFormData({ ...formData, receiptType: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
          >
            <option value="405">קבלה על תרומה (405)</option>
            <option value="400">קבלה (400)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">ת.ז. / ח.פ. (אופציונלי)</label>
          <input
            type="text"
            value={formData.zeout}
            onChange={(e) => setFormData({ ...formData, zeout: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold mb-1">פירוט / עבור</label>
          <input
            type="text"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
          />
        </div>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm cursor-pointer disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>הפק קבלה בנדרים פלוס</span>
      </button>
    </form>
  );
};

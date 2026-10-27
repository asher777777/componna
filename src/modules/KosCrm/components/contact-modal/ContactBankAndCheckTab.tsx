import React, { useState } from 'react';
import { 
  Landmark, 
  Receipt, 
  Plus, 
  CheckCircle2, 
  CreditCard, 
  Copy, 
  Check, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Contact, PaymentRecord } from '../../types';

interface Props {
  formData: Contact;
  onChange: (field: keyof Contact, value: any) => void;
}

const ISRAEL_BANKS = [
  { code: '12', name: 'בנק הפועלים (12)' },
  { code: '10', name: 'בנק לאומי (10)' },
  { code: '11', name: 'בנק דיסקונט (11)' },
  { code: '20', name: 'בנק מזרחי טפחות (20)' },
  { code: '31', name: 'הבנק הבינלאומי (31)' },
  { code: '04', name: 'בנק יהב (04)' },
  { code: '46', name: 'בנק מסד (46)' },
  { code: '14', name: 'בנק אוצר החייל (14)' },
  { code: '09', name: 'בנק הדואר (09)' },
  { code: '26', name: 'יובנק (26)' },
  { code: '22', name: 'One Zero (22)' },
  { code: '99', name: 'אחר / חו"ל' },
];

export const ContactBankAndCheckTab: React.FC<Props> = ({ formData, onChange }) => {
  const [copied, setCopied] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // New quick payment form state
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>('');
  const [newPaymentType, setNewPaymentType] = useState<string>('צ\'ק');
  const [newPaymentDate, setNewPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newPaymentRef, setNewPaymentRef] = useState<string>(formData.check_number || '');
  const [newPaymentProject, setNewPaymentProject] = useState<string>('');

  const handleCopyDetails = () => {
    const text = [
      `פרטי לקוח: ${formData.conta_name}`,
      formData.bank_name ? `בנק: ${formData.bank_name}` : '',
      formData.branch_number ? `סניף: ${formData.branch_number}` : '',
      formData.account_number ? `חשבון: ${formData.account_number}` : '',
      formData.check_number ? `מספר צ'ק: ${formData.check_number}` : '',
      formData.tg1 ? `ת.ז/ח.פ: ${formData.tg1}` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPayment = () => {
    const amountNum = parseFloat(newPaymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('נא להזין סכום תקין לתשלום');
      return;
    }

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: newPaymentDate || new Date().toISOString().slice(0, 10),
      amount: amountNum,
      paymentType: newPaymentType,
      receiptType: '400',
      kesherStatus: 'Success',
      receiptLink: ''
    };

    const currentPayments = Array.isArray(formData.payments) ? [...formData.payments] : [];
    const updatedPayments = [newPayment, ...currentPayments];
    const newTotalSpent = (formData.total_spent || 0) + amountNum;
    const newOrderCount = (formData.order_count || 0) + 1;

    // Save payments and recalculations
    onChange('payments', updatedPayments);
    onChange('total_spent', newTotalSpent);
    onChange('order_count', newOrderCount);
    onChange('last_order_date', newPayment.date);

    // If check, also update default check number
    if (newPaymentType.includes('צ\'ק') && newPaymentRef) {
      onChange('check_number', newPaymentRef);
    }

    // Reset form
    setNewPaymentAmount('');
    setNewPaymentProject('');
    setShowAddPayment(false);
  };

  return (
    <div className="space-y-6 text-xs text-right" dir="rtl">
      {/* Top action bar: copy and quick fill */}
      <div className="flex items-center justify-between p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-xs">ניהול פרטי בנק וצ'קים למילוי מהיר</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              הפרטים נשמרים בכרטיס הלקוח ומשמשים למילוי אוטומטי בהפקת קבלות ורישום תקבולים
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyDetails}
          className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
          <span>{copied ? 'הועתק!' : 'העתק פרטים'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* פרטי חשבון בנק */}
        <div className="p-4 bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/60 pb-2">
            <Landmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h5 className="font-bold text-gray-900 dark:text-white">פרטי חשבון בנק (להעברות ומס"ב)</h5>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
              בנק
            </label>
            <select
              value={formData.bank_name || ''}
              onChange={(e) => onChange('bank_name', e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">בחר בנק...</option>
              {ISRAEL_BANKS.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                מספר סניף
              </label>
              <input
                type="text"
                value={formData.branch_number || ''}
                onChange={(e) => onChange('branch_number', e.target.value)}
                placeholder="לדוגמה: 760"
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                מספר חשבון
              </label>
              <input
                type="text"
                value={formData.account_number || ''}
                onChange={(e) => onChange('account_number', e.target.value)}
                placeholder="לדוגמה: 123456"
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
              שם בעל החשבון
            </label>
            <input
              type="text"
              value={formData.bank_account_owner || formData.conta_name || ''}
              onChange={(e) => onChange('bank_account_owner', e.target.value)}
              placeholder="שם בעל החשבון המלא"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
              קוד מוסד / הרשאה לחיוב חשבון
            </label>
            <input
              type="text"
              value={formData.bank_auth_number || ''}
              onChange={(e) => onChange('bank_auth_number', e.target.value)}
              placeholder="מספר הרשאה / אסמכתא"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* פרטי צ'קים */}
        <div className="p-4 bg-gray-50/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/60 pb-2">
            <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h5 className="font-bold text-gray-900 dark:text-white">פרטי צ'קים ברירת מחדל</h5>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
              מספר צ'ק אחרון / ברירת מחדל
            </label>
            <input
              type="text"
              value={formData.check_number || ''}
              onChange={(e) => onChange('check_number', e.target.value)}
              placeholder="לדוגמה: 000153"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                בנק מושך
              </label>
              <input
                type="text"
                value={formData.check_bank_name || formData.bank_name || ''}
                onChange={(e) => onChange('check_bank_name', e.target.value)}
                placeholder="שם הבנק על הצ'ק"
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                סניף הצ'ק
              </label>
              <input
                type="text"
                value={formData.check_branch || formData.branch_number || ''}
                onChange={(e) => onChange('check_branch', e.target.value)}
                placeholder="סניף"
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
              לפקודת (Payee)
            </label>
            <input
              type="text"
              value={formData.check_payee || ''}
              onChange={(e) => onChange('check_payee', e.target.value)}
              placeholder="שם המוטב על הצ'ק"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
              תעודת זהות / ח.פ מושך הצ'ק
            </label>
            <input
              type="text"
              value={formData.tg1 || formData.tz || ''}
              onChange={(e) => onChange('tg1', e.target.value)}
              placeholder="מספר ת.ז / ח.פ"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* אזור רישום תקבול / עסקה מהיר ללקוח (למשל צ'ק 1,500 ₪) */}
      <div className="p-4 bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h5 className="font-bold text-gray-900 dark:text-white">
              הוספת תקבול / עסקת צ'ק או העברה ללקוח
            </h5>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPayment(!showAddPayment)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddPayment ? 'סגור טופס' : 'הוסף תקבול חדש'}</span>
          </button>
        </div>

        {showAddPayment && (
          <div className="p-4 bg-white dark:bg-gray-900 border border-emerald-500/30 rounded-xl space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  סכום (₪) *
                </label>
                <input
                  type="number"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                  placeholder="לדוגמה: 1500"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-bold font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  אמצעי תשלום
                </label>
                <select
                  value={newPaymentType}
                  onChange={(e) => setNewPaymentType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="צ'ק">צ'ק</option>
                  <option value="העברה בנקאית">העברה בנקאית</option>
                  <option value="מזומן">מזומן</option>
                  <option value="כרטיס אשראי">כרטיס אשראי</option>
                  <option value="Bit">Bit</option>
                  <option value="הוראת קבע">הוראת קבע</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  מספר צ'ק / אסמכתא
                </label>
                <input
                  type="text"
                  value={newPaymentRef}
                  onChange={(e) => setNewPaymentRef(e.target.value)}
                  placeholder={formData.check_number || '000153'}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  תאריך
                </label>
                <input
                  type="date"
                  value={newPaymentDate}
                  onChange={(e) => setNewPaymentDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPayment(false)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleAddPayment}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>שמור תקבול בכרטיס לקוח</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

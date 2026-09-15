import React, { useState } from 'react';
import { ExternalLink, Plus, Check, Receipt, Landmark, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { Contact, PaymentRecord } from '../../types';

interface Props {
  formData: Contact;
  onChange?: (field: keyof Contact, value: any) => void;
}

export const ContactFinancialTab: React.FC<Props> = ({ formData, onChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('צ\'ק');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ref, setRef] = useState(formData.check_number || '');

  const handleAddPayment = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('נא להזין סכום תקין');
      return;
    }

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: date || new Date().toISOString().slice(0, 10),
      amount: num,
      paymentType: paymentType + (ref ? ` (${ref})` : ''),
      receiptType: '400',
      kesherStatus: 'Success',
      receiptLink: ''
    };

    const currentPayments = Array.isArray(formData.payments) ? [...formData.payments] : [];
    const updatedPayments = [newPayment, ...currentPayments];
    const newTotalSpent = (formData.total_spent || 0) + num;
    const newOrderCount = (formData.order_count || 0) + 1;

    if (onChange) {
      onChange('payments', updatedPayments);
      onChange('total_spent', newTotalSpent);
      onChange('order_count', newOrderCount);
      onChange('last_order_date', newPayment.date);
      if (paymentType.includes('צ\'ק') && ref) {
        onChange('check_number', ref);
      }
    }

    setAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border">
          <span className="text-gray-500 block">סה"כ רכישות</span>
          <span className="text-lg font-bold text-emerald-600 mt-1 block">
            ₪{(formData.total_spent || 0).toLocaleString('he-IL')}
          </span>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border">
          <span className="text-gray-500 block">מספר הזמנות</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white mt-1 block">
            {formData.order_count || 0}
          </span>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border">
          <span className="text-gray-500 block">תאריך הזמנה אחרונה</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 block">
            {formData.last_order_date || 'אין רכישות'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">היסטוריית תשלומים</h4>
        {onChange && (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-1 text-[11px] cursor-pointer transition shadow-sm"
          >
            <Plus className="w-3 h-3" />
            <span>{showAddForm ? 'סגור' : 'הוסף תקבול ידני'}</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/90 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">סכום (₪) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="למשל 1500"
                className="w-full bg-white dark:bg-gray-900 border rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">אמצעי תשלום</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
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
              <label className="block text-[10px] text-gray-500 mb-0.5">מספר אסמכתא / צ'ק</label>
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder={formData.check_number || '000153'}
                className="w-full bg-white dark:bg-gray-900 border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-0.5">תאריך</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 border rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleAddPayment}
              className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 shadow"
            >
              <Check className="w-3 h-3" />
              <span>שמור תקבול</span>
            </button>
          </div>
        </div>
      )}

      <div>
        {formData.payments && formData.payments.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="p-2">תאריך</th>
                  <th className="p-2">סכום</th>
                  <th className="p-2">אמצעי תשלום</th>
                  <th className="p-2">קבלה</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {formData.payments.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="p-2">{p.date}</td>
                    <td className="p-2 font-bold text-emerald-600">₪{Number(p.amount).toLocaleString('he-IL')}</td>
                    <td className="p-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded font-medium text-[11px]">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="p-2">
                      {p.receiptLink ? (
                        <a href={p.receiptLink} target="_blank" rel="noreferrer" className="text-indigo-600 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>צפה</span>
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 py-4 text-center border border-dashed rounded-lg">
            אין היסטוריית תשלומים זמינה
          </p>
        )}
      </div>
    </div>
  );
};

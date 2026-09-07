import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Contact } from '../../types';

interface Props {
  formData: Contact;
}

export const ContactFinancialTab: React.FC<Props> = ({ formData }) => {
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

      <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">היסטוריית תשלומים</h4>
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
                    <td className="p-2 font-bold text-emerald-600">₪{p.amount}</td>
                    <td className="p-2">{p.paymentType}</td>
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

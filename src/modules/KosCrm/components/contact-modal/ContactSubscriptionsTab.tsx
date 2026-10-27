import React, { useState } from 'react';
import { Contact, UserSubscription } from '../../types';
import { Package, Calendar, DollarSign, Globe, Plus, Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { AuthSessionContract } from '../../../../core/contracts';

interface Props {
  formData: Contact;
  onChange: (field: keyof Contact, value: any) => void;
}

export const ContactSubscriptionsTab: React.FC<Props> = ({ formData, onChange }) => {
  const { getCapability } = useHostCapabilities();
  const authSession = getCapability<AuthSessionContract>('auth-session');
  // @ts-ignore (since system_admin is not formally in the type but may be used)
  const isAdmin = authSession?.role === 'admin' || authSession?.role === 'system_admin';
  const subscriptions: UserSubscription[] = formData.subscriptions || [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserSubscription>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = () => {
    if (isAdding) {
      const newSub: UserSubscription = {
        id: Date.now().toString(),
        componentName: editForm.componentName || '',
        packageName: editForm.packageName || '',
        paymentAmount: Number(editForm.paymentAmount) || 0,
        startDate: editForm.startDate || new Date().toISOString().split('T')[0],
        endDate: editForm.endDate || '',
        subdomain: editForm.subdomain || '',
        status: editForm.status || 'active',
        billingCycle: editForm.billingCycle || 'monthly',
        nextBillingDate: editForm.nextBillingDate || '',
        billingCustomerId: editForm.billingCustomerId || '',
        cancellationReason: editForm.cancellationReason || '',
        paymentMethod: editForm.paymentMethod || '',
      };
      onChange('subscriptions', [...subscriptions, newSub]);
      setIsAdding(false);
    } else if (editingId) {
      const updated = subscriptions.map(s => s.id === editingId ? { ...s, ...editForm } as UserSubscription : s);
      onChange('subscriptions', updated);
      setEditingId(null);
    }
  };

  const handleEdit = (sub: UserSubscription) => {
    setEditingId(sub.id);
    setEditForm({ ...sub });
  };

  const handleDelete = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק מינוי זה?')) {
      onChange('subscriptions', subscriptions.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-500" />
          ניהול מינויים ורכיבים
        </h3>
        {isAdmin && !isAdding && (
          <button
            onClick={() => { setIsAdding(true); setEditForm({}); setEditingId(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md text-sm font-medium hover:bg-indigo-100 transition"
          >
            <Plus className="w-4 h-4" />
            הוסף רכיב
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>רק מנהל מערכת מורשה להוסיף או לערוך מינויים ורכיבים.</span>
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="p-4 border border-indigo-200 dark:border-indigo-800 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 space-y-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{isAdding ? 'הוספת רכיב חדש' : 'עריכת רכיב'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">שם הרכיב</label>
              <input
                type="text"
                value={editForm.componentName || ''}
                onChange={e => setEditForm(prev => ({ ...prev, componentName: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                placeholder="לדוגמה: CRM Analytics"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">שם החבילה</label>
              <input
                type="text"
                value={editForm.packageName || ''}
                onChange={e => setEditForm(prev => ({ ...prev, packageName: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                placeholder="לדוגמה: Pro Plan"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">סכום תשלום (₪)</label>
              <input
                type="number"
                value={editForm.paymentAmount || ''}
                onChange={e => setEditForm(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">סאב דומיין</label>
              <input
                type="text"
                value={editForm.subdomain || ''}
                onChange={e => setEditForm(prev => ({ ...prev, subdomain: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                placeholder="client.kosun.co.il"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">תאריך התחלה</label>
              <input
                type="date"
                value={editForm.startDate || ''}
                onChange={e => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">תאריך סיום (אופציונלי)</label>
              <input
                type="date"
                value={editForm.endDate || ''}
                onChange={e => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">סטטוס</label>
              <select
                value={editForm.status || 'active'}
                onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                <option value="active">פעיל</option>
                <option value="paused">מושהה</option>
                <option value="past_due">בפיגור תשלום</option>
                <option value="canceled">מבוטל</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">מחזור חיוב</label>
              <select
                value={editForm.billingCycle || 'monthly'}
                onChange={e => setEditForm(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                <option value="monthly">חודשי</option>
                <option value="annually">שנתי</option>
                <option value="one_time">חד פעמי</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">תאריך חיוב הבא</label>
              <input
                type="date"
                value={editForm.nextBillingDate || ''}
                onChange={e => setEditForm(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">אמצעי תשלום</label>
              <input
                type="text"
                value={editForm.paymentMethod || ''}
                onChange={e => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                placeholder="לדוגמה: אשראי מסתיים ב-4567"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">מזהה לקוח בסליקה</label>
              <input
                type="text"
                value={editForm.billingCustomerId || ''}
                onChange={e => setEditForm(prev => ({ ...prev, billingCustomerId: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                placeholder="לדוגמה: cus_O1..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">סיבת ביטול</label>
              <input
                type="text"
                value={editForm.cancellationReason || ''}
                onChange={e => setEditForm(prev => ({ ...prev, cancellationReason: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                placeholder="אם בוטל, ציין סיבה"
                disabled={editForm.status !== 'canceled'}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-3 py-1.5 flex items-center gap-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4" /> ביטול
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 flex items-center gap-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              <Save className="w-4 h-4" /> שמור
            </button>
          </div>
        </div>
      )}

      {subscriptions.length === 0 && !isAdding ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          אין מינויים רשומים למשתמש זה.
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 flex flex-col md:flex-row gap-4 justify-between">
              <div className="grid grid-cols-2 md:flex gap-6">
                <div>
                  <div className="text-xs text-gray-500 mb-1">רכיב וחבילה</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{sub.componentName}</div>
                  {sub.packageName && <div className="text-sm text-indigo-600 dark:text-indigo-400">{sub.packageName}</div>}
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">תשלום</div>
                  <div className="font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    ₪{sub.paymentAmount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">תקופת מינוי</div>
                  <div className="text-sm flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {sub.startDate} {sub.endDate ? `עד ${sub.endDate}` : ''}
                  </div>
                </div>
                {sub.subdomain && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">סאב דומיין</div>
                    <div className="text-sm flex items-center gap-1" dir="ltr">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      {sub.subdomain}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-gray-500 mb-1">פרטי מערכת סליקה</div>
                  {sub.status && (
                    <div className="text-xs flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' :
                        sub.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        sub.status === 'past_due' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {sub.status === 'active' ? 'פעיל' : sub.status === 'paused' ? 'מושהה' : sub.status === 'past_due' ? 'פיגור' : 'מבוטל'}
                      </span>
                    </div>
                  )}
                  {sub.billingCycle && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      מחזור: {sub.billingCycle === 'monthly' ? 'חודשי' : sub.billingCycle === 'annually' ? 'שנתי' : 'חד פעמי'}
                    </div>
                  )}
                  {sub.nextBillingDate && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      חיוב הבא: {sub.nextBillingDate}
                    </div>
                  )}
                </div>
              </div>
              
              {isAdmin && editingId !== sub.id && (
                <div className="flex gap-2 items-start justify-end border-t md:border-t-0 md:border-r border-gray-100 dark:border-gray-800 pt-3 md:pt-0 md:pr-4">
                  <button onClick={() => handleEdit(sub)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

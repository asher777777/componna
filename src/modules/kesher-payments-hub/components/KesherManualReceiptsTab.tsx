import React, { useState } from 'react';
import {
  FileText,
  Banknote,
  Receipt,
  Landmark,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { kesherService } from '../services/kesherService';
import { KesherDocumentType } from '../types';
import { Contact } from '../../crm-analytics/types';
import { crmContactSyncService } from '../services/crmContactSyncService';
import { CrmContactAutocomplete } from './CrmContactAutocomplete';

export const KesherManualReceiptsTab: React.FC = () => {
  const settings = kesherService.getSettings();

  const [paymentType, setPaymentType] = useState<'Cash' | 'Check' | 'BankTransfer'>('Cash');
  const [receiptType, setReceiptType] = useState<KesherDocumentType>(
    settings.defaultReceiptType || 405
  );

  const [amount, setAmount] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [tz, setTz] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // CRM Sync State
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSavingCrm, setIsSavingCrm] = useState<boolean>(false);
  const [crmToast, setCrmToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Check specifics
  const [checkNumber, setCheckNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [branchNumber, setBranchNumber] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');

  // Bank transfer specifics
  const [transferRef, setTransferRef] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    receiptNumber?: string;
    docUrl?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle contact selection from CRM autocomplete
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setClientName(contact.conta_name || '');
    setPhone(contact.conta_phone || (contact as any).phone || (contact as any).mobile || '');
    setEmail(contact.email || '');
    const contactTz = String(contact.tg1 || (contact as any).tz || (contact as any).idNumber || (contact as any).id_num || (contact as any).vat || '').trim();
    setTz(contactTz);

    // Auto-fill bank and check details if present on the contact
    if (contact.bank_name || (contact as any).check_bank_name) {
      setBankName(contact.bank_name || (contact as any).check_bank_name || '');
    }
    if (contact.branch_number || (contact as any).check_branch) {
      setBranchNumber(contact.branch_number || (contact as any).check_branch || '');
    }
    if (contact.account_number || (contact as any).check_account) {
      setAccountNumber(contact.account_number || (contact as any).check_account || '');
    }
    if (contact.check_number) {
      setCheckNumber(contact.check_number);
    }

    setCrmToast({
      message: `נטענו פרטי איש הקשר: ${contact.conta_name}`,
      type: 'info'
    });
    setTimeout(() => setCrmToast(null), 3000);
  };

  const handleClearContact = () => {
    setSelectedContact(null);
  };

  // Quick manual save / update to CRM button handler
  const handleSaveToCrm = async () => {
    if (!clientName.trim()) {
      setErrorMessage('נא להזין שם לקוח לפני שמירה ב-CRM');
      return;
    }
    setIsSavingCrm(true);
    try {
      const res = await crmContactSyncService.saveOrUpdateContact({
        id: selectedContact?.id,
        clientName,
        phone,
        email,
        tz,
        bankName,
        branchNumber,
        accountNumber,
        checkNumber,
      });
      setSelectedContact(res.contact);
      setCrmToast({
        message: res.isNew
          ? `איש קשר חדש (${res.contact.conta_name}) נוצר ונשמר ב-CRM!`
          : `פרטי איש הקשר (${res.contact.conta_name}) עודכנו בהצלחה ב-CRM!`,
        type: 'success'
      });
      setTimeout(() => setCrmToast(null), 4000);
    } catch (e: any) {
      setErrorMessage('שגיאה בשמירת נתוני הלקוח ב-CRM');
    } finally {
      setIsSavingCrm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessResult(null);

    if (!amount || Number(amount) <= 0) {
      setErrorMessage('נא להזין סכום תקין.');
      return;
    }

    if (!clientName.trim()) {
      setErrorMessage('נא להזין שם לקוח / תורם.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Auto-save / sync missing or updated details to CRM
      let activeCrmContact: Contact | null = null;
      try {
        const syncRes = await crmContactSyncService.saveOrUpdateContact({
          id: selectedContact?.id,
          clientName,
          phone,
          email,
          tz,
          bankName: bankName || undefined,
          branchNumber: branchNumber || undefined,
          accountNumber: accountNumber || undefined,
          checkNumber: checkNumber || undefined,
        });
        activeCrmContact = syncRes.contact;
        setSelectedContact(syncRes.contact);
      } catch (crmErr) {
        console.warn('CRM sync notice on manual receipt submit:', crmErr);
      }

      const res = await kesherService.sendCashTransaction({
        clientName,
        amount: Number(amount),
        paymentType,
        receiptType: String(receiptType),
        phone,
        email,
        tz,
        date,
        checkNumber: paymentType === 'Check' ? checkNumber : undefined,
        bankName: (paymentType === 'Check' || paymentType === 'BankTransfer') ? bankName : undefined,
        branchNumber: (paymentType === 'Check' || paymentType === 'BankTransfer') ? branchNumber : undefined,
        accountNumber: (paymentType === 'Check' || paymentType === 'BankTransfer') ? accountNumber : undefined,
        transferRef: paymentType === 'BankTransfer' ? transferRef : undefined,
      });

      const receiptNum = res.ReceiptNumber || res.TransactionId || res.Id || `rcpt_${Date.now()}`;
      const docUrl = res.DocUrl || res.Url;

      // 2. Record payment in Contact CRM profile
      if (activeCrmContact?.id) {
        const paymentLabel = paymentType === 'Check'
          ? `צ'ק (מס' ${checkNumber || 'ללא'})`
          : paymentType === 'BankTransfer'
          ? `העברה בנקאית (אסמכתא ${transferRef || 'ללא'})`
          : 'מזומן';

        await crmContactSyncService.recordContactPayment(activeCrmContact.id, {
          id: `pay_${receiptNum}`,
          date: date || new Date().toISOString().slice(0, 10),
          amount: Number(amount),
          paymentType: paymentLabel,
          receiptType: String(receiptType),
          kesherStatus: 'Success',
          receiptLink: docUrl || '',
        });
      }

      setSuccessResult({
        message: 'הקבלה/החשבונית הופקה בהצלחה דרך קשר ואיזי קאונט!',
        receiptNumber: receiptNum,
        docUrl: docUrl
      });

      // Clear main fields
      setAmount('');
      setClientName('');
      setCheckNumber('');
      setTransferRef('');
      setSelectedContact(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'שגיאה בהפקת הקבלה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir="rtl">
      {/* הודעת הצלחה עם קישור ל-PDF */}
      {successResult && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">{successResult.message}</h4>
              {successResult.receiptNumber && (
                <p className="text-xs text-slate-300 mt-0.5">
                  מספר אסמכתא / קבלה: <b>{successResult.receiptNumber}</b>
                </p>
              )}
            </div>
          </div>

          {successResult.docUrl && (
            <a
              href={successResult.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
            >
              <FileText className="w-4 h-4" />
              צפה בקבלה (PDF באיזי קאונט)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* בחירת אמצעי תשלום ידני */}
        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <label className="text-xs font-bold text-slate-300 block">אמצעי תשלום התקבול</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentType('Cash')}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                paymentType === 'Cash'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-600/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Banknote className="w-4 h-4" />
              מזומן (Cash)
            </button>

            <button
              type="button"
              onClick={() => setPaymentType('Check')}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                paymentType === 'Check'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-600/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4" />
              המחאה / צ'ק
            </button>

            <button
              type="button"
              onClick={() => setPaymentType('BankTransfer')}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                paymentType === 'BankTransfer'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-600/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Landmark className="w-4 h-4" />
              העברה בנקאית
            </button>
          </div>
        </div>

        {/* פרטי תקבול ולקוח */}
        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              פרטי התקבול והתורם (מסונכרן עם ה-CRM)
            </h3>

            {/* Quick CRM Save & Status Actions */}
            <div className="flex items-center gap-2">
              {crmToast && (
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 animate-in fade-in ${
                  crmToast.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {crmToast.message}
                </span>
              )}

              {clientName.trim() && (
                <button
                  type="button"
                  onClick={handleSaveToCrm}
                  disabled={isSavingCrm}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="שמור או עדכן את פרטי הלקוח (כולל ת.ז/פרטי בנק/צ'ק) בכרטיס ה-CRM"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSavingCrm ? 'שומר ב-CRM...' : 'שמור שינויים ב-CRM'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                סכום שהתקבל (₪) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                placeholder="0.00"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>שם הלקוח / התורם *</span>
                <span className="text-[10px] text-emerald-400 font-normal">הקלד לחיפוש מהיר ב-CRM</span>
              </label>
              <CrmContactAutocomplete
                value={clientName}
                onChange={setClientName}
                onSelectContact={handleSelectContact}
                selectedContact={selectedContact}
                onClearSelection={handleClearContact}
                placeholder="הקלד שם פרטי / משפחה / טלפון..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                קוד מסמך להפקה באיזי קאונט
              </label>
              <select
                value={receiptType}
                onChange={(e) => setReceiptType(Number(e.target.value) as KesherDocumentType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={405}>405 - קבלה על תרומה (סעיף 46)</option>
                <option value={400}>400 - קבלה כללית</option>
                <option value={320}>320 - חשבונית מס קבלה</option>
                <option value={305}>305 - חשבונית מס</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">תאריך קבלה</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">טלפון נייד</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                placeholder="050-0000000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">אימייל (לשליחת מסמך)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                placeholder="israel@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>ת.ז / ח.פ</span>
                {selectedContact && !selectedContact.tg1 && tz && (
                  <span className="text-[10px] text-amber-400 font-normal animate-pulse">
                    פרט חדש (יישמר ב-CRM)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 font-mono"
                placeholder="123456789"
              />
            </div>
          </div>
        </div>

        {/* פרטים ספציפיים לצ'ק או העברה בנקאית */}
        {paymentType === 'Check' && (
          <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Receipt className="w-4 h-4 text-indigo-400" />
              פרטי המחאה (צ'ק)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">מספר צ'ק *</label>
                <input
                  type="text"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="100254"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">מספר / שם בנק *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="12 (הפועלים)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">מספר סניף *</label>
                <input
                  type="text"
                  value={branchNumber}
                  onChange={(e) => setBranchNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="345"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">מספר חשבון *</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="123456"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {paymentType === 'BankTransfer' && (
          <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Landmark className="w-4 h-4 text-purple-400" />
              פרטי העברה בנקאית
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">מספר אסמכתא *</label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="TRF_987654"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">מספר בנק</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="10 (לאומי)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">סניף</label>
                <input
                  type="text"
                  value={branchNumber}
                  onChange={(e) => setBranchNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">חשבון מעביר</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  placeholder="456789"
                />
              </div>
            </div>
          </div>
        )}

        {/* כפתור הפקת קבלה */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !amount || !clientName}
            className="w-full h-14 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold text-base rounded-2xl shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>מפיק מסמך בשרתי קשר ואיזי קאונט...</span>
              </div>
            ) : (
              <>
                <FileText className="w-5 h-5 text-emerald-200" />
                <span>הפק קבלה / חשבונית ידנית (₪{amount || '0'})</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

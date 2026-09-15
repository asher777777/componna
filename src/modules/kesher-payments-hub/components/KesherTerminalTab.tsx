import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  User,
  Phone,
  Mail,
  Receipt,
  ExternalLink,
  ShieldCheck,
  Zap,
  Repeat,
  Layers,
  Save,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { kesherService } from '../services/kesherService';
import { KesherDocumentType, KesherCreditType } from '../types';
import { Contact } from '../../crm-analytics/types';
import { crmContactSyncService } from '../services/crmContactSyncService';
import { CrmContactAutocomplete } from './CrmContactAutocomplete';

export const KesherTerminalTab: React.FC = () => {
  const settings = kesherService.getSettings();

  const [paymentMode, setPaymentMode] = useState<'credit' | 'bit'>('credit');
  const [dealType, setDealType] = useState<'regular' | 'installments' | 'standing_order' | 'hold_j5'>('regular');

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [tz, setTz] = useState<string>('');

  // CRM Sync State
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSavingCrm, setIsSavingCrm] = useState<boolean>(false);
  const [crmToast, setCrmToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Credit Card Fields
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);

  // Document Type selection (EasyCount)
  const [documentType, setDocumentType] = useState<KesherDocumentType>(
    settings.defaultReceiptType || 405
  );

  // Status State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    transactionId?: string;
    authNumber?: string;
    docUrl?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Card validation check
  const cardValidation = cardNumber.length >= 8 ? kesherService.validateCreditCard(cardNumber) : null;

  // Handle contact selection from CRM autocomplete
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setClientName(contact.conta_name || '');
    setPhone(contact.conta_phone || (contact as any).phone || (contact as any).mobile || '');
    setEmail(contact.email || '');
    const contactTz = String(contact.tg1 || (contact as any).tz || (contact as any).idNumber || (contact as any).id_num || (contact as any).vat || '').trim();
    setTz(contactTz);
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
      setErrorMessage('נא להזין סכום תקין לחיוב');
      return;
    }

    if (!clientName.trim()) {
      setErrorMessage('נא להזין שם לקוח / תורם');
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
        });
        activeCrmContact = syncRes.contact;
        setSelectedContact(syncRes.contact);
      } catch (crmErr) {
        console.warn('CRM sync notice on payment submit:', crmErr);
      }

      if (paymentMode === 'bit') {
        if (!phone) {
          throw new Error('יש להזין מספר טלפון נייד עבור תשלום ב-Bit');
        }
        const res = await kesherService.sendBitTransaction({
          phoneNumber: phone,
          amount: Number(amount),
          clientName: clientName,
          description: `תשלום עבור ${clientName}`,
          documentType: documentType
        });

        const txId = res.BitTransactionId || res.TransactionId || `bit_${Date.now()}`;
        const docUrl = res.DocUrl || res.Url;

        // 2. Record payment in Contact CRM profile
        if (activeCrmContact?.id) {
          await crmContactSyncService.recordContactPayment(activeCrmContact.id, {
            id: `pay_${txId}`,
            date: new Date().toISOString().slice(0, 10),
            amount: Number(amount),
            paymentType: 'Bit',
            receiptType: String(documentType),
            kesherStatus: 'Success',
            receiptLink: docUrl || '',
          });
        }

        setSuccessResult({
          message: 'בקשת התשלום נשלחה בהצלחה לאפליקציית Bit!',
          transactionId: txId,
          docUrl: docUrl
        });
      } else {
        // Credit Card
        if (!cardNumber || !expiry || !cvv) {
          throw new Error('נא להשלים את כל פרטי כרטיס האשראי');
        }

        let creditType: KesherCreditType = 1;
        let paramJ: 'J4' | 'J5' = 'J4';
        let finalInstallments = 1;

        if (dealType === 'installments') {
          creditType = 8;
          finalInstallments = installmentsCount;
        } else if (dealType === 'standing_order') {
          creditType = 10;
          finalInstallments = 9999;
        } else if (dealType === 'hold_j5') {
          paramJ = 'J5';
        }

        const res = await kesherService.sendTransaction({
          cardNumber,
          expiry,
          cvv,
          amount: Number(amount),
          creditType,
          installments: finalInstallments,
          paramJ,
          clientName,
          phone,
          email,
          tz,
          documentType,
          comment: `סליקה מלוח בקרה - ${clientName}`
        });

        const txId = res.TransactionId || res.Id || `tx_${Date.now()}`;
        const authNum = res.AuthNumber || res.ApprovalNumber;
        const docUrl = res.DocUrl || res.Url;

        // 2. Record payment in Contact CRM profile
        if (activeCrmContact?.id) {
          await crmContactSyncService.recordContactPayment(activeCrmContact.id, {
            id: `pay_${txId}`,
            date: new Date().toISOString().slice(0, 10),
            amount: Number(amount),
            paymentType: dealType === 'standing_order' ? 'הו"ק אשראי' : 'אשראי (קשר)',
            receiptType: String(documentType),
            kesherStatus: 'Success',
            receiptLink: docUrl || '',
          });
        }

        setSuccessResult({
          message: dealType === 'hold_j5' ? 'מסגרת האשראי נתפסה בהצלחה (J5)!' : 'עסקת האשראי אושרה וחויבה בהצלחה!',
          transactionId: txId,
          authNumber: authNum,
          docUrl: docUrl
        });

        // Reset Sensitive Card Fields
        setCardNumber('');
        setExpiry('');
        setCvv('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'שגיאה בביצוע העסקה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir="rtl">
      {/* תצוגת הצלחה / כישלון */}
      {successResult && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">{successResult.message}</h4>
              <div className="flex flex-wrap gap-4 text-xs text-slate-300 mt-1">
                {successResult.transactionId && <span>מספר עסקה: <b>{successResult.transactionId}</b></span>}
                {successResult.authNumber && <span>מספר אישור: <b>{successResult.authNumber}</b></span>}
              </div>
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
              צפה בקבלה / חשבונית (PDF)
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
        {/* בחירת אמצעי תשלום וסוג עסקה */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">ערוץ תשלום</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('credit')}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  paymentMode === 'credit'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                כרטיס אשראי
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('bit')}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  paymentMode === 'bit'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-600/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                אפליקציית Bit
              </button>
            </div>
          </div>

          {paymentMode === 'credit' && (
            <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">סוג עסקת אשראי</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setDealType('regular')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    dealType === 'regular'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" /> רגיל (J4)
                </button>

                <button
                  type="button"
                  onClick={() => setDealType('installments')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    dealType === 'installments'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> תשלומים
                </button>

                <button
                  type="button"
                  onClick={() => setDealType('standing_order')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    dealType === 'standing_order'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" /> הו"ק אשראי
                </button>

                <button
                  type="button"
                  onClick={() => setDealType('hold_j5')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    dealType === 'hold_j5'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> תפיסה (J5)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* פרטי סכום, לקוח ומסמך */}
        <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              פרטי חיוב ולקוח (מסונכרן עם ה-CRM)
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
                  title="שמור או עדכן את פרטי הלקוח (כולל ת.ז/טלפון/אימייל) בכרטיס ה-CRM"
                >
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isSavingCrm ? 'שומר ב-CRM...' : 'שמור שינויים ב-CRM'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                סכום לחיוב (₪) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                placeholder="0.00"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>שם לקוח / תורם מלא *</span>
                <span className="text-[10px] text-indigo-400 font-normal">הקלד לחיפוש מהיר ב-CRM</span>
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
                סוג מסמך להפקה באיזי קאונט (Document Type)
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(Number(e.target.value) as KesherDocumentType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={405}>405 - קבלה על תרומה (סעיף 46)</option>
                <option value={400}>400 - קבלה רגילה</option>
                <option value={320}>320 - חשבונית מס קבלה</option>
                <option value={305}>305 - חשבונית מס</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">טלפון נייד</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                placeholder="050-1234567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">דואר אלקטרוני (לשליחת קבלה)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                placeholder="client@example.com"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 font-mono"
                placeholder="012345678"
              />
            </div>
          </div>
        </div>

        {/* פרטי אשראי */}
        {paymentMode === 'credit' && (
          <div className="bg-[#141824]/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                פרטי כרטיס אשראי
              </h3>

              {cardValidation && cardValidation.brand !== 'Unknown' && (
                <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold">
                  {cardValidation.brand} {cardValidation.isValid ? '✓ תקין' : ''}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  מספר כרטיס אשראי *
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  placeholder="4580 0000 0000 0000"
                  maxLength={19}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  תוקף (MM/YY) *
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-center focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  placeholder="12/26"
                  maxLength={5}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  CVV (3 ספרות בגב) *
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-center focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  placeholder="•••"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            {dealType === 'installments' && (
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-4">
                <label className="text-xs font-semibold text-slate-300">מספר תשלומים:</label>
                <select
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24, 36].map((n) => (
                    <option key={n} value={n}>
                      {n} תשלומים {amount ? `(₪${(Number(amount) / n).toFixed(2)} לחודש)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* כפתור אישור סליקה */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !amount || !clientName}
            className="w-full h-14 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>מבצע סליקה ומפיק מסמך דרך קשר...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-indigo-200" />
                <span>
                  {paymentMode === 'bit'
                    ? `שלח בקשת תשלום ב-Bit על סך ₪${amount || '0'}`
                    : `בצע חיוב עכשיו על סך ₪${amount || '0'}`}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

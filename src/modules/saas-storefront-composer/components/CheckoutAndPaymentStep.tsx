import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, 
  Lock, Sparkles, Building, Mail, Phone, User, ShoppingBag, ExternalLink
} from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';
import { kesherService } from '../../kesher-payments-hub/services/kesherService';
import { crmContactSyncService } from '../../kesher-payments-hub/services/crmContactSyncService';
import { eventBus } from '../../../core/bridge/EventBus';
import { LeadPayload } from '../../../core/contracts';

export const CheckoutAndPaymentStep: React.FC = () => {
  const { 
    cart, 
    customerInfo, 
    setCustomerInfo, 
    totalMonthly, 
    totalAnnualSavings, 
    billingPlan, 
    settings, 
    setViewMode 
  } = useStorefront();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bit'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerInfo.fullName || '');
  const [bitPhone, setBitPhone] = useState(customerInfo.phone || '');
  const [idNumber, setIdNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successPaymentData, setSuccessPaymentData] = useState<{
    authNumber: string;
    receiptUrl?: string;
    transactionId: string;
  } | null>(null);

  const isKesherConfigured = kesherService.isConfigured();

  const handleAutoFillDemo = () => {
    setCustomerInfo({
      fullName: 'ישראל ישראלי (דמו)',
      email: 'demo@glowmanage.com',
      phone: '050-1234567',
      businessName: 'סוכנות דפי נחיתה פרו',
    });
    setCardNumber('4580 1234 5678 9012');
    setCardExp('12/28');
    setCardCvv('777');
    setCardHolder('ישראל ישראלי');
    setBitPhone('050-1234567');
    setIdNumber('012345678');
  };

  const handleInstantDemoBypass = async () => {
    handleAutoFillDemo();
    setIsProcessingPayment(true);
    setErrorMsg('');

    try {
      const demoClientName = 'ישראל ישראלי (דמו)';
      const demoEmail = 'demo@glowmanage.com';
      const demoPhone = '050-1234567';
      const demoBusiness = 'סוכנות דפי נחיתה פרו';
      const mockTrxId = `TRX-DEMO-${Date.now().toString(36).toUpperCase()}`;
      const mockAuth = `AP-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Sync Contact into Admin CRM
      const { contact } = await crmContactSyncService.saveOrUpdateContact({
        clientName: demoClientName,
        phone: demoPhone,
        email: demoEmail,
        tz: '012345678',
      });

      // 2. Record Payment in CRM
      if (contact?.id) {
        await crmContactSyncService.recordContactPayment(contact.id, {
          id: mockTrxId,
          date: new Date().toISOString(),
          amount: totalMonthly,
          paymentType: 'כרטיס אשראי (דמו)',
          receiptType: '320 - חשבונית מס קבלה',
          kesherStatus: 'Approved',
          receiptLink: 'https://kesherhk.info/demo-receipt',
        });
      }

      // 3. Emit EventBus to CRM Analytics
      const leadPayload: LeadPayload = {
        conta_name: demoClientName,
        conta_phone: demoPhone,
        email: demoEmail,
        source: 'רכישה ישירה בקופה (Kesher Demo)',
        tags: [
          'לקוח משלם 💳',
          'קשר סליקה',
          billingPlan === 'annual' ? 'מנוי שנתי' : 'מנוי חודשי',
          ...cart.map(c => `רכיב: ${c.name}`),
        ],
        community: 'דיירי מערכת SaaS',
        metadata: {
          businessName: demoBusiness,
          billingPlan,
          monthlyTotal: totalMonthly,
          annualTotal: billingPlan === 'annual' ? totalMonthly * 12 : totalMonthly,
          transactionId: mockTrxId,
          authNumber: mockAuth,
          paymentMethod: 'CreditCard (Demo)',
        },
      };
      eventBus.publish('crm:lead:created', leadPayload);

      setIsProcessingPayment(false);
      setViewMode('subdomain_picker');
    } catch (e: any) {
      console.warn('[Checkout] Demo bypass notice:', e);
      setIsProcessingPayment(false);
      setViewMode('subdomain_picker');
    }
  };

  const handleProcessPaymentAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.fullName.trim() || !customerInfo.email.trim() || !customerInfo.businessName.trim()) {
      setErrorMsg('נא למלא את כל שדות החובה המסומנים בכוכבית (*)');
      return;
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (!cleanCard || cleanCard.length < 8) {
        setErrorMsg('נא להזין מספר כרטיס אשראי תקין');
        return;
      }
      if (!cardExp.trim() || cardExp.replace(/\D/g, '').length < 4) {
        setErrorMsg('נא להזין תוקף כרטיס תקין (MM/YY)');
        return;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        setErrorMsg('נא להזין קוד CVV בגב הכרטיס');
        return;
      }
    } else if (paymentMethod === 'bit') {
      const targetBitPhone = bitPhone.trim() || customerInfo.phone.trim();
      if (!targetBitPhone || targetBitPhone.length < 9) {
        setErrorMsg('נא להזין מספר טלפון תקין לקבלת בקשת התשלום ב-Bit');
        return;
      }
    }

    setErrorMsg('');
    setIsProcessingPayment(true);

    try {
      let trxResult: any = null;
      let usedMethodLabel = '';
      const orderAmount = totalMonthly;
      const isAnnual = billingPlan === 'annual';
      const orderDescription = `רכישת חבילת רכיבים (${isAnnual ? 'מנוי שנתי' : 'מנוי חודשי'} - ${cart.length} רכיבים) עבור ${customerInfo.businessName}`;

      if (isKesherConfigured) {
        if (paymentMethod === 'card') {
          trxResult = await kesherService.sendTransaction({
            cardNumber: cardNumber.replace(/\s+/g, ''),
            expiry: cardExp,
            cvv: cardCvv,
            amount: orderAmount,
            clientName: customerInfo.fullName,
            phone: customerInfo.phone,
            email: customerInfo.email,
            tz: idNumber,
            comment: orderDescription,
            documentType: 320, // חשבונית מס קבלה
          });
          usedMethodLabel = 'כרטיס אשראי';
        } else {
          trxResult = await kesherService.sendBitTransaction({
            phoneNumber: bitPhone.trim() || customerInfo.phone.trim(),
            amount: orderAmount,
            clientName: customerInfo.fullName,
            description: orderDescription,
            documentType: 320,
          });
          usedMethodLabel = 'Bit';
        }
      } else {
        // Fallback simulated payment authorization for Sandbox / Unconfigured mode
        const mockAuth = `AP-${Math.floor(100000 + Math.random() * 900000)}`;
        trxResult = {
          Status: true,
          TransactionId: `trx_kesher_${Date.now()}`,
          ApprovalNumber: mockAuth,
          AuthNumber: mockAuth,
          DocUrl: `https://app.ezcount.co.il/doc-preview/${Math.floor(10000 + Math.random() * 90000)}`,
          Message: 'אושר בהצלחה (Sandbox Verified)',
        };
        usedMethodLabel = paymentMethod === 'bit' ? 'Bit (Sandbox)' : 'כרטיס אשראי (Sandbox)';
      }

      const transactionId = trxResult.TransactionId || trxResult.Id || `trx_${Date.now()}`;
      const approvalCode = trxResult.ApprovalNumber || trxResult.AuthNumber || 'OK-9921';
      const receiptDocUrl = trxResult.DocUrl || trxResult.Url || '';

      // 1. Sync Contact into CRM (Firestore 'contacts' collection + local cache)
      const { contact } = await crmContactSyncService.saveOrUpdateContact({
        clientName: customerInfo.fullName,
        phone: customerInfo.phone,
        email: customerInfo.email,
        tz: idNumber,
      });

      // 2. Attach comprehensive Payment Record to Contact history
      if (contact?.id) {
        await crmContactSyncService.recordContactPayment(contact.id, {
          id: transactionId,
          date: new Date().toISOString(),
          amount: orderAmount,
          paymentType: usedMethodLabel,
          receiptType: '320 - חשבונית מס קבלה',
          kesherStatus: 'Approved',
          receiptLink: receiptDocUrl,
        });

        // Enrich attributes
        await crmContactSyncService.saveOrUpdateContact({
          id: contact.id,
          clientName: customerInfo.fullName,
          phone: customerInfo.phone,
          email: customerInfo.email,
          tz: idNumber,
          bankName: customerInfo.businessName, // store business name
        });
      }

      // 3. Emit Decoupled EventBus to update CRM Analytics and real-time dashboard
      const leadPayload: LeadPayload = {
        conta_name: customerInfo.fullName || customerInfo.businessName,
        conta_phone: customerInfo.phone || '050-0000000',
        email: customerInfo.email,
        source: 'רכישה ישירה - קשר סליקה (Kesher Checkout)',
        tags: [
          'לקוח משלם 💳',
          'קשר סליקה',
          isAnnual ? 'מנוי שנתי (20% הנחה)' : 'מנוי חודשי',
          ...cart.map(c => `רכיב: ${c.name}`),
        ],
        community: 'דיירי מערכת SaaS',
        metadata: {
          businessName: customerInfo.businessName,
          billingPlan,
          monthlyTotal: orderAmount,
          annualTotal: isAnnual ? orderAmount * 12 : orderAmount,
          transactionId,
          authNumber: approvalCode,
          receiptUrl: receiptDocUrl,
          paymentMethod: usedMethodLabel,
          activeModules: cart.map(c => c.moduleId),
        },
      };
      eventBus.publish('crm:lead:created', leadPayload);
      eventBus.publish('crm:contact:updated', {
        id: contact?.id || transactionId,
        conta_name: customerInfo.fullName,
        total_spent: orderAmount,
        last_order_date: new Date().toISOString().slice(0, 10),
      });

      setSuccessPaymentData({
        authNumber: approvalCode,
        receiptUrl: receiptDocUrl,
        transactionId,
      });

      // Move directly to Subdomain Picker Step
      setTimeout(() => {
        setIsProcessingPayment(false);
        setViewMode('subdomain_picker');
      }, 500);

    } catch (err: any) {
      console.error('[CheckoutAndPaymentStep] Payment failed:', err);
      setErrorMsg(err.message || 'שגיאה בביצוע התשלום מול קשר. אנא בדוק את הפרטים ונסה שוב.');
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      
      {/* Test / Sandbox Notice Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200">
              {isKesherConfigured ? 'מסוף קשר מחובר ופעיל (Kesher Hub):' : 'קופת סליקה מאובטחת בסביבת בדיקות (Sandbox):'}
            </span>
            <span className="text-gray-600 dark:text-gray-300 mr-1">
              {isKesherConfigured 
                ? 'התשלום יסלוק ישירות בחשבון קשר שלך ויעדכן אוטומטית את אנליטיקת ה-CRM.'
                : 'מצב בדיקה מופעל – התשלום יאושר מיידית ויסונכרן למערכת האנליטיקה ו-CRM של המנהל.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-800 dark:text-gray-200 font-bold rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm transition"
          >
            🪄 מילוי נתוני בדיקה
          </button>
          <button
            type="button"
            onClick={handleInstantDemoBypass}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md transition"
          >
            ⚡ תשלום דמו מיידי
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setViewMode('catalog')}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לחנות הרכיבים</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>קופה מאובטחת בהצפנת SSL וסליקת קשר API</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Checkout & Payment Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <form onSubmit={handleProcessPaymentAndProceed} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            
            {/* 1. Customer & Business Details */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <User className="w-4 h-4 text-indigo-600" />
                <span>1. פרטי הלקוח והעסק לחשבונית</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">שם מלא *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.fullName}
                    onChange={e => {
                      setCustomerInfo({ ...customerInfo, fullName: e.target.value });
                      setCardHolder(e.target.value);
                    }}
                    placeholder="ישראל ישראלי"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">שם העסק / החברה *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.businessName}
                    onChange={e => setCustomerInfo({ ...customerInfo, businessName: e.target.value })}
                    placeholder="שם החברה או העסק"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">כתובת אימייל (לחשבונית) *</label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="you@company.com"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">טלפון / נייד *</label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={e => {
                      setCustomerInfo({ ...customerInfo, phone: e.target.value });
                      if (!bitPhone) setBitPhone(e.target.value);
                    }}
                    placeholder="050-1234567"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">ת.ז. / ח.פ. / ע.מ. (לחשבונית מס)</label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value)}
                    placeholder="מספר תעודת זהות או חברה"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>2. תשלום וסליקה (קשר מסוף מאובטח)</span>
              </h2>

              {/* Payment selector */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>כרטיס אשראי</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bit')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition ${
                    paymentMethod === 'bit'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-black text-indigo-600 text-sm">bit</span>
                  <span>תשלום ב-Bit</span>
                </button>
              </div>

              {/* Card Inputs */}
              {paymentMethod === 'card' ? (
                <div className="space-y-3 text-xs bg-gray-50/50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">שם בעל הכרטיס</label>
                    <input
                      type="text"
                      placeholder="ישראל ישראלי"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">מספר כרטיס אשראי *</label>
                    <input
                      type="text"
                      required
                      placeholder="4580 •••• •••• 1234"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 font-mono text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">תוקף (MM/YY) *</label>
                      <input
                        type="text"
                        required
                        placeholder="12/28"
                        value={cardExp}
                        onChange={e => setCardExp(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 font-mono text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1">CVV (3 ספרות) *</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 font-mono text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl space-y-3 text-xs">
                  <div className="text-center">
                    <p className="font-bold text-indigo-900 dark:text-indigo-200">תשלום מאובטח באמצעות אפליקציית Bit</p>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px]">בקשת תשלום תישלח ישירות למספר הטלפון של הלקוח</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">מספר טלפון ל-Bit *</label>
                    <input
                      type="tel"
                      value={bitPhone || customerInfo.phone}
                      onChange={e => setBitPhone(e.target.value)}
                      placeholder="050-1234567"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-800">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessingPayment}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition transform active:scale-98 disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <span>מעבד תשלום ומסנכרן ל-CRM...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>אשר תשלום של {totalMonthly} {settings.currencySymbol} ועבור לבחירת סאב-דומיין</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-lg space-y-5">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>סיכום הזמנה ({cart.length} רכיבים)</span>
            </h3>

            {/* List of chosen modules */}
            <div className="space-y-2.5 divide-y divide-gray-100 dark:divide-gray-800 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.moduleId} className="pt-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {billingPlan === 'annual' ? item.annualMonthlyPrice : item.monthlyPrice} {settings.currencySymbol} / חודש
                  </span>
                </div>
              ))}
            </div>

            {/* Billing Summary Box */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl space-y-2 text-xs border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>מסלול חיוב:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {billingPlan === 'annual' ? 'שנתי בהנחה (20%)' : 'חודשי ללא התחייבות'}
                </span>
              </div>

              {billingPlan === 'annual' && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>חיסכון שנתי כולל:</span>
                  <span>{totalAnnualSavings} {settings.currencySymbol}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                <span className="font-bold text-sm text-gray-900 dark:text-white">סך הכל לתשלום:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {totalMonthly} {settings.currencySymbol}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-normal">לחודש</span>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>הסאב-דומיין יופק מיידית עם סיום ההזמנה ללא כל דמי הקמה נוספים</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

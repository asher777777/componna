import { useState, useMemo } from 'react';
import { useKesherPaymentsContext } from '../context/KesherPaymentsContext';
import { KesherDocumentType, KesherCreditType, KesherApiResponse } from '../types';
import { CrmContactSummary } from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';

export const usePaymentTerminal = () => {
  const { 
    settings, 
    processCreditCardPayment, 
    processBitPayment, 
    saveContact, 
    searchContacts 
  } = useKesherPaymentsContext();

  const [paymentMode, setPaymentMode] = useState<'credit' | 'bit'>('credit');
  const [dealType, setDealType] = useState<'regular' | 'installments' | 'standing_order' | 'hold_j5'>('regular');

  // Form Fields
  const [amount, setAmount] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [tz, setTz] = useState<string>('');

  // Credit Card Specifics
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);

  // Document Type
  const [documentType, setDocumentType] = useState<KesherDocumentType>(
    settings.defaultReceiptType || 405
  );

  // CRM Contact
  const [selectedContact, setSelectedContact] = useState<CrmContactSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successResult, setSuccessResult] = useState<{
    message: string;
    transactionId?: string;
    authNumber?: string;
    docUrl?: string;
  } | null>(null);

  // VAT calculations (Assuming standard 18% or 17% in Israel, default 18%)
  const vatRate = 0.18;
  const numAmount = Number(amount) || 0;
  const calculatedVat = useMemo(() => {
    return Math.round((numAmount - (numAmount / (1 + vatRate))) * 100) / 100;
  }, [numAmount]);

  const beforeVatAmount = useMemo(() => {
    return Math.round((numAmount / (1 + vatRate)) * 100) / 100;
  }, [numAmount]);

  const installmentAmount = useMemo(() => {
    if (dealType !== 'installments' || installmentsCount <= 1 || numAmount <= 0) return 0;
    return Math.round((numAmount / installmentsCount) * 100) / 100;
  }, [dealType, installmentsCount, numAmount]);

  const selectContact = (c: CrmContactSummary) => {
    setSelectedContact(c);
    setClientName(c.conta_name || '');
    setPhone(c.conta_phone || (c as any).phone || (c as any).mobile || '');
    setEmail(c.email || '');
    setTz(c.tg1 || (c as any).tz || (c as any).idNumber || '');
  };

  const clearContact = () => {
    setSelectedContact(null);
  };

  const submitPayment = async (): Promise<KesherApiResponse | null> => {
    setErrorMessage('');
    setSuccessResult(null);

    if (!amount || numAmount <= 0) {
      setErrorMessage('נא להזין סכום תקין לחיוב');
      return null;
    }

    if (!clientName.trim()) {
      setErrorMessage('נא להזין שם לקוח / תורם');
      return null;
    }

    setIsLoading(true);

    try {
      // 1. Sync Contact
      let activeContact: CrmContactSummary | null = null;
      try {
        const syncRes = await saveContact({
          id: selectedContact?.id,
          clientName,
          phone,
          email,
          tz,
        });
        activeContact = syncRes.contact;
        setSelectedContact(syncRes.contact);
      } catch (err) {
        console.warn('Contact sync notice:', err);
      }

      if (paymentMode === 'bit') {
        if (!phone) {
          throw new Error('יש להזין מספר טלפון נייד עבור תשלום ב-Bit');
        }

        const res = await processBitPayment({
          phoneNumber: phone,
          amount: numAmount,
          clientName,
          description: `תשלום עבור ${clientName}`,
          documentType,
        });

        const txId = res.BitTransactionId || res.TransactionId || `bit_${Date.now()}`;
        const docUrl = res.DocUrl || res.Url;

        // Publish to EventBus
        try {
          eventBus.publish('payment:completed', {
            transactionId: txId,
            amount: numAmount,
            clientName,
            phone,
            email,
            tz,
            paymentMethod: 'Bit',
            documentType,
            receiptUrl: docUrl,
            timestamp: new Date().toISOString(),
          });
        } catch (ebErr) {
          console.warn('[EventBus] Payment completed event notice:', ebErr);
        }

        setSuccessResult({
          message: 'בקשת התשלום נשלחה בהצלחה לאפליקציית Bit!',
          transactionId: txId,
          docUrl,
        });

        return res;
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

        const res = await processCreditCardPayment({
          cardNumber,
          expiry,
          cvv,
          amount: numAmount,
          creditType,
          installments: finalInstallments,
          paramJ,
          clientName,
          phone,
          email,
          tz,
          documentType,
          comment: `סליקה מלוח בקרה - ${clientName}`,
        });

        const txId = res.TransactionId || res.Id || `tx_${Date.now()}`;
        const authNum = res.AuthNumber || res.ApprovalNumber;
        const docUrl = res.DocUrl || res.Url;

        // Publish to EventBus
        try {
          eventBus.publish('payment:completed', {
            transactionId: txId,
            amount: numAmount,
            clientName,
            phone,
            email,
            tz,
            paymentMethod: dealType === 'standing_order' ? 'StandingOrder' : 'CreditCard',
            documentType,
            receiptUrl: docUrl,
            timestamp: new Date().toISOString(),
          });
        } catch (ebErr) {
          console.warn('[EventBus] Payment completed event notice:', ebErr);
        }

        setSuccessResult({
          message: dealType === 'hold_j5' ? 'מסגרת האשראי נתפסה בהצלחה (J5)!' : 'עסקת האשראי אושרה וחויבה בהצלחה!',
          transactionId: txId,
          authNumber: authNum,
          docUrl,
        });

        // Reset Sensitive Card Fields
        setCardNumber('');
        setExpiry('');
        setCvv('');

        return res;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'שגיאה בעת ביצוע התשלום');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    paymentMode,
    setPaymentMode,
    dealType,
    setDealType,
    amount,
    setAmount,
    clientName,
    setClientName,
    phone,
    setPhone,
    email,
    setEmail,
    tz,
    setTz,
    cardNumber,
    setCardNumber,
    expiry,
    setExpiry,
    cvv,
    setCvv,
    installmentsCount,
    setInstallmentsCount,
    documentType,
    setDocumentType,
    selectedContact,
    selectContact,
    clearContact,
    isLoading,
    errorMessage,
    setErrorMessage,
    successResult,
    setSuccessResult,
    calculatedVat,
    beforeVatAmount,
    installmentAmount,
    submitPayment,
    searchContacts,
  };
};

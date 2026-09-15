import {
  KesherSettings,
  CreditCardTransactionRequest,
  CashTransactionRequest,
  BitPaymentRequest,
  StandingOrderRequest,
  UpdateStandingOrderRequest,
  KesherApiResponse,
  KesherTransactionItem,
  KesherSyncResult,
  KesherDocumentType
} from '../types';

const SETTINGS_STORAGE_KEY = 'comona_kesher_settings';
const TRANSACTIONS_STORAGE_KEY = 'comona_kesher_local_transactions';

export class KesherService {
  private settings: KesherSettings;

  constructor(initialSettings?: Partial<KesherSettings>) {
    this.settings = {
      userName: '',
      apiKey: '',
      paymentPageId: '',
      ezCountToken: '',
      baseUrl: 'https://kesherhk.info',
      isDemo: false,
      defaultReceiptType: 400, // 400 = קבלה (רגילה), 405 = תרומה (סעיף 46), 320 = חשבונית מס קבלה
      autoSyncToCrm: true,
      ...initialSettings,
    };
    this.loadSettings();
  }

  public getSettings(): KesherSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: Partial<KesherSettings>): KesherSettings {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save Kesher settings to localStorage', e);
    }
    return { ...this.settings };
  }

  public loadSettings(): KesherSettings {
    try {
      // First check central system API keys storage
      const systemKeys = localStorage.getItem('comona_system_apikeys_config');
      if (systemKeys) {
        const parsed = JSON.parse(systemKeys);
        if (parsed.kesherUserName || parsed.kesherApiKey || parsed.kesherEzCountToken) {
          this.settings = {
            ...this.settings,
            userName: parsed.kesherUserName || this.settings.userName,
            apiKey: parsed.kesherApiKey || this.settings.apiKey,
            paymentPageId: parsed.kesherPaymentPageId || this.settings.paymentPageId,
            ezCountToken: parsed.kesherEzCountToken || this.settings.ezCountToken,
            defaultReceiptType: parsed.kesherDefaultReceiptType || this.settings.defaultReceiptType || 405,
          };
        }
      }

      // Also check direct settings storage
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load Kesher settings from localStorage', e);
    }
    return { ...this.settings };
  }

  public isConfigured(): boolean {
    return !!(this.settings.userName && this.settings.apiKey);
  }

  public isEasyCountConnected(): boolean {
    return !!(this.settings.ezCountToken);
  }

  /**
   * ביצוע קריאה מאובטחת לשרת קשר עם תמיכת Proxy ו-Timeout נגד תקיעות
   */
  public async postToConnect(payload: any, timeoutMs: number = 4500): Promise<any> {
    const urlsToTry = [
      '/ConnectToKesher/ConnectToKesher',
      'https://kesherhk.info/ConnectToKesher/ConnectToKesher',
      'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://kesherhk.info/ConnectToKesher/ConnectToKesher'),
      'https://corsproxy.io/?url=' + encodeURIComponent('https://kesherhk.info/ConnectToKesher/ConnectToKesher')
    ];

    let lastError: any = null;

    for (const url of urlsToTry) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (!res.ok && res.status !== 200) {
          continue;
        }

        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;
      }
    }

    throw new Error(lastError?.message || 'שגיאת תקשורת מול שרת קשר');
  }

  /**
   * ביצוע קריאת GET לממשק KesherAPI עם תמיכת Proxy ו-Timeout
   */
  public async getFromKesherApi(apiPath: string, queryParams: Record<string, string>, timeoutMs: number = 4500): Promise<any> {
    const searchParams = new URLSearchParams(queryParams).toString();
    const urlsToTry = [
      `/KesherAPI/${apiPath}?${searchParams}`,
      `https://kesherhk.info/KesherAPI/${apiPath}?${searchParams}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kesherhk.info/KesherAPI/${apiPath}?${searchParams}`)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(`https://kesherhk.info/KesherAPI/${apiPath}?${searchParams}`)}`
    ];

    let lastError: any = null;

    for (const url of urlsToTry) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(url, { method: 'GET', signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok && res.status !== 200) continue;
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return { Message: text };
        }
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;
      }
    }

    throw new Error(lastError?.message || 'שגיאת תקשורת מול שרת קשר (API)');
  }



  /**
   * חיבור איזי קאונט דרך קשר (ConnectToEZCountService)
   */
  public async connectToEZCount(tokenOverride?: string, credentials?: { userName?: string; apiKey?: string }): Promise<{ success: boolean; message: string }> {
    const token = tokenOverride || this.settings.ezCountToken;
    if (!token) {
      return { success: false, message: 'נא להזין טוקן של איזיקאונט (EasyCount Token)' };
    }

    if (!this.isConfigured()) {
      return { success: false, message: 'נא להגדיר תחילה שם משתמש וסיסמה של קשר' };
    }

    try {
      const result = await this.getFromKesherApi('ConnectToEZCountService', {
        userName: credentials?.userName || this.settings.userName,
        password: credentials?.apiKey || this.settings.apiKey,
        token,
      });

      if (result && (result.Succeeded === false || result.Status === false)) {
        return { success: false, message: result.Message || result.Description || 'שגיאה בחיבור איזי קאונט דרך קשר' };
      }

      // שמירה בהגדרות מקומיות
      this.saveSettings({ ezCountToken: token });

      return { success: true, message: result.Message || 'איזי קאונט חובר בהצלחה למערכת קשר!' };
    } catch (err: any) {
      return { success: false, message: 'שגיאה בחיבור איזי קאונט: ' + (err.message || err) };
    }
  }

  /**
   * סליקת כרטיס אשראי רגילה / תשלומים / הוראת קבע אשראי + הפקת קבלה/חשבונית (SendTransaction)
   */
  public async sendTransaction(req: CreditCardTransactionRequest): Promise<KesherApiResponse> {
    if (!this.isConfigured()) {
      throw new Error('לא הוגדרו שם משתמש וסיסמה למערכת קשר');
    }

    let numPayments = 1;
    let creditType = req.creditType || 1;

    if (creditType === 10 || req.installments === 9999) {
      // הוראת קבע
      numPayments = (req.installments && req.installments > 0) ? req.installments : 9999;
      creditType = 10;
    } else if (req.installments && req.installments > 1) {
      // עסקת תשלומים
      numPayments = req.installments - 1;
      creditType = 8;
    }

    let finalExpiry = req.expiry.replace(/\D/g, '');
    if (finalExpiry.length === 4) {
      const p1 = finalExpiry.substring(0, 2);
      const p2 = finalExpiry.substring(2, 4);
      // אם בפורמט MMYY, נהפוך ל-YYMM
      if (parseInt(p1, 10) <= 12 && parseInt(p2, 10) > 12) {
        finalExpiry = p2 + p1;
      }
    }

    const payload = {
      Json: {
        userName: this.settings.userName,
        password: this.settings.apiKey,
        func: 'SendTransaction',
        format: 'json',
        tran: {
          Address: '',
          City: '',
          CreditNum: req.cardNumber.replace(/\s+/g, ''),
          Token: null,
          Expiry: finalExpiry, // YYMM
          Cvv2: req.cvv,
          Total: Math.round(Number(req.amount) * 100), // באגורות
          Currency: 1, // ILS
          CreditType: creditType,
          NumPayment: numPayments,
          Phone: req.phone || '',
          ParamJ: req.paramJ || 'J4',
          TransactionType: 'debit',
          Comment1: req.comment || req.transactionId || 'חיוב מובנה',
          FirstName: req.clientName ? req.clientName.trim().split(' ')[0] : '',
          LastName: req.clientName && req.clientName.trim().includes(' ')
            ? req.clientName.trim().split(' ').slice(1).join(' ')
            : 'ללא שם',
          ProjectNumber: req.projectNumber || this.settings.paymentPageId || '',
          Mail: req.email || '',
          DocumentType: Number(req.documentType || this.settings.defaultReceiptType || 320),
          Id: req.tz || ''
        }
      },
      format: 'json'
    };

    const result = await this.postToConnect(payload);

    if (result.Status === false || result.status === 'error' || result.error) {
      throw new Error(result.Description || result.error || result.Message || 'שגיאה בסליקה מול קשר');
    }

    // שמירה ביומן תקבולים מקומי
    this.recordLocalTransaction({
      id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      transactionId: result.TransactionId || result.Id || '',
      date: new Date().toISOString(),
      amount: Number(req.amount),
      clientName: req.clientName,
      phone: req.phone,
      email: req.email,
      tz: req.tz,
      paymentMethod: creditType === 10 ? 'CreditCard' : 'CreditCard',
      documentType: req.documentType || this.settings.defaultReceiptType || 320,
      status: 'Approved',
      receiptUrl: result.DocUrl || result.Url || '',
      authNumber: result.AuthNumber || result.ApprovalNumber || '',
      last4: req.cardNumber.slice(-4),
      raw: result
    });

    return result;
  }

  /**
   * הפקת קבלה / מסמך ידני למזומן, צ'ק, והעברה בנקאית (SendCashTransaction)
   */
  public async sendCashTransaction(req: CashTransactionRequest): Promise<KesherApiResponse> {
    if (!this.isConfigured()) {
      throw new Error('לא הוגדרו שם משתמש וסיסמה למערכת קשר');
    }

    const payload = {
      Json: {
        userName: this.settings.userName,
        password: this.settings.apiKey,
        func: 'SendCashTransaction',
        format: 'json',
        cashTran: {
          Bank: req.bankName || '',
          Phone: req.phone || '',
          Total: Math.round(Number(req.amount) * 100), // באגורות
          Branch: req.branchNumber || '',
          Account: req.accountNumber || '',
          Currency: 1, // ILS
          LastName: req.clientName.trim().split(' ').slice(1).join(' ') || '',
          FirstName: req.clientName.trim().split(' ')[0] || '',
          CheckNumber: req.checkNumber || null,
          ProjectNumber: String(req.receiptType || this.settings.defaultReceiptType || '405'),
          TransactionType: 'debit',
          ChargeOptionType: req.paymentType // Cash / Check / BankTransfer
        }
      },
      format: 'json'
    };

    const result = await this.postToConnect(payload);

    if (result.Status === false || result.status === 'error' || result.error) {
      throw new Error(result.Description || result.error || result.Message || 'שגיאה בהפקת קבלה ידנית בקשר');
    }

    // שמירה ביומן תקבולים מקומי
    this.recordLocalTransaction({
      id: `cash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      transactionId: result.TransactionId || result.ReceiptNumber || '',
      date: req.date || new Date().toISOString(),
      amount: Number(req.amount),
      clientName: req.clientName,
      phone: req.phone,
      email: req.email,
      tz: req.tz,
      paymentMethod: req.paymentType,
      documentType: req.receiptType || this.settings.defaultReceiptType || '405',
      status: 'Success',
      receiptUrl: result.DocUrl || result.Url || '',
      raw: result
    });

    return result;
  }

  /**
   * תשלום באפליקציית Bit
   */
  public async sendBitTransaction(req: BitPaymentRequest): Promise<KesherApiResponse> {
    if (!this.isConfigured()) {
      throw new Error('לא הוגדרו שם משתמש וסיסמה למערכת קשר');
    }

    const payload = {
      Json: {
        userName: this.settings.userName,
        password: this.settings.apiKey,
        func: 'SendBitTransaction',
        format: 'json',
        bitTran: {
          Phone: req.phoneNumber.replace(/\D/g, ''),
          Total: Math.round(Number(req.amount) * 100),
          Currency: 1,
          Description: req.description || 'תשלום עבור שירות',
          ClientName: req.clientName || '',
          DocumentType: Number(req.documentType || this.settings.defaultReceiptType || 320)
        }
      },
      format: 'json'
    };

    const result = await this.postToConnect(payload);

    if (result.Status === false) {
      throw new Error(result.Description || 'שגיאה בשליחת תשלום ב-Bit');
    }

    return result;
  }

  /**
   * עיצוב תאריך עבור שרת קשר (YYYY/MM/DD)
   */
  public formatDateForKesher(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  /**
   * בדיקת חיבור לקשר (GetTrans)
   */
  public async testConnection(credentials?: { userName?: string; apiKey?: string }): Promise<{ success: boolean; message: string; error?: string }> {
    const userName = credentials?.userName || this.settings.userName;
    const password = credentials?.apiKey || this.settings.apiKey;

    if (!userName || !password) {
      return { success: false, message: 'נא להזין שם משתמש וסיסמה/מפתח לקשר בהגדרות.' };
    }

    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const payload = {
        func: 'GetTrans',
        format: 'json',
        userName,
        password,
        fromDate: '2020/01/01',
        toDate: this.formatDateForKesher(tomorrow)
      };

      let result: any = null;
      try {
        result = await this.postToConnect(payload);
      } catch {
        const wrapped = { Json: payload, format: 'json' };
        result = await this.postToConnect(wrapped);
      }

      if (result && result.Status === false && !result.Transaction && !result.Transactions) {
        return {
          success: false,
          message: result.Description || result.Message || 'פרטי התחברות שגויים מול קשר',
          error: result.Description || result.Message
        };
      }

      return {
        success: true,
        message: 'החיבור לשרת קשר תקין ומאומת בהצלחה!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'שגיאת תקשורת מול שרת קשר: ' + (err.message || err),
        error: err.message
      };
    }
  }

  /**
   * שליפת עסקאות מקשר (GetTrans) עם שליפה מפוצלת במקטעים (Date Slicing) ומספר ערוצי נתונים
   */
  public async getTransactions(timeframe: 'all' | 'year' | '3months' | 'week' = 'all'): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('לא הוגדרו פרטי התחברות לקשר');
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let pastDate = new Date('2020/01/01');
    if (timeframe === 'year') {
      pastDate = new Date(now);
      pastDate.setFullYear(now.getFullYear() - 1);
    } else if (timeframe === '3months') {
      pastDate = new Date(now);
      pastDate.setMonth(now.getMonth() - 3);
    } else if (timeframe === 'week') {
      pastDate = new Date(now);
      pastDate.setDate(now.getDate() - 7);
    }

    const fromDateStr = this.formatDateForKesher(pastDate);
    const toDateStr = this.formatDateForKesher(tomorrow);

    const extractTxArray = (resp: any): any[] => {
      if (!resp) return [];
      if (Array.isArray(resp)) return resp;
      if (resp.Transaction) return Array.isArray(resp.Transaction) ? resp.Transaction : [resp.Transaction];
      if (resp.Transactions) return Array.isArray(resp.Transactions) ? resp.Transactions : [resp.Transactions];
      if (resp.trans) return Array.isArray(resp.trans) ? resp.trans : [resp.trans];
      if (resp.Trans) return Array.isArray(resp.Trans) ? resp.Trans : [resp.Trans];
      if (resp.data) return Array.isArray(resp.data) ? resp.data : [resp.data];
      if (resp.Data) return Array.isArray(resp.Data) ? resp.Data : [resp.Data];
      if (resp.Table) return Array.isArray(resp.Table) ? resp.Table : [resp.Table];
      if (resp.Rows) return Array.isArray(resp.Rows) ? resp.Rows : [resp.Rows];
      if (resp.Items) return Array.isArray(resp.Items) ? resp.Items : [resp.Items];
      return [];
    };

    const fetchEndpoint = async (funcName: string): Promise<any[]> => {
      const payloadDirect = {
        func: funcName,
        format: 'json',
        userName: this.settings.userName,
        password: this.settings.apiKey,
        fromDate: fromDateStr,
        toDate: toDateStr
      };

      try {
        const res = await this.postToConnect(payloadDirect, 4000);
        const list = extractTxArray(res);
        if (list.length > 0) return list;
      } catch (e) {
        // try wrapped
      }

      try {
        const payloadWrapped = { Json: payloadDirect, format: 'json' };
        const res = await this.postToConnect(payloadWrapped, 4000);
        return extractTxArray(res);
      } catch (e) {
        return [];
      }
    };

    // שליפה מהירה במקביל של עסקאות רגילות והוראות קבע
    const [transResult, hkResult] = await Promise.allSettled([
      fetchEndpoint('GetTrans'),
      fetchEndpoint('GetHKTrans')
    ]);

    const allTransactionsMap = new Map<string, any>();

    if (transResult.status === 'fulfilled' && Array.isArray(transResult.value)) {
      transResult.value.forEach((tx: any, idx: number) => {
        const key = String(tx.NumTransaction || tx.Id || tx.TranId || tx.TransactionId || tx.DocNumber || `tx_${idx}`).trim();
        if (key) allTransactionsMap.set(key, tx);
      });
    }

    if (hkResult.status === 'fulfilled' && Array.isArray(hkResult.value)) {
      hkResult.value.forEach((tx: any, idx: number) => {
        const key = String(tx.NumTransaction || tx.Id || tx.TranId || tx.TransactionId || tx.DocNumber || `hk_${idx}`).trim();
        if (key && !allTransactionsMap.has(key)) allTransactionsMap.set(key, tx);
      });
    }

    return Array.from(allTransactionsMap.values());
  }

  /**
   * פענוח תאריך גמיש (כולל פורמט ישראלי DD/MM/YYYY שמוחזר מקשר)
   */
  public parseKesherDate(dateStr?: any): Date {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? new Date() : dateStr;
    if (typeof dateStr !== 'string') return new Date();

    const trimmed = dateStr.trim();
    if (trimmed.includes('/')) {
      const parts = trimmed.split(/[\s,T]+/);
      const datePart = parts[0];
      const timePart = parts[1] || '00:00:00';
      const [p1, p2, p3] = datePart.split('/');
      if (p1 && p2 && p3) {
        // במידה ו-p1 הוא יום ו-p3 הוא שנה
        const fullYear = p3.length === 2 ? `20${p3}` : p3;
        const isoLike = `${fullYear}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}T${timePart}`;
        const parsed = new Date(isoLike);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }

    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  /**
   * סנכרון עסקאות ולקוחות ישירות ל-CRM
   */
  public async syncTransactionsToCRM(
    timeframe: 'all' | 'year' | '3months' | 'week' = 'all',
    onProgress?: (progressText: string) => void
  ): Promise<KesherSyncResult> {
    if (!this.isConfigured()) {
      return { success: false, totalFetched: 0, addedCount: 0, updatedCount: 0, error: 'לא הוגדרו פרטי קשר.' };
    }

    onProgress?.('שולף עסקאות משרת קשר...');
    const rawTransactions = await this.getTransactions(timeframe);

    if (!rawTransactions || rawTransactions.length === 0) {
      return { 
        success: true, 
        totalFetched: 0, 
        addedCount: 0, 
        updatedCount: 0, 
        message: 'לא נמצאו עסקאות במסוף קשר בטווח התאריכים המבוקש.' 
      };
    }

    // המרה לפורמט עסקאות אחיד
    const localItems: KesherTransactionItem[] = rawTransactions
      .map((tx: any) => {
        const txId = String(tx.NumTransaction || tx.Id || tx.TranId || tx.TransactionId || '').trim();
        const rawTotal = tx.Total !== undefined ? tx.Total : (tx.Sum !== undefined ? tx.Sum : (tx.Amount !== undefined ? tx.Amount : 0));
        const parsedTotal = typeof rawTotal === 'number' ? rawTotal : parseFloat(String(rawTotal).replace(/[^0-9.-]/g, '') || '0');
        // Kesher returns amounts in Agorot, e.g. 5400 = 54 NIS
        const amount = parsedTotal >= 100 && Number.isInteger(parsedTotal) ? parsedTotal / 100 : parsedTotal;
        const parsedDate = this.parseKesherDate(tx.TranDate || tx.Date || tx.TransactionDate || tx.CreatedAt);
        const fullName = (tx.Name || tx.ClientName || tx.FullName || `${tx.FirstName || ''} ${tx.LastName || ''}`).trim() || 'לקוח קשר';
        const isSuccess = tx.CreditStatus === 0 || tx.CreditStatus === '0' || !tx.CreditStatus || String(tx.Status || '').includes('אושר') || String(tx.Status || '').includes('הושלם') || tx.Status === '000' || tx.Status === 'Approved';

        const rawStr = JSON.stringify(tx).toLowerCase();
        let method: any = 'Cash';

        if (tx.IsBit || rawStr.includes('bit') || String(tx.PaymentMethod || tx.ChargeOptionType || tx.Description || '').toLowerCase().includes('bit')) {
          method = 'Bit';
        } else if (
          tx.CheckNumber ||
          tx.NumCheck ||
          String(tx.PaymentMethod || tx.ChargeOptionType || tx.PaymentType || tx.Details || '').includes('צ\'ק') ||
          String(tx.PaymentMethod || tx.ChargeOptionType || tx.Details || '').includes('שיק') ||
          tx.ChargeOptionType === 'Check' ||
          tx.PaymentType == 2
        ) {
          method = 'Check';
        } else if (
          tx.ChargeOptionType === 'BankTransfer' ||
          String(tx.PaymentMethod || tx.ChargeOptionType || tx.Details || '').includes('העברה') ||
          tx.PaymentType == 3 ||
          tx.Bank ||
          tx.Branch
        ) {
          method = 'BankTransfer';
        } else if (
          tx.CreditNum ||
          tx.CardNumber ||
          tx.NumCard ||
          tx.Brand ||
          tx.CreditType ||
          tx.CreditCardCompany ||
          tx.ChargeOptionType === 'CreditCard' ||
          String(tx.PaymentMethod || '').includes('אשראי')
        ) {
          method = 'CreditCard';
        } else if (
          tx.ChargeOptionType === 'Cash' ||
          String(tx.PaymentMethod || tx.ChargeOptionType || tx.Details || '').includes('מזומן') ||
          tx.PaymentType == 1
        ) {
          method = 'Cash';
        } else {
          method = tx.ChargeOptionType || tx.PaymentMethod || (tx.CreditNum || tx.CardNumber ? 'CreditCard' : 'Cash');
        }

        const rawDocType = tx.DocumentType || tx.DocType || tx.ReceiptType || tx.ProjectNumber || tx.ProjectNum;
        let docType = 400; // ברירת מחדל: קבלה רגילה
        if (rawDocType) {
          const numDoc = Number(rawDocType);
          if (!isNaN(numDoc) && numDoc > 0) {
            docType = numDoc;
          } else if (String(rawDocType).includes('תרומה')) {
            docType = 405;
          } else if (String(rawDocType).includes('מס קבלה')) {
            docType = 320;
          } else if (String(rawDocType).includes('מס')) {
            docType = 305;
          }
        }

        return {
          id: `kesher_${txId || Math.random().toString(36).substring(2, 8)}`,
          transactionId: txId,
          date: parsedDate.toISOString(),
          amount,
          clientName: fullName,
          phone: tx.Phone || tx.Phone2 || tx.PhoneNumber || tx.Tel || '',
          email: (tx.Mail || tx.Email || '').trim(),
          tz: (tx.Tz || tx.IdNum || tx.ID || tx.tg1 || '').trim(),
          paymentMethod: method,
          documentType: docType,
          status: isSuccess ? 'Approved' : String(tx.Status || 'Declined'),
          receiptUrl: tx.OriginalDoc || tx.CopyDoc || tx.DocUrl || tx.Url || tx.ReceiptUrl || '',
          authNumber: String(tx.AuthNum || tx.AuthNumber || tx.ApprovalNumber || tx.DocNumber || tx.NumTransaction || tx.CheckNumber || ''),
          last4: tx.CreditNum ? String(tx.CreditNum).slice(-4) : (tx.CardNumber ? String(tx.CardNumber).slice(-4) : (tx.NumCard ? String(tx.NumCard).slice(-4) : '')),
          raw: tx
        };
      });

    // עדכון ברשימה המקומית
    this.mergeLocalTransactions(localItems);
    const added = localItems.length;

    this.saveSettings({ lastSyncTime: new Date().toISOString() });

    return {
      success: true,
      totalFetched: rawTransactions.length,
      addedCount: added,
      updatedCount: 0,
      message: `סונכרנו בהצלחה ${added} עסקאות ותקבולים מקשר!`
    };
  }

  /**
   * יומן עסקאות מקומי
   */
  public getLocalTransactions(): KesherTransactionItem[] {
    try {
      const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public async recordTransaction(item: KesherTransactionItem, customDb?: any): Promise<void> {
    this.recordLocalTransaction(item);
    try {
      // Direct Firestore sync if Firebase is available
      const { db } = await import('../../../services/firebase');
      const targetDb = customDb || db;
      if (targetDb) {
        const { doc, setDoc } = await import('firebase/firestore');
        const docId = item.id || `kesher_${item.transactionId || Date.now()}`;
        const cleanPayload = JSON.parse(JSON.stringify(item));
        await setDoc(doc(targetDb, 'kesher_transactions', docId), cleanPayload, { merge: true });
      }
    } catch (e) {
      console.warn('[KesherService] Firestore recordTransaction notice:', e);
    }
  }

  private recordLocalTransaction(item: KesherTransactionItem): void {
    try {
      const list = this.getLocalTransactions();
      const existingIdx = list.findIndex(t => t.id === item.id || (t.transactionId && t.transactionId === item.transactionId));
      if (existingIdx >= 0) {
        list[existingIdx] = item;
      } else {
        list.unshift(item);
      }
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
    } catch (e) {
      console.warn('Failed to save local transaction', e);
    }
  }

  public async mergeTransactions(newItems: KesherTransactionItem[], customDb?: any): Promise<void> {
    this.mergeLocalTransactions(newItems);
    try {
      const { db } = await import('../../../services/firebase');
      const targetDb = customDb || db;
      if (targetDb && newItems.length > 0) {
        const { doc, setDoc } = await import('firebase/firestore');
        for (const item of newItems.slice(0, 100)) {
          const docId = item.id || `kesher_${item.transactionId || Date.now()}`;
          const cleanPayload = JSON.parse(JSON.stringify(item));
          await setDoc(doc(targetDb, 'kesher_transactions', docId), cleanPayload, { merge: true });
        }
      }
    } catch (e) {
      console.warn('[KesherService] Firestore mergeTransactions notice:', e);
    }
  }

  private mergeLocalTransactions(newItems: KesherTransactionItem[]): void {
    try {
      const existing = this.getLocalTransactions();
      const map = new Map<string, KesherTransactionItem>();
      existing.forEach(item => map.set(item.transactionId || item.id, item));
      newItems.forEach(item => map.set(item.transactionId || item.id, item));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(merged.slice(0, 500)));
    } catch (e) {
      console.warn('Failed to merge transactions', e);
    }
  }

  /**
   * בדיקת תקינות כרטיס אשראי (Luhn check + Card brand detection)
   */
  public validateCreditCard(cardNumber: string): { isValid: boolean; brand: string; cleanNumber: string } {
    const clean = cardNumber.replace(/\D/g, '');
    let brand = 'Unknown';
    if (/^4/.test(clean)) brand = 'Visa';
    else if (/^(5[1-5]|2[2-7])/.test(clean)) brand = 'MasterCard';
    else if (/^(34|37)/.test(clean)) brand = 'American Express';
    else if (/^(30|36|38|39)/.test(clean)) brand = 'Diners Club';
    else if (/^50|56|58|6/.test(clean)) brand = 'Maestro';
    else if (/^35/.test(clean)) brand = 'JCB';
    else if (/^88/.test(clean)) brand = 'Isracard';

    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const isValid = clean.length >= 8 && clean.length <= 19 && sum % 10 === 0;
    return { isValid, brand, cleanNumber: clean };
  }

  /**
   * פירוש קודי שגיאה נפוצים של קשר / שב"א
   */
  public getErrorDescription(code: string): { message: string; suggestion: string } {
    const errorMap: Record<string, { message: string; suggestion: string }> = {
      '001': { message: 'כרטיס חסום או מבוטל (לגנוב)', suggestion: 'פנה אל הלקוח לקבלת אמצעי תשלום חלופי.' },
      '002': { message: 'כרטיס גנוב - להחרים', suggestion: 'אין לבצע עסקאות נוספות בכרטיס זה.' },
      '003': { message: 'פנה לחברת האשראי (בירור)', suggestion: 'על בעל הכרטיס ליצור קשר עם חברת האשראי שלו לאישור העסקה.' },
      '004': { message: 'סירוב רגיל / חריגה ממסגרת', suggestion: 'הכרטיס נדחה עקב חוסר מסגרת או סירוב מחברת האשראי.' },
      '005': { message: 'כרטיס מזויף', suggestion: 'נא לבדוק את פרטי הכרטיס.' },
      '006': { message: 'תקלה ב-CVV או תוקף שגוי', suggestion: 'וודא כי 3 הספרות בגב הכרטיס ותאריך התפוגה הוזנו במדויק.' },
      '033': { message: 'כרטיס לא תקין או ספרת ביקורת שגויה', suggestion: 'בדוק שמספר הכרטיס הוקלד במלואו ונכון.' },
      '036': { message: 'פג תוקף הכרטיס', suggestion: 'תוקף הכרטיס עבר. בקש מהלקוח כרטיס מעודכן.' },
      '057': { message: 'מספר ת.ז שגוי', suggestion: 'וודא שמספר תעודת הזהות של בעל הכרטיס תקין.' },
      '058': { message: 'עסקה לא מורשית במטבע זה', suggestion: 'וודא שהעסקה מבוצעת במטבע נתמך (ש"ח).' },
      '059': { message: 'עסקה חוזרת / כפולה', suggestion: 'העסקה כבר נקלטה במערכת.' },
    };

    return errorMap[code] || {
      message: `קוד שגיאה ${code}`,
      suggestion: 'בדוק את פרטי הבקשה או פנה לתמיכה הטכנית של קשר.'
    };
  }
}

export const kesherService = new KesherService();

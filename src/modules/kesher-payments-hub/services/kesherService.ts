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
      if (resp.docs) return Array.isArray(resp.docs) ? resp.docs : [resp.docs];
      if (resp.Documents) return Array.isArray(resp.Documents) ? resp.Documents : [resp.Documents];
      if (resp.Table) return Array.isArray(resp.Table) ? resp.Table : [resp.Table];
      if (resp.Rows) return Array.isArray(resp.Rows) ? resp.Rows : [resp.Rows];
      if (resp.Items) return Array.isArray(resp.Items) ? resp.Items : [resp.Items];
      if (resp.List) return Array.isArray(resp.List) ? resp.List : [resp.List];
      return [];
    };

    const fetchEndpoint = async (funcName: string, extraParams: Record<string, any> = {}): Promise<any[]> => {
      const payloadDirect = {
        func: funcName,
        format: 'json',
        userName: this.settings.userName,
        password: this.settings.apiKey,
        fromDate: fromDateStr,
        toDate: toDateStr,
        FromDate: fromDateStr,
        ToDate: toDateStr,
        ...extraParams
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

    // שליפה ישירה של מסמכי איזי קאונט במידה ומוגדר טוקן
    const fetchEasyCountDocs = async (): Promise<any[]> => {
      if (!this.settings.ezCountToken) return [];
      const ezUrls = [
        'https://api.ezcount.co.il/api/get-docs',
        'https://corsproxy.io/?url=' + encodeURIComponent('https://api.ezcount.co.il/api/get-docs'),
        'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.ezcount.co.il/api/get-docs')
      ];
      const ezPayload = {
        api_key: this.settings.ezCountToken,
        token: this.settings.ezCountToken,
        from_date: fromDateStr.replace(/\//g, '-'),
        to_date: toDateStr.replace(/\//g, '-')
      };

      for (const url of ezUrls) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3500);
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ezPayload),
            signal: controller.signal
          });
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            const list = extractTxArray(data);
            if (list.length > 0) return list;
          }
        } catch {
          clearTimeout(timer);
        }
      }
      return [];
    };

    // שליפה מהירה במקביל של כל ערוצי המידע בקשר:
    // 1. GetTrans (כולל מזומן, אשראי והעברות)
    // 2. GetCompanyTransactions (דוח עסקאות לפי חברה)
    // 3. GetCashTransactions (דוח עסקאות מזומן וצ'קים)
    // 4. GetHKTrans (הוראות קבע)
    // 5. GetDocs (מסמכים וקבלות)
    // 6. EasyCount Get-Docs
    const results = await Promise.allSettled([
      fetchEndpoint('GetTrans', { TranType: 0, IncludeCash: true, isAll: true }),
      fetchEndpoint('GetCompanyTransactions'),
      fetchEndpoint('GetCashTransactions'),
      fetchEndpoint('GetCashTrans'),
      fetchEndpoint('GetDocs'),
      fetchEndpoint('GetHKTrans'),
      fetchEasyCountDocs()
    ]);

    const allTransactionsMap = new Map<string, any>();

    results.forEach((res, resIdx) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        res.value.forEach((tx: any, idx: number) => {
          const key = String(
            tx.NumTransaction ||
            tx.Id ||
            tx.TranId ||
            tx.TransactionId ||
            tx.DocNumber ||
            tx.doc_number ||
            tx.number ||
            `${tx.Date || tx.TranDate || tx.doc_date}_${tx.Total || tx.Sum || tx.amount}_${resIdx}_${idx}`
          ).trim();
          if (key && !allTransactionsMap.has(key)) {
            allTransactionsMap.set(key, tx);
          }
        });
      }
    });

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
   * פענוח אמצעי תשלום מדויק מכל שדות המקור של קשר
   */
  public parseTransactionPaymentMethod(tx: any): {
    method: 'CreditCard' | 'Cash' | 'Check' | 'BankTransfer' | 'Bit' | 'StandingOrder';
    label: string;
    details: {
      checkNumber?: string;
      bankName?: string;
      branchNumber?: string;
      accountNumber?: string;
      cardDigits?: string;
      transferRef?: string;
    };
  } {
    const rawStr = JSON.stringify(tx || {}).toLowerCase();
    const pMethod = String(tx?.PaymentMethod || '').toLowerCase();
    const chargeOption = String(tx?.ChargeOptionType || '').toLowerCase();
    const details = String(tx?.Details || tx?.Description || tx?.Comment || '').toLowerCase();
    const pType = String(tx?.PaymentType || tx?.payment_type || '').toLowerCase();

    const checkNum = String(tx?.CheckNumber || tx?.NumCheck || tx?.check_number || '').trim();
    const bank = String(tx?.Bank || tx?.BankName || tx?.bank_name || '').trim();
    const branch = String(tx?.Branch || tx?.BranchNumber || tx?.branch_number || '').trim();
    const account = String(tx?.Account || tx?.AccountNumber || tx?.account_number || '').trim();
    const cardDigits = String(tx?.CreditNum || tx?.CardNumber || tx?.NumCard || tx?.last4 || '').trim().slice(-4);

    // 1. Bit
    if (tx?.IsBit || rawStr.includes('bit') || pMethod.includes('bit') || chargeOption.includes('bit') || details.includes('bit')) {
      return {
        method: 'Bit',
        label: 'Bit',
        details: {}
      };
    }

    // 2. Check / שיק / צ'ק
    if (
      checkNum ||
      chargeOption === 'check' ||
      pType === '2' ||
      pType === 'check' ||
      pMethod.includes('צ\'ק') ||
      pMethod.includes('שיק') ||
      pMethod.includes('check') ||
      details.includes('צ\'ק') ||
      details.includes('שיק')
    ) {
      return {
        method: 'Check',
        label: checkNum ? `צ'ק (#${checkNum})` : 'צ\'ק',
        details: { checkNumber: checkNum, bankName: bank, branchNumber: branch, accountNumber: account }
      };
    }

    // 3. Bank Transfer / העברה בנקאית
    if (
      chargeOption === 'banktransfer' ||
      chargeOption === 'bank_transfer' ||
      pType === '3' ||
      pType === 'bank_transfer' ||
      pMethod.includes('העברה') ||
      pMethod.includes('transfer') ||
      pMethod.includes('בנק') ||
      details.includes('העברה') ||
      ((bank || branch) && !cardDigits && !checkNum)
    ) {
      const bankLabel = bank ? ` (${bank}${branch ? `-${branch}` : ''})` : '';
      return {
        method: 'BankTransfer',
        label: `העברה בנקאית${bankLabel}`,
        details: { bankName: bank, branchNumber: branch, accountNumber: account }
      };
    }

    // 4. Standing Order / הוראת קבע
    if (
      tx?.IsHK ||
      tx?.CreditType === 10 ||
      pType === '10' ||
      pMethod.includes('הוראת קבע') ||
      details.includes('הוראת קבע')
    ) {
      return {
        method: 'StandingOrder',
        label: 'הוראת קבע',
        details: { cardDigits }
      };
    }

    // 5. Cash / מזומן
    if (
      chargeOption === 'cash' ||
      pType === '1' ||
      pType === 'cash' ||
      pMethod.includes('מזומן') ||
      details.includes('מזומן')
    ) {
      return {
        method: 'Cash',
        label: 'מזומן',
        details: {}
      };
    }

    // 6. Credit Card / אשראי
    if (
      cardDigits ||
      tx?.CreditNum ||
      tx?.CardNumber ||
      tx?.NumCard ||
      tx?.CreditType ||
      tx?.CreditCardCompany ||
      chargeOption === 'creditcard' ||
      pType === 'credit_card' ||
      pMethod.includes('אשראי')
    ) {
      return {
        method: 'CreditCard',
        label: cardDigits ? `אשראי (..${cardDigits})` : 'כרטיס אשראי',
        details: { cardDigits }
      };
    }

    // ברירת מחדל: אם יש ספרות כרטיס או סכום ללא פירוט
    return {
      method: cardDigits ? 'CreditCard' : 'Cash',
      label: cardDigits ? `אשראי (..${cardDigits})` : 'תקבול כללי',
      details: { cardDigits }
    };
  }

  /**
   * סנכרון מלא של לקוחות, עסקאות ותקבולים ישירות ל-CRM ול-Firestore
   */
  public async syncCustomersToCRM(
    timeframe: 'all' | 'year' | '3months' | 'week' = 'all',
    onProgress?: (progressText: string) => void,
    customDb?: any
  ): Promise<{
    success: boolean;
    totalFetched: number;
    createdContactsCount: number;
    updatedContactsCount: number;
    totalTransactions: number;
    countsByMethod: {
      check: number;
      bankTransfer: number;
      cash: number;
      creditCard: number;
      bit: number;
      standingOrder: number;
    };
    message: string;
    error?: string;
  }> {
    const methodCounts = {
      check: 0,
      bankTransfer: 0,
      cash: 0,
      creditCard: 0,
      bit: 0,
      standingOrder: 0,
    };

    if (!this.isConfigured()) {
      return {
        success: false,
        totalFetched: 0,
        createdContactsCount: 0,
        updatedContactsCount: 0,
        totalTransactions: 0,
        countsByMethod: methodCounts,
        message: '',
        error: 'לא הוגדרו פרטי קשר (שם משתמש ומפתח) בהגדרות המערכת.'
      };
    }

    onProgress?.('שולף עסקאות ומסמכים מכל ערוצי קשר...');
    const rawTransactions = await this.getTransactions(timeframe);

    if (!rawTransactions || rawTransactions.length === 0) {
      return {
        success: true,
        totalFetched: 0,
        createdContactsCount: 0,
        updatedContactsCount: 0,
        totalTransactions: 0,
        countsByMethod: methodCounts,
        message: 'לא נמצאו עסקאות או מסמכים במסוף קשר בטווח הזמן שנבחר.'
      };
    }

    onProgress?.(`מפענח ${rawTransactions.length} עסקאות ותקבולים...`);

    // פונקציית ניקוי ונירמול טלפון
    const normalizePhoneStr = (phone?: string): string => {
      if (!phone) return '';
      let clean = String(phone).replace(/\D/g, '');
      if (clean.startsWith('972')) {
        clean = '0' + clean.slice(3);
      } else if (clean.length === 9 && clean.startsWith('5')) {
        clean = '0' + clean;
      }
      return clean;
    };

    // המרה למבנה פריטי עסקה אחידים
    const localItems: KesherTransactionItem[] = [];

    // מיפוי לקוחות לפי מזהה ייחודי: טלפון מנורמל -> אימייל -> ת.ז -> שם מלא
    const customersMap = new Map<string, {
      demographics: {
        conta_name: string;
        f_m: string;
        l_m: string;
        conta_phone: string;
        phone: string;
        normalizedPhone: string;
        email: string;
        company_name: string;
        mh_crm_city: string;
        mh_crm_street: string;
        tg1: string; // ת.ז
        tz: string;
      };
      payments: any[];
      donations: any[];
      events: any[];
      paymentDetails: Record<string, any>;
    }>();

    for (let idx = 0; idx < rawTransactions.length; idx++) {
      const tx = rawTransactions[idx];
      const txId = String(
        tx.NumTransaction || tx.Id || tx.TranId || tx.TransactionId || tx.DocNumber || tx.doc_number || tx.number || `trx_${idx}`
      ).trim();

      const rawTotal = tx.Total !== undefined ? tx.Total : (tx.Sum !== undefined ? tx.Sum : (tx.Amount !== undefined ? tx.Amount : (tx.amount !== undefined ? tx.amount : 0)));
      const parsedTotal = typeof rawTotal === 'number' ? rawTotal : parseFloat(String(rawTotal).replace(/[^0-9.-]/g, '') || '0');
      const amount = parsedTotal >= 500 && Number.isInteger(parsedTotal) && !tx.doc_number ? parsedTotal / 100 : parsedTotal;
      const parsedDate = this.parseKesherDate(tx.TranDate || tx.Date || tx.TransactionDate || tx.CreatedAt || tx.doc_date || tx.created_at);
      const isSuccess = tx.CreditStatus === 0 || tx.CreditStatus === '0' || !tx.CreditStatus || String(tx.Status || '').includes('אושר') || String(tx.Status || '').includes('הושלם') || tx.Status === '000' || tx.Status === 'Approved' || tx.status === 'success';

      const parsedMethod = this.parseTransactionPaymentMethod(tx);

      // עדכון ספירות
      if (parsedMethod.method === 'Check') methodCounts.check++;
      else if (parsedMethod.method === 'BankTransfer') methodCounts.bankTransfer++;
      else if (parsedMethod.method === 'Cash') methodCounts.cash++;
      else if (parsedMethod.method === 'Bit') methodCounts.bit++;
      else if (parsedMethod.method === 'StandingOrder') methodCounts.standingOrder++;
      else methodCounts.creditCard++;

      const rawPhone = String(tx.Phone || tx.Phone2 || tx.PhoneNumber || tx.Tel || tx.customer_phone || tx.phone || '').trim();
      const normPhone = normalizePhoneStr(rawPhone);
      const cleanEmail = String(tx.Mail || tx.Email || tx.customer_email || tx.email || '').trim().toLowerCase();
      const cleanTz = String(tx.Tz || tx.IdNum || tx.ID || tx.tg1 || tx.customer_tz || tx.vat_id || '').trim();
      const fullName = (tx.Name || tx.ClientName || tx.FullName || tx.customer_name || tx.client_name || `${tx.FirstName || ''} ${tx.LastName || ''}`).trim() || 'לקוח קשר';

      const rawDocType = tx.DocumentType || tx.DocType || tx.ReceiptType || tx.ProjectNumber || tx.ProjectNum || tx.doc_type;
      let docType = 400;
      if (rawDocType) {
        const numDoc = Number(rawDocType);
        if (!isNaN(numDoc) && numDoc > 0) docType = numDoc;
        else if (String(rawDocType).includes('תרומה')) docType = 405;
        else if (String(rawDocType).includes('מס קבלה')) docType = 320;
        else if (String(rawDocType).includes('מס')) docType = 305;
      }

      const receiptUrl = tx.OriginalDoc || tx.CopyDoc || tx.DocUrl || tx.Url || tx.ReceiptUrl || tx.pdf_url || tx.download_url || '';
      const authNumber = String(tx.AuthNum || tx.AuthNumber || tx.ApprovalNumber || tx.DocNumber || tx.doc_number || tx.NumTransaction || tx.CheckNumber || '');

      const transItem: KesherTransactionItem = {
        id: `kesher_${txId || Math.random().toString(36).substring(2, 8)}`,
        transactionId: txId,
        date: parsedDate.toISOString(),
        amount,
        clientName: fullName,
        phone: rawPhone,
        email: cleanEmail,
        tz: cleanTz,
        paymentMethod: parsedMethod.method,
        documentType: docType,
        status: isSuccess ? 'Approved' : String(tx.Status || 'Declined'),
        receiptUrl,
        authNumber,
        last4: parsedMethod.details.cardDigits || (tx.CreditNum ? String(tx.CreditNum).slice(-4) : ''),
        raw: tx
      };

      localItems.push(transItem);

      // צירוף לרשומת הלקוח
      const customerKey = normPhone || cleanEmail || cleanTz || fullName;
      if (!customersMap.has(customerKey)) {
        customersMap.set(customerKey, {
          demographics: {
            conta_name: fullName,
            f_m: String(tx.FirstName || '').trim() || fullName.split(' ')[0] || '',
            l_m: String(tx.LastName || '').trim() || (fullName.includes(' ') ? fullName.split(' ').slice(1).join(' ') : ''),
            conta_phone: normPhone || rawPhone,
            phone: normPhone || rawPhone,
            normalizedPhone: normPhone,
            email: cleanEmail,
            company_name: String(tx.CompanyName || tx.CreditCardCompany || '').trim(),
            mh_crm_city: String(tx.City || '').trim(),
            mh_crm_street: [tx.Address, tx.NumHouse, tx.Entrance ? `כניסה ${tx.Entrance}` : '', tx.ApartmentNumber ? `דירה ${tx.ApartmentNumber}` : ''].filter(Boolean).join(' ').trim(),
            tg1: cleanTz,
            tz: cleanTz
          },
          payments: [],
          donations: [],
          events: [],
          paymentDetails: { ...parsedMethod.details }
        });
      }

      const cust = customersMap.get(customerKey)!;
      if (!cust.demographics.conta_phone && normPhone) cust.demographics.conta_phone = normPhone;
      if (!cust.demographics.email && cleanEmail) cust.demographics.email = cleanEmail;
      if (!cust.demographics.tg1 && cleanTz) {
        cust.demographics.tg1 = cleanTz;
        cust.demographics.tz = cleanTz;
      }
      if (!cust.demographics.company_name && tx.CompanyName) cust.demographics.company_name = tx.CompanyName.trim();
      if (!cust.demographics.mh_crm_city && tx.City) cust.demographics.mh_crm_city = tx.City.trim();

      const paymentRecord = {
        id: `pay_${txId || Date.now()}_${idx}`,
        transactionId: txId,
        date: parsedDate.toISOString(),
        amount,
        paymentMethod: parsedMethod.method,
        method: parsedMethod.label,
        paymentType: parsedMethod.method,
        status: isSuccess ? 'success' : 'failed',
        kesherStatus: tx.Status || (isSuccess ? 'Approved' : 'Declined'),
        documentType: docType,
        receiptUrl,
        receiptLink: receiptUrl,
        authNumber,
        checkNumber: parsedMethod.details.checkNumber || '',
        bankName: parsedMethod.details.bankName || '',
        branchNumber: parsedMethod.details.branchNumber || '',
        accountNumber: parsedMethod.details.accountNumber || '',
        cardDigits: parsedMethod.details.cardDigits || '',
        projectName: tx.ProjectName || tx.ProjectNum || '',
        comment: tx.Comment || tx.Details || tx.Description || ''
      };

      cust.payments.push(paymentRecord);
      cust.donations.push({
        id: txId || `don_${Date.now()}_${idx}`,
        campaignId: tx.ProjectNum || 'kesher',
        campaignTitle: tx.ProjectName || 'קשר',
        amount,
        paymentStatus: isSuccess ? 'completed' : 'failed',
        paymentMethod: parsedMethod.label,
        transactionId: txId,
        receiptUrl,
        date: parsedDate.toISOString(),
        dedication: tx.Comment || ''
      });
      cust.events.push({
        title: `תקבול בקשר (${parsedMethod.label}): ₪${amount}`,
        type: 'kesher_transaction',
        amount,
        date: parsedDate.toISOString()
      });
    }

    // שמירה מקומית של כל העסקאות
    this.mergeLocalTransactions(localItems);

    let createdContactsCount = 0;
    let updatedContactsCount = 0;

    // סנכרון ל-Firestore (CRM Contacts + kesher_transactions)
    try {
      const { db } = await import('../../../services/firebase');
      const targetDb = customDb || db;

      if (targetDb) {
        const { collection, getDocs, doc, setDoc, updateDoc } = await import('firebase/firestore');

        onProgress?.('מסנכרן לקוחות ואנשי קשר מול מסד הנתונים של ה-CRM...');

        // שליפת אנשי קשר קיימים
        const contactsRef = collection(targetDb, 'contacts');
        const contactsSnap = await getDocs(contactsRef);
        const existingContacts: any[] = [];
        contactsSnap.forEach((d) => existingContacts.push({ id: d.id, ...d.data() }));

        for (const [key, custData] of customersMap.entries()) {
          const normPhone = custData.demographics.normalizedPhone;
          const cleanEmail = custData.demographics.email;
          const cleanTz = custData.demographics.tg1;

          // חיפוש איש קשר קיים לפי טלפון, אימייל או ת.ז
          const existing = existingContacts.find((c: any) => {
            const cPhone = normalizePhoneStr(c.phone || c.conta_phone || c.mobile || c.phoneNumber);
            const cEmail = String(c.email || '').trim().toLowerCase();
            const cTz = String(c.tg1 || c.tz || c.idNumber || '').trim();

            if (normPhone && cPhone && (cPhone === normPhone || cPhone.endsWith(normPhone) || normPhone.endsWith(cPhone))) return true;
            if (cleanEmail && cEmail && cEmail === cleanEmail) return true;
            if (cleanTz && cTz && cTz === cleanTz) return true;
            return false;
          });

          if (existing) {
            // עדכון איש קשר קיים
            const updates: any = {};
            if (!existing.conta_name || existing.conta_name === 'לקוח' || existing.conta_name === 'אנונימי') {
              if (custData.demographics.conta_name) {
                updates.conta_name = custData.demographics.conta_name;
                updates.name = custData.demographics.conta_name;
                updates.fullName = custData.demographics.conta_name;
              }
            }
            if (!existing.f_m && custData.demographics.f_m) updates.f_m = custData.demographics.f_m;
            if (!existing.l_m && custData.demographics.l_m) updates.l_m = custData.demographics.l_m;
            if (!existing.email && cleanEmail) updates.email = cleanEmail;
            if (!existing.conta_phone && custData.demographics.conta_phone) updates.conta_phone = custData.demographics.conta_phone;
            if (!existing.company_name && custData.demographics.company_name) updates.company_name = custData.demographics.company_name;
            if (!existing.mh_crm_city && custData.demographics.mh_crm_city) updates.mh_crm_city = custData.demographics.mh_crm_city;
            if (!existing.mh_crm_street && custData.demographics.mh_crm_street) updates.mh_crm_street = custData.demographics.mh_crm_street;
            if (!existing.tg1 && cleanTz) {
              updates.tg1 = cleanTz;
              updates.tz = cleanTz;
            }

            // מיזוג תשלומים
            const currentPayments: any[] = Array.isArray(existing.payments) ? [...existing.payments] : [];
            const currentDonations: any[] = Array.isArray(existing.campaign_donations_history) ? [...existing.campaign_donations_history] : [];
            const currentEvents: any[] = Array.isArray(existing.events) ? [...existing.events] : [];
            let addedNewPayments = false;

            for (const p of custData.payments) {
              const isDup = currentPayments.some(
                (cp) => (cp.transactionId && p.transactionId && cp.transactionId === p.transactionId) ||
                        (cp.date === p.date && Number(cp.amount) === Number(p.amount) && cp.paymentMethod === p.paymentMethod)
              );
              if (!isDup) {
                currentPayments.unshift(p);
                addedNewPayments = true;
              }
            }

            for (const d of custData.donations) {
              const isDup = currentDonations.some(
                (cd) => (cd.transactionId && d.transactionId && cd.transactionId === d.transactionId) ||
                        (cd.id && d.id && cd.id === d.id)
              );
              if (!isDup) {
                currentDonations.unshift(d);
                addedNewPayments = true;
              }
            }

            for (const ev of custData.events) {
              const isDup = currentEvents.some((cev) => cev.date === ev.date && cev.title === ev.title);
              if (!isDup) {
                currentEvents.unshift(ev);
                addedNewPayments = true;
              }
            }

            if (addedNewPayments) {
              updates.payments = currentPayments;
              updates.campaign_donations_history = currentDonations;
              updates.events = currentEvents;

              const successful = currentPayments.filter((p) => p.status === 'success' || p.status === 'Approved');
              updates.total_spent = successful.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
              updates.order_count = successful.length;
              if (successful.length > 0) {
                updates.last_order_date = successful[0].date || new Date().toISOString();
              }
            }

            if (Object.keys(updates).length > 0) {
              updates.updatedAt = new Date().toISOString();
              await updateDoc(doc(targetDb, 'contacts', existing.id), updates);
              updatedContactsCount++;
            }
          } else {
            // יצירת איש קשר חדש
            const successful = custData.payments.filter((p) => p.status === 'success' || p.status === 'Approved');
            const totalSpent = successful.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
            const lastOrderDate = custData.payments[0]?.date || new Date().toISOString();
            const docId = `kesher_c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

            await setDoc(doc(targetDb, 'contacts', docId), {
              status: 'active',
              lead_source: 'קשר (סנכרון לקוחות ועסקאות)',
              source: 'kesher_sync',
              name: custData.demographics.conta_name,
              fullName: custData.demographics.conta_name,
              ...custData.demographics,
              payments: custData.payments,
              campaign_donations_history: custData.donations,
              events: custData.events,
              payment_details: custData.paymentDetails,
              total_spent: totalSpent,
              total_donated: totalSpent,
              order_count: successful.length,
              last_order_date: lastOrderDate,
              tags: ['קשר', 'לקוח משלם'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            createdContactsCount++;
          }
        }

        // סנכרון רשומות עסקאות ישירות לקולקציית kesher_transactions
        onProgress?.('מעדכן יומן תקבולים ועסקאות ב-Firestore...');
        for (const item of localItems.slice(0, 200)) {
          const tDocId = item.id || `kesher_${item.transactionId || Date.now()}`;
          const cleanItem = JSON.parse(JSON.stringify(item));
          await setDoc(doc(targetDb, 'kesher_transactions', tDocId), cleanItem, { merge: true });
        }
      }
    } catch (dbErr) {
      console.warn('[KesherService] Firestore sync non-fatal error:', dbErr);
    }

    this.saveSettings({ lastSyncTime: new Date().toISOString() });

    const totalProcessed = localItems.length;
    const summaryMsg = `סונכרנו בהצלחה ${totalProcessed} עסקאות ותקבולים מקשר (${methodCounts.check} צ'קים, ${methodCounts.bankTransfer} העברות, ${methodCounts.cash} מזומן, ${methodCounts.bit} ביט, ${methodCounts.creditCard} אשראי). עודכנו ${updatedContactsCount} לקוחות ונוצרו ${createdContactsCount} לקוחות חדשים ב-CRM!`;

    return {
      success: true,
      totalFetched: rawTransactions.length,
      createdContactsCount,
      updatedContactsCount,
      totalTransactions: totalProcessed,
      countsByMethod: methodCounts,
      message: summaryMsg
    };
  }

  /**
   * סנכרון עסקאות ולקוחות ישירות ל-CRM
   */
  public async syncTransactionsToCRM(
    timeframe: 'all' | 'year' | '3months' | 'week' = 'all',
    onProgress?: (progressText: string) => void
  ): Promise<KesherSyncResult> {
    const res = await this.syncCustomersToCRM(timeframe, onProgress);
    return {
      success: res.success,
      totalFetched: res.totalFetched,
      addedCount: res.createdContactsCount + res.updatedContactsCount,
      updatedCount: res.updatedContactsCount,
      message: res.message,
      error: res.error
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

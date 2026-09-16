export type KesherPaymentMethod = 'CreditCard' | 'Bit' | 'Cash' | 'Check' | 'BankTransfer';

export type KesherCreditType = 1 | 8 | 10; // 1 = Normal, 8 = Installments, 10 = Standing Order

export type KesherDocumentType = 
  | 405 // קבלה על תרומה (סעיף 46)
  | 400 // קבלה
  | 320 // חשבונית מס קבלה
  | 305 // חשבונית מס
  | 330 // חשבונית זיכוי
  | 310 // חשבונית עסקה
  | 200 // הצעת מחיר
  | 100; // הזמנה

export interface KesherSettings {
  userName: string;
  apiKey: string; // Used as Kesher password
  paymentPageId?: string; // ProjectNumber / Terminal
  ezCountToken?: string;
  baseUrl?: string;
  isDemo?: boolean;
  defaultReceiptType?: KesherDocumentType;
  autoSyncToCrm?: boolean;
  lastSyncTime?: string;
}

export interface CreditCardTransactionRequest {
  cardNumber: string;
  expiry: string; // MMYY or YYMM
  cvv: string;
  amount: number; // in ILS
  currency?: string; // ILS
  creditType?: KesherCreditType; // 1, 8, 10
  installments?: number;
  paramJ?: 'J4' | 'J5';
  clientName: string;
  phone?: string;
  email?: string;
  tz?: string;
  documentType?: KesherDocumentType;
  projectNumber?: string;
  comment?: string;
  transactionId?: string;
}

export interface ReceiptLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

export interface GlossaryItem {
  id: string;
  name: string;
  defaultPrice: number;
  category?: string;
  usageCount?: number;
  updatedAt?: string;
}

export interface CashTransactionRequest {
  clientName: string;
  amount: number; // in ILS
  paymentType: 'Cash' | 'Check' | 'BankTransfer';
  receiptType?: string | KesherDocumentType; // e.g. "405", "400", "320"
  phone?: string;
  email?: string;
  tz?: string;
  details?: string;
  purpose?: string;
  items?: ReceiptLineItem[];
  date?: string;
  // Check details
  checkNumber?: string;
  bankName?: string;
  branchNumber?: string;
  accountNumber?: string;
  // Bank transfer details
  transferRef?: string;
}

export interface BitPaymentRequest {
  phoneNumber: string;
  amount: number;
  description?: string;
  clientName?: string;
  documentType?: KesherDocumentType;
}

export interface StandingOrderRequest {
  customerId: string;
  amount: number;
  chargeDay: number; // 1-28
  startDate: string; // YYYY-MM-DD
  clientName?: string;
  phone?: string;
}

export interface UpdateStandingOrderRequest {
  id: string;
  amount?: number;
  chargeDay?: number;
  paymentMethod?: string;
  status?: 'Active' | 'Paused' | 'Cancelled';
}

export interface KesherApiResponse {
  Status?: boolean;
  Success?: boolean;
  success?: boolean;
  Description?: string;
  Message?: string;
  Code?: string | number;
  TransactionId?: string;
  TransferId?: string;
  HoldId?: string;
  ReceiptNumber?: string;
  DocUrl?: string;
  Url?: string;
  Token?: string;
  Last4?: string;
  Last4Digits?: string;
  CardBrand?: string;
  AuthNumber?: string;
  ExpiresAt?: string;
  BitTransactionId?: string;
  [key: string]: any;
}

export interface KesherTransactionItem {
  id: string;
  transactionId?: string;
  date: string;
  amount: number;
  clientName: string;
  phone?: string;
  email?: string;
  tz?: string;
  paymentMethod: KesherPaymentMethod | string;
  documentType: KesherDocumentType | number | string;
  status: 'Approved' | 'Pending' | 'Declined' | 'Success' | string;
  receiptUrl?: string;
  authNumber?: string;
  last4?: string;
  raw?: any;
}

export interface KesherSyncResult {
  success: boolean;
  totalFetched: number;
  addedCount: number;
  updatedCount: number;
  error?: string;
  message?: string;
}

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { kesherService } from '../services/kesherService';
import { crmContactSyncService } from '../services/crmContactSyncService';
import { receiptGlossaryService } from '../services/receiptGlossaryService';
import { 
  KesherSettings, 
  KesherTransactionItem, 
  GlossaryItem, 
  CreditCardTransactionRequest, 
  CashTransactionRequest, 
  BitPaymentRequest, 
  KesherApiResponse 
} from '../types';
import { CrmContactSummary } from '../../../core/contracts';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { eventBus } from '../../../core/bridge/EventBus';

export interface KesherPaymentsContextType {
  // Settings & Status
  settings: KesherSettings;
  isConfigured: boolean;
  isEasyCountConnected: boolean;
  saveSettings: (newSettings: Partial<KesherSettings>) => void;
  refreshSettings: () => void;

  // Transactions Log
  transactions: KesherTransactionItem[];
  refreshTransactions: () => void;

  // Glossary
  glossaryItems: GlossaryItem[];
  saveGlossaryItem: (item: { id?: string; name: string; defaultPrice: number; category?: string }) => Promise<GlossaryItem>;
  deleteGlossaryItem: (id: string) => Promise<boolean>;

  // Payment Operations
  processCreditCardPayment: (req: CreditCardTransactionRequest) => Promise<KesherApiResponse>;
  processCashPayment: (req: CashTransactionRequest) => Promise<KesherApiResponse>;
  processBitPayment: (req: BitPaymentRequest) => Promise<KesherApiResponse>;

  // Contacts
  searchContacts: (query: string) => CrmContactSummary[];
  saveContact: (contact: {
    id?: string;
    clientName: string;
    phone?: string;
    email?: string;
    tz?: string;
    bankName?: string;
    branchNumber?: string;
    accountNumber?: string;
    checkNumber?: string;
  }) => Promise<{ contact: CrmContactSummary; isNew: boolean }>;

  // Quick Metrics
  metrics: {
    totalRevenueToday: number;
    approvedCount: number;
    averageTransaction: number;
    failedCount: number;
  };
}

const KesherPaymentsContext = createContext<KesherPaymentsContextType | undefined>(undefined);

export const KesherPaymentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { db, apiKeys } = useSystemConnection();
  
  const [settings, setSettings] = useState<KesherSettings>(() => kesherService.getSettings());
  const [isConfigured, setIsConfigured] = useState<boolean>(() => kesherService.isConfigured());
  const [isEasyCountConnected, setIsEasyCountConnected] = useState<boolean>(() => kesherService.isEasyCountConnected());
  const [transactions, setTransactions] = useState<KesherTransactionItem[]>(() => kesherService.getLocalTransactions());
  const [glossaryItems, setGlossaryItems] = useState<GlossaryItem[]>(() => receiptGlossaryService.getItems());

  // Attach Firestore when connection provides db
  useEffect(() => {
    if (db) {
      kesherService.attachFirestore(db);
      crmContactSyncService.attachFirestore(db);
      receiptGlossaryService.attachFirestore(db);
    }
  }, [db]);

  // Sync settings when system api keys change
  useEffect(() => {
    const fresh = kesherService.loadSettings();
    setSettings(fresh);
    setIsConfigured(kesherService.isConfigured());
    setIsEasyCountConnected(kesherService.isEasyCountConnected());
  }, [apiKeys]);

  // Subscribe to glossary items updates
  useEffect(() => {
    const unsub = receiptGlossaryService.subscribe((items) => {
      setGlossaryItems(items);
    });
    return unsub;
  }, []);

  const refreshSettings = () => {
    const s = kesherService.loadSettings();
    setSettings(s);
    setIsConfigured(kesherService.isConfigured());
    setIsEasyCountConnected(kesherService.isEasyCountConnected());
  };

  const handleSaveSettings = (newSettings: Partial<KesherSettings>) => {
    const updated = kesherService.saveSettings(newSettings);
    setSettings(updated);
    setIsConfigured(kesherService.isConfigured());
    setIsEasyCountConnected(kesherService.isEasyCountConnected());
  };

  const refreshTransactions = () => {
    setTransactions(kesherService.getLocalTransactions());
  };

  const processCreditCardPayment = async (req: CreditCardTransactionRequest): Promise<KesherApiResponse> => {
    const res = await kesherService.sendTransaction(req);
    refreshTransactions();
    return res;
  };

  const processCashPayment = async (req: CashTransactionRequest): Promise<KesherApiResponse> => {
    const res = await kesherService.sendCashTransaction(req);
    refreshTransactions();
    return res;
  };

  const processBitPayment = async (req: BitPaymentRequest): Promise<KesherApiResponse> => {
    const res = await kesherService.sendBitTransaction(req);
    refreshTransactions();
    return res;
  };

  const saveGlossaryItem = async (item: { id?: string; name: string; defaultPrice: number; category?: string }) => {
    return await receiptGlossaryService.saveOrUpdateItem(item);
  };

  const deleteGlossaryItem = async (id: string) => {
    return await receiptGlossaryService.deleteItem(id);
  };

  const searchContacts = (query: string) => {
    return crmContactSyncService.search(query);
  };

  const saveContact = async (contactData: {
    id?: string;
    clientName: string;
    phone?: string;
    email?: string;
    tz?: string;
    bankName?: string;
    branchNumber?: string;
    accountNumber?: string;
    checkNumber?: string;
  }) => {
    return await crmContactSyncService.saveOrUpdateContact(contactData);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTxs = transactions.filter(t => t.date && t.date.startsWith(todayStr));
    const approvedTxs = todayTxs.filter(t => t.status === 'Approved' || t.status === 'Success');
    const failedTxs = todayTxs.filter(t => t.status === 'Declined' || t.status === 'Failed' || t.status === 'Error');
    
    const totalRev = approvedTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const avg = approvedTxs.length > 0 ? Math.round(totalRev / approvedTxs.length) : 0;

    return {
      totalRevenueToday: totalRev,
      approvedCount: approvedTxs.length,
      averageTransaction: avg,
      failedCount: failedTxs.length
    };
  }, [transactions]);

  return (
    <KesherPaymentsContext.Provider
      value={{
        settings,
        isConfigured,
        isEasyCountConnected,
        saveSettings: handleSaveSettings,
        refreshSettings,
        transactions,
        refreshTransactions,
        glossaryItems,
        saveGlossaryItem,
        deleteGlossaryItem,
        processCreditCardPayment,
        processCashPayment,
        processBitPayment,
        searchContacts,
        saveContact,
        metrics,
      }}
    >
      {children}
    </KesherPaymentsContext.Provider>
  );
};

export const useKesherPaymentsContext = (): KesherPaymentsContextType => {
  const context = useContext(KesherPaymentsContext);
  if (!context) {
    throw new Error('useKesherPaymentsContext must be used within a KesherPaymentsProvider');
  }
  return context;
};

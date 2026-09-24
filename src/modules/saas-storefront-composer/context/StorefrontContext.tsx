import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BillingInterval, 
  CartItem, 
  ModulePricingConfig, 
  StorefrontGeneralSettings, 
  StorefrontViewMode, 
  TenantCustomerInfo, 
  TenantRecord 
} from '../types';
import { StorefrontService } from '../services/storefrontService';
import { GoDaddyDnsService } from '../services/godaddyDnsService';
import { eventBus } from '../../../core/bridge/EventBus';
import { LeadPayload } from '../../../core/contracts';

interface StorefrontContextType {
  catalog: ModulePricingConfig[];
  settings: StorefrontGeneralSettings;
  cart: CartItem[];
  billingPlan: BillingInterval;
  viewMode: StorefrontViewMode;
  trialActiveModule: ModulePricingConfig | null;
  customerInfo: TenantCustomerInfo;
  selectedSubdomain: string;
  provisionedTenant: TenantRecord | null;
  isProcessing: boolean;
  totalMonthly: number;
  totalAnnualSavings: number;
  
  // Actions
  setViewMode: (mode: StorefrontViewMode) => void;
  setBillingPlan: (plan: BillingInterval) => void;
  toggleCartItem: (module: ModulePricingConfig) => void;
  isInCart: (moduleId: string) => boolean;
  clearCart: () => void;
  startTrial: (module: ModulePricingConfig) => void;
  endTrial: () => void;
  endTrialAndQuickBuy: (module: ModulePricingConfig) => void;
  setCustomerInfo: React.Dispatch<React.SetStateAction<TenantCustomerInfo>>;
  setSelectedSubdomain: (subdomain: string) => void;
  updateCatalogItem: (item: ModulePricingConfig) => void;
  updateSettings: (newSettings: StorefrontGeneralSettings) => void;
  completeCheckoutAndProvision: () => Promise<TenantRecord | null>;
  resetStorefront: () => void;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

export const StorefrontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<ModulePricingConfig[]>(() => StorefrontService.getCatalog());
  const [settings, setSettings] = useState<StorefrontGeneralSettings>(() => StorefrontService.getSettings());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [billingPlan, setBillingPlan] = useState<BillingInterval>('monthly');
  const [viewMode, setViewMode] = useState<StorefrontViewMode>('catalog');
  const [trialActiveModule, setTrialActiveModule] = useState<ModulePricingConfig | null>(null);
  const [selectedSubdomain, setSelectedSubdomain] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [provisionedTenant, setProvisionedTenant] = useState<TenantRecord | null>(null);

  const [customerInfo, setCustomerInfo] = useState<TenantCustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
  });

  // Calculate totals
  const totalMonthly = cart.reduce((sum, item) => {
    return sum + (billingPlan === 'annual' ? item.annualMonthlyPrice : item.monthlyPrice);
  }, 0);

  const totalAnnualSavings = cart.reduce((sum, item) => {
    return sum + (item.monthlyPrice - item.annualMonthlyPrice) * 12;
  }, 0);

  const isInCart = (moduleId: string) => cart.some(i => i.moduleId === moduleId);

  const toggleCartItem = (module: ModulePricingConfig) => {
    if (isInCart(module.id)) {
      setCart(prev => prev.filter(i => i.moduleId !== module.id));
    } else {
      setCart(prev => [
        ...prev,
        {
          moduleId: module.id,
          name: module.name,
          monthlyPrice: module.monthlyPrice,
          annualMonthlyPrice: module.annualMonthlyPrice,
          iconName: module.iconName,
        }
      ]);
    }
  };

  const clearCart = () => setCart([]);

  const startTrial = (module: ModulePricingConfig) => {
    setTrialActiveModule(module);
    setViewMode('sandbox_trial');
  };

  const endTrial = () => {
    setTrialActiveModule(null);
    setViewMode('catalog');
  };

  const endTrialAndQuickBuy = (module: ModulePricingConfig) => {
    if (!isInCart(module.id)) {
      toggleCartItem(module);
    }
    setTrialActiveModule(null);
    setViewMode('checkout');
  };

  const updateCatalogItem = (updatedItem: ModulePricingConfig) => {
    setCatalog(prev => {
      const next = prev.map(item => item.id === updatedItem.id ? updatedItem : item);
      StorefrontService.saveCatalog(next);
      return next;
    });
  };

  const updateSettings = (newSettings: StorefrontGeneralSettings) => {
    setSettings(newSettings);
    StorefrontService.saveSettings(newSettings);
  };

  const completeCheckoutAndProvision = async (): Promise<TenantRecord | null> => {
    if (!selectedSubdomain || cart.length === 0) return null;

    setIsProcessing(true);
    try {
      const cleanSub = selectedSubdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      const fullDomain = `${cleanSub}.${settings.baseDomain}`;
      const prefix = `tenant_${cleanSub}_mod_`;
      const txnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Provision GoDaddy DNS
      await GoDaddyDnsService.provisionSubdomainDns({
        subdomain: cleanSub,
        baseDomain: settings.baseDomain,
        dnsMode: settings.godaddyDnsMode,
        apiKey: settings.godaddyApiKey,
        apiSecret: settings.godaddyApiSecret,
      });

      // 2. Save in Database
      const tenant = await StorefrontService.provisionNewTenant({
        subdomain: cleanSub,
        fullDomain,
        clientName: customerInfo.businessName || `עסק ${cleanSub}`,
        ownerEmail: customerInfo.email,
        ownerPhone: customerInfo.phone,
        activeModules: cart.map(c => c.moduleId),
        collectionPrefix: prefix,
        billingPlan,
        monthlyTotal: totalMonthly,
        paymentTransactionId: txnId,
      });

      // 3. Decoupled CRM Contact Creation via EventBus (Zero Spaghetti Cross-Coupling)
      try {
        const leadPayload: LeadPayload = {
          conta_name: customerInfo.fullName || customerInfo.businessName || `לקוח סאב-דומיין ${cleanSub}`,
          conta_phone: customerInfo.phone || '050-0000000',
          email: customerInfo.email || `${cleanSub}@example.com`,
          source: `רכישת סאב-דומיין (${fullDomain})`,
          tags: [
            'לקוח משלם 💳',
            `סאב-דומיין: ${cleanSub}`,
            billingPlan === 'annual' ? 'מנוי שנתי (חיסכון 20%)' : 'מנוי חודשי',
            ...cart.map(c => `רכיב: ${c.name}`),
          ],
          community: 'דיירי מערכת SaaS',
          metadata: {
            subdomain: cleanSub,
            fullDomain,
            businessName: customerInfo.businessName,
            billingPlan,
            monthlyTotal: totalMonthly,
            annualTotal: billingPlan === 'annual' ? totalMonthly * 12 : totalMonthly,
            transactionId: txnId,
            activeModules: cart.map(c => c.moduleId),
            purchasedAt: tenant.createdAt,
          },
        };
        eventBus.publish('crm:lead:created', leadPayload);
        console.log(`[Storefront -> CRM] Contact event emitted for ${cleanSub}:`, leadPayload);
      } catch (evtErr) {
        console.warn('[Storefront] CRM EventBus emit notice:', evtErr);
      }

      setProvisionedTenant(tenant);
      setViewMode('success_provisioned');
      return tenant;
    } catch (err) {
      console.error('Failed provisioning tenant:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetStorefront = () => {
    setCart([]);
    setSelectedSubdomain('');
    setProvisionedTenant(null);
    setTrialActiveModule(null);
    setViewMode('catalog');
  };

  return (
    <StorefrontContext.Provider
      value={{
        catalog,
        settings,
        cart,
        billingPlan,
        viewMode,
        trialActiveModule,
        customerInfo,
        selectedSubdomain,
        provisionedTenant,
        isProcessing,
        totalMonthly,
        totalAnnualSavings,
        setViewMode,
        setBillingPlan,
        toggleCartItem,
        isInCart,
        clearCart,
        startTrial,
        endTrial,
        endTrialAndQuickBuy,
        setCustomerInfo,
        setSelectedSubdomain,
        updateCatalogItem,
        updateSettings,
        completeCheckoutAndProvision,
        resetStorefront,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
};

export const useStorefront = (): StorefrontContextType => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }
  return context;
};

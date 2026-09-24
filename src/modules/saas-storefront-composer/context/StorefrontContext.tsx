import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BillingInterval, 
  CartItem, 
  ModulePricingConfig, 
  StorefrontGeneralSettings, 
  StorefrontViewMode, 
  TenantCustomerInfo, 
  TenantRecord,
  AiSalesOptimizationInput,
  AiSalesOptimizationResult
} from '../types';
import { StorefrontService } from '../services/storefrontService';
import { GoDaddyDnsService } from '../services/godaddyDnsService';
import { SaasSalesFormBridge } from '../services/saasSalesFormBridge';
import { AiSalesAgentService } from '../services/aiSalesAgentService';
import { TenantWelcomeNotificationService, WelcomeDispatchResult } from '../services/tenantWelcomeNotificationService';
import { SmartFormDefinition } from '../../smart-form-builder/types';
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
  lastDispatchResult: WelcomeDispatchResult | null;
  isProcessing: boolean;
  totalMonthly: number;
  totalAnnualSavings: number;
  
  // Proposal & AI Sales Agent
  activeProposalForm: SmartFormDefinition | null;
  aiOptimizationResult: AiSalesOptimizationResult | null;
  isOptimizingAi: boolean;
  generateOrGetProposalForm: () => SmartFormDefinition;
  updateProposalForm: (updated: SmartFormDefinition) => void;
  runAiOptimization: (input?: Partial<AiSalesOptimizationInput>) => Promise<AiSalesOptimizationResult>;
  askAiSalesCopilot: (query: string) => Promise<string>;

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
  completeCheckoutAndProvision: (overrideSubdomain?: string, discoveryData?: Record<string, any>) => Promise<TenantRecord | null>;
  resendWelcomeNotifications: () => Promise<WelcomeDispatchResult | null>;
  resetStorefront: () => void;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

export const StorefrontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<ModulePricingConfig[]>(() => StorefrontService.getCatalog());
  const [settings, setSettings] = useState<StorefrontGeneralSettings>(() => StorefrontService.getSettings());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [billingPlan, setBillingPlanState] = useState<BillingInterval>('monthly');
  const [viewMode, setViewMode] = useState<StorefrontViewMode>('catalog');
  const [trialActiveModule, setTrialActiveModule] = useState<ModulePricingConfig | null>(null);
  const [selectedSubdomain, setSelectedSubdomain] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [provisionedTenant, setProvisionedTenant] = useState<TenantRecord | null>(null);
  const [lastDispatchResult, setLastDispatchResult] = useState<WelcomeDispatchResult | null>(null);
  const [activeProposalForm, setActiveProposalForm] = useState<SmartFormDefinition | null>(null);
  const [aiOptimizationResult, setAiOptimizationResult] = useState<AiSalesOptimizationResult | null>(null);
  const [isOptimizingAi, setIsOptimizingAi] = useState(false);

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

  const setBillingPlan = (plan: BillingInterval) => {
    setBillingPlanState(plan);
    setActiveProposalForm(null);
    setAiOptimizationResult(null);
  };

  const toggleCartItem = (module: ModulePricingConfig) => {
    setActiveProposalForm(null);
    setAiOptimizationResult(null);
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

  const clearCart = () => {
    setCart([]);
    setActiveProposalForm(null);
    setAiOptimizationResult(null);
  };

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

  const completeCheckoutAndProvision = async (
    overrideSubdomain?: string,
    discoveryData?: Record<string, any>
  ): Promise<TenantRecord | null> => {
    const targetSub = overrideSubdomain || selectedSubdomain;
    if (!targetSub || cart.length === 0) return null;

    setIsProcessing(true);
    try {
      const cleanSub = targetSub.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
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

      // 2. Save in Database with ONLY selected modules from cart
      const activeModuleIds = Array.from(new Set(cart.map(c => c.moduleId)));
      const tenant = await StorefrontService.provisionNewTenant({
        subdomain: cleanSub,
        fullDomain,
        clientName: customerInfo.businessName || `עסק ${cleanSub}`,
        ownerEmail: customerInfo.email,
        ownerPhone: customerInfo.phone,
        activeModules: activeModuleIds,
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
            activeModules: activeModuleIds,
            purchasedAt: tenant.createdAt,
            discoveryAnswers: discoveryData || {},
          },
        };
        eventBus.publish('crm:lead:created', leadPayload);
        console.log(`[Storefront -> CRM] Contact event emitted for ${cleanSub}:`, leadPayload);
      } catch (evtErr) {
        console.warn('[Storefront] CRM EventBus emit notice:', evtErr);
      }

      // 4. Send Welcome WhatsApp & Official Email Receipt with Credentials
      try {
        const dispatchResult = await TenantWelcomeNotificationService.sendWelcomeAndReceipt(tenant);
        setLastDispatchResult(dispatchResult);
        console.log(`[Storefront] Welcome notification dispatch result:`, dispatchResult);
      } catch (notifErr) {
        console.warn('[Storefront] Welcome notification dispatch notice:', notifErr);
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

  const resendWelcomeNotifications = async (): Promise<WelcomeDispatchResult | null> => {
    if (!provisionedTenant) return null;
    try {
      const res = await TenantWelcomeNotificationService.sendWelcomeAndReceipt(provisionedTenant);
      setLastDispatchResult(res);
      return res;
    } catch (e) {
      console.warn('Failed resending notifications:', e);
      return null;
    }
  };

  const generateOrGetProposalForm = (): SmartFormDefinition => {
    if (activeProposalForm) {
      return activeProposalForm;
    }
    const generated = SaasSalesFormBridge.generateProposalFormDefinition({
      cart,
      billingPlan,
      totalMonthly,
      subdomain: selectedSubdomain,
      baseDomain: settings.baseDomain,
      customerInfo,
    });
    SaasSalesFormBridge.saveProposalForm(generated);
    setActiveProposalForm(generated);
    return generated;
  };

  const updateProposalForm = (updated: SmartFormDefinition) => {
    setActiveProposalForm(updated);
    SaasSalesFormBridge.saveProposalForm(updated);
  };

  const runAiOptimization = async (overrideInput?: Partial<AiSalesOptimizationInput>): Promise<AiSalesOptimizationResult> => {
    setIsOptimizingAi(true);
    try {
      const input: AiSalesOptimizationInput = {
        businessName: overrideInput?.businessName || customerInfo.businessName || customerInfo.fullName || 'עסק דיגיטלי',
        industry: overrideInput?.industry || 'כללי',
        cartModules: cart.map(c => c.name),
        subdomain: selectedSubdomain,
        billingPlan,
        monthlyTotal: totalMonthly,
        customerNotes: overrideInput?.customerNotes || '',
        teamSize: overrideInput?.teamSize || '1-10',
        budgetRange: overrideInput?.budgetRange || '',
      };

      const result = await AiSalesAgentService.analyzeCustomerAndOptimizeProposal(input);
      setAiOptimizationResult(result);

      // Also refine active proposal form if exists
      const currentForm = activeProposalForm || generateOrGetProposalForm();
      const refined = AiSalesAgentService.refineFormDefinitionWithAi(currentForm, result);
      updateProposalForm(refined);

      return result;
    } finally {
      setIsOptimizingAi(false);
    }
  };

  const askAiSalesCopilot = async (query: string): Promise<string> => {
    return AiSalesAgentService.askSalesAgentCopilot(query, {
      businessName: customerInfo.businessName || customerInfo.fullName,
      cartModules: cart.map(c => c.name),
      totalMonthly,
      billingPlan: billingPlan === 'annual' ? 'שנתי (חיסכון 20%)' : 'חודשי',
      subdomain: selectedSubdomain ? `${selectedSubdomain}.${settings.baseDomain}` : undefined,
    });
  };

  const resetStorefront = () => {
    setCart([]);
    setSelectedSubdomain('');
    setProvisionedTenant(null);
    setTrialActiveModule(null);
    setActiveProposalForm(null);
    setAiOptimizationResult(null);
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
        lastDispatchResult,
        isProcessing,
        totalMonthly,
        totalAnnualSavings,
        activeProposalForm,
        aiOptimizationResult,
        isOptimizingAi,
        generateOrGetProposalForm,
        updateProposalForm,
        runAiOptimization,
        askAiSalesCopilot,
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
        resendWelcomeNotifications,
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

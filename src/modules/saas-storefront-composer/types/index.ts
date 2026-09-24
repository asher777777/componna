export type BillingInterval = 'monthly' | 'annual';

export interface ModulePricingConfig {
  id: string;
  name: string;
  category: 'core' | 'marketing' | 'sales' | 'media' | 'communication' | 'automation';
  description: string;
  longDescription?: string;
  iconName: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  setupFee?: number;
  isPublished: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  badgeText?: string;
  trialAllowed: boolean;
  trialDurationMinutes?: number;
  featuresList: string[];
  mockStats?: {
    usersCount?: string;
    satisfaction?: string;
  };
}

export type DnsProviderType = 'hostinger' | 'godaddy' | 'cloudflare' | 'custom_wildcard';

export interface StorefrontGeneralSettings {
  baseDomain: string; // e.g. 'glowmanage.com' or 'myplatform.co.il'
  platformName: string;
  currencySymbol: string;
  supportPhone?: string;
  supportEmail?: string;
  dnsProvider: DnsProviderType;
  hostingerApiToken?: string;
  godaddyApiKey?: string;
  godaddyApiSecret?: string;
  godaddyDnsMode: 'wildcard' | 'api_cname';
  wildcardVerified: boolean;
}

export interface CartItem {
  moduleId: string;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  iconName: string;
}

export interface TenantCustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
}

export interface TenantRecord {
  subdomain: string; // First word only e.g. 'fitness'
  fullDomain: string; // 'fitness.glowmanage.com'
  clientName: string;
  ownerEmail: string;
  ownerPhone: string;
  activeModules: string[];
  collectionPrefix: string; // 'tenant_fitness_mod_'
  billingPlan: BillingInterval;
  monthlyTotal: number;
  paymentTransactionId: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export type StorefrontViewMode = 
  | 'catalog'
  | 'sandbox_trial'
  | 'checkout'
  | 'subdomain_picker'
  | 'success_provisioned'
  | 'admin_pricing';

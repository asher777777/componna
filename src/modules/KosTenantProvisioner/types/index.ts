/**
 * KosTenantProvisioner Types
 * Definition of tenant accounts, module provisioning, and credentials.
 */

export interface TenantAccount {
  subdomain: string;
  fullDomain: string;
  clientName: string;
  adminUsername: string;
  adminPassword?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  activeModules: string[];
  collectionPrefix: string;
  status: 'active' | 'suspended' | 'draft';
  createdAt: string;
  updatedAt: string;
  billingPlan?: 'monthly' | 'annual' | 'custom';
  monthlyTotal?: number;
  notes?: string;
}

export interface AvailableModuleOption {
  id: string;
  name: string;
  englishPrefix: string;
  englishRest: string;
  description: string;
  category: 'core' | 'marketing' | 'sales' | 'media' | 'crm';
  badgeColor: string;
  defaultIncluded?: boolean;
}

export interface TenantProvisionFormState {
  subdomain: string;
  clientName: string;
  adminUsername: string;
  adminPassword: string;
  ownerEmail?: string;
  ownerPhone?: string;
  selectedModules: string[];
  billingPlan: 'monthly' | 'annual';
  notes?: string;
}

export interface TenantAuthCredentials {
  subdomain: string;
  username: string;
  passwordHash?: string;
  plainPassword?: string; // Stored securely for admin retrieval in backoffice
  updatedAt: string;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  avgModulesPerTenant: number;
  mostPopularModule: string;
}

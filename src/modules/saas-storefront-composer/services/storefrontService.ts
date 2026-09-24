import { ModulePricingConfig, StorefrontGeneralSettings, TenantRecord } from '../types';
import { DEFAULT_GENERAL_SETTINGS, INITIAL_MODULE_PRICING_CATALOG } from '../config';

const STORAGE_KEYS = {
  CATALOG: 'comona_saas_catalog_v1',
  SETTINGS: 'comona_saas_settings_v1',
  TENANTS: 'comona_saas_tenants_v1',
};

export class StorefrontService {
  /**
   * Load current module catalog with custom pricing & visibility
   */
  static getCatalog(): ModulePricingConfig[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATALOG);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading catalog from storage, using defaults', e);
    }
    return INITIAL_MODULE_PRICING_CATALOG;
  }

  /**
   * Save catalog modifications from Admin panel
   */
  static saveCatalog(catalog: ModulePricingConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
  }

  /**
   * Load general settings (base domain, godaddy config, currency)
   */
  static getSettings(): StorefrontGeneralSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading settings from storage, using defaults', e);
    }
    return DEFAULT_GENERAL_SETTINGS;
  }

  /**
   * Save general settings from Admin panel
   */
  static saveSettings(settings: StorefrontGeneralSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Check if a subdomain (first word) is available
   */
  static async checkSubdomainAvailability(subdomain: string): Promise<{
    available: boolean;
    cleanSubdomain: string;
    reason?: string;
  }> {
    const clean = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    if (!clean || clean.length < 3) {
      return { available: false, cleanSubdomain: clean, reason: 'הסאב-דומיין חייב להכיל לפחות 3 תווים באנגלית' };
    }

    const reserved = ['www', 'admin', 'api', 'app', 'dashboard', 'mail', 'ftp', 'root', 'sys', 'system'];
    if (reserved.includes(clean)) {
      return { available: false, cleanSubdomain: clean, reason: 'סאב-דומיין זה שמור על ידי המערכת' };
    }

    const tenants = this.getAllTenants();
    const isTaken = tenants.some(t => t.subdomain.toLowerCase() === clean);
    
    if (isTaken) {
      return { available: false, cleanSubdomain: clean, reason: 'סאב-דומיין זה כבר תפוס על ידי לקוח אחר' };
    }

    return { available: true, cleanSubdomain: clean };
  }

  /**
   * Get all registered tenants
   */
  static getAllTenants(): TenantRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TENANTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading tenants from storage', e);
    }
    return [
      {
        subdomain: 'demo',
        fullDomain: 'demo.glowmanage.com',
        clientName: 'הדגמת מערכת Comona',
        ownerEmail: 'demo@glowmanage.com',
        ownerPhone: '050-0000000',
        activeModules: ['crm-analytics', 'page-builder', 'smart-form-builder', 'media-gallery-hub'],
        collectionPrefix: 'tenant_demo_mod_',
        billingPlan: 'annual',
        monthlyTotal: 346,
        paymentTransactionId: 'TXN-DEMO-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  }

  /**
   * Provision and save a new tenant
   */
  static async provisionNewTenant(record: Omit<TenantRecord, 'status' | 'createdAt' | 'updatedAt'>): Promise<TenantRecord> {
    const newTenant: TenantRecord = {
      ...record,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentTenants = this.getAllTenants();
    const updated = [newTenant, ...currentTenants.filter(t => t.subdomain !== newTenant.subdomain)];
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(updated));

    // Also register in Firestore if online
    console.log(`[Provisioning] Tenant registered: ${newTenant.fullDomain} with collection prefix: ${newTenant.collectionPrefix}`);
    return newTenant;
  }
}

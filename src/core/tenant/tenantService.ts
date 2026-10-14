import { Firestore, collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TenantRecord } from '../contracts';
import { ROOT_TENANT_ID } from './tenantResolver';

export const TENANT_REGISTRY_STORAGE_KEY = 'kosun_provisioned_tenants_registry_v1';

export class TenantCoreService {
  /**
   * Read locally cached tenant list
   */
  static getLocalTenants(): TenantRecord[] {
    try {
      const raw = localStorage.getItem(TENANT_REGISTRY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  }

  /**
   * Save local cache of tenants
   */
  static saveLocalTenants(tenants: TenantRecord[]): void {
    try {
      localStorage.setItem(TENANT_REGISTRY_STORAGE_KEY, JSON.stringify(tenants));
    } catch {}
  }

  /**
   * Fetch all tenants from Firestore and merge with master contacts & local cache
   */
  static async getAllTenants(db?: Firestore): Promise<TenantRecord[]> {
    const localList = this.getLocalTenants();
    const map = new Map<string, TenantRecord>();
    localList.forEach((t) => map.set(t.subdomain.toLowerCase(), t));

    if (db) {
      try {
        // 1. Load from tenants collection
        const snap = await getDocs(collection(db, 'tenants'));
        for (const docSnap of snap.docs) {
          const d = docSnap.data();
          const sub = docSnap.id.toLowerCase();
          if (sub === ROOT_TENANT_ID || sub === 'www' || sub === 'admin' || sub === '_master') continue;

          map.set(sub, {
            subdomain: sub,
            fullDomain: d.fullDomain || `${sub}.kosun.pro`,
            clientName: d.clientName || `עסק ${sub}`,
            ownerEmail: d.ownerEmail || d.adminUsername || `${sub}@kosun.pro`,
            ownerPhone: d.ownerPhone || '050-0000000',
            activeModules: Array.isArray(d.activeModules) ? d.activeModules : ['KosWebAi', 'KSF'],
            collectionPrefix: d.collectionPrefix || `tenant_${sub}_mod_`,
            billingPlan: d.billingPlan || 'monthly',
            monthlyTotal: d.monthlyTotal || 0,
            paymentTransactionId: d.paymentTransactionId || '',
            status: d.status || 'active',
            createdAt: d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt || new Date().toISOString(),
            adminUsername: d.adminUsername,
            adminPassword: d.adminPassword,
            notes: d.notes,
          });
        }
      } catch (err) {
        console.warn('[TenantCoreService] Firestore tenants fetch warning:', err);
      }

      try {
        // 2. Also load from master contacts collection to link sub-tenant management to contacts
        const masterContactsCol = collection(db, 'tenants', '_master', 'contacts');
        const contactsSnap = await getDocs(masterContactsCol);
        for (const cDoc of contactsSnap.docs) {
          const cd = cDoc.data();
          if (cd.subdomain && (cd.isSubdomainAdmin || cd.isUser)) {
            const sub = cd.subdomain.toLowerCase().trim();
            if (sub === ROOT_TENANT_ID || sub === 'www' || sub === 'admin' || sub === '_master') continue;
            
            const existing = map.get(sub);
            map.set(sub, {
              subdomain: sub,
              fullDomain: cd.fullDomain || existing?.fullDomain || `${sub}.kosun.pro`,
              clientName: cd.company_name || cd.kosun_crm_name || cd.conta_name || existing?.clientName || `עסק ${sub}`,
              ownerEmail: cd.kosun_crm_email || cd.email || existing?.ownerEmail || `${sub}@kosun.pro`,
              ownerPhone: cd.kosun_crm_phone || cd.conta_phone || existing?.ownerPhone || '050-0000000',
              activeModules: Array.isArray(cd.activeModules) ? cd.activeModules : (existing?.activeModules || ['KosWebAi', 'KSF']),
              collectionPrefix: `tenant_${sub}_mod_`,
              billingPlan: cd.billingPlan || existing?.billingPlan || 'monthly',
              monthlyTotal: cd.monthlyTotal || existing?.monthlyTotal || 0,
              paymentTransactionId: existing?.paymentTransactionId || '',
              status: cd.tenantStatus || cd.status || existing?.status || 'active',
              createdAt: cd.createdAt || existing?.createdAt || new Date().toISOString(),
              updatedAt: cd.updatedAt || existing?.updatedAt || new Date().toISOString(),
              adminUsername: cd.adminUsername || existing?.adminUsername || `${sub}@kosun.pro`,
              adminPassword: cd.adminPassword || existing?.adminPassword || 'Ks@1234',
              notes: cd.subdomainNotes || existing?.notes || '',
            });
          }
        }
      } catch (err) {
        console.warn('[TenantCoreService] Master contacts fetch warning:', err);
      }
    }

    // Default demo tenant if empty
    if (map.size === 0) {
      const demoTenant: TenantRecord = {
        subdomain: 'demo',
        fullDomain: 'demo.kosun.pro',
        clientName: 'עסק הדגמה (Demo)',
        ownerEmail: 'demo@kosun.pro',
        ownerPhone: '050-0000000',
        activeModules: ['KosWebAi', 'KSF', 'KosWhatsUp', 'crm-analytics'],
        collectionPrefix: 'tenant_demo_mod_',
        billingPlan: 'annual',
        monthlyTotal: 299,
        paymentTransactionId: 'TXN-DEMO',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminUsername: 'demo@kosun.pro',
        adminPassword: 'DemoPassword2026!',
        notes: 'סאב-דומיין הדגמה רשמי',
      };
      map.set('demo', demoTenant);
    }

    const result = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.saveLocalTenants(result);
    return result;
  }

  /**
   * Find tenant for user by phone or email
   */
  static findTenantForUser(queryVal: string): TenantRecord | null {
    if (!queryVal) return null;
    const clean = queryVal.trim().toLowerCase();
    const cleanDigits = queryVal.replace(/[^0-9]/g, '');
    const list = this.getLocalTenants();

    for (const t of list) {
      if (t.ownerEmail && t.ownerEmail.toLowerCase() === clean) return t;
      if (t.adminUsername && t.adminUsername.toLowerCase() === clean) return t;
      if (t.ownerPhone && cleanDigits.length >= 7 && t.ownerPhone.replace(/[^0-9]/g, '').includes(cleanDigits)) {
        return t;
      }
      if (t.subdomain.toLowerCase() === clean) return t;
    }
    return null;
  }
}

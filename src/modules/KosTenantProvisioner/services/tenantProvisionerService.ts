import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { TenantAccount, TenantProvisionFormState, AvailableModuleOption } from '../types';
import { StorefrontService } from '../../saas-storefront-composer/services/storefrontService';
import { eventBus } from '../../../core/bridge/EventBus';

export const AVAILABLE_MODULES_CATALOG: AvailableModuleOption[] = [
  {
    id: 'KosWebAi',
    name: 'יוצר עמודים ואתרים',
    englishPrefix: 'Kos',
    englishRest: 'WebAi',
    description: 'עיצוב עמודי נחיתה מתקדמים, בלוקים ואתרים מותאמים אישית',
    category: 'marketing',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    defaultIncluded: true,
  },
  {
    id: 'KSF',
    name: 'מחולל טפסים ושאלונים',
    englishPrefix: 'KS',
    englishRest: 'F',
    description: 'טפסי הרשמה, שאלוני התאמה וטפסי לידים חכמים',
    category: 'marketing',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    defaultIncluded: true,
  },
  {
    id: 'KosWhatsUp',
    name: 'וואטסאפ בוטים ו-CRM',
    englishPrefix: 'Kos',
    englishRest: 'WhatsUp',
    description: 'שיגור אוטומטי, בוטים חכמים, ניהול סטטוסים ותקשורת לקוחות',
    category: 'sales',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    defaultIncluded: true,
  },
  {
    id: 'crm-analytics',
    name: 'אנליטיקה ו-CRM',
    englishPrefix: 'CRM',
    englishRest: 'Analytics',
    description: 'כרטיסי לקוח, ניהול לידים, דוחות גרפיים ומעקב מכירות',
    category: 'crm',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    defaultIncluded: true,
  },
  {
    id: 'kesher-payments-hub',
    name: 'סליקה וקבלות קשר',
    englishPrefix: 'Kos',
    englishRest: 'Pay',
    description: 'סליקת אשראי וביט, הפקת קבלות וחשבוניות אוטומטיות',
    category: 'sales',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    defaultIncluded: false,
  },
  {
    id: 'KosTogether',
    name: 'קהילות וקבוצות חכמות',
    englishPrefix: 'Kos',
    englishRest: 'Together',
    description: 'ניהול קהילות, חדרים וירטואליים, קבוצות ומעורבות חברים',
    category: 'crm',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    defaultIncluded: false,
  },
  {
    id: 'media-gallery-hub',
    name: 'מאגר מדיה וענן',
    englishPrefix: 'Kos',
    englishRest: 'Media',
    description: 'אחסון קבצים, תמונות, סרטונים ויצירת תמונות בבינה מלאכותית',
    category: 'media',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    defaultIncluded: true,
  },
  {
    id: 'kosun-am',
    name: 'דיוור אוטומטי במייל',
    englishPrefix: 'Kos',
    englishRest: 'Am',
    description: 'מערכת ניוזלטרים, אוטומציות דוא״ל ומסעות לקוח',
    category: 'marketing',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    defaultIncluded: false,
  },
  {
    id: 'kosun-board-composer',
    name: 'מחולל לוחות בקרה AI',
    englishPrefix: 'Kos',
    englishRest: 'Board',
    description: 'הרכבת דשבורדים ומערכות ניהול מותאמות אישית לעסק',
    category: 'core',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    defaultIncluded: false,
  },
  {
    id: 'video-producer-studio',
    name: 'סטודיו וידאו ואווטאר',
    englishPrefix: 'Kos',
    englishRest: 'Video',
    description: 'הפקת סרטונים אינטראקטיביים עם אווטארים מדברים',
    category: 'media',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    defaultIncluded: false,
  },
  {
    id: 'flow-player-engine',
    name: 'נגן זרימה אינטראקטיבי',
    englishPrefix: 'Flow',
    englishRest: 'Player',
    description: 'נגן מסלולים אינטראקטיביים, שאלונים והמרות וידאו',
    category: 'marketing',
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    defaultIncluded: false,
  },
];

const LOCAL_STORAGE_KEY = 'kosun_provisioned_tenants_registry_v1';

export class TenantProvisionerService {
  /**
   * Load all tenants from Firestore and merge with local cache
   */
  static async getAllTenants(db?: Firestore): Promise<TenantAccount[]> {
    const localTenants = this.getLocalTenants();
    const map = new Map<string, TenantAccount>();
    localTenants.forEach((t) => map.set(t.subdomain.toLowerCase(), t));

    if (db) {
      try {
        const snap = await getDocs(collection(db, 'tenants'));
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          const sub = docSnap.id.toLowerCase();
          if (sub === '_master' || sub === 'www' || sub === 'admin') continue;

          let adminPassword = data.adminPassword || '';
          if (!adminPassword) {
            try {
              const credDoc = await getDoc(doc(db, 'tenants', sub, 'settings', 'auth_credentials'));
              if (credDoc.exists()) {
                adminPassword = credDoc.data().plainPassword || '';
              }
            } catch {}
          }

          const record: TenantAccount = {
            subdomain: sub,
            fullDomain: data.fullDomain || `${sub}.kosun.pro`,
            clientName: data.clientName || `עסק ${sub}`,
            adminUsername: data.ownerEmail || data.adminUsername || `${sub}@kosun.pro`,
            adminPassword: adminPassword || (map.get(sub)?.adminPassword ?? 'Ks@1234'),
            ownerEmail: data.ownerEmail,
            ownerPhone: data.ownerPhone,
            activeModules: Array.isArray(data.activeModules) ? data.activeModules : ['KosWebAi', 'KSF'],
            collectionPrefix: data.collectionPrefix || `tenant_${sub}_mod_`,
            status: data.status || 'active',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            billingPlan: data.billingPlan || 'monthly',
            monthlyTotal: data.monthlyTotal || 0,
            notes: data.notes || '',
          };
          map.set(sub, record);
        }
      } catch (err) {
        console.warn('[TenantProvisionerService] Remote fetch warning:', err);
      }
    }

    // Include demo tenant if empty
    if (map.size === 0) {
      const demo: TenantAccount = {
        subdomain: 'demo',
        fullDomain: 'demo.kosun.pro',
        clientName: 'עסק הדגמה (Demo)',
        adminUsername: 'demo@kosun.pro',
        adminPassword: 'DemoPassword2026!',
        ownerEmail: 'demo@kosun.pro',
        ownerPhone: '050-0000000',
        activeModules: ['KosWebAi', 'KSF', 'KosWhatsUp', 'crm-analytics'],
        collectionPrefix: 'tenant_demo_mod_',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        billingPlan: 'annual',
        monthlyTotal: 299,
        notes: 'סאב-דומיין הדגמה רשמי',
      };
      map.set('demo', demo);
    }

    const result = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    this.saveLocalTenants(result);
    return result;
  }

  /**
   * Provision and save a new tenant with active modules and credentials
   */
  static async createTenant(
    db: Firestore | undefined,
    form: TenantProvisionFormState
  ): Promise<TenantAccount> {
    const cleanSub = form.subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleanSub || cleanSub.length < 3) {
      throw new Error('שם הסאב-דומיין חייב להכיל לפחות 3 תווים באנגלית או ספרות');
    }

    const reserved = ['www', 'app', 'api', 'admin', 'system', 'sys', 'mail', '_master', 'dashboard'];
    if (reserved.includes(cleanSub)) {
      throw new Error('סאב-דומיין זה שמור על ידי המערכת');
    }

    const newRecord: TenantAccount = {
      subdomain: cleanSub,
      fullDomain: `${cleanSub}.kosun.pro`,
      clientName: form.clientName.trim() || `עסק ${cleanSub}`,
      adminUsername: form.adminUsername.trim() || `${cleanSub}@kosun.pro`,
      adminPassword: form.adminPassword.trim() || 'Ks@1234',
      ownerEmail: form.ownerEmail?.trim() || form.adminUsername.trim(),
      ownerPhone: form.ownerPhone?.trim() || '050-0000000',
      activeModules: form.selectedModules.length > 0 ? form.selectedModules : ['KosWebAi', 'KSF'],
      collectionPrefix: `tenant_${cleanSub}_mod_`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      billingPlan: form.billingPlan,
      notes: form.notes || '',
    };

    // 1. Save locally
    const current = this.getLocalTenants();
    const updatedList = [newRecord, ...current.filter((t) => t.subdomain !== cleanSub)];
    this.saveLocalTenants(updatedList);

    // 2. Synchronize with StorefrontService
    try {
      StorefrontService.provisionNewTenant({
        subdomain: newRecord.subdomain,
        fullDomain: newRecord.fullDomain,
        clientName: newRecord.clientName,
        ownerEmail: newRecord.ownerEmail || newRecord.adminUsername,
        ownerPhone: newRecord.ownerPhone || '050-0000000',
        activeModules: newRecord.activeModules,
        collectionPrefix: newRecord.collectionPrefix,
        billingPlan: newRecord.billingPlan === 'annual' ? 'annual' : 'monthly',
        monthlyTotal: 0,
        paymentTransactionId: `PROV-${Date.now()}`,
      }).catch(console.warn);
    } catch {}

    // 3. Save to Firestore (tenants/{subdomain} & credentials)
    if (db) {
      try {
        const tenantDocRef = doc(db, 'tenants', cleanSub);
        await setDoc(tenantDocRef, {
          ...newRecord,
          id: cleanSub,
        }, { merge: true });

        // Save secure credentials document
        const credRef = doc(db, 'tenants', cleanSub, 'settings', 'auth_credentials');
        await setDoc(credRef, {
          subdomain: cleanSub,
          username: newRecord.adminUsername,
          plainPassword: newRecord.adminPassword,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        // Initialize clean isolated brand DNA for this tenant
        const brandRef = doc(db, 'tenants', cleanSub, 'settings', 'kos_branding_dna');
        await setDoc(brandRef, {
          identity: {
            brandName: newRecord.clientName,
            tagline: 'פתרונות דיגיטליים מתקדמים',
            primaryColor: '#6366f1',
            accentColor: '#0ea5e9',
          },
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        console.info(`[TenantProvisionerService] Tenant ${cleanSub} successfully provisioned on Firestore.`);
      } catch (err) {
        console.warn('[TenantProvisionerService] Remote Firestore provisioning warning:', err);
      }
    }

    eventBus.emit('tenant:provisioned', newRecord);

    return newRecord;
  }

  /**
   * Update active modules loaded into a tenant
   */
  static async updateTenantModules(
    db: Firestore | undefined,
    subdomain: string,
    activeModules: string[]
  ): Promise<void> {
    const cleanSub = subdomain.trim().toLowerCase();
    const current = this.getLocalTenants();
    const found = current.find((t) => t.subdomain === cleanSub);
    if (found) {
      found.activeModules = activeModules;
      found.updatedAt = new Date().toISOString();
      this.saveLocalTenants(current);
      eventBus.emit('tenant:updated', { ...found, activeModules });
    }

    if (db) {
      try {
        const tenantDocRef = doc(db, 'tenants', cleanSub);
        await setDoc(tenantDocRef, {
          activeModules,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('[TenantProvisionerService] Firestore module update warning:', err);
      }
    }
  }

  /**
   * Update tenant credentials (username & password)
   */
  static async updateTenantCredentials(
    db: Firestore | undefined,
    subdomain: string,
    credentials: { username: string; password: string }
  ): Promise<void> {
    const cleanSub = subdomain.trim().toLowerCase();
    const current = this.getLocalTenants();
    const found = current.find((t) => t.subdomain === cleanSub);
    if (found) {
      found.adminUsername = credentials.username;
      found.adminPassword = credentials.password;
      found.updatedAt = new Date().toISOString();
      this.saveLocalTenants(current);
      eventBus.emit('tenant:updated', { ...found, adminUsername: credentials.username, adminPassword: credentials.password });
    }

    if (db) {
      try {
        const credRef = doc(db, 'tenants', cleanSub, 'settings', 'auth_credentials');
        await setDoc(credRef, {
          subdomain: cleanSub,
          username: credentials.username,
          plainPassword: credentials.password,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        const tenantDocRef = doc(db, 'tenants', cleanSub);
        await setDoc(tenantDocRef, {
          adminUsername: credentials.username,
          adminPassword: credentials.password,
          ownerEmail: credentials.username,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('[TenantProvisionerService] Firestore credentials update warning:', err);
      }
    }
  }

  /**
   * Suspend or delete a tenant
   */
  static async deleteTenant(db: Firestore | undefined, subdomain: string): Promise<void> {
    const cleanSub = subdomain.trim().toLowerCase();
    const current = this.getLocalTenants().filter((t) => t.subdomain !== cleanSub);
    this.saveLocalTenants(current);

    if (db) {
      try {
        const tenantDocRef = doc(db, 'tenants', cleanSub);
        await updateDoc(tenantDocRef, { status: 'suspended', updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('[TenantProvisionerService] Firestore delete warning:', err);
      }
    }
  }

  // LocalStorage caching helpers
  private static getLocalTenants(): TenantAccount[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [];
  }

  private static saveLocalTenants(tenants: TenantAccount[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tenants));
    } catch {}
  }
}

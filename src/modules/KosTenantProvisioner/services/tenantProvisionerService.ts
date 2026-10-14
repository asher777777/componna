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
import { eventBus } from '../../../core/bridge/EventBus';
import { tenantContactSyncService } from '../../crm-analytics/services/tenantContactSyncService';
import { TenantTokenTracker } from '../../../core/ai/tenantTokenTracker';
import { DEFAULT_SUBDOMAIN_MODULES } from '../../../core/tenant/tenantResolver';
import { createTenantInitialBrandDna } from '../../KosBranding/services/brandDnaFirestore';

export const AVAILABLE_MODULES_CATALOG: AvailableModuleOption[] = [
  {
    id: 'KosBranding',
    name: 'מרכז המיתוג ושפת המותג (Brand DNA)',
    englishPrefix: 'Kos',
    englishRest: 'Branding',
    description: 'זהות עסקית, צבעי מותג, סלוגן, קהלי יעד וסנכרון שפת המותג',
    category: 'core',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    defaultIncluded: true,
  },
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
  {
    id: 'kosai-engine',
    name: 'מנוע בינה מלאכותית וסוכנים',
    englishPrefix: 'Kos',
    englishRest: 'Ai',
    description: 'סוכני בינה מלאכותית, סיוע אוטומטי ואינטגרציות AI מתקדמות',
    category: 'core',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    defaultIncluded: true,
  },
  {
    id: 'KosTube',
    name: 'קושאן Tube - חיבור יוטיוב וקידום SEO מבוסס AI',
    englishPrefix: 'Kos',
    englishRest: 'Tube',
    description: 'סנכרון ערוץ יוטיוב, המרת סרטונים למאמרים ויצירת עמודי SEO',
    category: 'marketing',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    defaultIncluded: true,
  },
  {
    id: 'ambassador-campaigns-hub',
    name: 'ניהול שגרירים וקמפיינים',
    englishPrefix: 'Kos',
    englishRest: 'Campaigns',
    description: 'ניהול קמפיינים שיווקיים, שגרירים, מעקב הפניות ולידים',
    category: 'marketing',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
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
            activeModules: Array.isArray(data.activeModules) && data.activeModules.length > 0 ? data.activeModules : DEFAULT_SUBDOMAIN_MODULES,
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

      try {
        const masterContactsCol = collection(db, 'tenants', '_master', 'contacts');
        const cSnap = await getDocs(masterContactsCol);
        for (const cDoc of cSnap.docs) {
          const cd = cDoc.data();
          if (cd.subdomain && (cd.isSubdomainAdmin || cd.isUser)) {
            const sub = cd.subdomain.toLowerCase().trim();
            if (sub === '_master' || sub === 'www' || sub === 'admin') continue;
            const existing = map.get(sub);
            map.set(sub, {
              subdomain: sub,
              fullDomain: cd.fullDomain || existing?.fullDomain || `${sub}.kosun.pro`,
              clientName: cd.company_name || cd.kosun_crm_name || cd.conta_name || existing?.clientName || `עסק ${sub}`,
              adminUsername: cd.adminUsername || cd.email || existing?.adminUsername || `${sub}@kosun.pro`,
              adminPassword: cd.adminPassword || existing?.adminPassword || 'Ks@1234',
              ownerEmail: cd.kosun_crm_email || cd.email || existing?.ownerEmail || `${sub}@kosun.pro`,
              ownerPhone: cd.kosun_crm_phone || cd.conta_phone || existing?.ownerPhone || '050-0000000',
              activeModules: Array.isArray(cd.activeModules) && cd.activeModules.length > 0 ? cd.activeModules : (existing?.activeModules || DEFAULT_SUBDOMAIN_MODULES),
              collectionPrefix: existing?.collectionPrefix || `tenant_${sub}_mod_`,
              status: cd.tenantStatus || cd.status || existing?.status || 'active',
              createdAt: cd.createdAt || existing?.createdAt || new Date().toISOString(),
              updatedAt: cd.updatedAt || existing?.updatedAt || new Date().toISOString(),
              billingPlan: cd.billingPlan || existing?.billingPlan || 'monthly',
              monthlyTotal: cd.monthlyTotal || existing?.monthlyTotal || 0,
              notes: cd.subdomainNotes || existing?.notes || '',
            });
          }
        }
      } catch (err) {
        console.warn('[TenantProvisionerService] Master contacts fetch warning:', err);
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
        activeModules: DEFAULT_SUBDOMAIN_MODULES,
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
      activeModules: form.selectedModules.length > 0 ? form.selectedModules : DEFAULT_SUBDOMAIN_MODULES,
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

    // 2. Save to Firestore (tenants/{subdomain} & credentials)
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
        const initialBrandDna = createTenantInitialBrandDna(
          cleanSub,
          newRecord.clientName,
          newRecord.ownerPhone,
          newRecord.ownerEmail
        );
        await setDoc(brandRef, initialBrandDna, { merge: true });

        // Initialize isolated API keys doc under subdomain
        const keysRef = doc(db, 'tenants', cleanSub, 'settings', 'api_keys');
        await setDoc(keysRef, {
          geminiModel: 'gemini-3.8-flash',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }, { merge: true });

        // 4. Synchronize and create the CRM contact in subdomain contacts AND master contacts
        try {
          const contactPayload = {
            id: `tenant_admin_${cleanSub}`,
            status: 'active',
            contact_type: 'contact',
            isUser: true,
            isSubdomainAdmin: true,
            subdomain: cleanSub,
            fullDomain: newRecord.fullDomain,
            adminUsername: newRecord.adminUsername,
            adminPassword: newRecord.adminPassword,
            activeModules: newRecord.activeModules,
            tenantStatus: 'active',
            billingPlan: newRecord.billingPlan || 'monthly',
            monthlyTotal: 0,
            subdomainNotes: newRecord.notes || '',
            company_name: newRecord.clientName,
            job_title: 'מנהל סאב-דומיין (טננט)',
            conta_name: newRecord.clientName || `טננט ${cleanSub}`,
            kosun_crm_name: newRecord.clientName || `טננט ${cleanSub}`,
            email: newRecord.ownerEmail || newRecord.adminUsername,
            kosun_crm_email: newRecord.ownerEmail || newRecord.adminUsername,
            conta_phone: newRecord.ownerPhone || '',
            kosun_crm_phone: newRecord.ownerPhone || '',
            lead_source: 'סאב-דומיין KOSUN26',
            tags: ['סאב דומיין', 'משתמש מערכת', 'טננט', cleanSub],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Save under subdomain's own contacts collection
          await setDoc(doc(db, 'tenants', cleanSub, 'contacts', `tenant_admin_${cleanSub}`), contactPayload, { merge: true });

          // Also save under master contacts collection for centralized management
          await setDoc(doc(db, 'tenants', '_master', 'contacts', `tenant_admin_${cleanSub}`), contactPayload, { merge: true });
        } catch (cErr) {
          console.warn('[TenantProvisionerService] Direct CRM contact write warning:', cErr);
        }

        console.info(`[TenantProvisionerService] Tenant ${cleanSub} successfully provisioned on Firestore.`);
      } catch (err) {
        console.warn('[TenantProvisionerService] Remote Firestore provisioning warning:', err);
      }
    }

    try {
      await tenantContactSyncService.syncTenantToContact(newRecord, db);
    } catch {}

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

        // Sync to master CRM contact
        const contactDocRef = doc(db, 'tenants', '_master', 'contacts', `tenant_admin_${cleanSub}`);
        await updateDoc(contactDocRef, {
          activeModules,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[TenantProvisionerService] Firestore module update warning:', err);
      }
    }

    try {
      await tenantContactSyncService.updateTenantFromContact(cleanSub, { activeModules }, db);
    } catch {}
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

        // Sync to master CRM contact
        const contactDocRef = doc(db, 'tenants', '_master', 'contacts', `tenant_admin_${cleanSub}`);
        await updateDoc(contactDocRef, {
          adminUsername: credentials.username,
          adminPassword: credentials.password,
          email: credentials.username,
          kosun_crm_email: credentials.username,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[TenantProvisionerService] Firestore credentials update warning:', err);
      }
    }

    try {
      await tenantContactSyncService.updateTenantFromContact(
        cleanSub,
        { adminUsername: credentials.username, adminPassword: credentials.password },
        db
      );
    } catch {}
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

        const contactDocRef = doc(db, 'tenants', '_master', 'contacts', `tenant_admin_${cleanSub}`);
        await updateDoc(contactDocRef, {
          status: 'suspended',
          tenantStatus: 'suspended',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[TenantProvisionerService] Firestore delete warning:', err);
      }
    }
  }

  /**
   * Get Master / Main Domain account (kosun.pro / _master)
   * Fulfills Clause ו: Display main domain and its data with ability to edit keys
   */
  static async getMasterTenant(db?: Firestore): Promise<TenantAccount> {
    const allModules = AVAILABLE_MODULES_CATALOG.map((m) => m.id);
    let masterData: any = {};
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'tenants', '_master'));
        if (snap.exists()) {
          masterData = snap.data();
        }
      } catch (err) {
        console.warn('[TenantProvisionerService] Error loading _master doc:', err);
      }
    }

    const tokenUsage = await TenantTokenTracker.getTenantTokenUsage(db, '_master');

    return {
      subdomain: '_master',
      fullDomain: masterData.fullDomain || 'kosun.pro',
      clientName: masterData.clientName || 'מערכת KOSUN ראשית (Master Domain)',
      adminUsername: masterData.adminUsername || 'master@kosun.pro',
      adminPassword: '••••••••',
      ownerEmail: masterData.ownerEmail || 'admin@kosun.pro',
      ownerPhone: masterData.ownerPhone || '050-0000000',
      activeModules: allModules,
      collectionPrefix: 'master_mod_',
      status: 'active',
      isMaster: true,
      createdAt: masterData.createdAt || '2026-01-01T00:00:00.000Z',
      updatedAt: masterData.updatedAt || new Date().toISOString(),
      billingPlan: 'custom',
      tokenUsage,
    };
  }

  /**
   * Load API keys for a specific tenant or master
   */
  static async getTenantKeys(db: Firestore | undefined, subdomain: string): Promise<Record<string, any>> {
    const cleanSub = (subdomain || '_master').trim().toLowerCase();
    if (db) {
      try {
        const keysDoc = await getDoc(doc(db, 'tenants', cleanSub, 'settings', 'api_keys'));
        if (keysDoc.exists()) {
          return keysDoc.data() || {};
        }
      } catch (err) {
        console.warn(`[TenantProvisionerService] Error fetching keys for ${cleanSub}:`, err);
      }
    }
    return {};
  }

  /**
   * Update API keys for a specific tenant or master
   */
  static async updateTenantKeys(
    db: Firestore | undefined,
    subdomain: string,
    keys: Record<string, any>
  ): Promise<void> {
    const cleanSub = (subdomain || '_master').trim().toLowerCase();
    const payload = {
      ...keys,
      updatedAt: Date.now(),
    };

    if (db) {
      try {
        const keysDocRef = doc(db, 'tenants', cleanSub, 'settings', 'api_keys');
        await setDoc(keysDocRef, payload, { merge: true });
      } catch (err) {
        console.warn(`[TenantProvisionerService] Error saving keys for ${cleanSub}:`, err);
      }
    }

    // Broadcast browser event for instant synchronization across open tabs/windows
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kosun_tenant_keys_updated', {
          detail: { subdomain: cleanSub, keys: payload },
        })
      );
    }
  }

  /**
   * Update full details of a tenant (clientName, ownerEmail, ownerPhone, status)
   */
  static async updateTenantFullDetails(
    db: Firestore | undefined,
    subdomain: string,
    updates: Partial<TenantAccount>
  ): Promise<void> {
    const cleanSub = subdomain.trim().toLowerCase();
    if (db && cleanSub !== '_master') {
      try {
        const tenantRef = doc(db, 'tenants', cleanSub);
        await setDoc(
          tenantRef,
          {
            ...updates,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn(`[TenantProvisionerService] Error updating full details for ${cleanSub}:`, err);
      }
    }

    const local = this.getLocalTenants();
    const idx = local.findIndex((t) => t.subdomain.toLowerCase() === cleanSub);
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveLocalTenants(local);
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

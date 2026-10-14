import { FirebaseApp, getApps } from 'firebase/app';
import {
  Firestore,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { SubdomainTenantContactData, SubdomainTenantContactContract } from '../../../core/contracts';
import { Contact } from '../types';
import { eventBus } from '../../../core/bridge/EventBus';
import { DEFAULT_SUBDOMAIN_MODULES } from '../../../core/tenant/tenantResolver';

const TENANTS_STORAGE_KEYS = [
  'kosun_provisioned_tenants_registry_v1',
  'kosun_tenant_accounts',
  'saas_provisioned_tenants_registry',
];

function resolveDb(firebaseAppOrDb?: FirebaseApp | Firestore): Firestore | undefined {
  if (!firebaseAppOrDb) {
    if (typeof window !== 'undefined') {
      try {
        const apps = getApps();
        if (apps.length > 0) return getFirestore(apps[0]);
      } catch {}
    }
    return undefined;
  }
  if ('type' in firebaseAppOrDb && (firebaseAppOrDb as any).type === 'firestore') {
    return firebaseAppOrDb as Firestore;
  }
  try {
    return getFirestore(firebaseAppOrDb as FirebaseApp);
  } catch {
    return undefined;
  }
}

export class TenantContactSyncService implements SubdomainTenantContactContract {
  /**
   * Synchronize or create a CRM contact representing a tenant subdomain user in the _master contacts collection.
   */
  async syncTenantToContact(
    tenant: SubdomainTenantContactData,
    firebaseAppOrDb?: FirebaseApp | Firestore
  ): Promise<string> {
    const cleanSub = (tenant.subdomain || '').trim().toLowerCase();
    if (!cleanSub || cleanSub === '_master' || cleanSub === 'www') return '';

    const contactName = tenant.clientName || `טננט ${cleanSub}`;
    const email = tenant.ownerEmail || tenant.adminUsername || `${cleanSub}@kosun.pro`;
    const phone = tenant.ownerPhone || '';

    const contactPayload: Partial<Contact> = {
      status: 'active',
      contact_type: 'contact',
      isUser: true,
      isSubdomainAdmin: true,
      subdomain: cleanSub,
      fullDomain: tenant.fullDomain || `${cleanSub}.kosun.pro`,
      adminUsername: tenant.adminUsername || email,
      adminPassword: tenant.adminPassword,
      activeModules: tenant.activeModules || [],
      tenantStatus: tenant.status || 'active',
      billingPlan: tenant.billingPlan || 'monthly',
      monthlyTotal: tenant.monthlyTotal || 0,
      subdomainNotes: tenant.notes || '',
      company_name: tenant.clientName || `עסק ${cleanSub}`,
      job_title: 'מנהל סאב-דומיין (טננט)',
      conta_name: contactName,
      kosun_crm_name: contactName,
      email: email,
      kosun_crm_email: email,
      conta_phone: phone,
      kosun_crm_phone: phone,
      lead_source: 'סאב-דומיין KOSUN26',
      tags: ['סאב דומיין', 'משתמש מערכת', 'טננט', cleanSub],
    };

    // Keep all local storage registries synced
    if (typeof window !== 'undefined') {
      TENANTS_STORAGE_KEYS.forEach((key) => {
        try {
          const raw = localStorage.getItem(key);
          let list: any[] = raw ? JSON.parse(raw) : [];
          const idx = list.findIndex((t) => (t.subdomain || '').toLowerCase() === cleanSub);
          const tenantItem = {
            ...tenant,
            subdomain: cleanSub,
            clientName: contactName,
            adminUsername: tenant.adminUsername || email,
            adminPassword: tenant.adminPassword,
            updatedAt: new Date().toISOString(),
          };
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...tenantItem };
          } else {
            list.unshift(tenantItem);
          }
          localStorage.setItem(key, JSON.stringify(list));
        } catch {}
      });
    }

    const db = resolveDb(firebaseAppOrDb);
    if (!db) {
      console.log(`[TenantContactSyncService] Local sync for tenant ${cleanSub}`);
      return `contact_local_${cleanSub}`;
    }

    try {
      // Master scoped path: tenants/_master/contacts
      const masterContactsCol = collection(db, 'tenants', '_master', 'contacts');
      const targetDocId = `tenant_admin_${cleanSub}`;

      // 1. Direct write/merge to master contacts
      await setDoc(doc(db, 'tenants', '_master', 'contacts', targetDocId), {
        ...contactPayload,
        id: targetDocId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // 2. Also ensure root contacts has it for dual-read compatibility
      try {
        await setDoc(doc(db, 'contacts', targetDocId), {
          ...contactPayload,
          id: targetDocId,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {}

      // 3. Write to subdomain's own scoped contacts collection (tenants/${cleanSub}/contacts)
      try {
        await setDoc(doc(db, 'tenants', cleanSub, 'contacts', targetDocId), {
          ...contactPayload,
          id: targetDocId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {}

      eventBus.emit('tenant:contact_synced', { subdomain: cleanSub, contactId: targetDocId });
      eventBus.emit('crm:contact:updated', { id: targetDocId, conta_name: contactName, email });

      return targetDocId;
    } catch (err) {
      console.error(`[TenantContactSyncService] Failed to sync tenant ${cleanSub} to CRM:`, err);
      return '';
    }
  }

  /**
   * Update tenant record and credentials directly from CRM contact in _master.
   */
  async updateTenantFromContact(
    subdomain: string,
    updates: Partial<SubdomainTenantContactData>,
    firebaseAppOrDb?: FirebaseApp | Firestore
  ): Promise<boolean> {
    const cleanSub = subdomain.trim().toLowerCase();

    // 1. Update localStorage caches
    if (typeof window !== 'undefined') {
      TENANTS_STORAGE_KEYS.forEach((key) => {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: any[] = JSON.parse(raw);
            const idx = list.findIndex((t) => (t.subdomain || '').toLowerCase() === cleanSub);
            if (idx !== -1) {
              list[idx] = {
                ...list[idx],
                ...updates,
                updatedAt: new Date().toISOString(),
              };
              localStorage.setItem(key, JSON.stringify(list));
            }
          }
        } catch {}
      });
    }

    // 2. Update Firestore if connected
    const db = resolveDb(firebaseAppOrDb);
    if (db) {
      try {
        const tenantRef = doc(db, 'tenants', cleanSub);

        const tenantUpdates: Record<string, any> = {
          updatedAt: new Date().toISOString(),
        };

        if (updates.clientName) tenantUpdates.clientName = updates.clientName;
        if (updates.status) tenantUpdates.status = updates.status;
        if (updates.activeModules) tenantUpdates.activeModules = updates.activeModules;
        if (updates.billingPlan) tenantUpdates.billingPlan = updates.billingPlan;
        if (updates.notes !== undefined) tenantUpdates.notes = updates.notes;
        if (updates.ownerEmail) tenantUpdates.ownerEmail = updates.ownerEmail;
        if (updates.ownerPhone) tenantUpdates.ownerPhone = updates.ownerPhone;
        if (updates.adminUsername) tenantUpdates.adminUsername = updates.adminUsername;
        if (updates.adminPassword) tenantUpdates.adminPassword = updates.adminPassword;

        await updateDoc(tenantRef, tenantUpdates);

        // Update auth credentials document if username/password updated
        if (updates.adminUsername || updates.adminPassword) {
          const credRef = doc(db, 'tenants', cleanSub, 'settings', 'auth_credentials');
          const credUpdates: Record<string, any> = {
            updatedAt: new Date().toISOString(),
          };
          if (updates.adminUsername) credUpdates.username = updates.adminUsername;
          if (updates.adminPassword) credUpdates.plainPassword = updates.adminPassword;

          await setDoc(credRef, credUpdates, { merge: true });
        }

        // Emit tenant updated event
        eventBus.emit('tenant:updated', {
          subdomain: cleanSub,
          fullDomain: updates.fullDomain || `${cleanSub}.kosun.pro`,
          clientName: updates.clientName || cleanSub,
          adminUsername: updates.adminUsername || '',
          adminPassword: updates.adminPassword,
          activeModules: updates.activeModules || [],
          status: updates.status || 'active',
          billingPlan: updates.billingPlan,
          notes: updates.notes,
          updatedAt: new Date().toISOString(),
        });

        return true;
      } catch (err) {
        console.error(`[TenantContactSyncService] Failed to update tenant ${cleanSub} from contact:`, err);
        return false;
      }
    }

    return true;
  }

  /**
   * Retrieve tenant configuration linked to this contact
   */
  async getTenantBySubdomain(
    subdomain: string,
    firebaseAppOrDb?: FirebaseApp | Firestore
  ): Promise<SubdomainTenantContactData | null> {
    const cleanSub = subdomain.trim().toLowerCase();
    const db = resolveDb(firebaseAppOrDb);

    // 1. Check Firestore
    if (db) {
      try {
        const tenantSnap = await getDoc(doc(db, 'tenants', cleanSub));
        if (tenantSnap.exists()) {
          const data = tenantSnap.data() as SubdomainTenantContactData;
          // Also fetch plain credentials
          try {
            const credSnap = await getDoc(doc(db, 'tenants', cleanSub, 'settings', 'auth_credentials'));
            if (credSnap.exists()) {
              const credData = credSnap.data();
              data.adminUsername = credData.username || data.adminUsername;
              data.adminPassword = credData.plainPassword || data.adminPassword;
            }
          } catch {}
          return data;
        }
      } catch {}
    }

    // 2. Check localStorage
    if (typeof window !== 'undefined') {
      for (const key of TENANTS_STORAGE_KEYS) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: SubdomainTenantContactData[] = JSON.parse(raw);
            const found = list.find((t) => (t.subdomain || '').toLowerCase() === cleanSub);
            if (found) return found;
          }
        } catch {}
      }
    }

    return null;
  }

  /**
   * Synchronize all existing tenants from localStorage and Firestore to CRM contacts
   */
  async ensureAllTenantsSyncedToCrm(firebaseAppOrDb?: FirebaseApp | Firestore): Promise<number> {
    let synced = 0;
    const db = resolveDb(firebaseAppOrDb);
    const seenSubs = new Set<string>();

    // 1. Query Firestore tenants collection directly
    if (db) {
      try {
        const tenantsSnap = await getDocs(collection(db, 'tenants'));
        for (const docSnap of tenantsSnap.docs) {
          const sub = docSnap.id.toLowerCase();
          if (sub === '_master' || sub === 'www' || sub === 'admin' || sub === 'system') continue;
          seenSubs.add(sub);
          const tData = docSnap.data();

          let adminPassword = tData.adminPassword || '';
          let adminUsername = tData.adminUsername || tData.ownerEmail || `${sub}@kosun.pro`;

          // Try loading credentials document
          try {
            const credDoc = await getDoc(doc(db, 'tenants', sub, 'settings', 'auth_credentials'));
            if (credDoc.exists()) {
              const c = credDoc.data();
              if (c.plainPassword) adminPassword = c.plainPassword;
              if (c.username) adminUsername = c.username;
            }
          } catch {}

          const tenantContact: SubdomainTenantContactData = {
            subdomain: sub,
            fullDomain: tData.fullDomain || `${sub}.kosun.pro`,
            clientName: tData.clientName || `עסק ${sub}`,
            ownerEmail: tData.ownerEmail || adminUsername,
            ownerPhone: tData.ownerPhone || '',
            adminUsername: adminUsername,
            adminPassword: adminPassword || 'Ks@1234',
            activeModules: Array.isArray(tData.activeModules) && tData.activeModules.length > 0 ? tData.activeModules : DEFAULT_SUBDOMAIN_MODULES,
            status: tData.status || 'active',
            billingPlan: tData.billingPlan || 'monthly',
            notes: tData.notes || '',
            monthlyTotal: tData.monthlyTotal || 0,
          };

          await this.syncTenantToContact(tenantContact, db);
          synced++;
        }
      } catch (err) {
        console.warn('[TenantContactSyncService] Firestore tenants collection scan notice:', err);
      }
    }

    // 2. Query LocalStorage registries
    if (typeof window !== 'undefined') {
      for (const key of TENANTS_STORAGE_KEYS) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: SubdomainTenantContactData[] = JSON.parse(raw);
            for (const tenant of list) {
              const sub = (tenant.subdomain || '').toLowerCase().trim();
              if (sub && !seenSubs.has(sub) && sub !== '_master' && sub !== 'www') {
                seenSubs.add(sub);
                await this.syncTenantToContact(tenant, db);
                synced++;
              }
            }
          }
        } catch (e) {
          console.warn('[TenantContactSyncService] Sync local warning:', e);
        }
      }
    }

    return synced;
  }
}

export const tenantContactSyncService = new TenantContactSyncService();

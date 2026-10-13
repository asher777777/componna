import { FirebaseApp } from 'firebase/app';
import {
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

const TENANTS_STORAGE_KEY = 'kosun_tenant_accounts';

export class TenantContactSyncService implements SubdomainTenantContactContract {
  /**
   * Synchronize or create a CRM contact representing a tenant subdomain user in the _master contacts collection.
   */
  async syncTenantToContact(
    tenant: SubdomainTenantContactData,
    firebaseApp?: FirebaseApp
  ): Promise<string> {
    const cleanSub = tenant.subdomain.trim().toLowerCase();
    const contactName = tenant.clientName || `טננט ${cleanSub}`;
    const email = tenant.ownerEmail || `${cleanSub}@kosun.co.il`;
    const phone = tenant.ownerPhone || '';

    const contactPayload: Partial<Contact> = {
      status: 'active',
      contact_type: 'contact',
      isUser: true,
      isSubdomainAdmin: true,
      subdomain: cleanSub,
      fullDomain: tenant.fullDomain,
      adminUsername: tenant.adminUsername,
      adminPassword: tenant.adminPassword,
      activeModules: tenant.activeModules || [],
      tenantStatus: tenant.status || 'active',
      billingPlan: tenant.billingPlan || 'monthly',
      monthlyTotal: tenant.monthlyTotal || 0,
      subdomainNotes: tenant.notes || '',
      company_name: tenant.clientName,
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

    if (!firebaseApp) {
      console.log(`[TenantContactSyncService] Local sync for tenant ${cleanSub}`);
      return `contact_local_${cleanSub}`;
    }

    try {
      const db = getFirestore(firebaseApp);
      // Master scoped path: tenants/_master/contacts
      const masterContactsCol = collection(db, 'tenants', '_master', 'contacts');

      // 1. Check if contact exists by subdomain
      const qSub = query(masterContactsCol, where('subdomain', '==', cleanSub));
      const snapSub = await getDocs(qSub);

      let targetDocId = '';

      if (!snapSub.empty) {
        targetDocId = snapSub.docs[0].id;
        await updateDoc(doc(db, 'tenants', '_master', 'contacts', targetDocId), {
          ...contactPayload,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Deterministic or clean ID based on subdomain
        targetDocId = `tenant_admin_${cleanSub}`;
        await setDoc(doc(db, 'tenants', '_master', 'contacts', targetDocId), {
          ...contactPayload,
          id: targetDocId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      // Also ensure root contacts has it for dual-read compatibility if master is using root
      try {
        const rootRef = doc(db, 'contacts', targetDocId);
        await setDoc(rootRef, {
          ...contactPayload,
          id: targetDocId,
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
    firebaseApp?: FirebaseApp
  ): Promise<boolean> {
    const cleanSub = subdomain.trim().toLowerCase();

    // 1. Update localStorage cache
    try {
      const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (raw) {
        const list: SubdomainTenantContactData[] = JSON.parse(raw);
        const idx = list.findIndex((t) => t.subdomain === cleanSub);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(list));
        }
      }
    } catch {}

    // 2. Update Firestore if connected
    if (firebaseApp) {
      try {
        const db = getFirestore(firebaseApp);
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
          fullDomain: updates.fullDomain || `${cleanSub}.kosun.co.il`,
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
    firebaseApp?: FirebaseApp
  ): Promise<SubdomainTenantContactData | null> {
    const cleanSub = subdomain.trim().toLowerCase();

    // 1. Check Firestore
    if (firebaseApp) {
      try {
        const db = getFirestore(firebaseApp);
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
    try {
      const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (raw) {
        const list: SubdomainTenantContactData[] = JSON.parse(raw);
        const found = list.find((t) => t.subdomain === cleanSub);
        if (found) return found;
      }
    } catch {}

    return null;
  }

  /**
   * Synchronize all existing tenants from localStorage / Firestore to CRM contacts
   */
  async ensureAllTenantsSyncedToCrm(firebaseApp?: FirebaseApp): Promise<number> {
    let synced = 0;
    try {
      const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (raw) {
        const list: SubdomainTenantContactData[] = JSON.parse(raw);
        for (const tenant of list) {
          if (tenant.subdomain) {
            await this.syncTenantToContact(tenant, firebaseApp);
            synced++;
          }
        }
      }
    } catch (e) {
      console.warn('[TenantContactSyncService] Sync all warning:', e);
    }
    return synced;
  }
}

export const tenantContactSyncService = new TenantContactSyncService();

/**
 * KOSUN Board Composer (קושאן מחולל מערכות ולוחות בקרה AI)
 * Layer 4: Firestore Scoped Service & Subdomain Pairing
 */

import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { GeneratedCustomDashboard, SubdomainPairingRecord } from '../types';
import { TenantCoreService } from '../../../core/tenant/tenantService';
import { CUSTOM_DASHBOARDS_COLLECTION } from '../config';

const LOCAL_STORAGE_KEY_PREFIX = 'kosun_custom_dashboards_';

export class DashboardFirestoreService {
  /**
   * Save custom dashboard scoped to tenant in Firestore:
   * Pattern: `tenants/{tenantId}/custom_dashboards/{dashboardId}`
   */
  static async saveDashboard(
    db: Firestore | undefined,
    tenantId: string,
    dashboard: GeneratedCustomDashboard
  ): Promise<void> {
    const safeTenant = tenantId.trim().toLowerCase() || '_master';
    dashboard.updatedAt = new Date().toISOString();

    // 1. Always save locally for instant retrieval & offline support
    try {
      const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${safeTenant}`;
      const existing = this.getLocalDashboards(safeTenant);
      const updated = [dashboard, ...existing.filter((d) => d.id !== dashboard.id)];
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('[DashboardFirestoreService] LocalStorage save error:', e);
    }

    // 2. Save in Firestore if db connection exists
    if (db) {
      try {
        const dashboardDocRef = doc(db, 'tenants', safeTenant, CUSTOM_DASHBOARDS_COLLECTION, dashboard.id);
        await setDoc(dashboardDocRef, dashboard, { merge: true });
        console.info(`[DashboardFirestoreService] Saved dashboard ${dashboard.id} to tenants/${safeTenant}`);
      } catch (err) {
        console.warn('[DashboardFirestoreService] Firestore save error:', err);
      }
    }
  }

  /**
   * Get all custom dashboards for a specific tenant.
   */
  static async getDashboardsForTenant(
    db: Firestore | undefined,
    tenantId: string
  ): Promise<GeneratedCustomDashboard[]> {
    const safeTenant = tenantId.trim().toLowerCase() || '_master';
    const local = this.getLocalDashboards(safeTenant);

    if (!db) {
      return local;
    }

    try {
      const collRef = collection(db, 'tenants', safeTenant, CUSTOM_DASHBOARDS_COLLECTION);
      const snap = await getDocs(collRef);
      if (!snap.empty) {
        const remote = snap.docs.map((d) => d.data() as GeneratedCustomDashboard);
        // Merge with local ensuring no missing items
        const remoteMap = new Map(remote.map((d) => [d.id, d]));
        local.forEach((l) => {
          if (!remoteMap.has(l.id)) {
            remoteMap.set(l.id, l);
          }
        });
        const merged = Array.from(remoteMap.values()).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        return merged;
      }
    } catch (err) {
      console.warn('[DashboardFirestoreService] Firestore getDashboards notice:', err);
    }

    return local;
  }

  /**
   * Get a specific dashboard by ID.
   */
  static async getDashboardById(
    db: Firestore | undefined,
    tenantId: string,
    dashboardId: string
  ): Promise<GeneratedCustomDashboard | null> {
    const safeTenant = tenantId.trim().toLowerCase() || '_master';

    // Check local
    const local = this.getLocalDashboards(safeTenant);
    const foundLocal = local.find((d) => d.id === dashboardId);

    if (db) {
      try {
        const docRef = doc(db, 'tenants', safeTenant, CUSTOM_DASHBOARDS_COLLECTION, dashboardId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as GeneratedCustomDashboard;
        }
      } catch (e) {
        console.warn('[DashboardFirestoreService] Firestore fetch by ID error:', e);
      }
    }

    return foundLocal || null;
  }

  /**
   * Pair and assign a custom dashboard to a user's subdomain.
   * Requirement:
   * "אותם אוכל לשדך לסאב דומיין של משתמש שהוא יהיה הלוח בקרה שלו כאשר הוא נכנס למערכת"
   */
  static async pairDashboardToSubdomain(
    db: Firestore | undefined,
    subdomain: string,
    dashboard: GeneratedCustomDashboard
  ): Promise<void> {
    const cleanSub = subdomain.trim().toLowerCase();

    // 1. Update dashboard record with pairing
    dashboard.pairedSubdomain = cleanSub;
    dashboard.isDefaultSubdomainDashboard = true;

    // Save in the owner's tenant space
    await this.saveDashboard(db, dashboard.tenantId, dashboard);

    // Also replicate into the subdomain tenant space so it is available locally there
    await this.saveDashboard(db, cleanSub, dashboard);

    // 2. Set active dashboard in tenant record
    try {
      const allTenants = TenantCoreService.getLocalTenants();
      const targetTenant = allTenants.find((t) => t.subdomain.toLowerCase() === cleanSub);
      if (targetTenant) {
        const updatedTenant = {
          ...targetTenant,
          activeCustomDashboardId: dashboard.id,
          activeModules: Array.from(new Set([...targetTenant.activeModules, ...dashboard.selectedModuleIds])),
          updatedAt: new Date().toISOString(),
        };
        const updatedList = [updatedTenant, ...allTenants.filter((t) => t.subdomain.toLowerCase() !== cleanSub)];
        TenantCoreService.saveLocalTenants(updatedList as any);
      }

      // Also persist to Firestore 'tenants/{subdomain}'
      if (db) {
        const tenantDocRef = doc(db, 'tenants', cleanSub);
        await setDoc(
          tenantDocRef,
          {
            activeCustomDashboardId: dashboard.id,
            activeModules: dashboard.selectedModuleIds,
            customDashboardTitle: dashboard.title,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn('[DashboardFirestoreService] Pairing to tenant record error:', e);
    }
  }

  /**
   * Delete a custom dashboard.
   */
  static async deleteDashboard(
    db: Firestore | undefined,
    tenantId: string,
    dashboardId: string
  ): Promise<void> {
    const safeTenant = tenantId.trim().toLowerCase() || '_master';

    // 1. Local cleanup
    try {
      const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${safeTenant}`;
      const existing = this.getLocalDashboards(safeTenant);
      const filtered = existing.filter((d) => d.id !== dashboardId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch {}

    // 2. Firestore cleanup
    if (db) {
      try {
        const docRef = doc(db, 'tenants', safeTenant, CUSTOM_DASHBOARDS_COLLECTION, dashboardId);
        await deleteDoc(docRef);
      } catch (e) {
        console.warn('[DashboardFirestoreService] Firestore delete error:', e);
      }
    }
  }

  private static getLocalDashboards(tenantId: string): GeneratedCustomDashboard[] {
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${tenantId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }
}

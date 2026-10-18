import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { DashboardPageDocument } from '../types';
import { INITIAL_DASHBOARD } from '../config';

export const dashboardFirestore = {
  /**
   * Fetch all dashboards for a specific tenant
   */
  async getDashboards(db: Firestore | null | undefined, tenantId: string): Promise<DashboardPageDocument[]> {
    if (!db) return [INITIAL_DASHBOARD];
    try {
      const colRef = collection(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.DASHBOARD_PAGES);
      const snap = await getDocs(colRef);
      if (snap.empty) {
        return [INITIAL_DASHBOARD];
      }
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<DashboardPageDocument, 'id'>),
      }));
    } catch (err) {
      console.warn('[KosDesBuilder] getDashboards failed, falling back to initial:', err);
      return [INITIAL_DASHBOARD];
    }
  },

  /**
   * Fetch a single dashboard by ID
   */
  async getDashboardById(
    db: Firestore | null | undefined,
    tenantId: string,
    dashboardId: string
  ): Promise<DashboardPageDocument | null> {
    if (!db) return dashboardId === INITIAL_DASHBOARD.id ? INITIAL_DASHBOARD : null;
    try {
      const docRef = doc(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.DASHBOARD_PAGES, dashboardId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return {
        id: snap.id,
        ...(snap.data() as Omit<DashboardPageDocument, 'id'>),
      };
    } catch (err) {
      console.warn('[KosDesBuilder] getDashboardById failed:', err);
      return null;
    }
  },

  /**
   * Save or update a dashboard document under tenant scope
   */
  async saveDashboard(
    db: Firestore | null | undefined,
    tenantId: string,
    dashboard: DashboardPageDocument
  ): Promise<DashboardPageDocument> {
    const updatedDoc: DashboardPageDocument = {
      ...dashboard,
      updatedAt: new Date().toISOString(),
    };

    if (!db) return updatedDoc;

    try {
      const docRef = doc(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.DASHBOARD_PAGES, dashboard.id);
      await setDoc(
        docRef,
        {
          ...updatedDoc,
          _serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return updatedDoc;
    } catch (err) {
      console.warn('[KosDesBuilder] saveDashboard failed:', err);
      throw err;
    }
  },

  /**
   * Delete a dashboard document
   */
  async deleteDashboard(
    db: Firestore | null | undefined,
    tenantId: string,
    dashboardId: string
  ): Promise<boolean> {
    if (!db) return true;
    try {
      const docRef = doc(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.DASHBOARD_PAGES, dashboardId);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn('[KosDesBuilder] deleteDashboard failed:', err);
      return false;
    }
  },
};

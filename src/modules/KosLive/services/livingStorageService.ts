import { Firestore, doc, setDoc, getDoc, getDocs, collection, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { LivingProject, LivingCampaignContract } from '../types';
import { DEFAULT_LIVING_CAMPAIGN } from '../config';

const LOCAL_STORAGE_PROJECTS_KEY = 'kos_live_projects_store';
const LOCAL_STORAGE_CAMPAIGNS_KEY = 'kos_live_campaigns_store';
const LEGACY_PLAYER_COLLECTION = 'sdo_player_campaign_configs';

function cleanPayload<T>(obj: T): T {
  if (obj === undefined || obj === null) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export class LivingStorageService {
  /**
   * Save a LivingProject to Firestore in multi-tenant path and localStorage cache
   */
  static async saveProject(db: Firestore | undefined, tenantId: string, project: LivingProject): Promise<void> {
    const payload = cleanPayload({
      ...project,
      updatedAt: new Date().toISOString()
    });

    // 1. LocalStorage Cache
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      const list: LivingProject[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(p => p.id === project.id);
      if (idx >= 0) {
        list[idx] = payload;
      } else {
        list.unshift(payload);
      }
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[LivingStorageService] Local storage save notice:', e);
    }

    // 2. Firestore Multi-Tenant Path
    if (db && tenantId) {
      try {
        const docRef = doc(db, 'tenants', tenantId, 'modules', 'KosLive', 'projects', project.id);
        await setDoc(docRef, payload, { merge: true });
      } catch (err) {
        console.warn('[LivingStorageService] Firestore saveProject error:', err);
      }
    }
  }

  /**
   * List all LivingProjects for a tenant
   */
  static async listProjects(db: Firestore | undefined, tenantId: string): Promise<LivingProject[]> {
    // Try Firestore first
    if (db && tenantId) {
      try {
        const colRef = collection(db, 'tenants', tenantId, 'modules', 'KosLive', 'projects');
        const snap = await getDocs(colRef);
        if (!snap.empty) {
          const list: LivingProject[] = [];
          snap.forEach(d => list.push(d.data() as LivingProject));
          // Update cache
          try {
            localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(list));
          } catch {}
          return list;
        }
      } catch (err) {
        console.warn('[LivingStorageService] Firestore listProjects error:', err);
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    return [];
  }

  /**
   * Save an active LivingCampaign ready for player execution
   */
  static async saveCampaign(db: Firestore | undefined, tenantId: string, campaign: LivingCampaignContract): Promise<void> {
    const payload = cleanPayload({
      ...campaign,
      updatedAt: Date.now()
    });

    // 1. LocalStorage Cache
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CAMPAIGNS_KEY);
      const list: LivingCampaignContract[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(c => c.id === campaign.id || c.slug === campaign.slug);
      if (idx >= 0) {
        list[idx] = payload;
      } else {
        list.unshift(payload);
      }
      localStorage.setItem(LOCAL_STORAGE_CAMPAIGNS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[LivingStorageService] Local storage saveCampaign notice:', e);
    }

    // 2. Firestore Multi-Tenant Path
    if (db && tenantId) {
      try {
        const docRef = doc(db, 'tenants', tenantId, 'modules', 'KosLive', 'campaigns', campaign.id);
        await setDoc(docRef, payload, { merge: true });
        
        // Also sync to legacy collection for backward compatibility
        const legacyRef = doc(db, LEGACY_PLAYER_COLLECTION, campaign.id);
        await setDoc(legacyRef, payload, { merge: true });
      } catch (err) {
        console.warn('[LivingStorageService] Firestore saveCampaign error:', err);
      }
    }
  }

  /**
   * Load a campaign by ID or Slug
   */
  static async getCampaign(db: Firestore | undefined, tenantId: string, campaignIdOrSlug: string): Promise<LivingCampaignContract | null> {
    if (!campaignIdOrSlug || campaignIdOrSlug === 'demo-living-page') {
      return DEFAULT_LIVING_CAMPAIGN;
    }

    // Try Firestore
    if (db && tenantId) {
      try {
        const docRef = doc(db, 'tenants', tenantId, 'modules', 'KosLive', 'campaigns', campaignIdOrSlug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as LivingCampaignContract;
        }

        // Try legacy collection
        const legacyRef = doc(db, LEGACY_PLAYER_COLLECTION, campaignIdOrSlug);
        const legSnap = await getDoc(legacyRef);
        if (legSnap.exists()) {
          return legSnap.data() as LivingCampaignContract;
        }
      } catch (err) {
        console.warn('[LivingStorageService] Firestore getCampaign error:', err);
      }
    }

    // Fallback to LocalStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CAMPAIGNS_KEY);
      if (stored) {
        const list: LivingCampaignContract[] = JSON.parse(stored);
        const found = list.find(c => c.id === campaignIdOrSlug || c.slug === campaignIdOrSlug);
        if (found) return found;
      }
    } catch {}

    return DEFAULT_LIVING_CAMPAIGN;
  }

  /**
   * Delete a project
   */
  static async deleteProject(db: Firestore | undefined, tenantId: string, projectId: string): Promise<void> {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (stored) {
        const list: LivingProject[] = JSON.parse(stored);
        const filtered = list.filter(p => p.id !== projectId);
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(filtered));
      }
    } catch {}

    if (db && tenantId) {
      try {
        const docRef = doc(db, 'tenants', tenantId, 'modules', 'KosLive', 'projects', projectId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[LivingStorageService] deleteProject error:', err);
      }
    }
  }
}

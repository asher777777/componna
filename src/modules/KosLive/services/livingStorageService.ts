import { Firestore, doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { LivingProject, LivingCampaignContract, ConciergePageUiConfig } from '../types';
import { DEFAULT_LIVING_CAMPAIGN } from '../config';

const LOCAL_STORAGE_PROJECTS_KEY = 'kos_live_projects_store';
const LOCAL_STORAGE_CAMPAIGNS_KEY = 'kos_live_campaigns_store';
const LOCAL_STORAGE_PAGE_UI_CONFIG_KEY = 'kos_live_page_ui_config';
const LEGACY_PLAYER_COLLECTION = 'sdo_player_campaign_configs';

export const DEFAULT_CONCIERGE_PAGE_UI_CONFIG: ConciergePageUiConfig = {
  isVisibleOnPage: false, // כברירת מחדל: נסתר בעמוד!
  greetingText: 'שלום! אפשר לעזור לך?',
  hideTextOnMobile: true, // כברירת מחדל: במובייל הסתר את הטקסט ליד תמונת האווטאר
  showTextOnDesktop: true,
  avatarId: 'sarah_warm',
  position: 'bottom-left',
  activeCampaignId: 'demo-living-page'
};

function cleanPayload<T>(obj: T): T {
  if (obj === undefined || obj === null) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export class LivingStorageService {
  /**
   * Read local Page UI Config synchronously (used for instant initial state)
   */
  static getLocalPageUiConfig(tenantId?: string): ConciergePageUiConfig {
    try {
      const key = tenantId ? `${LOCAL_STORAGE_PAGE_UI_CONFIG_KEY}_${tenantId}` : LOCAL_STORAGE_PAGE_UI_CONFIG_KEY;
      const raw = localStorage.getItem(key) || localStorage.getItem(LOCAL_STORAGE_PAGE_UI_CONFIG_KEY);
      if (raw) {
        return {
          ...DEFAULT_CONCIERGE_PAGE_UI_CONFIG,
          ...JSON.parse(raw)
        };
      }
    } catch {}
    return DEFAULT_CONCIERGE_PAGE_UI_CONFIG;
  }

  /**
   * Load Page UI Config from Firestore or localStorage
   */
  static async loadPageUiConfig(db: Firestore | undefined, tenantId: string): Promise<ConciergePageUiConfig> {
    if (db && tenantId) {
      try {
        const docRef = doc(db, 'tenants', tenantId, 'modules', 'KosLive', 'settings', 'page_ui_config');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const merged: ConciergePageUiConfig = {
            ...DEFAULT_CONCIERGE_PAGE_UI_CONFIG,
            ...(snap.data() as Partial<ConciergePageUiConfig>)
          };
          try {
            localStorage.setItem(`${LOCAL_STORAGE_PAGE_UI_CONFIG_KEY}_${tenantId}`, JSON.stringify(merged));
            localStorage.setItem(LOCAL_STORAGE_PAGE_UI_CONFIG_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        }
      } catch (err) {
        console.warn('[LivingStorageService] loadPageUiConfig error:', err);
      }
    }
    return this.getLocalPageUiConfig(tenantId);
  }

  /**
   * Save Page UI Config to localStorage, Firestore, and dispatch live window event
   */
  static async savePageUiConfig(
    db: Firestore | undefined,
    tenantId: string,
    config: ConciergePageUiConfig
  ): Promise<void> {
    const payload = cleanPayload({
      ...DEFAULT_CONCIERGE_PAGE_UI_CONFIG,
      ...config
    });

    try {
      if (tenantId) {
        localStorage.setItem(`${LOCAL_STORAGE_PAGE_UI_CONFIG_KEY}_${tenantId}`, JSON.stringify(payload));
      }
      localStorage.setItem(LOCAL_STORAGE_PAGE_UI_CONFIG_KEY, JSON.stringify(payload));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('koslive:page-ui-config-updated', { detail: payload }));
      }
    } catch (e) {
      console.warn('[LivingStorageService] Local savePageUiConfig notice:', e);
    }

    if (db && tenantId) {
      try {
        const docRef = doc(db, 'tenants', tenantId, 'modules', 'KosLive', 'settings', 'page_ui_config');
        await setDoc(docRef, payload, { merge: true });
      } catch (err) {
        console.warn('[LivingStorageService] Firestore savePageUiConfig error:', err);
      }
    }
  }

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
   * Convert a legacy flow-player-engine CampaignConfig into a LivingProject
   */
  private static convertLegacyPlayerCampaignToLivingProject(rawCamp: any): LivingProject | null {
    if (!rawCamp || !rawCamp.id) return null;
    const statesObj = rawCamp.states || rawCamp.scenes || {};
    const nodeList = Object.values(statesObj) as any[];
    if (nodeList.length === 0) return null;

    const scenes = nodeList.map((node: any, idx: number) => {
      const overlays = (node.overlays || []).map((ov: any) => {
        const items = ov.cards || ov.carouselItems || [];
        return {
          ...ov,
          cards: items.map((c: any) => ({
            ...c,
            subtitle: c.subtitle || c.description || '',
            description: c.description || c.subtitle || '',
            targetSceneId: c.targetSceneId || c.targetNodeId || '',
            actionType: c.actionType || 'transition'
          }))
        };
      });

      return {
        id: node.id || `scene_${idx + 1}`,
        sceneNumber: idx + 1,
        title: node.name || node.title || `סצנה ${idx + 1}`,
        dialogueScript: node.description || node.scriptText || node.dialogueScript || '',
        scriptText: node.description || node.scriptText || node.dialogueScript || '',
        visualDescription: node.visualDescription || node.description || '',
        characterDescription: node.characterDescription || 'פרזנטור אינטראקטיבי',
        backgroundPrompt: node.backgroundPrompt || '',
        durationSeconds: node.durationSeconds || 10,
        renderedVideoUrl: node.videoUrl || node.renderedVideoUrl || '',
        videoUrl: node.videoUrl || node.renderedVideoUrl || '',
        backgroundMediaUrl: node.fallbackImageUrl || node.backgroundMediaUrl || '',
        fallbackImageUrl: node.fallbackImageUrl || node.backgroundMediaUrl || '',
        autoPlay: node.autoPlay ?? true,
        loopUntilTrigger: node.loopUntilTrigger ?? node.loop ?? true,
        soundEnabled: node.soundEnabled ?? true,
        autoTransitionOnEnd: node.autoTransitionOnEnd ?? false,
        autoTransitionDelaySec: node.autoTransitionDelaySec,
        autoTransitionTargetSceneId: node.autoTransitionTarget || node.autoTransitionTargetSceneId,
        enableVoiceTrigger: (node.micPosition || 'center') !== 'hidden',
        micPosition: node.micPosition || 'center',
        micIcon: node.micIcon || 'mic-luxury',
        micTargetAction:
          node.micActionType === 'navigate_to_node' ? 'navigate_to_scene' : (node.micTargetAction || 'open_text_input'),
        micTargetSceneId: node.clickMicTargetNodeId || node.micTargetSceneId,
        formsApiEndpoint: node.formsApiEndpoint,
        overlays
      };
    });

    return {
      id: rawCamp.id,
      title: rawCamp.name || rawCamp.title || 'קמפיין נגן אינטראקטיבי',
      description: rawCamp.description || `קמפיין אינטראקטיבי (${scenes.length} סצנות)`,
      targetAudience: 'לקוחות ומבקרי העמוד',
      marketingHook: scenes[0]?.dialogueScript || '',
      visualStyle: 'cinematic_dramatic',
      productionType: 'interactive_player',
      aspectRatio: rawCamp.settings?.defaultAspectRatio || rawCamp.aspectRatio || '9:16',
      displayMode: 'full_page',
      status: 'published',
      campaignSlug: rawCamp.slug || rawCamp.id,
      scenes: scenes as any,
      createdAt: rawCamp.createdAt ? new Date(rawCamp.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: rawCamp.updatedAt ? new Date(rawCamp.updatedAt).toISOString() : new Date().toISOString()
    };
  }

  /**
   * List all LivingProjects for a tenant (merging KosLive projects + flow-player-engine campaigns + video studio projects)
   */
  static async listProjects(db: Firestore | undefined, tenantId: string): Promise<LivingProject[]> {
    const mergedMap = new Map<string, LivingProject>();

    // 1. LocalStorage caches first (KosLive, legacy Flow Player, legacy Video Studio)
    try {
      const storedKosLive = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (storedKosLive) {
        const list: LivingProject[] = JSON.parse(storedKosLive);
        list.forEach(p => {
          if (p && p.id) mergedMap.set(p.id, p);
        });
      }
    } catch {}

    try {
      const storedLegacyStudio = localStorage.getItem('kosun_video_studio_projects');
      if (storedLegacyStudio) {
        const list: any[] = JSON.parse(storedLegacyStudio);
        list.forEach(p => {
          if (p && p.id && !mergedMap.has(p.id)) {
            mergedMap.set(p.id, p as LivingProject);
          }
        });
      }
    } catch {}

    try {
      const storedLegacyPlayer = localStorage.getItem('sdo_local_campaigns_backup');
      if (storedLegacyPlayer) {
        const parsed = JSON.parse(storedLegacyPlayer);
        const list = Array.isArray(parsed) ? parsed : Object.values(parsed || {});
        list.forEach((rawCamp: any) => {
          const converted = this.convertLegacyPlayerCampaignToLivingProject(rawCamp);
          if (converted && !mergedMap.has(converted.id)) {
            mergedMap.set(converted.id, converted);
          }
        });
      }
    } catch {}

    // 2. Firestore collections (KosLive tenant projects + legacy sdo_player_campaign_configs + sdo_video_projects)
    if (db) {
      if (tenantId) {
        try {
          const colRef = collection(db, 'tenants', tenantId, 'modules', 'KosLive', 'projects');
          const snap = await getDocs(colRef);
          snap.forEach(d => {
            const data = d.data() as LivingProject;
            if (data && data.id) mergedMap.set(data.id, data);
          });
        } catch (err) {
          console.warn('[LivingStorageService] Firestore listProjects error:', err);
        }
      }

      try {
        const playerSnap = await getDocs(collection(db, LEGACY_PLAYER_COLLECTION));
        playerSnap.forEach(d => {
          const converted = this.convertLegacyPlayerCampaignToLivingProject({ id: d.id, ...d.data() });
          if (converted && !mergedMap.has(converted.id)) {
            mergedMap.set(converted.id, converted);
          }
        });
      } catch {}

      try {
        const videoSnap = await getDocs(collection(db, 'sdo_video_projects'));
        videoSnap.forEach(d => {
          const data = { id: d.id, ...(d.data() as any) } as LivingProject;
          if (data && data.id && !mergedMap.has(data.id)) {
            mergedMap.set(data.id, data);
          }
        });
      } catch {}
    }

    const finalList = Array.from(mergedMap.values());
    if (finalList.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(finalList));
      } catch {}
    }

    return finalList;
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


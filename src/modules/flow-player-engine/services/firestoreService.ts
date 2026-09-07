import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  CampaignConfig,
  FlowNodeState,
  FlowPlayerCollectionsConfig,
  SceneDocument,
  SessionTelemetryEvent,
} from '../types';
import { DEFAULT_CAMPAIGN_CONFIG } from '../config';

/**
 * Remove undefined values to prevent Firestore serialization errors
 */
function cleanUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        cleaned[key] = cleanUndefinedFields(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

export class FirestoreService {
  /**
   * Fetch campaign configuration by slug / ID with fallback to latest modified document & localStorage
   */
  public static async getCampaignConfig(
    db: Firestore,
    collections: Required<FlowPlayerCollectionsConfig>,
    campaignSlugOrId: string
  ): Promise<CampaignConfig | null> {
    const slug = (campaignSlugOrId || 'sales_rep_interactive_01').trim();

    // 1. First check LocalStorage for instant zero-latency retrieval
    let localCached: CampaignConfig | null = null;
    try {
      const stored =
        localStorage.getItem(`sdo_player_camp_${slug}`) ||
        localStorage.getItem('sdo_player_camp_latest');
      if (stored) {
        localCached = JSON.parse(stored);
      }
    } catch {}

    try {
      let docRef = doc(db, collections.campaignConfigs, slug);
      let snapshot = await getDoc(docRef);

      // If specific slug doesn't exist, search for latest saved campaign in collection
      if (!snapshot.exists()) {
        try {
          const collRef = collection(db, collections.campaignConfigs);
          const collSnap = await getDocs(collRef);
          if (!collSnap.empty) {
            const sortedDocs = collSnap.docs.sort(
              (a, b) => (b.data().updatedAt || 0) - (a.data().updatedAt || 0)
            );
            snapshot = sortedDocs[0];
          }
        } catch (e) {
          console.warn('[FirestoreService] Fallback collection query notice:', e);
        }
      }

      if (!snapshot || !snapshot.exists()) {
        if (localCached) return localCached;
        console.warn(`[FirestoreService] Campaign "${slug}" not found in Firestore.`);
        return null;
      }

      const activeSlug = snapshot.id;
      const mainData = snapshot.data() as CampaignConfig;
      const reconstructedStates: Record<string, FlowNodeState> = { ...(mainData.states || {}) };

      // Query the subcollection `scenes` under this campaign slug
      try {
        const scenesCollRef = collection(db, collections.campaignConfigs, activeSlug, 'scenes');
        const scenesSnapshot = await getDocs(scenesCollRef);

        scenesSnapshot.forEach((sceneDocSnap) => {
          const scene = sceneDocSnap.data() as Partial<SceneDocument>;
          const nodeId = scene.nodeId || sceneDocSnap.id;
          const mainNodeState = mainData.states ? mainData.states[nodeId] : undefined;

          const finalVideoUrl = scene.mediaAssets?.videoUrl || mainNodeState?.videoUrl || '';

          const nodeState: FlowNodeState = {
            id: nodeId,
            name: scene.name || mainNodeState?.name || nodeId,
            description: scene.description || mainNodeState?.description,
            videoUrl: finalVideoUrl,
            fallbackVideoUrl: scene.mediaAssets?.fallbackVideoUrl || mainNodeState?.fallbackVideoUrl,
            autoPlay: scene.triggers?.autoPlay ?? mainNodeState?.autoPlay ?? true,
            loopUntilTrigger: scene.triggers?.loopUntilTrigger ?? mainNodeState?.loopUntilTrigger ?? true,
            loop: scene.triggers?.loopUntilTrigger ?? mainNodeState?.loop ?? true,
            soundEnabled: scene.triggers?.soundEnabled ?? mainNodeState?.soundEnabled ?? true,
            micPosition: scene.triggers?.micPosition ?? mainNodeState?.micPosition ?? 'center',
            micActionType: scene.triggers?.micActionType ?? mainNodeState?.micActionType ?? 'open_text_input',
            clickMicTargetNodeId: scene.triggers?.clickMicTargetNodeId || mainNodeState?.clickMicTargetNodeId,
            autoTransitionOnEnd: scene.triggers?.autoTransitionOnEnd ?? mainNodeState?.autoTransitionOnEnd ?? false,
            autoTransitionTarget: scene.triggers?.autoTransitionTarget || mainNodeState?.autoTransitionTarget,
            autoTransitionDelaySec: scene.triggers?.autoTransitionDelaySec ?? mainNodeState?.autoTransitionDelaySec,
            overlays: scene.cardsAndOverlays?.overlays || mainNodeState?.overlays || [],
            formsApiEndpoint: scene.formApiConfig?.apiEndpoint || mainNodeState?.formsApiEndpoint,
          };

          reconstructedStates[nodeId] = {
            ...(mainNodeState || {}),
            ...nodeState,
          };
        });
      } catch (subCollErr) {
        console.warn('[FirestoreService] Subcollection query notice:', subCollErr);
      }

      const mergedCampaign: CampaignConfig = {
        ...mainData,
        id: activeSlug,
        slug: activeSlug,
        states: reconstructedStates,
        updatedAt: mainData.updatedAt || Date.now(),
      };

      // Keep localStorage in sync with newest remote data
      try {
        localStorage.setItem(`sdo_player_camp_${activeSlug}`, JSON.stringify(mergedCampaign));
        localStorage.setItem('sdo_player_camp_latest', JSON.stringify(mergedCampaign));
      } catch {}

      return mergedCampaign;
    } catch (err) {
      console.warn('[FirestoreService] Firestore fetch fallback to local cache:', err);
      return localCached;
    }
  }

  /**
   * Save entire Campaign JSON document under unique Slug and save each Scene in subcollection
   */
  /**
   * Save entire Campaign JSON document under unique Slug and save each Scene in subcollection
   */
  public static async saveCampaignConfig(
    db: Firestore | undefined,
    collections: Required<FlowPlayerCollectionsConfig>,
    campaign: CampaignConfig
  ): Promise<void> {
    const slug = (campaign.slug || campaign.id || 'sales_rep_interactive_01').trim();

    // 1. Immediately backup locally so no data is ever lost
    try {
      localStorage.setItem(`sdo_player_camp_${slug}`, JSON.stringify(campaign));
      localStorage.setItem('sdo_player_camp_latest', JSON.stringify(campaign));
    } catch {}

    // 2. If no db instance or offline, local save is already completed
    if (!db) {
      return;
    }

    try {
      // Prepare and Save the Main Campaign JSON Document (including full states)
      const mainDocRef = doc(db, collections.campaignConfigs, slug);

      const nodesSummary: Record<string, { name: string; hasVideo: boolean; overlaysCount: number }> = {};
      Object.entries(campaign.states || {}).forEach(([nodeId, node]) => {
        nodesSummary[nodeId] = {
          name: node.name,
          hasVideo: !!node.videoUrl,
          overlaysCount: node.overlays?.length || 0,
        };
      });

      const mainPayload = cleanUndefinedFields({
        id: slug,
        slug: slug,
        name: campaign.name,
        presenterId: campaign.presenterId || 'presenter_elena_vance_san_francisco_01',
        initialNodeId: campaign.initialNodeId || Object.keys(campaign.states || {})[0] || 'node_intro',
        formsApiEndpoint: campaign.formsApiEndpoint,
        settings: campaign.settings,
        states: campaign.states,
        nodesSummary,
        isPublished: !!campaign.isPublished,
        publishedAt: campaign.publishedAt,
        updatedAt: Date.now(),
        createdAt: campaign.createdAt || Date.now(),
      });

      await setDoc(mainDocRef, mainPayload, { merge: true });

      // Save each scene/node in the subcollection `scenes/{nodeId}`
      if (campaign.states) {
        for (const [nodeId, node] of Object.entries(campaign.states)) {
          const sceneDocRef = doc(db, collections.campaignConfigs, slug, 'scenes', nodeId);

          const cardImages: string[] = [];
          node.overlays?.forEach((ov) => {
            if (ov.imageUrl) cardImages.push(ov.imageUrl);
            ov.carouselItems?.forEach((c) => {
              if (c.imageUrl) cardImages.push(c.imageUrl);
            });
          });

          const scenePayload: SceneDocument = {
            id: nodeId,
            nodeId: nodeId,
            name: node.name,
            description: node.description,
            mediaAssets: {
              videoUrl: node.videoUrl || '',
              fallbackVideoUrl: node.fallbackVideoUrl,
              cardImages,
            },
            triggers: {
              autoPlay: node.autoPlay ?? true,
              loopUntilTrigger: node.loopUntilTrigger ?? node.loop ?? true,
              soundEnabled: node.soundEnabled ?? true,
              micPosition: node.micPosition ?? 'center',
              micActionType: node.micActionType ?? 'open_text_input',
              clickMicTargetNodeId: node.clickMicTargetNodeId,
              autoTransitionOnEnd: node.autoTransitionOnEnd ?? false,
              autoTransitionTarget: node.autoTransitionTarget,
              autoTransitionDelaySec: node.autoTransitionDelaySec,
            },
            cardsAndOverlays: {
              overlays: node.overlays || [],
            },
            formApiConfig: {
              apiEndpoint: node.formsApiEndpoint || campaign.formsApiEndpoint,
            },
            updatedAt: Date.now(),
          };

          await setDoc(sceneDocRef, cleanUndefinedFields(scenePayload), { merge: true });
        }
      }
    } catch (err) {
      console.warn('[FirestoreService] Firestore remote save notice (local saved):', err);
    }
  }

  /**
   * List all saved campaigns from Firestore and LocalStorage
   */
  public static async listAllCampaigns(
    db: Firestore | undefined,
    collections: Required<FlowPlayerCollectionsConfig>
  ): Promise<CampaignConfig[]> {
    const campaignsMap = new Map<string, CampaignConfig>();

    // 1. Load all from LocalStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sdo_player_camp_') && key !== 'sdo_player_camp_latest') {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data && (data.id || data.slug)) {
              campaignsMap.set(data.slug || data.id, data);
            }
          } catch {}
        }
      }
    } catch {}

    // 2. Load from Firestore if db is available
    if (db) {
      try {
        const collRef = collection(db, collections.campaignConfigs);
        const collSnap = await getDocs(collRef);
        collSnap.forEach((docSnap) => {
          const data = docSnap.data() as CampaignConfig;
          const slug = data.slug || docSnap.id;
          campaignsMap.set(slug, {
            ...data,
            id: slug,
            slug: slug,
          });
        });
      } catch (err) {
        console.warn('[FirestoreService] listAllCampaigns remote fetch notice:', err);
      }
    }

    // Always ensure default campaign exists if empty
    if (campaignsMap.size === 0) {
      campaignsMap.set(
        DEFAULT_CAMPAIGN_CONFIG.slug || DEFAULT_CAMPAIGN_CONFIG.id,
        DEFAULT_CAMPAIGN_CONFIG
      );
    }

    return Array.from(campaignsMap.values()).sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
    );
  }

  /**
   * Delete campaign by slug from Firestore and LocalStorage
   */
  public static async deleteCampaign(
    db: Firestore | undefined,
    collections: Required<FlowPlayerCollectionsConfig>,
    slug: string
  ): Promise<void> {
    try {
      localStorage.removeItem(`sdo_player_camp_${slug}`);
    } catch {}

    if (db) {
      try {
        const docRef = doc(db, collections.campaignConfigs, slug);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[FirestoreService] deleteCampaign notice:', err);
      }
    }
  }

  /**
   * Duplicate existing campaign
   */
  public static async duplicateCampaign(
    db: Firestore | undefined,
    collections: Required<FlowPlayerCollectionsConfig>,
    sourceCampaign: CampaignConfig,
    newName: string,
    newSlug: string
  ): Promise<CampaignConfig> {
    const duplicated: CampaignConfig = {
      ...sourceCampaign,
      id: newSlug,
      slug: newSlug,
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPublished: false,
    };

    if (db) {
      await this.saveCampaignConfig(db, collections, duplicated);
    } else {
      localStorage.setItem(`sdo_player_camp_${newSlug}`, JSON.stringify(duplicated));
    }

    return duplicated;
  }

  /**
   * Telemetry recording
   */
  public static async recordSessionEvent(
    db: Firestore,
    collections: Required<FlowPlayerCollectionsConfig>,
    sessionId: string,
    campaignId: string,
    event: SessionTelemetryEvent
  ): Promise<void> {
    try {
      const sessionDocRef = doc(db, collections.sessionEvents, sessionId);
      await setDoc(
        sessionDocRef,
        {
          sessionId,
          campaignId,
          updatedAt: Date.now(),
          events: [event],
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[FirestoreService] Telemetry log warning:', err);
    }
  }
}
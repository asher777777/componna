import { Firestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { VideoProject, VideoScene } from '../types';
import { MediaIndexedDbService } from '../../media-gallery-hub/services/mediaIndexedDbService';
import { MediaItem } from '../../media-gallery-hub/types';

const PROJECTS_COLLECTION = 'sdo_video_projects';
const MEDIA_ITEMS_COLLECTION = 'sdo_media_items';
const IDB_PROJECTS_DB = 'ComonaVideoStudioProjectsDB';
const IDB_PROJECTS_STORE = 'projects';
const IDB_VERSION = 1;

function openProjectDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = indexedDB.open(IDB_PROJECTS_DB, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_PROJECTS_STORE)) {
        db.createObjectStore(IDB_PROJECTS_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveProjectToIndexedDb(project: VideoProject): Promise<void> {
  try {
    const db = await openProjectDB();
    const tx = db.transaction(IDB_PROJECTS_STORE, 'readwrite');
    tx.objectStore(IDB_PROJECTS_STORE).put(project);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[VideoProjectStore] IndexedDB save notice:', err);
  }
}

async function getAllProjectsFromIndexedDb(): Promise<VideoProject[]> {
  try {
    const db = await openProjectDB();
    const tx = db.transaction(IDB_PROJECTS_STORE, 'readonly');
    const req = tx.objectStore(IDB_PROJECTS_STORE).getAll();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return req.result || [];
  } catch (err) {
    console.warn('[VideoProjectStore] IndexedDB read notice:', err);
    return [];
  }
}

async function deleteProjectFromIndexedDb(id: string): Promise<void> {
  try {
    const db = await openProjectDB();
    const tx = db.transaction(IDB_PROJECTS_STORE, 'readwrite');
    tx.objectStore(IDB_PROJECTS_STORE).delete(id);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {}
}

/**
 * Strips all undefined properties recursively so Firestore setDoc never rejects the payload
 */
function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(JSON.stringify(data));
}

const MAX_INLINE_DATA_SIZE = 25000; // 25KB threshold per field for Firestore

/**
 * Truncates / offloads large base64 strings from project document
 * so Firestore never exceeds its strict 1MB (1,048,576 bytes) document limit.
 */
function sanitizeProjectForFirestore(project: VideoProject): any {
  const sanitizeUrl = (url?: string): string | undefined => {
    if (!url) return url;
    if (url.startsWith('data:') && url.length > MAX_INLINE_DATA_SIZE) {
      return `[local_cached_data_uri_${url.slice(5, 20)}_${url.length}b]`;
    }
    return url;
  };

  const cleanScenes = (project.scenes || []).map(scene => ({
    ...scene,
    backgroundMediaUrl: sanitizeUrl(scene.backgroundMediaUrl),
    customAvatarImageUrl: sanitizeUrl(scene.customAvatarImageUrl),
    renderedAudioUrl: sanitizeUrl(scene.renderedAudioUrl),
    renderedVideoUrl: sanitizeUrl(scene.renderedVideoUrl)
  }));

  return {
    ...project,
    referenceImageUrl: sanitizeUrl(project.referenceImageUrl),
    scenes: cleanScenes
  };
}

/**
 * Hydrates a project with full local media URLs if they were placeholder-sanitized for Firestore,
 * and recovers any missing TTS audio/video from Media Gallery Hub IndexedDB cache.
 */
function hydrateProjectWithLocalData(
  project: VideoProject,
  localList: VideoProject[],
  mediaVaultItems: MediaItem[] = []
): VideoProject {
  const localMatch = localList.find(p => p.id === project.id);

  const restoreUrl = (
    serverUrl?: string,
    localUrl?: string,
    sceneId?: string,
    assetType?: 'audio' | 'image' | 'video'
  ): string | undefined => {
    if (localUrl && !localUrl.startsWith('[local_cached_data_uri_')) {
      return localUrl;
    }
    if (serverUrl && !serverUrl.startsWith('[local_cached_data_uri_')) {
      return serverUrl;
    }
    // Search in Media Gallery Hub IndexedDB for this scene's audio or media
    if (sceneId && mediaVaultItems.length > 0) {
      const match = mediaVaultItems.find(
        m => m.metadata?.sceneId === sceneId && (assetType ? m.type === assetType : true)
      );
      if (match?.url) return match.url;
    }
    return localUrl || serverUrl;
  };

  const hydratedScenes = (project.scenes || []).map((scene, idx) => {
    const localScene = localMatch?.scenes?.find(s => s.id === scene.id) || localMatch?.scenes?.[idx];

    return {
      ...scene,
      backgroundMediaUrl: restoreUrl(scene.backgroundMediaUrl, localScene?.backgroundMediaUrl, scene.id, 'image'),
      customAvatarImageUrl: restoreUrl(scene.customAvatarImageUrl, localScene?.customAvatarImageUrl, scene.id, 'image'),
      renderedAudioUrl: restoreUrl(scene.renderedAudioUrl, localScene?.renderedAudioUrl, scene.id, 'audio'),
      renderedVideoUrl: restoreUrl(scene.renderedVideoUrl, localScene?.renderedVideoUrl, scene.id, 'video')
    };
  });

  return {
    ...project,
    referenceImageUrl: restoreUrl(project.referenceImageUrl, localMatch?.referenceImageUrl, undefined, 'image'),
    scenes: hydratedScenes
  };
}

export async function fetchAllProjects(db?: Firestore): Promise<VideoProject[]> {
  // 1. Fetch from high-capacity IndexedDB first
  const idbProjects = await getAllProjectsFromIndexedDb();
  
  // 2. Fallback to LocalStorage
  const localRaw = localStorage.getItem('comona_video_studio_projects');
  const lsProjects: VideoProject[] = localRaw ? JSON.parse(localRaw) : [];
  
  // Merge IndexedDB and LocalStorage
  const localProjects: VideoProject[] = [...idbProjects];
  lsProjects.forEach(lp => {
    if (!localProjects.some(p => p.id === lp.id)) {
      localProjects.push(lp);
    }
  });

  // 3. Fetch Media Gallery items for automatic media restoration
  let mediaVaultItems: MediaItem[] = [];
  try {
    mediaVaultItems = await MediaIndexedDbService.getAllMedia();
  } catch {}

  if (!db) {
    return localProjects.map(p => hydrateProjectWithLocalData(p, localProjects, mediaVaultItems));
  }

  try {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const projects: VideoProject[] = [];
    snapshot.forEach(d => {
      const serverProj = { id: d.id, ...(d.data() as any) };
      const hydrated = hydrateProjectWithLocalData(serverProj, localProjects, mediaVaultItems);
      projects.push(hydrated);
      // Keep IndexedDB synchronized with the hydrated full project
      saveProjectToIndexedDb(hydrated);
    });

    // If local projects has items not yet in Firestore, merge them
    localProjects.forEach(localP => {
      if (!projects.some(p => p.id === localP.id)) {
        const hydratedLocal = hydrateProjectWithLocalData(localP, localProjects, mediaVaultItems);
        projects.push(hydratedLocal);
      }
    });

    return projects;
  } catch (err) {
    console.warn('[VideoProjectStore] Firestore read notice, using local cache:', err);
    return localProjects.map(p => hydrateProjectWithLocalData(p, localProjects, mediaVaultItems));
  }
}

export function subscribeProjects(
  db: Firestore,
  onData: (projects: VideoProject[]) => void
): () => void {
  // Load initial local cache
  (async () => {
    const idbProjects = await getAllProjectsFromIndexedDb();
    let mediaVaultItems: MediaItem[] = [];
    try {
      mediaVaultItems = await MediaIndexedDbService.getAllMedia();
    } catch {}

    const localRaw = localStorage.getItem('comona_video_studio_projects');
    const lsProjects: VideoProject[] = localRaw ? JSON.parse(localRaw) : [];
    const localProjects = [...idbProjects];
    lsProjects.forEach(lp => {
      if (!localProjects.some(p => p.id === lp.id)) localProjects.push(lp);
    });

    try {
      const q = query(collection(db, PROJECTS_COLLECTION), orderBy('updatedAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const projects: VideoProject[] = [];
          snapshot.forEach((d) => {
            const serverProj = { id: d.id, ...(d.data() as any) };
            const hydrated = hydrateProjectWithLocalData(serverProj, localProjects, mediaVaultItems);
            projects.push(hydrated);
            saveProjectToIndexedDb(hydrated);
          });
          onData(projects);
        },
        (err) => {
          console.warn('[VideoProjectStore] Real-time projects listener notice:', err);
        }
      );
    } catch {
      return () => {};
    }
  })();

  return () => {};
}

export async function saveProject(project: VideoProject, db?: Firestore): Promise<void> {
  const updated = {
    ...project,
    updatedAt: new Date().toISOString()
  };

  const cleanPayload = cleanForFirestore(updated);

  // 1. Save full binary project to IndexedDB (zero quota limits)
  await saveProjectToIndexedDb(cleanPayload);

  // 2. Save to local storage cache as secondary fallback
  try {
    const local = localStorage.getItem('comona_video_studio_projects');
    const list: VideoProject[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) list[idx] = cleanPayload;
    else list.unshift(cleanPayload);
    localStorage.setItem('comona_video_studio_projects', JSON.stringify(list));
  } catch {}

  // 3. Save sanitized, size-safe payload to Firestore (well under 1MB limit)
  if (db) {
    try {
      const firestoreSafePayload = cleanForFirestore(sanitizeProjectForFirestore(cleanPayload));
      const ref = doc(db, PROJECTS_COLLECTION, project.id);
      await setDoc(ref, firestoreSafePayload, { merge: true });
    } catch (err) {
      console.warn('[VideoProjectStore] Firestore save notice:', err);
    }
  }
}

export async function deleteProject(projectId: string, db?: Firestore): Promise<void> {
  await deleteProjectFromIndexedDb(projectId);

  try {
    const local = localStorage.getItem('comona_video_studio_projects');
    if (local) {
      const list: VideoProject[] = JSON.parse(local);
      const filtered = list.filter(p => p.id !== projectId);
      localStorage.setItem('comona_video_studio_projects', JSON.stringify(filtered));
    }
  } catch {}

  if (db) {
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
    } catch (err) {
      console.warn('[VideoProjectStore] Firestore delete notice:', err);
    }
  }
}

/**
 * Generic sync for any Image, Video, or Audio asset to Media Gallery Hub
 */
export async function syncAssetToMediaGallery(
  db: Firestore | undefined,
  params: {
    url: string;
    title: string;
    projectId: string;
    sceneId: string;
    sceneNumber?: number;
    assetType: 'image' | 'video' | 'audio';
    generator: 'imagen3_banana_pro' | 'google_veo' | 'heygen_avatar' | 'heygen_photo_avatar' | 'google_tts';
    mimeType?: string;
    scriptText?: string;
    subtitleText?: string;
    tags?: string[];
  }
): Promise<void> {
  if (!params.url) return;

  const typeExtensions = {
    image: 'jpg',
    video: 'mp4',
    audio: 'wav'
  };

  const folderIds = {
    image: 'banana_pro_images',
    video: 'ai_videos',
    audio: 'google_tts_audios'
  };

  const folderNames = {
    image: 'תמונות ורקעים AI (Banana Pro)',
    video: 'הפקות וידאו ואווטאר (SDO Studio)',
    audio: 'קריינות ודיבוב קולי (Google TTS)'
  };

  const narration = params.scriptText || params.subtitleText;
  const audioDisplayName = narration 
    ? (narration.length > 60 ? `${narration.slice(0, 60)}...` : narration)
    : params.title;

  const ext = typeExtensions[params.assetType];
  const baseTitle = params.title ? params.title.replace(/\.[a-zA-Z0-9]+$/, '') : 'Asset';
  const itemName = params.assetType === 'audio' 
    ? `${audioDisplayName}.${ext}` 
    : `${baseTitle}.${ext}`;

  const nowMs = Date.now();
  const mediaId = `media_${params.generator}_${nowMs}_${Math.random().toString(36).substr(2, 5)}`;
  
  const mediaDoc: MediaItem = {
    id: mediaId,
    name: itemName,
    url: params.url,
    thumbnailUrl: params.assetType === 'image' ? params.url : undefined,
    type: params.assetType,
    mimeType: params.mimeType || (params.assetType === 'image' ? 'image/jpeg' : params.assetType === 'audio' ? 'audio/wav' : 'video/mp4'),
    sizeBytes: params.url.startsWith('data:') ? Math.round(params.url.length * 0.75) : 512 * 1024,
    folderId: folderIds[params.assetType],
    folderName: folderNames[params.assetType],
    description: narration || params.title,
    sourceModule: 'video-producer-studio',
    sourceModuleLabel: 'סטודיו וידאו ואווטאר (HeyGen & Veo)',
    tags: [
      params.generator,
      params.assetType,
      'sdo_studio',
      params.projectId,
      `scene_${params.sceneNumber || 1}`,
      ...(params.tags || [])
    ],
    metadata: {
      projectId: params.projectId,
      sceneId: params.sceneId,
      sceneNumber: params.sceneNumber,
      scriptText: narration,
      subtitleText: narration,
      generator: params.generator,
      source: 'sdo_video_producer'
    },
    createdAt: nowMs,
    updatedAt: nowMs
  };

  const cleanDoc = cleanForFirestore(mediaDoc);

  // 1. Sync to local IndexedDB (zero latency)
  try {
    await MediaIndexedDbService.saveMedia(cleanDoc);
  } catch (idbErr) {
    console.warn('[VideoProjectStore] IndexedDB save notice:', idbErr);
  }

  // 2. Sync to local cache
  try {
    const local = localStorage.getItem('comona_media_gallery_items');
    const list = local ? JSON.parse(local) : [];
    list.unshift(cleanDoc);
    localStorage.setItem('comona_media_gallery_items', JSON.stringify(list));
  } catch {}

  // 3. Sync to Firestore (sdo_media_items)
  if (db) {
    try {
      const docForFirestore = {
        ...cleanDoc,
        url: cleanDoc.url?.startsWith('data:') && cleanDoc.url.length > 30000
          ? `[local_cached_data_${mediaId}]`
          : cleanDoc.url,
        thumbnailUrl: cleanDoc.thumbnailUrl?.startsWith('data:') && cleanDoc.thumbnailUrl.length > 30000
          ? `[local_cached_data_${mediaId}]`
          : cleanDoc.thumbnailUrl
      };
      await setDoc(doc(db, MEDIA_ITEMS_COLLECTION, mediaId), docForFirestore, { merge: true });
    } catch (err) {
      console.warn('[VideoProjectStore] Media Gallery Firestore save notice:', err);
    }
  }

  // 4. Dispatch instant cross-module event to live gallery views
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sdo_media_updated', { detail: cleanDoc }));
  }
}

export async function syncRenderedVideoToMediaGallery(
  db: Firestore | undefined,
  projectId: string,
  scene: VideoScene,
  videoUrl: string
): Promise<void> {
  return syncAssetToMediaGallery(db, {
    url: videoUrl,
    title: `סצנה ${scene.sceneNumber}: ${scene.title}`,
    projectId,
    sceneId: scene.id,
    sceneNumber: scene.sceneNumber,
    assetType: 'video',
    generator: scene.isPhotoAvatar ? 'heygen_photo_avatar' : 'heygen_avatar',
    mimeType: 'video/mp4',
    tags: [scene.avatarId || 'Wayne', 'heygen']
  });
}

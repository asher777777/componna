import { Firestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { VideoProject, VideoScene } from '../types';
import { MediaIndexedDbService } from '../../media-gallery-hub/services/mediaIndexedDbService';
import { MediaItem } from '../../media-gallery-hub/types';

const PROJECTS_COLLECTION = 'sdo_video_projects';
const MEDIA_ITEMS_COLLECTION = 'sdo_media_items';

/**
 * Strips all undefined properties recursively so Firestore setDoc never rejects the payload
 */
function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(JSON.stringify(data));
}

export async function fetchAllProjects(db?: Firestore): Promise<VideoProject[]> {
  if (!db) {
    const local = localStorage.getItem('comona_video_studio_projects');
    return local ? JSON.parse(local) : [];
  }

  try {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const projects: VideoProject[] = [];
    snapshot.forEach(d => {
      projects.push({ id: d.id, ...(d.data() as any) });
    });
    return projects;
  } catch (err) {
    console.warn('[VideoProjectStore] Firestore read notice, using local cache:', err);
    const local = localStorage.getItem('comona_video_studio_projects');
    return local ? JSON.parse(local) : [];
  }
}

export async function saveProject(project: VideoProject, db?: Firestore): Promise<void> {
  const updated = {
    ...project,
    updatedAt: new Date().toISOString()
  };

  const cleanPayload = cleanForFirestore(updated);

  // Save to local cache
  try {
    const local = localStorage.getItem('comona_video_studio_projects');
    const list: VideoProject[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) list[idx] = cleanPayload;
    else list.unshift(cleanPayload);
    localStorage.setItem('comona_video_studio_projects', JSON.stringify(list));
  } catch {}

  // Save to Firestore
  if (db) {
    try {
      const ref = doc(db, PROJECTS_COLLECTION, project.id);
      await setDoc(ref, cleanPayload, { merge: true });
    } catch (err) {
      console.warn('[VideoProjectStore] Firestore save notice:', err);
    }
  }
}

export async function deleteProject(projectId: string, db?: Firestore): Promise<void> {
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
      await setDoc(doc(db, MEDIA_ITEMS_COLLECTION, mediaId), cleanDoc, { merge: true });
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

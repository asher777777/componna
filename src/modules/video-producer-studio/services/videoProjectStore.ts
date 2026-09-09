import { Firestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { VideoProject, VideoScene } from '../types';

const PROJECTS_COLLECTION = 'sdo_video_projects';
const MEDIA_ITEMS_COLLECTION = 'sdo_media_items';

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

  // Save to local cache
  try {
    const local = localStorage.getItem('comona_video_studio_projects');
    const list: VideoProject[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) list[idx] = updated;
    else list.unshift(updated);
    localStorage.setItem('comona_video_studio_projects', JSON.stringify(list));
  } catch {}

  // Save to Firestore
  if (db) {
    try {
      const ref = doc(db, PROJECTS_COLLECTION, project.id);
      await setDoc(ref, updated, { merge: true });
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
    tags?: string[];
  }
): Promise<void> {
  if (!params.url) return;

  const typeLabels = {
    image: 'תמונת AI (Banana Pro)',
    video: params.generator === 'google_veo' ? 'סרטון AI (Google Veo)' : 'אווטאר AI (HeyGen)',
    audio: 'קריינות AI (Google TTS)'
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

  const mediaId = `media_${params.generator}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const mediaDoc = {
    id: mediaId,
    name: `${params.title} - ${typeLabels[params.assetType]}`,
    url: params.url,
    type: params.assetType,
    mimeType: params.mimeType || (params.assetType === 'image' ? 'image/jpeg' : params.assetType === 'audio' ? 'audio/mp3' : 'video/mp4'),
    folderId: folderIds[params.assetType],
    folderName: folderNames[params.assetType],
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
      generator: params.generator,
      source: 'sdo_video_producer'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Sync to local cache
  try {
    const local = localStorage.getItem('comona_media_gallery_items');
    const list = local ? JSON.parse(local) : [];
    list.unshift(mediaDoc);
    localStorage.setItem('comona_media_gallery_items', JSON.stringify(list));
  } catch {}

  // Sync to Firestore
  if (db) {
    try {
      await setDoc(doc(db, MEDIA_ITEMS_COLLECTION, mediaId), mediaDoc, { merge: true });
      console.log(`[VideoStudio] Synced ${params.assetType} asset to media gallery (${MEDIA_ITEMS_COLLECTION}):`, mediaId);
    } catch (err) {
      console.warn('[VideoStudio] Firestore Media gallery sync notice:', err);
    }
  }
}

/**
 * Backward compatibility wrapper
 */
export async function syncRenderedVideoToMediaGallery(
  db: Firestore | undefined,
  params: {
    videoUrl: string;
    title: string;
    projectId: string;
    sceneId: string;
    aspectRatio?: string;
    avatarName?: string;
  }
): Promise<void> {
  return syncAssetToMediaGallery(db, {
    url: params.videoUrl,
    title: params.title,
    projectId: params.projectId,
    sceneId: params.sceneId,
    assetType: 'video',
    generator: 'heygen_avatar',
    tags: [params.avatarName || 'AI Presenter']
  });
}

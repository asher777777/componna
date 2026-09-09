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
 * Synchronizes a rendered scene/video asset directly into `sdo_media_items`
 * so that it immediately becomes visible in Media Gallery Hub!
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
  if (!db || !params.videoUrl) return;

  try {
    const mediaId = `media_heygen_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const mediaDoc = {
      id: mediaId,
      name: `${params.title} (HeyGen Avatar)`,
      url: params.videoUrl,
      type: 'video',
      mimeType: 'video/mp4',
      folderId: 'heygen_creations',
      folderName: 'הפקות וידאו ואווטאר (SDO Studio)',
      tags: ['heygen', 'ai_avatar', 'video_producer', params.projectId],
      metadata: {
        projectId: params.projectId,
        sceneId: params.sceneId,
        avatar: params.avatarName || 'AI Presenter',
        aspectRatio: params.aspectRatio || '16:9',
        source: 'sdo_video_producer'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, MEDIA_ITEMS_COLLECTION, mediaId), mediaDoc, { merge: true });
    console.log(`[VideoStudio] Synced video asset to media gallery (${MEDIA_ITEMS_COLLECTION}):`, mediaId);
  } catch (err) {
    console.warn('[VideoStudio] Media gallery sync notice:', err);
  }
}

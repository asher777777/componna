import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { MediaItem, MediaFolder, MediaGalleryCollectionsConfig } from '../types';
import { resolveMediaCollections } from '../config';
import { resolveSafeMediaUrl, isAlienBlobUrl, getPermanentMediaUrl } from '../utils/mediaUrlSanitizer';

export class FirestoreMediaService {
  private static cleanUndefinedFields<T extends Record<string, any>>(obj: T): T {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          cleaned[key] = this.cleanUndefinedFields(val);
        } else {
          cleaned[key] = val;
        }
      }
    }
    return cleaned as T;
  }

  static async fetchMediaItems(
    db: Firestore,
    collections?: MediaGalleryCollectionsConfig
  ): Promise<MediaItem[]> {
    const collNames = resolveMediaCollections(undefined, collections);
    try {
      const collRef = collection(db, collNames.mediaItems);
      let snapshot;
      try {
        const q = query(collRef, orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch (idxErr) {
        snapshot = await getDocs(collRef);
      }

      const items: MediaItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as MediaItem;
        const rawItem: MediaItem = { ...data, id: docSnap.id };

        // Sanitize alien localhost/stale blob URLs
        const safeUrl = resolveSafeMediaUrl(rawItem.url, rawItem);
        const safeThumb = resolveSafeMediaUrl(rawItem.thumbnailUrl, rawItem);

        const sanitizedItem: MediaItem = {
          ...rawItem,
          url: safeUrl || rawItem.url,
          thumbnailUrl: safeThumb || rawItem.thumbnailUrl,
        };

        // Self-healing: if Firestore was storing an invalid blob URL, repair it in the database
        if (isAlienBlobUrl(rawItem.url) || rawItem.url?.startsWith('blob:')) {
          if (safeUrl && !safeUrl.startsWith('blob:')) {
            updateDoc(doc(db, collNames.mediaItems, docSnap.id), {
              url: safeUrl,
              thumbnailUrl: safeThumb || safeUrl,
              updatedAt: Date.now(),
            }).catch(() => {});
          }
        }

        items.push(sanitizedItem);
      });

      return items;
    } catch (err) {
      console.warn('[FirestoreMediaService] Error fetching media items:', err);
      return [];
    }
  }

  static async saveMediaItem(
    db: Firestore,
    collections: MediaGalleryCollectionsConfig | undefined,
    item: MediaItem
  ): Promise<void> {
    const collNames = resolveMediaCollections(undefined, collections);
    const docRef = doc(db, collNames.mediaItems, item.id);
    
    // Create copy and remove oversized base64 dataUrl from metadata if present
    const cleanItem = { ...item };
    if (cleanItem.metadata && typeof cleanItem.metadata === 'object') {
      const meta = { ...cleanItem.metadata };
      if (typeof meta.dataUrl === 'string' && meta.dataUrl.startsWith('data:')) {
        delete meta.dataUrl;
      }
      cleanItem.metadata = meta;
    }

    // Never persist ephemeral or alien blob: URLs into Firestore
    if (cleanItem.url?.startsWith('blob:')) {
      cleanItem.url = getPermanentMediaUrl(cleanItem);
    }
    if (cleanItem.thumbnailUrl?.startsWith('blob:')) {
      cleanItem.thumbnailUrl = getPermanentMediaUrl(cleanItem);
    }

    const sanitized = this.cleanUndefinedFields({
      ...cleanItem,
      updatedAt: Date.now(),
    });
    await setDoc(docRef, sanitized, { merge: true });
  }

  static async deleteMediaItem(
    db: Firestore,
    collections: MediaGalleryCollectionsConfig | undefined,
    itemId: string
  ): Promise<void> {
    const collNames = resolveMediaCollections(undefined, collections);
    const docRef = doc(db, collNames.mediaItems, itemId);
    await deleteDoc(docRef);
  }

  static async updateMediaMetadata(
    db: Firestore,
    collections: MediaGalleryCollectionsConfig | undefined,
    itemId: string,
    updates: Partial<MediaItem>
  ): Promise<void> {
    const collNames = resolveMediaCollections(undefined, collections);
    const docRef = doc(db, collNames.mediaItems, itemId);
    const sanitized = this.cleanUndefinedFields({
      ...updates,
      updatedAt: Date.now(),
    });
    await updateDoc(docRef, sanitized);
  }

  // --- FOLDER MANAGEMENT ---

  static async fetchFolders(
    db: Firestore,
    collections?: MediaGalleryCollectionsConfig
  ): Promise<MediaFolder[]> {
    const collNames = resolveMediaCollections(undefined, collections);
    try {
      const collRef = collection(db, collNames.folders);
      const snapshot = await getDocs(collRef);
      const folders: MediaFolder[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as MediaFolder;
        folders.push({ ...data, id: docSnap.id });
      });
      return folders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (err) {
      console.warn('[FirestoreMediaService] Error fetching folders:', err);
      return [];
    }
  }

  static async saveFolder(
    db: Firestore,
    collections: MediaGalleryCollectionsConfig | undefined,
    folder: MediaFolder
  ): Promise<void> {
    const collNames = resolveMediaCollections(undefined, collections);
    const docRef = doc(db, collNames.folders, folder.id);
    const sanitized = this.cleanUndefinedFields({
      ...folder,
      updatedAt: Date.now(),
    });
    await setDoc(docRef, sanitized, { merge: true });
  }

  static async deleteFolder(
    db: Firestore,
    collections: MediaGalleryCollectionsConfig | undefined,
    folderId: string
  ): Promise<void> {
    const collNames = resolveMediaCollections(undefined, collections);
    const docRef = doc(db, collNames.folders, folderId);
    await deleteDoc(docRef);
  }

  static subscribeMediaItems(
    db: Firestore,
    onData: (items: MediaItem[]) => void,
    collections?: MediaGalleryCollectionsConfig
  ): () => void {
    const collNames = resolveMediaCollections(undefined, collections);
    try {
      const collRef = collection(db, collNames.mediaItems);
      const q = query(collRef, orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const items: MediaItem[] = [];
          snapshot.forEach((docSnap) => {
            const raw = { ...(docSnap.data() as MediaItem), id: docSnap.id };
            const safeUrl = resolveSafeMediaUrl(raw.url, raw);
            const safeThumb = resolveSafeMediaUrl(raw.thumbnailUrl, raw);
            items.push({
              ...raw,
              url: safeUrl || raw.url,
              thumbnailUrl: safeThumb || raw.thumbnailUrl,
            });
          });
          onData(items);
        },
        (err) => {
          console.warn('[FirestoreMediaService] Real-time media listener notice:', err);
        }
      );
    } catch {
      return () => {};
    }
  }

  static subscribeFolders(
    db: Firestore,
    onData: (folders: MediaFolder[]) => void,
    collections?: MediaGalleryCollectionsConfig
  ): () => void {
    const collNames = resolveMediaCollections(undefined, collections);
    try {
      const collRef = collection(db, collNames.folders);
      return onSnapshot(
        collRef,
        (snapshot) => {
          const folders: MediaFolder[] = [];
          snapshot.forEach((docSnap) => {
            folders.push({ ...(docSnap.data() as MediaFolder), id: docSnap.id });
          });
          folders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          onData(folders);
        },
        (err) => {
          console.warn('[FirestoreMediaService] Real-time folders listener notice:', err);
        }
      );
    } catch {
      return () => {};
    }
  }
}
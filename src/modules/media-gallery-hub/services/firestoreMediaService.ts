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
} from 'firebase/firestore';
import { MediaItem, MediaGalleryCollectionsConfig } from '../types';
import { resolveMediaCollections } from '../config';

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
        items.push({ ...data, id: docSnap.id });
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
    const sanitized = this.cleanUndefinedFields({
      ...item,
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
}
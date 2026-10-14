import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { KosTubeChannel, KosTubeVideo, KosTubeSeoPage } from '../types';

export const kosTubeFirestore = {
  /**
   * Saves or updates channel info under tenant scope
   */
  async saveChannel(db: Firestore | null | undefined, tenantId: string, channel: KosTubeChannel): Promise<void> {
    if (!db) return;
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_CHANNELS);
      const docRef = doc(colRef, channel.id);
      await setDoc(
        docRef,
        {
          ...channel,
          updatedAt: new Date().toISOString(),
          _serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[KosTube] saveChannel failed:', err);
    }
  },

  /**
   * Retrieves the active connected YouTube channel
   */
  async getChannel(db: Firestore | null | undefined, tenantId: string): Promise<KosTubeChannel | null> {
    if (!db) return null;
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_CHANNELS);
      const snapshot = await getDocs(query(colRef, limit(1)));
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as KosTubeChannel;
      }
    } catch (err) {
      console.warn('[KosTube] getChannel failed:', err);
    }
    return null;
  },

  /**
   * Saves or batches videos under tenant scope
   */
  async saveVideos(db: Firestore | null | undefined, tenantId: string, videos: KosTubeVideo[]): Promise<void> {
    if (!db || videos.length === 0) return;
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS);
      for (const vid of videos) {
        const docRef = doc(colRef, vid.id);
        await setDoc(
          docRef,
          {
            ...vid,
            updatedAt: new Date().toISOString(),
            _serverUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('[KosTube] saveVideos failed:', err);
    }
  },

  /**
   * Retrieves all videos for a channel under tenant scope
   */
  async getVideos(db: Firestore | null | undefined, tenantId: string, channelId?: string): Promise<KosTubeVideo[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS);
      let q = query(colRef, orderBy('publishedAt', 'desc'), limit(50));
      if (channelId) {
        q = query(colRef, where('channelId', '==', channelId), orderBy('publishedAt', 'desc'), limit(50));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as KosTubeVideo);
    } catch (err) {
      console.warn('[KosTube] getVideos failed:', err);
      return [];
    }
  },

  /**
   * Saves a generated SEO page under tenant scope
   */
  async saveSeoPage(db: Firestore | null | undefined, tenantId: string, page: KosTubeSeoPage): Promise<void> {
    if (!db) return;
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_PAGES);
      const docRef = doc(colRef, page.id);
      await setDoc(
        docRef,
        {
          ...page,
          updatedAt: new Date().toISOString(),
          _serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Update corresponding video status
      const vColRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS);
      const vDocRef = doc(vColRef, page.videoId);
      await updateDoc(vDocRef, {
        status: 'processed',
        seoPageId: page.id,
        seoPageSlug: page.slug,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[KosTube] saveSeoPage failed:', err);
    }
  },

  /**
   * Retrieves all generated SEO pages
   */
  async getSeoPages(db: Firestore | null | undefined, tenantId: string): Promise<KosTubeSeoPage[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_PAGES);
      const snapshot = await getDocs(query(colRef, orderBy('createdAt', 'desc'), limit(100)));
      return snapshot.docs.map((d) => d.data() as KosTubeSeoPage);
    } catch (err) {
      console.warn('[KosTube] getSeoPages failed:', err);
      return [];
    }
  },

  /**
   * Retrieves an SEO page by slug
   */
  async getSeoPageBySlug(db: Firestore | null | undefined, tenantId: string, slug: string): Promise<KosTubeSeoPage | null> {
    if (!db || !slug) return null;
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_PAGES);
      const q = query(colRef, where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as KosTubeSeoPage;
      }
    } catch (err) {
      console.warn('[KosTube] getSeoPageBySlug failed:', err);
    }
    return null;
  },

  /**
   * Deletes an SEO page
   */
  async deleteSeoPage(db: Firestore | null | undefined, tenantId: string, pageId: string, videoId?: string): Promise<void> {
    if (!db || !pageId) return;
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_PAGES);
      await deleteDoc(doc(colRef, pageId));

      if (videoId) {
        const vColRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS);
        await updateDoc(doc(vColRef, videoId), {
          status: 'pending',
          seoPageId: null,
          seoPageSlug: null,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('[KosTube] deleteSeoPage failed:', err);
    }
  },
};

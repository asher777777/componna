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
  increment,
} from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { KosTubeChannel, KosTubeVideo, KosTubeSeoPage } from '../types';

export const kosTubeFirestore = {
  /**
   * Saves or updates channel info under tenant scope (keeps only 1 active channel per tenant)
   */
  async saveChannel(db: Firestore | null | undefined, tenantId: string, channel: KosTubeChannel): Promise<void> {
    if (!db) return;
    try {
      const colRef = collection(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.KOS_TUBE_CHANNELS);

      // Clean up previous channel docs for this tenant so there is only one active connected channel
      try {
        const existingSnap = await getDocs(colRef);
        for (const existingDoc of existingSnap.docs) {
          if (existingDoc.id !== channel.id) {
            await deleteDoc(existingDoc.ref);
          }
        }
      } catch (cleanErr) {
        console.warn('[KosTube] Could not clean old channel docs:', cleanErr);
      }

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
   * Retrieves the active connected YouTube channel for this tenant
   */
  async getChannel(db: Firestore | null | undefined, tenantId: string): Promise<KosTubeChannel | null> {
    if (!db) return null;
    try {
      const colRef = collection(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.KOS_TUBE_CHANNELS);
      const snapshot = await getDocs(query(colRef, orderBy('updatedAt', 'desc'), limit(1)));
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as KosTubeChannel;
      }
    } catch (err) {
      console.warn('[KosTube] getChannel failed:', err);
    }
    return null;
  },

  /**
   * Replaces all videos for a channel under tenant scope
   */
  async replaceVideos(db: Firestore | null | undefined, tenantId: string, videos: KosTubeVideo[]): Promise<void> {
    if (!db) return;
    try {
      const colRef = collection(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS);
      // Clean previous videos
      const existingSnap = await getDocs(colRef);
      for (const d of existingSnap.docs) {
        await deleteDoc(d.ref);
      }
      // Save new videos
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
      console.warn('[KosTube] replaceVideos failed:', err);
    }
  },

  /**
   * Saves or batches videos under tenant scope
   */
  async saveVideos(db: Firestore | null | undefined, tenantId: string, videos: KosTubeVideo[]): Promise<void> {
    if (!db || videos.length === 0) return;
    try {
      const colRef = collection(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS);
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
      const colRef = collection(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.KOS_TUBE_VIDEOS);
      let q = query(colRef, orderBy('publishedAt', 'desc'), limit(50));
      if (channelId) {
        q = query(colRef, where('channelId', '==', channelId), orderBy('publishedAt', 'desc'), limit(50));
      }
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as KosTubeVideo);
      }
      return [];
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
      const colRef = collection(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.KOS_TUBE_PAGES);
      const snapshot = await getDocs(query(colRef, orderBy('createdAt', 'desc'), limit(100)));
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as KosTubeSeoPage);
      }
      return [];
    } catch (err) {
      console.warn('[KosTube] getSeoPages failed:', err);
      return [];
    }
  },

  /**
   * Retrieves an SEO page by slug (supports case-insensitive check and clean slugs)
   */
  async getSeoPageBySlug(db: Firestore | null | undefined, tenantId: string, slug: string): Promise<KosTubeSeoPage | null> {
    if (!db || !slug) return null;
    try {
      const colRef = collection(db, 'tenants', tenantId || '_master', SYSTEM_COLLECTIONS.KOS_TUBE_PAGES);
      // 1. Direct match
      const q = query(colRef, where('slug', '==', slug), limit(1));
      let snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as KosTubeSeoPage;
      }

      // 2. Lowercase / Uppercase fallback
      const lowerQ = query(colRef, where('slug', '==', slug.toLowerCase()), limit(1));
      snapshot = await getDocs(lowerQ);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as KosTubeSeoPage;
      }

      // 3. If slug is kosvidio, check for Kosvidio
      if (slug.toLowerCase() === 'kosvidio') {
        const titleQ = query(colRef, where('slug', '==', 'Kosvidio'), limit(1));
        snapshot = await getDocs(titleQ);
        if (!snapshot.empty) {
          return snapshot.docs[0].data() as KosTubeSeoPage;
        }
      }
    } catch (err) {
      console.warn('[KosTube] getSeoPageBySlug failed:', err);
    }
    return null;
  },

  /**
   * Increments real page views counter in Firestore
   */
  async incrementPageViews(db: Firestore | null | undefined, tenantId: string, pageId: string, pageBuilderPageId?: string): Promise<void> {
    if (!db || !pageId) return;
    try {
      const colRef = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.KOS_TUBE_PAGES);
      const docRef = doc(colRef, pageId);
      await updateDoc(docRef, {
        pageViewsCount: increment(1),
        updatedAt: new Date().toISOString(),
      });

      // Also sync to PAGES collection if linked
      if (pageBuilderPageId) {
        try {
          const pbCol = collection(db, 'tenants', tenantId, SYSTEM_COLLECTIONS.PAGES);
          await updateDoc(doc(pbCol, pageBuilderPageId), {
            viewsCount: increment(1),
          });
        } catch (_) {}
      }
    } catch (err) {
      console.warn('[KosTube] incrementPageViews failed:', err);
    }
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

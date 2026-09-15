import { Firestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, updateDoc, increment } from 'firebase/firestore';
import { PageBuilderConfig } from '../types/pageBuilder.types';

const COLLECTION_NAME = 'mod_pagebuilder_pages';
const LOCAL_STORAGE_KEY_PAGES = 'comona_pagebuilder_all_pages';

export const pageBuilderFirestore = {
  // Get all saved pages
  async getAllPages(db?: Firestore | null): Promise<PageBuilderConfig[]> {
    if (db) {
      try {
        const colRef = collection(db, COLLECTION_NAME);
        const snap = await getDocs(colRef);
        const pages: PageBuilderConfig[] = [];
        snap.forEach((d) => {
          pages.push({ ...(d.data() as PageBuilderConfig), pageId: d.id });
        });
        if (pages.length > 0) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY_PAGES, JSON.stringify(pages));
          } catch {}
          return pages;
        }
      } catch (err) {
        console.warn('[PageBuilder] Firestore getAllPages error:', err);
      }
    }

    // Fallback to local storage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PAGES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    return [];
  },

  // Get single page by id
  async getPage(pageId: string, db?: Firestore | null): Promise<PageBuilderConfig | null> {
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, pageId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { ...(snap.data() as PageBuilderConfig), pageId: snap.id };
        }
      } catch (err) {
        console.warn('[PageBuilder] Firestore getPage error:', err);
      }
    }

    try {
      const pages = await this.getAllPages(null);
      return pages.find((p) => p.pageId === pageId) || null;
    } catch {}

    return null;
  },

  // Save or update a page
  async savePage(config: PageBuilderConfig, db?: Firestore | null): Promise<void> {
    const pageId = config.pageId || `page_${Date.now()}`;
    const now = new Date().toISOString();
    const payload: PageBuilderConfig = {
      ...config,
      pageId,
      updatedAt: now,
      lastModified: Date.now(),
      createdAt: config.createdAt || now,
    };

    // Save in localStorage
    try {
      const localPages = await this.getAllPages(null);
      const existingIdx = localPages.findIndex((p) => p.pageId === pageId);
      if (existingIdx >= 0) {
        localPages[existingIdx] = payload;
      } else {
        localPages.push(payload);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_PAGES, JSON.stringify(localPages));
    } catch {}

    // Save in Firestore
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, pageId);
        const cleanData = JSON.parse(JSON.stringify(payload));
        await setDoc(docRef, cleanData, { merge: true });
      } catch (err) {
        console.warn('[PageBuilder] Firestore savePage error:', err);
      }
    }
  },

  // Delete page
  async deletePage(pageId: string, db?: Firestore | null): Promise<void> {
    try {
      const localPages = (await this.getAllPages(null)).filter((p) => p.pageId !== pageId);
      localStorage.setItem(LOCAL_STORAGE_KEY_PAGES, JSON.stringify(localPages));
    } catch {}

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, pageId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[PageBuilder] Firestore deletePage error:', err);
      }
    }
  },

  // Duplicate page
  async duplicatePage(sourcePage: PageBuilderConfig, db?: Firestore | null): Promise<PageBuilderConfig> {
    const newId = `page_${Date.now()}`;
    const duplicated: PageBuilderConfig = {
      ...JSON.parse(JSON.stringify(sourcePage)),
      pageId: newId,
      pageTitle: `${sourcePage.pageTitle} (העתק)`,
      slug: `${sourcePage.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      published: false,
      publishedAt: undefined,
      publishedUrl: undefined,
      shortUrl: undefined,
      isHomePage: false,
      viewsCount: 0,
      leadsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.savePage(duplicated, db);
    return duplicated;
  },

  // Set page as homepage
  async setHomePage(targetPageId: string, db?: Firestore | null): Promise<void> {
    const allPages = await this.getAllPages(db);
    for (const page of allPages) {
      const isTarget = page.pageId === targetPageId;
      if (page.isHomePage !== isTarget) {
        page.isHomePage = isTarget;
        await this.savePage(page, db);
      }
    }
  },

  // Toggle publish status
  async togglePublish(config: PageBuilderConfig, db?: Firestore | null): Promise<PageBuilderConfig> {
    const willPublish = !config.published;
    const now = new Date().toISOString();
    const publicSlug = config.slug || config.pageId;
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const publishedUrl = `${currentOrigin}/#/p/${publicSlug}`;

    const updated: PageBuilderConfig = {
      ...config,
      published: willPublish,
      publishedAt: willPublish ? now : undefined,
      publishedUrl: willPublish ? publishedUrl : undefined,
    };

    await this.savePage(updated, db);
    return updated;
  },

  // Track page view
  async incrementViews(pageId: string, db?: Firestore | null): Promise<void> {
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, pageId);
        await updateDoc(docRef, {
          viewsCount: increment(1),
        });
      } catch {}
    }
  },
};

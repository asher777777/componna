import { Firestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, updateDoc, increment } from 'firebase/firestore';
import { PageBuilderConfig } from '../types/pageBuilder.types';

const DEFAULT_COLLECTION_NAME = 'mod_pages_documents';

function getCollectionName(tenantId?: string) {
  return tenantId ? `tenants/${tenantId}/mod_pages_documents` : DEFAULT_COLLECTION_NAME;
}

function getDraftCollectionName(tenantId?: string) {
  return tenantId ? `tenants/${tenantId}/mod_pages_drafts` : 'mod_pages_drafts';
}

function getStorageKey(tenantId?: string) {
  return tenantId ? `kosun_${tenantId}_pagebuilder_all_pages` : 'kosun_pagebuilder_all_pages';
}
function getDraftStorageKey(tenantId?: string) {
  return tenantId ? `kosun_${tenantId}_pagebuilder_drafts` : 'kosun_pagebuilder_drafts';
}
const LOCAL_STORAGE_KEY_PAGES = 'kosun_pagebuilder_all_pages';

export const pageBuilderFirestore = {
  // Get all saved pages
  async getAllPages(db?: Firestore | null, tenantId?: string): Promise<PageBuilderConfig[]> {
    const collPath = getCollectionName(tenantId);
    const storeKey = getStorageKey(tenantId);
    if (db) {
      try {
        const colRef = collection(db, collPath);
        const snap = await getDocs(colRef);
        const pages: PageBuilderConfig[] = [];
        snap.forEach((d) => {
          pages.push({ ...(d.data() as PageBuilderConfig), pageId: d.id });
        });
        if (pages.length > 0) {
          try {
            localStorage.setItem(storeKey, JSON.stringify(pages));
          } catch {}
          return pages;
        }
      } catch (err) {
        console.warn('[PageBuilder] Firestore getAllPages error:', err);
      }
    }

    // Fallback to local storage
    try {
      const saved = localStorage.getItem(storeKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    return [];
  },

  // Get single page by id
  async getPage(pageId: string, db?: Firestore | null, tenantId?: string): Promise<PageBuilderConfig | null> {
    const collPath = getCollectionName(tenantId);
    if (db) {
      try {
        const docRef = doc(db, collPath, pageId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { ...(snap.data() as PageBuilderConfig), pageId: snap.id };
        }
      } catch (err) {
        console.warn('[PageBuilder] Firestore getPage error:', err);
      }
    }

    try {
      const pages = await this.getAllPages(null, tenantId);
      return pages.find((p) => p.pageId === pageId) || null;
    } catch {}

    return null;
  },

  // Save or update a page
  async savePage(config: PageBuilderConfig, db?: Firestore | null, tenantId?: string): Promise<void> {
    const collPath = getCollectionName(tenantId);
    const storeKey = getStorageKey(tenantId);
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
      const localPages = await this.getAllPages(null, tenantId);
      const existingIdx = localPages.findIndex((p) => p.pageId === pageId);
      if (existingIdx >= 0) {
        localPages[existingIdx] = payload;
      } else {
        localPages.push(payload);
      }
      localStorage.setItem(storeKey, JSON.stringify(localPages));
    } catch {}

    // Save in Firestore
    if (db) {
      try {
        const docRef = doc(db, collPath, pageId);
        const cleanData = JSON.parse(JSON.stringify(payload));
        await setDoc(docRef, cleanData, { merge: true });
      } catch (err) {
        console.warn('[PageBuilder] Firestore savePage error:', err);
      }
    }
  },

  // Delete page
  async deletePage(pageId: string, db?: Firestore | null, tenantId?: string): Promise<void> {
    const collPath = getCollectionName(tenantId);
    const storeKey = getStorageKey(tenantId);
    try {
      const localPages = (await this.getAllPages(null, tenantId)).filter((p) => p.pageId !== pageId);
      localStorage.setItem(storeKey, JSON.stringify(localPages));
    } catch {}

    if (db) {
      try {
        const docRef = doc(db, collPath, pageId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[PageBuilder] Firestore deletePage error:', err);
      }
    }
  },

  // Duplicate page
  async duplicatePage(sourcePage: PageBuilderConfig, db?: Firestore | null, tenantId?: string): Promise<PageBuilderConfig> {
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

    await this.savePage(duplicated, db, tenantId);
    return duplicated;
  },

  // Set page as homepage
  async setHomePage(targetPageId: string, db?: Firestore | null, tenantId?: string): Promise<void> {
    const allPages = await this.getAllPages(db, tenantId);
    for (const page of allPages) {
      const isTarget = page.pageId === targetPageId;
      if (page.isHomePage !== isTarget) {
        page.isHomePage = isTarget;
        await this.savePage(page, db, tenantId);
      }
    }
  },

  // Toggle publish status
  async togglePublish(config: PageBuilderConfig, db?: Firestore | null, tenantId?: string): Promise<PageBuilderConfig> {
    const willPublish = !config.published;
    const now = new Date().toISOString();
    const publicSlug = config.slug || config.pageId;
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const publishedUrl = `${currentOrigin}/p/${publicSlug}`;

    const updated: PageBuilderConfig = {
      ...config,
      published: willPublish,
      publishedAt: willPublish ? now : undefined,
      publishedUrl: willPublish ? publishedUrl : undefined,
    };

    await this.savePage(updated, db, tenantId);
    return updated;
  },

  // Track page view
  async incrementViews(pageId: string, db?: Firestore | null, tenantId?: string): Promise<void> {
    const collPath = getCollectionName(tenantId);
    if (db) {
      try {
        const docRef = doc(db, collPath, pageId);
        await updateDoc(docRef, {
          viewsCount: increment(1),
        });
      } catch {}
    }
  },

  // Draft Management
  async saveDraftConfig(config: PageBuilderConfig, db?: Firestore | null, tenantId?: string): Promise<boolean> {
    const draftPath = getDraftCollectionName(tenantId);
    const storeKey = getDraftStorageKey(tenantId);

    try {
      localStorage.setItem(storeKey, JSON.stringify(config));
    } catch {}

    if (db) {
      try {
        const docRef = doc(db, draftPath, config.pageId || 'active_draft');
        await setDoc(docRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
        return true;
      } catch (err) {
        console.error('[PageBuilder] Failed saving draft', err);
        return false;
      }
    }
    return true;
  },

  async loadDraftConfig(db?: Firestore | null, tenantId?: string, pageId: string = 'active_draft'): Promise<PageBuilderConfig | null> {
    const draftPath = getDraftCollectionName(tenantId);
    const storeKey = getDraftStorageKey(tenantId);

    if (db) {
      try {
        const docRef = doc(db, draftPath, pageId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as PageBuilderConfig;
          localStorage.setItem(storeKey, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('[PageBuilder] Could not fetch draft from firestore', err);
      }
    }

    // fallback local
    try {
      const local = localStorage.getItem(storeKey);
      if (local) return JSON.parse(local) as PageBuilderConfig;
    } catch {}

    return null;
  }
};

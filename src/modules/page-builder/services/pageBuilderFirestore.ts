import { Firestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, updateDoc, increment } from 'firebase/firestore';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import { PAGE_BLUEPRINTS } from '../blueprints/pageBlueprints';

const DEFAULT_COLLECTION_NAME = 'mod_pages_documents';

function resolveEffectiveTenant(tenantId?: string): string {
  if (!tenantId || tenantId === ROOT_TENANT_ID || tenantId === '_master') {
    return ROOT_TENANT_ID;
  }
  return tenantId;
}

function getCollectionName(tenantId?: string) {
  const eff = resolveEffectiveTenant(tenantId);
  return eff === ROOT_TENANT_ID ? 'tenants/_master/mod_pages_documents' : `tenants/${eff}/mod_pages_documents`;
}

function getDraftCollectionName(tenantId?: string) {
  const eff = resolveEffectiveTenant(tenantId);
  return eff === ROOT_TENANT_ID ? 'tenants/_master/mod_pages_drafts' : `tenants/${eff}/mod_pages_drafts`;
}

function getStorageKey(tenantId?: string) {
  const eff = resolveEffectiveTenant(tenantId);
  return `kosun_${eff}_pagebuilder_all_pages`;
}

function getDraftStorageKey(tenantId?: string) {
  const eff = resolveEffectiveTenant(tenantId);
  return `kosun_${eff}_pagebuilder_drafts`;
}

const LEGACY_STORAGE_KEY_PAGES = 'kosun_pagebuilder_all_pages';

export const pageBuilderFirestore = {
  // Get all saved pages
  async getAllPages(db?: Firestore | null, tenantId?: string): Promise<PageBuilderConfig[]> {
    const eff = resolveEffectiveTenant(tenantId);
    const collPath = getCollectionName(eff);
    const storeKey = getStorageKey(eff);

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
            if (eff === ROOT_TENANT_ID) {
              localStorage.setItem(LEGACY_STORAGE_KEY_PAGES, JSON.stringify(pages));
            }
          } catch {}
          return pages;
        }

        // If root tenant and no docs in tenants/_master/mod_pages_documents, check legacy root mod_pages_documents
        if (eff === ROOT_TENANT_ID) {
          const legacyRef = collection(db, DEFAULT_COLLECTION_NAME);
          const legacySnap = await getDocs(legacyRef);
          const legacyPages: PageBuilderConfig[] = [];
          legacySnap.forEach((d) => {
            legacyPages.push({ ...(d.data() as PageBuilderConfig), pageId: d.id });
          });
          if (legacyPages.length > 0) {
            try {
              localStorage.setItem(storeKey, JSON.stringify(legacyPages));
              localStorage.setItem(LEGACY_STORAGE_KEY_PAGES, JSON.stringify(legacyPages));
            } catch {}
            return legacyPages;
          }
        }
      } catch (err) {
        console.warn('[PageBuilder] Firestore getAllPages error:', err);
      }
    }

    // Fallback to local storage (both scoped and legacy keys for root tenant)
    try {
      const saved = localStorage.getItem(storeKey) || (eff === ROOT_TENANT_ID ? localStorage.getItem(LEGACY_STORAGE_KEY_PAGES) : null);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    return [];
  },

  // Get single page by id
  async getPage(pageId: string, db?: Firestore | null, tenantId?: string): Promise<PageBuilderConfig | null> {
    const eff = resolveEffectiveTenant(tenantId);
    const collPath = getCollectionName(eff);
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
    const eff = resolveEffectiveTenant(tenantId);
    const collPath = getCollectionName(eff);
    const storeKey = getStorageKey(eff);
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
      const localPages = await this.getAllPages(null, eff);
      const existingIdx = localPages.findIndex((p) => p.pageId === pageId);
      if (existingIdx >= 0) {
        localPages[existingIdx] = payload;
      } else {
        localPages.push(payload);
      }
      localStorage.setItem(storeKey, JSON.stringify(localPages));
      if (eff === ROOT_TENANT_ID) {
        localStorage.setItem(LEGACY_STORAGE_KEY_PAGES, JSON.stringify(localPages));
      }
      if (payload.isHomePage) {
        localStorage.setItem(`kosun_${eff}_active_homepage`, JSON.stringify(payload));
        if (eff === ROOT_TENANT_ID) {
          localStorage.setItem('kosun_active_root_homepage', JSON.stringify(payload));
        }
      }
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
    const eff = resolveEffectiveTenant(tenantId);
    const collPath = getCollectionName(eff);
    const storeKey = getStorageKey(eff);
    try {
      const localPages = (await this.getAllPages(null, eff)).filter((p) => p.pageId !== pageId);
      localStorage.setItem(storeKey, JSON.stringify(localPages));
      if (eff === ROOT_TENANT_ID) {
        localStorage.setItem(LEGACY_STORAGE_KEY_PAGES, JSON.stringify(localPages));
      }
      // If deleted page was homepage, clear homepage pointer
      const explicitId = localStorage.getItem(`${storeKey}_homepage_id`);
      if (explicitId === pageId) {
        localStorage.removeItem(`${storeKey}_homepage_id`);
        localStorage.removeItem(`kosun_${eff}_active_homepage`);
        if (eff === ROOT_TENANT_ID) {
          localStorage.removeItem('kosun_pagebuilder_homepage_id');
          localStorage.removeItem('kosun_active_root_homepage');
        }
      }
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
    const eff = resolveEffectiveTenant(tenantId);
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

    await this.savePage(duplicated, db, eff);
    return duplicated;
  },

  // Get active designated homepage config for a tenant (or root)
  async getHomePage(db?: Firestore | null, tenantId?: string): Promise<PageBuilderConfig | null> {
    const eff = resolveEffectiveTenant(tenantId);
    const storeKey = getStorageKey(eff);
    const allPages = await this.getAllPages(db, eff);
    if (!allPages || allPages.length === 0) {
      return null;
    }

    // 1. Check explicit stored homepage ID
    let explicitId: string | null = null;
    try {
      explicitId = localStorage.getItem(`${storeKey}_homepage_id`);
      if (!explicitId && eff === ROOT_TENANT_ID) {
        explicitId = localStorage.getItem('kosun_pagebuilder_homepage_id');
      }
    } catch {}

    if (explicitId) {
      const page = allPages.find((p) => p.pageId === explicitId);
      if (page) {
        try {
          localStorage.setItem(`kosun_${eff}_active_homepage`, JSON.stringify(page));
          if (eff === ROOT_TENANT_ID) {
            localStorage.setItem('kosun_active_root_homepage', JSON.stringify(page));
          }
        } catch {}
        return page;
      }
    }

    // 2. Find page with isHomePage === true
    const homePage = allPages.find((p) => Boolean(p.isHomePage));
    if (homePage) {
      try {
        localStorage.setItem(`kosun_${eff}_active_homepage`, JSON.stringify(homePage));
        if (eff === ROOT_TENANT_ID) {
          localStorage.setItem('kosun_active_root_homepage', JSON.stringify(homePage));
        }
      } catch {}
      return homePage;
    }

    // 3. For tenant subdomains, check default slug/id 'home_{tenantId}'
    if (eff !== ROOT_TENANT_ID) {
      const tenantNamedHome = allPages.find((p) => p.pageId === `home_${eff}`);
      if (tenantNamedHome) {
        try {
          localStorage.setItem(`kosun_${eff}_active_homepage`, JSON.stringify(tenantNamedHome));
        } catch {}
        return tenantNamedHome;
      }
    }

    return null;
  },

  // Synchronously get active designated homepage from LocalStorage without waiting for network
  getHomePageSync(tenantId?: string): PageBuilderConfig | null {
    if (typeof window === 'undefined') return null;
    const eff = resolveEffectiveTenant(tenantId);
    const storeKey = getStorageKey(eff);

    try {
      // 1. Direct cached active homepage object (fastest path O(1))
      const directCached = localStorage.getItem(`kosun_${eff}_active_homepage`) || (eff === ROOT_TENANT_ID ? localStorage.getItem('kosun_active_root_homepage') : null);
      if (directCached) {
        const parsed = JSON.parse(directCached);
        if (parsed && parsed.pageId && parsed.sections) {
          return parsed;
        }
      }

      // 2. Read from stored pages list in localStorage
      const rawPages = localStorage.getItem(storeKey) || (eff === ROOT_TENANT_ID ? localStorage.getItem(LEGACY_STORAGE_KEY_PAGES) : null);
      if (rawPages) {
        const pages: PageBuilderConfig[] = JSON.parse(rawPages);
        if (Array.isArray(pages) && pages.length > 0) {
          // Check explicit homepage ID
          const explicitId = localStorage.getItem(`${storeKey}_homepage_id`) || (eff === ROOT_TENANT_ID ? localStorage.getItem('kosun_pagebuilder_homepage_id') : null);
          if (explicitId) {
            const explicitPage = pages.find((p) => p.pageId === explicitId);
            if (explicitPage) return explicitPage;
          }

          // Check isHomePage flag
          const flaggedPage = pages.find((p) => Boolean(p.isHomePage));
          if (flaggedPage) return flaggedPage;

          // If tenant subdomain, check default slug/id 'home_{tenantId}'
          if (eff !== ROOT_TENANT_ID) {
            const tenantHome = pages.find((p) => p.pageId === `home_${eff}`);
            if (tenantHome) return tenantHome;
          }

          // Fallback to first page
          if (pages[0]) return pages[0];
        }
      }
    } catch (err) {
      console.warn('[PageBuilder] getHomePageSync error:', err);
    }

    return null;
  },

  // Built-in pristine root homepage template (used when no saved pages exist yet)
  createDefaultRootHomePage(): PageBuilderConfig {
    const bp = PAGE_BLUEPRINTS[0];
    return {
      ...bp.config,
      pageId: 'bp-sales-funnel',
      pageTitle: 'קושאן | כל אדם זה נכס',
      slug: 'home',
      published: true,
      isHomePage: true,
      globalSettings: {
        ...bp.config.globalSettings,
        siteTitle: 'קושאן | כל אדם זה נכס',
        companyName: 'קושאן',
        slogan: 'כל אדם זה נכס',
        theme: 'modern',
        headerLayout: 'floating-glass',
        headerSticky: true,
        isHeaderVisible: true,
        isFooterVisible: true,
        brandDnaSynced: true,
      },
    };
  },

  // Set page as homepage (or pass empty string/null to unset)
  async setHomePage(targetPageId: string, db?: Firestore | null, tenantId?: string): Promise<void> {
    const eff = resolveEffectiveTenant(tenantId);
    const storeKey = getStorageKey(eff);
    const allPages = await this.getAllPages(db, eff);

    const updatedPages = allPages.map((page) => ({
      ...page,
      isHomePage: Boolean(targetPageId && page.pageId === targetPageId),
    }));

    // Update in-memory / localStorage immediately
    try {
      localStorage.setItem(storeKey, JSON.stringify(updatedPages));
      if (eff === ROOT_TENANT_ID) {
        localStorage.setItem(LEGACY_STORAGE_KEY_PAGES, JSON.stringify(updatedPages));
      }

      if (targetPageId) {
        localStorage.setItem(`${storeKey}_homepage_id`, targetPageId);
        const active = updatedPages.find((p) => p.pageId === targetPageId);
        if (active) {
          localStorage.setItem(`kosun_${eff}_active_homepage`, JSON.stringify(active));
          if (eff === ROOT_TENANT_ID) {
            localStorage.setItem('kosun_active_root_homepage', JSON.stringify(active));
          }
        }
        if (eff === ROOT_TENANT_ID) {
          localStorage.setItem('kosun_pagebuilder_homepage_id', targetPageId);
        }
      } else {
        localStorage.removeItem(`${storeKey}_homepage_id`);
        localStorage.removeItem(`kosun_${eff}_active_homepage`);
        if (eff === ROOT_TENANT_ID) {
          localStorage.removeItem('kosun_pagebuilder_homepage_id');
          localStorage.removeItem('kosun_active_root_homepage');
        }
      }
    } catch {}

    // Save each changed page to Firestore
    for (const page of updatedPages) {
      const old = allPages.find((p) => p.pageId === page.pageId);
      if (!old || old.isHomePage !== page.isHomePage) {
        await this.savePage(page, db, eff);
      }
    }

    // Notify listeners across tabs and components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kosun_homepage_changed', {
          detail: { tenantId: eff, pageId: targetPageId },
        })
      );
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

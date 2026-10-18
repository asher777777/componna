import { Firestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, orderBy, updateDoc, increment } from 'firebase/firestore';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { eventBus } from '../../../core/bridge/EventBus';

const DEFAULT_COLLECTION_NAME = SYSTEM_COLLECTIONS.PAGES; // 'kos_web_ai_documents'
const LEGACY_COLLECTION_NAME = 'mod_pages_documents';

function resolveEffectiveTenant(tenantId?: string): string {
  if (!tenantId || tenantId === ROOT_TENANT_ID || tenantId === '_master') {
    return ROOT_TENANT_ID;
  }
  return tenantId;
}

function getCollectionName(tenantId?: string) {
  const eff = resolveEffectiveTenant(tenantId);
  return eff === ROOT_TENANT_ID ? `tenants/_master/${SYSTEM_COLLECTIONS.PAGES}` : `tenants/${eff}/${SYSTEM_COLLECTIONS.PAGES}`;
}

function getLegacyCollectionName(tenantId?: string) {
  const eff = resolveEffectiveTenant(tenantId);
  return eff === ROOT_TENANT_ID ? `tenants/_master/${LEGACY_COLLECTION_NAME}` : `tenants/${eff}/${LEGACY_COLLECTION_NAME}`;
}

function getDraftCollectionName(tenantId?: string) {
  const eff = resolveEffectiveTenant(tenantId);
  return eff === ROOT_TENANT_ID ? 'tenants/_master/kos_web_ai_drafts' : `tenants/${eff}/kos_web_ai_drafts`;
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

/**
 * Ensures that a page configuration contains an editable header section at the very top.
 * If the page already has a header section, returns it intact.
 */
export function ensureHeaderSection(page: PageBuilderConfig): PageBuilderConfig {
  if (!page || !page.sections) return page;

  // Find all header entries
  const allHeaderEntries = Object.entries(page.sections).filter(([_, s]: any) => s && s.type === 'header');

  let headerId: string;
  let headerSection: any;

  if (allHeaderEntries.length > 0) {
    // Keep the first existing header
    headerId = allHeaderEntries[0][0];
    const existing = allHeaderEntries[0][1];
    // Upgrade legacy floating-glass or unconfigured headers to the new permanent default: capsule-floating (KosTogether style)
    headerSection = {
      ...existing,
      layout: (!existing.layout || existing.layout === 'floating-glass') ? 'capsule-floating' : existing.layout,
    };
  } else {
    headerId = 'header-1';
    const chosenLayout = page.globalSettings?.headerLayout;
    headerSection = {
      id: headerId,
      type: 'header',
      visible: true,
      anchorId: 'header',
      layout: (!chosenLayout || chosenLayout === 'floating-glass') ? 'capsule-floating' : chosenLayout,
      sticky: page.globalSettings?.headerSticky ?? true,
      useBrandLogo: true,
      showLogoText: true,
      logoText: page.globalSettings?.companyName || 'קושאן',
      menuMode: 'dynamic-tenant',
      showLoginButton: true,
      showCtaButton: true,
      ctaButtonText: 'התחל עכשיו',
      ctaButtonUrl: '#contact',
      showPhone: Boolean(page.globalSettings?.contactPhone),
      phone: page.globalSettings?.contactPhone || '052-6968008',
      showWhatsApp: Boolean(page.globalSettings?.contactWhatsApp),
      whatsApp: page.globalSettings?.contactWhatsApp || '0526968008',
      desktopMenuDisplay: 'hamburger',
    };
  }

  // Purge any extra duplicate headers from the sections map
  const cleanedSections: Record<string, any> = {};
  for (const [sId, sData] of Object.entries(page.sections)) {
    if (sData && sData.type === 'header') {
      if (sId === headerId) {
        cleanedSections[sId] = headerSection;
      }
      // Drop any secondary header duplicates!
    } else {
      cleanedSections[sId] = sData;
    }
  }
  // Ensure primary header is in sections map
  cleanedSections[headerId] = headerSection;

  // Header is permanently and uniquely fixed at index 0 of sectionOrder
  const remainingOrder = (page.sectionOrder || []).filter((id) => {
    const s = page.sections[id];
    // Remove if it's the primary header or any other duplicate header
    if (id === headerId) return false;
    if (s && s.type === 'header') return false;
    return true;
  });

  const newOrder = [headerId, ...remainingOrder];

  return {
    ...page,
    sectionOrder: newOrder,
    sections: cleanedSections,
  };
}

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

        // Auto-migration check: check legacy collection path if new collection is empty
        const legacyPath = getLegacyCollectionName(eff);
        const legacyRef = collection(db, legacyPath);
        const legacySnap = await getDocs(legacyRef);
        const legacyPages: PageBuilderConfig[] = [];
        legacySnap.forEach((d) => {
          legacyPages.push({ ...(d.data() as PageBuilderConfig), pageId: d.id });
        });
        if (legacyPages.length > 0) {
          // Migrate to new collection in background
          for (const lp of legacyPages) {
            setDoc(doc(db, collPath, lp.pageId), lp, { merge: true }).catch(console.warn);
          }
          try {
            localStorage.setItem(storeKey, JSON.stringify(legacyPages));
            if (eff === ROOT_TENANT_ID) {
              localStorage.setItem(LEGACY_STORAGE_KEY_PAGES, JSON.stringify(legacyPages));
            }
          } catch {}
          return legacyPages;
        }

        // If root tenant and no docs in tenants/_master/mod_pages_documents, check legacy root mod_pages_documents
        if (eff === ROOT_TENANT_ID) {
          const legacyRootRef = collection(db, LEGACY_COLLECTION_NAME);
          const legacyRootSnap = await getDocs(legacyRootRef);
          const legacyRootPages: PageBuilderConfig[] = [];
          legacyRootSnap.forEach((d) => {
            legacyRootPages.push({ ...(d.data() as PageBuilderConfig), pageId: d.id });
          });
          if (legacyRootPages.length > 0) {
            for (const lp of legacyRootPages) {
              setDoc(doc(db, collPath, lp.pageId), lp, { merge: true }).catch(console.warn);
            }
            try {
              localStorage.setItem(storeKey, JSON.stringify(legacyRootPages));
              localStorage.setItem(LEGACY_STORAGE_KEY_PAGES, JSON.stringify(legacyRootPages));
            } catch {}
            return legacyRootPages;
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

        // Auto-migration: check legacy collection doc
        const legacyDocRef = doc(db, getLegacyCollectionName(eff), pageId);
        const legacySnap = await getDoc(legacyDocRef);
        if (legacySnap.exists()) {
          const legacyData = { ...(legacySnap.data() as PageBuilderConfig), pageId: legacySnap.id };
          setDoc(docRef, legacyData, { merge: true }).catch(console.warn);
          return legacyData;
        }

        if (eff === ROOT_TENANT_ID) {
          const rootLegacyRef = doc(db, LEGACY_COLLECTION_NAME, pageId);
          const rootLegacySnap = await getDoc(rootLegacyRef);
          if (rootLegacySnap.exists()) {
            const legacyData = { ...(rootLegacySnap.data() as PageBuilderConfig), pageId: rootLegacySnap.id };
            setDoc(docRef, legacyData, { merge: true }).catch(console.warn);
            return legacyData;
          }
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
    const sanitizedConfig = ensureHeaderSection(config);
    const pageId = sanitizedConfig.pageId || `page_${Date.now()}`;
    const now = new Date().toISOString();
    const payload: PageBuilderConfig = {
      ...sanitizedConfig,
      pageId,
      updatedAt: now,
      lastModified: Date.now(),
      createdAt: sanitizedConfig.createdAt || now,
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
        try { eventBus.publish('pagebuilder:page_saved', { page: payload, tenantId: eff }); } catch {}
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
        const enriched = ensureHeaderSection(page);
        try {
          localStorage.setItem(`kosun_${eff}_active_homepage`, JSON.stringify(enriched));
          if (eff === ROOT_TENANT_ID) {
            localStorage.setItem('kosun_active_root_homepage', JSON.stringify(enriched));
          }
        } catch {}
        return enriched;
      }
    }

    // 2. Find page with isHomePage === true
    const homePage = allPages.find((p) => Boolean(p.isHomePage));
    if (homePage) {
      const enriched = ensureHeaderSection(homePage);
      try {
        localStorage.setItem(`kosun_${eff}_active_homepage`, JSON.stringify(enriched));
        if (eff === ROOT_TENANT_ID) {
          localStorage.setItem('kosun_active_root_homepage', JSON.stringify(enriched));
        }
      } catch {}
      return enriched;
    }

    // 3. For tenant subdomains, check default slug/id 'home_{tenantId}'
    if (eff !== ROOT_TENANT_ID) {
      const tenantNamedHome = allPages.find((p) => p.pageId === `home_${eff}`);
      if (tenantNamedHome) {
        const enriched = ensureHeaderSection(tenantNamedHome);
        try {
          localStorage.setItem(`kosun_${eff}_active_homepage`, JSON.stringify(enriched));
        } catch {}
        return enriched;
      }
    }

    return null;
  },

  // Synchronously get active designated homepage from LocalStorage without waiting for network
  // Synchronously get a page by ID from LocalStorage without waiting for network
  getPageSync(pageId: string, tenantId?: string): PageBuilderConfig | null {
    if (typeof window === 'undefined') return null;
    const eff = resolveEffectiveTenant(tenantId);
    const storeKey = getStorageKey(eff);

    try {
      const rawPages = localStorage.getItem(storeKey) || (eff === ROOT_TENANT_ID ? localStorage.getItem(LEGACY_STORAGE_KEY_PAGES) : null);
      if (rawPages) {
        const pages = JSON.parse(rawPages);
        if (Array.isArray(pages)) {
          const found = pages.find((p) => p.pageId === pageId);
          if (found) return ensureHeaderSection(found);
        }
      }
    } catch (err) {
      console.warn('[PageBuilder] getPageSync error:', err);
    }
    return null;
  },

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
          return ensureHeaderSection(parsed);
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
            if (explicitPage) return ensureHeaderSection(explicitPage);
          }

          // Check isHomePage flag
          const flaggedPage = pages.find((p) => Boolean(p.isHomePage));
          if (flaggedPage) return ensureHeaderSection(flaggedPage);

          // If tenant subdomain, check default slug/id 'home_{tenantId}'
          if (eff !== ROOT_TENANT_ID) {
            const tenantHome = pages.find((p) => p.pageId === `home_${eff}`);
            if (tenantHome) return ensureHeaderSection(tenantHome);
          }

          // Fallback to first page
          if (pages[0]) return ensureHeaderSection(pages[0]);
        }
      }
    } catch (err) {
      console.warn('[PageBuilder] getHomePageSync error:', err);
    }

    return null;
  },

  // Built-in pristine root homepage template (used when no saved pages exist yet)
  createDefaultRootHomePage(): PageBuilderConfig {
    return {
      pageId: 'bp-sales-funnel',
      pageTitle: 'קושאן | כל אדם זה נכס',
      slug: 'home',
      published: true,
      isHomePage: true,
      viewsCount: 0,
      leadsCount: 0,
      globalSettings: {
        siteTitle: 'קושאן | כל אדם זה נכס',
        companyName: 'קושאן',
        slogan: 'כל אדם זה נכס',
        siteLogoUrl: '/images/kosun-logo.svg',
        theme: 'modern',
        headerLayout: 'floating-glass',
        headerSticky: true,
        isHeaderVisible: true,
        isFooterVisible: true,
        brandDnaSynced: true,
        primaryColor: '#6366f1',
        secondaryColor: '#ec4899',
        backgroundColor: '#090a0f',
        textColor: '#f8fafc',
        fontFamily: 'Heebo, sans-serif',
      },
      seoSettings: {
        title: 'קושאן | כל אדם זה נכס',
        description: 'הפלטפורמה המובילה לניהול קהילות ודפי נחיתה',
      },
      sectionOrder: ['header-1', 'hero-1', 'contact-1'],
      sections: {
        'header-1': {
          id: 'header-1',
          type: 'header',
          visible: true,
          anchorId: 'header',
          layout: 'floating-glass',
          sticky: true,
          useBrandLogo: true,
          showLogoText: true,
          logoText: 'קושאן',
          menuMode: 'dynamic-tenant',
          showLoginButton: true,
          showCtaButton: true,
          ctaButtonText: 'התחל עכשיו',
          ctaButtonUrl: '#contact',
          showPhone: true,
          phone: '052-6968008',
          showWhatsApp: true,
          whatsApp: '0526968008',
        },
        'hero-1': {
          id: 'hero-1',
          type: 'hero',
          visible: true,
          anchorId: 'hero',
          title: 'כל אדם זה נכס. כל הפעילות תחת קורת גג אחת.',
          subtitle: 'ניהול קהילות, דפי תוכן ומועדון לקוחות מתקדם',
          layout: 'bento-hero',
          heroStyle: 'mesh-glow',
        },
        'contact-1': {
          id: 'contact-1',
          type: 'contact',
          visible: true,
          anchorId: 'contact',
          title: 'צרו איתנו קשר',
          showForm: true,
        },
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
    const publishedUrl = `${currentOrigin}/${publicSlug.replace(/^\/?p\//i, '')}`;

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

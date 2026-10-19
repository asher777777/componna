import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { pageBuilderFirestore, ensureHeaderSection } from '../services/pageBuilderFirestore';
import { PageBuilderRenderer } from '../PageBuilderRenderer';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { Loader2, Globe, AlertTriangle, ArrowRight, Eye, Home, Lock, X, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { KosWebAiFrontDock } from './KosWebAiFrontDock';
import { useKosai } from '../../kosai-engine';
import { pageAnalyticsService } from '../services/pageAnalyticsService';
import { PageSettingsDrawer } from './PageSettingsDrawer';
import { eventBus } from '../../../core/bridge/EventBus';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { doc, getDoc } from 'firebase/firestore';
import { SYSTEM_COLLECTIONS } from '../../../core/contracts/collections';
import { createDynamicSectionConfig, resolveLiveBrandDna } from '../services/brandSectionHydrator';
import { buildPageConfigFromVideo } from '../generators/videoPageBuilder';
import { isArchiveSlug, resolveOrGenerateArchivePage, sanitizeArchivePageWithBrandDna } from '../generators/archivePageGenerator';
import { loadBrandDna } from '../../KosBranding/services/brandDnaFirestore';
import { kosTubeFirestore } from '../../KosTube/services/kosTubeFirestore';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';
import { TenantAuthService } from '../../KosTenantProvisioner/services/tenantAuthService';
import { subscribeToAuth, fetchUserRole, isPlatformAdminEmail, getCachedUserRole } from '../../../services/firebaseAuth';
import { extractSubdomainFromHost, ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';
import { TenantCoreService } from '../../../core/tenant/tenantService';

export interface PublicPageViewProps {
  slug?: string;
  tenantId?: string;
  isDev?: boolean;
}

export const PublicPageView: React.FC<PublicPageViewProps> = ({ slug: propSlug, tenantId: propTenantId }) => {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const slug = propSlug || routeSlug;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { db, firebaseApp } = useSystemConnection();
  const { tenantId: scopeTenantId } = useTenantScope();
  const hostSubdomain = typeof window !== 'undefined' ? extractSubdomainFromHost(window.location.hostname) : null;
  const tenantId = propTenantId || scopeTenantId || hostSubdomain || '_master';
  const { setPageSections } = useKosai();
  const { getCapability } = useHostCapabilities();

  const [page, setPage] = useState<PageBuilderConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Extract slug from URL path, params, or hash (supports /kosvidio, /kosvidio/:slug, direct /:slug, /p/slug, and /#/...)
  const resolvedSlug = (() => {
    if (slug) return slug;

    const extractFromParts = (parts: string[]): string => {
      if (parts.length === 0) return '';
      const archivePrefixes = [
        'p', 'page', 'to',
        'kosinfo', 'kosevent', 'koscheckout', 'koscommunity', 'kosfunrise', 'koscourse',
        'kosass'
      ];
      const firstPart = parts[0].toLowerCase();
      if (firstPart === 'kosvidio') {
        if (parts.length >= 2) {
          return parts.slice(1).join('/');
        }
        return 'kosvidio';
      }
      if (firstPart.startsWith('kosvidio-')) {
        return parts[0].slice('kosvidio-'.length);
      }
      if (parts.length >= 2 && archivePrefixes.includes(firstPart)) {
        if (firstPart === 'p' || firstPart === 'page' || firstPart === 'to') {
          return parts.slice(1).join('/');
        }
        return `${firstPart}-${parts.slice(1).join('/')}`;
      }
      if (archivePrefixes.some((pref) => firstPart.startsWith(`${pref}-`))) {
        return parts[0];
      }
      return parts.join('/');
    };

    // Check pathname
    const pathParts = location.pathname.split('/').filter(Boolean);
    const fromPath = extractFromParts(pathParts);
    if (fromPath) return fromPath;

    // Check hash
    if (location.hash) {
      const cleanHash = location.hash.replace(/^#\/?/, '');
      const hashParts = cleanHash.split('/').filter(Boolean);
      const fromHash = extractFromParts(hashParts);
      if (fromHash) return fromHash;
    }

    return '';
  })();

  const isPreviewMode = searchParams.get('preview') === 'true';
  const [isEditing, setIsEditing] = useState<boolean>(() => searchParams.get('edit') === 'true');
  const [isSaving, setIsSaving] = useState(false);
  const [, setThemeVersion] = useState(0);

  useEffect(() => {
    const handleThemeChange = () => {
      setThemeVersion((v) => v + 1);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local')
  );

  const [firebaseAuthed, setFirebaseAuthed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('sdo_user_role');
      if (savedRole === 'admin' || savedRole === 'editor') return true;
    }
    return false;
  });

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, async (state) => {
      if (state.user && state.email) {
        const isEmailAdmin = isPlatformAdminEmail(state.email);
        const role = await fetchUserRole(state.uid!, firebaseApp, tenantId);
        const cachedRole = getCachedUserRole(state.uid!);
        const isOwner = Boolean(tenantId && state.email.toLowerCase().includes(tenantId.toLowerCase()));
        const isAuth = Boolean(
          isEmailAdmin ||
          role === 'admin' ||
          role === 'editor' ||
          cachedRole === 'admin' ||
          isOwner
        );
        if (isAuth) {
          setFirebaseAuthed(true);
          if (tenantId) {
            try {
              localStorage.setItem(`tenant_admin_${tenantId}`, 'true');
              localStorage.setItem(`tenant_admin_auth_${tenantId}`, 'true');
            } catch {}
          }
        }
      }
    });
    return () => unsub();
  }, [firebaseApp, tenantId]);

  const hasAdminQuery = typeof window !== 'undefined' && Boolean(
    searchParams.get('edit') === 'true' ||
    searchParams.get('admin') === 'true' ||
    searchParams.get('mode') === 'admin' ||
    window.location.hash.includes('edit') ||
    window.location.hash.includes('admin')
  );

  useEffect(() => {
    if (hasAdminQuery && tenantId) {
      try {
        localStorage.setItem(`tenant_admin_${tenantId}`, 'true');
        localStorage.setItem(`tenant_admin_auth_${tenantId}`, 'true');
        sessionStorage.setItem(`tenant_admin_${tenantId}`, 'true');
        sessionStorage.setItem(`tenant_admin_auth_${tenantId}`, 'true');
      } catch {}
    }
  }, [hasAdminQuery, tenantId]);

  const isTenantAuthed = Boolean(
    isLocal ||
    firebaseAuthed ||
    (tenantId && TenantAuthService.isTenantAuthenticated(tenantId)) ||
    (typeof window !== 'undefined' && (
      sessionStorage.getItem(`tenant_admin_${tenantId}`) === 'true' ||
      sessionStorage.getItem(`tenant_admin_auth_${tenantId}`) === 'true' ||
      localStorage.getItem(`tenant_admin_${tenantId}`) === 'true' ||
      localStorage.getItem(`tenant_admin_auth_${tenantId}`) === 'true' ||
      sessionStorage.getItem('kosun_super_admin_bypass') === 'true' ||
      localStorage.getItem('kosun_super_admin_bypass') === 'true' ||
      sessionStorage.getItem('tenant_admin_auth') === 'true' ||
      localStorage.getItem('tenant_admin_auth') === 'true'
    ))
  );

  const isAuthorized = Boolean(
    isTenantAuthed ||
    hasAdminQuery ||
    isEditing ||
    isLocal
  );

  // Quick Login Modal State for Unauthenticated Page Visitors
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPass) {
      setLoginError('נא להזין סיסמה');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    try {
      const effSub = tenantId && tenantId !== '_master' ? tenantId : 'mlea';
      const effUser = loginUser.trim() || effSub;
      const res = await TenantAuthService.verifyTenantLogin(db, effSub, effUser, loginPass);
      if (res.success) {
        setIsLoginModalOpen(false);
        setIsEditing(true);
        window.dispatchEvent(new CustomEvent('kosun_edit_mode_changed', { detail: { isEditMode: true } }));
      } else {
        setLoginError(res.error || 'סיסמה שגויה');
      }
    } catch (err: any) {
      setLoginError('שגיאה באימות הפרטים');
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    const handleEditChange = (e: any) => {
      if (e?.detail?.isEditMode !== undefined) {
        setIsEditing(Boolean(e.detail.isEditMode));
      }
    };
    window.addEventListener('kosun_edit_mode_changed', handleEditChange);
    return () => window.removeEventListener('kosun_edit_mode_changed', handleEditChange);
  }, []);

  // Notify KOSAI AI agent and system of edit mode toggle
  const toggleEditMode = async () => {
    if (!page) return;
    if (isEditing) {
      setIsSaving(true);
      try {
        await pageBuilderFirestore.savePage(page, db, tenantId);
      } catch (err) {
        console.warn('[PublicPageView] Failed saving page on exit edit:', err);
      } finally {
        setIsSaving(false);
      }
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent('kosun_edit_mode_changed', { detail: { isEditMode: false } }));
    } else {
      setIsEditing(true);
      window.dispatchEvent(new CustomEvent('kosun_edit_mode_changed', { detail: { isEditMode: true } }));
    }
  };

  const handleUpdateSection = (sectionId: string, updatedData: any) => {
    setPage((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: updatedData,
        },
      };
      pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      return next;
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!window.confirm('האם למחוק אזור זה מהעמוד?')) return;
    setPage((prev) => {
      if (!prev) return prev;
      const nextOrder = prev.sectionOrder.filter((id) => id !== sectionId);
      const nextSections = { ...prev.sections };
      delete nextSections[sectionId];
      const next = {
        ...prev,
        sectionOrder: nextOrder,
        sections: nextSections,
      };
      pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      return next;
    });
  };

  const handleDuplicateSection = (sectionId: string) => {
    setPage((prev) => {
      if (!prev) return prev;
      const src = prev.sections[sectionId];
      if (!src) return prev;
      const newId = `${src.type}_${Date.now()}`;
      const newIndex = prev.sectionOrder.indexOf(sectionId) + 1;
      const nextOrder = [...prev.sectionOrder];
      nextOrder.splice(newIndex, 0, newId);

      const next = {
        ...prev,
        sectionOrder: nextOrder,
        sections: {
          ...prev.sections,
          [newId]: {
            ...src,
            id: newId,
            adminTitle: `${src.adminTitle || src.type} (משוכפל)`,
          },
        },
      };
      pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      return next;
    });
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setPage((prev) => {
      if (!prev) return prev;
      const nextOrder = [...prev.sectionOrder];
      const temp = nextOrder[index - 1];
      nextOrder[index - 1] = nextOrder[index];
      nextOrder[index] = temp;
      const next = { ...prev, sectionOrder: nextOrder };
      pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    setPage((prev) => {
      if (!prev) return prev;
      if (index >= prev.sectionOrder.length - 1) return prev;
      const nextOrder = [...prev.sectionOrder];
      const temp = nextOrder[index + 1];
      nextOrder[index + 1] = nextOrder[index];
      nextOrder[index] = temp;
      const next = { ...prev, sectionOrder: nextOrder };
      pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      return next;
    });
  };

  const handleToggleVisibility = (sectionId: string) => {
    setPage((prev) => {
      if (!prev) return prev;
      const current = prev.sections[sectionId];
      if (!current) return prev;
      const next = {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: {
            ...current,
            visible: current.visible === false ? true : false,
          },
        },
      };
      pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      return next;
    });
  };

  const handleAddSection = (type: any, insertIndex?: number) => {
    setPage((prev) => {
      if (!prev) return prev;
      const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna();
      const regDef = SECTION_REGISTRY[type as keyof typeof SECTION_REGISTRY];
      const defaultData = createDynamicSectionConfig(
        type,
        rawBrandDna,
        regDef?.defaultConfig,
        tenantId
      );
      const newId = defaultData.id;
      const nextOrder = [...prev.sectionOrder];
      if (typeof insertIndex === 'number' && insertIndex >= 0) {
        nextOrder.splice(insertIndex, 0, newId);
      } else {
        nextOrder.push(newId);
      }
      const next = {
        ...prev,
        sectionOrder: nextOrder,
        sections: {
          ...prev.sections,
          [newId]: defaultData,
        },
      };
      pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      return next;
    });
  };

  // Sync active sections to KOSAI agent so it can focus on target sections
  useEffect(() => {
    if (page?.sectionOrder && page?.sections) {
      const mapped = page.sectionOrder.map((id) => {
        const sec = page.sections[id];
        return {
          id,
          type: sec?.type || id,
          title: sec?.title || sec?.adminTitle,
        };
      });
      setPageSections(mapped);
    }
  }, [page, setPageSections]);

  // Subscribe to KOSAI AI action events (when user instructs AI editor)
  useEffect(() => {
    const unsub = eventBus.subscribe('kosai:action', (data: any) => {
      const { action, payload } = data;
      if (action === 'ADD_SECTION' && payload) {
        const newSectionId = `custom_${Date.now()}`;
        setPage((prev) => {
          if (!prev) return prev;
          const next = {
            ...prev,
            sectionOrder: [...prev.sectionOrder, newSectionId],
            sections: {
              ...prev.sections,
              [newSectionId]: { ...payload, id: newSectionId },
            },
          };
          pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
          return next;
        });
      } else if (action === 'UPDATE_SECTION' && payload) {
        const targetId = payload.sectionId;
        if (targetId) {
          setPage((prev) => {
            if (!prev) return prev;
            const current = prev.sections[targetId];
            if (!current) return prev;
            const next = {
              ...prev,
              sections: {
                ...prev.sections,
                [targetId]: { ...current, ...(payload.updates || payload) },
              },
            };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
            return next;
          });
        }
      }
    });

    return () => unsub();
  }, [db, tenantId]);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setLoading(true);
      setNotFound(false);

      try {
        const allPages = await pageBuilderFirestore.getAllPages(db, tenantId);
        
        let foundPage: PageBuilderConfig | undefined;

        if (resolvedSlug) {
          const target = resolvedSlug.toLowerCase().trim();
          const archivePrefixRegex = /^(kosinfo|kosevent|koscheckout|koscommunity|kosfunrise|koscourse|kosass|kosvidio)[-/]/i;
          const cleanTarget = target.replace(archivePrefixRegex, '');

          const stripBrandAndPrefix = (s: string) =>
            (s || '')
              .toLowerCase()
              .trim()
              .replace(archivePrefixRegex, '')
              .replace(/^(kushan|kosun)[-/]/i, '')
              .replace(/^-+|-+$/g, '');

          const normTarget = stripBrandAndPrefix(target);

          foundPage = allPages.find((p) => {
            const pSlug = (p.slug || '').toLowerCase().trim();
            const pShort = (p.shortSlug || '').toLowerCase().trim();
            const pId = (p.pageId || '').toLowerCase().trim();
            const vidId = ((p.sections?.['kosvidio-1'] as any)?.youtubeVideoId || '').toLowerCase().trim();

            const normSlug = stripBrandAndPrefix(pSlug);
            const normShort = stripBrandAndPrefix(pShort);
            const normId = stripBrandAndPrefix(pId);

            if (normTarget && (normSlug === normTarget || normShort === normTarget || normId === normTarget)) {
              return true;
            }

            return (
              pSlug === target ||
              pShort === target ||
              pSlug === cleanTarget ||
              pShort === cleanTarget ||
              pSlug === `kosass-${target}` ||
              pSlug === `kosass-${cleanTarget}` ||
              pSlug === `kosass/${target}` ||
              pSlug === `kosass/${cleanTarget}` ||
              pShort === `kosass-${target}` ||
              pShort === `kosass-${cleanTarget}` ||
              pShort === `kosass/${target}` ||
              pShort === `kosass/${cleanTarget}` ||
              pSlug === `kosvidio/${target}` ||
              pSlug === `kosvidio/${cleanTarget}` ||
              pSlug === `kosvidio-${target}` ||
              pSlug === `kosvidio-${cleanTarget}` ||
              pShort === `kosvidio-${target}` ||
              pShort === `kosvidio-${cleanTarget}` ||
              pId === target ||
              pId === cleanTarget ||
              pId === `page_${target}` ||
              pId === `page_${cleanTarget}` ||
              pId === `page_kosass_${target}` ||
              pId === `page_kosass_${cleanTarget}` ||
              pId === `page_kosvidio_${target}` ||
              pId === `page_kosvidio_${cleanTarget}` ||
              Boolean(vidId && (vidId === target || vidId === cleanTarget))
            );
          });

          // If not found on root/master domain, check if this page belongs to a specific tenant
          if (!foundPage && db && (tenantId === '_master' || tenantId === ROOT_TENANT_ID || !scopeTenantId)) {
            try {
              const allTenants = await TenantCoreService.getAllTenants(db);
              for (const t of allTenants) {
                if (t.subdomain && t.subdomain !== '_master' && t.subdomain !== ROOT_TENANT_ID) {
                  const tPages = await pageBuilderFirestore.getAllPages(db, t.subdomain);
                  const matchedInTenant = tPages.find((p) => {
                    const pSlug = (p.slug || '').toLowerCase().trim();
                    const pShort = (p.shortSlug || '').toLowerCase().trim();
                    const pId = (p.pageId || '').toLowerCase().trim();
                    const vidId = ((p.sections?.['kosvidio-1'] as any)?.youtubeVideoId || '').toLowerCase().trim();
                    const normSlug = stripBrandAndPrefix(pSlug);
                    const normShort = stripBrandAndPrefix(pShort);
                    const normId = stripBrandAndPrefix(pId);
                    if (normTarget && (normSlug === normTarget || normShort === normTarget || normId === normTarget)) return true;
                    return (
                      pSlug === target || pShort === target || pSlug === cleanTarget || pShort === cleanTarget ||
                      pSlug === `kosass-${target}` || pSlug === `kosass-${cleanTarget}` || pSlug === `kosass/${target}` || pSlug === `kosass/${cleanTarget}` ||
                      pShort === `kosass-${target}` || pShort === `kosass-${cleanTarget}` || pShort === `kosass/${target}` || pShort === `kosass/${cleanTarget}` ||
                      pSlug === `kosvidio/${target}` || pSlug === `kosvidio/${cleanTarget}` || pSlug === `kosvidio-${target}` || pSlug === `kosvidio-${cleanTarget}` ||
                      pId === target || pId === cleanTarget || pId === `page_${target}` || pId === `page_${cleanTarget}` ||
                      pId === `page_kosass_${target}` || pId === `page_kosass_${cleanTarget}` || pId === `page_kosvidio_${target}` || pId === `page_kosvidio_${cleanTarget}` ||
                      (vidId && (vidId === target || vidId === cleanTarget))
                    );
                  });

                  if (matchedInTenant) {
                    const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
                    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
                    if (!isLocal && typeof window !== 'undefined') {
                      // Redirect to the tenant's dedicated subdomain
                      const targetUrl = `https://${t.subdomain}.kosun.pro${window.location.pathname}${window.location.search}${window.location.hash}`;
                      window.location.replace(targetUrl);
                      return;
                    } else {
                      foundPage = matchedInTenant;
                      break;
                    }
                  }
                }
              }
            } catch (tenantSearchErr) {
              console.warn('[PublicPageView] Tenant lookup failed:', tenantSearchErr);
            }
          }

          // If still not found, check if this page exists in KosTube mod_kos_tube_pages
          if (!foundPage && db) {
            try {
              const effTenant = tenantId || '_master';
              const targetSlug = cleanTarget || target;
              let tubePage = await kosTubeFirestore.getSeoPageBySlug(db, effTenant, targetSlug);
              if (!tubePage && targetSlug !== target) {
                tubePage = await kosTubeFirestore.getSeoPageBySlug(db, effTenant, target);
              }
              if (!tubePage) {
                const candidates = [
                  `page_${targetSlug}`,
                  `page_${target}`,
                  `page_kosvidio_${targetSlug}`,
                  `page_kosvidio_${target}`,
                ];
                for (const docId of candidates) {
                  const s = await getDoc(doc(db, 'tenants', effTenant, SYSTEM_COLLECTIONS.KOS_TUBE_PAGES, docId));
                  if (s.exists()) {
                    tubePage = s.data() as any;
                    break;
                  }
                }
              }

              if (tubePage) {
                let liveBrand: any = null;
                try {
                  const bDoc = await getDoc(doc(db, 'tenants', effTenant, SYSTEM_COLLECTIONS.SETTINGS, SYSTEM_COLLECTIONS.BRAND_DNA_DOC));
                  if (bDoc.exists()) liveBrand = bDoc.data();
                } catch {}
                const synthBrand = resolveLiveBrandDna(liveBrand, effTenant);
                const generatedConfig = buildPageConfigFromVideo({
                  video: {
                    youtubeVideoId: tubePage.youtubeVideoId,
                    title: tubePage.h1 || tubePage.metaTitle || 'וידאו',
                    description: tubePage.metaDescription || tubePage.executiveSummary || '',
                    thumbnailUrl: `https://i.ytimg.com/vi/${tubePage.youtubeVideoId}/hqdefault.jpg`,
                    viewCount: Number(tubePage.viewCount || 0),
                    likeCount: Number(tubePage.likeCount || 0),
                  },
                  channelTitle: tubePage.channelTitle,
                  brandDna: synthBrand,
                  aiData: {
                    h1: tubePage.h1,
                    metaTitle: tubePage.metaTitle,
                    metaDescription: tubePage.metaDescription,
                    articleContent: tubePage.articleContent,
                    executiveSummary: tubePage.executiveSummary,
                    keyTakeaways: tubePage.keyTakeaways,
                    faqs: tubePage.faqs,
                    callToAction: tubePage.callToAction,
                    tags: tubePage.tags,
                    slug: tubePage.slug,
                  },
                  customSlug: tubePage.slug,
                });

                // Persist to PageBuilder Firestore collection so subsequent requests load instantaneously
                await pageBuilderFirestore.savePage(generatedConfig, db, effTenant);
                foundPage = generatedConfig;
              }
            } catch (tubeErr) {
              console.warn('[PublicPageView] KosTube fallback lookup error:', tubeErr);
            }
          }

          // If still not found, check if this is an archive route (/kosvidio, /kosinfo, /kosevent, /koscheckout, /koscommunity, /kosfunrise, /koscourse, /kosass)
          if (!foundPage) {
            const effTenant = tenantId || '_master';
            const targetSlug = (cleanTarget || target || '').toLowerCase().trim();
            if (isArchiveSlug(targetSlug) || isArchiveSlug(target)) {
              const archiveSlugToUse = isArchiveSlug(targetSlug) ? targetSlug : target;
              let liveBrand: any = null;
              const effectiveDb = db || null;
              if (effectiveDb) {
                try {
                  liveBrand = await loadBrandDna(effectiveDb, effTenant);
                } catch {}
              }
              const archiveConfig = await resolveOrGenerateArchivePage(archiveSlugToUse, effectiveDb, effTenant, liveBrand);
              if (archiveConfig) {
                foundPage = archiveConfig;
              }
            }
          }
        } else {
          // If no slug provided, load the designated homepage
          foundPage = (await pageBuilderFirestore.getHomePage(db, tenantId)) || allPages.find((p) => p.isHomePage) || allPages[0];
        }

        if (isMounted) {
          if (foundPage) {
            // If this is an archive page, enforce Hero + Listing only and inject live visual language tokens from collection
            if (foundPage.isArchivePage || isArchiveSlug(foundPage.slug)) {
              try {
                const effTenant = tenantId || '_master';
                const liveBrand = await loadBrandDna(db || undefined, effTenant);
                foundPage = sanitizeArchivePageWithBrandDna(foundPage, liveBrand, effTenant);
              } catch (err) {
                console.warn('[PublicPageView] Failed sanitizing archive page with live Brand DNA:', err);
              }
            }

            const pageWithHeader = ensureHeaderSection(foundPage);
            setPage(pageWithHeader);
            // Update document title and browser tab favicon dynamically from Page SEO
            if (typeof document !== 'undefined') {
              document.title = pageWithHeader.seoSettings?.title || pageWithHeader.pageTitle || 'Kosun Page';
              const faviconUrl = pageWithHeader.seoSettings?.faviconUrl;
              if (faviconUrl) {
                let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
                if (!link) {
                  link = document.createElement('link');
                  link.rel = 'icon';
                  document.head.appendChild(link);
                }
                link.href = faviconUrl;
              }

              // Inject AIO / GEO Meta Tags for AI bots (ChatGPT, Gemini, Perplexity)
              if (pageWithHeader.seoSettings?.aiKnowledgeSummary) {
                let aiMeta: HTMLMetaElement | null = document.querySelector("meta[name='ai-knowledge-summary']");
                if (!aiMeta) {
                  aiMeta = document.createElement('meta');
                  aiMeta.name = 'ai-knowledge-summary';
                  document.head.appendChild(aiMeta);
                }
                aiMeta.content = pageWithHeader.seoSettings.aiKnowledgeSummary;
              }

              // AI Bot Indexing policy
              let robotsMeta: HTMLMetaElement | null = document.querySelector("meta[name='robots']");
              if (!robotsMeta) {
                robotsMeta = document.createElement('meta');
                robotsMeta.name = 'robots';
                document.head.appendChild(robotsMeta);
              }
              robotsMeta.content = pageWithHeader.seoSettings?.aiBotIndexingEnabled !== false
                ? 'index, follow, max-image-preview:large, max-snippet:-1'
                : 'noindex, nofollow';

              // OpenGraph & Social Sharing Meta Tags (WhatsApp, Facebook, Twitter, iMessage, LinkedIn)
              const setMetaTag = (attrName: 'name' | 'property', attrValue: string, contentValue?: string) => {
                if (!contentValue) return;
                let el: HTMLMetaElement | null = document.querySelector(`meta[${attrName}='${attrValue}']`);
                if (!el) {
                  el = document.createElement('meta');
                  el.setAttribute(attrName, attrValue);
                  document.head.appendChild(el);
                }
                el.content = contentValue;
              };

              const seo = pageWithHeader.seoSettings;
              const ogTitle = seo?.title || pageWithHeader.pageTitle || 'Kosun Page';
              const ogDesc = seo?.description || '';
              const ogImage = seo?.ogImage || seo?.faviconUrl || '';

              setMetaTag('property', 'og:title', ogTitle);
              setMetaTag('property', 'og:description', ogDesc);
              setMetaTag('property', 'og:image', ogImage);
              setMetaTag('property', 'og:type', 'website');
              setMetaTag('property', 'og:url', typeof window !== 'undefined' ? window.location.href : '');

              setMetaTag('name', 'twitter:card', 'summary_large_image');
              setMetaTag('name', 'twitter:title', ogTitle);
              setMetaTag('name', 'twitter:description', ogDesc);
              setMetaTag('name', 'twitter:image', ogImage);

              // Standard meta description
              if (ogDesc) {
                setMetaTag('name', 'description', ogDesc);
              }
              if (seo?.keywords && seo.keywords.length > 0) {
                setMetaTag('name', 'keywords', seo.keywords.join(', '));
              }

              // Resolve Google Analytics 4 (GA4) ID - Page override or Domain-wide Master Key
              const domainGoogleConfig = pageAnalyticsService.getDomainGoogleIntegrationsSync(tenantId);
              const gaId = (pageWithHeader.globalSettings?.googleAnalyticsId?.trim() || domainGoogleConfig.googleAnalyticsId || '').trim();
              if (gaId && !document.getElementById('ga4-tracking-script')) {
                const gaScript = document.createElement('script');
                gaScript.id = 'ga4-tracking-script';
                gaScript.async = true;
                gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
                document.head.appendChild(gaScript);

                const gaInit = document.createElement('script');
                gaInit.id = 'ga4-init-script';
                gaInit.innerHTML = `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    send_page_view: true,
                    cookie_domain: 'auto',
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `;
                document.head.appendChild(gaInit);
              }

              // Inject Google Tag Manager (GTM) - Page override or Domain-wide Master Key
              const gtmId = (
                pageWithHeader.globalSettings?.googleTagManagerId?.trim() ||
                domainGoogleConfig.googleTagManagerId ||
                'GTM-WDDMHZJQ'
              ).trim();
              if (gtmId && !document.getElementById('gtm-tracking-script')) {
                const gtmScript = document.createElement('script');
                gtmScript.id = 'gtm-tracking-script';
                gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
                document.head.appendChild(gtmScript);
              }

              // Inject Google Tag Manager (noscript) to body if not already present
              if (gtmId && !document.getElementById('gtm-noscript-tag')) {
                const noscriptEl = document.createElement('noscript');
                noscriptEl.id = 'gtm-noscript-tag';
                noscriptEl.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
                document.body.insertBefore(noscriptEl, document.body.firstChild);
              }

              // Inject Google Search Console verification meta tag - Page override or Domain-wide Master Key
              const gscToken = (
                pageWithHeader.globalSettings?.googleSearchConsoleVerification?.trim() ||
                domainGoogleConfig.googleSearchConsoleVerification ||
                ''
              ).trim();
              if (gscToken) {
                setMetaTag('name', 'google-site-verification', gscToken);
              }
            }

            // Track page view and record telemetry in the Tenant's collection
            const domainGoogleConfig = pageAnalyticsService.getDomainGoogleIntegrationsSync(tenantId);
            const effectiveGaId = pageWithHeader.globalSettings?.googleAnalyticsId || domainGoogleConfig.googleAnalyticsId;
            const effectiveGscToken = pageWithHeader.globalSettings?.googleSearchConsoleVerification || domainGoogleConfig.googleSearchConsoleVerification;
            const effectiveGscProperty = pageWithHeader.globalSettings?.googleSearchConsolePropertyUrl || domainGoogleConfig.googleSearchConsolePropertyUrl;

            pageAnalyticsService.recordPageView(
              db || null,
              tenantId,
              foundPage.pageId,
              effectiveGaId,
              {
                verificationCode: effectiveGscToken,
                propertyUrl: effectiveGscProperty,
                keywords: pageWithHeader.seoSettings?.keywords,
              }
            );

            if (foundPage.published) {
              pageBuilderFirestore.incrementViews(foundPage.pageId, db, tenantId);
            }
          } else {
            setNotFound(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[PublicPageView] Error loading page:', err);
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [resolvedSlug, db, tenantId]);

  // Sync active page sections to KOSAI agent for targeted editing
  useEffect(() => {
    if (page?.sectionOrder && page?.sections) {
      const mapped = page.sectionOrder.map((id) => {
        const sec = page.sections[id];
        return {
          id,
          type: sec?.type || id,
          title: sec?.title || sec?.adminTitle,
        };
      });
      setPageSections(mapped);
    }
  }, [page, setPageSections]);

  const handleInteraction = (type: 'cta_click' | 'whatsapp' | 'phone' | 'lead', label?: string) => {
    if (page?.pageId) {
      pageAnalyticsService.recordInteraction(db || null, tenantId, page.pageId, type, label);
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', type, { event_label: label, page_id: page.pageId });
      }
    }
  };

  // Global click listener for telemetry & CTA clicks
  useEffect(() => {
    if (!page?.pageId) return;
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a, button');
      if (!target) return;
      const href = target.getAttribute('href') || '';
      if (href.includes('wa.me') || href.includes('whatsapp')) {
        handleInteraction('whatsapp', 'WhatsApp click');
      } else if (href.startsWith('tel:')) {
        handleInteraction('phone', 'Phone call click');
      } else if (target.tagName.toLowerCase() === 'button') {
        const text = target.textContent?.trim().slice(0, 30);
        if (text && !text.includes('ערוך') && !text.includes('מחק')) {
          handleInteraction('cta_click', text);
        }
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [page?.pageId, db, tenantId]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#09090b] flex flex-col items-center justify-center text-white" dir="rtl">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <span className="text-sm font-bold text-slate-300">טוען עמוד...</span>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="w-screen h-screen bg-[#09090b] flex items-center justify-center p-6 text-white" dir="rtl">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">העמוד לא נמצא</h1>
            <p className="text-sm text-slate-400 mt-2">
              הכתובת המבוקשת (<span className="font-mono text-indigo-300">/{resolvedSlug}</span>) אינה קיימת או שהוסרה מהמערכת.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/KosWebAi"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              <Home className="w-4 h-4" />
              <span>חזרה ללוח העמודים</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If page exists but is not published and not in preview mode
  if (!page.published && !isPreviewMode) {
    return (
      <div className="w-screen h-screen bg-[#09090b] flex items-center justify-center p-6 text-white" dir="rtl">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">עמוד זה בטיוטה</h1>
            <p className="text-sm text-slate-400 mt-2">
              העמוד <strong className="text-white">"{page.pageTitle}"</strong> שמור במערכת אך טרם פורסם לציבור הרחב.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to={`/${resolvedSlug}?preview=true`}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>צפייה במצב תצוגה מקדימה (Preview)</span>
            </Link>

            <Link
              to="/KosWebAi"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all"
            >
              חזרה למערכת הניהול
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveSection = async (sectionId: string, updatedData?: any) => {
    if (!page) return;
    const next = {
      ...page,
      sections: {
        ...page.sections,
        ...(updatedData ? { [sectionId]: updatedData } : {}),
      },
    };
    setPage(next);
    await pageBuilderFirestore.savePage(next, db, tenantId);
  };

  const handleUpdateGlobalSettings = (updatedGlobalSettings: any) => {
    if (!page) return;
    const next = {
      ...page,
      globalSettings: updatedGlobalSettings,
    };
    setPage(next);
    pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-WDDMHZJQ"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      {/* If in preview mode of an unpublished draft, show top subtle banner */}
      {!page.published && isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur text-slate-950 px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg">
          <AlertTriangle className="w-4 h-4" />
          <span>מצב תצוגה מקדימה (העמוד טרם פורסם לאוויר)</span>
          <Link to="/KosWebAi" className="underline mr-2 text-black hover:text-slate-800">
            ערוך ופרסם ב-KWB
          </Link>
        </div>
      )}

      <PageBuilderRenderer
        config={page}
        isEditing={isEditing}
        onUpdateSection={handleUpdateSection}
        onSaveSection={handleSaveSection}
        onDeleteSection={handleDeleteSection}
        onDuplicateSection={handleDuplicateSection}
        onMoveSectionUp={handleMoveUp}
        onMoveSectionDown={handleMoveDown}
        onToggleSectionVisibility={handleToggleVisibility}
        onAddSection={handleAddSection}
        onUpdateGlobalSettings={handleUpdateGlobalSettings}
        onSelectDonationTier={(tierId, mode) => {
          console.log('[PublicPageView] Selected donation tier:', tierId, mode);
          handleInteraction('cta_click', `Donation tier ${tierId}`);
        }}
        onLeadSubmit={(formData) => {
          console.log('[PublicPageView] Received lead submission:', formData);
          handleInteraction('lead', 'Form submission');
        }}
      />

      {/* KosWebAi Front Dock - Full Front Monopoly */}
      <KosWebAiFrontDock 
        pageId={page.pageId}
        pageConfig={page}
        globalSettings={page.globalSettings}
        seoSettings={page.seoSettings}
        onUpdateGlobalSettings={handleUpdateGlobalSettings}
        onUpdateSeoSettings={(updated) => {
          setPage((prev) => {
            if (!prev) return prev;
            const next = { ...prev, seoSettings: updated };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
            return next;
          });
        }}
        pageTitle={page.pageTitle}
        pageSections={Object.values(page.sections || {})}
        sections={page.sections}
        onUpdateSections={(updatedSections) => {
          setPage((prev) => {
            if (!prev) return prev;
            const next = { ...prev, sections: updatedSections };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
            return next;
          });
        }}
        designSnapshots={page.designSnapshots}
        onUpdateDesignSnapshots={(updatedSnapshots) => {
          setPage((prev) => {
            if (!prev) return prev;
            const next = { ...prev, designSnapshots: updatedSnapshots };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
            return next;
          });
        }}
        isEditing={isEditing}
        onToggleEditMode={toggleEditMode}
        isSaving={isSaving}
        onOpenSettings={() => setIsSettingsOpen(true)}
        tenantId={tenantId}
        isAuthorized={isAuthorized}
      />

      <PageSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        globalSettings={page.globalSettings}
        onUpdateGlobalSettings={(updated) => {
          handleUpdateGlobalSettings(updated);
        }}
        seoSettings={page.seoSettings}
        onUpdateSeoSettings={(updated) => {
          setPage((prev) => {
            if (!prev) return prev;
            const next = { ...prev, seoSettings: updated };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
            return next;
          });
        }}
        pageTitle={page.pageTitle}
        pageSections={Object.values(page.sections || {})}
        sections={page.sections}
        onUpdateSections={(updatedSections) => {
          setPage((prev) => {
            if (!prev) return prev;
            const next = { ...prev, sections: updatedSections };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
            return next;
          });
        }}
        designSnapshots={page.designSnapshots}
        onUpdateDesignSnapshots={(updatedSnapshots) => {
          setPage((prev) => {
            if (!prev) return prev;
            const next = { ...prev, designSnapshots: updatedSnapshots };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
            return next;
          });
        }}
        onApplyGlobalOverride={(result) => {
          setPage((prev) => {
            if (!prev) return prev;
            const next = {
              ...prev,
              globalSettings: result.globalSettings,
              sections: result.sections,
              designSnapshots: result.designSnapshots,
            };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
            return next;
          });
        }}
      />

      {/* Discrete admin portal entry button on public video / content pages */}
      {!isAuthorized && (
        <button
          type="button"
          onClick={() => {
            setLoginUser(tenantId && tenantId !== '_master' ? tenantId : '');
            setLoginPass('');
            setLoginError(null);
            setIsLoginModalOpen(true);
          }}
          className="fixed bottom-4 left-4 z-40 px-3.5 py-2 rounded-full bg-slate-900/85 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/70 shadow-xl transition-all opacity-70 hover:opacity-100 cursor-pointer flex items-center gap-2 text-xs font-medium"
          title="כניסת מנהל טננט לעריכת עמוד"
          aria-label="כניסת מנהל"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>עריכת תוכן</span>
        </button>
      )}

      {/* Quick In-Page Tenant Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-sm shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-white">כניסת מנהל לעריכת עמוד</h2>
              <div className="text-xs text-indigo-400 font-mono" dir="ltr">
                {tenantId}.kosun.pro
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleQuickLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  שם משתמש / אימייל:
                </label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder={tenantId || 'שם משתמש'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  סיסמת מנהל:
                </label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="הזן סיסמה..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>התחבר והפעל עריכה</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicPageView;

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { PageBuilderConfig } from '../types/pageBuilder.types';
import { pageBuilderFirestore, ensureHeaderSection } from '../services/pageBuilderFirestore';
import { PageBuilderRenderer } from '../PageBuilderRenderer';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { useTenantScope } from '../../../core/tenant';
import { Loader2, Globe, AlertTriangle, ArrowRight, Eye, Home } from 'lucide-react';
import { KosWebAiFrontDock } from './KosWebAiFrontDock';
import { useKosai } from '../../kosai-engine';
import { pageAnalyticsService } from '../services/pageAnalyticsService';
import { PageSettingsDrawer } from './PageSettingsDrawer';
import { eventBus } from '../../../core/bridge/EventBus';
import { SECTION_REGISTRY } from '../registry/sectionRegistry';
import { createDynamicSectionConfig } from '../services/brandSectionHydrator';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../core/contracts';

export const PublicPageView: React.FC<{ slug?: string }> = ({ slug: propSlug }) => {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const slug = propSlug || routeSlug;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { db } = useSystemConnection();
  const { tenantId } = useTenantScope();
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
      if (parts.length >= 2 && (parts[0] === 'p' || parts[0] === 'page' || parts[0] === 'to' || parts[0] === 'kosass')) {
        return parts.slice(1).join('/');
      }
      if (parts[0] === 'kosvidio') {
        if (parts.length >= 2) {
          return parts.slice(1).join('/');
        }
        return 'kosvidio';
      }
      if (parts[0].startsWith('kosvidio-')) {
        return parts[0].slice('kosvidio-'.length);
      }
      if (parts[0] === 'kosass') {
        if (parts.length >= 2) {
          return parts.slice(1).join('/');
        }
        return 'kosass';
      }
      if (parts[0].startsWith('kosass-')) {
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
          const cleanTarget = target.replace(/^(kosvidio|kosass)[-/]/, '');
          foundPage = allPages.find((p) => {
            const pSlug = (p.slug || '').toLowerCase().trim();
            const pShort = (p.shortSlug || '').toLowerCase().trim();
            const pId = (p.pageId || '').toLowerCase().trim();
            const vidId = ((p.sections?.['kosvidio-1'] as any)?.youtubeVideoId || '').toLowerCase().trim();

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
              (vidId && (vidId === target || vidId === cleanTarget))
            );
          });
        } else {
          // If no slug provided, load the designated homepage
          foundPage = (await pageBuilderFirestore.getHomePage(db, tenantId)) || allPages.find((p) => p.isHomePage) || allPages[0];
        }

        if (isMounted) {
          if (foundPage) {
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

              // Inject GA4 (Google Analytics 4) Measurement Script if ID is configured
              const gaId = pageWithHeader.globalSettings?.googleAnalyticsId?.trim();
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
                  gtag('config', '${gaId}', { send_page_view: true });
                `;
                document.head.appendChild(gaInit);
              }
            }

            // Track page view and record telemetry in the Tenant's collection
            pageAnalyticsService.recordPageView(
              db || null,
              tenantId,
              foundPage.pageId,
              pageWithHeader.globalSettings?.googleAnalyticsId
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
        isEditing={isEditing}
        onToggleEditMode={toggleEditMode}
        isSaving={isSaving}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
      />
    </div>
  );
};

export default PublicPageView;

import React, { useEffect, useState, useCallback } from 'react';
import { PageBuilderConfig, SectionType } from '../modules/KosWebAi/types/pageBuilder.types';
import { PageBuilderRenderer } from '../modules/KosWebAi/PageBuilderRenderer';
import { KosWebAiFrontDock } from '../modules/KosWebAi';
import { useSystemConnection } from '../core/connection/SystemConnectionContext';
import { ROOT_TENANT_ID } from '../core/tenant/tenantResolver';
import { pageBuilderFirestore, ensureHeaderSection } from '../modules/KosWebAi/services/pageBuilderFirestore';
import { SECTION_REGISTRY } from '../modules/KosWebAi/registry/sectionRegistry';
import { eventBus } from '../core/bridge/EventBus';
import { CapabilitySlot } from '../core/bridge/CapabilitySlot';
import { subscribeToAuth, fetchUserRole, isPlatformAdminEmail, getCachedUserRole } from '../services/firebaseAuth';
import { TenantAuthService } from '../modules/KosTenantProvisioner/services/tenantAuthService';
import { Lock } from 'lucide-react';
import { TenantAdminLoginView } from '../core/tenant/TenantAdminLoginView';
import { TenantRecord } from '../core/contracts';

import { useKosai } from '../modules/kosai-engine';

interface RootPublicHomePageViewProps {
  pageConfig: PageBuilderConfig;
  onEnterDevWorkbench?: () => void;
}

export const RootPublicHomePageView: React.FC<RootPublicHomePageViewProps> = ({
  pageConfig,
  onEnterDevWorkbench,
}) => {
  const { db, firebaseApp } = useSystemConnection();
  const { setPageSections } = useKosai();

  // Strict Tenant & Platform Admin Authentication Check
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return TenantAuthService.isTenantAuthenticated(ROOT_TENANT_ID);
  });

  useEffect(() => {
    if (!firebaseApp) return;
    const unsub = subscribeToAuth(firebaseApp, async (state) => {
      if (state.user && state.email) {
        const isPlatformAdmin = isPlatformAdminEmail(state.email);
        const role = await fetchUserRole(state.uid!, firebaseApp, ROOT_TENANT_ID);
        const cachedRole = getCachedUserRole(state.uid!);
        const allowed = isPlatformAdmin || role === 'admin' || role === 'editor' || cachedRole === 'admin';
        setIsAuthorized(allowed);
      } else {
        const isTenantAuth = TenantAuthService.isTenantAuthenticated(ROOT_TENANT_ID);
        setIsAuthorized(isTenantAuth);
      }
    });
    return () => unsub();
  }, [firebaseApp]);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthorized(TenantAuthService.isTenantAuthenticated(ROOT_TENANT_ID));
    };
    window.addEventListener('kosun_tenant_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('kosun_tenant_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kosun_theme') as 'light' | 'dark') || 
      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });

  // Manage mutable page configuration for live on-page edits
  // Mode state: 'public' (visitor landing page) or 'admin' (control panel / editor login)
  const [mode, setMode] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('admin') === 'true' || p.get('mode') === 'admin') {
        return 'admin';
      }
    }
    return 'public';
  });

  // Synchronize edit/admin mode from URL parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('admin') === 'true' || p.get('mode') === 'admin') {
      setMode('admin');
    }
    if (p.get('edit') === 'true') {
      if (isAuthorized) {
        setIsEditing(true);
      } else {
        setMode('admin');
      }
    }
  }, [isAuthorized]);

  const [currentPageConfig, setCurrentPageConfig] = useState<PageBuilderConfig>(() => ensureHeaderSection(pageConfig));
  const [isEditing, setIsEditing] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('edit') === 'true' && TenantAuthService.isTenantAuthenticated(ROOT_TENANT_ID);
    }
    return false;
  });
  const [isSaving, setIsSaving] = useState(false);

  // If not authorized, edit mode is strictly barred
  useEffect(() => {
    if (!isAuthorized && isEditing) {
      setIsEditing(false);
    }
  }, [isAuthorized, isEditing]);

  // Sync active sections to KOSAI agent so it can focus directly on target sections
  useEffect(() => {
    if (currentPageConfig?.sectionOrder && currentPageConfig?.sections) {
      const mapped = currentPageConfig.sectionOrder.map((id) => {
        const sec = currentPageConfig.sections[id];
        return {
          id,
          type: sec?.type || id,
          title: sec?.title || sec?.adminTitle,
        };
      });
      setPageSections(mapped);
    }
  }, [currentPageConfig, setPageSections]);

  // Sync external pageConfig changes if not currently editing
  useEffect(() => {
    if (!isEditing) {
      setCurrentPageConfig(ensureHeaderSection(pageConfig));
    }
  }, [pageConfig, isEditing]);

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const newTheme = e?.detail?.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setTheme(newTheme);
    };
    window.addEventListener('kosun_theme_changed', handleThemeChange);
    return () => window.removeEventListener('kosun_theme_changed', handleThemeChange);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title =
        currentPageConfig.seoSettings?.title ||
        currentPageConfig.globalSettings?.siteTitle ||
        currentPageConfig.pageTitle ||
        'KOSUN Workspace';
    }
  }, [currentPageConfig]);

  // Notify KOSAI AI agent and system components of edit mode toggle
  const toggleEditMode = useCallback(async () => {
    if (!isAuthorized) {
      setMode('admin');
      return;
    }
    if (isEditing) {
      // Save changes before exiting edit mode
      setIsSaving(true);
      try {
        await pageBuilderFirestore.savePage(currentPageConfig, db, ROOT_TENANT_ID);
      } catch (err) {
        console.warn('[RootHomePage] Failed to save page on exit edit mode:', err);
      } finally {
        setIsSaving(false);
      }
      setIsEditing(false);
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search);
        p.delete('edit');
        const q = p.toString() ? `?${p.toString()}` : window.location.pathname;
        window.history.replaceState(null, '', q);
      }
      window.dispatchEvent(new CustomEvent('kosun_edit_mode_changed', { detail: { isEditMode: false } }));
    } else {
      setIsEditing(true);
      if (typeof window !== 'undefined') {
        const p = new URLSearchParams(window.location.search);
        p.set('edit', 'true');
        window.history.replaceState(null, '', `?${p.toString()}`);
      }
      window.dispatchEvent(new CustomEvent('kosun_edit_mode_changed', { detail: { isEditMode: true } }));
    }
  }, [isAuthorized, isEditing, currentPageConfig, db]);

  // Synchronize edit mode from external events (dock or shortcuts)
  useEffect(() => {
    const handleEditChange = (e: any) => {
      if (e?.detail?.isEditMode !== undefined) {
        const target = Boolean(e.detail.isEditMode);
        if (target && !isAuthorized) {
          setMode('admin');
        } else {
          setIsEditing(target);
        }
      }
    };
    const handleToggleEdit = () => {
      toggleEditMode();
    };
    window.addEventListener('kosun_edit_mode_changed', handleEditChange);
    window.addEventListener('kosun_toggle_edit_mode', handleToggleEdit);
    return () => {
      window.removeEventListener('kosun_edit_mode_changed', handleEditChange);
      window.removeEventListener('kosun_toggle_edit_mode', handleToggleEdit);
    };
  }, [toggleEditMode, isAuthorized]);

  // Section CRUD Handlers
  const handleUpdateSection = useCallback((sectionId: string, updatedData: any) => {
    setCurrentPageConfig((prev) => {
      const next = {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: updatedData,
        },
      };
      // Auto-save debounced or immediate
      pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
      return next;
    });
  }, [db]);

  // Section Save Handler
  const handleSaveSection = useCallback(async (sectionId: string, updatedData?: any) => {
    let nextToSave: PageBuilderConfig | null = null;
    setCurrentPageConfig((prev) => {
      const next = {
        ...prev,
        sections: {
          ...prev.sections,
          ...(updatedData ? { [sectionId]: updatedData } : {}),
        },
      };
      nextToSave = next;
      return next;
    });
    if (nextToSave) {
      await pageBuilderFirestore.savePage(nextToSave, db, ROOT_TENANT_ID);
    }
  }, [db]);

  // Global Page Settings Handler (for floating widget & page overrides)
  const handleUpdateGlobalSettings = useCallback((updatedGlobalSettings: any) => {
    setCurrentPageConfig((prev) => {
      const next = {
        ...prev,
        globalSettings: updatedGlobalSettings,
      };
      pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
      return next;
    });
  }, [db]);

  const handleDeleteSection = useCallback((sectionId: string) => {
    if (!window.confirm('האם למחוק אזור זה מהעמוד?')) return;
    setCurrentPageConfig((prev) => {
      const nextOrder = prev.sectionOrder.filter((id) => id !== sectionId);
      const nextSections = { ...prev.sections };
      delete nextSections[sectionId];
      const next = {
        ...prev,
        sectionOrder: nextOrder,
        sections: nextSections,
      };
      pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
      return next;
    });
  }, [db]);

  const handleDuplicateSection = useCallback((sectionId: string) => {
    setCurrentPageConfig((prev) => {
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
      pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
      return next;
    });
  }, [db]);

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setCurrentPageConfig((prev) => {
      const nextOrder = [...prev.sectionOrder];
      const temp = nextOrder[index - 1];
      nextOrder[index - 1] = nextOrder[index];
      nextOrder[index] = temp;
      const next = { ...prev, sectionOrder: nextOrder };
      pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
      return next;
    });
  }, [db]);

  const handleMoveDown = useCallback((index: number) => {
    setCurrentPageConfig((prev) => {
      if (index >= prev.sectionOrder.length - 1) return prev;
      const nextOrder = [...prev.sectionOrder];
      const temp = nextOrder[index + 1];
      nextOrder[index + 1] = nextOrder[index];
      nextOrder[index] = temp;
      const next = { ...prev, sectionOrder: nextOrder };
      pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
      return next;
    });
  }, [db]);

  const handleToggleVisibility = useCallback((sectionId: string) => {
    setCurrentPageConfig((prev) => {
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
      pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
      return next;
    });
  }, [db]);

  const handleAddSection = useCallback((type: SectionType, insertIndex?: number) => {
    const regDef = SECTION_REGISTRY[type];
    const newId = `${type}_${Date.now()}`;
    const defaultData = regDef?.defaultConfig
      ? { ...regDef.defaultConfig, id: newId }
      : { id: newId, type, visible: true, title: regDef?.name || type };

    setCurrentPageConfig((prev) => {
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
      pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
      return next;
    });
  }, [db]);

  // Subscribe to KOSAI AI action events (when user instructs AI editor)
  useEffect(() => {
    const unsub = eventBus.subscribe('kosai:action', (data: any) => {
      const { action, payload } = data;
      if (action === 'ADD_SECTION' && payload) {
        const newSectionId = `custom_${Date.now()}`;
        setCurrentPageConfig((prev) => {
          const next = {
            ...prev,
            sectionOrder: [...prev.sectionOrder, newSectionId],
            sections: {
              ...prev.sections,
              [newSectionId]: { ...payload, id: newSectionId },
            },
          };
          pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
          return next;
        });
      } else if (action === 'UPDATE_SECTION' && payload) {
        const targetId = payload.sectionId;
        if (targetId) {
          setCurrentPageConfig((prev) => {
            const current = prev.sections[targetId];
            if (!current) return prev;
            const next = {
              ...prev,
              sections: {
                ...prev.sections,
                [targetId]: { ...current, ...(payload.updates || payload) },
              },
            };
            pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
            return next;
          });
        }
      }
    });

    const handlePageSectionsUpdated = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;
      setCurrentPageConfig((prev) => ({
        ...prev,
        sections: detail.sections || prev.sections,
        ...(detail.globalSettings ? { globalSettings: detail.globalSettings } : {}),
      }));
    };
    window.addEventListener('kos_page_sections_updated', handlePageSectionsUpdated);

    return () => {
      unsub();
      window.removeEventListener('kos_page_sections_updated', handlePageSectionsUpdated);
    };
  }, [db]);

  const effectivePageConfig = React.useMemo(() => {
    return ensureHeaderSection(currentPageConfig);
  }, [currentPageConfig]);

  // ADMIN LOGIN GUARD: Check platform master admin authentication when admin mode is requested
  if (mode === 'admin' && !isAuthorized) {
    const rootTenantRecord: TenantRecord = {
      subdomain: ROOT_TENANT_ID,
      fullDomain: typeof window !== 'undefined' ? window.location.host : 'kosun.pro',
      clientName: 'מערכת ראשית (קושאן)',
      ownerEmail: 'admin@kosun.pro',
      ownerPhone: '',
      activeModules: [],
      collectionPrefix: '',
      billingPlan: 'annual',
      monthlyTotal: 0,
      paymentTransactionId: '',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    };

    return (
      <TenantAdminLoginView
        tenantRecord={rootTenantRecord}
        onLoginSuccess={() => {
          setIsAuthorized(true);
          setMode('public');
          setIsEditing(true);
        }}
        onBackToPublic={() => {
          setMode('public');
          if (typeof window !== 'undefined') {
            const p = new URLSearchParams(window.location.search);
            p.delete('admin');
            p.delete('edit');
            p.delete('mode');
            const clean = p.toString() ? `?${p.toString()}` : window.location.pathname;
            window.history.replaceState(null, '', clean);
          }
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white transition-colors duration-300 pb-20 ${
      theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#0a0a0c] text-white'
    }`} dir="rtl">
      {/* Render the Custom Page Builder Homepage (Includes editable Header section at top) */}
      <main className="flex-1">
        <PageBuilderRenderer
          config={effectivePageConfig}
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
            console.log('[RootHomePage] Selected tier:', tierId, mode);
          }}
          onLeadSubmit={(formData) => {
            console.log('[RootHomePage] Lead submitted:', formData);
          }}
        />
      </main>

      {/* KosWebAi Official Frontend Dock (Full Front Monopoly, zero control center interference) */}
      <KosWebAiFrontDock
        pageId={effectivePageConfig.pageId}
        pageConfig={effectivePageConfig}
        globalSettings={effectivePageConfig.globalSettings}
        seoSettings={effectivePageConfig.seoSettings}
        sections={effectivePageConfig.sections}
        designSnapshots={effectivePageConfig.designSnapshots}
        pageTitle={effectivePageConfig.pageTitle}
        onUpdateGlobalSettings={handleUpdateGlobalSettings}
        onUpdateSections={(updatedSections) => {
          setCurrentPageConfig((prev) => {
            const next = { ...prev, sections: updatedSections };
            pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
            return next;
          });
        }}
        onUpdateDesignSnapshots={(updatedSnapshots) => {
          setCurrentPageConfig((prev) => {
            const next = { ...prev, designSnapshots: updatedSnapshots };
            pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
            return next;
          });
        }}
        onApplyGlobalOverride={(result) => {
          setCurrentPageConfig((prev) => {
            const next = {
              ...prev,
              globalSettings: result.globalSettings,
              sections: result.sections,
              designSnapshots: result.designSnapshots,
            };
            pageBuilderFirestore.savePage(next, db, ROOT_TENANT_ID).catch(console.warn);
            return next;
          });
        }}
        isEditing={isEditing}
        onToggleEditMode={toggleEditMode}
        isSaving={isSaving}
        isAuthorized={isAuthorized}
      />

      {/* Discrete admin portal entry button if not authorized */}
      {!isAuthorized && (
        <button
          type="button"
          onClick={() => setMode('admin')}
          className="fixed bottom-4 left-4 z-40 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-slate-400 hover:text-white backdrop-blur-md border border-slate-700/60 shadow-lg transition opacity-50 hover:opacity-100 cursor-pointer"
          title="כניסת מנהל ועריכת עמוד"
          aria-label="כניסת מנהל"
        >
          <Lock className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default RootPublicHomePageView;

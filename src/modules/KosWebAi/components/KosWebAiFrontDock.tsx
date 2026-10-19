import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { KosunUniversalDock } from '../../../components/Navigation/KosunUniversalDock';
import { PageSettingsDrawer } from './PageSettingsDrawer';
import { GlobalPageSettings, SeoSettings, PageBuilderConfig } from '../types/pageBuilder.types';
import { pageBuilderFirestore } from '../services/pageBuilderFirestore';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { ROOT_TENANT_ID } from '../../../core/tenant/tenantResolver';

export interface KosWebAiFrontDockProps {
  pageId?: string;
  isEditing?: boolean;
  onToggleEditMode?: () => void;
  isSaving?: boolean;
  onOpenSettings?: () => void;
  onOpenSeoSettings?: () => void;
  onOpenAddSection?: () => void;
  className?: string;
  tenantId?: string;
  isAuthorized?: boolean;

  // Rich Page & SEO Drawer integration
  pageConfig?: PageBuilderConfig | null;
  globalSettings?: GlobalPageSettings;
  seoSettings?: SeoSettings;
  onUpdateGlobalSettings?: (updated: GlobalPageSettings) => void;
  onUpdateSeoSettings?: (updated: SeoSettings) => void;
  pageTitle?: string;
  pageSections?: any[];
}

/**
 * KosWebAiFrontDock - Frontend Page Builder Dock
 * Wraps canonical KosunUniversalDock in mode="front" with pencil edit and fully working SEO drawer.
 */
export const KosWebAiFrontDock: React.FC<KosWebAiFrontDockProps> = ({
  pageId,
  isEditing,
  onToggleEditMode,
  isSaving,
  onOpenSettings,
  onOpenSeoSettings,
  onOpenAddSection,
  className = '',
  tenantId = ROOT_TENANT_ID,
  isAuthorized,
  pageConfig,
  globalSettings: propGlobalSettings,
  seoSettings: propSeoSettings,
  onUpdateGlobalSettings,
  onUpdateSeoSettings,
  pageTitle,
  pageSections,
}) => {
  const { db } = useSystemConnection();
  const [isSeoDrawerOpen, setIsSeoDrawerOpen] = useState(false);

  // Fallback state if parent does not control state directly
  const [localGlobalSettings, setLocalGlobalSettings] = useState<GlobalPageSettings | null>(null);
  const [localSeoSettings, setLocalSeoSettings] = useState<SeoSettings | null>(null);

  // Sync / resolve active settings
  const resolvedPage = useMemo(() => {
    if (pageConfig) return pageConfig;
    if (pageId) return pageBuilderFirestore.getPageSync(pageId);
    return pageBuilderFirestore.getHomePageSync(tenantId);
  }, [pageConfig, pageId, tenantId]);

  const effectiveGlobalSettings: GlobalPageSettings = useMemo(() => {
    return (
      propGlobalSettings ||
      localGlobalSettings ||
      resolvedPage?.globalSettings || {
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
      }
    );
  }, [propGlobalSettings, localGlobalSettings, resolvedPage]);

  const effectiveSeoSettings: SeoSettings = useMemo(() => {
    return (
      propSeoSettings ||
      localSeoSettings ||
      resolvedPage?.seoSettings || {
        title: resolvedPage?.pageTitle || 'קושאן | אתר ועמוד רשמי',
        description: resolvedPage?.globalSettings?.slogan || 'עמוד מעוצב ואיכותי שנבנה במערכת קושאן',
      }
    );
  }, [propSeoSettings, localSeoSettings, resolvedPage]);

  // Listen to global events dispatched by universal dock or shortcuts
  useEffect(() => {
    const handleOpen = () => {
      setIsSeoDrawerOpen(true);
    };

    window.addEventListener('pb_open_seo', handleOpen);
    window.addEventListener('kosun_open_page_settings', handleOpen);

    return () => {
      window.removeEventListener('pb_open_seo', handleOpen);
      window.removeEventListener('kosun_open_page_settings', handleOpen);
    };
  }, []);

  const handleOpenSeo = useCallback(() => {
    if (onOpenSeoSettings) {
      onOpenSeoSettings();
    }
    setIsSeoDrawerOpen(true);
  }, [onOpenSeoSettings]);

  const handleUpdateGlobal = useCallback(
    (updated: GlobalPageSettings) => {
      setLocalGlobalSettings(updated);
      if (onUpdateGlobalSettings) {
        onUpdateGlobalSettings(updated);
      }
      if (resolvedPage) {
        const next = { ...resolvedPage, globalSettings: updated };
        pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      }
    },
    [onUpdateGlobalSettings, resolvedPage, db, tenantId]
  );

  const handleUpdateSeo = useCallback(
    (updated: SeoSettings) => {
      setLocalSeoSettings(updated);
      if (onUpdateSeoSettings) {
        onUpdateSeoSettings(updated);
      }
      if (resolvedPage) {
        const next = { ...resolvedPage, seoSettings: updated };
        pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
      }
    },
    [onUpdateSeoSettings, resolvedPage, db, tenantId]
  );

  return (
    <>
      <KosunUniversalDock
        mode="front"
        isEditing={isEditing}
        onToggleEditMode={onToggleEditMode}
        isSaving={isSaving}
        onOpenSettings={onOpenSettings}
        onOpenSeoSettings={handleOpenSeo}
        tenantId={tenantId}
        className={className}
        isAuthorized={isAuthorized}
      />

      <PageSettingsDrawer
        isOpen={isSeoDrawerOpen}
        onClose={() => setIsSeoDrawerOpen(false)}
        globalSettings={effectiveGlobalSettings}
        onUpdateGlobalSettings={handleUpdateGlobal}
        seoSettings={effectiveSeoSettings}
        onUpdateSeoSettings={handleUpdateSeo}
        pageTitle={pageTitle || resolvedPage?.pageTitle || 'עמוד'}
        pageSections={pageSections || (resolvedPage?.sections ? Object.values(resolvedPage.sections) : [])}
        sections={resolvedPage?.sections}
        onUpdateSections={(updatedSections) => {
          if (resolvedPage) {
            const next = { ...resolvedPage, sections: updatedSections };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
          }
        }}
        designSnapshots={resolvedPage?.designSnapshots}
        onUpdateDesignSnapshots={(updatedSnapshots) => {
          if (resolvedPage) {
            const next = { ...resolvedPage, designSnapshots: updatedSnapshots };
            pageBuilderFirestore.savePage(next, db, tenantId).catch(console.warn);
          }
        }}
      />
    </>
  );
};

export default KosWebAiFrontDock;

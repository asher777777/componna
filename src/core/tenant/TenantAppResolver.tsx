import React, { useState, useEffect, useCallback } from 'react';
import { WorkbenchApp } from '../../workbench/WorkbenchApp';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { TenantRecord } from '../contracts';
import { TenantCoreService } from './tenantService';
import { PageBuilderConfig } from '../../modules/KosWebAi/types/pageBuilder.types';
import { pageBuilderFirestore } from '../../modules/KosWebAi/services/pageBuilderFirestore';
import { useSystemConnection } from '../connection/SystemConnectionContext';
import { ROOT_TENANT_ID, RESERVED_TENANT_SUBDOMAINS, extractSubdomainFromHost } from './tenantResolver';
import { TenantScopeProvider, useTenantScope } from './TenantScopeContext';
import { TenantSubdomainView } from './TenantSubdomainView';
import { RootPublicHomePageView } from '../../pages/RootPublicHomePageView';
import { useLocation } from 'react-router-dom';
import { Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const TenantAppResolver: React.FC = () => {
  const location = useLocation();
  const { db } = useSystemConnection();
  const { setTenantId } = useTenantScope();
  const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(null);
  const [tenantRecord, setTenantRecord] = useState<TenantRecord | null>(null);
  const [rootHomePage, setRootHomePage] = useState<PageBuilderConfig | null>(() => {
    return pageBuilderFirestore.getHomePageSync(ROOT_TENANT_ID);
  });

  const [isDevWorkbench, setIsDevWorkbench] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === 'true' || params.get('mode') === 'dev' || params.get('workbench') === 'true') {
      return true;
    }
    if (params.get('public') === 'true' || params.get('mode') === 'public') {
      return false;
    }
    // Also consider it "Workbench" mode if they are directly visiting a public page URL on root domain,
    // because WorkbenchApp has the public viewer routing inside it!
    const pathname = window.location.pathname;
    const isPublicPage = pathname.startsWith('/p/') || pathname.startsWith('/page/') || pathname.startsWith('/preview/');
    if (isPublicPage) {
      return true;
    }
    // Any module route belongs in Workbench mode
    if (pathname !== '/' && pathname !== '') {
      return true;
    }
    // For root path '/', NEVER default to Workbench mode based on stale sessionStorage!
    if (pathname === '/' || pathname === '') {
      try {
        sessionStorage.removeItem('kosun_is_dev_workbench');
      } catch {}
      return false;
    }
    return sessionStorage.getItem('kosun_is_dev_workbench') === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('kosun_is_dev_workbench', String(isDevWorkbench));
  }, [isDevWorkbench]);

  useEffect(() => {
    const cleanPath = location.pathname;
    if (cleanPath !== '/' && cleanPath !== '') {
      setIsDevWorkbench(true);
    }
  }, [location.pathname]);

  // Load designated homepage for main domain root
  const loadRootHomePage = useCallback(async () => {
    try {
      const page = await pageBuilderFirestore.getHomePage(db, ROOT_TENANT_ID);
      setRootHomePage(page);
    } catch (err) {
      console.warn('[TenantAppResolver] Error fetching root homepage:', err);
      setRootHomePage(null);
    }
  }, [db]);

  useEffect(() => {
    loadRootHomePage();

    const handleHomeChange = (e: any) => {
      const changed = e?.detail?.tenantId;
      if (!changed || changed === ROOT_TENANT_ID) {
        loadRootHomePage();
      }
    };

    window.addEventListener('kosun_homepage_changed', handleHomeChange);
    return () => {
      window.removeEventListener('kosun_homepage_changed', handleHomeChange);
    };
  }, [loadRootHomePage]);

  // One-time cleanup for legacy leftover caches of the old storefront
  useEffect(() => {
    try {
      const pathname = window.location.pathname;
      if (pathname === '/' || pathname === '') {
        sessionStorage.removeItem('kosun_is_dev_workbench');
      }
      localStorage.removeItem('kosun_saas_storefront_as_home');
      localStorage.removeItem('kosun_store_default_home');
    } catch {}
  }, []);

  useEffect(() => {
    // 1. Detect from URL query param (e.g. ?tenant=landing) or hostname (e.g. landing.kosun.pro)
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');
    const hostname = window.location.hostname;
    
    // Check if subdomain exists in hostname (using accurate production resolver)
    let sub: string | null = null;
    if (tenantParam) {
      const cleanParam = tenantParam.trim().toLowerCase();
      if (!RESERVED_TENANT_SUBDOMAINS.includes(cleanParam)) {
        sub = cleanParam;
      }
    } else {
      sub = extractSubdomainFromHost(hostname);
    }

    if (sub) {
      setTenantSubdomain(sub);
      setTenantId(sub);
      TenantCoreService.getAllTenants(db).then((all) => {
        const found = all.find(t => t.subdomain.toLowerCase() === sub?.toLowerCase());
        if (found) {
          setTenantRecord(found);
        } else {
          // Fallback demo tenant for the requested subdomain
          const demoTenant: TenantRecord = {
            subdomain: sub,
            fullDomain: `${sub}.kosun.pro`,
            clientName: `מערכת לקוח (${sub})`,
            ownerEmail: `${sub}@kosun.pro`,
            ownerPhone: '050-1234567',
            activeModules: ['KosWebAi'],
            collectionPrefix: `tenant_${sub}_mod_`,
            billingPlan: 'annual',
            monthlyTotal: 129,
            paymentTransactionId: 'TXN-INIT-001',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setTenantRecord(demoTenant);
        }
      });
    } else {
      setTenantSubdomain(null);
      setTenantRecord(null);
      setTenantId(ROOT_TENANT_ID);
    }
  }, [db, setTenantId]);

  // 1. Subdomain View (Public Landing Page by default + Owner Admin Control Panel)
  if (tenantSubdomain && tenantRecord) {
    return (
      <TenantScopeProvider initialTenantId={tenantRecord.subdomain}>
        <TenantSubdomainView tenantRecord={tenantRecord} />
      </TenantScopeProvider>
    );
  }

  // 2. Developer / Super-Admin Workbench Mode (If explicitly requested or navigating modules)
  if (isDevWorkbench) {
    return <WorkbenchApp />;
  }

  // 4. Root Domain Homepage View (/):
  // ALWAYS render the designated PageBuilder homepage on root domain!
  // Uses synchronous cached homepage immediately or built-in default root template.
  // NEVER falls back to PublicStorefrontApp on root!
  const effectiveHomePage =
    rootHomePage ||
    pageBuilderFirestore.getHomePageSync(ROOT_TENANT_ID) ||
    pageBuilderFirestore.createDefaultRootHomePage();

  return (
    <RootPublicHomePageView
      pageConfig={effectiveHomePage}
      onEnterDevWorkbench={() => setIsDevWorkbench(true)}
    />
  );
};

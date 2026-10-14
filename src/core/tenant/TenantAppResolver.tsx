import React, { useState, useEffect, useCallback } from 'react';
import { WorkbenchApp } from '../../workbench/WorkbenchApp';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { TenantRecord } from '../contracts';
import { TenantCoreService } from './tenantService';
import { PageBuilderConfig } from '../../modules/KosWebAi/types/pageBuilder.types';
import { pageBuilderFirestore } from '../../modules/KosWebAi/services/pageBuilderFirestore';
import { useSystemConnection } from '../connection/SystemConnectionContext';
import { ROOT_TENANT_ID, RESERVED_TENANT_SUBDOMAINS, extractSubdomainFromHost, isRootPlatformHost, DEFAULT_SUBDOMAIN_MODULES } from './tenantResolver';
import { TenantScopeProvider, useTenantScope } from './TenantScopeContext';
import { TenantSubdomainView } from './TenantSubdomainView';
import { RootPublicHomePageView } from '../../pages/RootPublicHomePageView';
import { useLocation } from 'react-router-dom';
import { Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const TenantAppResolver: React.FC = () => {
  const location = useLocation();
  const { db } = useSystemConnection();
  const { setTenantId } = useTenantScope();

  // Determine hostname and local environment synchronously
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase().trim() : '';
  const isLocalEnv = currentHostname === 'localhost' || currentHostname === '127.0.0.1' || currentHostname.endsWith('.local');

  // Synchronous initial subdomain detection
  const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    if (isLocalEnv) {
      const p = new URLSearchParams(window.location.search);
      const q = p.get('tenant');
      if (q && !RESERVED_TENANT_SUBDOMAINS.includes(q.trim().toLowerCase())) {
        return q.trim().toLowerCase();
      }
    }
    return extractSubdomainFromHost(currentHostname);
  });

  const [tenantRecord, setTenantRecord] = useState<TenantRecord | null>(() => {
    if (!tenantSubdomain) return null;
    return {
      subdomain: tenantSubdomain,
      fullDomain: `${tenantSubdomain}.kosun.pro`,
      clientName: `מערכת לקוח (${tenantSubdomain})`,
      ownerEmail: `${tenantSubdomain}@kosun.pro`,
      ownerPhone: '050-1234567',
      activeModules: DEFAULT_SUBDOMAIN_MODULES,
      collectionPrefix: `tenant_${tenantSubdomain}_mod_`,
      billingPlan: 'annual',
      monthlyTotal: 129,
      paymentTransactionId: 'TXN-INIT-001',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

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
    const pathname = window.location.pathname;
    const isPublicPage = pathname.startsWith('/p/') || pathname.startsWith('/page/') || pathname.startsWith('/preview/') || pathname.startsWith('/tube/') || pathname.startsWith('/to/');
    if (isPublicPage) {
      return true;
    }
    if (pathname !== '/' && pathname !== '') {
      return true;
    }
    if (pathname === '/' || pathname === '') {
      try {
        sessionStorage.removeItem('kosun_is_dev_workbench');
      } catch {}
      return false;
    }
    return sessionStorage.getItem('kosun_is_dev_workbench') === 'true';
  });

  // Strict Domain Isolation: In production, any ?tenant= query on the root platform host MUST redirect to the subdomain
  // Strict Domain Isolation: In production, any ?tenant= query on the root platform host MUST redirect to the subdomain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname.toLowerCase().trim();
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
      const p = new URLSearchParams(window.location.search);
      const tenantParam = p.get('tenant');

      if (!isLocal && tenantParam && isRootPlatformHost(hostname)) {
        const cleanParam = tenantParam.trim().toLowerCase();
        if (!RESERVED_TENANT_SUBDOMAINS.includes(cleanParam) && cleanParam !== ROOT_TENANT_ID) {
          p.delete('tenant');
          p.delete('mode');
          const remainingQuery = p.toString() ? `?${p.toString()}` : '';
          const targetUrl = `https://${cleanParam}.kosun.pro${window.location.pathname}${remainingQuery}${window.location.hash}`;
          window.location.replace(targetUrl);
          return;
        }
      }

      // On subdomain in production or local session: hostname or session already defines tenant! Clean up ?tenant= and ?mode= noise
      const isSubdomainHost = Boolean(extractSubdomainFromHost(hostname));
      const hasLocalSessionTenant = isLocal && Boolean(sessionStorage.getItem('kosun_active_tenant_id') && sessionStorage.getItem('kosun_active_tenant_id') !== ROOT_TENANT_ID);
      if (isSubdomainHost || hasLocalSessionTenant) {
        if (p.has('tenant') || p.has('mode')) {
          p.delete('tenant');
          p.delete('mode');
          const remainingQuery = p.toString() ? `?${p.toString()}` : '';
          const cleanUrl = `${window.location.pathname}${remainingQuery}${window.location.hash}`;
          window.history.replaceState(null, '', cleanUrl);
        }
      }
    }
  }, [location.pathname, location.search]);

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

  // Sync tenant record from Firestore when in subdomain mode
  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase().trim();
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');

    let sub: string | null = null;
    if (isLocal && tenantParam) {
      const cleanParam = tenantParam.trim().toLowerCase();
      if (!RESERVED_TENANT_SUBDOMAINS.includes(cleanParam) && cleanParam !== ROOT_TENANT_ID) {
        sub = cleanParam;
        try {
          sessionStorage.setItem('kosun_active_tenant_id', cleanParam);
        } catch {}
      }
    } else if (isLocal) {
      const sessionTenant = sessionStorage.getItem('kosun_active_tenant_id');
      if (sessionTenant && sessionTenant !== ROOT_TENANT_ID && !RESERVED_TENANT_SUBDOMAINS.includes(sessionTenant.trim().toLowerCase())) {
        sub = sessionTenant.trim().toLowerCase();
      }
    } else {
      sub = extractSubdomainFromHost(hostname);
    }

    if (sub) {
      setTenantSubdomain(sub);
      setTenantId(sub);
      TenantCoreService.getAllTenants(db).then((all) => {
        const found = all.find((t) => t.subdomain.toLowerCase() === sub?.toLowerCase());
        if (found) {
          setTenantRecord(found);
        }
      });
    } else {
      setTenantSubdomain(null);
      setTenantRecord(null);
      setTenantId(ROOT_TENANT_ID);
    }
  }, [db, setTenantId]);

  // 1. Subdomain View (Public Landing Page by default + Owner Admin Control Panel)
  // Subdomains NEVER enter WorkbenchApp!
  if (tenantSubdomain) {
    const effectiveRecord: TenantRecord = tenantRecord || {
      subdomain: tenantSubdomain,
      fullDomain: `${tenantSubdomain}.kosun.pro`,
      clientName: `מערכת לקוח (${tenantSubdomain})`,
      ownerEmail: `${tenantSubdomain}@kosun.pro`,
      ownerPhone: '050-1234567',
      activeModules: DEFAULT_SUBDOMAIN_MODULES,
      collectionPrefix: `tenant_${tenantSubdomain}_mod_`,
      billingPlan: 'annual',
      monthlyTotal: 129,
      paymentTransactionId: 'TXN-INIT-001',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return (
      <TenantScopeProvider initialTenantId={tenantSubdomain}>
        <TenantSubdomainView tenantRecord={effectiveRecord} />
      </TenantScopeProvider>
    );
  }

  // 2. Developer / Master Workbench Mode (Backoffice on Root Domain - Protected by Master Guard)
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

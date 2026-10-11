import React, { useState, useEffect, useCallback } from 'react';
import { WorkbenchApp } from '../../workbench/WorkbenchApp';
import { ClientPlatformProvider } from '../../modules/client-receiver-platform/context/ClientPlatformContext';
import { DynamicClientShell } from '../../modules/client-receiver-platform/components/DynamicClientShell';
import { StorefrontService } from '../../modules/saas-storefront-composer/services/storefrontService';
import { PublicStorefrontApp } from '../../modules/saas-storefront-composer/components/PublicStorefrontApp';
import { TenantRecord } from '../../modules/saas-storefront-composer/types';
import { PageBuilderConfig } from '../../modules/page-builder/types/pageBuilder.types';
import { pageBuilderFirestore } from '../../modules/page-builder/services/pageBuilderFirestore';
import { useSystemConnection } from '../connection/SystemConnectionContext';
import { ROOT_TENANT_ID, RESERVED_TENANT_SUBDOMAINS } from './tenantResolver';
import { TenantScopeProvider } from './TenantScopeContext';
import { TenantSubdomainView } from './TenantSubdomainView';
import { RootPublicHomePageView } from '../../pages/RootPublicHomePageView';
import { Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const TenantAppResolver: React.FC = () => {
  const { db } = useSystemConnection();
  const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(null);
  const [tenantRecord, setTenantRecord] = useState<TenantRecord | null>(null);
  const [rootHomePage, setRootHomePage] = useState<PageBuilderConfig | null>(null);

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
    // Any module route (like /page-builder, /control-center, etc.) belongs in Workbench mode
    if (pathname !== '/' && pathname !== '/saas-storefront' && pathname !== '/store') {
      return true;
    }
    return sessionStorage.getItem('kosun_is_dev_workbench') === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('kosun_is_dev_workbench', String(isDevWorkbench));
  }, [isDevWorkbench]);

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

  useEffect(() => {
    // 1. Detect from URL query param (e.g. ?tenant=landing) or hostname (e.g. landing.kosun.pro)
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant');
    const hostname = window.location.hostname;
    
    // Check if subdomain exists in hostname (ignore localhost root / web.app standard root)
    let sub: string | null = null;
    if (tenantParam) {
      const cleanParam = tenantParam.trim().toLowerCase();
      if (!RESERVED_TENANT_SUBDOMAINS.includes(cleanParam)) {
        sub = cleanParam;
      }
    } else if (!hostname.startsWith('localhost') && !hostname.startsWith('127.0.0.1') && !hostname.startsWith('kosun') && !hostname.startsWith('glowmanage') && !hostname.startsWith('kosun.pro') && !hostname.startsWith('www.kosun.pro')) {
      const parts = hostname.split('.');
      if (parts.length > 2) {
        const potentialSub = parts[0].toLowerCase().trim();
        if (!RESERVED_TENANT_SUBDOMAINS.includes(potentialSub)) {
          sub = potentialSub;
        }
      }
    }

    if (sub) {
      setTenantSubdomain(sub);
      const all = StorefrontService.getAllTenants();
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
          activeModules: ['page-builder'],
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
    } else {
      setTenantSubdomain(null);
      setTenantRecord(null);
    }
  }, []);

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

  // 3. Root Domain Custom Homepage View:
  // If a page from Page Builder is designated as the active homepage, show it on the main domain root '/'!
  const pathname = window.location.pathname;
  if ((pathname === '/' || pathname === '') && rootHomePage) {
    return (
      <RootPublicHomePageView
        pageConfig={rootHomePage}
        onEnterDevWorkbench={() => setIsDevWorkbench(true)}
      />
    );
  }

  // 4. Default Public View for Kosun.pro (Clean Storefront + Customer Login Modal, No Dev Sidebar!)
  return (
    <PublicStorefrontApp
      onEnterDevWorkbench={() => setIsDevWorkbench(true)}
    />
  );
};
